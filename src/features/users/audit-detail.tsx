import { useMemo } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  FileText,
  ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  buildClinicalDocumentView,
  buildInvoiceDocumentView,
  ClinicalDocumentCardV2,
  DetectionCard,
  formatCampoLabel,
  InvoiceDocumentCard,
  type Detection,
  type DetectionLevel,
} from '@/features/chats/components/document-cards'
import { useCasoDetailQuery, formatFechaSegura, sanitizeString } from './api/casos-api'

const route = getRouteApi('/_authenticated/radicados-api/$radicado')

const severityStyles: Record<string, string> = {
  alta: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
  media:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
  baja: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300',
  ninguna:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
}

export function AuditDetail() {
  const { radicado } = route.useParams()
  const navigate = useNavigate()

  const { data: caso, isLoading, error } = useCasoDetailQuery(radicado)

  const hcView = useMemo(() => {
    if (!caso) return null
    const hc = caso.historia_clinica_json || {}
    const payload = {
      data: {
        id_atencion: caso.id,
        documento_paciente: caso.paciente_documento,
        nombre_paciente: caso.paciente_nombre,
        eps: caso.eps,
        fecha_atencion: caso.fecha_atencion,
        paciente: {
          nombre_completo: caso.paciente_nombre,
          documento: caso.paciente_documento,
          eps: caso.eps,
          ...hc.paciente,
        },
        historia_clinica: hc,
        ...hc,
      },
    }
    return buildClinicalDocumentView(payload)
  }, [caso])

  const pfView = useMemo(() => {
    if (!caso) return null
    const pf = caso.prefactura_json || {}
    const payload = {
      data: {
        id_prefactura: pf.numero_factura || `FAC-${caso.id}`,
        id_atencion: caso.id,
        documento_paciente: caso.paciente_documento,
        nombre_paciente: caso.paciente_nombre,
        eps: caso.eps,
        fecha_facturacion: caso.fecha_atencion,
        paciente: {
          nombre_completo: caso.paciente_nombre,
          documento: caso.paciente_documento,
          eps: caso.eps,
          ...pf.paciente,
        },
        prefactura: pf,
        ...pf,
      },
    }
    return buildInvoiceDocumentView(payload)
  }, [caso])

  const detections: Detection[] = useMemo(() => {
    if (!caso) return []

    const items: Detection[] = []

    if (Array.isArray(caso.glosas_resumen)) {
      caso.glosas_resumen.forEach((glosa, idx) => {
        const sev = (glosa.severidad || 'media').toLowerCase()
        const level: DetectionLevel =
          sev === 'alta' ? 'Alta' : sev === 'media' ? 'Media' : 'Baja'
        const isFuga =
          glosa.categoria === 'fuga_ingreso' ||
          glosa.codigo === 'PROCEDIMIENTO_NO_FACTURADO_FUGA_INGRESO'

        const catLower = (glosa.categoria || '').toLowerCase()
        const codLower = (glosa.codigo || '').toLowerCase()
        const descLower = (glosa.descripcion || '').toLowerCase()

        const isAdv =
          catLower.includes('advertencia') ||
          codLower.startsWith('adv') ||
          descLower.includes('no genera glosa')

        const itemNombre =
          glosa.evidencia?.descripcion ||
          glosa.evidencia?.codigo_cups ||
          glosa.campo ||
          'Procedimiento No Facturado'

        items.push({
          id: glosa.codigo ? `${glosa.codigo}-${idx}` : `GLOSA-${idx + 1}`,
          title: isFuga
            ? `Fuga de Ingreso (${itemNombre})`
            : `${glosa.codigo} - ${glosa.categoria}`,
          category: isAdv ? 'advertencia' : (glosa.categoria || 'Glosa de Auditoría'),
          level,
          probability: level === 'Alta' ? 94 : level === 'Media' ? 78 : 62,
          evidence:
            glosa.descripcion ||
            'Inconsistencia o discrepancia detectada en la auditoría.',
          recommendation: isFuga
            ? 'Recomendación a IPS: Oportunidad de recaudo no cobrada. Verificar la adición del procedimiento en la prefactura antes de la radicación.'
            : `Validar la consistencia clínica del campo afectado (${formatCampoLabel(glosa.campo)}) frente a la prefactura.`,
          codigo: glosa.codigo,
          campo: glosa.campo,
          evidenciaDetalle: (glosa.evidencia as any) || {
            codigo_cups: glosa.campo,
          },
        })
      })
    }

    if (items.length === 0 && Array.isArray(caso.resultado_analisis_json?.glosas)) {
      caso.resultado_analisis_json.glosas.forEach((g: any, idx: number) => {
        const code = String(g.codigo || `GLOSA-${idx + 1}`)
        const desc = String(g.descripcion || 'Glosa detectada')
        items.push({
          id: `backend-glosa-${idx}`,
          title: code,
          category: 'Glosa de Auditoría',
          level: (g.severidad === 'alta' ? 'Alta' : 'Media') as DetectionLevel,
          probability: 85,
          evidence: desc,
          recommendation: 'Revisar soportes clínicos y prefactura.',
          codigo: code,
          campo: String(g.campo || ''),
        })
      })
    }

    return items
  }, [caso])

  const advertencias: Detection[] = useMemo(() => {
    const list: Detection[] = []
    const seen = new Set<string>()

    detections.forEach((d) => {
      if (d.category === 'advertencia') {
        const key = (d.evidence || d.title).trim()
        if (key && !seen.has(key)) {
          seen.add(key)
          list.push(d)
        }
      }
    })

    const rawAdv = caso?.resultado_analisis_json?.advertencias
    if (Array.isArray(rawAdv)) {
      rawAdv.forEach((item: any, idx: number) => {
        const text =
          typeof item === 'string'
            ? item
            : item?.descripcion || item?.mensaje || item?.detalles || JSON.stringify(item)
        const key = String(text).trim()
        if (key && !seen.has(key)) {
          seen.add(key)
          list.push({
            id: `adv-raw-${idx}`,
            title: key,
            category: 'advertencia',
            level: 'Media',
            probability: 75,
            evidence: key,
            recommendation: 'Revisar los datos obligatorios del soporte clínico y la prefactura.',
          })
        }
      })
    }

    return list
  }, [caso, detections])

  const glosasList = useMemo(() => {
    return detections.filter((d) => d.category !== 'advertencia')
  }, [detections])

  const severidad = caso?.severidad_maxima?.toLowerCase() || 'ninguna'

  // --- Loading state ---
  if (isLoading) {
    return (
      <>
        <Header fixed>
          <Search className='me-auto' />
          <ThemeSwitch />
          <ConfigDrawer />
        </Header>
        <Main className='flex flex-1 flex-col gap-3 sm:gap-4'>
          <div className='flex flex-col gap-3'>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-4 w-96' />
          </div>
          <div className='grid flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]'>
            <Skeleton className='h-full min-h-[400px] rounded-lg' />
            <Skeleton className='h-full min-h-[400px] rounded-lg' />
          </div>
        </Main>
      </>
    )
  }

  // --- Error / not found state ---
  if (error || !caso) {
    return (
      <>
        <Header fixed>
          <Search className='me-auto' />
          <ThemeSwitch />
          <ConfigDrawer />
        </Header>
        <Main className='flex flex-1 flex-col items-center justify-center gap-4'>
          <AlertCircle className='size-12 text-destructive' />
          <div className='text-center'>
            <h2 className='text-xl font-bold'>No se pudo cargar el radicado</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              {error?.message || 'El radicado solicitado no fue encontrado.'}
            </p>
          </div>
          <Button variant='outline' onClick={() => navigate({ to: '/radicados-api' })}>
            <ArrowLeft className='mr-2 size-4' />
            Volver a Radicados
          </Button>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
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
                <h2 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
                  Auditoría Radicado:{' '}
                  <span className='font-mono text-primary'>{sanitizeString(caso.id)}</span>
                </h2>
                <p className='text-sm text-muted-foreground flex flex-wrap items-center gap-1.5 mt-0.5'>
                  <span>Paciente:</span>
                  <span className='font-medium text-foreground'>
                    {sanitizeString(caso.paciente_nombre, 'Sin nombre')}
                  </span>
                  {caso.paciente_documento &&
                    ` (Doc: ${sanitizeString(caso.paciente_documento)})`}
                  <span>•</span>
                  <span>EPS:</span>
                  <span className='font-medium text-foreground'>
                    {sanitizeString(caso.eps, 'No especificada')}
                  </span>
                  <span>•</span>
                  <span>Fecha:</span>
                  <span className='font-medium text-foreground'>
                    {formatFechaSegura(caso.fecha_atencion)}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className={cn(
                'capitalize font-semibold',
                severityStyles[severidad]
              )}
            >
              Severidad: {severidad}
            </Badge>
          </div>
        </div>

        <div className='grid min-h-0 flex-1 gap-5 overflow-hidden xl:grid-cols-[minmax(0,1fr)_380px]'>
          {/* Componentes idénticos de Auditor IA para Historia Clínica y Prefactura */}
          <Tabs defaultValue='historia' className='flex flex-col flex-1 min-h-0'>
            <div className='flex items-center justify-between border-b pb-2 mb-2'>
              <TabsList className='grid grid-cols-2 w-72'>
                <TabsTrigger
                  value='historia'
                  className='text-xs font-semibold gap-1.5'
                >
                  <FileText className='size-3.5' />
                  Historia Clínica
                </TabsTrigger>
                <TabsTrigger
                  value='prefactura'
                  className='text-xs font-semibold gap-1.5'
                >
                  <FileText className='size-3.5 text-purple-500' />
                  Prefactura
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value='historia'
              className='m-0 flex-1 min-h-0 overflow-y-auto'
            >
              {hcView && <ClinicalDocumentCardV2 record={hcView} detections={detections} />}
            </TabsContent>

            <TabsContent
              value='prefactura'
              className='m-0 flex-1 min-h-0 overflow-y-auto'
            >
              {pfView && <InvoiceDocumentCard record={pfView} detections={detections} />}
            </TabsContent>
          </Tabs>

          {/* Panel Lateral de Diagnóstico IA idéntico a Auditor IA */}
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
              <Tabs
                defaultValue='glosas'
                className='w-full flex flex-col flex-1 min-h-0'
              >
                <div className='px-4 pt-3 pb-2 border-b bg-muted/20'>
                  <TabsList className='grid grid-cols-2 h-8 w-full'>
                    <TabsTrigger
                      value='glosas'
                      className='text-xs font-semibold gap-1.5 py-1'
                    >
                      <ShieldAlert className='size-3.5 text-red-500' />
                      Glosas ({glosasList.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value='advertencias'
                      className='text-xs font-semibold gap-1.5 py-1'
                    >
                      <AlertTriangle className='size-3.5 text-amber-500' />
                      Advertencias ({advertencias.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value='glosas'
                  className='m-0 p-0 flex-1 min-h-0'
                >
                  <ScrollArea className='h-[620px]'>
                    <div className='space-y-3 p-4'>
                      {glosasList.length === 0 ? (
                        <div className='rounded-lg border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 text-center text-xs text-emerald-800 dark:text-emerald-300 flex flex-col items-center gap-2'>
                          <CheckCircle2 size={24} className='text-emerald-500' />
                          <p className='font-bold'>Sin glosas detectadas</p>
                          <p className='text-[11px] text-muted-foreground leading-relaxed'>
                            El cruce de datos concuerda con las reglas de auditoría.
                          </p>
                        </div>
                      ) : (
                        glosasList.map((detection) => (
                          <DetectionCard
                            key={detection.id}
                            detection={detection}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent
                  value='advertencias'
                  className='m-0 p-0 flex-1 min-h-0'
                >
                  <ScrollArea className='h-[540px]'>
                    <div className='space-y-3 p-4'>
                      {advertencias.length === 0 ? (
                        <div className='rounded-lg border border-blue-200 bg-blue-50/60 dark:bg-blue-950/20 p-4 text-center text-xs text-blue-800 dark:text-blue-300 flex flex-col items-center gap-2'>
                          <CheckCircle2 size={24} className='text-blue-500' />
                          <p className='font-bold'>Sin advertencias secundarias</p>
                          <p className='text-[11px] text-muted-foreground leading-relaxed'>
                            No hay hallazgos de baja severidad pendientes.
                          </p>
                        </div>
                      ) : (
                        advertencias.map((detection) => (
                          <DetectionCard
                            key={detection.id}
                            detection={detection}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
