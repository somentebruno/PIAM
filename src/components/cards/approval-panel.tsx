'use client'

import { useActionState, useState } from 'react'
import { approvalAction, type ApprovalState } from '@/actions/approval'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ActionType = 'approve' | 'reject' | 'reservations'

const initial: ApprovalState = { error: null }

export function ApprovalPanel({ cardId }: { cardId: string }) {
  const [active, setActive] = useState<ActionType | null>(null)
  const [state, formAction, pending] = useActionState(approvalAction, initial)

  if (state.success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">
        Ação registrada com sucesso.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Botões de ação */}
      {!active && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setActive('approve')} size="sm">
            Aprovar
          </Button>
          <Button onClick={() => setActive('reservations')} variant="outline" size="sm">
            Aprovar c/ ressalvas
          </Button>
          <Button onClick={() => setActive('reject')} variant="destructive" size="sm">
            Reprovar
          </Button>
        </div>
      )}

      {/* Formulário inline de feedback */}
      {active && active !== 'approve' && (
        <form action={formAction} className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <input type="hidden" name="card_id" value={cardId} />
          <input type="hidden" name="action_type" value={active} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Justificativa <span className="text-red-500">*</span>
            </label>
            <textarea
              name="comment"
              required
              rows={3}
              placeholder="Descreva o que precisa ser corrigido…"
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 resize-none"
            />
          </div>

          {/* RN02 — classificação da ressalva */}
          {active === 'reservations' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Tipo de ressalva <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" name="type_caption" className="rounded" />
                  Legenda
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" name="type_media" className="rounded" />
                  Mídia
                </label>
              </div>
            </div>
          )}

          {state.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              variant={active === 'reject' ? 'destructive' : 'default'}
              disabled={pending}
            >
              {pending
                ? 'Salvando…'
                : active === 'reject'
                ? 'Confirmar reprovação'
                : 'Confirmar ressalvas'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setActive(null)}
              disabled={pending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Aprovação direta (sem form) */}
      {active === 'approve' && (
        <form action={formAction} className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <input type="hidden" name="card_id" value={cardId} />
          <input type="hidden" name="action_type" value="approve" />
          <p className="text-sm text-emerald-700">Confirmar aprovação deste card?</p>

          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? 'Aprovando…' : 'Confirmar aprovação'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setActive(null)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
