import { createFileRoute } from '@tanstack/react-router'
import { SettingsApiKey } from '@/features/settings/api-key'

export const Route = createFileRoute('/_authenticated/configuracion/clave-api')(
  {
    component: SettingsApiKey,
  }
)
