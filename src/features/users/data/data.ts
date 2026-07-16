import { AlertTriangle, CircleCheck, ShieldAlert } from 'lucide-react'
import { type UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  [
    'inconsistente',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
  ['consistente', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['pendiente', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
])

export const roles = [
  {
    label: 'Alta',
    value: 'alta',
    icon: ShieldAlert,
  },
  {
    label: 'Media',
    value: 'media',
    icon: AlertTriangle,
  },
  {
    label: 'Ninguna',
    value: 'ninguna',
    icon: CircleCheck,
  },
] as const
