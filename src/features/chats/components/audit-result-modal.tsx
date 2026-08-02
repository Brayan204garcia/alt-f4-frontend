import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type ClasificacionML = {
  clasificacion?: 'CONSISTENTE' | 'INCONSISTENTE' | null
  clasificacion_original_ml?: 'CONSISTENTE' | 'INCONSISTENTE' | null
  interceptado_por_reglas?: boolean
  mensaje_intercepcion?: string | null
  probabilidad_inconsistencia?: number | null
  alerta_cierta?: boolean
  condiciones_activas?: string[]
  explicaciones?: string[]
  punto_operacion?: string | null
  umbral_usado?: number | null
  error?: string | null
  features_utilizadas?: Record<string, unknown> | null
  advertencias_derivacion?: string[]
}

interface AuditResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isConsistent: boolean
  mlResult?: ClasificacionML | null
}

export function AuditResultModal({
  open,
  onOpenChange,
  isConsistent,
  mlResult,
}: AuditResultModalProps) {
  const isIntercepted =
    mlResult?.interceptado_por_reglas ||
    (!isConsistent && mlResult?.clasificacion === 'CONSISTENTE') ||
    (!isConsistent && mlResult?.clasificacion_original_ml === 'CONSISTENTE')

  // If there are glosas (!isConsistent), the final classification is INCONSISTENTE
  const effectiveClasificacion: 'CONSISTENTE' | 'INCONSISTENTE' =
    !isConsistent
      ? 'INCONSISTENTE'
      : mlResult?.clasificacion ?? 'CONSISTENTE'

  const titleText = isIntercepted
    ? 'Nuestro modelo de IA y motor interno detectaron que este cruce es:'
    : 'Nuestro modelo de IA detectó que este cruce es:'

  // Badge config based on effective classification
  const badgeConfig =
    effectiveClasificacion === 'CONSISTENTE'
      ? {
          label: 'CONSISTENTE',
          className:
            'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
        }
      : {
          label: 'INCONSISTENTE',
          className:
            'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300',
        }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md' showCloseButton={false}>
        <DialogHeader className='flex flex-col items-center text-center pt-2 gap-2'>
          <DialogTitle className='text-xl font-bold leading-snug px-2 text-center'>
            {titleText}
          </DialogTitle>

          {/* ── Badge de clasificación ── */}
          <div className='flex items-center justify-center gap-2 mt-1'>
            <Badge
              variant='outline'
              className={`px-4 py-1.5 text-sm font-semibold ${badgeConfig.className}`}
            >
              {badgeConfig.label}
            </Badge>
          </div>

          <p className='text-sm font-bold text-foreground mt-2 px-2 text-center'>
            {effectiveClasificacion === 'INCONSISTENTE'
              ? 'A continuación podrás ver los detalles de las inconsistencias'
              : 'El cruce de información es consistente y cumple con las validaciones.'}
          </p>
        </DialogHeader>

        <DialogFooter className='sm:justify-center justify-center flex mt-2'>
          <Button
            type='button'
            size='lg'
            className='w-full sm:w-auto min-w-[150px]'
            onClick={() => onOpenChange(false)}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
