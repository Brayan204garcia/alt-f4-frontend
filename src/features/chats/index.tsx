import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  BrainCircuit,
  ChevronDown,
  ClipboardCheck,
  FileSearch,
  FileText,
  HelpCircle,
  LoaderCircle,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  UploadCloud,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { toast } from 'sonner'
import { AdvertenciaCard, ClinicalDocumentCardV2, InvoiceDocumentCard } from './components/document-cards'
import { AuditResultModal } from './components/audit-result-modal'
import { API_BASE_URL } from '@/config/api'

type DetectionLevel = 'Alta' | 'Media' | 'Baja'

type BackendGlosaEvidencia = {
  codigo_cups?: string
  sexo_paciente?: string
  sexo_permitido?: string
  fuente_sexo_paciente?: string
  fuente_cups?: string
  [key: string]: unknown
}

type Detection = {
  id: string
  title: string
  level: DetectionLevel
  probability: number
  category: string
  evidence: string
  recommendation: string
  codigo?: string
  campo?: string
  referenciaNormativa?: string
  evidenciaDetalle?: BackendGlosaEvidencia
}

type AuditRule = {
  id: string
  title: string
  category: string
  level: DetectionLevel
  probability: number
  invoiceTerms: string[]
  clinicalTerms: string[]
  missingEvidence: string
  recommendation: string
}

type DocumentKind = 'clinical' | 'invoice'

type PdfVisualLine = {
  text: string
  variant?: 'meta' | 'title' | 'section' | 'muted' | 'amount'
  finding?: boolean
}

type PdfUploadState = {
  fileName: string
  isLoading: boolean
  error: string
  message: string
  lines: PdfVisualLine[]
  clinicalView?: ClinicalDocumentView
  invoiceView?: InvoiceDocumentView
}

type PdfApiResponse = {
  id?: string
  caso_id?: string
  status?: string
  estado?: string
  filename?: string
  tipo_solicitado?: string
  tipo_detectado?: string
  data?: Record<string, unknown>
  error_detail?: unknown
  detail?: unknown
}

type CaseApiResponse = {
  id?: string
  caso_id?: string
  estado?: string
  status?: string
  historia_clinica_json?: Record<string, unknown>
  prefactura_json?: Record<string, unknown>
  resultado_analisis_json?: AnalysisApiResult
  error_detail?: unknown
  detail?: unknown
}

type BackendResumen = {
  total_glosas?: number
  total_advertencias?: number
  total_cruces?: number
}

type ClasificacionML = {
  clasificacion?: 'CONSISTENTE' | 'INCONSISTENTE' | null
  probabilidad_inconsistencia?: number | null
  punto_operacion?: string | null
  umbral_usado?: number | null
  alerta_cierta?: boolean
  condiciones_activas?: string[]
  explicaciones?: string[]
  features_utilizadas?: Record<string, unknown> | null
  advertencias_derivacion?: string[]
  error?: string | null
}

type AnalysisApiResult = {
  schema_version?: string
  norma_referencia?: string
  estado?: string
  resumen?: BackendResumen
  glosas?: unknown[]
  advertencias?: unknown[]
  clasificacion_ml?: ClasificacionML
  es_consistente?: boolean
  tiene_glosas?: boolean
  total_glosas?: number
}

type AnalysisState = {
  isLoading: boolean
  error: string
  message: string
  warnings: string[]
  summary: string
}

type ClinicalDocumentView = {
  idAtencion: string
  idPaciente: string
  nombrePaciente: string
  documentoPaciente: string
  sexoPaciente: string
  fechaAtencion: string
  tipoAtencion: string
  diagnosticoPrincipalCie10: string
  descripcionDiagnostico: string
  medicoTratante: string
  sede: string
  epsAtencion: string
  tipoDocumento: string
  tipoAfiliacion: string
  ciudad: string
  codigoCups: string
  tipoItem: string
  descripcion: string
  cantidadRealizada: string
  fechaRegistro: string
  soporteClinico: string
  profesionalResponsable: string
  evolucion: string
  observaciones: string
  procedimientos: ClinicalProcedureView[]
  camposObligatoriosFaltantes: string[]
  requiereRevisionHumana: string
  sections: ClinicalDocumentSection[]
}

type ClinicalProcedureView = {
  id: string
  tipo: string
  cups: string
  descripcion: string
  cantidad: string
  soporte: string
}

type ClinicalDocumentSection = {
  title: string
  fields: ClinicalDocumentField[]
}

type ClinicalDocumentField = {
  label: string
  value: string
}

type InvoiceDocumentView = {
  idPrefactura: string
  idAtencion: string
  idPaciente: string
  nombrePaciente: string
  documentoPaciente: string
  tipoDocumento: string
  eps: string
  regimen: string
  fechaFacturacion: string
  periodoServicio: string
  prestador: string
  nitPrestador: string
  sede: string
  ciudad: string
  contrato: string
  plan: string
  autorizacion: string
  items: InvoiceItemView[]
  subtotal: string
  copago: string
  descuento: string
  impuestos: string
  total: string
  camposObligatoriosFaltantes: string[]
  requiereRevisionHumana: string
  sections: ClinicalDocumentSection[]
}

type InvoiceItemView = {
  id: string
  codigo: string
  descripcion: string
  cantidad: string
  valorUnitario: string
  valorTotal: string
}

const CLINICAL_PDF_ENDPOINT = `${API_BASE_URL}/api/v1/historias-clinicas/pdf`
const PDF_RESULT_ENDPOINT = `${API_BASE_URL}/api/v1/historias-clinicas/pdf`
const getCaseEndpoint = (caseId: string) =>
  `${API_BASE_URL}/api/v1/casos/${caseId}`
const getCaseInvoicePdfEndpoint = (caseId: string) =>
  `${API_BASE_URL}/api/v1/casos/${caseId}/prefactura/pdf`
const getCaseAnalyzeEndpoint = (
  caseId: string,
  puntoOperacion: 'recomendado' | 'comprometido' = 'recomendado'
) =>
  `${API_BASE_URL}/api/v1/casos/${caseId}/analizar?punto_operacion=${puntoOperacion}`
const MAX_PDF_BYTES = 25 * 1024 * 1024
const PDF_POLL_INTERVAL_MS = 2500
const PDF_MAX_POLL_ATTEMPTS = 120
const DEFAULT_FETCH_TIMEOUT_MS = 60000
const CASE_ERROR_STATES = new Set(['error', 'fallido'])

const sampleClinicalRecord = `Paciente femenino de 62 anos.
Ingreso: 10/07/2026. Egreso: 12/07/2026.
Diagnostico: neumonia adquirida en comunidad.
Evolucion: manejo en hospitalizacion general, oxigeno por canula nasal, ceftriaxona 1 g cada 24 horas y terapia respiratoria.
Soportes: hemograma, radiografia de torax y valoracion por medicina interna.
No se documentan servicios de alta complejidad, estudios avanzados, intervenciones quirurgicas ni terapias especiales.`

const samplePreinvoice = `Prefactura ALT-F4-SIC.
Estancia hospitalaria general x 2 dias.
Unidad de cuidados intensivos UCI x 1 dia.
Ceftriaxona 1 g x 3 dosis.
Terapia respiratoria x 2 sesiones.
Resonancia magnetica de torax.
Medicamento alto costo: pembrolizumab 200 mg.
Honorarios cirugia menor.
Interconsulta cardiologia.`

const auditRules: AuditRule[] = [
  {
    id: 'uci-without-support',
    title: 'Estancia UCI facturada sin soporte clinico',
    category: 'Pertinencia',
    level: 'Alta',
    probability: 92,
    invoiceTerms: ['uci', 'unidad de cuidados intensivos'],
    clinicalTerms: ['uci', 'unidad de cuidados intensivos', 'cuidado intensivo'],
    missingEvidence:
      'La prefactura incluye UCI, pero la historia no documenta estancia o indicacion de cuidado intensivo.',
    recommendation:
      'Solicitar soporte de ingreso, evolucion y orden medica de UCI antes de autorizar el item.',
  },
  {
    id: 'high-cost-drug',
    title: 'Medicamento de alto costo sin trazabilidad completa',
    category: 'Medicamentos',
    level: 'Alta',
    probability: 88,
    invoiceTerms: ['pembrolizumab', 'rituximab', 'alto costo', 'infliximab'],
    clinicalTerms: [
      'pembrolizumab',
      'rituximab',
      'infliximab',
      'administrado',
      'orden medica',
    ],
    missingEvidence:
      'Se encontro medicamento de alto costo en prefactura sin registro equivalente en la historia clinica.',
    recommendation:
      'Validar orden, administracion, lote, dosis y pertinencia frente al diagnostico.',
  },
  {
    id: 'procedure-not-found',
    title: 'Procedimiento facturado no encontrado en historia',
    category: 'Soportes',
    level: 'Alta',
    probability: 84,
    invoiceTerms: [
      'cirugia',
      'procedimiento',
      'resonancia',
      'tomografia',
      'endoscopia',
    ],
    clinicalTerms: [
      'cirugia',
      'procedimiento',
      'resonancia',
      'tomografia',
      'endoscopia',
      'reporte',
    ],
    missingEvidence:
      'La prefactura registra procedimiento o ayuda diagnostica sin reporte clinico asociado.',
    recommendation:
      'Cruzar con nota operatoria, informe diagnostico y autorizacion del servicio.',
  },
  {
    id: 'therapy-overuse',
    title: 'Cantidad de terapias superior a la evidencia clinica',
    category: 'Frecuencia',
    level: 'Media',
    probability: 73,
    invoiceTerms: [
      'terapia respiratoria x 3',
      'terapia respiratoria x 4',
      'terapia fisica x 3',
      'terapia fisica x 4',
    ],
    clinicalTerms: [
      'terapia respiratoria x 3',
      'terapia respiratoria x 4',
      'terapia fisica x 3',
      'terapia fisica x 4',
    ],
    missingEvidence:
      'La cantidad facturada supera lo que aparece descrito como sesiones soportadas.',
    recommendation:
      'Comparar sesiones diarias firmadas contra cantidad cobrada y ajustar excedentes.',
  },
  {
    id: 'diagnosis-mismatch',
    title: 'Servicio facturado con baja relacion diagnostica',
    category: 'Coherencia',
    level: 'Media',
    probability: 69,
    invoiceTerms: ['cardiologia', 'neurologia', 'oncologia', 'traumatologia'],
    clinicalTerms: ['cardiologia', 'neurologia', 'oncologia', 'traumatologia'],
    missingEvidence:
      'El servicio facturado no se conecta claramente con el diagnostico principal documentado.',
    recommendation:
      'Revisar interconsulta, justificacion medica y autorizacion por especialidad.',
  },
]

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function hasAnyTerm(source: string, terms: string[]) {
  return terms.some((term) => source.includes(normalizeText(term)))
}

function calculateProbability(
  rule: AuditRule,
  clinicalText: string,
  invoiceText: string
) {
  const invoiceDensity = rule.invoiceTerms.filter((term) =>
    invoiceText.includes(normalizeText(term))
  ).length
  const clinicalDensity = rule.clinicalTerms.filter((term) =>
    clinicalText.includes(normalizeText(term))
  ).length
  const score = rule.probability + invoiceDensity * 3 - clinicalDensity * 5

  return Math.min(97, Math.max(51, score))
}

function getLevelStyles(level: DetectionLevel) {
  if (level === 'Alta') {
    return {
      badge:
        'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
      bar: 'bg-red-500',
    }
  }

  if (level === 'Media') {
    return {
      badge:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
      bar: 'bg-amber-500',
    }
  }

  return {
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
    bar: 'bg-emerald-500',
  }
}

