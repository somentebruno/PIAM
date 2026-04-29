'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types/database'

export type InviteState = { error: string | null; token: string | null }
export type AcceptState = { error: string | null }

export async function createInviteAction(
  _prev: InviteState,
  formData: FormData
): Promise<InviteState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado.', token: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin')
    return { error: 'Apenas administradores podem convidar usuários.', token: null }

  const email = (formData.get('email') as string).trim().toLowerCase()
  const role = formData.get('role') as UserRole

  if (!email || !role) return { error: 'Preencha todos os campos.', token: null }

  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('invites')
    .insert({ email, role, invited_by: user.id, expires_at: expiresAt })
    .select('token')
    .single()

  if (error) return { error: 'Erro ao gerar convite. Tente novamente.', token: null }

  revalidatePath('/admin/invites')
  return { error: null, token: data.token }
}

export async function acceptInviteAction(
  _prev: AcceptState,
  formData: FormData
): Promise<AcceptState> {
  const token = formData.get('token') as string
  const name = (formData.get('name') as string).trim()
  const password = formData.get('password') as string

  if (!name || !password) return { error: 'Preencha todos os campos.' }
  if (password.length < 8) return { error: 'A senha deve ter pelo menos 8 caracteres.' }

  const supabase = await createClient()

  const { data: invite, error: fetchError } = await supabase
    .from('invites')
    .select('*')
    .eq('token', token)
    .single()

  if (fetchError || !invite) return { error: 'Convite inválido ou não encontrado.' }
  if (invite.used_at) return { error: 'Este convite já foi utilizado.' }
  if (new Date(invite.expires_at) < new Date()) return { error: 'Este convite expirou.' }

  const adminClient = createAdminClient()

  const { error: createError } = await adminClient.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
    user_metadata: { name, role: invite.role },
  })

  if (createError) {
    if (createError.message.includes('already registered'))
      return { error: 'Este e-mail já possui uma conta.' }
    return { error: createError.message }
  }

  await supabase
    .from('invites')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: invite.email,
    password,
  })

  if (signInError) return { error: 'Conta criada. Faça login para continuar.' }

  redirect('/dashboard')
}
