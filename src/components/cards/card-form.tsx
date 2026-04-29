'use client'

import { useActionState, useState, useTransition } from 'react'
import { createCardAction, updateCardAction, submitForApprovalAction, recordMediaUploadAction, type CardFormState } from '@/actions/cards'
import { MediaUploadZone } from './media-upload-zone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { getMediaUrl } from '@/lib/utils'
import type { MediaCard, MediaVersion } from '@/types/database'

type Props =
  | { mode: 'create' }
  | {
      mode: 'edit'
      card: MediaCard
      latestVersion: MediaVersion | null
    }

const initialState: CardFormState = { error: null }

export function CardForm(props: Props) {
  const isEdit = props.mode === 'edit'
  const card = isEdit ? props.card : null
  const latestVersion = isEdit ? props.latestVersion : null

  const action = isEdit ? updateCardAction : createCardAction
  const [state, formAction, pending] = useActionState(action, initialState)

  const [uploadedPath, setUploadedPath] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploadedType, setUploadedType] = useState<'image' | 'video' | null>(null)

  const [submitPending, startSubmit] = useTransition()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const tagsValue = card?.tags?.join(', ') ?? ''
  const accountsValue = card?.tagged_accounts?.join(', ') ?? ''
  const suggestedValue = card?.suggested_at
    ? new Date(card.suggested_at).toISOString().slice(0, 16)
    : ''

  const canEdit = !card || card.status === 'draft' || card.status === 'approved_with_reservations' || card.status === 'rejected'
  const canSubmit = card?.status === 'draft'

  const handleUploadComplete = async (
    path: string,
    url: string,
    mediaType: 'image' | 'video'
  ) => {
    setUploadedPath(path)
    setUploadedUrl(url)
    setUploadedType(mediaType)

    if (!card) return

    await recordMediaUploadAction(card.id, {
      path,
      type: mediaType
    })
  }

  const handleSubmitForApproval = () => {
    if (!card) return
    setSubmitError(null)
    startSubmit(async () => {
      const result = await submitForApprovalAction(card.id)
      if (result.error) setSubmitError(result.error)
      else setSubmitSuccess(true)
    })
  }

  if (submitSuccess) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-2">
        <p className="text-emerald-700 font-medium">Card enviado para aprovação!</p>
        <a href="/dashboard" className="text-sm text-emerald-600 underline underline-offset-2">
          Voltar ao dashboard
        </a>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="card_id" value={card!.id} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna esquerda — campos de texto */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título interno *</Label>
            <Input
              id="title"
              name="title"
              required
              disabled={!canEdit}
              defaultValue={card?.title ?? ''}
              placeholder="Ex: Post institucional — Maio"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="caption">Legenda</Label>
            <textarea
              id="caption"
              name="caption"
              disabled={!canEdit}
              defaultValue={card?.caption ?? ''}
              rows={5}
              placeholder="Texto que será publicado na legenda do post…"
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              disabled={!canEdit}
              defaultValue={tagsValue}
              placeholder="institucional, produto, campanha (separadas por vírgula)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagged_accounts">Contas a marcar</Label>
            <Input
              id="tagged_accounts"
              name="tagged_accounts"
              disabled={!canEdit}
              defaultValue={accountsValue}
              placeholder="@parceiro1, @marca2 (separadas por vírgula)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="suggested_at">Data/hora sugerida de publicação</Label>
            <Input
              id="suggested_at"
              name="suggested_at"
              type="datetime-local"
              disabled={!canEdit}
              defaultValue={suggestedValue}
            />
          </div>
        </div>

        {/* Coluna direita — upload de mídia */}
        <div>
          {card ? (
            <MediaUploadZone
              cardId={card.id}
              onUploadComplete={handleUploadComplete}
              currentMediaUrl={
                uploadedUrl ?? getMediaUrl(latestVersion?.storage_path ?? null)
              }
              currentMediaType={uploadedType ?? latestVersion?.media_type ?? null}
              label={canEdit ? 'Mídia (upload)' : 'Mídia atual'}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-400">
              Salve o card primeiro para fazer o upload de mídia.
            </div>
          )}
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {submitError}
        </p>
      )}

      {canEdit && (
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar rascunho'}
          </Button>

          {canSubmit && state.error === null && (
            <Button
              type="button"
              variant="outline"
              disabled={submitPending}
              onClick={handleSubmitForApproval}
            >
              {submitPending ? 'Enviando…' : 'Enviar para aprovação'}
            </Button>
          )}

          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 ml-auto">
            Cancelar
          </a>
        </div>
      )}
    </form>
  )
}
