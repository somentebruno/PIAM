import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CardForm } from '@/components/cards/card-form'
import { StatusBadge } from '@/components/cards/status-badge'
import { ApprovalActions } from '@/components/cards/approval-actions'
import { VersionComparison } from '@/components/cards/version-comparison'
import { TimelineAuditoria } from '@/components/cards/timeline-auditoria'
import { ExportActions } from '@/components/cards/export-actions'
import { getMediaUrl } from '@/lib/utils'
import type { MediaCard, MediaVersion } from '@/types/database'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditCardPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: card } = await supabase
    .from('media_cards')
    .select('*')
    .eq('id', id)
    .single()

  if (!card) notFound()

  // Criador só acessa os próprios cards
  if (profile?.role === 'creator' && card.creator_id !== user.id) redirect('/dashboard')

  const { data: versionsData } = await supabase
    .from('media_versions')
    .select('*')
    .eq('card_id', id)
    .order('version_number', { ascending: false })

  const versions = versionsData ?? []
  const latestVersion = versions[0] ?? null
  const latestMediaUrl = getMediaUrl(latestVersion?.storage_path ?? null)

  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:user_id (name)
    `)
    .eq('card_id', id)
    .order('created_at', { ascending: false })

  const canEdit =
    card.status === 'draft' ||
    card.status === 'approved_with_reservations' ||
    card.status === 'rejected'

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{card.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {canEdit ? 'Edite os campos e salve as alterações.' : 'Visualização do card.'}
          </p>
        </div>
        <StatusBadge status={card.status} className="shrink-0 mt-1" />
      </div>

      {profile?.role !== 'creator' && card.status === 'awaiting_approval' && (
        <ApprovalActions cardId={card.id} />
      )}

      {(card.status === 'approved' || card.status === 'published') && latestVersion && (
        <ExportActions
          cardId={card.id}
          status={card.status}
          mediaUrl={latestMediaUrl!}
          caption={card.caption}
          canPublish={profile?.role === 'admin' || card.creator_id === user.id}
        />
      )}

      {card.reservation_comment && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-1">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            Ressalva do aprovador
          </p>
          <p className="text-sm text-amber-800">{card.reservation_comment}</p>
          {card.reservation_type && (
            <p className="text-xs text-amber-600">
              Tipo: {card.reservation_type === 'caption' ? 'Legenda' : card.reservation_type === 'media' ? 'Mídia' : 'Legenda e Mídia'}
            </p>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <CardForm
          mode="edit"
          card={card as MediaCard}
          latestVersion={latestVersion as MediaVersion | null}
        />
      </div>

      {versions && versions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <VersionComparison versions={versions as MediaVersion[]} caption={card.caption} />
        </div>
      )}

      {auditLogs && auditLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <TimelineAuditoria logs={auditLogs as any[]} />
        </div>
      )}
    </div>
  )
}
