'use client'

import { useActionState } from 'react'
import { acceptInviteAction, type AcceptState } from '@/actions/invites'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: AcceptState = { error: null }

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  creator: 'Criador',
  approver: 'Aprovador',
}

type Props = {
  token: string
  email: string
  role: string
}

export function AcceptInviteForm({ token, email, role }: Props) {
  const [state, action, pending] = useActionState(acceptInviteAction, initialState)

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-1.5">
        <Label>E-mail</Label>
        <Input value={email} disabled className="bg-gray-50 text-gray-500" readOnly />
      </div>

      <div className="space-y-1.5">
        <Label>Perfil</Label>
        <Input value={roleLabels[role] ?? role} disabled className="bg-gray-50 text-gray-500" readOnly />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Seu nome</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Nome completo"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Criar senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Criando conta…' : 'Criar minha conta'}
      </Button>
    </form>
  )
}
