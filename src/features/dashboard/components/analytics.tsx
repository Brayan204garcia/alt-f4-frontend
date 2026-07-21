import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AnalyticsChart } from './analytics-chart'

export function Analytics() {
  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>Correo de notificaciones</CardTitle>
            <CardDescription>
              Las alertas del auditor llegaran a este correo.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='space-y-2'>
              <Label htmlFor='notification-email'>Correo destino</Label>
              <Input
                id='notification-email'
                type='email'
                placeholder='auditoria@healthlifeips.com'
              />
            </div>
            <p className='text-xs leading-5 text-muted-foreground'>
              Se enviaran notificaciones cuando un cruce tenga severidad media o
              alta.
            </p>
            <Button className='w-full sm:w-fit'>Guardar</Button>
          </CardContent>
        </Card>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Alertas por tipo</CardTitle>
            <CardDescription>
              Distribucion de inconsistencias detectadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={[
                { name: 'Diagnostico no relacionado', value: 2 },
                { name: 'No facturado', value: 1 },
                { name: 'Consistente', value: 2 },
              ]}
              barClass='bg-primary'
              valueFormatter={(n) => `${n}`}
            />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Resumen de actividad</CardTitle>
          <CardDescription>
            Cruces revisados y alertas enviadas durante la semana.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3 px-6'>
          <div className='flex flex-wrap gap-4 text-xs text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <span className='size-2 rounded-full bg-primary' />
              Cruces revisados
            </div>
            <div className='flex items-center gap-2'>
              <span className='size-2 rounded-full bg-muted-foreground' />
              Alertas enviadas
            </div>
          </div>
          <AnalyticsChart />
        </CardContent>
      </Card>
    </div>
  )
}

function SimpleBarList({
  items,
  valueFormatter,
  barClass,
}: {
  items: { name: string; value: number }[]
  valueFormatter: (n: number) => string
  barClass: string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className='space-y-3'>
      {items.map((i) => {
        const width = `${Math.round((i.value / max) * 100)}%`
        return (
          <li key={i.name} className='flex items-center justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <div className='mb-1 truncate text-xs text-muted-foreground'>
                {i.name}
              </div>
              <div className='h-2.5 w-full rounded-full bg-muted'>
                <div
                  className={`h-2.5 rounded-full ${barClass}`}
                  style={{ width }}
                />
              </div>
            </div>
            <div className='ps-2 text-xs font-medium tabular-nums'>
              {valueFormatter(i.value)}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
