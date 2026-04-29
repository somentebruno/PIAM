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
  searchParams: Promise<{ tab?: string; view?: string }>
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

  const isCreator = profile.role === 'creator' || profile.role === 'admin'

  const view = (await searchParams).view || (profile.role === 'approver' ? 'approver' : 'creator')

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-1">
            {profile.role === 'admin' ? 'Administrador' : profile.role === 'approver' ? 'Aprovador' : 'Criador'}
          </p>
          <h1 className="text-3xl font-medium text-stone-900 tracking-tight leading-none">
            Olá,{' '}
            <span
              className="italic font-normal"
              style={{ fontFamily: 'var(--font-instrument-serif)' }}
            >
              {profile.name.split(' ')[0]}
            </span>
          </h1>
        </div>

        {isCreator && (
          <div className="flex items-center gap-2 pb-0.5">
            {profile.role === 'admin' && (
              <div className="flex bg-stone-100 p-1 rounded-xl mr-1">
                <Link
                  href="/dashboard?view=creator"
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    view === 'creator'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Criador
                </Link>
                <Link
                  href="/dashboard?view=approver"
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    view === 'approver'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Aprovador
                </Link>
              </div>
            )}
            <Link href="/cards/new" className={buttonClass()}>
              + Novo post
            </Link>
          </div>
        )}
      </div>

      {/* Filter tabs — pill style */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {tabs.map((t, i) => {
          const count = getTabCount(t.statuses)
          const isActive = activeIndex === i
          return (
            <Link
              key={i}
              href={`/dashboard?view=${view}&tab=${i}`}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-500 hover:text-stone-900 shadow-card hover:shadow-card-hover'
              }`}
            >
              {t.label}
              {count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      <CardList cards={cards ?? []} showCreator={view === 'approver'} />
    </div>
  )
}
