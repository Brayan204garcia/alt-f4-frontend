import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { users } from '../../users/data/users'

const severityStyles = {
  alta: 'border-red-200 bg-red-50 text-red-700',
  media: 'border-amber-200 bg-amber-50 text-amber-700',
  ninguna: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

export function RecentSales() {
  const recentAudits = [...users]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5)

  return (
    <div className='space-y-4'>
      {recentAudits.map((audit) => (
        <div key={audit.id} className='flex items-center gap-3'>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm leading-none font-medium'>
              {audit.firstName} {audit.lastName}
            </p>
            <p className='mt-1 truncate text-xs text-muted-foreground'>
              {audit.username} - {audit.email}
            </p>
          </div>
          <div className='flex flex-col items-end gap-1'>
            <Badge
              variant='outline'
              className={cn('capitalize', severityStyles[audit.role])}
            >
              {audit.role}
            </Badge>
            <span className='text-xs text-muted-foreground capitalize'>
              {audit.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