function runAudit(clinicalRecord: string, preinvoice: string): Detection[] {
  const clinicalText = normalizeText(clinicalRecord)
  const invoiceText = normalizeText(preinvoice)

  const detected: Detection[] = auditRules
    .filter((rule) => {
      const appearsInInvoice = hasAnyTerm(invoiceText, rule.invoiceTerms)
      const appearsInClinicalRecord = hasAnyTerm(
        clinicalText,
        rule.clinicalTerms
      )

      return appearsInInvoice && !appearsInClinicalRecord
    })
    .map((rule) => ({
      id: rule.id,
      title: rule.title,
      level: rule.level,
      probability: calculateProbability(rule, clinicalText, invoiceText),
      category: rule.category,
      evidence: rule.missingEvidence,
      recommendation: rule.recommendation,
    }))

  // Extraer el sexo registrado explícitamente desde el JSON / Historia clínica (sin inferir por nombres)
  const sexMatch =
    clinicalRecord.match(/"sexo"\s*:\s*"([a-z]+)"/i) ||
    clinicalRecord.match(/sexo\s*:\s*([a-z]+)/i) ||
    clinicalRecord.match(/sexo\s+([a-z]+)/i) ||
    preinvoice.match(/"sexo"\s*:\s*"([a-z]+)"/i) ||
    preinvoice.match(/sexo\s*:\s*([a-z]+)/i)

  let explicitSex = sexMatch ? sexMatch[1].toUpperCase() : ''
  if (!explicitSex) {
    if (
      clinicalText.includes('"sexo": "m"') ||
      clinicalText.includes('sexo: m') ||
      clinicalText.includes('sexo m') ||
      clinicalText.includes('masculino')
    ) {
      explicitSex = 'M'
    } else if (
      clinicalText.includes('"sexo": "f"') ||
      clinicalText.includes('sexo: f') ||
      clinicalText.includes('sexo f') ||
      clinicalText.includes('femenino')
    ) {
      explicitSex = 'F'
    }
  }

  const isExplicitMale = explicitSex === 'M' || explicitSex === 'MASCULINO'
  const isExplicitFemale = explicitSex === 'F' || explicitSex === 'FEMENINO'

  const hasFemaleProcedureInInvoice =
    invoiceText.includes('659510') ||
    invoiceText.includes('torsion de ovario')

  const hasFemaleProcedureInClinical =
    clinicalText.includes('659510') ||
    clinicalText.includes('torsion de ovario') ||
    clinicalText.includes('ovario')

  const hasFemaleProcedure =
    hasFemaleProcedureInInvoice || hasFemaleProcedureInClinical

  if (isExplicitMale && hasFemaleProcedure) {
    const isFromInvoice = hasFemaleProcedureInInvoice
    const campo = isFromInvoice
      ? 'prefactura.items_facturados[0].codigo_cups_facturado'
      : 'historia_clinica.procedimientos[0].codigo_cups'

    detected.unshift({
      id: 'cups-659510-sex-mismatch',
      title: 'Pertinencia por Género',
      level: 'Alta',
      probability: 98,
      category: 'pertinencia',
      evidence:
        'El CUPS 659510 aplica para sexo F y el paciente registra sexo M.',
      recommendation: `Recomendación a IPS: Verificar la pertinencia biológica del procedimiento antes de la radicación para prevenir glosa por improcedencia biológica (Código: CUPS No Pertinente por Sexo - Campo: ${campo}).`,
      codigo: 'CUPS_NO_PERTINENTE_POR_SEXO',
      campo,
      referenciaNormativa: 'Resolución 3047 de 2008',
      evidenciaDetalle: {
        codigo_cups: '659510',
        sexo_paciente: 'M',
        sexo_permitido: 'F',
        fuente_sexo_paciente: 'historia_clinica.paciente.sexo',
        fuente_cups: 'Catálogo CUPS',
      },
    })
  }

  const hasMaleProcedureInInvoice =
    invoiceText.includes('prostata') || invoiceText.includes('vasectomia')

  const hasMaleProcedureInClinical =
    clinicalText.includes('prostata') || clinicalText.includes('vasectomia')

  const hasMaleProcedure =
    hasMaleProcedureInInvoice || hasMaleProcedureInClinical

  if (isExplicitFemale && hasMaleProcedure) {
    const isFromInvoice = hasMaleProcedureInInvoice
    const campo = isFromInvoice
      ? 'prefactura.items_facturados[0].codigo_cups_facturado'
      : 'historia_clinica.procedimientos[0].codigo_cups'

    detected.unshift({
      id: 'cups-male-sex-mismatch',
      title: 'Pertinencia por Género',
      level: 'Alta',
      probability: 98,
      category: 'pertinencia',
      evidence:
        'El CUPS registrado o facturado aplica para sexo M y el paciente registra sexo F.',
      recommendation: `Recomendación a IPS: Verificar la pertinencia biológica del procedimiento antes de la radicación para prevenir glosa por improcedencia biológica (Código: CUPS No Pertinente por Sexo - Campo: ${campo}).`,
      codigo: 'CUPS_NO_PERTINENTE_POR_SEXO',
      campo,
      referenciaNormativa: 'Resolución 3047 de 2008',
      evidenciaDetalle: {
        codigo_cups: '601201',
        sexo_paciente: 'F',
        sexo_permitido: 'M',
        fuente_sexo_paciente: 'historia_clinica.paciente.sexo',
        fuente_cups: 'Catálogo CUPS',
      },
    })
  }

  return detected.sort((a, b) => b.probability - a.probability)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function formatFieldLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'No reportado'
  }

  if (typeof value === 'boolean') return value ? 'Si' : 'No'
  if (typeof value === 'number') return Number.isFinite(value) ? `${value}` : ''

  if (Array.isArray(value)) {
    if (value.length === 0) return 'Sin registros'

    return value
      .map((item) => (isRecord(item) ? summarizeRecord(item) : formatValue(item)))
      .join(' | ')
  }

  if (isRecord(value)) return summarizeRecord(value)

  return String(value)
}

function formatCurrencyValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'No reportado'
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (typeof value === 'string') {
    const normalizedValue = value.replace(/[^\d,-]/g, '').replace(',', '.')
    const numericValue = Number(normalizedValue)

    if (Number.isFinite(numericValue) && normalizedValue.length > 0) {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(numericValue)
    }
  }

  return formatValue(value)
}

function summarizeRecord(record: Record<string, unknown>) {
  const entries = Object.entries(record).filter(
    ([, value]) => value !== null && value !== undefined && value !== ''
  )

  if (entries.length === 0) return 'Sin datos'

  return entries
    .slice(0, 4)
    .map(([key, value]) => `${formatFieldLabel(key)}: ${formatValue(value)}`)
    .join(' - ')
}

function getNestedValue(source: unknown, path: string) {
  return path.split('.').reduce<unknown>((current, key) => {
    if (Array.isArray(current) && /^\d+$/.test(key)) {
      return current[Number(key)]
    }

    if (!isRecord(current)) return undefined
    return current[key]
  }, source)
}

function getValueFromPaths(source: unknown, paths: string[]) {
  for (const path of paths) {
    const value = getNestedValue(source, path)
    if (value !== null && value !== undefined && value !== '') {
      return value
    }
  }

  return undefined
}

function getStringFromPaths(source: unknown, paths: string[]) {
  const value = getValueFromPaths(source, paths)

  return formatValue(value)
}

function getCurrencyFromPaths(source: unknown, paths: string[]) {
  const value = getValueFromPaths(source, paths)

  return formatCurrencyValue(value)
}

function getFirstRecordFromPaths(source: unknown, paths: string[]) {
  for (const path of paths) {
    const value = getNestedValue(source, path)

    if (Array.isArray(value)) {
      const firstRecord = value.find(isRecord)
      if (firstRecord) return firstRecord
    }

    if (isRecord(value)) return value
  }

  return {}
}

function getRecordsFromPaths(source: unknown, paths: string[]) {
  for (const path of paths) {
    const value = getNestedValue(source, path)

    if (Array.isArray(value)) return value.filter(isRecord)
    if (isRecord(value)) return [value]
  }

  return []
}

function getStringArrayFromPaths(source: unknown, paths: string[]) {
  for (const path of paths) {
    const value = getNestedValue(source, path)

    if (Array.isArray(value)) {
      return value
        .filter((item) => item !== null && item !== undefined && item !== '')
        .map(formatValue)
    }

    if (value !== null && value !== undefined && value !== '') {
      return [formatValue(value)]
    }
  }

  return []
}

function collectClinicalFields(
  value: unknown,
  prefix = ''
): ClinicalDocumentField[] {
  if (value === null || value === undefined || value === '') return []

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectClinicalFields(item, `${prefix} ${index + 1}`.trim())
    )
  }

  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, entryValue]) =>
      collectClinicalFields(
        entryValue,
        prefix ? `${prefix} / ${formatFieldLabel(key)}` : formatFieldLabel(key)
      )
    )
  }

  return [
    {
      label: prefix || 'Dato',
      value: formatValue(value),
    },
  ]
}

function buildClinicalSections(data: Record<string, unknown>) {
  const sections: ClinicalDocumentSection[] = []

  const sectionSources: Array<[string, unknown]> = [
    ['Paciente', data.paciente],
    ['Historia clínica', data.historia_clinica],
    ['Calidad de extracción', data.calidad_extraccion],
  ]

  sectionSources.forEach(([title, value]) => {
    const fields = collectClinicalFields(value)
    if (fields.length > 0) sections.push({ title, fields })
  })

  Object.entries(data).forEach(([key, value]) => {
    if (
      [
        'schema_version',
        'tipo_detectado',
        'confianza_tipo',
        'paciente',
        'historia_clinica',
        'prefactura',
        'calidad_extraccion',
      ].includes(key)
    ) {
      return
    }

    const fields = collectClinicalFields(value)
    if (fields.length > 0) {
      sections.push({ title: formatFieldLabel(key), fields })
    }
  })

  return sections
}

function buildInvoiceSections(data: Record<string, unknown>) {
  const sections: ClinicalDocumentSection[] = []

  const sectionSources: Array<[string, unknown]> = [
    ['Paciente', data.paciente],
    ['Prefactura', data.prefactura],
    ['Calidad de extraccion', data.calidad_extraccion],
  ]

  sectionSources.forEach(([title, value]) => {
    const fields = collectClinicalFields(value)
    if (fields.length > 0) sections.push({ title, fields })
  })

  Object.entries(data).forEach(([key, value]) => {
    if (
      [
        'schema_version',
        'tipo_detectado',
        'confianza_tipo',
        'paciente',
        'historia_clinica',
        'prefactura',
        'calidad_extraccion',
      ].includes(key)
    ) {
      return
    }

    const fields = collectClinicalFields(value)
    if (fields.length > 0) {
      sections.push({ title: formatFieldLabel(key), fields })
    }
  })

  return sections
}

