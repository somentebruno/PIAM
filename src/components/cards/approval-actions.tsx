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
      <form onSubmit={handleRejectSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2">
        <h3 className="text-sm font-semibold text-stone-900">
          {rejectType === 'rejected' ? 'Reprovar card' : 'Aprovar com ressalvas'}
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="comment">Justificativa (obrigatória)</Label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Descreva o que precisa ser ajustado..."
            className="flex w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/20 focus-visible:border-stone-400 resize-none transition-colors"
          />
        </div>

        {rejectType === 'approved_with_reservations' && (
          <div className="space-y-2">
            <Label>O que precisa de ajuste?</Label>
            <div className="flex gap-4">
              {[
                { value: 'caption', label: 'Legenda' },
                { value: 'media', label: 'Mídia' },
                { value: 'both', label: 'Ambos' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-900 transition-colors">
                  <input
                    type="radio"
                    checked={reservationType === opt.value}
                    onChange={() => setReservationType(opt.value as typeof reservationType)}
                    className="w-4 h-4 text-stone-900 border-stone-300 focus:ring-stone-900/20"
                  />
                  {opt.label}
                </label>
              ))}
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
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center flex-wrap gap-2">
        <Button
          onClick={handleApprove}
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm"
        >
          Aprovar card
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setRejectType('approved_with_reservations')
            setShowRejectForm(true)
          }}
          disabled={isPending}
          className="text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300"
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
          className="text-red-700 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300"
        >
          Reprovar
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
