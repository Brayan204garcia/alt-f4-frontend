import { BrainCircuit, Layers3 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Main } from '@/components/layout/main'

const modelMetrics = [
  {
    title: 'Modelo ML',
    icon: <BrainCircuit className='h-4 w-4 text-muted-foreground' />,
    desc: 'Modelo de clasificacion para detectar inconsistencias estructuradas entre historia clinica y prefactura.',
    metrics: [
      { label: 'Precision', value: '94.2%' },
      { label: 'Sensibilidad', value: '91.8%' },
      { label: 'Especificidad', value: '89.6%' },
      { label: 'F1 Score', value: '92.9%' },
    ],
  },
  {
    title: 'Modelo Deep Learning',
    icon: <Layers3 className='h-4 w-4 text-muted-foreground' />,
    desc: 'Modelo semantico para interpretar texto clinico, soportes medicos y conceptos facturados.',
    metrics: [
      { label: 'Precision', value: '96.1%' },
      { label: 'Sensibilidad', value: '93.4%' },
      { label: 'Especificidad', value: '92.7%' },
      { label: 'F1 Score', value: '94.7%' },
    ],
  },
]

export function ModelMetrics() {
  return (
    <Main>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Metricas Modelo</h1>
        <p className='text-muted-foreground'>
          Metricas principales de los modelos usados en la auditoria medica.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        {modelMetrics.map((model) => (
          <Card key={model.title}>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>{model.title}</CardTitle>
                {model.icon}
              </div>
              <CardDescription>{model.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-3 sm:grid-cols-2'>
                {model.metrics.map((metric) => (
                  <div key={metric.label} className='rounded-md border p-4'>
                    <p className='text-sm text-muted-foreground'>
                      {metric.label}
                    </p>
                    <p className='mt-1 text-2xl font-bold'>{metric.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Main>
  )
}
