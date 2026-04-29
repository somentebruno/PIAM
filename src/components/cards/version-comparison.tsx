'use client'

import { useState } from 'react'
import { InstagramMockup } from './instagram-mockup'
import { getMediaUrl } from '@/lib/utils'
import type { MediaVersion } from '@/types/database'

type Props = {
  versions: MediaVersion[]
  caption: string
}

export function VersionComparison({ versions, caption }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (versions.length <= 1) {
    const latest = versions[0]
    if (!latest) return null
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Pré-visualização</h3>
        <InstagramMockup
          mediaUrl={getMediaUrl(latest.storage_path)!}
          mediaType={latest.media_type}
          caption={caption}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Visualização e Comparação</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {versions.slice(0, 2).map((v, i) => (
            <button
              key={v.id}
              onClick={() => setSelectedIndex(i)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedIndex === i
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {i === 0 ? 'Versão Atual' : 'Versão Anterior'}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in duration-300" key={versions[selectedIndex].id}>
        <InstagramMockup
          mediaUrl={getMediaUrl(versions[selectedIndex].storage_path)!}
          mediaType={versions[selectedIndex].media_type}
          caption={caption}
        />
      </div>
    </div>
  )
}
