import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Calendar,
  ExternalLink,
  FileText,
  Hash,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  buildClinicalDocumentView,
  buildInvoiceDocumentView,
  ClinicalDocumentCardV2,
  formatCampoLabel,
  InvoiceDocumentCard,
  type Detection,
  type DetectionLevel,
} from '@/features/chats/components/document-cards'
import { formatFechaSegura, sanitizeString } from '../api/casos-api'
import { type CasoAuditoriaTablaItem } from '../data/schema'

interface ModalDetalleCasoProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  caso: CasoAuditoriaTablaItem | null
}

export function ModalDetalleCaso({
  open,
  onOpenChange,
  onClose,
  caso,
}: ModalDetalleCasoProps) {
  const navigate = useNavigate()

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange?.(newOpen)
    if (!newOpen) {
      onClose?.()
    }
  }

  const handleGoToFullAudit = () => {
    if (!caso) return
    handleOpenChange(false)
    navigate({
      to: '/radicados-api/$radicado',
      params: { radicado: caso.id },
    })
  }

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
    const pfPaciente = pf.paciente || {}
    const payload = {
      data: {
        id_prefactura: pf.numero_factura || pf.id_prefactura || `FAC-${caso.id}`,
        id_atencion: pf.id_atencion || caso.id,
        documento_paciente: pf.documento_paciente || pf.documento || pfPaciente.documento || pfPaciente.documento_paciente,
        nombre_paciente: pf.nombre_paciente || pf.nombre || pfPaciente.nombre_completo || pfPaciente.nombre,
        eps: pf.eps || pfPaciente.eps || caso.eps,
        fecha_facturacion: pf.fecha_facturacion || pf.fecha_atencion || caso.fecha_atencion,
        paciente: pfPaciente,
        prefactura: pf,
        ...pf,
      },
    }
    return buildInvoiceDocumentView(payload)
  }, [caso])

  const detections: Detection[] = useMemo(() => {
    if (!caso || !caso.glosas_resumen) return []
    return caso.glosas_resumen.map((glosa, idx) => {
      const sev = (glosa.severidad || 'media').toLowerCase()
      const level: DetectionLevel =
        sev === 'alta' ? 'Alta' : sev === 'media' ? 'Media' : 'Baja'
      const isFuga =
        glosa.categoria === 'fuga_ingreso' ||
        glosa.codigo === 'PROCEDIMIENTO_NO_FACTURADO_FUGA_INGRESO'

      const itemNombre =
        glosa.evidencia?.descripcion ||
        glosa.evidencia?.codigo_cups ||
        glosa.campo ||
        'Procedimiento No Facturado'

      return {
        id: glosa.codigo ? `${glosa.codigo}-${idx}` : `GLOSA-${idx + 1}`,
        title: isFuga
          ? `Fuga de Ingreso (${itemNombre})`
          : `${glosa.codigo} - ${glosa.categoria}`,
        category: glosa.categoria || 'Glosa de Auditoría',
        level,
        probability: level === 'Alta' ? 94 : level === 'Media' ? 78 : 62,
        evidence: glosa.descripcion || 'Discrepancia detectada.',
        recommendation: isFuga
          ? 'Recomendación a IPS: Oportunidad de recaudo no cobrada. Verificar la adición del procedimiento en la prefactura.'
          : `Verificar pertinencia del campo ${formatCampoLabel(glosa.campo)}.`,
        codigo: glosa.codigo,
        campo: glosa.campo,
        evidenciaDetalle: (glosa.evidencia as any) || {
          codigo_cups: glosa.campo,
        },
      }
    })
  }, [caso])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto p-6'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold flex items-center gap-2'>
            <FileText className='h-5 w-5 text-primary' />
            Reconstrucción de Documentos (Auditor IA)
          </DialogTitle>
          <DialogDescription>
            Vista consolidada con los componentes idénticos a Auditor IA.
          </DialogDescription>
        </DialogHeader>

        {caso && hcView && pfView ? (
          <div className='space-y-5 py-2'>
            {/* Resumen Superior */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg bg-zinc-50/80 dark:bg-zinc-900/60'>
              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground flex items-center gap-1 font-medium'>
                  <Hash size={14} /> ID Caso / Radicado
                </span>
                <p className='font-mono text-sm font-bold text-foreground truncate'>
                  {sanitizeString(caso.id)}
                </p>
              </div>

              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground flex items-center gap-1 font-medium'>
                  <Calendar size={14} /> Fecha Atención
                </span>
                <p className='text-sm font-bold text-foreground truncate'>
                  {formatFechaSegura(caso.fecha_atencion)}
                </p>
              </div>

              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground flex items-center gap-1 font-medium'>
                  <User size={14} /> Paciente / EPS
                </span>
                <p className='text-sm font-bold text-foreground truncate'>
                  {sanitizeString(caso.paciente_nombre, 'Sin datos de nombre')}
                </p>
                <p className='text-xs text-muted-foreground font-mono truncate'>
                  {caso.paciente_documento
                    ? `Doc: ${sanitizeString(caso.paciente_documento)}`
                    : 'Sin documento'}{' '}
                  • {sanitizeString(caso.eps, 'Sin EPS')}
                </p>
              </div>

              <div className='space-y-1'>
                <span className='text-xs text-muted-foreground flex items-center gap-1 font-medium'>
                  Estado Auditoría
                </span>
                <div>
                  {caso.es_consistente ? (
                    <Badge
                      variant='outline'
                      className='border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs'
                    >
                      Consistente
                    </Badge>
                  ) : (
                    <Badge
                      variant='outline'
                      className='border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-xs'
                    >
                      {caso.total_glosas || detections.length} Glosas
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Componentes idénticos a Auditor IA */}
            <Tabs defaultValue='historia' className='w-full'>
              <TabsList className='grid grid-cols-2 w-full max-w-sm mb-3'>
                <TabsTrigger value='historia' className='text-xs font-semibold gap-1.5'>
                  <FileText className='size-3.5' />
                  Historia Clínica
                </TabsTrigger>
                <TabsTrigger value='prefactura' className='text-xs font-semibold gap-1.5'>
                  <FileText className='size-3.5 text-purple-500' />
                  Prefactura
                </TabsTrigger>
              </TabsList>

              <TabsContent value='historia' className='m-0 space-y-4'>
                <ClinicalDocumentCardV2 record={hcView} detections={detections} />
              </TabsContent>

              <TabsContent value='prefactura' className='m-0 space-y-4'>
                <InvoiceDocumentCard record={pfView} detections={detections} />
              </TabsContent>
            </Tabs>
          </div>
        ) : null}

        <DialogFooter className='border-t pt-3 flex items-center justify-between sm:justify-between gap-2'>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={handleGoToFullAudit} className='gap-2'>
            <span>Abrir Auditoría Completa</span>
            <ExternalLink size={14} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
