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
    <main className="min-h-screen flex items-center justify-center bg-[#f7f6f3] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-4xl text-stone-900 italic tracking-tight"
            style={{ fontFamily: 'var(--font-instrument-serif)' }}
          >
            Criar conta
          </h1>
          <p className="text-[11px] text-stone-400 mt-2 tracking-[0.2em] uppercase">
            Portal de Aprovação de Mídias
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card-elevated p-8">
          <AcceptInviteForm token={token} email={invite.email} role={invite.role} />
        </div>
      </div>
    </main>
  )
}

function InviteError({ message }: { message: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f6f3] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="bg-white rounded-2xl shadow-card-elevated p-8 space-y-3">
          <p className="text-3xl">⚠️</p>
          <h1 className="text-lg font-semibold text-stone-900">Link inválido</h1>
          <p className="text-sm text-stone-500">{message}</p>
          <a
            href="/login"
            className="inline-block text-sm text-stone-900 underline underline-offset-2 hover:text-stone-600 transition-colors mt-2"
          >
            Ir para o login
          </a>
        </div>
      </div>
    </main>
  )
}
