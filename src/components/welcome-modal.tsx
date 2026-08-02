import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const STORAGE_KEY = 'sic_welcome_modal_dismissed'

export function openWelcomeModal() {
  window.dispatchEvent(new CustomEvent('open-welcome-modal'))
}

interface WelcomeModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function WelcomeModal({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: WelcomeModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(true)
  const navigate = useNavigate()

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      setControlledOpen?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true'
    if (!isDismissed && !isControlled) {
      setInternalOpen(true)
    }

    const handleCustomEvent = () => {
      handleOpenChange(true)
    }

    window.addEventListener('open-welcome-modal', handleCustomEvent)
    return () => {
      window.removeEventListener('open-welcome-modal', handleCustomEvent)
    }
  }, [isControlled])

  const handleAccept = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true')
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    handleOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] flex flex-col p-6 gap-0 overflow-hidden font-sans border-border'>
        {/* Cabecera del Memorando */}
        <DialogHeader className='text-start space-y-2 pb-3 border-b border-border'>
          <DialogTitle className='text-lg font-bold text-foreground tracking-tight uppercase'>
            MEMORANDO DE INDUCCIÓN Y PRESENTACIÓN DEL SISTEMA
          </DialogTitle>
        </DialogHeader>

        {/* Cuerpo del Memorando */}
        <div className='flex-1 overflow-y-auto py-4 pr-3 max-h-[60vh] min-h-0 space-y-4 text-xs sm:text-sm text-foreground leading-relaxed'>
          {/* OBJETIVO DEL SISTEMA */}
          <section className='space-y-2'>
            <h4 className='font-bold text-xs uppercase tracking-wider text-foreground border-b pb-0.5 border-border/40'>
              OBJETIVO DEL SISTEMA
            </h4>
            <p className='text-muted-foreground leading-relaxed text-xs sm:text-sm bg-card p-3 rounded border border-border/60'>
              Este sistema implementa un modelo de validación automatizada que cruza los datos de la Historia Clínica (tratamientos, exámenes y diagnósticos) con la pre-factura, emitiendo alertas preventivas de inconsistencias antes de la emisión final del cobro. Actúa como un auditor médico digital para eliminar fugas de ingresos por procedimientos no facturados, reducir glosas y rechazos por falta de soporte clínico, y disminuir la carga operativa de auditorías manuales posteriores a la facturación.
            </p>
          </section>

          {/* MODALIDADES DE AUDITORÍA DISPONIBLES */}
          <section className='space-y-2 pt-1'>
            <h4 className='font-bold text-xs uppercase tracking-wider text-foreground border-b pb-0.5 border-border/40'>
              MODALIDADES DE VALIDACIÓN DISPONIBLES
            </h4>

            {/* Modalidad 1: Tiempo Real API */}
            <div className='p-3.5 rounded border border-border/80 bg-muted/40 space-y-1 text-xs'>
              <strong className='font-bold uppercase tracking-wider text-foreground block text-xs'>
                1. INTEGRACIÓN Y VALIDACIÓN EN TIEMPO REAL (VÍA API)
              </strong>
              <p className='text-muted-foreground leading-normal'>
                Para realizar la validación y cruce automático en tiempo real mediante integración API, genere su <strong>API Key</strong> en el módulo de <em>Configuración (`/configuracion/clave-api`)</em>. Consulte la documentación interactiva de la API en:{' '}
                <a
                  href='http://localhost:8000/redoc#operation/health_health_get'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary underline font-semibold break-all'
                >
                  http://localhost:8000/redoc#operation/health_health_get
                </a>
              </p>
            </div>

            {/* Modalidad 2: Opción Manual */}
            <div className='p-3.5 rounded border border-border/60 bg-card space-y-1 text-xs mt-2'>
              <strong className='font-bold uppercase tracking-wider text-foreground block text-xs'>
                2. OPCIÓN DE AUDITORÍA MANUAL (VÍA AUDITOR IA)
              </strong>
              <p className='text-muted-foreground leading-normal'>
                Si prefiere la opción manual, diríjase al módulo <em>Auditor IA (`/auditor-ia`)</em> y cargue el archivo PDF de la <strong>Prefactura</strong> junto con la <strong>Historia Clínica</strong> (o archivo RIPS). El motor de Inteligencia Artificial analizará ambos documentos, evaluando la coherencia médica entre diagnósticos (CIE-10), procedimientos (CUPS) y montos facturados.
              </p>
            </div>
          </section>

          {/* PASOS PARA LA AUDITORÍA MANUAL */}
          <section className='space-y-2 pt-1'>
            <h4 className='font-bold text-xs uppercase tracking-wider text-foreground border-b pb-0.5 border-border/40'>
              PASOS PARA LA AUDITORÍA MANUAL
            </h4>
            <div className='space-y-2 text-xs'>
              <div className='p-3 rounded border border-border/60 bg-card space-y-0.5'>
                <strong className='font-semibold text-foreground block'>
                  1. Carga de Prefactura e Historia Clínica en PDF
                </strong>
                <p className='text-muted-foreground leading-normal'>
                  Ingrese a <em>Auditor IA (`/auditor-ia`)</em> y adjunte el PDF de la prefactura médica y la historia clínica correspondiente.
                </p>
              </div>

              <div className='p-3 rounded border border-border/60 bg-card space-y-0.5'>
                <strong className='font-semibold text-foreground block'>
                  2. Cruce y Clasificación Automatizada
                </strong>
                <p className='text-muted-foreground leading-normal'>
                  La IA emitirá la clasificación (Consistente / Inconsistente) mostrando el nivel de certeza e informe explicativo.
                </p>
              </div>

              <div className='p-3 rounded border border-border/60 bg-card space-y-0.5'>
                <strong className='font-semibold text-foreground block'>
                  3. Seguimiento en Radicados y Glosas
                </strong>
                <p className='text-muted-foreground leading-normal'>
                  Consulte el estado general en <em>Radicados API (`/radicados-api`)</em> y gestione tareas u observaciones en <em>Glosas (`/tasks`)</em>.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Pie del Memorando / Aceptación */}
        <DialogFooter className='border-t border-border pt-3 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3'>
          <div className='flex items-center space-x-2 w-full sm:w-auto justify-start'>
            <Checkbox
              id='dont-show-again'
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(!!checked)}
            />
            <label
              htmlFor='dont-show-again'
              className='text-xs text-muted-foreground font-medium cursor-pointer select-none'
            >
              Marcar memorando como leído (no mostrar al iniciar)
            </label>
          </div>

          <div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                handleAccept()
                navigate({ to: '/help-center' })
              }}
              className='text-xs'
            >
              Ver Equipo
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={handleAccept}
              className='text-xs font-semibold px-4'
            >
              Confirmar Lectura e Iniciar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
