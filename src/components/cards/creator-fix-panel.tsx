'use client'

import { useActionState } from 'react'
import { fixCaptionAction, resubmitAction, type ApprovalState } from '@/actions/approval'
import { Button } from '@/components/ui/button'
import type { ReservationType } from '@/types/database'

const initial: ApprovalState = { error: null }

type Props = {
  cardId: string
  reservationType: ReservationType | null
  hasNewVersion: boolean // true se foi feito upload após a ressalva
}

export function CreatorFixPanel({ cardId, reservationType, hasNewVersion }: Props) {
  const isCaptionOnly = reservationType === 'caption'
  const involvesMedia = reservationType === 'media' || reservationType === 'both'

  const [captionState, captionAction, captionPending] = useActionState(fixCaptionAction, initial)
  const [resubmitState, resubmitFormAction, resubmitPending] = useActionState(resubmitAction, initial)

  if (captionState.success || resubmitState.success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">
        {captionState.success ? 'Legenda corrigida — card aprovado!' : 'Card reenviado para aprovação!'}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* RN03 — Caminho 1: só legenda → vai direto para aprovado */}
      {isCaptionOnly && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
          <p className="text-sm text-blue-800">
            Edite a legenda no formulário acima e clique em <strong>Salvar alterações</strong>. Depois confirme aqui:
          </p>
          <form action={captionAction}>
            <input type="hidden" name="card_id" value={cardId} />
            {captionState.error && (
              <p className="text-sm text-red-600 mb-2">{captionState.error}</p>
            )}
            <Button type="submit" size="sm" disabled={captionPending}>
              {captionPending ? 'Confirmando…' : 'Legenda corrigida — marcar como aprovado'}
            </Button>
          </form>
        </div>
      )}

      {/* RN03 — Caminho 2: envolve mídia → reenviar para aprovação */}
      {involvesMedia && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-sm text-amber-800">
            Faça o upload da nova mídia usando a zona de upload acima e depois reenvie para aprovação.
          </p>
          <form action={resubmitFormAction}>
            <input type="hidden" name="card_id" value={cardId} />
            {resubmitState.error && (
              <p className="text-sm text-red-600 mb-2">{resubmitState.error}</p>
            )}
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={resubmitPending || !hasNewVersion}
              title={!hasNewVersion ? 'Faça o upload da nova mídia primeiro' : undefined}
            >
              {resubmitPending ? 'Reenviando…' : 'Reenviar para aprovação'}
            </Button>
            {!hasNewVersion && (
              <p className="text-xs text-amber-600 mt-2">Upload de nova mídia necessário para habilitar este botão.</p>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
