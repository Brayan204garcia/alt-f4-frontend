import { createFileRoute } from '@tanstack/react-router'
import { SettingsDocumentacion } from '@/features/settings/documentacion'

export const Route = createFileRoute(
  '/_authenticated/configuracion/documentacion'
)({
  component: SettingsDocumentacion,
})
