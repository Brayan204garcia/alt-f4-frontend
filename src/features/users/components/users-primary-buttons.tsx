import { FilePlus2, Send } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useUsers } from './users-provider'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  const navigate = useNavigate()

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('invite')}
      >
        <span>Probar API</span> <Send size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => navigate({ to: '/auditor-ia' })}>
        <span>Nueva auditoria</span> <FilePlus2 size={18} />
      </Button>
    </div>
  )
}
