'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  token: string
}

export function CopyInviteButton({ token }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const link = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 gap-1.5 text-[10px] font-bold uppercase tracking-wider"
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check size={12} className="text-emerald-500" />
          <span>Copiado</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          <span>Copiar Link</span>
        </>
      )}
    </Button>
  )
}
