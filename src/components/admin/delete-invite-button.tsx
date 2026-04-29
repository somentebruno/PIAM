'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteInviteAction } from '@/actions/invites'
import { Button } from '@/components/ui/button'

type Props = {
  id: string
}

export function DeleteInviteButton({ id }: Props) {
  const [pending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este convite?')) {
      startTransition(async () => {
        await deleteInviteAction(id)
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
      onClick={handleDelete}
      disabled={pending}
    >
      <Trash2 size={16} className={pending ? 'animate-pulse' : ''} />
    </Button>
  )
}
