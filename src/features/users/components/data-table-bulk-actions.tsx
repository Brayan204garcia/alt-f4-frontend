import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { CircleCheck, ShieldAlert, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type User } from '../data/schema'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<
    'consistente' | 'inconsistente' | null
  >(null)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'consistente' | 'inconsistente') => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    toast.promise(sleep(2000), {
      loading:
        status === 'consistente'
          ? 'Marcando auditorias como consistentes...'
          : 'Marcando auditorias como inconsistentes...',
      success: () => {
        table.resetRowSelection()
        return `${selectedUsers.length} auditoria${selectedUsers.length > 1 ? 's' : ''} actualizada${selectedUsers.length > 1 ? 's' : ''}`
      },
      error: 'Error actualizando auditorias',
    })
    table.resetRowSelection()
    setPendingStatus(null)
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='auditoria'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setPendingStatus('consistente')}
              className='size-8'
              aria-label='Marcar como consistente'
              title='Marcar como consistente'
            >
              <CircleCheck />
              <span className='sr-only'>Marcar como consistente</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Marcar como consistente</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setPendingStatus('inconsistente')}
              className='size-8'
              aria-label='Marcar como inconsistente'
              title='Marcar como inconsistente'
            >
              <ShieldAlert />
              <span className='sr-only'>Marcar como inconsistente</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Marcar como inconsistente</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Eliminar auditorias seleccionadas'
              title='Eliminar auditorias seleccionadas'
            >
              <Trash2 />
              <span className='sr-only'>Eliminar auditorias seleccionadas</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar auditorias seleccionadas</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />

      <ConfirmDialog
        open={!!pendingStatus}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null)
        }}
        title='Advertencia'
        desc={
          <p>
            Vas a cambiar el estado de {selectedRows.length} auditoria
            {selectedRows.length > 1 ? 's' : ''} a{' '}
            <span className='font-medium'>{pendingStatus}</span>. Esta accion
            actualizara el resultado visible del radicado.
          </p>
        }
        cancelBtnText='Cancelar'
        confirmText='Continuar'
        handleConfirm={() => {
          if (pendingStatus) handleBulkStatusChange(pendingStatus)
        }}
      />
    </>
  )
}