function buildClinicalDocumentView(response: PdfApiResponse): ClinicalDocumentView {
  const data = response.data ?? {}
  const clinical = isRecord(data.historia_clinica) ? data.historia_clinica : {}
  const patient = isRecord(data.paciente) ? data.paciente : {}
  const diagnosis = getFirstRecordFromPaths(data, [
    'historia_clinica.diagnostico_principal',
    'historia_clinica.diagnosticos.0',
    'diagnostico_principal',
    'diagnosticos.0',
  ])
  const activity = getFirstRecordFromPaths(data, [
    'historia_clinica.procedimientos.0',
    'historia_clinica.actividades.0',
    'historia_clinica.servicios.0',
    'procedimientos.0',
    'actividades.0',
    'servicios.0',
  ])
  const procedureRecords = getRecordsFromPaths(data, [
    'historia_clinica.procedimientos',
    'historia_clinica.actividades',
    'historia_clinica.servicios',
    'procedimientos',
    'actividades',
    'servicios',
  ])
  const procedimientos = procedureRecords.map((procedure) => ({
    id: getStringFromPaths({ procedure }, [
      'procedure.id',
      'procedure.id_detalle',
      'procedure.codigo_detalle',
    ]),
    tipo: getStringFromPaths({ procedure }, [
      'procedure.tipo',
      'procedure.tipo_item',
      'procedure.categoria',
    ]),
    cups: getStringFromPaths({ procedure }, [
      'procedure.cups',
      'procedure.codigo_cups',
      'procedure.codigo',
    ]),
    descripcion: getStringFromPaths({ procedure }, [
      'procedure.descripcion',
      'procedure.nombre',
      'procedure.procedimiento',
      'procedure.actividad',
    ]),
    cantidad: getStringFromPaths({ procedure }, [
      'procedure.cantidad',
      'procedure.cantidad_realizada',
    ]),
    soporte: getStringFromPaths({ procedure }, [
      'procedure.soporte',
      'procedure.soporte_clinico',
    ]),
  }))

  return {
    idAtencion: getStringFromPaths(data, [
      'historia_clinica.id_atencion',
      'historia_clinica.numero_atencion',
      'historia_clinica.consecutivo',
      'id_atencion',
      'numero_atencion',
    ]),
    idPaciente: getStringFromPaths({ patient, data }, [
      'patient.id_paciente',
      'patient.codigo_paciente',
      'patient.documento',
      'patient.documento_paciente',
      'data.documento_paciente',
    ]),
    nombrePaciente: getStringFromPaths({ patient, data }, [
      'patient.nombre_completo',
      'patient.nombre',
      'patient.nombres',
      'patient.nombre_paciente',
      'data.nombre_paciente',
    ]),
    documentoPaciente: getStringFromPaths({ patient, data }, [
      'patient.documento',
      'patient.documento_paciente',
      'patient.numero_documento',
      'data.documento_paciente',
      'data.documento',
    ]),
    sexoPaciente: getStringFromPaths({ patient, clinical, data }, [
      'patient.sexo',
      'patient.genero',
      'historia_clinica.paciente.sexo',
      'historia_clinica.sexo',
      'data.sexo_paciente',
      'data.sexo',
      'data.genero',
    ]),
    fechaAtencion: getStringFromPaths({ clinical, data }, [
      'clinical.fecha_atencion',
      'clinical.fecha_ingreso',
      'data.fecha_atencion',
      'data.fecha_ingreso',
    ]),
    tipoAtencion: getStringFromPaths({ clinical, data }, [
      'clinical.tipo_atencion',
      'clinical.servicio',
      'clinical.modalidad_atencion',
      'data.tipo_atencion',
    ]),
    diagnosticoPrincipalCie10: getStringFromPaths({ diagnosis, clinical, data }, [
      'diagnosis.codigo',
      'diagnosis.cie10',
      'diagnosis.codigo_cie10',
      'clinical.diagnostico_principal_codigo',
      'clinical.diagnostico_principal_cie10',
      'data.diagnostico_principal',
    ]),
    descripcionDiagnostico: getStringFromPaths({ diagnosis, clinical, data }, [
      'diagnosis.descripcion',
      'diagnosis.nombre',
      'diagnosis.diagnostico',
      'clinical.diagnostico_principal_descripcion',
      'clinical.descripcion_diagnostico',
      'clinical.diagnostico_principal',
    ]),
    medicoTratante: getStringFromPaths({ clinical, data }, [
      'clinical.medico_tratante',
      'clinical.profesional_tratante',
      'data.profesional_tratante',
      'data.medico_tratante',
    ]),
    sede: getStringFromPaths({ clinical, data }, [
      'clinical.sede',
      'clinical.institucion',
      'data.sede',
      'data.institucion',
    ]),
    epsAtencion: getStringFromPaths({ patient, clinical, data }, [
      'patient.eps',
      'patient.eps_atencion',
      'clinical.eps',
      'data.eps',
    ]),
    tipoDocumento: getStringFromPaths({ patient, data }, [
      'patient.tipo_documento',
      'data.tipo_documento',
    ]),
    tipoAfiliacion: getStringFromPaths({ patient, clinical, data }, [
      'patient.regimen',
      'patient.tipo_afiliacion',
      'clinical.regimen',
      'data.regimen',
    ]),
    ciudad: getStringFromPaths({ clinical, patient, data }, [
      'clinical.ciudad',
      'patient.ciudad',
      'data.ciudad',
    ]),
    codigoCups: getStringFromPaths({ activity, data }, [
      'activity.cups',
      'activity.codigo_cups',
      'activity.codigo',
      'data.procedimientos.0.cups',
    ]),
    tipoItem: getStringFromPaths({ activity }, [
      'activity.tipo',
      'activity.tipo_item',
      'activity.categoria',
    ]),
    descripcion: getStringFromPaths({ activity }, [
      'activity.descripcion',
      'activity.nombre',
      'activity.procedimiento',
      'activity.actividad',
    ]),
    cantidadRealizada: getStringFromPaths({ activity }, [
      'activity.cantidad',
      'activity.cantidad_realizada',
    ]),
    fechaRegistro: getStringFromPaths({ activity, clinical, data }, [
      'activity.fecha',
      'activity.fecha_registro',
      'clinical.fecha_registro',
      'clinical.fecha_atencion',
      'data.fecha_atencion',
    ]),
    soporteClinico: getStringFromPaths({ activity, clinical }, [
      'activity.soporte_clinico',
      'activity.soporte',
      'clinical.soporte_clinico',
    ]),
    profesionalResponsable: getStringFromPaths({ activity, clinical, data }, [
      'activity.profesional_responsable',
      'clinical.profesional_responsable',
      'clinical.profesional_tratante',
      'data.profesional_tratante',
    ]),
    evolucion: getStringFromPaths({ clinical, data }, [
      'clinical.evolucion',
      'clinical.resumen_evolucion',
      'data.evolucion',
    ]),
    observaciones: getStringFromPaths({ clinical, data }, [
      'clinical.observaciones',
      'clinical.antecedentes',
      'clinical.notas',
      'data.observaciones',
    ]),
    procedimientos,
    camposObligatoriosFaltantes: getStringArrayFromPaths(data, [
      'calidad_extraccion.campos_obligatorios_faltantes',
      'campos_obligatorios_faltantes',
    ]),
    requiereRevisionHumana: getStringFromPaths(data, [
      'calidad_extraccion.requiere_revision_humana',
      'requiere_revision_humana',
    ]),
    sections: buildClinicalSections(data),
  }
}

function buildInvoiceDocumentView(response: PdfApiResponse): InvoiceDocumentView {
  const data = response.data ?? {}
  const invoice = isRecord(data.prefactura) ? data.prefactura : {}
  const patient = isRecord(data.paciente) ? data.paciente : {}
  const itemRecords = getRecordsFromPaths(data, [
    'prefactura.items_facturados',
    'prefactura.itemsFacturados',
    'prefactura.detalles',
    'prefactura.items',
    'prefactura.servicios',
    'prefactura.cargos',
    'items_facturados',
    'itemsFacturados',
    'detalles',
    'items',
    'servicios',
    'cargos',
  ])
  const items = itemRecords.map((item) => ({
    id: getStringFromPaths({ item }, [
      'item.id',
      'item.id_detalle',
      'item.id_prefactura_detalle',
      'item.consecutivo',
    ]),
    codigo: getStringFromPaths({ item }, [
      'item.codigo_cups_facturado',
      'item.codigoCupsFacturado',
      'item.codigo_cups',
      'item.cups',
      'item.codigo',
    ]),
    descripcion: getStringFromPaths({ item }, [
      'item.descripcion_servicio_facturado',
      'item.descripcionServicioFacturado',
      'item.descripcion',
      'item.servicio',
      'item.nombre',
    ]),
    cantidad: getStringFromPaths({ item }, [
      'item.cantidad_facturada',
      'item.cantidadFacturada',
      'item.cantidad',
      'item.unidades',
    ]),
    valorUnitario: getStringFromPaths({ item }, [
      'item.valor_unitario',
      'item.valor_unitario_facturado',
      'item.valorUnitario',
      'item.valorUnitarioFacturado',
      'item.tarifa',
    ]),
    valorTotal: getStringFromPaths({ item }, [
      'item.valor_total',
      'item.valorTotal',
      'item.total',
      'item.valor',
    ]),
  }))
  const fallbackItem: InvoiceItemView = {
    id: getStringFromPaths({ invoice, data }, [
      'invoice.id_detalle',
      'invoice.id_prefactura_detalle',
      'data.id_detalle',
    ]),
    codigo: getStringFromPaths({ invoice, data }, [
      'invoice.codigo_cups_facturado',
      'invoice.codigoCupsFacturado',
      'invoice.codigo_cups',
      'invoice.cups',
      'data.codigo_cups_facturado',
      'data.codigoCupsFacturado',
    ]),
    descripcion: getStringFromPaths({ invoice, data }, [
      'invoice.descripcion_servicio_facturado',
      'invoice.descripcionServicioFacturado',
      'invoice.descripcion',
      'invoice.servicio',
      'data.descripcion_servicio_facturado',
      'data.descripcionServicioFacturado',
    ]),
    cantidad: getStringFromPaths({ invoice, data }, [
      'invoice.cantidad_facturada',
      'invoice.cantidadFacturada',
      'invoice.cantidad',
      'data.cantidad_facturada',
      'data.cantidadFacturada',
    ]),
    valorUnitario: getStringFromPaths({ invoice, data }, [
      'invoice.valor_unitario',
      'invoice.valorUnitario',
      'data.valor_unitario',
      'data.valorUnitario',
    ]),
    valorTotal: getStringFromPaths({ invoice, data }, [
      'invoice.valor_total',
      'invoice.valorTotal',
      'invoice.total',
      'data.valor_total',
      'data.valorTotal',
    ]),
  }
  const renderedItems = items.length > 0 ? items : [fallbackItem]
  const firstItemTotal = renderedItems.find(
    (item) => item.valorTotal !== 'No reportado'
  )?.valorTotal

  return {
    idPrefactura: getStringFromPaths({ invoice, data }, [
      'invoice.id_prefactura',
      'invoice.numero_prefactura',
      'invoice.prefactura',
      'data.id_prefactura',
    ]),
    idAtencion: getStringFromPaths({ invoice, data }, [
      'invoice.id_atencion',
      'invoice.numero_atencion',
      'data.id_atencion',
    ]),
    idPaciente: getStringFromPaths({ patient, invoice, data }, [
      'patient.id_paciente',
      'patient.codigo_paciente',
      'invoice.id_paciente',
      'data.id_paciente',
    ]),
    nombrePaciente: getStringFromPaths({ patient, invoice, data }, [
      'patient.nombre_completo',
      'patient.nombre',
      'patient.nombre_paciente',
      'invoice.nombre_paciente',
      'data.nombre_paciente',
    ]),
    documentoPaciente: getStringFromPaths({ patient, invoice, data }, [
      'patient.documento',
      'patient.documento_paciente',
      'patient.numero_documento',
      'invoice.documento_paciente',
      'data.documento_paciente',
    ]),
    tipoDocumento: getStringFromPaths({ patient, invoice, data }, [
      'patient.tipo_documento',
      'invoice.tipo_documento',
      'data.tipo_documento',
    ]),
    eps: getStringFromPaths({ patient, invoice, data }, [
      'invoice.eps',
      'patient.eps',
      'data.eps',
    ]),
    regimen: getStringFromPaths({ patient, invoice, data }, [
      'patient.regimen',
      'patient.tipo_afiliacion',
      'invoice.regimen',
      'invoice.tipo_afiliacion',
      'data.regimen',
    ]),
    fechaFacturacion: getStringFromPaths({ invoice, data }, [
      'invoice.fecha_facturacion',
      'invoice.fecha_emision',
      'invoice.fecha',
      'data.fecha_facturacion',
    ]),
    periodoServicio: getStringFromPaths({ invoice, data }, [
      'invoice.periodo_servicio',
      'invoice.fecha_servicio',
      'invoice.fecha_atencion',
      'data.periodo_servicio',
    ]),
    prestador: getStringFromPaths({ invoice, data }, [
      'invoice.prestador',
      'invoice.ips',
      'invoice.institucion',
      'data.prestador',
    ]),
    nitPrestador: getStringFromPaths({ invoice, data }, [
      'invoice.nit_prestador',
      'invoice.nit',
      'data.nit_prestador',
    ]),
    sede: getStringFromPaths({ invoice, data }, [
      'invoice.sede',
      'data.sede',
    ]),
    ciudad: getStringFromPaths({ invoice, patient, data }, [
      'invoice.ciudad',
      'patient.ciudad',
      'data.ciudad',
    ]),
    contrato: getStringFromPaths({ invoice, data }, [
      'invoice.contrato',
      'invoice.numero_contrato',
      'data.contrato',
    ]),
    plan: getStringFromPaths({ invoice, data }, [
      'invoice.plan',
      'invoice.programa',
      'data.plan',
    ]),
    autorizacion: getStringFromPaths({ invoice, data }, [
      'invoice.autorizacion',
      'invoice.numero_autorizacion',
      'data.autorizacion',
    ]),
    items: renderedItems,
    subtotal: getCurrencyFromPaths({ invoice, data, firstItemTotal }, [
      'invoice.subtotal',
      'invoice.valor_total',
      'invoice.valorTotal',
      'data.subtotal',
      'data.valor_total',
      'data.valorTotal',
      ...(firstItemTotal ? ['firstItemTotal'] : []),
    ]),
    copago: getCurrencyFromPaths({ invoice, data }, [
      'invoice.copago',
      'invoice.cuota_moderadora',
      'data.copago',
    ]),
    descuento: getCurrencyFromPaths({ invoice, data }, [
      'invoice.descuento',
      'data.descuento',
    ]),
    impuestos: getCurrencyFromPaths({ invoice, data }, [
      'invoice.impuestos',
      'invoice.iva',
      'data.impuestos',
    ]),
    total: getCurrencyFromPaths({ invoice, data, firstItemTotal }, [
      'invoice.valor_total',
      'invoice.valorTotal',
      'invoice.total',
      'data.valor_total',
      'data.valorTotal',
      'data.total',
      ...(firstItemTotal ? ['firstItemTotal'] : []),
    ]),
    camposObligatoriosFaltantes: getStringArrayFromPaths(data, [
      'calidad_extraccion.campos_obligatorios_faltantes',
      'campos_obligatorios_faltantes',
    ]),
    requiereRevisionHumana: getStringFromPaths(data, [
      'calidad_extraccion.requiere_revision_humana',
      'requiere_revision_humana',
    ]),
    sections: buildInvoiceSections(data),
  }
}

