import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import logo from '@/logos_sdmt/logotipo_horizontal_transparente.png'

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  creator: 'Criador',
  approver: 'Aprovador',
}

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  creator: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  approver: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-8 space-y-4">
          <h1 className="text-lg font-semibold text-stone-900">Configuração pendente</h1>
          <p className="text-sm text-stone-600">
            Sua conta foi autenticada, mas o perfil não foi encontrado na tabela{' '}
            <code className="bg-stone-100 px-1 rounded text-xs font-mono">profiles</code>.
          </p>
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2 text-sm text-amber-800">
            <p className="font-medium">Prováveis causas:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>O arquivo <code className="text-xs bg-amber-100 px-1 rounded">supabase/schema.sql</code> ainda não foi executado no Supabase SQL Editor.</li>
              <li>O trigger <code className="text-xs bg-amber-100 px-1 rounded">on_auth_user_created</code> não existia quando o usuário foi criado.</li>
            </ol>
          </div>
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-3 text-xs text-stone-500 font-mono break-all">
            {profileError?.message ?? 'Perfil não encontrado'}
          </div>
          <p className="text-sm text-stone-600">
            Após executar o schema, insira o perfil manualmente via SQL Editor:
          </p>
          <pre className="bg-stone-900 text-emerald-400 text-xs rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">{`INSERT INTO public.profiles (id, email, name, role)
VALUES (
  '${user.id}',
  '${user.email}',
  'Admin',
  'admin'
);`}</pre>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Sair e tentar novamente
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col">
      <header className="bg-white sticky top-0 z-10" style={{ boxShadow: '0 1px 0 #e8e5e0, 0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="flex items-center opacity-90 hover:opacity-100 transition-opacity">
              <Image
                src={logo}
                alt="Saúde Digital Mato Grosso"
                style={{ height: '30px', width: 'auto' }}
                priority
              />
            </a>
            <nav className="hidden md:flex items-center gap-0.5">
              <a
                href="/dashboard"
                className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-50"
              >
                Dashboard
              </a>
              {profile.role === 'admin' && (
                <a
                  href="/admin/invites"
                  className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-50"
                >
                  Convites
                </a>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600 hidden sm:block font-medium">{profile.name}</span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                roleBadgeColors[profile.role] ?? 'bg-stone-100 text-stone-600'
              }`}
            >
              {roleLabels[profile.role] ?? profile.role}
            </span>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
