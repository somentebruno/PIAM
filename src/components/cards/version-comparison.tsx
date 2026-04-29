'use client'

import { useState } from 'react'
import { InstagramMockup } from './instagram-mockup'
import { getMediaUrl } from '@/lib/utils'
import type { MediaVersion } from '@/types/database'

type Props = {
  versions: MediaVersion[]
  caption: string
  allowedFormats?: string[]
}

export function VersionComparison({ versions, caption, allowedFormats }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (versions.length <= 1) {
    const latest = versions[0]
    if (!latest) return null
    return (
      <div className="space-y-4">
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Pré-visualização</p>
        <InstagramMockup
          mediaUrl={getMediaUrl(latest.storage_path)!}
          mediaType={latest.media_type}
          caption={caption}
          allowedFormats={allowedFormats}
          mediaItems={latest.items?.map(item => ({
            storage_path: getMediaUrl(item.storage_path)!,
            media_type: item.media_type
          }))}
        />
      </div>
    )
  }

  const selectedVersion = versions[selectedIndex]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Visualização e Comparação</p>
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
          {versions.slice(0, 2).map((v, i) => (
            <button
              key={v.id}
              onClick={() => setSelectedIndex(i)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedIndex === i
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {i === 0 ? 'Versão Atual' : 'Versão Anterior'}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in duration-300" key={selectedVersion.id}>
        <InstagramMockup
          mediaUrl={getMediaUrl(selectedVersion.storage_path)!}
          mediaType={selectedVersion.media_type}
          caption={caption}
          allowedFormats={allowedFormats}
          mediaItems={selectedVersion.items?.map(item => ({
            storage_path: getMediaUrl(item.storage_path)!,
            media_type: item.media_type
          }))}
        />
      </div>
    </div>
  )
}
