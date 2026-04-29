'use client'

import { useRef, useState } from 'react'
import { useMediaUpload } from '@/hooks/use-media-upload'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  cardId: string
  onUploadComplete: (path: string, url: string, mediaType: 'image' | 'video') => void
  currentMediaUrl?: string | null
  currentMediaType?: 'image' | 'video' | null
  label?: string
}

export function MediaUploadZone({
  cardId,
  onUploadComplete,
  currentMediaUrl,
  currentMediaType,
  label = 'Mídia',
}: Props) {
  const { state, upload, reset } = useMediaUpload(cardId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = async (file: File) => {
    const result = await upload(file)
    if (result) onUploadComplete(result.path, result.url, result.mediaType)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const previewUrl = state.status === 'done' ? state.url : currentMediaUrl
  const previewType = state.status === 'done' ? state.mediaType : currentMediaType

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>

      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {previewType === 'video' ? (
            <video
              src={previewUrl}
              controls
              className="w-full max-h-64 object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-64 object-contain"
            />
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 bg-white"
            onClick={() => {
              reset()
              if (inputRef.current) inputRef.current.value = ''
            }}
          >
            Trocar
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
            dragging
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {state.status === 'uploading' ? (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">Enviando…</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                Arraste ou{' '}
                <span className="font-medium text-gray-900 underline underline-offset-2">
                  clique para selecionar
                </span>
              </p>
              <p className="text-xs text-gray-400">JPG, PNG ou MP4 — máx. 200 MB</p>
            </div>
          )}
        </div>
      )}

      {state.status === 'error' && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,video/mp4"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
