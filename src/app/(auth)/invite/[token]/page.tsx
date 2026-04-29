import { createClient } from '@/lib/supabase/server'
import { AcceptInviteForm } from '@/components/auth/accept-invite-form'

type Props = {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  const { data: invite } = await supabase
    .from('invites')
    .select('email, role, expires_at, used_at')
    .eq('token', token)
    .single()

  if (!invite) {
    return <InviteError message="Convite inválido ou não encontrado." />
  }

  if (invite.used_at) {
    return <InviteError message="Este convite já foi utilizado." />
  }

  if (new Date(invite.expires_at) < new Date()) {
    return <InviteError message="Este convite expirou. Solicite um novo ao administrador." />
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Criar sua conta
          </h1>
          <p className="text-sm text-gray-500 mt-1">Portal de Aprovação de Mídias</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <AcceptInviteForm token={token} email={invite.email} role={invite.role} />
        </div>
      </div>
    </main>
  )
}

function InviteError({ message }: { message: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-3">
          <p className="text-4xl">⚠️</p>
          <h1 className="text-lg font-semibold text-gray-900">Link inválido</h1>
          <p className="text-sm text-gray-500">{message}</p>
          <a
            href="/login"
            className="inline-block text-sm text-gray-900 underline underline-offset-2 mt-2"
          >
            Ir para o login
          </a>
        </div>
      </div>
    </main>
  )
}
