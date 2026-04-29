'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createInviteAction, type InviteState } from '@/actions/invites'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: InviteState = { error: null, token: null }

export function CreateInviteForm() {
  const [state, action, pending] = useActionState(createInviteAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.token) formRef.current?.reset()
  }, [state.token])

  const inviteLink = state.token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${state.token}`
    : null

  return (
    <div className="space-y-4">
      <form ref={formRef} action={action} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">E-mail do convidado</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              required
              placeholder="colaborador@empresa.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Perfil</Label>
            <select
              id="invite-role"
              name="role"
              required
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent"
            >
              <option value="">Selecione…</option>
              <option value="creator">Criador</option>
              <option value="approver">Aprovador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        {state.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? 'Gerando…' : 'Gerar link de convite'}
        </Button>
      </form>

      {inviteLink && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-2">
          <p className="text-sm font-medium text-emerald-800">Convite gerado! Expira em 48 horas.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white border border-emerald-200 rounded px-2 py-1.5 text-gray-700 truncate">
              {inviteLink}
            </code>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => navigator.clipboard.writeText(inviteLink)}
            >
              Copiar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
