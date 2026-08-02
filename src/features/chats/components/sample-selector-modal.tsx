import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { SampleScenario, sampleScenarios } from '../data/sample-scenarios'

interface SampleSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectScenario: (scenario: SampleScenario) => void
}

export function SampleSelectorModal({
  open,
  onOpenChange,
  onSelectScenario,
}: SampleSelectorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl max-h-[85vh] p-5 overflow-hidden flex flex-col'>
        <DialogHeader className='pb-3 border-b space-y-1'>
          <DialogTitle className='text-lg font-bold text-foreground'>
            Seleccionar Escenario de Ejemplo
          </DialogTitle>
          <DialogDescription className='text-xs text-muted-foreground'>
            Elige un caso clínico para probar el análisis automático de glosas del Auditor IA.
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 overflow-y-auto pr-1'>
          {sampleScenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => {
                onSelectScenario(scenario)
                onOpenChange(false)
              }}
              className='group relative cursor-pointer flex flex-col justify-between rounded-lg border bg-card p-3.5 shadow-xs transition-all hover:border-primary/60 hover:bg-accent/30 dark:hover:bg-accent/20'
            >
              <div className='space-y-2'>
                <h3 className='font-semibold text-xs text-foreground group-hover:text-primary transition-colors'>
                  {scenario.title}
                </h3>

                <p className='text-[11px] text-muted-foreground leading-relaxed'>
                  {scenario.description}
                </p>
              </div>

              <div className='mt-3 pt-2 border-t flex items-center justify-between gap-2 text-[11px]'>
                <span className='text-muted-foreground font-medium'>
                  {scenario.expectedFindings.glosasCount > 0
                    ? `${scenario.expectedFindings.glosasCount} Glosa(s) esperada(s)`
                    : '0 Glosas (Caso limpio)'}
                </span>

                <span className='font-semibold text-primary group-hover:underline'>
                  Cargar
                </span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
