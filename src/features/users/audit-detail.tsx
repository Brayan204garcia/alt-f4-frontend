import { useMemo } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { roles } from './data/data'
import { type User } from './data/schema'
import { users } from './data/users'

type Severity = 'alta' | 'media' | 'ninguna'

type PdfLine = {
  text: string
  finding?: boolean
  variant?: 'meta' | 'title' | 'muted' | 'section' | 'service' | 'amount'
}

type Finding = {
  id: string
  title: string
  probability: number
  severity: Severity
  evidence: string
  diagnosis: string
}

type ClinicalExample = {
  idAtencion: string
  idPaciente: string
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
  idDetalle: string
  tipoItem: string
  codigoCups: string
  descripcion: string
  cantidadRealizada: number
  fechaRegistro: string
  soporteClinico: string
  profesionalResponsable: string
}

type PreinvoiceExample = {
  idPrefactura: string
  idAtencion: string
  idPaciente: string
  codigoCupsFacturado: string
  descripcionServicioFacturado: string
  cantidadFacturada: number
  valorUnitario: number
  valorTotal: number
  fechaFacturacion: string
  eps: string
}

type CrossExample = {
  idCruce: string
  idAtencion: string
  idPrefactura?: string
  idDetalleHc: string
  resultado: 'CONSISTENTE' | 'INCONSISTENTE'
  tipoAlerta: string
  severidad: Severity
  descripcionAlerta: string
}

const route = getRouteApi('/_authenticated/radicados-api/$radicado')

const clinicalExamples: ClinicalExample[] = [
  {
    idAtencion: 'ATN-000001',
    idPaciente: 'PAC-00295',
    fechaAtencion: '2026-01-12',
    tipoAtencion: 'Urgencias',
    diagnosticoPrincipalCie10: 'I219',
    descripcionDiagnostico: 'Infarto agudo del miocardio, no especificado',
    medicoTratante: 'MED-037',
    sede: 'Sede Urgencias',
    epsAtencion: 'Nueva EPS',
    tipoDocumento: 'TI',
    tipoAfiliacion: 'Subsidiado',
    ciudad: 'Bogota',
    idDetalle: 'DET-0000001',
    tipoItem: 'consulta',
    codigoCups: '890201',
    descripcion: 'Consulta de primera vez medicina general',
    cantidadRealizada: 1,
    fechaRegistro: '2026-01-12 06:00',
    soporteClinico: 'SI',
    profesionalResponsable: 'MED-037',
  },
  {
    idAtencion: 'ATN-000001',
    idPaciente: 'PAC-00295',
    fechaAtencion: '2026-01-12',
    tipoAtencion: 'Urgencias',
    diagnosticoPrincipalCie10: 'I219',
    descripcionDiagnostico: 'Infarto agudo del miocardio, no especificado',
    medicoTratante: 'MED-037',
    sede: 'Sede Urgencias',
    epsAtencion: 'Nueva EPS',
    tipoDocumento: 'TI',
    tipoAfiliacion: 'Subsidiado',
    ciudad: 'Bogota',
    idDetalle: 'DET-0000002',
    tipoItem: 'examen',
    codigoCups: '890701',
    descripcion: 'Electrocardiograma',
    cantidadRealizada: 1,
    fechaRegistro: '2026-01-12 08:00',
    soporteClinico: 'SI',
    profesionalResponsable: 'MED-037',
  },
  {
    idAtencion: 'ATN-000001',
    idPaciente: 'PAC-00295',
    fechaAtencion: '2026-01-12',
    tipoAtencion: 'Urgencias',
    diagnosticoPrincipalCie10: 'I219',
    descripcionDiagnostico: 'Infarto agudo del miocardio, no especificado',
    medicoTratante: 'MED-037',
    sede: 'Sede Urgencias',
    epsAtencion: 'Nueva EPS',
    tipoDocumento: 'TI',
    tipoAfiliacion: 'Subsidiado',
    ciudad: 'Bogota',
    idDetalle: 'DET-0000003',
    tipoItem: 'tratamiento',
    codigoCups: '391201',
    descripcion: 'Angioplastia coronaria',
    cantidadRealizada: 1,
    fechaRegistro: '2026-01-12 01:00',
    soporteClinico: 'SI',
    profesionalResponsable: 'MED-037',
  },
  {
    idAtencion: 'ATN-000002',
    idPaciente: 'PAC-00162',
    fechaAtencion: '2026-04-06',
    tipoAtencion: 'Urgencias',
    diagnosticoPrincipalCie10: 'F411',
    descripcionDiagnostico: 'Trastorno de ansiedad generalizada',
    medicoTratante: 'MED-033',
    sede: 'Sede Centro',
    epsAtencion: 'Sanitas',
    tipoDocumento: 'CE',
    tipoAfiliacion: 'Subsidiado',
    ciudad: 'Barranquilla',
    idDetalle: 'DET-0000004',
    tipoItem: 'consulta',
    codigoCups: '890301',
    descripcion: 'Consulta de control por especialista',
    cantidadRealizada: 1,
    fechaRegistro: '2026-04-06 11:00',
    soporteClinico: 'SI',
    profesionalResponsable: 'MED-033',
  },
  {
    idAtencion: 'ATN-000002',
    idPaciente: 'PAC-00162',
    fechaAtencion: '2026-04-06',
    tipoAtencion: 'Urgencias',
    diagnosticoPrincipalCie10: 'F411',
    descripcionDiagnostico: 'Trastorno de ansiedad generalizada',
    medicoTratante: 'MED-033',
    sede: 'Sede Centro',
    epsAtencion: 'Sanitas',
    tipoDocumento: 'CE',
    tipoAfiliacion: 'Subsidiado',
    ciudad: 'Barranquilla',
    idDetalle: 'DET-0000005',
    tipoItem: 'tratamiento',
    codigoCups: '990601',
    descripcion: 'Interconsulta psiquiatria',
    cantidadRealizada: 1,
    fechaRegistro: '2026-04-06 00:00',
    soporteClinico: 'SI',
    profesionalResponsable: 'MED-033',
  },
]

