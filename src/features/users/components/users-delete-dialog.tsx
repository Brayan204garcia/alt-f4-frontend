'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../data/schema'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')

  const handleDelete = () => {
    if (value.trim() !== currentRow.username) return

    onOpenChange(false)
    showSubmittedData(currentRow, 'La siguiente auditoria fue eliminada:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='users-delete-form'
      disabled={value.trim() !== currentRow.username}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Eliminar auditoria
        </span>
      }
      desc={
        <form
          id='users-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Seguro que quieres eliminar{' '}
            <span className='font-bold'>{currentRow.username}</span>?
            <br />
            Esta accion quitara permanentemente la auditoria con severidad{' '}
            <span className='font-bold'>
              {currentRow.role.toUpperCase()}
            </span>{' '}
            del sistema. Esto no se puede deshacer.
          </p>

          <Label className='my-2'>
            Radicado:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Escribe el radicado para confirmar.'
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