function validatePreinvoiceDocument(
  response: PdfApiResponse,
  text: string
): boolean {
  const data = response.data ?? {}

  const rawTipo = String(
    response.tipo_detectado ?? data.tipo_detectado ?? ''
  ).trim()
  const tipoDetectado = normalizeText(rawTipo)

  const clinicalDocTypes = [
    'historia_clinica',
    'historia clinica',
    'hc',
    'epicrisis',
    'resumen_hc',
    'anamnesis',
    'evolucion',
    'clinical_record',
  ]
  const preinvoiceDocTypes = [
    'prefactura',
    'pre_factura',
    'pre-factura',
    'factura',
    'invoice',
    'preinvoice',
  ]

  if (
    tipoDetectado &&
    clinicalDocTypes.some((t) => tipoDetectado.includes(t)) &&
    !preinvoiceDocTypes.some((t) => tipoDetectado.includes(t))
  ) {
    return false
  }

  const hasPrefacturaNode =
    isRecord(data.prefactura) && Object.keys(data.prefactura).length > 0
  const itemRecords = getRecordsFromPaths(data, [
    'prefactura.items_facturados',
    'prefactura.itemsFacturados',
    'prefactura.detalles',
    'prefactura.items',
    'prefactura.servicios',
    'prefactura.cargos',
    'items_facturados',
    'itemsFacturados',
    'detalles',
    'items',
    'servicios',
    'cargos',
  ])
  const hasBilledItems = itemRecords.length > 0

  const preinvoiceId = getValueFromPaths(data, [
    'prefactura.id_prefactura',
    'prefactura.numero_prefactura',
    'prefactura.prefactura',
    'id_prefactura',
    'numero_prefactura',
  ])

  const totalValue = getValueFromPaths(data, [
    'prefactura.valor_total',
    'prefactura.valorTotal',
    'prefactura.total',
    'valor_total',
    'valorTotal',
  ])

  if (hasBilledItems || (hasPrefacturaNode && (preinvoiceId || totalValue))) {
    return true
  }

  const normalizedDocText = normalizeText(text)
  const normalizedJson = normalizeText(JSON.stringify(data))
  const combinedText = `${normalizedDocText} ${normalizedJson}`

  const clinicalMarkers = [
    'historia clinica',
    'epicrisis',
    'anamnesis',
    'evolucion medica',
    'examen fisico',
    'diagnostico principal',
    'motivo de consulta',
    'plan de manejo',
    'antecedentes',
    'resumen de egreso',
  ]

  const preinvoiceMarkers = [
    'prefactura',
    'pre-factura',
    'factura',
    'facturado',
    'items_facturados',
    'items facturados',
    'valor_total',
    'valor total',
    'cups_facturado',
    'cups facturado',
    'codigo cups',
    'valor unitario',
    'valor_unitario',
    'cargo',
    'cargos',
    'subtotal',
    'copago',
    'descuento',
    'tarifa',
    'total a pagar',
    'detalle de cargos',
    'conceptos facturados',
  ]

  const preinvoiceMatches = preinvoiceMarkers.filter((marker) =>
    combinedText.includes(marker)
  )

  const clinicalMatches = clinicalMarkers.filter((marker) =>
    combinedText.includes(marker)
  )

  if (clinicalMatches.length >= 1 && preinvoiceMatches.length === 0) {
    return false
  }

  if (preinvoiceMatches.length === 0) {
    return false
  }

  return true
}

function appendJsonSection(
  lines: PdfVisualLine[],
  title: string,
  value: unknown
) {
  if (!isRecord(value) || Object.keys(value).length === 0) return

  lines.push({ text: title, variant: 'section' })
  Object.entries(value).forEach(([key, entryValue]) => {
    const nested = isRecord(entryValue) || Array.isArray(entryValue)
    lines.push({
      text: `${formatFieldLabel(key)}: ${formatValue(entryValue)}`,
      variant: nested ? 'muted' : undefined,
    })
  })
}

function appendJsonSections(
  lines: PdfVisualLine[],
  sections: Array<[string, unknown]>
) {
  sections.forEach(([title, value]) => appendJsonSection(lines, title, value))
}

function buildJsonDocumentLines(
  kind: DocumentKind,
  response: PdfApiResponse
): PdfVisualLine[] {
  const data = response.data ?? {}
  const lines: PdfVisualLine[] =
    kind === 'clinical'
      ? [
          {
            text: 'Equipo: ALT-F4 IA',
            variant: 'title',
          },
          {
            text: `Historia clínica reconstruida - Estado: ${
              response.status ?? 'procesado'
            }`,
            variant: 'meta',
          },
        ]
      : [
          {
            text: 'Prefactura reconstruida desde JSON',
            variant: 'title',
          },
          {
            text: `Estado: ${response.status ?? 'procesado'} - Tipo detectado: ${
              response.tipo_detectado ?? 'No reportado'
            }`,
            variant: 'meta',
          },
        ]

  const commonRenderedKeys = [
    'schema_version',
    'tipo_detectado',
    'confianza_tipo',
    'paciente',
    'historia_clinica',
    'prefactura',
    'calidad_extraccion',
  ]
  const renderedKeys = new Set(commonRenderedKeys)

  if (kind === 'clinical') {
    appendJsonSections(lines, [
      ['Paciente', data.paciente],
      ['Historia clínica', data.historia_clinica],
      ['Calidad de extracción', data.calidad_extraccion],
    ])
  } else {
    appendJsonSections(lines, [
      ['Paciente', data.paciente],
      ['Prefactura', data.prefactura],
      ['Calidad de extracción', data.calidad_extraccion],
    ])
  }

  Object.entries(data).forEach(([key, value]) => {
    if (!renderedKeys.has(key) && !(kind === 'clinical' && key === 'prefactura')) {
      appendJsonSection(lines, formatFieldLabel(key), value)
    }
  })

  if (lines.length <= 3) {
    lines.push({
      text: 'La API respondio correctamente, pero no entrego campos estructurados para mostrar.',
      finding: true,
    })
  }

  return lines
}

function linesToAuditText(lines: PdfVisualLine[]) {
  return lines.map((line) => line.text).join('\n')
}

function getApiErrorMessage(status: number, fallback: string) {
  if (status === 400) {
    return 'El archivo no parece ser un PDF valido. Revisa el documento y vuelve a intentarlo.'
  }

  if (status === 401) {
    return 'El servicio rechazo la solicitud por autorizacion. Verifica que este endpoint local no este exigiendo X-API-Key.'
  }

  if (status === 422) {
    return 'No se encontro texto util en el PDF. Prueba con una version legible o con OCR.'
  }

  if (status === 502) {
    return fallback
      ? `El servicio de extraccion fallo al comunicarse con el proveedor. Detalle: ${fallback}`
      : 'El servicio de extraccion fallo al comunicarse con el proveedor. Intentalo de nuevo en unos minutos.'
  }

  if (status === 503) {
    return fallback
      ? `El servicio de extraccion esta temporalmente no disponible. Detalle: ${fallback}`
      : 'El servicio de extraccion esta temporalmente no disponible. Revisa que Docling/Groq esten configurados y disponibles.'
  }

  if (status === 504) {
    return fallback
      ? `El procesamiento supero el tiempo limite. Detalle: ${fallback}`
      : 'El procesamiento supero el tiempo limite. Intentalo con un PDF mas liviano o vuelve a probar en unos minutos.'
  }

  return fallback || 'No se pudo procesar el PDF con la API local.'
}

function getNetworkErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'El procesamiento tardo demasiado. Revisa que el servicio local este disponible e intentalo otra vez.'
  }

  if (error instanceof TypeError) {
    return `No se pudo conectar con la API en ${API_BASE_URL}. Si /docs y /health abren, revisa CORS para permitir http://127.0.0.1:5173.`
  }

  return error instanceof Error
    ? error.message
    : 'No se pudo conectar con la API local.'
}

function getPdfJobErrorMessage(response: PdfApiResponse) {
  const detail = response.error_detail ?? response.detail

  if (detail) return formatValue(detail)

  return 'El procesamiento del PDF fallo en segundo plano. Revisa el backend para mas detalles.'
}

function getCaseState(response: CaseApiResponse) {
  return response.estado ?? response.status ?? 'procesando'
}

function getCaseErrorMessage(response: CaseApiResponse) {
  const detail = response.error_detail ?? response.detail

  if (detail) return formatValue(detail)

  return 'El caso quedo en estado de error. Revisa el backend para mas detalles.'
}

function getAnalysisState(): AnalysisState {
  return {
    isLoading: false,
    error: '',
    message: '',
    warnings: [],
    summary: '',
  }
}

function normalizeBackendGlosaLevel(value: unknown): DetectionLevel {
  const severity = normalizeText(formatValue(value))

  if (severity.includes('alta')) return 'Alta'
  if (severity.includes('media')) return 'Media'

  return 'Baja'
}

function getProbabilityFromSeverity(level: DetectionLevel) {
  if (level === 'Alta') return 95
  if (level === 'Media') return 76

  return 58
}

function formatEvidenceFromGlosa(glosa: Record<string, unknown>) {
  const evidence = isRecord(glosa.evidencia) ? glosa.evidencia : {}
  const entries = Object.entries(evidence).filter(
    ([, value]) => value !== null && value !== undefined && value !== ''
  )

  if (entries.length === 0) return formatValue(glosa.descripcion)

  return entries
    .map(([key, value]) => `${formatFieldLabel(key)}: ${formatValue(value)}`)
    .join(' | ')
}

function formatFuenteDato(fuenteSexo?: string, fuenteCups?: string) {
  const parts: string[] = []

  if (fuenteCups) {
    parts.push(fuenteCups)
  }

  if (fuenteSexo) {
    if (
      fuenteSexo === 'historia_clinica.paciente.sexo' ||
      fuenteSexo === 'inferido_por_nombre_historia' ||
      fuenteSexo.includes('historia')
    ) {
      parts.push('Historia Clínica')
    } else if (
      fuenteSexo === 'prefactura.paciente.sexo' ||
      fuenteSexo.includes('prefactura')
    ) {
      parts.push('Prefactura')
    } else {
      parts.push(formatFieldLabel(fuenteSexo))
    }
  }

  if (parts.length === 0) return 'Catálogo CUPS / Historia Clínica'
  return parts.join(' / ')
}

function formatSexoLabel(sexo?: string) {
  if (!sexo) return 'No especificado'
  const upper = String(sexo).toUpperCase()
  if (upper === 'M' || upper === 'MASCULINO') return 'M (Masculino)'
  if (upper === 'F' || upper === 'FEMENINO') return 'F (Femenino)'
  return String(sexo)
}



function mapBackendGlosasToDetections(glosas: unknown[] = []): Detection[] {
  return glosas.filter(isRecord).map((glosa, index) => {
    const level = normalizeBackendGlosaLevel(glosa.severidad)
    const code = formatValue(glosa.codigo)
    const field = formatValue(glosa.campo)
    const category = formatValue(glosa.categoria) || 'pertinencia'
    const normativeReference = formatValue(glosa.referencia_normativa)
    const evidenciaObj = isRecord(glosa.evidencia)
      ? (glosa.evidencia as BackendGlosaEvidencia)
      : undefined

    let title = formatFieldLabel(code)
    if (code === 'CUPS_NO_PERTINENTE_POR_SEXO' || code.includes('SEXO')) {
      title = 'Pertinencia por Género'
    } else if (
      code === 'PROCEDIMIENTO_NO_FACTURADO_FUGA_INGRESO' ||
      category === 'fuga_ingreso'
    ) {
      const itemNombre =
        evidenciaObj?.descripcion ||
        evidenciaObj?.codigo_cups ||
        (field !== 'No reportado' ? field : undefined) ||
        'Procedimiento No Facturado'
      title = `Fuga de Ingreso (${itemNombre})`
    }

    let recommendation =
      [
        field !== 'No reportado' ? `Campo: ${field}` : '',
        normativeReference !== 'No reportado'
          ? `Referencia: ${normativeReference}`
          : '',
        formatEvidenceFromGlosa(glosa),
      ]
        .filter(Boolean)
        .join(' - ') || 'Revisar soporte clínico y prefactura.'

    if (
      code === 'PROCEDIMIENTO_NO_FACTURADO_FUGA_INGRESO' ||
      category === 'fuga_ingreso'
    ) {
      recommendation = `Recomendación a IPS: Oportunidad de recaudo no cobrada. Verificar la adición del procedimiento en la prefactura antes de la radicación.`
    }

    return {
      id: `${code}-${index}`,
      title,
      level,
      probability: getProbabilityFromSeverity(level),
      category,
      evidence: formatValue(glosa.descripcion),
      recommendation,
      codigo: code !== 'No reportado' ? code : undefined,
      campo: field !== 'No reportado' ? field : undefined,
      referenciaNormativa:
        normativeReference !== 'No reportado' ? normativeReference : undefined,
      evidenciaDetalle: evidenciaObj,
    }
  })
}

