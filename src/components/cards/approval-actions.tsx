'use client'

import { useState, useTransition } from 'react'
import { approveCardAction, rejectCardAction } from '@/actions/cards'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type Props = {
  cardId: string
}

export function ApprovalActions({ cardId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectType, setRejectType] = useState<'rejected' | 'approved_with_reservations'>('rejected')
  const [reservationType, setReservationType] = useState<'caption' | 'media' | 'both'>('both')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleApprove = () => {
    setError(null)
    startTransition(async () => {
      const result = await approveCardAction(cardId)
      if (result.error) setError(result.error)
    })
  }

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) {
      setError('A justificativa é obrigatória.')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await rejectCardAction(cardId, {
        status: rejectType,
        comment,
        type: rejectType === 'approved_with_reservations' ? reservationType : undefined
      })
      if (result.error) setError(result.error)
      else setShowRejectForm(false)
    })
  }

  if (showRejectForm) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
        <h3 className="text-sm font-semibold text-gray-900">
          {rejectType === 'rejected' ? 'Reprovar card' : 'Aprovar com ressalvas'}
        </h3>
        
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Justificativa (obrigatória)</Label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Descreva o que precisa ser ajustado..."
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent resize-none"
            />
          </div>

          {rejectType === 'approved_with_reservations' && (
            <div className="space-y-2">
              <Label>O que precisa de ajuste?</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    checked={reservationType === 'caption'}
                    onChange={() => setReservationType('caption')}
                    className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                  />
                  Legenda
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    checked={reservationType === 'media'}
                    onChange={() => setReservationType('media')}
                    className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                  />
                  Mídia
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    checked={reservationType === 'both'}
                    onChange={() => setReservationType('both')}
                    className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                  />
                  Ambos
                </label>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              Confirmar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRejectForm(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button onClick={handleApprove} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          Aprovar card
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setRejectType('approved_with_reservations')
            setShowRejectForm(true)
          }}
          disabled={isPending}
          className="text-amber-600 border-amber-200 hover:bg-amber-50"
        >
          Aprovar com ressalvas
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setRejectType('rejected')
            setShowRejectForm(true)
          }}
          disabled={isPending}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Reprovar
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
