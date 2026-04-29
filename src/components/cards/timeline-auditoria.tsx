import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  PlusCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UploadCloud,
  ArrowRight
} from 'lucide-react'

type AuditLog = {
  id: string
  action: string
  created_at: string
  details: any
  profiles: {
    name: string
  }
}

type Props = {
  logs: AuditLog[]
}

const ACTION_MAP: Record<string, { label: string; icon: any; iconClass: string; dotClass: string }> = {
  card_created: { label: 'Card criado', icon: PlusCircle, iconClass: 'text-stone-400', dotClass: 'bg-stone-100 ring-2 ring-white' },
  submitted_for_approval: { label: 'Enviado para aprovação', icon: Send, iconClass: 'text-blue-500', dotClass: 'bg-blue-50 ring-2 ring-white' },
  approved: { label: 'Aprovado', icon: CheckCircle2, iconClass: 'text-emerald-500', dotClass: 'bg-emerald-50 ring-2 ring-white' },
  approved_with_reservations: { label: 'Aprovado com ressalvas', icon: AlertCircle, iconClass: 'text-amber-500', dotClass: 'bg-amber-50 ring-2 ring-white' },
  rejected: { label: 'Reprovado', icon: XCircle, iconClass: 'text-red-500', dotClass: 'bg-red-50 ring-2 ring-white' },
  media_uploaded: { label: 'Nova mídia enviada', icon: UploadCloud, iconClass: 'text-stone-400', dotClass: 'bg-stone-100 ring-2 ring-white' },
  awaiting_approval: { label: 'Retornou para aprovação', icon: ArrowRight, iconClass: 'text-blue-500', dotClass: 'bg-blue-50 ring-2 ring-white' },
}

export function TimelineAuditoria({ logs }: Props) {
  if (!logs || logs.length === 0) return null

  return (
    <div className="space-y-5">
      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">
        Histórico de Atividade
      </p>

      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px before:h-full before:w-px before:bg-stone-100">
        {logs.map((log) => {
          const config = ACTION_MAP[log.action] || { label: log.action, icon: AlertCircle, iconClass: 'text-stone-400', dotClass: 'bg-stone-100 ring-2 ring-white' }
          const Icon = config.icon

          return (
            <div key={log.id} className="relative flex items-start gap-4">
              <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.dotClass}`}>
                <Icon size={14} className={config.iconClass} />
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                  <span className="text-sm font-semibold text-stone-900">{config.label}</span>
                  <span className="text-xs text-stone-400 font-medium">
                    {format(new Date(log.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>

                <p className="text-xs text-stone-400 mt-0.5">
                  por <span className="font-semibold text-stone-600">{log.profiles?.name || 'Sistema'}</span>
                </p>

                {log.details?.comment && (
                  <div className="mt-2 text-xs text-stone-600 bg-stone-50 rounded-lg px-3 py-2 border border-stone-100 leading-relaxed">
                    "{log.details.comment}"
                  </div>
                )}

                {log.details?.note && (
                  <p className="mt-1 text-[10px] text-stone-400 italic">
                    {log.details.note}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
