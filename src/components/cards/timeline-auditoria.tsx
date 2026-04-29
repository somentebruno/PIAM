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

const ACTION_MAP: Record<string, { label: string; icon: any; color: string }> = {
  card_created: { label: 'Card criado', icon: PlusCircle, color: 'text-gray-500' },
  submitted_for_approval: { label: 'Enviado para aprovação', icon: Send, color: 'text-blue-500' },
  approved: { label: 'Aprovado', icon: CheckCircle2, color: 'text-emerald-500' },
  approved_with_reservations: { label: 'Aprovado com ressalvas', icon: AlertCircle, color: 'text-amber-500' },
  rejected: { label: 'Reprovado', icon: XCircle, color: 'text-rose-500' },
  media_uploaded: { label: 'Nova mídia enviada', icon: UploadCloud, color: 'text-gray-500' },
  awaiting_approval: { label: 'Retornou para aprovação', icon: ArrowRight, color: 'text-blue-500' },
}

export function TimelineAuditoria({ logs }: Props) {
  if (!logs || logs.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 px-1">Histórico de Atividade</h3>
      
      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-100">
        {logs.map((log) => {
          const config = ACTION_MAP[log.action] || { label: log.action, icon: AlertCircle, color: 'text-gray-400' }
          const Icon = config.icon

          return (
            <div key={log.id} className="relative flex items-start gap-4 animate-in fade-in slide-in-from-left-2">
              <div className={`absolute left-0 w-8 h-8 rounded-full bg-white border-2 border-gray-50 flex items-center justify-center z-10 ${config.color}`}>
                <Icon size={14} />
              </div>
              
              <div className="ml-10 pt-0.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-sm font-medium text-gray-900">{config.label}</span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(log.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mt-0.5">
                  por <span className="font-medium text-gray-700">{log.profiles.name}</span>
                </p>

                {log.details?.comment && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    "{log.details.comment}"
                  </div>
                )}
                
                {log.details?.note && (
                   <p className="mt-1 text-[10px] text-gray-400 italic">
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
