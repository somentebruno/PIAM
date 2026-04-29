import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CardForm } from '@/components/cards/card-form'

export default async function NewCardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'approver') redirect('/dashboard')

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Criação</p>
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Novo card</h1>
        <p className="text-sm text-stone-500 mt-1">
          Preencha os dados e salve como rascunho. O upload de mídia fica disponível após salvar.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <CardForm mode="create" />
      </div>
    </div>
  )
}
