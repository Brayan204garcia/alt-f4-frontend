import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type CasoAuditoriaTablaItem, type User } from '../data/schema'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'detail'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: CasoAuditoriaTablaItem | User | null
  setCurrentRow: React.Dispatch<
    React.SetStateAction<CasoAuditoriaTablaItem | User | null>
  >
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<
    CasoAuditoriaTablaItem | User | null
  >(null)

  return (
    <UsersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
