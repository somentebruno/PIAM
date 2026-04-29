import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge } from './status-badge'
import type { MediaCard } from '@/types/database'
import { CheckCircle2, ChevronRight } from 'lucide-react'

type Props = {
  cards: MediaCard[]
  showCreator?: boolean
}

export function CardList({ cards, showCreator = false }: Props) {
  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-16 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center mb-4 ring-1 ring-stone-100">
          <CheckCircle2 size={26} className="text-emerald-500" />
        </div>
        <h3 className="text-base font-semibold text-stone-900">Tudo em dia por aqui!</h3>
        <p className="text-sm text-stone-400 mt-1.5 max-w-[240px] leading-relaxed">
          {showCreator
            ? 'Não há nada pendente para sua aprovação no momento.'
            : 'Você ainda não possui posts nesta categoria.'}
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-2.5">
      {cards.map((card) => (
        <li key={card.id}>
          <Link
            href={`/cards/${card.id}/edit`}
            className="group flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-900 truncate leading-snug">
                {card.title}
              </p>
              <p className="text-xs text-stone-400 mt-0.5 font-medium">
                {formatDistanceToNow(new Date(card.updated_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={card.status} />
              <ChevronRight size={14} className="text-stone-300 group-hover:text-stone-500 transition-colors" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
