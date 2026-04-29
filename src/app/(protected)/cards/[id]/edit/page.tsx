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

  if (profile?.role === 'creator' && card.creator_id !== user.id) redirect('/dashboard')

  const { data: versionsData } = await supabase
    .from('media_versions')
    .select('*, items:media_items(*)')
    .eq('card_id', id)
    .order('version_number', { ascending: false })
    .order('order_index', { foreignTable: 'media_items', ascending: true })

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
    <div className="max-w-4xl space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-1">
            {canEdit ? 'Edição' : 'Visualização'}
          </p>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight leading-snug truncate">
            {card.title}
          </h1>
        </div>
        <StatusBadge status={card.status} className="shrink-0 mt-1" />
      </div>

      {/* Approval actions banner */}
      {profile?.role !== 'creator' && card.status === 'awaiting_approval' && (
        <div className="bg-white rounded-2xl shadow-card p-5">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-3">
            Ações de aprovação
          </p>
          <ApprovalActions cardId={card.id} />
        </div>
      )}

      {/* Export actions */}
      {(card.status === 'approved' || card.status === 'published') && latestVersion && (
        <ExportActions
          cardId={card.id}
          status={card.status}
          mediaUrl={latestMediaUrl!}
          caption={card.caption}
          canPublish={profile?.role === 'admin' || card.creator_id === user.id}
        />
      )}

      {/* Reservation comment */}
      {card.reservation_comment && (
        <div className="bg-white rounded-2xl shadow-card border-l-4 border-amber-400 px-5 py-4 space-y-1">
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-widest">
            Ressalva do aprovador
          </p>
          <p className="text-sm text-stone-700 mt-1">{card.reservation_comment}</p>
          {card.reservation_type && (
            <p className="text-xs text-stone-400 mt-1">
              Tipo:{' '}
              {card.reservation_type === 'caption'
                ? 'Legenda'
                : card.reservation_type === 'media'
                ? 'Mídia'
                : 'Legenda e Mídia'}
            </p>
          )}
        </div>
      )}

      {/* Card form */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <CardForm
          mode="edit"
          card={card as MediaCard}
          latestVersion={latestVersion as MediaVersion | null}
        />
      </div>

      {/* Version comparison */}
      {versions && versions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <VersionComparison
            versions={versions as MediaVersion[]}
            caption={card.caption}
            allowedFormats={card.formats}
          />
        </div>
      )}

      {/* Audit timeline */}
      {auditLogs && auditLogs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <TimelineAuditoria logs={auditLogs as any[]} />
        </div>
      )}
    </div>
  )
}
