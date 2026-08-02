import { useState } from 'react'
import {
  AlertTriangle,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export type DetectionLevel = 'Alta' | 'Media' | 'Baja'

export type BackendGlosaEvidencia = {
  codigo_cups?: string
  descripcion?: string
  cantidad_historia?: number
  cantidad_prefactura?: number
  unidades_faltantes?: number
  sexo_paciente?: string
  sexo_permitido?: string
  fuente_sexo_paciente?: string
  fuente_cups?: string
  [key: string]: unknown
}

export type Detection = {
  id: string
  title: string
  category: string
  level: DetectionLevel
  probability: number
  evidence: string
  recommendation: string
  codigo?: string
  campo?: string
  referenciaNormativa?: string
  evidenciaDetalle?: BackendGlosaEvidencia
}

export type PdfApiResponse = {
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

export type ClinicalField = {
  label: string
  value: string
}

export type ClinicalDocumentSection = {
  title: string
  fields: ClinicalField[]
}

export type ClinicalProcedureView = {
  id: string
  tipo: string
  cups: string
  descripcion: string
  cantidad: string
  soporte: string
}

export type ClinicalDocumentView = {
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

export type InvoiceItemView = {
  id: string
  codigo: string
  descripcion: string
  cantidad: string
  valorUnitario: string
  valorTotal: string
}

export type InvoiceDocumentView = {
  idPrefactura: string
  idAtencion: string
  idPaciente: string
  nombrePaciente: string
  documentoPaciente: string
  tipoDocumento: string
  eps: string
  regimen: string
  fechaFacturacion: string
  subtotal: string
  copago: string
  total: string
  items: InvoiceItemView[]
  camposObligatoriosFaltantes: string[]
  requiereRevisionHumana: string
  sections: ClinicalDocumentSection[]
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function formatFieldLabel(label: string): string {
  return label
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function formatAmountWithDots(value: string | undefined | null): string {
  if (!value || value === 'No reportado') return value || 'No reportado'
  const cleanNum = value.replace(/[^0-9]/g, '')
  if (!cleanNum) return value
  const num = parseInt(cleanNum, 10)
  if (isNaN(num)) return value
  return num.toLocaleString('es-CO')
}

export function getPatientGlosas(detections: Detection[] = []): Detection[] {
  return detections.filter((d) => {
    if (!d) return false
    const fieldNorm = normalizeText(d.campo || '')
    const codeNorm = normalizeText(d.codigo || '')
    const titleNorm = normalizeText(d.title || '')
    const evNorm = normalizeText(d.evidence || '')
    const catNorm = normalizeText(d.category || '')

    return (
      codeNorm.includes('paciente') ||
      codeNorm.includes('documento') ||
      fieldNorm.includes('paciente') ||
      fieldNorm.includes('documento') ||
      fieldNorm.includes('nombre_paciente') ||
      fieldNorm.includes('documento_paciente') ||
      titleNorm.includes('paciente') ||
      titleNorm.includes('documento') ||
      titleNorm.includes('discrepancia') ||
      evNorm.includes('paciente') ||
      evNorm.includes('documento no coincide') ||
      evNorm.includes('difiere') ||
      catNorm === 'paciente' ||
      catNorm === 'incompatibilidad'
    )
  })
}

export function formatValue(val: unknown): string {
  if (val === null || val === undefined || val === '') return 'No reportado'
  if (typeof val === 'boolean') return val ? 'Sí' : 'No'
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val)
    } catch {
      return 'Objeto complejo'
    }
  }
  return String(val)
}

/**
 * Transforma rutas técnicas del backend en etiquetas legibles en español.
 * Ejemplos:
 *   "prefactura.items_facturados[1].codigo_cups_facturado" → "Ítem 2 de prefactura · CUPS facturado"
 *   "historia_clinica.procedimientos[0].cups"             → "Procedimiento 1 · CUPS"
 *   "historia_clinica"                                     → "Historia Clínica"
 */
export function formatCampoLabel(campo?: string): string {
  if (!campo) return 'No especificado'

  const fieldLabels: Record<string, string> = {
    codigo_cups_facturado: 'CUPS facturado',
    codigo_cups: 'CUPS',
    cups: 'CUPS',
    descripcion_servicio_facturado: 'Descripción del servicio',
    descripcion: 'Descripción',
    cantidad_facturada: 'Cantidad facturada',
    cantidad: 'Cantidad',
    valor_unitario: 'Valor unitario',
    valor_total: 'Valor total',
    numero_factura: 'Número de factura',
    fecha_facturacion: 'Fecha de facturación',
    medico_tratante: 'Médico tratante',
    fecha_nacimiento: 'Fecha de nacimiento',
    sexo: 'Sexo',
    genero: 'Género',
    epicrisis: 'Epicrisis',
    evolucion: 'Evolución',
    sede: 'Sede',
    tipo_atencion: 'Tipo de atención',
    diagnostico_principal: 'Diagnóstico principal',
    nombre: 'Nombre',
    documento: 'Documento',
  }

  const sectionLabels: Record<string, string> = {
    prefactura: 'Prefactura',
    historia_clinica: 'Historia clínica',
    items_facturados: 'Ítem de prefactura',
    procedimientos: 'Procedimiento',
    actividades: 'Actividad',
    servicios: 'Servicio',
    atencion: 'Atención',
    paciente: 'Paciente',
  }

  // Extraer índice de arreglo, ej: "[1]" → 2
  const indexMatch = campo.match(/\[(\d+)\]/)
  const itemNumber = indexMatch ? parseInt(indexMatch[1], 10) + 1 : null

  // Obtener el último segmento del path como campo final
  const cleanPath = campo.replace(/\[\d+\]/g, '')
  const segments = cleanPath.split('.').filter(Boolean)

  const lastSegment = segments[segments.length - 1] || ''
  const parentSegment = segments[segments.length - 2] || segments[0] || ''

  const fieldLabel = fieldLabels[lastSegment] || lastSegment.replace(/_/g, ' ')
  const sectionLabel = sectionLabels[parentSegment] || sectionLabels[segments[0]] || segments[0]?.replace(/_/g, ' ') || ''

  const parts: string[] = []
  if (sectionLabel) parts.push(sectionLabel)
  if (itemNumber !== null) parts.push(`#${itemNumber}`)
  if (fieldLabel && fieldLabel !== sectionLabel) parts.push(fieldLabel)

  return parts.join(' · ')
}

export function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

export function getStringFromPaths(
  obj: Record<string, unknown>,
  paths: string[],
  fallback = 'No reportado'
): string {
  for (const path of paths) {
    const parts = path.split('.')
    let current: unknown = obj
    for (const part of parts) {
      if (isRecord(current) && part in current) {
        current = current[part]
      } else {
        current = undefined
        break
      }
    }
    if (current !== undefined && current !== null && current !== '') {
      return formatValue(current)
    }
  }
  return fallback
}

export function getStringArrayFromPaths(
  obj: Record<string, unknown>,
  paths: string[]
): string[] {
  for (const path of paths) {
    const parts = path.split('.')
    let current: unknown = obj
    for (const part of parts) {
      if (isRecord(current) && part in current) {
        current = current[part]
      } else {
        current = undefined
        break
      }
    }
    if (Array.isArray(current)) {
      return current.map(formatValue).filter((item) => item !== 'No reportado')
    }
  }
  return []
}

export function getRecordsFromPaths(
  obj: Record<string, unknown>,
  paths: string[]
): Array<Record<string, unknown>> {
  for (const path of paths) {
    const parts = path.split('.')
    let current: unknown = obj
    for (const part of parts) {
      if (isRecord(current) && part in current) {
        current = current[part]
      } else {
        current = undefined
        break
      }
    }
    if (Array.isArray(current)) {
      return current.filter(isRecord)
    }
  }
  return []
}

export function formatSexoLabel(sexo?: string) {
  if (!sexo) return 'No especificado'
  const upper = String(sexo).toUpperCase()
  if (upper === 'M' || upper === 'MASCULINO') return 'M (Masculino)'
  if (upper === 'F' || upper === 'FEMENINO') return 'F (Femenino)'
  return sexo
}

export function formatFuenteDato(fuenteSexo?: string, fuenteCups?: string) {
  const parts: string[] = []
  if (fuenteCups) parts.push(fuenteCups)
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

export function collectClinicalFields(val: unknown, prefix = ''): ClinicalField[] {
  if (!isRecord(val)) return []
  const fields: ClinicalField[] = []
  Object.entries(val).forEach(([key, subVal]) => {
    const fieldLabel = prefix ? `${prefix} - ${formatFieldLabel(key)}` : formatFieldLabel(key)
    if (isRecord(subVal)) {
      fields.push(...collectClinicalFields(subVal, fieldLabel))
    } else if (Array.isArray(subVal)) {
      fields.push({
        label: fieldLabel,
        value: subVal.map(formatValue).join(', ') || 'Sin elementos',
      })
    } else {
      fields.push({ label: fieldLabel, value: formatValue(subVal) })
    }
  })
  return fields
}

export function buildClinicalSections(data: Record<string, unknown>) {
  const sections: ClinicalDocumentSection[] = []
  const sectionSources: Array<[string, unknown]> = [
    ['Paciente', data.paciente],
    ['Historia clínica', data.historia_clinica],
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

export function buildInvoiceSections(data: Record<string, unknown>) {
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

export function buildClinicalDocumentView(response: PdfApiResponse): ClinicalDocumentView {
  const data = response.data ?? {}
  const clinical = isRecord(data.historia_clinica) ? data.historia_clinica : {}
  const patient = isRecord(data.paciente) ? data.paciente : {}
  const diagnosis = isRecord(clinical.diagnostico_principal)
    ? clinical.diagnostico_principal
    : isRecord(data.diagnostico_principal)
    ? data.diagnostico_principal
    : {}
  const activityRecords = getRecordsFromPaths(data, [
    'historia_clinica.atencion.items',
    'historia_clinica.procedimientos',
    'historia_clinica.actividades',
    'historia_clinica.servicios',
    'atencion.items',
    'procedimientos',
    'actividades',
    'servicios',
  ])
  const procedureRecords = activityRecords.length > 0 ? activityRecords : getRecordsFromPaths(clinical, [
    'atencion.items',
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
  const activity = procedureRecords[0] ?? {}

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

export function buildInvoiceDocumentView(response: PdfApiResponse): InvoiceDocumentView {
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
    subtotal: getStringFromPaths({ invoice, data }, [
      'invoice.subtotal',
      'invoice.valor_total',
      'invoice.total',
      'data.subtotal',
      'data.valor_total',
    ], firstItemTotal ?? 'No reportado'),
    copago: getStringFromPaths({ invoice, data }, [
      'invoice.copago',
      'invoice.descuento',
      'data.copago',
    ]),
    total: getStringFromPaths({ invoice, data }, [
      'invoice.total',
      'invoice.valor_total',
      'invoice.total_facturado',
      'data.total',
      'data.valor_total',
    ], firstItemTotal ?? 'No reportado'),
    items: renderedItems,
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

function getLevelStyles(level: DetectionLevel) {
  if (level === 'Alta') {
    return {
      badge: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
      bar: 'bg-red-500',
    }
  }
  if (level === 'Media') {
    return {
      badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
      bar: 'bg-amber-500',
    }
  }
  return {
    badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300',
    bar: 'bg-blue-500',
  }
}

export function DetalleEvidenciaFuga({
  evidencia,
}: {
  evidencia: BackendGlosaEvidencia
}) {
  const cantidadHistoria = evidencia.cantidad_historia ?? 1
  const cantidadPrefactura = evidencia.cantidad_prefactura ?? 0
  const unidadesFaltantes =
    evidencia.unidades_faltantes ?? (cantidadHistoria - cantidadPrefactura)

  return (
    <div className='mt-2 p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-md border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200'>
      <div className='font-semibold text-zinc-900 dark:text-zinc-100 mb-1'>
        <span>Detalle de Oportunidad de Cobro:</span>
      </div>
      <ul className='space-y-1 text-zinc-700 dark:text-zinc-300'>
        <li>
          <strong>CUPS:</strong> {evidencia.codigo_cups || 'N/A'}{' '}
          {evidencia.descripcion ? `- ${evidencia.descripcion}` : ''}
        </li>
        <li>
          <strong>En Historia Clínica:</strong> {cantidadHistoria} unidad(es)
        </li>
        <li>
          <strong>En Prefactura:</strong> {cantidadPrefactura} unidad(es)
        </li>
        <li className='font-bold text-zinc-900 dark:text-zinc-100 pt-0.5'>
          <strong>Faltante sin facturar:</strong> {unidadesFaltantes} unidad(es)
        </li>
      </ul>
    </div>
  )
}

export function parseWarningText(text: string) {
  let title = 'Advertencia de Cruce'
  let body = text
  let cups = ''
  let normativa = ''
  let impact = ''

  const cleanText = text.trim()

  if (cleanText.startsWith('Advertencia de pertinencia:')) {
    title = 'Advertencia de Pertinencia'
    body = cleanText.replace(/^Advertencia de pertinencia:\s*/, '').trim()
  } else if (cleanText.startsWith('Advertencia (Fuga de ingreso):')) {
    title = 'Advertencia (Fuga de Ingreso)'
    body = cleanText.replace(/^Advertencia \(Fuga de ingreso\):\s*/, '').trim()
  } else if (cleanText.startsWith('historia_clinica: campos obligatorios faltantes:')) {
    title = 'Campos Obligatorios Faltantes'
    const missing = cleanText.replace(/^historia_clinica: campos obligatorios faltantes:\s*/, '').trim()
    body = `Historia clínica: campos obligatorios faltantes (${missing}).`
  } else if (cleanText.startsWith('historia_clinica: Falta de información')) {
    title = 'Información Incompleta'
    body = 'Historia clínica: Falta de información en algunos campos obligatorios.'
  } else if (cleanText.includes(':')) {
    const parts = cleanText.split(':')
    if (parts[0].length < 40 && !parts[0].includes('.')) {
      title = parts[0].replace(/_/g, ' ').trim()
      title = title.charAt(0).toUpperCase() + title.slice(1)
      body = parts.slice(1).join(':').trim()
    }
  }

  const cupsMatch = body.match(/CUPS\s*([A-Z0-9]+)/i) || body.match(/CUPS\s*:\s*([A-Z0-9]+)/i)
  if (cupsMatch) {
    cups = cupsMatch[1]
  }

  const normMatch = body.match(/\(Res\.\s*[^)]+\)/i) || body.match(/Res\.\s*\d+\s*de\s*\d+/i)
  if (normMatch) {
    normativa = normMatch[0]
  }

  if (body.includes('no genera glosa económica') || cleanText.includes('no genera glosa económica')) {
    impact = 'Sin Glosa Económica'
  } else if (title.includes('Faltantes') || title.includes('Incompleta')) {
    impact = 'Soporte Incompleto'
  }

  return { title, body, cups, normativa, impact }
}

export function AdvertenciaCard({
  warning,
  detection,
}: {
  warning?: string
  detection?: Detection
}) {
  const rawText = warning || detection?.evidence || detection?.title || ''

  return (
    <div className='rounded-xl border border-amber-200/90 bg-amber-50/50 p-4 shadow-xs transition-all duration-200 hover:border-amber-300 dark:border-amber-900/60 dark:bg-amber-950/20 text-zinc-900 dark:text-zinc-100'>
      <div className='flex items-start gap-2.5 text-zinc-800 dark:text-zinc-200'>
        <AlertTriangle className='mt-0.5 size-4 shrink-0 text-amber-500' />
        <div className='text-xs font-medium leading-relaxed text-zinc-800 dark:text-zinc-200'>
          {rawText}
        </div>
      </div>
    </div>
  )
}

export function DetectionCard({ detection }: { detection: Detection }) {
  if (detection.category === 'advertencia') {
    return <AdvertenciaCard detection={detection} />
  }

  const [isExpanded, setIsExpanded] = useState(false)
  const styles = getLevelStyles(detection.level)
  const isHighSeverity = detection.level === 'Alta'
  const isFugaIngreso =
    detection.category === 'fuga_ingreso' ||
    detection.codigo === 'PROCEDIMIENTO_NO_FACTURADO_FUGA_INGRESO' ||
    detection.evidenciaDetalle?.unidades_faltantes !== undefined

  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-xs transition-all duration-200',
        isFugaIngreso
          ? 'border-amber-300 bg-amber-50/70 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100'
          : isHighSeverity
          ? 'border-red-200 bg-red-50/70 text-red-950 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100'
          : 'border-zinc-200 bg-card dark:border-zinc-800'
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 space-y-1.5'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge
              variant='outline'
              className={
                isFugaIngreso
                  ? 'border-amber-300 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : styles.badge
              }
            >
              {detection.level}
            </Badge>
          </div>
          <h3
            className={cn(
              'text-sm font-bold leading-5',
              isFugaIngreso
                ? 'text-amber-900 dark:text-amber-200'
                : isHighSeverity
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
              isFugaIngreso
                ? 'text-amber-600 dark:text-amber-400'
                : isHighSeverity
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
          className={cn(
            'h-full rounded-full',
            isFugaIngreso ? 'bg-amber-500' : styles.bar
          )}
          style={{ width: `${detection.probability}%` }}
        />
      </div>

      <div className='mt-3 space-y-2.5 text-sm'>
        <div>
          <p className='leading-5 text-xs font-medium text-zinc-800 dark:text-zinc-200'>
            {detection.evidence}
          </p>
        </div>

        {/* Action button to expand/collapse extra information */}
        <div
          className={cn(
            'flex items-center justify-between pt-1 border-t',
            isFugaIngreso
              ? 'border-amber-200/60 dark:border-amber-900/40'
              : 'border-red-200/60 dark:border-red-900/40'
          )}
        >
          <button
            type='button'
            onClick={() => setIsExpanded((prev) => !prev)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
              isFugaIngreso
                ? 'bg-amber-100/80 text-amber-800 hover:bg-amber-200/80 dark:bg-amber-900/40 dark:text-amber-300'
                : isHighSeverity
                ? 'bg-red-100/80 text-red-700 hover:bg-red-200/80 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            )}
          >
            <span>
              {isExpanded ? 'Ocultar detalles' : 'Ver más información'}
            </span>
            <ChevronDown
              className={cn(
                'size-3.5 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            />
          </button>
        </div>

        {isExpanded ? (
          <div
            className={cn(
              'space-y-3 pt-2 text-xs border-t animate-in fade-in slide-in-from-top-1 duration-150',
              isFugaIngreso
                ? 'border-amber-200/80 dark:border-amber-900/60'
                : 'border-red-200/80 dark:border-red-900/60'
            )}
          >
            {detection.recommendation ? (
              <div className='space-y-1 leading-5 text-zinc-800 dark:text-zinc-200'>
                <p className='font-semibold text-zinc-900 dark:text-zinc-100'>
                  Recomendación / Glosa:
                </p>
                <p className='text-zinc-700 dark:text-zinc-300'>
                  {detection.recommendation}
                </p>
              </div>
            ) : null}

            {detection.evidenciaDetalle ? (
              isFugaIngreso ||
              detection.evidenciaDetalle.unidades_faltantes !== undefined ? (
                <DetalleEvidenciaFuga evidencia={detection.evidenciaDetalle} />
              ) : (
                <div className='space-y-2 pt-1'>
                  <p className='font-semibold text-red-900 dark:text-red-300 border-b border-red-200/60 pb-1'>
                    Detalle de Evidencia ({detection.title})
                  </p>
                  <div className='grid gap-1.5 text-zinc-800 sm:grid-cols-2 dark:text-zinc-200'>
                    <div>
                      <span className='font-medium text-zinc-500 dark:text-zinc-400'>
                        Código CUPS afectado:
                      </span>{' '}
                      <span className='font-mono font-bold text-zinc-900 dark:text-zinc-100'>
                        {detection.evidenciaDetalle.codigo_cups || detection.campo || 'N/A'}
                      </span>
                    </div>
                    {detection.evidenciaDetalle.sexo_paciente &&
                      detection.evidenciaDetalle.sexo_paciente !== 'No especificado' &&
                      detection.evidenciaDetalle.sexo_paciente !== 'No reportado' && (
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
                      )}
                    {detection.evidenciaDetalle.sexo_permitido &&
                      detection.evidenciaDetalle.sexo_permitido !== 'No especificado' &&
                      detection.evidenciaDetalle.sexo_permitido !== 'No reportado' && (
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
                      )}
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
              )
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ClinicalDocumentCardV2({
  record,
  detections = [],
}: {
  record: ClinicalDocumentView
  detections?: Detection[]
}) {
  const procedures =
    record.procedimientos.length > 0
      ? record.procedimientos
      : [
          {
            id: 'No reportado',
            tipo: record.tipoItem,
            cups: record.codigoCups,
            descripcion: record.descripcion,
            cantidad: record.cantidadRealizada,
            soporte: record.soporteClinico,
          },
        ]

  const patientGlosas = getPatientGlosas(detections)

  return (
    <article className='mx-auto mt-0 mb-4 w-full max-w-4xl rounded-none border bg-white px-7 pt-5 pb-7 text-zinc-950 shadow-sm dark:bg-zinc-50 dark:text-zinc-950'>
      <div className='mb-5 border-b border-zinc-200 pb-3 text-center dark:border-zinc-800'>
        <h2 className='text-lg font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100'>
          HISTORIA CLÍNICA
        </h2>
      </div>

      <div className='space-y-5 text-sm'>
        <section className='rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40'>
          <div className='border-b border-zinc-200/60 pb-3 dark:border-zinc-700/60'>
            <p className='text-[11px] font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-400'>
              Paciente
            </p>
            <p className='mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100'>
              {record.nombrePaciente}
            </p>
          </div>
          <div className='mt-4 grid gap-3 text-xs text-zinc-600 sm:grid-cols-2 lg:grid-cols-4'>
            {[
              ['Tipo documento', record.tipoDocumento],
              ['Documento', record.documentoPaciente],
              ['Sexo', formatSexoLabel(record.sexoPaciente)],
              ['EPS', record.epsAtencion],
              ['Regimen', record.tipoAfiliacion],
            ].map(([label, value]) => {
              const isDocNum = label === 'Documento' && patientGlosas.length > 0
              return (
                <div key={label}>
                  <p className='text-[11px] tracking-wide text-zinc-400 uppercase'>
                    {label}
                  </p>
                  {isDocNum ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type='button'
                          className='mt-1 inline-flex cursor-pointer items-center gap-1.5 font-bold text-red-600 dark:text-red-400 hover:underline focus:outline-hidden'
                        >
                          <AlertTriangle className='size-3.5 animate-pulse text-red-500' />
                          <span>{value}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className='w-84 space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 text-xs shadow-lg max-h-80 overflow-y-auto'
                        side='top'
                      >
                        {patientGlosas.map((glosa, gIdx) => (
                          <div
                            key={glosa.id || gIdx}
                            className='space-y-1.5 border-b last:border-b-0 pb-2.5 last:pb-0 border-zinc-100 dark:border-zinc-800'
                          >
                            <div className='font-bold text-zinc-900 dark:text-zinc-100'>
                              <span>{glosa.title || 'Inconsistencia en Paciente'}</span>
                            </div>
                            <p className='leading-snug text-zinc-700 dark:text-zinc-300'>
                              {glosa.evidence || 'Glosa detectada en los datos del paciente.'}
                            </p>
                            {glosa.recommendation && (
                              <p className='text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-1'>
                                {glosa.recommendation}
                              </p>
                            )}
                          </div>
                        ))}
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className='mt-1 font-medium text-zinc-800 dark:text-zinc-200'>
                      {value}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className='grid gap-3 text-xs text-zinc-600 sm:grid-cols-2 lg:grid-cols-5'>
          {[
            ['ID atencion', record.idAtencion],
            ['Fecha atencion', record.fechaAtencion],
            ['Tipo atencion', record.tipoAtencion],
            [
              'Profesional',
              record.medicoTratante || record.profesionalResponsable || 'No reportado',
            ],
            ['Ciudad', record.ciudad],
          ].map(([label, value]) => (
            <div key={label} className='rounded-lg border border-zinc-200 p-3 dark:border-zinc-800 dark:bg-zinc-900/40'>
              <p className='text-[11px] font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500'>
                {label}
              </p>
              <p className='mt-1 font-semibold text-zinc-800 dark:text-zinc-200 break-words'>{value}</p>
            </div>
          ))}
        </section>

        <section className='space-y-2'>
          <p className='text-[11px] font-medium tracking-wide text-zinc-400 uppercase'>
            Diagnostico principal
          </p>
          <div className='rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3'>
            <p className='leading-6 font-medium text-zinc-900'>
              {record.descripcionDiagnostico}
            </p>
            <p className='mt-1 text-xs text-zinc-500'>
              {record.diagnosticoPrincipalCie10}
            </p>
          </div>
        </section>

        <section className='overflow-hidden rounded-lg border border-zinc-200'>
          <div className='grid grid-cols-[1fr_72px_82px] gap-3 bg-zinc-50 px-4 py-2 text-[11px] font-medium tracking-wide text-zinc-500 uppercase sm:grid-cols-[92px_1fr_72px_82px]'>
            <span className='hidden sm:block'>Tipo</span>
            <span>Procedimiento</span>
            <span className='text-center'>Cant.</span>
            <span className='text-right'>Soporte</span>
          </div>
          <div className='divide-y divide-zinc-100'>
            {procedures.map((procedure, index) => {
              const matchingGlosas = detections.filter((d) => {
                if (!d) return false
                if (
                  d.campo &&
                  (d.campo === `procedimientos[${index}]` ||
                    d.campo === `[${index}]` ||
                    d.campo === `procedimientos.${index}`)
                ) {
                  return true
                }
                if (
                  d.evidenciaDetalle?.codigo_cups &&
                  procedure.cups &&
                  d.evidenciaDetalle.codigo_cups === procedure.cups
                ) {
                  return true
                }
                if (procedure.cups && procedure.cups !== 'No reportado' && procedure.cups.length >= 3) {
                  const cups = procedure.cups
                  if (
                    d.codigo === cups ||
                    d.campo === cups ||
                    (d.evidence && d.evidence.includes(cups)) ||
                    (d.recommendation && d.recommendation.includes(cups)) ||
                    (d.title && d.title.includes(cups))
                  ) {
                    return true
                  }
                }
                if (
                  d.codigo === 'CUPS_NO_PERTINENTE_POR_SEXO' ||
                  d.title?.includes('Género') ||
                  d.title?.includes('Sexo') ||
                  d.category === 'pertinencia'
                ) {
                  if (
                    procedure.cups === '659510' ||
                    (procedure.cups && d.evidence?.includes(procedure.cups)) ||
                    (procedure.cups && d.recommendation?.includes(procedure.cups))
                  ) {
                    return true
                  }
                }
                return false
              })

              const isGlosa = matchingGlosas.length > 0

              return (
                <div
                  key={`${procedure.cups}-${procedure.descripcion}-${index}`}
                  className={cn(
                    'grid grid-cols-[1fr_72px_82px] items-start gap-3 px-4 py-3 text-zinc-800 sm:grid-cols-[92px_1fr_72px_82px] transition-colors',
                    isGlosa &&
                      'bg-amber-50/60 font-medium text-amber-950 dark:bg-amber-950/30 dark:text-amber-200'
                  )}
                >
                  <p className='hidden text-xs font-medium text-zinc-500 sm:block'>
                    {procedure.tipo}
                  </p>
                  <div>
                    <p className='leading-5 font-medium'>
                      {procedure.descripcion}
                    </p>
                    <div className='mt-1 text-xs text-zinc-500 flex items-center gap-1.5'>
                      {isGlosa ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type='button'
                              className='inline-flex cursor-pointer items-center gap-1.5 font-bold text-red-600 dark:text-red-400 hover:underline focus:outline-hidden'
                            >
                              <AlertTriangle className='size-3.5 animate-pulse text-red-500' />
                              <span>{procedure.cups}</span>
                              {matchingGlosas.length > 1 && (
                                <span className='rounded bg-red-100 dark:bg-red-950 px-1 py-0.2 text-[10px] text-red-700 dark:text-red-300 font-extrabold'>
                                  ({matchingGlosas.length})
                                </span>
                              )}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className='w-84 space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 text-xs shadow-lg max-h-80 overflow-y-auto'
                            side='top'
                          >
                            {matchingGlosas.map((glosa, gIdx) => {
                              const glosaIsFuga =
                                glosa.category === 'fuga_ingreso' ||
                                glosa.codigo === 'PROCEDIMIENTO_NO_FACTURADO_FUGA_INGRESO' ||
                                glosa.evidenciaDetalle?.unidades_faltantes !== undefined

                              return (
                                <div
                                  key={glosa.id || gIdx}
                                  className='space-y-1.5 border-b last:border-b-0 pb-2.5 last:pb-0 border-zinc-100 dark:border-zinc-800'
                                >
                                  <div className='font-bold text-zinc-900 dark:text-zinc-100'>
                                    <span>{glosa.title || 'Glosa Detectada'}</span>
                                  </div>
                                  <p className='leading-snug text-zinc-700 dark:text-zinc-300'>
                                    {glosa.evidence || 'Glosa detectada en la auditoría.'}
                                  </p>
                                  {glosa.evidenciaDetalle && (
                                    glosaIsFuga ||
                                    glosa.evidenciaDetalle.unidades_faltantes !== undefined ? (
                                      <DetalleEvidenciaFuga evidencia={glosa.evidenciaDetalle} />
                                    ) : (
                                      <div className='space-y-1 rounded-md border border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 dark:border-zinc-700 p-2 text-[11px] text-zinc-800 dark:text-zinc-200'>
                                        <div>
                                          <strong>Código CUPS afectado:</strong>{' '}
                                          {glosa.evidenciaDetalle.codigo_cups}
                                        </div>
                                        {glosa.evidenciaDetalle.sexo_paciente &&
                                          glosa.evidenciaDetalle.sexo_paciente !== 'No especificado' &&
                                          glosa.evidenciaDetalle.sexo_paciente !== 'No reportado' && (
                                            <div>
                                              <strong>Sexo registrado en paciente:</strong>{' '}
                                              {formatSexoLabel(
                                                glosa.evidenciaDetalle.sexo_paciente
                                              )}
                                            </div>
                                          )}
                                        {glosa.evidenciaDetalle.sexo_permitido &&
                                          glosa.evidenciaDetalle.sexo_permitido !== 'No especificado' &&
                                          glosa.evidenciaDetalle.sexo_permitido !== 'No reportado' && (
                                            <div>
                                              <strong>Sexo permitido por norma:</strong>{' '}
                                              {formatSexoLabel(
                                                glosa.evidenciaDetalle.sexo_permitido
                                              )}
                                            </div>
                                          )}
                                        <div>
                                          <strong>Fuente del dato:</strong>{' '}
                                          {formatFuenteDato(
                                            glosa.evidenciaDetalle
                                              .fuente_sexo_paciente,
                                            glosa.evidenciaDetalle.fuente_cups
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )
                            })}
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span>{procedure.cups}</span>
                      )}
                      <span>- {procedure.id}</span>
                    </div>
                    <p className='mt-1 text-xs font-medium text-zinc-500 sm:hidden'>
                      {procedure.tipo}
                    </p>
                  </div>
                  <p className='text-center'>{procedure.cantidad}</p>
                  <p className='text-right font-medium'>{procedure.soporte}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className='grid gap-3 lg:grid-cols-2'>
          <div className='rounded-lg border border-zinc-200 p-4'>
            <p className='text-[11px] font-medium tracking-wide text-zinc-400 uppercase'>
              Evolucion
            </p>
            <p className='mt-2 leading-6 text-zinc-800'>{record.evolucion}</p>
          </div>
          <div className='rounded-lg border border-zinc-200 p-4'>
            <p className='text-[11px] font-medium tracking-wide text-zinc-400 uppercase'>
              Observaciones
            </p>
            <p className='mt-2 leading-6 text-zinc-800'>
              {record.observaciones}
            </p>
          </div>
        </section>

        <section className='rounded-lg border border-zinc-200 bg-zinc-50/70 p-4'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
              <p className='text-[11px] font-medium tracking-wide text-zinc-400 uppercase'>
                Calidad de extraccion
              </p>
              <div className='mt-2 flex flex-wrap gap-2'>
                {record.camposObligatoriosFaltantes.length > 0 ? (
                  record.camposObligatoriosFaltantes.map((field) => (
                    <span
                      key={field}
                      className='rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700'
                    >
                      Falta: {field}
                    </span>
                  ))
                ) : (
                  <span className='rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700'>
                    Campos obligatorios completos
                  </span>
                )}
              </div>
            </div>
            <div className='text-right'>
              <p className='text-[11px] tracking-wide text-zinc-400 uppercase'>
                Revision humana
              </p>
              <p className='mt-1 font-semibold text-zinc-800'>
                {record.requiereRevisionHumana}
              </p>
            </div>
          </div>
        </section>



        {record.sections.length > 0 ? (
          <details className='rounded-lg border border-zinc-200 p-4 text-xs text-zinc-600'>
            <summary className='cursor-pointer font-medium text-zinc-800'>
              Ver todos los campos del JSON
            </summary>
            <div className='mt-4 space-y-4'>
              {record.sections.map((section) => (
                <section key={section.title}>
                  <p className='mb-2 text-[11px] font-medium tracking-wide text-zinc-400 uppercase'>
                    {section.title}
                  </p>
                  <div className='grid gap-2 sm:grid-cols-2'>
                    {section.fields.map((field, index) => (
                      <div
                        key={`${section.title}-${field.label}-${index}`}
                        className='rounded-md bg-zinc-50 px-3 py-2'
                      >
                        <p className='font-medium text-zinc-500'>{field.label}</p>
                        <p className='mt-1 break-words text-zinc-800'>
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </article>
  )
}

export function InvoiceDocumentCard({
  record,
  detections = [],
}: {
  record: InvoiceDocumentView
  detections?: Detection[]
}) {
  const patientGlosas = getPatientGlosas(detections)

  return (
    <article className='mx-auto mt-0 mb-4 w-full max-w-4xl rounded-lg border border-zinc-200 bg-white p-6 text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50'>
      {/* Encabezado del Documento de Cobro */}
      <div className='mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800'>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400'>
            Documento de Cobro / Prefactura
          </span>
          <h2 className='text-lg font-bold text-zinc-900 dark:text-zinc-100'>
            {record.idPrefactura || 'Prefactura'}
          </h2>
        </div>
        <div className='text-right text-xs leading-5 text-zinc-600 dark:text-zinc-400'>
          <p className='font-semibold text-zinc-900 dark:text-zinc-100'>
            {record.eps}
          </p>
          <p className='font-mono'>{record.fechaFacturacion}</p>
        </div>
      </div>

      <div className='space-y-5 text-sm'>
        {/* Información del Paciente y Atención */}
        <section className='rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40'>
          <div className='border-b border-zinc-200/60 pb-2 dark:border-zinc-700/60'>
            <span className='text-[11px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400'>
              Información del Paciente y Atención
            </span>
          </div>
          <p className='mt-2.5 text-base font-bold text-zinc-900 dark:text-zinc-100'>
            {record.nombrePaciente || 'Sin nombre'}
          </p>
          <div className='mt-3 grid gap-3 text-xs text-zinc-600 dark:text-zinc-400 sm:grid-cols-2 lg:grid-cols-5'>
            {[
              ['Tipo documento', record.tipoDocumento],
              ['N° Documento', record.documentoPaciente],
              ['ID Paciente', record.idPaciente],
              ['ID Atención', record.idAtencion],
              ['Régimen', record.regimen],
            ].map(([label, value]) => {
              const isDocNum = label === 'N° Documento' && patientGlosas.length > 0
              return (
                <div
                  key={label}
                  className='rounded-md border border-zinc-200/80 bg-white p-2.5 dark:border-zinc-700 dark:bg-zinc-900'
                >
                  <p className='text-[10px] font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500'>
                    {label}
                  </p>
                  {isDocNum ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type='button'
                          className='mt-0.5 inline-flex cursor-pointer items-center gap-1.5 font-bold text-red-600 dark:text-red-400 hover:underline focus:outline-hidden truncate'
                        >
                          <AlertTriangle className='size-3.5 animate-pulse text-red-500' />
                          <span>{value || 'No reportado'}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className='w-84 space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 text-xs shadow-lg max-h-80 overflow-y-auto'
                        side='top'
                      >
                        {patientGlosas.map((glosa, gIdx) => (
                          <div
                            key={glosa.id || gIdx}
                            className='space-y-1.5 border-b last:border-b-0 pb-2.5 last:pb-0 border-zinc-100 dark:border-zinc-800'
                          >
                            <div className='font-bold text-zinc-900 dark:text-zinc-100'>
                              <span>{glosa.title || 'Inconsistencia en Paciente'}</span>
                            </div>
                            <p className='leading-snug text-zinc-700 dark:text-zinc-300'>
                              {glosa.evidence || 'Glosa detectada en los datos del paciente.'}
                            </p>
                            {glosa.recommendation && (
                              <p className='text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-1'>
                                {glosa.recommendation}
                              </p>
                            )}
                          </div>
                        ))}
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className='mt-0.5 font-medium text-zinc-800 dark:text-zinc-200 truncate'>
                      {value || 'No reportado'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className='overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-xs'>
              <thead className='bg-blue-50/90 border-b border-blue-200 text-[11px] font-bold tracking-wide text-blue-950 uppercase dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200'>
                <tr>
                  <th className='px-4 py-2.5'>CUPS</th>
                  <th className='px-4 py-2.5'>Descripción Servicio</th>
                  <th className='px-4 py-2.5 text-center'>Cant.</th>
                  <th className='px-4 py-2.5 text-right'>VR. Unitario</th>
                  <th className='px-4 py-2.5 text-right'>VR. Total</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
                {record.items.map((item, index) => {
                  const matchingGlosas = detections.filter((d) => {
                    if (!d) return false
                    if (
                      d.campo &&
                      (d.campo === `items[${index}]` ||
                        d.campo === `[${index}]` ||
                        d.campo === `items_facturados[${index}]`)
                    ) {
                      return true
                    }
                    if (
                      d.evidenciaDetalle?.codigo_cups &&
                      item.codigo &&
                      d.evidenciaDetalle.codigo_cups === item.codigo
                    ) {
                      return true
                    }
                    if (item.codigo && item.codigo !== 'No reportado' && item.codigo.length >= 3) {
                      const code = item.codigo
                      if (
                        d.codigo === code ||
                        d.campo === code ||
                        (d.evidence && d.evidence.includes(code)) ||
                        (d.recommendation && d.recommendation.includes(code)) ||
                        (d.title && d.title.includes(code))
                      ) {
                        return true
                      }
                    }
                    if (
                      d.codigo === 'CUPS_NO_PERTINENTE_POR_SEXO' ||
                      d.title?.includes('Género') ||
                      d.title?.includes('Sexo') ||
                      d.category === 'pertinencia'
                    ) {
                      if (
                        item.codigo === '659510' ||
                        (item.codigo && d.evidence?.includes(item.codigo)) ||
                        (item.codigo && d.recommendation?.includes(item.codigo))
                      ) {
                        return true
                      }
                    }
                    return false
                  })

                  const isGlosa = matchingGlosas.length > 0

                  return (
                    <tr
                      key={`${item.codigo}-${item.descripcion}-${index}`}
                      className='transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'
                    >
                      <td className='px-4 py-3 font-mono font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap'>
                        {isGlosa ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type='button'
                                className='inline-flex cursor-pointer items-center gap-1 font-bold text-red-600 dark:text-red-400 hover:underline focus:outline-none'
                              >
                                <AlertTriangle className='size-3.5 animate-pulse text-red-500' />
                                <span>{item.codigo}</span>
                                {matchingGlosas.length > 1 && (
                                  <span className='rounded bg-red-100 dark:bg-red-950 px-1 py-0.2 text-[10px] text-red-700 dark:text-red-300 font-extrabold'>
                                    ({matchingGlosas.length})
                                  </span>
                                )}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className='w-84 space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 text-xs shadow-lg max-h-80 overflow-y-auto'
                              side='top'
                            >
                              {matchingGlosas.map((glosa, gIdx) => (
                                <div
                                  key={glosa.id || gIdx}
                                  className='space-y-1.5 border-b last:border-b-0 pb-2.5 last:pb-0 border-zinc-100 dark:border-zinc-800'
                                >
                                  <div className='font-bold text-zinc-900 dark:text-zinc-100 border-b pb-1 border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 text-red-600 dark:text-red-400'>
                                    <AlertTriangle className='size-3.5' />
                                    <span>{glosa.title || 'Glosa Detectada'}</span>
                                  </div>
                                  <p className='leading-snug text-zinc-700 dark:text-zinc-300'>
                                    {glosa.evidence || 'Discrepancia en tarifa o facturación.'}
                                  </p>
                                  <div className='rounded-md border border-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 dark:border-zinc-700 p-2 text-[11px] text-zinc-800 dark:text-zinc-200'>
                                    <span className='font-semibold text-zinc-500 dark:text-zinc-400'>Campo afectado: </span>
                                    <span className='font-medium'>{formatCampoLabel(glosa.campo) || item.codigo}</span>
                                  </div>
                                </div>
                              ))}
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <span>{item.codigo}</span>
                        )}
                      </td>
                      <td className='px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200'>
                        {item.descripcion}
                      </td>
                      <td className='px-4 py-3 text-center font-mono text-zinc-700 dark:text-zinc-300'>
                        {item.cantidad}
                      </td>
                      <td className='px-4 py-3 text-right font-mono text-zinc-600 dark:text-zinc-400'>
                        {formatAmountWithDots(item.valorUnitario)}
                      </td>
                      <td className='px-4 py-3 text-right font-mono font-semibold text-zinc-900 dark:text-zinc-100'>
                        {formatAmountWithDots(item.valorTotal)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Resumen de Liquidación */}
        <section className='ml-auto w-full sm:w-72 space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-800'>
          <div className='flex justify-between text-xs text-zinc-600 dark:text-zinc-400'>
            <span>Subtotal</span>
            <span className='font-mono font-medium text-zinc-800 dark:text-zinc-200'>
              {formatAmountWithDots(record.subtotal)}
            </span>
          </div>
          <div className='flex justify-between text-xs text-zinc-600 dark:text-zinc-400'>
            <span>Copago / Descuento</span>
            <span className='font-mono font-medium text-zinc-800 dark:text-zinc-200'>
              {formatAmountWithDots(record.copago)}
            </span>
          </div>
          <div className='flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-950 dark:text-zinc-50 dark:border-zinc-800'>
            <span>Total Prefactura:</span>
            <span className='font-mono text-primary'>{formatAmountWithDots(record.total)}</span>
          </div>
        </section>

        {/* Calidad de Extracción & Revisión Humana */}
        {(record.camposObligatoriosFaltantes?.length > 0 || record.requiereRevisionHumana) && (
          <section className='rounded-lg border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <div>
                <p className='text-[11px] font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500'>
                  Calidad de extracción
                </p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {record.camposObligatoriosFaltantes && record.camposObligatoriosFaltantes.length > 0 ? (
                    record.camposObligatoriosFaltantes.map((field) => (
                      <span
                        key={field}
                        className='rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
                      >
                        Falta: {field}
                      </span>
                    ))
                  ) : (
                    <span className='rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'>
                      Campos obligatorios completos
                    </span>
                  )}
                </div>
              </div>
              {record.requiereRevisionHumana && (
                <div className='text-right'>
                  <p className='text-[11px] tracking-wide text-zinc-400 uppercase dark:text-zinc-500'>
                    Revisión humana
                  </p>
                  <p className='mt-1 font-semibold text-zinc-800 dark:text-zinc-200'>
                    {record.requiereRevisionHumana}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Acordeón para Estructura JSON Completa */}
        {record.sections && record.sections.length > 0 ? (
          <details className='rounded-lg border border-zinc-200 p-4 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400'>
            <summary className='cursor-pointer font-medium text-zinc-800 dark:text-zinc-200'>
              Ver todos los campos del JSON
            </summary>
            <div className='mt-4 space-y-4'>
              {record.sections.map((section) => (
                <section key={section.title}>
                  <p className='mb-2 text-[11px] font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500'>
                    {section.title}
                  </p>
                  <div className='grid gap-2 sm:grid-cols-2'>
                    {section.fields.map((field, index) => (
                      <div
                        key={`${section.title}-${field.label}-${index}`}
                        className='rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50'
                      >
                        <p className='font-medium text-zinc-500 dark:text-zinc-400'>{field.label}</p>
                        <p className='mt-1 break-words text-zinc-800 dark:text-zinc-200'>
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </article>
  )
}
