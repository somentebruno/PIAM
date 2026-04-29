'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'done'; path: string; url: string; mediaType: 'image' | 'video' }
  | { status: 'error'; message: string }

export function useMediaUpload(cardId: string) {
  const [state, setState] = useState<UploadState>({ status: 'idle' })

  const upload = useCallback(
    async (file: File) => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')

      if (!isImage && !isVideo) {
        setState({ status: 'error', message: 'Formato inválido. Use JPG, PNG ou MP4.' })
        return null
      }

      if (isImage && file.size > 10 * 1024 * 1024) {
        setState({ status: 'error', message: 'Imagem muito grande. Máximo 10 MB.' })
        return null
      }

      if (isVideo && file.size > 200 * 1024 * 1024) {
        setState({ status: 'error', message: 'Vídeo muito grande. Máximo 200 MB.' })
        return null
      }

      setState({ status: 'uploading', progress: 0 })

      const ext = file.name.split('.').pop()
      const path = `${cardId}/${Date.now()}.${ext}`
      const supabase = createClient()

      const { error } = await supabase.storage
        .from('media-uploads')
        .upload(path, file, {
          upsert: false,
          contentType: file.type,
        })

      if (error) {
        setState({ status: 'error', message: 'Falha no upload. Tente novamente.' })
        return null
      }

      const { data: urlData } = supabase.storage
        .from('media-uploads')
        .getPublicUrl(path)

      const mediaType = isImage ? 'image' : 'video'
      const result = { path, url: urlData.publicUrl, mediaType } as const
      setState({ status: 'done', ...result })
      return result
    },
    [cardId]
  )

  const reset = useCallback(() => setState({ status: 'idle' }), [])

  return { state, upload, reset }
}
