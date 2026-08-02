import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Task } from '../data/schema'

export const tasksColumns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Regla de glosa' />
    ),
    meta: {
      className: 'ps-1 w-full',
      tdClassName: 'ps-4',
    },
    cell: ({ row }) => {
      return <span className='font-medium'>{row.getValue('title')}</span>
    },
  },
]
