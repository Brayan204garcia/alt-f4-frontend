import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'
import { glosaRules } from './data/tasks'

export function Tasks() {
  return (
    <TasksProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Resumen</h2>
          </div>
          <TasksPrimaryButtons />
        </div>
        <div className='grid gap-4 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]'>
          <Card className='h-fit overflow-hidden rounded-lg border-border/70 shadow-xs'>
            <CardHeader className='border-b bg-muted/30 pb-4'>
              <CardTitle className='text-lg font-semibold'>
                Detalle del modelo
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 pt-4'>
              <div className='rounded-md border bg-background p-3'>
                <p className='text-sm font-semibold'>Regresion logistica</p>
              </div>
              <div className='rounded-md border bg-background p-3'>
                <p className='text-sm font-semibold'>
                  Clasificacion binaria - scikit-learn
                </p>
              </div>
              <div className='rounded-md border bg-background p-3'>
                <p className='text-sm font-semibold'>
                  Regularizacion L1 (Lasso)
                </p>
              </div>
              <div className='rounded-md border bg-background p-3'>
                <p className='text-sm font-semibold'>
                  Variables de entrada: 9 features tabulares
                </p>
              </div>
              <div className='rounded-md border bg-background p-3'>
                <p className='text-sm font-semibold'>
                  Salida: probabilidad de inconsistencia
                </p>
              </div>
            </CardContent>
          </Card>

          <div className='space-y-3'>
            <div>
              <h3 className='text-lg font-semibold tracking-tight'>
                Casos de uso
              </h3>
            </div>
            <TasksTable data={glosaRules} />
          </div>
        </div>
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
