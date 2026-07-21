import { createFileRoute } from '@tanstack/react-router'
import { AuditDetail } from '@/features/users/audit-detail'

export const Route = createFileRoute('/_authenticated/radicados-api/$radicado')({
  component: AuditDetail,
})
