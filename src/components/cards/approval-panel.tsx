'use client'

import { useActionState, useState } from 'react'
import { approvalAction, type ApprovalState } from '@/actions/approval'
import { Button } from '@/components/ui/button'

type ActionType = 'approve' | 'reject' | 'reservations'

const initial: ApprovalState = { error: null }

export function ApprovalPanel({ cardId }: { cardId: string }) {
  const [active, setActive] = useState<ActionType | null>(null)
  const [state, formAction, pending] = useActionState(approvalAction, initial)

  if (state.success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
        Ação registrada com sucesso.
      </div>
    )
  }

  return (
    <div className="space-y-4">
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

      {active && active !== 'approve' && (
        <form action={formAction} className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-5">
          <input type="hidden" name="card_id" value={cardId} />
          <input type="hidden" name="action_type" value={active} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">
              Justificativa <span className="text-red-500">*</span>
            </label>
            <textarea
              name="comment"
              required
              rows={3}
              placeholder="Descreva o que precisa ser corrigido…"
              className="flex w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/20 focus-visible:border-stone-400 resize-none transition-colors"
            />
          </div>

          {active === 'reservations' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-700">
                Tipo de ressalva <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-900 transition-colors">
                  <input type="checkbox" name="type_caption" className="rounded border-stone-300" />
                  Legenda
                </label>
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-900 transition-colors">
                  <input type="checkbox" name="type_media" className="rounded border-stone-300" />
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

      {active === 'approve' && (
        <form action={formAction} className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <input type="hidden" name="card_id" value={cardId} />
          <input type="hidden" name="action_type" value="approve" />
          <p className="text-sm text-emerald-700 font-medium">Confirmar aprovação deste card?</p>

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
