import { FilePlus2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function UsersPrimaryButtons() {
  const navigate = useNavigate()

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => navigate({ to: '/auditor-ia' })}>
        <span>Nueva auditoria</span> <FilePlus2 size={18} />
      </Button>
    </div>
  )
}
