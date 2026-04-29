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
      // Tentar pegar o nome original do arquivo da URL
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Exportação e Publicação</h3>
        {status === 'published' && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">
            <Check size={12} /> Publicado
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          variant="outline"
          className="flex items-center gap-2 justify-center py-6 border-gray-200 hover:bg-gray-50"
        >
          {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          <span>Baixar Mídia</span>
        </Button>

        <Button
          onClick={handleCopyCaption}
          variant="outline"
          className="flex items-center gap-2 justify-center py-6 border-gray-200 hover:bg-gray-50 transition-all"
        >
          {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
          <span>{copied ? 'Legenda Copiada!' : 'Copiar Legenda'}</span>
        </Button>
      </div>

      {status === 'approved' && canPublish && (
        <div className="pt-2 border-t border-gray-100">
          <Button
            onClick={handlePublish}
            disabled={isPending}
            className="w-full bg-gray-900 hover:bg-black text-white flex items-center gap-2 py-6 rounded-xl shadow-sm"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
            Marcar como Publicado
          </Button>
          <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-widest font-medium">
            Mova para publicado apenas após postar no Instagram
          </p>
        </div>
      )}
    </div>
  )
}
