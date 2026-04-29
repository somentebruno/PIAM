import { cn } from '@/lib/utils'
import type { CardStatus } from '@/types/database'

const config: Record<CardStatus, { label: string; className: string }> = {
  draft: {
    label: 'Rascunho',
    className: 'bg-stone-100 text-stone-600 ring-1 ring-stone-200',
  },
  awaiting_approval: {
    label: 'Aguardando aprovação',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
  approved_with_reservations: {
    label: 'Aprovado c/ ressalvas',
    className: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  },
  rejected: {
    label: 'Reprovado',
    className: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  },
  approved: {
    label: 'Aprovado',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
  published: {
    label: 'Publicado',
    className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  },
}

export function StatusBadge({ status, className }: { status: CardStatus; className?: string }) {
  const { label, className: colorClass } = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  )
}
