import { createFileRoute } from '@tanstack/react-router'
import { SettingsApiKey } from '@/features/settings/api-key'

export const Route = createFileRoute('/_authenticated/settings/api-key')({
  component: SettingsApiKey,
})
