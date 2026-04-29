'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type CardFormState = { error: string | null; cardId?: string }

export async function createCardAction(
  _prev: CardFormState,
  formData: FormData
): Promise<CardFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const title = (formData.get('title') as string).trim()
  const caption = (formData.get('caption') as string | null)?.trim() ?? ''
  const tagsRaw = (formData.get('tags') as string | null)?.trim() ?? ''
  const accountsRaw = (formData.get('tagged_accounts') as string | null)?.trim() ?? ''
  const suggestedAt = (formData.get('suggested_at') as string | null) || null
  const formats = formData.getAll('formats') as string[]

  if (!title) return { error: 'O título é obrigatório.' }

  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : []
  const taggedAccounts = accountsRaw ? accountsRaw.split(',').map((a) => a.trim()).filter(Boolean) : []

  const { data: card, error } = await supabase
    .from('media_cards')
    .insert({
      creator_id: user.id,
      title,
      caption,
      tags,
      tagged_accounts: taggedAccounts,
      suggested_at: suggestedAt,
      formats: formats.length > 0 ? formats : ['feed'],
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) return { error: `Erro ao criar o card: ${error.message}` }

  await supabase.from('audit_logs').insert({
    card_id: card.id,
    user_id: user.id,
    action: 'card_created',
    details: { title },
  })

  revalidatePath('/dashboard')
  redirect(`/cards/${card.id}/edit`)
}

export async function updateCardAction(
  _prev: CardFormState,
  formData: FormData
): Promise<CardFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const cardId = formData.get('card_id') as string
  const title = (formData.get('title') as string).trim()
  const caption = (formData.get('caption') as string | null)?.trim() ?? ''
  const tagsRaw = (formData.get('tags') as string | null)?.trim() ?? ''
  const accountsRaw = (formData.get('tagged_accounts') as string | null)?.trim() ?? ''
  const suggestedAt = (formData.get('suggested_at') as string | null) || null
  const formats = formData.getAll('formats') as string[]

  if (!title) return { error: 'O título é obrigatório.' }

  const { data: existing } = await supabase
    .from('media_cards')
    .select('creator_id, status, reservation_type')
    .eq('id', cardId)
    .single()

  if (!existing) return { error: 'Card não encontrado.' }
  if (existing.creator_id !== user.id) return { error: 'Sem permissão para editar este card.' }
  if (existing.status !== 'draft' && existing.status !== 'approved_with_reservations' && existing.status !== 'rejected') {
    return { error: 'Este card não pode ser editado no status atual.' }
  }

  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : []
  const taggedAccounts = accountsRaw ? accountsRaw.split(',').map((a) => a.trim()).filter(Boolean) : []

  // RN03: Se a ressalva for só de Legenda, Criador pode editar e avança direto para Aprovado
  let status: string = existing.status
  if (existing.status === 'approved_with_reservations' && existing.reservation_type === 'caption') {
    status = 'approved'
  }

  const { error } = await supabase
    .from('media_cards')
    .update({ 
      title, 
      caption, 
      tags, 
      tagged_accounts: taggedAccounts, 
      suggested_at: suggestedAt,
      formats: formats.length > 0 ? formats : ['feed'],
      status
    })
    .eq('id', cardId)

  if (error) return { error: `Erro ao salvar: ${error.message}` }

  if (status !== existing.status) {
    await supabase.from('audit_logs').insert({
      card_id: cardId,
      user_id: user.id,
      action: status,
      details: { 
        previous_status: existing.status,
        note: 'Transição automática (RN03 - Ajuste de Legenda)' 
      },
    })
  }

  revalidatePath(`/cards/${cardId}/edit`)
  revalidatePath('/dashboard')
  return { error: null, cardId }
}

