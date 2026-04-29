'use client'

import { useState, useTransition } from 'react'
import { Download, Copy, Check, Share2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { publishCardAction } from '@/actions/cards'

type Props = {
  cardId: string
  status: string
  mediaUrl: string
  caption: string
  canPublish: boolean
}

export function ExportActions({ cardId, status, mediaUrl, caption, canPublish }: Props) {
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Falha ao copiar legenda:', err)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await fetch(mediaUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const filename = mediaUrl.split('/').pop() || 'media'
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Falha ao baixar mídia:', err)
    } finally {
      setDownloading(false)
    }
  }

  const handlePublish = () => {
    startTransition(async () => {
      await publishCardAction(cardId)
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Exportação e Publicação</p>
        {status === 'published' && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 ring-1 ring-blue-200 px-2.5 py-1 rounded-full uppercase tracking-wide">
            <Check size={11} /> Publicado
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          variant="outline"
          className="flex items-center gap-2 justify-center py-5"
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          <span>Baixar Mídia</span>
        </Button>

        <Button
          onClick={handleCopyCaption}
          variant="outline"
          className="flex items-center gap-2 justify-center py-5 transition-all"
        >
          {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
          <span>{copied ? 'Legenda Copiada!' : 'Copiar Legenda'}</span>
        </Button>
      </div>

      {status === 'approved' && canPublish && (
        <div className="pt-1 border-t border-stone-100">
          <Button
            onClick={handlePublish}
            disabled={isPending}
            className="w-full flex items-center gap-2 py-5 rounded-xl"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
            Marcar como Publicado
          </Button>
          <p className="text-[10px] text-stone-400 text-center mt-3 uppercase tracking-widest font-medium">
            Mova para publicado apenas após postar no Instagram
          </p>
        </div>
      )}
    </div>
  )
}
