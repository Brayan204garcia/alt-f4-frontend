import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  const clasificacion = mlResult?.clasificacion ?? null

  // Badge config based on ML classification (fallback to rule-based)
  const badgeConfig = (() => {
    if (clasificacion === 'CONSISTENTE') {
      return {
        label: 'CONSISTENTE',
        className:
          'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
      }
    }
    if (clasificacion === 'INCONSISTENTE') {
      return {
        label: 'INCONSISTENTE',
        className:
          'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300',
      }
    }
    // null ML → fallback to rule-based detection
    if (isConsistent) {
      return {
        label: 'CONSISTENTE',
        className:
          'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
      }
    }
    return {
      label: 'INCONSISTENTE',
      className:
        'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    }
  })()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md' showCloseButton={false}>
        <DialogHeader className='flex flex-col items-center text-center pt-2 gap-2'>
          <DialogTitle className='text-xl font-bold leading-snug px-2 text-center'>
            Nuestro modelo de IA detectó que este cruce es:
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
            A continuación podrás ver los detalles de las inconsistencias
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
