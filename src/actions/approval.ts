'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ApprovalState = { error: string | null; success?: boolean }

// ── Ação unificada: approve / reject / approve_with_reservations ──────────────
export async function approvalAction(
  _prev: ApprovalState,
  formData: FormData
): Promise<ApprovalState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'approver' && profile.role !== 'admin'))
    return { error: 'Apenas aprovadores podem executar esta ação.' }

  const cardId = formData.get('card_id') as string
  const actionType = formData.get('action_type') as 'approve' | 'reject' | 'reservations'
  const comment = (formData.get('comment') as string | null)?.trim() ?? ''
  const typeCaption = formData.get('type_caption') === 'on'
  const typeMedia = formData.get('type_media') === 'on'

  const { data: card } = await supabase
    .from('media_cards')
    .select('status')
    .eq('id', cardId)
    .single()

  if (!card) return { error: 'Card não encontrado.' }
  if (card.status !== 'awaiting_approval') return { error: 'O card não está aguardando aprovação.' }

  // RN01 — comentário obrigatório em reprovação/ressalvas
  if ((actionType === 'reject' || actionType === 'reservations') && !comment)
    return { error: 'A justificativa é obrigatória.' }

  // RN02 — classificação obrigatória em ressalvas
  if (actionType === 'reservations' && !typeCaption && !typeMedia)
    return { error: 'Selecione pelo menos um tipo de ressalva (Legenda e/ou Mídia).' }

  const reservationType =
    actionType === 'reservations'
      ? typeCaption && typeMedia ? 'both' : typeCaption ? 'caption' : 'media'
      : null

  const newStatus =
    actionType === 'approve'
      ? 'approved'
      : actionType === 'reject'
      ? 'rejected'
      : 'approved_with_reservations'

  const auditAction =
    actionType === 'approve'
      ? 'card_approved'
      : actionType === 'reject'
      ? 'card_rejected'
      : 'card_approved_with_reservations'

  const { error } = await supabase
    .from('media_cards')
    .update({
      status: newStatus,
      reservation_type: reservationType,
      reservation_comment: comment || null,
    })
    .eq('id', cardId)

  if (error) return { error: 'Erro ao atualizar o card.' }

  await supabase.from('audit_logs').insert({
    card_id: cardId,
    user_id: user.id,
    action: auditAction,
    details: comment ? { comment, reservation_type: reservationType } : null,
  })

  revalidatePath(`/cards/${cardId}/edit`)
  revalidatePath('/dashboard')
  return { error: null, success: true }
}

// ── RN03: Criador corrige só a legenda → vai direto para Aprovado ─────────────
export async function fixCaptionAction(
  _prev: ApprovalState,
  formData: FormData
): Promise<ApprovalState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const cardId = formData.get('card_id') as string

  const { data: card } = await supabase
    .from('media_cards')
    .select('creator_id, status, reservation_type')
    .eq('id', cardId)
    .single()

  if (!card) return { error: 'Card não encontrado.' }
  if (card.creator_id !== user.id) return { error: 'Sem permissão.' }
  if (card.status !== 'approved_with_reservations' && card.status !== 'rejected')
    return { error: 'Ação não permitida no status atual.' }
  if (card.reservation_type !== 'caption')
    return { error: 'Use esta ação somente para ressalvas de legenda.' }

  await supabase
    .from('media_cards')
    .update({ status: 'approved', reservation_type: null, reservation_comment: null })
    .eq('id', cardId)

  await supabase.from('audit_logs').insert({
    card_id: cardId,
    user_id: user.id,
    action: 'caption_corrected_approved',
    details: null,
  })

  revalidatePath(`/cards/${cardId}/edit`)
  revalidatePath('/dashboard')
  return { error: null, success: true }
}

// ── RN03: Criador corrige mídia → volta para Aguardando Aprovação ─────────────
export async function resubmitAction(
  _prev: ApprovalState,
  formData: FormData
): Promise<ApprovalState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const cardId = formData.get('card_id') as string

  const { data: card } = await supabase
    .from('media_cards')
    .select('creator_id, status, reservation_type')
    .eq('id', cardId)
    .single()

  if (!card) return { error: 'Card não encontrado.' }
  if (card.creator_id !== user.id) return { error: 'Sem permissão.' }
  if (card.status !== 'approved_with_reservations' && card.status !== 'rejected')
    return { error: 'Ação não permitida no status atual.' }

  // Verifica se há pelo menos 2 versões (upload novo foi feito)
  const { data: versions } = await supabase
    .from('media_versions')
    .select('id')
    .eq('card_id', cardId)

  if (!versions || versions.length < 2)
    return { error: 'Faça o upload da nova mídia antes de reenviar.' }

  await supabase
    .from('media_cards')
    .update({ status: 'awaiting_approval', reservation_type: null, reservation_comment: null })
    .eq('id', cardId)

  await supabase.from('audit_logs').insert({
    card_id: cardId,
    user_id: user.id,
    action: 'resubmitted_after_media_fix',
    details: null,
  })

  revalidatePath(`/cards/${cardId}/edit`)
  revalidatePath('/dashboard')
  return { error: null, success: true }
}
