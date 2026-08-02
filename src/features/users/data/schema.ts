import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('inconsistente'),
  z.literal('consistente'),
  z.literal('pendiente'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('alta'),
  z.literal('media'),
  z.literal('ninguna'),
])

const _userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  status: userStatusSchema,
  role: userRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof _userSchema>

// ==========================================
// Casos Auditados - Interfaces y Esquemas Zod
// ==========================================

export interface ConteoSeveridades {
  alta: number
  media: number
  baja: number
  [key: string]: number
}

export const conteoSeveridadesSchema = z
  .object({
    alta: z.number(),
    media: z.number(),
    baja: z.number(),
  })
  .catchall(z.number())

export type CategoriaGlosa =
  | 'fuga_ingreso'
  | 'soporte'
  | 'pertinencia'
  | 'facturacion'
  | 'identificacion'
  | string

export interface EvidenciaFugaIngreso {
  codigo_cups: string
  descripcion: string
  cantidad_historia: number
  cantidad_prefactura: number
  unidades_faltantes: number
  [key: string]: unknown
}

export interface GlosaItem {
  codigo: string
  categoria: CategoriaGlosa
  referencia_normativa?: string
  severidad: 'alta' | 'media' | 'baja' | string
  campo: string
  descripcion: string
  evidencia?: EvidenciaFugaIngreso | Record<string, any>
}

export interface CruceProcedimientos {
  tipo: 'procedimientos_vs_items'
  codigos_historia: string[]
  codigos_prefactura: string[]
  codigos_sin_soporte: string[]
  codigos_fuga_ingreso: string[]
}

export interface GlosaResumen {
  codigo: string
  categoria: CategoriaGlosa
  referencia_normativa?: string
  severidad: 'alta' | 'media' | 'baja' | string
  campo: string
  descripcion: string
  evidencia?: EvidenciaFugaIngreso | Record<string, any>
}

export const glosaResumenSchema = z.object({
  codigo: z.string(),
  categoria: z.string(),
  referencia_normativa: z.string().optional(),
  severidad: z.string(),
  campo: z.string(),
  descripcion: z.string(),
  evidencia: z.record(z.string(), z.any()).optional(),
})

export type EstadoAnalisisType = 'con_glosa' | 'sin_glosa' | 'con_advertencias' | null
export type SeveridadMaximaType = 'alta' | 'media' | 'baja' | null

export const estadoAnalisisSchema = z
  .enum(['con_glosa', 'sin_glosa', 'con_advertencias'])
  .nullable()

export const severidadMaximaSchema = z
  .enum(['alta', 'media', 'baja'])
  .nullable()

export interface CasoAuditoriaTablaItem {
  id: string
  estado: string
  estado_analisis: EstadoAnalisisType
  es_consistente: boolean
  tiene_glosas: boolean
  total_glosas: number
  total_advertencias: number
  severidad_maxima: SeveridadMaximaType
  conteo_severidades: ConteoSeveridades
  paciente_documento: string | null
  paciente_nombre: string | null
  eps?: string | null
  api?: string | null
  fecha_atencion: string | null
  glosas_resumen: GlosaResumen[]
  error_detalle: string | null
  historia_clinica_json?: Record<string, any> | null
  prefactura_json?: Record<string, any> | null
  resultado_analisis_json?: Record<string, any> | null
  created_at: string
  updated_at: string
}

export const casoAuditoriaTablaItemSchema = z.object({
  id: z.string(),
  estado: z.string(),
  estado_analisis: estadoAnalisisSchema,
  es_consistente: z.boolean(),
  tiene_glosas: z.boolean(),
  total_glosas: z.number(),
  total_advertencias: z.number(),
  severidad_maxima: severidadMaximaSchema,
  conteo_severidades: conteoSeveridadesSchema,
  paciente_documento: z.string().nullable(),
  paciente_nombre: z.string().nullable(),
  eps: z.string().nullable().optional(),
  api: z.string().nullable().optional(),
  fecha_atencion: z.string().nullable(),
  glosas_resumen: z.array(glosaResumenSchema),
  error_detalle: z.string().nullable(),
  historia_clinica_json: z.record(z.string(), z.any()).nullable().optional(),
  prefactura_json: z.record(z.string(), z.any()).nullable().optional(),
  resultado_analisis_json: z.record(z.string(), z.any()).nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export interface PaginatedCasosResponse {
  items: CasoAuditoriaTablaItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export const paginatedCasosResponseSchema = z.object({
  items: z.array(casoAuditoriaTablaItemSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
  total_pages: z.number(),
  has_next: z.boolean(),
  has_prev: z.boolean(),
})
