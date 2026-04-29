import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateInviteForm } from '@/components/admin/create-invite-form'
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
    .select('id, email, role, expires_at, used_at, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Convites</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gere links para convidar novos usuários ao portal.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Novo convite</h2>
        <CreateInviteForm />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Histórico</h2>
        </div>

        {!invites || invites.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Nenhum convite gerado ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {invites.map((invite) => {
              const expired = new Date(invite.expires_at) < new Date()
              const status = invite.used_at
                ? { label: 'Utilizado', className: 'bg-gray-100 text-gray-500' }
                : expired
                ? { label: 'Expirado', className: 'bg-red-50 text-red-500' }
                : { label: 'Pendente', className: 'bg-emerald-50 text-emerald-600' }

              return (
                <li key={invite.id} className="flex items-center justify-between px-6 py-3.5 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{invite.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {roleLabels[invite.role]} ·{' '}
                      {formatDistanceToNow(new Date(invite.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}
                  >
                    {status.label}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
