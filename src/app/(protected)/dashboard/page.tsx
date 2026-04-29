import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CardList } from '@/components/cards/card-list'
import { buttonClass } from '@/components/ui/button'
import type { CardStatus } from '@/types/database'

const CREATOR_TABS: { label: string; statuses: CardStatus[] }[] = [
  { label: 'Rascunhos', statuses: ['draft'] },
  { label: 'Em aprovação', statuses: ['awaiting_approval'] },
  { label: 'Com ressalvas', statuses: ['approved_with_reservations', 'rejected'] },
  { label: 'Aprovados', statuses: ['approved', 'published'] },
]

const APPROVER_TABS: { label: string; statuses: CardStatus[] }[] = [
  { label: 'Fila de aprovação', statuses: ['awaiting_approval'] },
  { label: 'Histórico', statuses: ['approved', 'approved_with_reservations', 'rejected', 'published'] },
]

type Props = {
  searchParams: Promise<{ tab?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const { tab } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const isApprover = profile.role === 'approver' || profile.role === 'admin'
  const isCreator = profile.role === 'creator' || profile.role === 'admin'

  // Para Admins, permitimos alternar entre a visão de Criador e Aprovador via query param
  const view = (await searchParams).view || (isApprover ? 'approver' : 'creator')
  
  const tabs = view === 'approver' ? APPROVER_TABS : CREATOR_TABS
  const activeIndex = Math.max(0, Math.min(Number(tab ?? 0), tabs.length - 1))
  const activeStatuses = tabs[activeIndex].statuses

  let query = supabase
    .from('media_cards')
    .select('*')
    .in('status', activeStatuses)
    .order('updated_at', { ascending: false })

  if (view === 'creator') {
    query = query.eq('creator_id', user.id)
  }

  const { data: cards } = await query

  // Busca as contagens para os badges
  let countQuery = supabase
    .from('media_cards')
    .select('status')
  
  if (view === 'creator') {
    countQuery = countQuery.eq('creator_id', user.id)
  }

  const { data: allStats } = await countQuery
  
  const counts = allStats?.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const getTabCount = (statuses: CardStatus[]) => {
    return statuses.reduce((total, s) => total + (counts[s] || 0), 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Olá, {profile.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{
            profile.role === 'admin' ? 'Administrador' :
            profile.role === 'approver' ? 'Aprovador' : 'Criador'
          }</p>
        </div>

        {isCreator && (
          <div className="flex items-center gap-2">
            {profile.role === 'admin' && (
               <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
                 <Link 
                   href="/dashboard?view=creator" 
                   className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'creator' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   Criador
                 </Link>
                 <Link 
                   href="/dashboard?view=approver" 
                   className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'approver' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   Aprovador
                 </Link>
               </div>
            )}
            <Link href="/cards/new" className={buttonClass()}>
              + Novo card
            </Link>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((t, i) => (
          <Link
            key={i}
            href={`/dashboard?view=${view}&tab=${i}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeIndex === i
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {getTabCount(t.statuses) > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeIndex === i ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {getTabCount(t.statuses)}
              </span>
            )}
          </Link>
        ))}
      </div>

      <CardList cards={cards ?? []} showCreator={view === 'approver'} />
    </div>
  )
}