const preinvoiceExamples: PreinvoiceExample[] = [
  {
    idPrefactura: 'PF-0000001',
    idAtencion: 'ATN-000001',
    idPaciente: 'PAC-00295',
    codigoCupsFacturado: '890201',
    descripcionServicioFacturado: 'Consulta de primera vez medicina general',
    cantidadFacturada: 1,
    valorUnitario: 45000,
    valorTotal: 45000,
    fechaFacturacion: '2026-01-15',
    eps: 'Nueva EPS',
  },
  {
    idPrefactura: 'PF-0000002',
    idAtencion: 'ATN-000001',
    idPaciente: 'PAC-00295',
    codigoCupsFacturado: '890701',
    descripcionServicioFacturado: 'Electrocardiograma',
    cantidadFacturada: 1,
    valorUnitario: 38000,
    valorTotal: 38000,
    fechaFacturacion: '2026-01-15',
    eps: 'Nueva EPS',
  },
  {
    idPrefactura: 'PF-0000003',
    idAtencion: 'ATN-000002',
    idPaciente: 'PAC-00162',
    codigoCupsFacturado: '890301',
    descripcionServicioFacturado: 'Consulta de control por especialista',
    cantidadFacturada: 1,
    valorUnitario: 90000,
    valorTotal: 90000,
    fechaFacturacion: '2026-04-10',
    eps: 'Sanitas',
  },
  {
    idPrefactura: 'PF-0000004',
    idAtencion: 'ATN-000002',
    idPaciente: 'PAC-00162',
    codigoCupsFacturado: '990601',
    descripcionServicioFacturado: 'Interconsulta psiquiatria',
    cantidadFacturada: 1,
    valorUnitario: 130000,
    valorTotal: 130000,
    fechaFacturacion: '2026-04-10',
    eps: 'Sanitas',
  },
  {
    idPrefactura: 'PF-0000005',
    idAtencion: 'ATN-000003',
    idPaciente: 'PAC-00041',
    codigoCupsFacturado: '890301',
    descripcionServicioFacturado: 'Consulta de control por especialista',
    cantidadFacturada: 1,
    valorUnitario: 90000,
    valorTotal: 90000,
    fechaFacturacion: '2026-06-03',
    eps: 'Sura EPS',
  },
]

