'use client'

import { useState } from 'react'
import type { MediaVersion } from '@/types/database'

type Props = {
  versions: MediaVersion[]
  supabaseUrl: string
}

export function VersionCompare({ versions, supabaseUrl }: Props) {
  const [comparing, setComparing] = useState(false)

  if (versions.length < 2) return null

  const current = versions[0]
  const previous = versions[1]

  const url = (v: MediaVersion) =>
    `${supabaseUrl}/storage/v1/object/public/media-uploads/${v.storage_path}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">
          Versões ({versions.length} no total)
        </p>
        <button
          type="button"
          onClick={() => setComparing((v) => !v)}
          className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700"
        >
          {comparing ? 'Ocultar comparação' : 'Comparar versões'}
        </button>
      </div>

      {comparing && (
        <div className="grid grid-cols-2 gap-3">
          <VersionCard label="Versão anterior" version={previous} url={url(previous)} />
          <VersionCard label="Versão atual" version={current} url={url(current)} highlight />
        </div>
      )}
    </div>
  )
}

function VersionCard({
  label,
  version,
  url,
  highlight = false,
}: {
  label: string
  version: MediaVersion
  url: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-xl border overflow-hidden ${highlight ? 'border-gray-900' : 'border-gray-200'}`}>
      <div className={`px-3 py-1.5 text-xs font-medium ${highlight ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
        {label} — v{version.version_number}
      </div>
      <div className="bg-gray-50 aspect-square">
        {version.media_type === 'video' ? (
          <video src={url} controls className="w-full h-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="w-full h-full object-contain" />
        )}
      </div>
    </div>
  )
}
