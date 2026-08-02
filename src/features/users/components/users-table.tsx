import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type CasoAuditoriaTablaItem } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { usersColumns as columns } from './users-columns'

type DataTableProps = {
  data: CasoAuditoriaTablaItem[]
  search: Record<string, unknown>
  navigate: NavigateFn
  onOpenAudit?: (radicado: string) => void
  isLoading?: boolean
  error?: Error | null
  total?: number
  pageCount?: number
}

export function UsersTable({
  data,
  search,
  navigate,
  onOpenAudit,
  isLoading = false,
  error = null,
  pageCount,
}: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Synced with URL states
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'id', searchKey: 'id', type: 'string' },
      { columnId: 'es_consistente', searchKey: 'es_consistente', type: 'array' },
      {
        columnId: 'severidad_maxima',
        searchKey: 'severidad_maxima',
        type: 'array',
      },
      {
        columnId: 'estado_analisis',
        searchKey: 'estado_analisis',
        type: 'array',
      },
    ],
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    manualPagination: true,
    manualFiltering: true,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    if (pageCount && pageCount > 0) {
      ensurePageInRange(pageCount)
    }
  }, [table, ensurePageInRange, pageCount])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Buscar por radicado, paciente o EPS...'
        searchKey='id'
        filters={[
          {
            columnId: 'es_consistente',
            title: 'Consistencia',
            options: [
              { label: 'Consistente', value: 'true' },
              { label: 'Inconsistente', value: 'false' },
            ],
          },
          {
            columnId: 'severidad_maxima',
            title: 'Severidad',
            options: [
              { label: 'Alta', value: 'alta' },
              { label: 'Media', value: 'media' },
              { label: 'Baja', value: 'baja' },
            ],
          },
        ]}
      />

      {error && (
        <Alert variant='destructive' className='my-2'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error al cargar datos</AlertTitle>
          <AlertDescription>
            {error.message ||
              'Ocurrió un error al obtener la lista de casos auditados.'}
          </AlertDescription>
        </Alert>
      )}

      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className='h-6 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn('group/row', onOpenAudit && 'cursor-pointer')}
                  tabIndex={0}
                  onClick={(event) => {
                    const target = event.target as HTMLElement
                    if (
                      target.closest(
                        'button,a,input,[role="checkbox"],[data-row-action],[data-slot="popover-trigger"]'
                      )
                    ) {
                      return
                    }

                    onOpenAudit?.(row.original.id)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      onOpenAudit?.(row.original.id)
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} />
    </div>
  )
}