const crossExamples: CrossExample[] = [
  {
    idCruce: 'CRZ-0000001',
    idAtencion: 'ATN-000001',
    idPrefactura: 'PF-0000001',
    idDetalleHc: 'DET-0000001',
    resultado: 'INCONSISTENTE',
    tipoAlerta: 'DIAGNOSTICO_NO_RELACIONADO',
    severidad: 'media',
    descripcionAlerta:
      'El diagnostico principal no justifica el servicio facturado.',
  },
  {
    idCruce: 'CRZ-0000002',
    idAtencion: 'ATN-000001',
    idPrefactura: 'PF-0000002',
    idDetalleHc: 'DET-0000002',
    resultado: 'INCONSISTENTE',
    tipoAlerta: 'DIAGNOSTICO_NO_RELACIONADO',
    severidad: 'media',
    descripcionAlerta:
      'El diagnostico principal no justifica el servicio facturado.',
  },
  {
    idCruce: 'CRZ-0000003',
    idAtencion: 'ATN-000001',
    idDetalleHc: 'DET-0000003',
    resultado: 'INCONSISTENTE',
    tipoAlerta: 'NO_FACTURADO',
    severidad: 'alta',
    descripcionAlerta:
      'Procedimiento con soporte clinico que no fue facturado en la prefactura.',
  },
  {
    idCruce: 'CRZ-0000004',
    idAtencion: 'ATN-000002',
    idPrefactura: 'PF-0000003',
    idDetalleHc: 'DET-0000004',
    resultado: 'CONSISTENTE',
    tipoAlerta: 'CONSISTENTE',
    severidad: 'ninguna',
    descripcionAlerta: 'Coincide cantidad, codigo y soporte clinico.',
  },
  {
    idCruce: 'CRZ-0000005',
    idAtencion: 'ATN-000002',
    idPrefactura: 'PF-0000004',
    idDetalleHc: 'DET-0000005',
    resultado: 'CONSISTENTE',
    tipoAlerta: 'CONSISTENTE',
    severidad: 'ninguna',
    descripcionAlerta: 'Coincide cantidad, codigo y soporte clinico.',
  },
]

const severityStyles = {
  alta: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
  media:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
  ninguna:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
}

function getSeverityLabel(severity: Severity) {
  return roles.find((role) => role.value === severity)?.label ?? severity
}

