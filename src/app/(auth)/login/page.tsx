import { LoginForm } from '@/components/auth/login-form'
import Image from 'next/image'
import logo from '@/logos_sdmt/logotipo_horizontal_transparente.png'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f6f3] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-4">
          <Image
            src={logo}
            alt="Saúde Digital Mato Grosso"
            style={{ height: '44px', width: 'auto' }}
            priority
          />
          <p className="text-[11px] text-stone-400 tracking-[0.2em] uppercase">
            Portal de Aprovação de Mídias
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card-elevated p-8">
          <LoginForm />
        </div>

        <p className="text-center text-[11px] text-stone-400 mt-6 tracking-wider uppercase">
          Acesso restrito · Somente usuários convidados
        </p>
      </div>
    </main>
  )
}
