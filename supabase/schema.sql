-- ============================================================
-- Portal de Aprovação de Mídias — Schema Supabase
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('admin', 'creator', 'approver');

create type card_status as enum (
  'draft',
  'awaiting_approval',
  'approved_with_reservations',
  'rejected',
  'approved',
  'published'
);

create type media_type as enum ('image', 'video');

create type reservation_type as enum ('caption', 'media', 'both');

-- ============================================================
-- TABELA: profiles
-- ============================================================

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text not null,
  role        user_role not null default 'creator',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Usuário vê e edita apenas o próprio perfil; admin vê todos
create policy "profiles: self read" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: admin read all" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "profiles: self update" on public.profiles
  for update using (auth.uid() = id);

-- Trigger: cria profile automaticamente ao criar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'creator')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABELA: media_cards
-- ============================================================

create table public.media_cards (
  id                   uuid primary key default uuid_generate_v4(),
  creator_id           uuid not null references public.profiles(id) on delete cascade,
  title                text not null,
  caption              text not null default '',
  tags                 text[] not null default '{}',
  tagged_accounts      text[] not null default '{}',
  suggested_at         timestamptz,
  status               card_status not null default 'draft',
  reservation_type     reservation_type,
  reservation_comment  text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.media_cards enable row level security;

-- Criador vê e gerencia os próprios cards
create policy "cards: creator owns" on public.media_cards
  for all using (auth.uid() = creator_id);

-- Aprovador lê cards em aguardando_aprovação e reprovados
create policy "cards: approver read queue" on public.media_cards
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('approver', 'admin')
    )
  );

-- Aprovador pode atualizar status dos cards
create policy "cards: approver update status" on public.media_cards
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('approver', 'admin')
    )
  );

-- Trigger: atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cards_updated_at
  before update on public.media_cards
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- TABELA: media_versions
-- ============================================================

create table public.media_versions (
  id             uuid primary key default uuid_generate_v4(),
  card_id        uuid not null references public.media_cards(id) on delete cascade,
  storage_path   text not null,
  media_type     media_type not null,
  version_number int not null default 1,
  created_at     timestamptz not null default now(),

  unique(card_id, version_number)
);

alter table public.media_versions enable row level security;

create policy "versions: read if can read card" on public.media_versions
  for select using (
    exists (
      select 1 from public.media_cards c
      where c.id = card_id
        and (
          c.creator_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('approver', 'admin')
          )
        )
    )
  );

create policy "versions: creator insert" on public.media_versions
  for insert with check (
    exists (
      select 1 from public.media_cards c
      where c.id = card_id and c.creator_id = auth.uid()
    )
  );

-- ============================================================
-- TABELA: audit_logs
-- ============================================================

create table public.audit_logs (
  id         uuid primary key default uuid_generate_v4(),
  card_id    uuid not null references public.media_cards(id) on delete cascade,
  user_id    uuid not null references public.profiles(id),
  action     text not null,
  details    jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- Imutável: sem update nem delete via RLS
create policy "audit: read if can read card" on public.audit_logs
  for select using (
    exists (
      select 1 from public.media_cards c
      where c.id = card_id
        and (
          c.creator_id = auth.uid()
          or exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role in ('approver', 'admin')
          )
        )
    )
  );

create policy "audit: authenticated insert" on public.audit_logs
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- TABELA: invites
-- ============================================================

create table public.invites (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null,
  role        user_role not null default 'creator',
  token       text not null unique default encode(gen_random_bytes(32), 'hex'),
  invited_by  uuid not null references public.profiles(id),
  expires_at  timestamptz not null default (now() + interval '48 hours'),
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

alter table public.invites enable row level security;

-- Apenas admin gerencia convites
create policy "invites: admin full access" on public.invites
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Leitura pública pelo token (para página de aceite)
create policy "invites: public read by token" on public.invites
  for select using (true);

-- ============================================================
-- STORAGE BUCKET: media-uploads
-- ============================================================
-- Execute via Dashboard ou Supabase CLI:
--
-- insert into storage.buckets (id, name, public)
-- values ('media-uploads', 'media-uploads', true);
--
-- create policy "storage: auth upload" on storage.objects
--   for insert with check (bucket_id = 'media-uploads' and auth.role() = 'authenticated');
--
-- create policy "storage: public read" on storage.objects
--   for select using (bucket_id = 'media-uploads');
--
-- create policy "storage: owner delete" on storage.objects
--   for delete using (bucket_id = 'media-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- ÍNDICES
-- ============================================================

create index idx_media_cards_creator on public.media_cards(creator_id);
create index idx_media_cards_status on public.media_cards(status);
create index idx_media_versions_card on public.media_versions(card_id);
create index idx_audit_logs_card on public.audit_logs(card_id);
create index idx_invites_token on public.invites(token);
create index idx_invites_email on public.invites(email);
