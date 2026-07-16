import { useState } from 'react'
import {
  AlertTriangle,
  BrainCircuit,
  ClipboardCheck,
  FileSearch,
  FileText,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

type DetectionLevel = 'Alta' | 'Media' | 'Baja'

type Detection = {
  id: string
  title: string
  level: DetectionLevel
  probability: number
  category: string
  evidence: string
  recommendation: string
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

  return auditRules
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
    .sort((a, b) => b.probability - a.probability)
}

export function Chats() {
  const [clinicalRecord, setClinicalRecord] = useState('')
  const [preinvoice, setPreinvoice] = useState('')
  const [detections, setDetections] = useState<Detection[]>([])
  const [hasRunAudit, setHasRunAudit] = useState(false)

  const auditReady =
    clinicalRecord.trim().length > 0 && preinvoice.trim().length > 0

  function handleAnalyze() {
    setDetections(runAudit(clinicalRecord, preinvoice))
    setHasRunAudit(true)
  }

  function handleLoadSample() {
    setClinicalRecord(sampleClinicalRecord)
    setPreinvoice(samplePreinvoice)
    setDetections([])
    setHasRunAudit(false)
  }

  function handleClear() {
    setClinicalRecord('')
    setPreinvoice('')
    setDetections([])
    setHasRunAudit(false)
  }

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main fixed>
        <section className='flex h-full flex-col gap-5'>
          <div className='flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Auditor IA</h1>
              <p className='text-sm text-muted-foreground'>
                Cruce de historia clinica y prefactura para deteccion temprana de
                glosas.
              </p>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Button variant='outline' onClick={handleLoadSample}>
                <FileSearch className='size-4' />
                Cargar ejemplo
              </Button>
              <Button variant='outline' onClick={handleClear}>
                <RefreshCcw className='size-4' />
                Limpiar
              </Button>
              <Button onClick={handleAnalyze} disabled={!auditReady}>
                <Sparkles className='size-4' />
                Analizar con IA ML
              </Button>
            </div>
          </div>

          <div className='grid min-h-0 flex-1 gap-5 overflow-hidden xl:grid-cols-[minmax(560px,1.25fr)_minmax(0,0.75fr)]'>
            <Card className='flex min-h-0 flex-col overflow-hidden rounded-lg py-0'>
              <CardHeader className='border-b px-5 py-4'>
                <CardTitle>Documentos del cruce</CardTitle>
                <CardDescription>
                  Registra los dos insumos antes de ejecutar la auditoria.
                </CardDescription>
              </CardHeader>
              <CardContent className='flex min-h-0 flex-1 flex-col px-5 py-4'>
                <Tabs
                  defaultValue='clinical'
                  className='flex min-h-0 flex-1 flex-col'
                >
                  <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='clinical'>
                      <FileText className='size-4' />
                      Historia
                    </TabsTrigger>
                    <TabsTrigger value='invoice'>
                      <ClipboardCheck className='size-4' />
                      Prefactura
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value='clinical'
                    className='mt-3 min-h-0 flex-1'
                  >
                    <Textarea
                      className='h-full min-h-0 resize-none'
                      placeholder='Pega aqui la historia clinica...'
                      value={clinicalRecord}
                      onChange={(event) => setClinicalRecord(event.target.value)}
                    />
                  </TabsContent>
                  <TabsContent
                    value='invoice'
                    className='mt-3 min-h-0 flex-1'
                  >
                    <Textarea
                      className='h-full min-h-0 resize-none'
                      placeholder='Pega aqui la prefactura...'
                      value={preinvoice}
                      onChange={(event) => setPreinvoice(event.target.value)}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className='flex min-h-0 flex-col gap-5 overflow-hidden'>
              <Card className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg py-0'>
                <CardHeader className='border-b px-5 py-4'>
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <ShieldAlert className='size-4 text-muted-foreground' />
                        <CardTitle>Glosas e inconsistencias</CardTitle>
                      </div>
                    </div>
                    <Badge variant='secondary'>IA ML</Badge>
                  </div>
                </CardHeader>
                <CardContent className='min-h-0 flex-1 px-0 py-0'>
                  {!hasRunAudit ? (
                    <div className='p-5'>
                      <Alert>
                        <BrainCircuit />
                        <AlertTitle>Auditoria lista</AlertTitle>
                        <AlertDescription>
                          Ingresa ambos documentos y ejecuta el analisis para ver
                          posibles glosas.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : detections.length === 0 ? (
                    <div className='p-5'>
                      <Alert>
                        <ClipboardCheck />
                        <AlertTitle>Sin glosas criticas detectadas</AlertTitle>
                        <AlertDescription>
                          El cruce no encontro inconsistencias fuertes bajo las
                          reglas actuales de IA ML.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <ScrollArea className='h-full'>
                      <div className='space-y-3 p-5'>
                        {detections.map((detection) => {
                          const styles = getLevelStyles(detection.level)

                          return (
                            <div
                              key={detection.id}
                              className='rounded-lg border bg-card p-4 shadow-xs'
                            >
                              <div className='flex items-start justify-between gap-3'>
                                <div className='min-w-0 space-y-2'>
                                  <div className='flex flex-wrap items-center gap-2'>
                                    <Badge
                                      variant='outline'
                                      className={styles.badge}
                                    >
                                      {detection.level}
                                    </Badge>
                                    <Badge variant='secondary'>
                                      {detection.category}
                                    </Badge>
                                  </div>
                                  <h2 className='text-sm leading-5 font-semibold'>
                                    {detection.title}
                                  </h2>
                                </div>
                                <div className='shrink-0 text-end'>
                                  <div className='text-lg font-bold'>
                                    {detection.probability}%
                                  </div>
                                  <div className='text-[11px] text-muted-foreground'>
                                    prob.
                                  </div>
                                </div>
                              </div>

                              <div className='mt-3 h-2 overflow-hidden rounded-full bg-muted'>
                                <div
                                  className={cn('h-full rounded-full', styles.bar)}
                                  style={{ width: `${detection.probability}%` }}
                                />
                              </div>

                              <div className='mt-4 space-y-3 text-sm'>
                                <div className='flex gap-2 text-muted-foreground'>
                                  <AlertTriangle className='mt-0.5 size-4 shrink-0' />
                                  <p className='leading-5'>{detection.evidence}</p>
                                </div>
                                <div className='flex gap-2'>
                                  <ClipboardCheck className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
                                  <p className='leading-5'>
                                    {detection.recommendation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </Main>
    </>
  )
}