function mapBackendAdvertenciasToDetections(
  advertencias: unknown[] = []
): Detection[] {
  if (!Array.isArray(advertencias)) return []

  return advertencias.map((item, index) => {
    if (isRecord(item)) {
      const code = formatValue(item.codigo)
      const desc = formatValue(item.descripcion)
      const field = formatValue(item.campo)
      const level = normalizeBackendGlosaLevel(item.severidad ?? 'media')

      return {
        id: `adv-${code}-${index}`,
        title: code !== 'No reportado' ? formatFieldLabel(code) : 'Advertencia de Cruce',
        level,
        probability: getProbabilityFromSeverity(level),
        category: 'advertencia',
        evidence: desc !== 'No reportado' ? desc : formatValue(item),
        recommendation:
          field !== 'No reportado'
            ? `Recomendación: Verificar el campo ${field} en la información del cruce.`
            : 'Revisar la información del soporte clínico y la prefactura.',
      }
    }

    const text = formatValue(item)
    const normalized = normalizeText(text)

    const isNonEconomicWarning =
      normalized.includes('no genera glosa') ||
      normalized.includes('advertencia') ||
      normalized.includes('fuga de ingreso')

    const isExplicitSexGlosa =
      !isNonEconomicWarning &&
      (normalized.includes('cups_no_pertinente_por_sexo') ||
        normalized.includes('improcedencia biologica') ||
        (normalized.includes('sexo') && normalized.includes('pertinente'))) &&
      !normalized.includes('campos obligatorios faltantes') &&
      !normalized.includes('falta de informacion') &&
      !normalized.includes('faltantes')

    const isMissingField =
      normalized.includes('faltante') ||
      normalized.includes('falta de informacion') ||
      normalized.includes('campo')

    const level: DetectionLevel = isExplicitSexGlosa ? 'Alta' : 'Media'

    return {
      id: `adv-txt-${index}`,
      title: isExplicitSexGlosa
        ? 'Pertinencia por Género'
        : isMissingField
          ? 'Inconsistencia en campos obligatorios'
          : 'Advertencia detectada en cruce',
      level,
      probability: isExplicitSexGlosa ? 98 : 75,
      category: isExplicitSexGlosa ? 'pertinencia' : 'advertencia',
      evidence: text,
      recommendation: isExplicitSexGlosa
        ? 'Recomendación a IPS: Verificar la pertinencia biológica del procedimiento antes de la radicación para prevenir glosa por improcedencia biológica.'
        : 'Revisar los datos obligatorios del soporte clínico y la prefactura.',
    }
  })
}

function combineAllDetections(
  backendGlosas: Detection[],
  backendAdvertencias: Detection[],
  localDetections: Detection[]
): Detection[] {
  const result: Detection[] = []
  const seenKeys = new Set<string>()

  const getDedupeKey = (d: Detection) => {
    const cups = d.evidenciaDetalle?.codigo_cups || ''
    const field = d.campo || ''
    const code = d.codigo || ''
    const title = normalizeText(d.title || '')
    const evidence = normalizeText(d.evidence || '').slice(0, 40)
    return `${title}::${code}::${field}::${cups}::${evidence}`
  }

  backendGlosas.forEach((d) => {
    const key = getDedupeKey(d)
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      result.push(d)
    }
  })

  backendAdvertencias.forEach((d) => {
    const key = getDedupeKey(d)
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      result.push(d)
    }
  })

  localDetections.forEach((d) => {
    const key = getDedupeKey(d)
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      result.push(d)
    }
  })

  return result.sort((a, b) => b.probability - a.probability)
}

function getWarningsFromAnalysis(result?: AnalysisApiResult) {
  if (!Array.isArray(result?.advertencias)) return []

  return result.advertencias.map(formatValue)
}

function getSummaryFromAnalysis(result?: AnalysisApiResult) {
  if (!result || result.resumen === undefined || result.resumen === null) return ''

  return formatValue(result.resumen)
}

