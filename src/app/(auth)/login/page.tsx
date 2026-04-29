import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Portal de Aprovação
          </h1>
          <p className="text-sm text-gray-500 mt-1">de Mídias</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Acesso restrito. Somente usuários convidados.
        </p>
      </div>
    </main>
  )
}
