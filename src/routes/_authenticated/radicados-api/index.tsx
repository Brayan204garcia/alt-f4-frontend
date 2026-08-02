import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Users } from '@/features/users'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  es_consistente: z.array(z.string()).optional().catch([]),
  severidad_maxima: z.array(z.string()).optional().catch([]),
  estado_analisis: z.array(z.string()).optional().catch([]),
  username: z.string().optional().catch(''),
  id: z.string().optional().catch(''),
  status: z.array(z.string()).optional().catch([]),
  role: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/radicados-api/')({
  validateSearch: usersSearchSchema,
  component: Users,
})