export async function submitForApprovalAction(cardId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: card } = await supabase
    .from('media_cards')
    .select('creator_id, status')
    .eq('id', cardId)
    .single()

  if (!card) return { error: 'Card não encontrado.' }
  if (card.creator_id !== user.id) return { error: 'Sem permissão.' }
  if (card.status !== 'draft') return { error: 'Apenas rascunhos podem ser enviados para aprovação.' }

  const { data: versions } = await supabase
    .from('media_versions')
    .select('id')
    .eq('card_id', cardId)
    .limit(1)

  if (!versions || versions.length === 0) {
    return { error: 'Faça o upload de uma mídia antes de enviar para aprovação.' }
  }

  await supabase
    .from('media_cards')
    .update({ status: 'awaiting_approval' })
    .eq('id', cardId)

  await supabase.from('audit_logs').insert({
    card_id: cardId,
    user_id: user.id,
    action: 'submitted_for_approval',
    details: null,
  })

  revalidatePath(`/cards/${cardId}/edit`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function approveCardAction(cardId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'approver' && profile?.role !== 'admin') return { error: 'Apenas aprovadores podem realizar esta ação.' }

  const { data: card } = await supabase.from('media_cards').select('status').eq('id', cardId).single()
  if (!card) return { error: 'Card não encontrado.' }

  const { error } = await supabase
    .from('media_cards')
    .update({ status: 'approved' })
    .eq('id', cardId)

  if (error) return { error: 'Erro ao aprovar o card.' }

  await supabase.from('audit_logs').insert({
    card_id: cardId,
    user_id: user.id,
    action: 'approved',
    details: { previous_status: card.status },
  })

  revalidatePath(`/cards/${cardId}/edit`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function rejectCardAction(
  cardId: string,
  data: { 
    status: 'rejected' | 'approved_with_reservations', 
    comment: string, 
    type?: 'caption' | 'media' | 'both' 
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'approver' && profile?.role !== 'admin') return { error: 'Apenas aprovadores podem realizar esta ação.' }

  if (!data.comment.trim()) return { error: 'A justificativa é obrigatória.' }

  const { data: card } = await supabase.from('media_cards').select('status').eq('id', cardId).single()
  if (!card) return { error: 'Card não encontrado.' }

  const { error } = await supabase
    .from('media_cards')
    .update({ 
      status: data.status,
      reservation_comment: data.comment,
      reservation_type: data.type
    })
    .eq('id', cardId)

  if (error) return { error: 'Erro ao processar a ação.' }

  await supabase.from('audit_logs').insert({
    card_id: cardId,
    user_id: user.id,
    action: data.status,
    details: { 
      previous_status: card.status,
      comment: data.comment,
      reservation_type: data.type
    },
  })

  revalidatePath(`/cards/${cardId}/edit`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function recordMediaUploadAction(
  cardId: string, 
  data: { 
    path: string, 
    type: 'image' | 'video',
    items?: { path: string, type: 'image' | 'video' }[]
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: card } = await supabase
    .from('media_cards')
    .select('status, creator_id')
    .eq('id', cardId)
    .single()

  if (!card) return { error: 'Card não encontrado.' }

  // Obter próximo número de versão
  const { data: versions } = await supabase
    .from('media_versions')
    .select('version_number')
    .eq('card_id', cardId)
    .order('version_number', { ascending: false })
    .limit(1)

  const nextVersion = (versions?.[0]?.version_number ?? 0) + 1

  // Inserir versão
  const { data: version, error: vError } = await supabase
    .from('media_versions')
    .insert({
      card_id: cardId,
      storage_path: data.path,
      media_type: data.type,
      version_number: nextVersion,
    })
    .select('id')
    .single()

  if (vError) return { error: `Erro ao criar versão: ${vError.message}` }

  // Se for carrossel, inserir itens
  if (data.items && data.items.length > 0) {
    const itemsToInsert = data.items.map((item, index) => ({
      version_id: version.id,
      storage_path: item.path,
      media_type: item.type,
      order_index: index,
    }))

    const { error: iError } = await supabase.from('media_items').insert(itemsToInsert)
    if (iError) return { error: `Erro ao salvar itens do carrossel: ${iError.message}` }
  }

  // RN03: Se envolver Mídia, volta para Aguardando Aprovação após novo upload
  const needsStatusUpdate = card.status === 'approved_with_reservations' || card.status === 'rejected'
  
  if (needsStatusUpdate) {
    await supabase
      .from('media_cards')
      .update({ status: 'awaiting_approval' })
      .eq('id', cardId)
  }

  // Registrar Log
  await supabase.from('audit_logs').insert({
    card_id: cardId,
    user_id: user.id,
    action: needsStatusUpdate ? 'awaiting_approval' : 'media_uploaded',
    details: { 
      version: nextVersion,
      is_carousel: !!data.items?.length,
      item_count: data.items?.length ?? 1,
      previous_status: card.status,
    },
  })

  revalidatePath(`/cards/${cardId}/edit`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function publishCardAction(cardId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: card } = await supabase.from('media_cards').select('status, creator_id').eq('id', cardId).single()
  if (!card) return { error: 'Card não encontrado.' }

  // Criador ou admin podem marcar como publicado
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const canPublish = card.creator_id === user.id || profile?.role === 'admin'
  if (!canPublish) return { error: 'Sem permissão para publicar este card.' }

  if (card.status !== 'approved') return { error: 'Apenas cards aprovados podem ser publicados.' }

  const { error } = await supabase
    .from('media_cards')
    .update({ status: 'published' })
    .eq('id', cardId)

  if (error) return { error: 'Erro ao publicar o card.' }

  await supabase.from('audit_logs').insert({
    card_id: cardId,
    user_id: user.id,
    action: 'published',
    details: { previous_status: 'approved' },
  })

  revalidatePath(`/cards/${cardId}/edit`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteCardAction(cardId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado.' }

  const { data: card } = await supabase
    .from('media_cards')
    .select('creator_id, status')
    .eq('id', cardId)
    .single()

  if (!card) return { error: 'Card não encontrado.' }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'
  const isOwner = card.creator_id === user.id

  if (!isAdmin && !isOwner) return { error: 'Sem permissão.' }
  
  if (card.status === 'published' && !isAdmin) return { error: 'Cards publicados não podem ser excluídos.' }

  const { error } = await supabase.from('media_cards').delete().eq('id', cardId)
  if (error) return { error: `Erro ao deletar: ${error.message}` }

  revalidatePath('/dashboard')
  return { error: null }
}
