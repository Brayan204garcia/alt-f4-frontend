'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'

type UserMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'ELIMINAR'

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: UserMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Escribe "${CONFIRM_WORD}" para confirmar.`)
      return
    }

    onOpenChange(false)

    toast.promise(sleep(2000), {
      loading: 'Eliminando auditorias...',
      success: () => {
        setValue('')
        table.resetRowSelection()
        return `Se eliminaron ${selectedRows.length} ${
          selectedRows.length > 1 ? 'auditorias' : 'auditoria'
        }`
      },
      error: 'Error',
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='users-multi-delete-form'
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Eliminar {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'auditorias' : 'auditoria'}
        </span>
      }
      desc={
        <form
          id='users-multi-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Seguro que quieres eliminar las auditorias seleccionadas? <br />
            Esta accion no se puede deshacer.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className=''>Confirma escribiendo "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Escribe "${CONFIRM_WORD}" para confirmar.`}
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Advertencia</AlertTitle>
            <AlertDescription>
              Ten cuidado, esta operacion no se puede revertir.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText='Eliminar'
      destructive
    />
  )
}
