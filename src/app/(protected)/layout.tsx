import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  creator: 'Criador',
  approver: 'Aprovador',
}

const roleBadgeColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  creator: 'bg-blue-100 text-blue-700',
  approver: 'bg-amber-100 text-amber-700',
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

  // Sem profile: schema não aplicado ou trigger não rodou.
  // NÃO redireciona para /login (causaria loop), exibe tela de diagnóstico.
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-4">
          <h1 className="text-lg font-semibold text-gray-900">Configuração pendente</h1>
          <p className="text-sm text-gray-600">
            Sua conta foi autenticada, mas o perfil não foi encontrado na tabela{' '}
            <code className="bg-gray-100 px-1 rounded text-xs">profiles</code>.
          </p>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-2 text-sm text-amber-800">
            <p className="font-medium">Prováveis causas:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>O arquivo <code className="text-xs bg-amber-100 px-1 rounded">supabase/schema.sql</code> ainda não foi executado no Supabase SQL Editor.</li>
              <li>O trigger <code className="text-xs bg-amber-100 px-1 rounded">on_auth_user_created</code> não existia quando o usuário foi criado.</li>
            </ol>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-500 font-mono break-all">
            {profileError?.message ?? 'Perfil não encontrado'}
          </div>
          <p className="text-sm text-gray-600">
            Após executar o schema, insira o perfil manualmente via SQL Editor:
          </p>
          <pre className="bg-gray-900 text-green-400 text-xs rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{`INSERT INTO public.profiles (id, email, name, role)
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-sm font-semibold text-gray-900 tracking-tight">
              Portal de Mídias
            </a>
            <nav className="hidden md:flex items-center gap-4">
              <a href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Dashboard</a>
              {profile.role === 'admin' && (
                <a href="/admin/invites" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Gestão de Convites</a>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 hidden sm:block">{profile.name}</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                roleBadgeColors[profile.role] ?? 'bg-gray-100 text-gray-600'
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
