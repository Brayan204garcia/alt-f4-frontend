import { type ColumnDef } from '@tanstack/react-table'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { formatFechaSegura, sanitizeString } from '../api/casos-api'
import { type CasoAuditoriaTablaItem } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const usersColumns: ColumnDef<CasoAuditoriaTablaItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Seleccionar todo'
        className='translate-y-0.5'
      />
    ),
    meta: {
      className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Seleccionar fila'
        className='translate-y-0.5'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Radicado' />
    ),
    cell: ({ row }) => {
      const item = row.original as unknown as Record<string, unknown>
      const id = sanitizeString(
        row.original.id ||
          (item.radicado as string) ||
          (item.id_caso as string) ||
          '-',
        '-'
      )
      return (
        <LongText className='max-w-36 ps-3 font-mono font-medium'>
          {id}
        </LongText>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'inset-s-6 ps-0.5 max-md:sticky @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    filterFn: (row, id, value: string) => {
      if (!value) return true
      const item = row.original as unknown as Record<string, unknown>
      const val = sanitizeString(
        row.original.id ||
          (item.radicado as string) ||
          (item.id_caso as string) ||
          (row.getValue(id) as string) ||
          ''
      )
      const name = sanitizeString(
        row.original.paciente_nombre ||
          (item.nombre_paciente as string) ||
          (item.paciente as string) ||
          ''
      )
      const eps = sanitizeString(
        row.original.eps ||
          (item.eps_nombre as string) ||
          (item.nombre_eps as string) ||
          ''
      )

      const query = String(value).toLowerCase()
      return (
        val.toLowerCase().includes(query) ||
        name.toLowerCase().includes(query) ||
        eps.toLowerCase().includes(query)
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'fecha_atencion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha' />
    ),
    cell: ({ row }) => {
      const item = row.original as unknown as Record<string, unknown>
      const fechaRaw =
        row.original.fecha_atencion ||
        (item.fecha as string) ||
        (item.fecha_ingreso as string)

      const formatted = formatFechaSegura(fechaRaw)
      return <div className='text-sm text-nowrap'>{formatted}</div>
    },
    enableSorting: true,
  },
  {
    id: 'paciente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Paciente' />
    ),
    cell: ({ row }) => {
      const item = row.original as unknown as Record<string, unknown>
      const pacienteNombre = sanitizeString(
        row.original.paciente_nombre ||
          (item.nombre_paciente as string) ||
          (item.paciente as string) ||
          'Sin nombre',
        'Sin nombre'
      )
      return <LongText className='max-w-48'>{pacienteNombre}</LongText>
    },
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'eps',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='EPS' />
    ),
    cell: ({ row }) => {
      const item = row.original as unknown as Record<string, unknown>
      const epsName = sanitizeString(
        row.original.eps ||
          (item.eps_nombre as string) ||
          (item.nombre_eps as string) ||
          'Sin EPS',
        'Sin EPS'
      )
      return (
        <div className='w-fit text-sm text-nowrap font-medium'>
          {epsName}
        </div>
      )
    },
    filterFn: (row, id, value: string) => {
      if (!value) return true
      const item = row.original as unknown as Record<string, unknown>
      const epsVal = sanitizeString(
        row.original.eps ||
          (item.eps_nombre as string) ||
          (item.nombre_eps as string) ||
          (row.getValue(id) as string) ||
          ''
      )
      return epsVal.toLowerCase().includes(String(value).toLowerCase())
    },
  },
  {
    accessorKey: 'es_consistente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Consistencia' />
    ),
    cell: ({ row }) => {
      const esConsistente = row.original.es_consistente
      if (esConsistente === true) {
        return (
          <Badge
            variant='outline'
            className='border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          >
            Consistente
          </Badge>
        )
      }
      return (
        <Badge
          variant='outline'
          className='border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
        >
          Inconsistente
        </Badge>
      )
    },
    filterFn: (row, id, value: string[]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true
      const isConsistente = String(row.getValue(id))
      return value.includes(isConsistente)
    },
    enableHiding: false,
    enableSorting: true,
  },
  {
    accessorKey: 'severidad_maxima',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Severidad' />
    ),
    cell: ({ row }) => {
      const severidad = row.original.severidad_maxima
      if (severidad === 'alta') {
        return (
          <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
            <AlertCircle size={16} className='text-red-500 shrink-0' />
            <span className='capitalize'>Alta</span>
          </div>
        )
      }
      if (severidad === 'media') {
        return (
          <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
            <AlertTriangle size={16} className='text-amber-500 shrink-0' />
            <span className='capitalize'>Media</span>
          </div>
        )
      }
      if (severidad === 'baja') {
        return (
          <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
            <Info size={16} className='text-blue-500 shrink-0' />
            <span className='capitalize'>Baja</span>
          </div>
        )
      }
      return (
        <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
          <CheckCircle2 size={16} className='text-emerald-500 shrink-0' />
          <span>Sin glosas</span>
        </div>
      )
    },
    filterFn: (row, _id, value: string[]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true
      const severidad = row.original.severidad_maxima
      return severidad ? value.includes(severidad) : false
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