function DetectionCard({ detection }: { detection: Detection }) {
  if (detection.category === 'advertencia') {
    return <AdvertenciaCard detection={detection} />
  }

  const [isExpanded, setIsExpanded] = useState(false)
  const styles = getLevelStyles(detection.level)
  const isHighSeverity = detection.level === 'Alta'

  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-xs transition-all duration-200',
        isHighSeverity
          ? 'border-red-200 bg-red-50/70 text-red-950 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100'
          : 'border-zinc-200 bg-card dark:border-zinc-800'
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 space-y-1.5'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='outline' className={styles.badge}>
              {detection.level}
            </Badge>
          </div>
          <h3
            className={cn(
              'text-sm font-bold leading-5',
              isHighSeverity
                ? 'text-red-900 dark:text-red-200'
                : 'text-zinc-900 dark:text-zinc-100'
            )}
          >
            {detection.title}
          </h3>
        </div>
        <div className='shrink-0 text-end'>
          <div
            className={cn(
              'text-lg font-bold',
              isHighSeverity
                ? 'text-red-600 dark:text-red-400'
                : 'text-zinc-900 dark:text-zinc-100'
            )}
          >
            {detection.probability}%
          </div>
          <div className='text-[11px] text-muted-foreground'>prob.</div>
        </div>
      </div>

      <div className='mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800'>
        <div
          className={cn('h-full rounded-full', styles.bar)}
          style={{ width: `${detection.probability}%` }}
        />
      </div>

      <div className='mt-3 space-y-2.5 text-sm'>
        <div className='flex items-start gap-2 text-zinc-700 dark:text-zinc-300'>
          <AlertTriangle
            className={cn(
              'mt-0.5 size-4 shrink-0',
              isHighSeverity ? 'text-red-500' : 'text-amber-500'
            )}
          />
          <p className='leading-5 text-xs font-medium text-zinc-800 dark:text-zinc-200'>
            {detection.evidence}
          </p>
        </div>

        {/* Action button to expand/collapse extra information */}
        <div className='flex items-center justify-between pt-1 border-t border-red-200/60 dark:border-red-900/40'>
          <button
            type='button'
            onClick={() => setIsExpanded((prev) => !prev)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
              isHighSeverity
                ? 'bg-red-100/80 text-red-700 hover:bg-red-200/80 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            )}
          >
            <span>{isExpanded ? 'Ocultar detalles' : 'Ver más información'}</span>
            <ChevronDown
              className={cn(
                'size-3.5 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            />
          </button>
        </div>

        {/* Collapsible Details */}
        {isExpanded ? (
          <div className='space-y-3 pt-2 text-xs border-t border-red-200/80 dark:border-red-900/60 animate-in fade-in slide-in-from-top-1 duration-150'>
            {detection.recommendation ? (
              <div className='flex gap-2 text-zinc-800 dark:text-zinc-200 bg-white/80 dark:bg-zinc-900/60 p-2.5 rounded-md border border-red-200/70 dark:border-red-900/50 shadow-xs'>
                <ClipboardCheck className='mt-0.5 size-4 shrink-0 text-red-500' />
                <div className='space-y-1 leading-5'>
                  <p className='font-semibold text-zinc-900 dark:text-zinc-100'>
                    Recomendación / Glosa:
                  </p>
                  <p>{detection.recommendation}</p>
                </div>
              </div>
            ) : null}

            {detection.evidenciaDetalle ? (
              <div className='rounded-md border border-red-200/90 bg-red-100/50 p-3 text-xs dark:border-red-900/70 dark:bg-red-950/50 shadow-xs'>
                <p className='mb-2 border-b border-red-200/90 pb-1 font-semibold text-red-900 dark:border-red-900/70 dark:text-red-300'>
                  Detalle de Evidencia ({detection.title})
                </p>
                <div className='grid gap-1.5 text-zinc-800 sm:grid-cols-2 dark:text-zinc-200'>
                  <div>
                    <span className='font-medium text-zinc-500 dark:text-zinc-400'>
                      Código CUPS afectado:
                    </span>{' '}
                    <span className='font-mono font-bold text-zinc-900 dark:text-zinc-100'>
                      {detection.evidenciaDetalle.codigo_cups || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium text-zinc-500 dark:text-zinc-400'>
                      Sexo registrado en paciente:
                    </span>{' '}
                    <span className='font-semibold'>
                      {formatSexoLabel(
                        detection.evidenciaDetalle.sexo_paciente
                      )}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium text-zinc-500 dark:text-zinc-400'>
                      Sexo permitido por norma:
                    </span>{' '}
                    <span className='font-bold text-red-600 dark:text-red-400'>
                      {formatSexoLabel(
                        detection.evidenciaDetalle.sexo_permitido
                      )}
                    </span>
                  </div>
                  <div>
                    <span className='font-medium text-zinc-500 dark:text-zinc-400'>
                      Fuente del dato:
                    </span>{' '}
                    <span className='font-medium'>
                      {formatFuenteDato(
                        detection.evidenciaDetalle.fuente_sexo_paciente,
                        detection.evidenciaDetalle.fuente_cups
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function waitForPdfPoll(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, PDF_POLL_INTERVAL_MS)

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeout)
        reject(new DOMException('Operacion cancelada', 'AbortError'))
      },
      { once: true }
    )
  })
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS
): Promise<Response> {
  const timeoutController = new AbortController()
  let isTimeout = false
  const timeoutId = window.setTimeout(() => {
    isTimeout = true
    timeoutController.abort()
  }, timeoutMs)

  const parentSignal = options.signal
  const onParentAbort = () => timeoutController.abort()

  if (parentSignal) {
    if (parentSignal.aborted) {
      timeoutController.abort()
    } else {
      parentSignal.addEventListener('abort', onParentAbort, { once: true })
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: timeoutController.signal,
    })
    return response
  } catch (error) {
    if (isTimeout) {
      throw new Error(
        `La petición a la API superó el tiempo límite de ${Math.round(
          timeoutMs / 1000
        )}s sin respuesta del servidor.`
      )
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
    if (parentSignal) {
      parentSignal.removeEventListener('abort', onParentAbort)
    }
  }
}

async function readPdfApiResponse(response: Response) {
  return (await response
    .json()
    .catch(() => undefined)) as PdfApiResponse | undefined
}

async function readCaseApiResponse(response: Response) {
  return (await response
    .json()
    .catch(() => undefined)) as CaseApiResponse | undefined
}

function getEmptyUploadState(): PdfUploadState {
  return {
    fileName: '',
    isLoading: false,
    error: '',
    message: '',
    lines: [],
    clinicalView: undefined,
    invoiceView: undefined,
  }
}




function PdfUploadPanel({
  id,
  title,
  description,
  upload,
  onFileChange,
  detections = [],
}: {
  id: DocumentKind
  title: string
  description: string
  upload: PdfUploadState
  onFileChange: (kind: DocumentKind, file?: File) => void
  detections?: Detection[]
}) {
  const hasDocument = upload.fileName.length > 0 || upload.lines.length > 0
  const processingDescription =
    id === 'clinical'
      ? 'Estamos extrayendo y organizando la historia clínica. Puedes esperar aquí; la vista se actualizará automáticamente.'
      : 'Estamos extrayendo y organizando los datos de la prefactura. La vista se actualizará automáticamente.'

  return (
    <div className='flex flex-col gap-4'>
      <input
        id={`${id}-pdf`}
        type='file'
        accept='application/pdf,.pdf'
        className='sr-only'
        onChange={(event) => {
          onFileChange(id, event.target.files?.[0])
          event.target.value = ''
        }}
      />

      {!hasDocument ? (
        <label
          htmlFor={`${id}-pdf`}
          className={cn(
            'flex min-h-48 cursor-pointer flex-col items-center justify-start rounded-lg border border-dashed px-4 pt-6 pb-8 text-center transition-colors',
            'hover:border-primary/60 hover:bg-muted/40',
            upload.error && 'border-red-300 bg-red-50/60 dark:bg-red-950/20'
          )}
        >
          {upload.isLoading ? (
            <LoaderCircle className='mb-3 size-9 animate-spin text-primary' />
          ) : (
            <UploadCloud className='mb-3 size-9 text-muted-foreground' />
          )}
          <span className='text-sm font-semibold'>{title}</span>
          <span className='mt-1 max-w-md text-xs leading-5 text-muted-foreground'>
            {description}
          </span>
          <span className='mt-3 text-xs font-medium text-primary'>
            Seleccionar PDF
          </span>
        </label>
      ) : null}

      {upload.error ? (
        <Alert variant='destructive'>
          <AlertTriangle />
          <AlertTitle>No se pudo procesar el PDF</AlertTitle>
          <AlertDescription>{upload.error}</AlertDescription>
        </Alert>
      ) : null}

      {upload.isLoading && !upload.error ? (
        <div className='rounded-lg border bg-card px-4 py-3 shadow-xs'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 rounded-md bg-primary/10 p-2 text-primary'>
              <LoaderCircle className='size-4 animate-spin' />
            </div>
            <div className='min-w-0 space-y-1'>
              <p className='text-sm font-medium'>Procesando PDF</p>
              <p className='text-xs leading-5 text-muted-foreground'>
                {processingDescription}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {hasDocument ? (
        <div className='flex min-h-0 flex-1 flex-col'>
          {upload.lines.length > 0 ? (
            <div className='bg-background'>
              {id === 'clinical' && upload.clinicalView ? (
                <ClinicalDocumentCardV2
                  record={upload.clinicalView}
                  detections={detections}
                />
              ) : id === 'invoice' && upload.invoiceView ? (
                <InvoiceDocumentCard record={upload.invoiceView} detections={detections} />
              ) : (
                <article className='mx-auto my-4 min-h-[540px] max-w-3xl rounded-sm border bg-white px-7 py-8 text-zinc-950 shadow-sm dark:bg-zinc-50'>
                  <div className='space-y-2.5 text-sm leading-6'>
                    {upload.lines.map((line, index) => (
                      <p
                        key={`${line.text}-${index}`}
                        className={cn(
                          'px-1 text-zinc-700',
                          line.variant === 'meta' &&
                            'border-b border-zinc-100 pb-3 text-center text-[11px] font-medium tracking-wide text-zinc-500 uppercase',
                          line.variant === 'title' &&
                            'pt-1 text-center text-xl font-bold text-zinc-950',
                          line.variant === 'muted' &&
                            'text-[13px] leading-5 text-zinc-600',
                          line.variant === 'section' &&
                            'mt-3 border-y border-zinc-200 bg-zinc-50 px-3 py-2 leading-6 font-medium text-zinc-900',
                          line.variant === 'amount' &&
                            'mt-3 border-t border-zinc-300 pt-3 text-right text-base font-semibold text-zinc-950',
                          line.finding &&
                            'rounded-sm bg-red-50 font-medium text-red-700 ring-1 ring-red-200'
                        )}
                      >
                        {line.text}
                      </p>
                    ))}
                  </div>
                </article>
              )}
            </div>
          ) : (
            <div className='flex min-h-[220px] flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground'>
              Procesando PDF con la API local...
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function Chats() {
  const [clinicalRecord, setClinicalRecord] = useState('')
  const [preinvoice, setPreinvoice] = useState('')
  const [detections, setDetections] = useState<Detection[]>([])
  const [hasRunAudit, setHasRunAudit] = useState(false)
  const [activeDocumentTab, setActiveDocumentTab] = useState<'clinical' | 'invoice'>('clinical')
  const [caseId, setCaseId] = useState('')
  const [_caseStatus, setCaseStatus] = useState('')
  const [_auditEstado, setAuditEstado] = useState<string>('')
  const [_auditSummary, setAuditSummary] = useState<BackendResumen | null>(null)
  const [mlResult, setMlResult] = useState<ClasificacionML | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisState>(getAnalysisState)
  const [showHelp, setShowHelp] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const uploadControllers = useRef<Record<DocumentKind, AbortController | null>>({
    clinical: null,
    invoice: null,
  })
  const analysisController = useRef<AbortController | null>(null)
  const [uploads, setUploads] = useState<Record<DocumentKind, PdfUploadState>>({
    clinical: getEmptyUploadState(),
    invoice: getEmptyUploadState(),
  })

  useEffect(() => {
    return () => {
      uploadControllers.current.clinical?.abort()
      uploadControllers.current.invoice?.abort()
      analysisController.current?.abort()
    }
  }, [])

  async function pollCaseUntil(
    caseId: string,
    targetStates: string[],
    signal: AbortSignal,
    statusMessage?: string,
    onProgress?: (message: string) => void
  ): Promise<CaseApiResponse> {
    for (let attempt = 0; attempt < PDF_MAX_POLL_ATTEMPTS; attempt += 1) {
      const response = await fetchWithTimeout(getCaseEndpoint(caseId), { signal })
      const payload = await readCaseApiResponse(response)

      if (!response.ok) {
        const detail = payload?.detail ? formatValue(payload.detail) : ''
        throw new Error(getApiErrorMessage(response.status, detail))
      }

      const currentState = getCaseState(payload ?? {})
      if (targetStates.includes(currentState)) {
        return payload ?? {}
      }

      if (CASE_ERROR_STATES.has(currentState)) {
        throw new Error(getCaseErrorMessage(payload ?? {}))
      }

      if (statusMessage && onProgress) {
        onProgress(statusMessage)
      }

      await waitForPdfPoll(signal)
    }

    throw new Error('El análisis del caso superó el tiempo máximo de espera.')
  }

  const auditReady =
    uploads.clinical.lines.length > 0 &&
    uploads.invoice.lines.length > 0 &&
    !uploads.clinical.isLoading &&
    !uploads.invoice.isLoading &&
    !analysis.isLoading

  async function handleAnalyze() {
    analysisController.current?.abort()
    const controller = new AbortController()
    analysisController.current = controller

    setDetections([])
    setHasRunAudit(false)
    setAnalysis({
      ...getAnalysisState(),
      isLoading: true,
      message: 'Ejecutando análisis del caso en el backend...',
    })

    const hasRealCase = Boolean(caseId)

    if (hasRealCase) {
      try {
        // 1. Primero consultar si el caso ya fue analizado previamente en backend
        const checkCaseRes = await fetchWithTimeout(getCaseEndpoint(caseId), {
          signal: controller.signal,
        })
        const existingCase = checkCaseRes.ok
          ? await readCaseApiResponse(checkCaseRes)
          : undefined

        if (
          existingCase &&
          getCaseState(existingCase) === 'analizado' &&
          existingCase.resultado_analisis_json
        ) {
          const result = existingCase.resultado_analisis_json
          setCaseStatus('analizado')
          const backendGlosas = mapBackendGlosasToDetections(result.glosas)
          const backendAdvertencias = mapBackendAdvertenciasToDetections(
            result.advertencias
          )
          // Usar solo resultados del backend — el motor local solo aplica si no hay backend
          const finalGlosas = combineAllDetections(
            backendGlosas,
            backendAdvertencias,
            []
          )

          setDetections(finalGlosas)
          setAuditEstado(result.estado ?? (finalGlosas.length > 0 ? 'con_glosa' : 'sin_glosa'))
          setAuditSummary(result.resumen ?? { total_glosas: finalGlosas.length, total_advertencias: backendAdvertencias.length, total_cruces: 2 })
          setMlResult(result.clasificacion_ml ?? null)
          setHasRunAudit(true)
          setShowResultModal(true)
          setActiveDocumentTab('invoice')
          toast.success('Análisis finalizado con éxito', {
            description: 'El caso quedó registrado correctamente en Auditorías API.',
            duration: 2500,
          })
          setAnalysis({
            isLoading: false,
            error: '',
            message: 'Caso analizado previamente. Mostrando resultado guardado.',
            warnings: getWarningsFromAnalysis(result),
            summary: getSummaryFromAnalysis(result),
          })
          return
        }

        // 2. Si el caso no está analizado, solicitar el análisis al backend
        const response = await fetchWithTimeout(getCaseAnalyzeEndpoint(caseId), {
          method: 'POST',
          signal: controller.signal,
        })
        const payload = await readCaseApiResponse(response)

        if (!response.ok) {
          const detail = payload?.detail ? formatValue(payload.detail) : ''

          // Si el backend indica que el caso ya fue analizado, re-consultar el caso vía GET
          const retryCheck = await fetchWithTimeout(getCaseEndpoint(caseId), {
            signal: controller.signal,
          })
          if (retryCheck.ok) {
            const retryCase = await readCaseApiResponse(retryCheck)
            if (
              retryCase &&
              getCaseState(retryCase) === 'analizado' &&
              retryCase.resultado_analisis_json
            ) {
              const result = retryCase.resultado_analisis_json
              setCaseStatus('analizado')
              const backendGlosas = mapBackendGlosasToDetections(result.glosas)
              const backendAdvertencias = mapBackendAdvertenciasToDetections(
                result.advertencias
              )
              // Usar solo resultados del backend — el motor local solo aplica si no hay backend
              const finalGlosas = combineAllDetections(
                backendGlosas,
                backendAdvertencias,
                []
              )

              setDetections(finalGlosas)
              setAuditEstado(result.estado ?? (finalGlosas.length > 0 ? 'con_glosa' : 'sin_glosa'))
              setAuditSummary(result.resumen ?? { total_glosas: finalGlosas.length, total_advertencias: backendAdvertencias.length, total_cruces: 2 })
              setMlResult(result.clasificacion_ml ?? null)
              setHasRunAudit(true)
              setShowResultModal(true)
              setActiveDocumentTab('invoice')
              toast.success('Análisis finalizado con éxito', {
                description: 'El caso quedó registrado correctamente en Auditorías API.',
                duration: 2500,
              })
              setAnalysis({
                isLoading: false,
                error: '',
                message: 'Caso analizado. Glosas cargadas desde la base de datos.',
                warnings: getWarningsFromAnalysis(result),
                summary: getSummaryFromAnalysis(result),
              })
              return
            }
          }

          throw new Error(getApiErrorMessage(response.status, detail))
        }

        const analyzedCase =
          getCaseState(payload ?? {}) === 'analizado'
            ? payload
            : await pollCaseUntil(
                caseId,
                ['analizado'],
                controller.signal,
                'Analizando caso. El resultado se actualizará automáticamente.',
                (msg) => setAnalysis((prev) => ({ ...prev, message: msg }))
              )
        const result = analyzedCase?.resultado_analisis_json ?? {}

        setCaseStatus(getCaseState(analyzedCase ?? {}))
        const backendGlosas = mapBackendGlosasToDetections(result.glosas)
        const backendAdvertencias = mapBackendAdvertenciasToDetections(
          result.advertencias
        )
        // Usar solo resultados del backend — el motor local solo aplica si no hay backend
        const finalGlosas = combineAllDetections(
          backendGlosas,
          backendAdvertencias,
          []
        )

        setDetections(finalGlosas)
        setAuditEstado(result.estado ?? (finalGlosas.length > 0 ? 'con_glosa' : 'sin_glosa'))
        setAuditSummary(result.resumen ?? { total_glosas: finalGlosas.length, total_advertencias: backendAdvertencias.length, total_cruces: 2 })
        setMlResult(result.clasificacion_ml ?? null)
        setHasRunAudit(true)
        setShowResultModal(true)
        setActiveDocumentTab('invoice')
        toast.success('Análisis finalizado con éxito', {
          description: 'El caso quedó registrado correctamente en Auditorías API.',
          duration: 2500,
        })
        setAnalysis({
          isLoading: false,
          error: '',
          message: 'Análisis finalizado.',
          warnings: getWarningsFromAnalysis(result),
          summary: getSummaryFromAnalysis(result),
        })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return

        // Intentar recuperar el resultado si el caso ya fue analizado antes de lanzar error
        try {
          const catchCaseRes = await fetchWithTimeout(getCaseEndpoint(caseId), {
            signal: controller.signal,
          })
          if (catchCaseRes.ok) {
            const catchCase = await readCaseApiResponse(catchCaseRes)
            if (
              catchCase &&
              getCaseState(catchCase) === 'analizado' &&
              catchCase.resultado_analisis_json
            ) {
              const result = catchCase.resultado_analisis_json
              setCaseStatus('analizado')
              const backendGlosas = mapBackendGlosasToDetections(result.glosas)
              const backendAdvertencias = mapBackendAdvertenciasToDetections(
                result.advertencias
              )
              // Usar solo resultados del backend — el motor local solo aplica si no hay backend
              const finalGlosas = combineAllDetections(
                backendGlosas,
                backendAdvertencias,
                []
              )

              setDetections(finalGlosas)
              setAuditEstado(result.estado ?? (finalGlosas.length > 0 ? 'con_glosa' : 'sin_glosa'))
              setAuditSummary(result.resumen ?? { total_glosas: finalGlosas.length, total_advertencias: backendAdvertencias.length, total_cruces: 2 })
              setMlResult(result.clasificacion_ml ?? null)
              setHasRunAudit(true)
              setShowResultModal(true)
              setActiveDocumentTab('invoice')
              toast.success('Análisis finalizado con éxito', {
                description: 'El caso quedó registrado correctamente en Auditorías API.',
                duration: 2500,
              })
              setAnalysis({
                isLoading: false,
                error: '',
                message: 'Caso analizado. Glosas recuperadas de la base de datos.',
                warnings: getWarningsFromAnalysis(result),
                summary: getSummaryFromAnalysis(result),
              })
              return
            }
          }
        } catch {
          // Continuar al manejo de fallback / error
        }

        const localFallback = runAudit(clinicalRecord, preinvoice)
        setDetections(localFallback)
        setAuditEstado(localFallback.length > 0 ? 'con_glosa' : 'sin_glosa')
        setAuditSummary({
          total_glosas: localFallback.length,
          total_advertencias: 0,
          total_cruces: 2,
        })
        setHasRunAudit(true)
        setShowResultModal(true)
        setActiveDocumentTab('invoice')
        toast.success('Análisis finalizado con éxito', {
          description: 'Se aplicó el motor de auditoría de respaldo.',
          duration: 2500,
        })
        setAnalysis({
          isLoading: false,
          error: '',
          message: 'Análisis completado usando el motor de auditoría local.',
          warnings: [
            `Nota de servidor: La API remota (${API_BASE_URL}) respondió con error (${getNetworkErrorMessage(error)}). Se aplicaron las reglas de auditoría en cliente.`,
          ],
          summary: 'Resultados obtenidos mediante el motor de auditoría local.',
        })
        return
      } finally {
        if (analysisController.current === controller) {
          analysisController.current = null
        }
      }
    }

    // Modo Demostración / Ejemplo Local
    const localResults = runAudit(clinicalRecord, preinvoice)
    setDetections(localResults)
    setAuditEstado(localResults.length > 0 ? 'con_glosa' : 'sin_glosa')
    setAuditSummary({ total_glosas: localResults.length, total_advertencias: 0, total_cruces: 2 })
    setHasRunAudit(true)
    setShowResultModal(true)
    setActiveDocumentTab('invoice')
    setAnalysis({
      isLoading: false,
      error: '',
      message: 'Análisis completado.',
      warnings: [],
      summary: 'Análisis realizado en modo de demostración.',
    })
    if (analysisController.current === controller) {
      analysisController.current = null
    }
  }

  function handleLoadSample() {
    abortAllPdfRequests()
    analysisController.current?.abort()

    const clinicalLines = sampleClinicalRecord.split('\n').map((text, index) => ({
      text,
      variant: index === 0 ? ('title' as const) : undefined,
    }))
    const invoiceLines = samplePreinvoice.split('\n').map((text, index) => ({
      text,
      variant: index === 0 ? ('title' as const) : undefined,
    }))

    setClinicalRecord(sampleClinicalRecord)
    setPreinvoice(samplePreinvoice)
    setCaseId('caso-ejemplo-001')
    setCaseStatus('listo_para_analizar')
    setAnalysis(getAnalysisState())
    setUploads({
      clinical: {
        fileName: 'historia-clinica-ejemplo.pdf',
        isLoading: false,
        error: '',
        message: 'Ejemplo cargado como documento reconstruido.',
        lines: clinicalLines,
        clinicalView: {
          idAtencion: 'ATN-000001',
          idPaciente: 'PAC-00295',
          nombrePaciente: 'Paciente ejemplo',
          documentoPaciente: 'PAC-00295',
          sexoPaciente: 'M',
          fechaAtencion: '2026-07-10',
          tipoAtencion: 'Hospitalización general',
          diagnosticoPrincipalCie10: 'J189',
          descripcionDiagnostico: 'Neumonía adquirida en comunidad',
          medicoTratante: 'MED-037',
          sede: 'Sede Urgencias',
          epsAtencion: 'Nueva EPS',
          tipoDocumento: 'CC',
          tipoAfiliacion: 'Subsidiado',
          ciudad: 'Bogotá',
          codigoCups: '890201',
          tipoItem: 'consulta',
          descripcion: 'Consulta de primera vez medicina general',
          cantidadRealizada: '1',
          fechaRegistro: '2026-07-10 06:00',
          soporteClinico: 'SI',
          profesionalResponsable: 'MED-037',
          evolucion:
            'Manejo en hospitalizacion general, oxigeno por canula nasal, ceftriaxona y terapia respiratoria.',
          observaciones:
            'Soportes: hemograma, radiografia de torax y valoracion por medicina interna.',
          procedimientos: [
            {
              id: 'DET-1',
              tipo: 'consulta',
              cups: '890201',
              descripcion: 'Consulta de primera vez medicina general',
              cantidad: '1',
              soporte: 'SI',
            },
          ],
          camposObligatoriosFaltantes: [],
          requiereRevisionHumana: 'No',
          sections: [
            {
              title: 'Paciente',
              fields: [
                { label: 'Nombre', value: 'Paciente ejemplo' },
                { label: 'Documento', value: 'PAC-00295' },
                { label: 'Tipo Documento', value: 'CC' },
                { label: 'EPS', value: 'Nueva EPS' },
                { label: 'Régimen', value: 'Subsidiado' },
              ],
            },
            {
              title: 'Historia clínica',
              fields: [
                { label: 'Ingreso', value: '2026-07-10' },
                { label: 'Egreso', value: '2026-07-12' },
                {
                  label: 'Evolución',
                  value:
                    'Manejo en hospitalización general, oxígeno por cánula nasal, ceftriaxona y terapia respiratoria.',
                },
              ],
            },
          ],
        },
      },
      invoice: {
        fileName: 'prefactura-ejemplo.pdf',
        isLoading: false,
        error: '',
        message: 'Ejemplo cargado como documento reconstruido.',
        lines: invoiceLines,
        clinicalView: undefined,
        invoiceView: {
          idPrefactura: 'PF-0000001',
          idAtencion: 'ATN-000001',
          idPaciente: 'PAC-00295',
          nombrePaciente: 'Paciente ejemplo',
          documentoPaciente: 'PAC-00295',
          tipoDocumento: 'CC',
          eps: 'Nueva EPS',
          regimen: 'Subsidiado',
          fechaFacturacion: '2026-07-12',
          periodoServicio: '2026-07-10 a 2026-07-12',
          prestador: 'Equipo: ALT-F4 IA',
          nitPrestador: 'No reportado',
          sede: 'Sede Urgencias',
          ciudad: 'Bogota',
          contrato: 'No reportado',
          plan: 'No reportado',
          autorizacion: 'No reportado',
          items: [
            {
              id: 'DET-1',
              codigo: '890201',
              descripcion: 'Consulta de primera vez medicina general',
              cantidad: '1',
              valorUnitario: '45000',
              valorTotal: '45000',
            },
            {
              id: 'DET-2',
              codigo: 'UCI-001',
              descripcion: 'Unidad de cuidados intensivos UCI',
              cantidad: '1',
              valorUnitario: '1200000',
              valorTotal: '1200000',
            },
          ],
          subtotal: formatCurrencyValue(1245000),
          copago: formatCurrencyValue(0),
          descuento: 'No reportado',
          impuestos: 'No reportado',
          total: formatCurrencyValue(1245000),
          camposObligatoriosFaltantes: ['nit_prestador', 'contrato', 'plan'],
          requiereRevisionHumana: 'Si',
          sections: [
            {
              title: 'Prefactura',
              fields: [
                { label: 'ID prefactura', value: 'PF-0000001' },
                { label: 'ID atencion', value: 'ATN-000001' },
                { label: 'Total', value: formatCurrencyValue(1245000) },
              ],
            },
          ],
        },
      },
    })
    setDetections([])
    setHasRunAudit(false)
  }

  function handleClear() {
    abortAllPdfRequests()
    analysisController.current?.abort()
    setClinicalRecord('')
    setPreinvoice('')
    setCaseId('')
    setCaseStatus('')
    setAnalysis(getAnalysisState())
    setUploads({
      clinical: getEmptyUploadState(),
      invoice: getEmptyUploadState(),
    })
    setDetections([])
    setHasRunAudit(false)
    setShowResultModal(false)
    setActiveDocumentTab('clinical')
  }

  function updateUpload(kind: DocumentKind, next: Partial<PdfUploadState>) {
    setUploads((current) => ({
      ...current,
      [kind]: { ...current[kind], ...next },
    }))
  }

  function abortCurrentPdfRequest(kind: DocumentKind) {
    uploadControllers.current[kind]?.abort()
    uploadControllers.current[kind] = null
  }

  function abortAllPdfRequests() {
    abortCurrentPdfRequest('clinical')
    abortCurrentPdfRequest('invoice')
  }

  function setDocumentText(kind: DocumentKind, text: string) {
    if (kind === 'clinical') {
      setClinicalRecord(text)
      return
    }

    setPreinvoice(text)
  }

  async function resolveProcessedPdf(
    kind: DocumentKind,
    apiResponse: PdfApiResponse,
    fileName: string
  ) {
    const lines = buildJsonDocumentLines(kind, apiResponse)
    const text = linesToAuditText(lines)

    const extractedCaseId = apiResponse.caso_id ?? apiResponse.id
    if (extractedCaseId) {
      setCaseId(extractedCaseId)
    }

    if (!text) {
      throw new Error(
        'La API respondio, pero no entrego texto suficiente para el analisis.'
      )
    }

    if (kind === 'invoice') {
      const isValidPreinvoice = validatePreinvoiceDocument(apiResponse, text)
      if (!isValidPreinvoice) {
        setPreinvoice('')
        updateUpload('invoice', {
          fileName,
          isLoading: false,
          error:
            'El archivo cargado no parece ser una prefactura válida. Asegúrate de subir un documento con el detalle de ítems y valores facturados.',
          message: '',
          lines: [],
          clinicalView: undefined,
          invoiceView: undefined,
        })
        return
      }
    }

    setDocumentText(kind, text)
    updateUpload(kind, {
      fileName,
      isLoading: false,
      error: '',
      message: 'El PDF fue procesado y la vista se genero desde el JSON estructurado.',
      lines,
      clinicalView:
        kind === 'clinical' ? buildClinicalDocumentView(apiResponse) : undefined,
      invoiceView:
        kind === 'invoice' ? buildInvoiceDocumentView(apiResponse) : undefined,
    })
  }

  async function pollPdfJob(
    kind: DocumentKind,
    id: string,
    fileName: string,
    signal: AbortSignal
  ) {
    for (let attempt = 0; attempt < PDF_MAX_POLL_ATTEMPTS; attempt += 1) {
      const response = await fetchWithTimeout(`${PDF_RESULT_ENDPOINT}/${id}`, {
        signal,
      })
      const payload = await readPdfApiResponse(response)

      if (!response.ok) {
        const detail = payload?.detail ? formatValue(payload.detail) : ''
        throw new Error(getApiErrorMessage(response.status, detail))
      }

      if (payload?.caso_id) {
        setCaseId(payload.caso_id)
      }

      const rawStatus = payload?.status ?? payload?.estado ?? 'procesando'
      const normalizedStatus = normalizeText(formatValue(rawStatus))

      const isCompleted =
        normalizedStatus === 'procesado' ||
        normalizedStatus === 'completado' ||
        normalizedStatus === 'completada' ||
        normalizedStatus === 'exitoso' ||
        normalizedStatus === 'success' ||
        normalizedStatus === 'done'

      if (isCompleted || payload?.data) {
        await resolveProcessedPdf(kind, payload ?? {}, fileName)
        return
      }

      const isFailed =
        normalizedStatus === 'fallido' ||
        normalizedStatus === 'error' ||
        normalizedStatus === 'failed'

      if (isFailed) {
        throw new Error(getPdfJobErrorMessage(payload ?? {}))
      }

      updateUpload(kind, {
        message:
          normalizedStatus.includes('cola')
            ? 'PDF recibido. La extracción iniciará en breve.'
            : 'Procesando PDF. La vista se actualizará automáticamente.',
      })

      await waitForPdfPoll(signal)
    }

    throw new Error(
      'El PDF sigue en procesamiento. Puedes reintentar la carga o consultar el estado directamente en el backend.'
    )
  }

  async function handlePdfChange(kind: DocumentKind, file?: File) {
    if (!file) return

    abortCurrentPdfRequest(kind)

    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      updateUpload(kind, {
        fileName: file.name,
        isLoading: false,
        error: 'Selecciona un archivo en formato PDF.',
        message: '',
        lines: [],
        clinicalView: undefined,
        invoiceView: undefined,
      })
      setDocumentText(kind, '')
      return
    }

    if (file.size > MAX_PDF_BYTES) {
      updateUpload(kind, {
        fileName: file.name,
        isLoading: false,
        error: 'El PDF supera el limite de 25 MB.',
        message: '',
        lines: [],
        clinicalView: undefined,
        invoiceView: undefined,
      })
      setDocumentText(kind, '')
      return
    }

    if (kind === 'invoice' && !caseId) {
      updateUpload(kind, {
        fileName: file.name,
        isLoading: false,
        error:
          'Para subir la prefactura, primero debes procesar la historia clínica para crear el caso de auditoría.',
        message: '',
        lines: [],
        clinicalView: undefined,
        invoiceView: undefined,
      })
      setDocumentText(kind, '')
      return
    }

    updateUpload(kind, {
      fileName: file.name,
      isLoading: true,
      error: '',
      message: 'Enviando PDF a la API...',
      lines: [],
      clinicalView: undefined,
      invoiceView: undefined,
    })
    setDocumentText(kind, '')
    setDetections([])
    setHasRunAudit(false)

    const formData = new FormData()
    formData.append('file', file)
    const controller = new AbortController()
    uploadControllers.current[kind] = controller

    const endpoint =
      kind === 'clinical'
        ? CLINICAL_PDF_ENDPOINT
        : getCaseInvoicePdfEndpoint(caseId)

    try {
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      const payload = await readPdfApiResponse(response)

      if (!response.ok) {
        const detail = payload?.detail ? formatValue(payload.detail) : ''
        throw new Error(getApiErrorMessage(response.status, detail))
      }

      const apiResponse = payload ?? {}
      const extractedCaseId = apiResponse.caso_id ?? apiResponse.id
      if (extractedCaseId) {
        setCaseId(extractedCaseId)
      }

      if (apiResponse.status === 'procesado' || apiResponse.data) {
        await resolveProcessedPdf(kind, apiResponse, file.name)
        return
      }

      if (!apiResponse.id) {
        throw new Error(
          'La API recibio el PDF, pero no devolvio un id de procesamiento para consultar el resultado.'
        )
      }

      updateUpload(kind, {
        message: 'PDF recibido. La extracción iniciará en breve.',
      })
      await pollPdfJob(kind, apiResponse.id, file.name, controller.signal)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return

      updateUpload(kind, {
        isLoading: false,
        message: '',
        lines: [],
        clinicalView: undefined,
        invoiceView: undefined,
        error: getNetworkErrorMessage(error),
      })
    } finally {
      if (uploadControllers.current[kind] === controller) {
        uploadControllers.current[kind] = null
      }
    }
  }

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main className='min-h-screen'>
        {/* ── Dialog: Cómo usar ── */}
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
          <DialogContent className='max-w-lg'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
                <HelpCircle className='size-5 text-primary' />
                ¿Cómo usar el Auditor IA?
              </DialogTitle>
            </DialogHeader>
            <div className='mt-2 space-y-4 text-sm'>
              <ol className='space-y-4'>
                <li className='flex gap-3'>
                  <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>1</span>
                  <div>
                    <p className='font-semibold'>Carga la Historia Clínica</p>
                    <p className='text-muted-foreground mt-0.5'>Sube el PDF de la historia clínica del paciente en el panel izquierdo. El sistema extraerá automáticamente los datos relevantes.</p>
                  </div>
                </li>
                <li className='flex gap-3'>
                  <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>2</span>
                  <div>
                    <p className='font-semibold'>Carga la Prefactura</p>
                    <p className='text-muted-foreground mt-0.5'>Sube el PDF de la prefactura correspondiente. El motor cruzará los procedimientos facturados contra los documentados en la historia clínica.</p>
                  </div>
                </li>
                <li className='flex gap-3'>
                  <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>3</span>
                  <div>
                    <p className='font-semibold'>Haz clic en "Analizar Caso"</p>
                    <p className='text-muted-foreground mt-0.5'>Una vez cargados ambos documentos, el botón se habilitará. El análisis detectará glosas, fugas de ingreso e inconsistencias automáticamente.</p>
                  </div>
                </li>
                <li className='flex gap-3'>
                  <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>4</span>
                  <div>
                    <p className='font-semibold'>Revisa los resultados</p>
                    <p className='text-muted-foreground mt-0.5'>En el panel derecho aparecerán las <strong>Glosas</strong> (inconsistencias con impacto económico) y las <strong>Advertencias</strong> (hallazgos informativos sin glosa económica).</p>
                  </div>
                </li>
              </ol>
              <div className='rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900/40 p-3 text-xs text-blue-800 dark:text-blue-300'>
                <strong>Tip:</strong> Usa el botón <em>"Cargar ejemplo"</em> para probar el sistema con datos de demostración sin necesidad de subir documentos reales.
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <section className='flex min-h-screen flex-col gap-5 pb-6'>
          <div className='flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Auditor IA</h1>
              <p className='text-sm text-muted-foreground'>
                Cruce de historia clínica y prefactura para detección temprana de
                glosas.
              </p>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Button variant='ghost' size='sm' className='gap-1.5 text-muted-foreground hover:text-foreground' onClick={() => setShowHelp(true)}>
                <HelpCircle className='size-4' />
                ¿Cómo usar?
              </Button>
              <Button variant='outline' onClick={handleLoadSample}>
                <FileSearch className='size-4' />
                Cargar ejemplo
              </Button>
              <Button variant='outline' onClick={handleClear}>
                <RefreshCcw className='size-4' />
                Limpiar
              </Button>
              <Button onClick={handleAnalyze} disabled={!auditReady}>
                {analysis.isLoading ? (
                  <LoaderCircle className='size-4 animate-spin' />
                ) : (
                  <Sparkles className='size-4' />
                )}
                Analizar Caso
              </Button>
            </div>
          </div>



          <div className='grid flex-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]'>
            <Tabs
              value={activeDocumentTab}
              onValueChange={(val) => setActiveDocumentTab(val as 'clinical' | 'invoice')}
              className='flex flex-col flex-1 min-h-0 w-full'
            >
              <div className='flex items-center justify-between border-b pb-2 mb-2'>
                <TabsList className='grid grid-cols-2 w-72'>
                  <TabsTrigger
                    value='clinical'
                    className='text-xs font-semibold gap-1.5'
                  >
                    <FileText className='size-3.5' />
                    Historia Clínica
                  </TabsTrigger>
                  <TabsTrigger
                    value='invoice'
                    className='text-xs font-semibold gap-1.5'
                  >
                    <FileText className='size-3.5 text-purple-500' />
                    Prefactura
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value='clinical'
                className='m-0 flex-1 min-h-0 overflow-y-auto'
              >
                <PdfUploadPanel
                  id='clinical'
                  title='Cargar historia clínica'
                  description='Sube el PDF de historia clínica para extraer el texto y usarlo en el cruce.'
                  upload={uploads.clinical}
                  onFileChange={handlePdfChange}
                  detections={detections}
                />
              </TabsContent>
              <TabsContent
                value='invoice'
                className='m-0 flex-1 min-h-0 overflow-y-auto'
              >
                <PdfUploadPanel
                  id='invoice'
                  title='Cargar prefactura'
                  description='Sube el PDF de prefactura para extraer cargos, cantidades y soportes facturados.'
                  upload={uploads.invoice}
                  onFileChange={handlePdfChange}
                  detections={detections}
                />
              </TabsContent>
            </Tabs>

            <div className='flex flex-col gap-5'>
              <Card className='flex min-h-0 flex-col gap-0 overflow-hidden rounded-lg py-0 border shadow-xs'>
                <CardHeader className='border-b px-4 pt-3 pb-2'>
                  <div className='flex items-center gap-2'>
                    <BrainCircuit className='size-4 text-primary' />
                    <CardTitle className='text-base font-bold'>
                      Diagnóstico Auditor IA
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className='flex min-h-0 flex-1 flex-col px-0 py-0'>
                  {analysis.isLoading ? (
                    <div className='flex flex-col items-center justify-center p-8 text-center'>
                      <LoaderCircle className='mb-3 size-8 animate-spin text-primary' />
                      <p className='text-sm font-semibold'>Analizando caso de auditoría...</p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        {analysis.message || 'Por favor espera mientras el backend procesa y audita el caso.'}
                      </p>
                    </div>
                  ) : analysis.error ? (
                    <div className='space-y-3 p-5'>
                      <Alert variant='destructive'>
                        <AlertTriangle className='size-4' />
                        <AlertTitle>Error en el análisis</AlertTitle>
                        <AlertDescription>{analysis.error}</AlertDescription>
                      </Alert>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleAnalyze}
                        className='w-full'
                      >
                        <RefreshCcw className='mr-2 size-3.5' /> Reintentar Análisis
                      </Button>
                    </div>
                  ) : !hasRunAudit ? (
                    <div className='p-5'>
                      <Alert>
                        <BrainCircuit />
                        <AlertTitle>Auditoría lista</AlertTitle>
                        <AlertDescription>
                          Carga ambos PDFs o un ejemplo y presiona <strong>Analizar Caso</strong> para obtener las glosas.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (() => {
                    const glosaDetections = detections.filter(
                      (d) => d.category !== 'advertencia'
                    )

                    const advertenciaDetections = detections.filter(
                      (d) => d.category === 'advertencia'
                    )

                    const seenWarningTexts = new Set<string>()
                    const uniqueAdvertencias: Array<{
                      id: string
                      detection?: Detection
                      warning?: string
                    }> = []

                    advertenciaDetections.forEach((d) => {
                      const textKey = normalizeText(d.evidence || d.title)
                      if (!seenWarningTexts.has(textKey)) {
                        seenWarningTexts.add(textKey)
                        uniqueAdvertencias.push({ id: d.id, detection: d })
                      }
                    })

                    analysis.warnings.forEach((w, i) => {
                      const textKey = normalizeText(w)
                      if (!seenWarningTexts.has(textKey)) {
                        seenWarningTexts.add(textKey)
                        uniqueAdvertencias.push({ id: `warn-raw-${i}`, warning: w })
                      }
                    })

                    const totalAdvertencias = uniqueAdvertencias.length

                    return (
                      <Tabs defaultValue='glosas' className='w-full flex flex-col flex-1 min-h-0'>
                        <div className='px-4 pt-3 pb-2 border-b bg-muted/20'>
                          <TabsList className='grid grid-cols-2 h-8 w-full'>
                            <TabsTrigger value='glosas' className='text-xs font-semibold gap-1.5 py-1'>
                              <ShieldAlert className='size-3.5 text-red-500' />
                              Glosas ({glosaDetections.length})
                            </TabsTrigger>
                            <TabsTrigger value='advertencias' className='text-xs font-semibold gap-1.5 py-1'>
                              <AlertTriangle className='size-3.5 text-amber-500' />
                              Advertencias ({totalAdvertencias})
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        <TabsContent value='glosas' className='m-0 p-0 flex-1 min-h-0'>
                          <ScrollArea className='h-[620px]'>
                            <div className='space-y-3 p-4'>
                              {glosaDetections.length === 0 ? (
                                <Alert>
                                  <ClipboardCheck />
                                  <AlertTitle>Sin glosas críticas detectadas</AlertTitle>
                                  <AlertDescription>
                                    El cruce no encontró glosas o inconsistencias de pertinencia bajo las reglas actuales de auditoría.
                                  </AlertDescription>
                                </Alert>
                              ) : (
                                glosaDetections.map((detection) => (
                                  <DetectionCard
                                    key={detection.id}
                                    detection={detection}
                                  />
                                ))
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value='advertencias' className='m-0 p-0'>
                          <ScrollArea className='h-[520px]'>
                            <div className='space-y-3 px-5 pt-2.5 pb-5'>
                              {totalAdvertencias === 0 ? (
                                <Alert>
                                  <ClipboardCheck />
                                  <AlertTitle>Sin advertencias secundarias</AlertTitle>
                                  <AlertDescription>
                                    No hay advertencias de cruce o campos faltantes registradas en el análisis.
                                  </AlertDescription>
                                </Alert>
                              ) : (
                                <div className='space-y-3'>
                                  {uniqueAdvertencias.map((item) => (
                                    <AdvertenciaCard
                                      key={item.id}
                                      detection={item.detection}
                                      warning={item.warning}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </Main>

      <AuditResultModal
        open={showResultModal}
        onOpenChange={setShowResultModal}
        isConsistent={detections.length === 0}
        mlResult={mlResult}
      />
    </>
  )
}