function getUserExampleIndex(user: User) {
  const usernameParts = user.username.split('-')
  const radicadoNumber = Number(usernameParts[usernameParts.length - 1])
  return Number.isNaN(radicadoNumber) ? -1 : radicadoNumber - 1
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatClinicalExample(record: ClinicalExample): PdfLine[] {
  return [
    { text: `${record.idAtencion} - ${record.idPaciente}`, variant: 'meta' },
    {
      text: `${record.tipoAtencion} - ${record.fechaAtencion} - ${record.sede}`,
      variant: 'title',
    },
    {
      text: `${record.descripcionDiagnostico} (${record.diagnosticoPrincipalCie10})`,
      variant: 'service',
    },
    {
      text: `${record.descripcion} - ${record.codigoCups}`,
      variant: 'section',
    },
    {
      text: `${record.tipoItem} realizado ${record.cantidadRealizada} vez - ${record.fechaRegistro}`,
    },
    { text: `${record.ciudad}`, variant: 'muted' },
    {
      text: `${record.epsAtencion} - ${record.tipoAfiliacion} - ${record.tipoDocumento}`,
      variant: 'muted',
    },
    {
      text: `${record.medicoTratante} - ${record.profesionalResponsable}`,
      variant: 'muted',
    },
    {
      text:
        record.soporteClinico === 'SI'
          ? 'Soporte clinico confirmado'
          : 'Soporte clinico pendiente',
      variant: 'amount',
      finding: record.soporteClinico !== 'SI',
    },
  ]
}

function formatPreinvoiceExample(record: PreinvoiceExample): PdfLine[] {
  return [
    {
      text: `${record.idPrefactura} - ${record.fechaFacturacion}`,
      variant: 'meta',
    },
    { text: `${record.eps}`, variant: 'title' },
    { text: `${record.idAtencion} - ${record.idPaciente}`, variant: 'muted' },
    {
      text: `${record.descripcionServicioFacturado}`,
      variant: 'service',
    },
    {
      text: `${record.codigoCupsFacturado} - ${record.cantidadFacturada} unidad - ${formatCurrency(record.valorUnitario)}`,
      variant: 'section',
    },
    {
      text: formatCurrency(record.valorTotal),
      variant: 'amount',
    },
  ]
}

function buildAuditData(user: User) {
  const patientName = `${user.firstName} ${user.lastName}`
  const highRisk = user.status === 'inconsistente' && user.role === 'alta'
  const mediumRisk = user.status !== 'consistente' && user.role !== 'ninguna'
  const exampleIndex = getUserExampleIndex(user)
  const clinicalExample = clinicalExamples[exampleIndex]
  const preinvoiceExample = preinvoiceExamples[exampleIndex]
  const crossExample = crossExamples[exampleIndex]

  const findings: Finding[] = crossExample
    ? crossExample.resultado === 'INCONSISTENTE'
      ? [
          {
            id: crossExample.idCruce,
            title: crossExample.tipoAlerta.replace(/_/g, ' '),
            probability: crossExample.severidad === 'alta' ? 94 : 78,
            severity: crossExample.severidad,
            evidence: `${crossExample.idAtencion} - ${crossExample.idPrefactura ?? 'Sin prefactura'} - ${crossExample.idDetalleHc}`,
            diagnosis: crossExample.descripcionAlerta,
          },
        ]
      : []
    : highRisk
      ? [
          {
            id: 'uci',
            title: 'UCI facturada sin soporte clinico',
            probability: 94,
            severity: 'alta',
            evidence:
              'La prefactura incluye estancia en UCI, pero la historia describe hospitalizacion general sin orden de cuidado intensivo.',
            diagnosis:
              'Glosa probable por pertinencia y ausencia de soporte medico del servicio facturado.',
          },
          {
            id: 'drug',
            title: 'Medicamento de alto costo sin trazabilidad',
            probability: 91,
            severity: 'alta',
            evidence:
              'Se cobra pembrolizumab 200 mg sin orden, lote, aplicacion ni justificacion asociada al diagnostico.',
            diagnosis:
              'Riesgo alto de inconsistencia por medicamento no soportado en la evolucion clinica.',
          },
          {
            id: 'image',
            title: 'Imagen diagnostica no documentada',
            probability: 86,
            severity: 'media',
            evidence:
              'La prefactura registra resonancia de torax y la historia solo soporta radiografia simple.',
            diagnosis:
              'Requiere validacion documental antes de aceptar el item en auditoria.',
          },
          {
            id: 'specialist-order',
            title: 'Interconsulta facturada sin orden medica',
            probability: 82,
            severity: 'media',
            evidence:
              'La prefactura incluye interconsulta por cardiologia sin solicitud o nota de respuesta en la historia clinica.',
            diagnosis:
              'Posible glosa por ausencia de soporte documental de la interconsulta.',
          },
          {
            id: 'supplies',
            title: 'Insumos no trazados en evolucion',
            probability: 79,
            severity: 'media',
            evidence:
              'Se cobran insumos especiales sin registro de uso, indicacion o nota de enfermeria relacionada.',
            diagnosis:
              'Validar kardex, notas de enfermeria y soporte de consumo antes de aprobar.',
          },
        ]
      : mediumRisk
        ? [
            {
              id: 'therapy',
              title: 'Cantidad de terapias mayor al soporte',
              probability: 78,
              severity: 'media',
              evidence:
                'La prefactura cobra cuatro sesiones y la historia registra dos sesiones firmadas.',
              diagnosis:
                'Posible ajuste por cantidad excedente frente al soporte clinico disponible.',
            },
            {
              id: 'specialist',
              title: 'Interconsulta con baja relacion diagnostica',
              probability: 72,
              severity: 'media',
              evidence:
                'La interconsulta no tiene nota medica ni orden asociada al diagnostico principal.',
              diagnosis:
                'Validar pertinencia y autorizacion para cerrar el analisis.',
            },
          ]
        : []

  const clinicalLines: PdfLine[] = clinicalExample
    ? formatClinicalExample(clinicalExample)
    : [
        `Paciente: ${patientName}`,
        `EPS: ${user.email}`,
        `Radicado API: ${user.username}`,
        'Ingreso: 10/07/2026. Egreso: 12/07/2026.',
        'Diagnostico principal: neumonia adquirida en comunidad.',
        'Evolucion: manejo en hospitalizacion general, oxigeno por canula nasal y antibiotico.',
        'Soportes: hemograma, radiografia de torax y valoracion por medicina interna.',
        highRisk
          ? {
              text: 'No se documenta orden, ingreso o evolucion en unidad de cuidado intensivo.',
              finding: true,
            }
          : 'Se documenta estancia acorde al nivel de complejidad indicado.',
        highRisk
          ? {
              text: 'No aparece administracion, lote ni autorizacion de medicamento de alto costo.',
              finding: true,
            }
          : mediumRisk
            ? {
                text: 'Solo se evidencian dos sesiones de terapia respiratoria firmadas.',
                finding: true,
              }
            : 'Medicamentos y terapias cuentan con soporte clinico suficiente.',
        'Plan: continuar manejo medico y egreso con recomendaciones.',
      ].map((line) => (typeof line === 'string' ? { text: line } : line))

  const preinvoiceLines: PdfLine[] = preinvoiceExample
    ? formatPreinvoiceExample(preinvoiceExample)
    : [
        `Prefactura recibida por API - ${user.username}`,
        `Paciente: ${patientName}`,
        `Fecha de radicacion: ${user.phoneNumber}`,
        'Estancia hospitalaria general x 2 dias.',
        highRisk
          ? {
              text: 'Unidad de cuidados intensivos UCI x 1 dia.',
              finding: true,
            }
          : 'Observacion hospitalaria general x 1 dia.',
        'Ceftriaxona 1 g x 3 dosis.',
        mediumRisk
          ? { text: 'Terapia respiratoria x 4 sesiones.', finding: true }
          : 'Terapia respiratoria x 2 sesiones.',
        highRisk
          ? {
              text: 'Medicamento alto costo: pembrolizumab 200 mg.',
              finding: true,
            }
          : 'Medicamentos incluidos con soporte de administracion.',
        highRisk
          ? { text: 'Resonancia magnetica de torax.', finding: true }
          : mediumRisk
            ? { text: 'Interconsulta cardiologia.', finding: true }
            : 'Ayudas diagnosticas soportadas en historia clinica.',
        highRisk
          ? { text: 'Interconsulta cardiologia.', finding: true }
          : 'Interconsultas soportadas por orden medica.',
        highRisk
          ? { text: 'Insumos especiales de procedimiento x 3.', finding: true }
          : 'Insumos trazados en notas de enfermeria.',
        'Total prefactura: COP 8.420.000.',
      ].map((line) => (typeof line === 'string' ? { text: line } : line))

  return {
    findings,
    clinicalLines,
    clinicalExample,
    preinvoiceLines,
    preinvoiceExample,
    patientName,
  }
}

function PdfDocument({
  title,
  lines,
  className,
}: {
  title: string
  lines: PdfLine[]
  className?: string
}) {
  return (
    <section className='flex h-full min-h-0 flex-col overflow-hidden'>
      <div className={cn('h-full min-h-0 flex-1 bg-muted/30', className)}>
        <article className='flex h-full min-h-0 w-full flex-col rounded-sm border bg-white px-7 pt-4 pb-7 text-zinc-950 shadow-sm dark:bg-zinc-50'>
          <div className='mb-5 shrink-0 border-b border-zinc-200 pb-3'>
            <h2 className='text-lg font-bold'>{title}</h2>
          </div>
          <ScrollArea className='min-h-0 flex-1'>
            <div className='space-y-2.5 text-sm leading-6'>
              {lines.map((line, index) => (
                <p
                  key={`${line.text}-${index}`}
                  className={cn(
                    'px-1 text-zinc-700',
                    line.variant === 'meta' &&
                      'border-b border-zinc-100 pb-2 text-[11px] font-medium tracking-wide text-zinc-500 uppercase',
                    line.variant === 'title' &&
                      'pt-1 text-base font-semibold text-zinc-950',
                    line.variant === 'muted' &&
                      'text-[13px] leading-5 text-zinc-600',
                    line.variant === 'section' &&
                      'border-l border-zinc-300 py-1 pl-3 text-sm font-medium text-zinc-800',
                    line.variant === 'service' &&
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
          </ScrollArea>
        </article>
      </div>
    </section>
  )
}

function PreinvoiceDocument({
  record,
  className,
}: {
  record: PreinvoiceExample
  className?: string
}) {
  return (
    <section className='flex h-full min-h-0 flex-col overflow-hidden'>
      <div className={cn('h-full min-h-0 flex-1 bg-muted/30', className)}>
        <article className='flex h-full min-h-0 w-full flex-col rounded-sm border bg-white px-7 pt-4 pb-7 text-zinc-950 shadow-sm dark:bg-zinc-50'>
          <div className='mb-5 flex shrink-0 items-start justify-between gap-4 border-b border-zinc-200 pb-3'>
            <div>
              <p className='text-[11px] font-medium tracking-wide text-zinc-500 uppercase'>
                Prefactura
              </p>
              <h2 className='mt-1 text-lg font-bold'>{record.idPrefactura}</h2>
            </div>
            <div className='text-right text-xs leading-5 text-zinc-500'>
              <p>{record.fechaFacturacion}</p>
              <p>{record.eps}</p>
            </div>
          </div>

          <ScrollArea className='min-h-0 flex-1'>
            <div className='space-y-5 text-sm'>
              <div className='grid grid-cols-2 gap-3 border-b border-zinc-100 pb-4 text-xs text-zinc-600'>
                <div>
                  <p className='text-[11px] tracking-wide text-zinc-400 uppercase'>
                    Atencion
                  </p>
                  <p className='mt-1 font-medium text-zinc-800'>
                    {record.idAtencion}
                  </p>
                </div>
                <div>
                  <p className='text-[11px] tracking-wide text-zinc-400 uppercase'>
                    Paciente
                  </p>
                  <p className='mt-1 font-medium text-zinc-800'>
                    {record.idPaciente}
                  </p>
                </div>
              </div>

              <div className='overflow-hidden rounded-sm border border-zinc-200'>
                <div className='grid grid-cols-[1fr_64px_92px] bg-zinc-50 px-3 py-2 text-[11px] font-medium tracking-wide text-zinc-500 uppercase'>
                  <span>Servicio</span>
                  <span className='text-center'>Cant.</span>
                  <span className='text-right'>Valor</span>
                </div>
                <div className='grid grid-cols-[1fr_64px_92px] items-start px-3 py-3 text-zinc-800'>
                  <div>
                    <p className='leading-5 font-medium'>
                      {record.descripcionServicioFacturado}
                    </p>
                    <p className='mt-1 text-xs text-zinc-500'>
                      {record.codigoCupsFacturado}
                    </p>
                  </div>
                  <p className='text-center'>{record.cantidadFacturada}</p>
                  <p className='text-right font-medium'>
                    {formatCurrency(record.valorUnitario)}
                  </p>
                </div>
              </div>

              <div className='ml-auto w-52 space-y-2 border-t border-zinc-200 pt-3'>
                <div className='flex justify-between text-xs text-zinc-500'>
                  <span>Subtotal</span>
                  <span>{formatCurrency(record.valorTotal)}</span>
                </div>
                <div className='flex justify-between text-xs text-zinc-500'>
                  <span>Copago</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className='flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-950'>
                  <span>Total</span>
                  <span>{formatCurrency(record.valorTotal)}</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </article>
      </div>
    </section>
  )
}

function ClinicalDocument({
  record,
  className,
}: {
  record: ClinicalExample
  className?: string
}) {
  return (
    <section className='flex h-full min-h-0 flex-col overflow-hidden'>
      <div className={cn('h-full min-h-0 flex-1 bg-muted/30', className)}>
        <article className='flex h-full min-h-0 w-full flex-col rounded-sm border bg-white px-7 pt-4 pb-7 text-zinc-950 shadow-sm dark:bg-zinc-50'>
          <div className='mb-5 flex shrink-0 items-start justify-between gap-4 border-b border-zinc-200 pb-3'>
            <div>
              <p className='text-[11px] font-medium tracking-wide text-zinc-500 uppercase'>
                Historia Clinica
              </p>
              <h2 className='mt-1 text-lg font-bold'>{record.idAtencion}</h2>
            </div>
            <div className='text-right text-xs leading-5 text-zinc-500'>
              <p>{record.fechaAtencion}</p>
              <p>{record.tipoAtencion}</p>
            </div>
          </div>

          <ScrollArea className='min-h-0 flex-1'>
            <div className='space-y-5 text-sm'>
              <div className='grid grid-cols-2 gap-3 border-b border-zinc-100 pb-4 text-xs text-zinc-600'>
                <div>
                  <p className='text-[11px] tracking-wide text-zinc-400 uppercase'>
                    Paciente
                  </p>
                  <p className='mt-1 font-medium text-zinc-800'>
                    {record.idPaciente}
                  </p>
                </div>
                <div>
                  <p className='text-[11px] tracking-wide text-zinc-400 uppercase'>
                    Documento
                  </p>
                  <p className='mt-1 font-medium text-zinc-800'>
                    {record.tipoDocumento}
                  </p>
                </div>
                <div>
                  <p className='text-[11px] tracking-wide text-zinc-400 uppercase'>
                    EPS
                  </p>
                  <p className='mt-1 font-medium text-zinc-800'>
                    {record.epsAtencion}
                  </p>
                </div>
                <div>
                  <p className='text-[11px] tracking-wide text-zinc-400 uppercase'>
                    Regimen
                  </p>
                  <p className='mt-1 font-medium text-zinc-800'>
                    {record.tipoAfiliacion}
                  </p>
                </div>
              </div>

              <div className='space-y-2'>
                <p className='text-[11px] font-medium tracking-wide text-zinc-400 uppercase'>
                  Diagnostico principal
                </p>
                <div className='border-y border-zinc-200 bg-zinc-50 px-3 py-2'>
                  <p className='leading-6 font-medium text-zinc-900'>
                    {record.descripcionDiagnostico}
                  </p>
                  <p className='mt-1 text-xs text-zinc-500'>
                    {record.diagnosticoPrincipalCie10}
                  </p>
                </div>
              </div>

              <div className='overflow-hidden rounded-sm border border-zinc-200'>
                <div className='grid grid-cols-[1fr_64px_92px] bg-zinc-50 px-3 py-2 text-[11px] font-medium tracking-wide text-zinc-500 uppercase'>
                  <span>Actividad</span>
                  <span className='text-center'>Cant.</span>
                  <span className='text-right'>Soporte</span>
                </div>
                <div className='grid grid-cols-[1fr_64px_92px] items-start px-3 py-3 text-zinc-800'>
                  <div>
                    <p className='leading-5 font-medium'>
                      {record.descripcion}
                    </p>
                    <p className='mt-1 text-xs text-zinc-500'>
                      {record.codigoCups} - {record.tipoItem}
                    </p>
                  </div>
                  <p className='text-center'>{record.cantidadRealizada}</p>
                  <p className='text-right font-medium'>
                    {record.soporteClinico}
                  </p>
                </div>
              </div>

              <div className='space-y-2 border-t border-zinc-200 pt-3 text-xs leading-5 text-zinc-600'>
                <p>
                  {record.sede} - {record.ciudad}
                </p>
                <p>{record.fechaRegistro}</p>
                <p className='font-medium text-zinc-800'>
                  {record.medicoTratante} - {record.profesionalResponsable}
                </p>
              </div>
            </div>
          </ScrollArea>
        </article>
      </div>
    </section>
  )
}

function DocumentsPanel({
  preinvoiceLines,
  preinvoiceExample,
  clinicalLines,
  clinicalExample,
}: {
  preinvoiceLines: PdfLine[]
  preinvoiceExample?: PreinvoiceExample
  clinicalLines: PdfLine[]
  clinicalExample?: ClinicalExample
}) {
  return (
    <Card className='flex min-h-0 flex-col overflow-hidden rounded-lg py-0'>
      <CardContent className='grid min-h-0 flex-1 grid-cols-1 gap-px bg-border p-0 md:grid-cols-2'>
        {preinvoiceExample ? (
          <PreinvoiceDocument record={preinvoiceExample} className='h-full' />
        ) : (
          <PdfDocument
            title='Prefactura'
            lines={preinvoiceLines}
            className='h-full'
          />
        )}
        {clinicalExample ? (
          <ClinicalDocument record={clinicalExample} className='h-full' />
        ) : (
          <PdfDocument
            title='Historia Clinica'
            lines={clinicalLines}
            className='h-full'
          />
        )}
      </CardContent>
    </Card>
  )
}

function DiagnosisPanel({
  user,
  findings,
}: {
  user: User
  findings: Finding[]
}) {
  const mainFinding = findings[0]
  const severity = mainFinding?.severity ?? user.role

  return (
    <Card className='flex min-h-0 flex-col gap-0 overflow-hidden rounded-lg py-0'>
      <CardHeader className='border-b px-4 pt-2.5 pb-1 [.border-b]:pb-1'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <BrainCircuit className='size-4 text-muted-foreground' />
            <CardTitle className='text-base'>Diagnostico IA</CardTitle>
          </div>
          <Badge variant='secondary'>ML</Badge>
        </div>
      </CardHeader>
      <CardContent className='flex min-h-0 flex-1 flex-col px-0 py-0'>
        <div className='shrink-0 px-2 pt-1 pb-1'>
          <div className='rounded-lg border bg-card p-3'>
            <p className='text-sm text-muted-foreground'>Resultado</p>
            <div className='mt-2 flex flex-wrap items-center gap-2'>
              <Badge variant='outline' className={severityStyles[severity]}>
                {getSeverityLabel(severity)}
              </Badge>
              <Badge variant='outline' className='capitalize'>
                {user.status}
              </Badge>
            </div>
            <p className='mt-2 text-sm leading-5'>
              {mainFinding
                ? mainFinding.diagnosis
                : 'El cruce no muestra diferencias relevantes entre historia clinica y prefactura.'}
            </p>
          </div>
        </div>

        <div className='flex min-h-0 flex-1 flex-col border-t'>
          <div className='flex shrink-0 items-center gap-2 px-4 py-2.5'>
            <ShieldAlert className='size-4 text-muted-foreground' />
            <h3 className='text-sm font-semibold'>Hallazgos</h3>
          </div>
          <ScrollArea
            className={cn(
              'min-h-0',
              findings.length > 3 ? 'max-h-[560px] flex-1' : 'flex-none'
            )}
          >
            <div className='space-y-3 px-4 pb-4'>
              {findings.length === 0 ? (
                <div className='rounded-lg border bg-card p-4 text-sm text-muted-foreground'>
                  Sin fallas detectadas para este radicado.
                </div>
              ) : (
                findings.map((finding) => (
                  <div
                    key={finding.id}
                    className='rounded-lg border border-red-200 bg-card p-4 shadow-xs dark:border-red-900/60'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <Badge
                          variant='outline'
                          className={severityStyles[finding.severity]}
                        >
                          {getSeverityLabel(finding.severity)}
                        </Badge>
                        <h3 className='mt-2 text-sm leading-5 font-semibold text-red-700 dark:text-red-300'>
                          {finding.title}
                        </h3>
                      </div>
                      <div className='shrink-0 text-end'>
                        <div className='text-lg font-bold'>
                          {finding.probability}%
                        </div>
                        <div className='text-[11px] text-muted-foreground'>
                          prob.
                        </div>
                      </div>
                    </div>
                    <div className='mt-3 h-2 overflow-hidden rounded-full bg-muted'>
                      <div
                        className='h-full rounded-full bg-red-500'
                        style={{ width: `${finding.probability}%` }}
                      />
                    </div>
                    <div className='mt-3 flex gap-2 text-sm text-muted-foreground'>
                      <AlertTriangle className='mt-0.5 size-4 shrink-0 text-red-500' />
                      <p className='leading-5'>{finding.evidence}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

export function AuditDetail() {
  const { radicado } = route.useParams()
  const navigate = useNavigate()
  const user = users.find((item) => item.username === radicado) ?? users[0]
  const audit = useMemo(() => buildAuditData(user), [user])

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-3 sm:gap-4'>
        <div className='flex flex-wrap items-start justify-between gap-3 border-b pb-3'>
          <div>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => navigate({ to: '/radicados-api' })}
              >
                <ArrowLeft className='size-4' />
                <span className='sr-only'>Volver</span>
              </Button>
              <div>
                <h2 className='text-2xl font-bold tracking-tight'>
                  Auditoria {user.username}
                </h2>
                <p className='text-sm text-muted-foreground'>
                  {audit.patientName} - {user.email} - {user.phoneNumber}
                </p>
              </div>
            </div>
          </div>
          <Badge variant='outline' className={severityStyles[user.role]}>
            Severidad {getSeverityLabel(user.role)}
          </Badge>
        </div>

        <div className='grid min-h-0 flex-1 gap-5 overflow-hidden xl:grid-cols-[minmax(0,1fr)_360px]'>
          <DocumentsPanel
            preinvoiceLines={audit.preinvoiceLines}
            preinvoiceExample={audit.preinvoiceExample}
            clinicalLines={audit.clinicalLines}
            clinicalExample={audit.clinicalExample}
          />
          <DiagnosisPanel user={user} findings={audit.findings} />
        </div>
      </Main>
    </>
  )
}
