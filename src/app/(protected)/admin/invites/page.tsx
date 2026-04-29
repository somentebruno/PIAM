import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateInviteForm } from '@/components/admin/create-invite-form'
import { CopyInviteButton } from '@/components/admin/copy-invite-button'
import { DeleteInviteButton } from '@/components/admin/delete-invite-button'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  creator: 'Criador',
  approver: 'Aprovador',
}

export default async function AdminInvitesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: invites } = await supabase
    .from('invites')
    .select('id, email, role, expires_at, used_at, created_at, token')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Administração</p>
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Convites</h1>
        <p className="text-sm text-stone-500 mt-1">
          Gere links para convidar novos usuários ao portal.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">Novo convite</p>
        <CreateInviteForm />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Histórico</p>
        </div>

        {!invites || invites.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-12">Nenhum convite gerado ainda.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {invites.map((invite) => {
              const expired = new Date(invite.expires_at) < new Date()
              const isPending = !invite.used_at && !expired

              const status = invite.used_at
                ? { label: 'Utilizado', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' }
                : expired
                ? { label: 'Expirado', className: 'bg-stone-100 text-stone-400 ring-1 ring-stone-200' }
                : { label: 'Pendente', className: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' }

              return (
                <li key={invite.id} className="flex items-center justify-between px-6 py-4 gap-4 hover:bg-stone-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-900 truncate">{invite.email}</p>
                    <p className="text-xs text-stone-400 mt-0.5 font-medium">
                      {roleLabels[invite.role]} ·{' '}
                      {formatDistanceToNow(new Date(invite.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {isPending && <CopyInviteButton token={invite.token} />}
                    <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                    <DeleteInviteButton id={invite.id} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
