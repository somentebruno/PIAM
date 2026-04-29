'use client'

import Link from 'next/link'
import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { 
  createCardAction, 
  updateCardAction, 
  submitForApprovalAction, 
  recordMediaUploadAction, 
  deleteCardAction,
  type CardFormState 
} from '@/actions/cards'
import { MediaUploadZone } from './media-upload-zone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Send, X, Trash2, Loader2 } from 'lucide-react'
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

  const router = useRouter()
  const [uploadedPath, setUploadedPath] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploadedType, setUploadedType] = useState<'image' | 'video' | null>(null)
  const [uploadedItems, setUploadedItems] = useState<{path: string, url: string, type: 'image' | 'video'}[]>([])

  const [submitPending, startSubmit] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [selectedFormats, setSelectedFormats] = useState<string[]>(card?.formats ?? ['feed'])
  const isCarouselSelected = selectedFormats.includes('carousel')

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
    mediaType: 'image' | 'video',
    items?: { path: string, url: string, type: 'image' | 'video' }[]
  ) => {
    setUploadedPath(path)
    setUploadedUrl(url)
    setUploadedType(mediaType)
    setUploadedItems(items ?? [])

    if (!card) return

    await recordMediaUploadAction(card.id, {
      path,
      type: mediaType,
      items: items?.map(i => ({ path: i.path, type: i.type }))
    })
  }

  const handleFormatChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedFormats(prev => [...prev, id])
    } else {
      setSelectedFormats(prev => prev.filter(f => f !== id))
    }
  }

  const handleDeleteCard = async () => {
    if (!card) return
    if (!confirm('Tem certeza que deseja excluir este post permanentemente?')) return

    setIsDeleting(true)
    const result = await deleteCardAction(card.id)
    if (result.error) {
      setSubmitError(result.error)
      setIsDeleting(false)
    } else {
      router.push('/dashboard')
    }
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
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-2">
        <p className="text-emerald-700 font-semibold">Card enviado para aprovação!</p>
        <a href="/dashboard" className="text-sm text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors">
          Voltar ao dashboard
        </a>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="card_id" value={card!.id} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna esquerda */}
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
              className="flex w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/20 focus-visible:border-stone-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-stone-50 resize-none transition-colors"
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

          <div className="space-y-3 pt-1">
            <Label>Formatos desejados *</Label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'feed', label: 'Feed' },
                { id: 'carousel', label: 'Carrossel' },
                { id: 'story', label: 'Story' },
                { id: 'reels', label: 'Reels' },
              ].map((f) => (
                <label key={f.id} className="flex items-center gap-2 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    name="formats"
                    value={f.id}
                    disabled={!canEdit}
                    checked={selectedFormats.includes(f.id)}
                    onChange={(e) => handleFormatChange(f.id, e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900/20 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors font-medium">
                    {f.label}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-stone-400">Selecione pelo menos um formato para a pré-visualização.</p>
          </div>
        </div>

        {/* Coluna direita — upload */}
        <div>
          {card ? (
            <MediaUploadZone
              cardId={card.id}
              onUploadComplete={handleUploadComplete}
              allowMultiple={isCarouselSelected}
              currentItems={uploadedItems.length > 0 ? uploadedItems : (latestVersion?.items?.map(i => ({ path: i.storage_path, url: getMediaUrl(i.storage_path)!, type: i.media_type })) ?? [])}
              currentMediaUrl={
                uploadedUrl ?? getMediaUrl(latestVersion?.storage_path ?? null)
              }
              currentMediaType={uploadedType ?? latestVersion?.media_type ?? null}
              label={canEdit ? (isCarouselSelected ? 'Mídias do Carrossel (máx. 10)' : 'Mídia (upload)') : 'Mídia atual'}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 p-6 text-center text-sm text-stone-400 h-full flex items-center justify-center min-h-[120px]">
              Salve o card primeiro para fazer o upload de mídia.
            </div>
          )}
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {state.error}
        </p>
      )}

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {submitError}
        </p>
      )}

      {canEdit && (
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-5 border-t border-stone-100">
          <Button
            type="submit"
            variant="outline"
            disabled={pending}
            className="w-full sm:w-auto gap-2"
          >
            {pending ? (
              <div className="w-4 h-4 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? 'Salvar alterações' : 'Criar rascunho'}
          </Button>

          {canSubmit && (
            <Button
              type="button"
              variant="default"
              disabled={submitPending || pending}
              onClick={handleSubmitForApproval}
              className="w-full sm:w-auto gap-2 transition-all hover:scale-105 active:scale-95"
            >
              {submitPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {submitPending ? 'Enviando…' : 'Enviar para aprovação'}
            </Button>
          )}

          {isEdit && (
            <Button
              type="button"
              variant="ghost"
              disabled={isDeleting || pending || submitPending}
              onClick={handleDeleteCard}
              className="w-full sm:w-auto gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-4 rounded-xl font-medium"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
              {isDeleting ? 'Excluindo…' : 'Excluir post'}
            </Button>
          )}

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-stone-400 hover:text-stone-700 transition-colors ml-0 sm:ml-auto"
          >
            <X size={15} />
            Cancelar
          </Link>
        </div>
      )}
    </form>
  )
}
