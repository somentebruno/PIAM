import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatusBadge } from './status-badge'
import type { MediaCard } from '@/types/database'

type Props = {
  cards: MediaCard[]
  showCreator?: boolean
}

export function CardList({ cards, showCreator = false }: Props) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-400">Nenhum card encontrado.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {cards.map((card) => (
        <li key={card.id}>
          <Link
            href={`/cards/${card.id}/edit`}
            className="flex items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">
                {card.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDistanceToNow(new Date(card.updated_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
            <StatusBadge status={card.status} />
          </Link>
        </li>
      ))}
    </ul>
  )
}
