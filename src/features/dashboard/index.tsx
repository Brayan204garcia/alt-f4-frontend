import { useNavigate } from '@tanstack/react-router'
import { BrainCircuit, ClipboardCheck, FileSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { users } from '../users/data/users'
import { Analytics } from './components/analytics'
import { RecentSales } from './components/recent-sales'

const formatCurrency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const totalRadicados = users.length
const inconsistencias = users.filter(
  (user) => user.status === 'inconsistente'
).length
const riesgoAlto = users.filter((user) => user.role === 'alta').length
const valorEnRiesgo = 83000

const metricCards = [
  {
    title: 'Radicados Analizados',
    value: totalRadicados,
  },
  {
    title: 'Inconsistencias Detectadas',
    value: inconsistencias,
  },
  {
    title: 'Riesgo Alto',
    value: riesgoAlto,
  },
  {
    title: 'Valor en Riesgo',
    value: formatCurrency.format(valorEnRiesgo),
  },
]

export function Dashboard() {
  const navigate = useNavigate()

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} className='me-auto' />
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Auditor medico digital
          </h1>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Resumen</TabsTrigger>
              <TabsTrigger value='analytics'>Notificaciones</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {metricCards.map((metric) => (
                <Card key={metric.title}>
                  <CardHeader className='pb-0'>
                    <CardTitle className='text-base leading-5 font-semibold'>
                      {metric.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='-mt-2 pt-0'>
                    <div className='text-3xl leading-none font-bold tracking-tight'>
                      {metric.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 overflow-hidden lg:col-span-4'>
                <CardHeader className='border-b bg-emerald-50/60 pb-3 dark:bg-emerald-950/20'>
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div>
                      <CardTitle>Diagnostico IA</CardTitle>
                      <CardDescription className='mt-1'>
                        Cruza historia clinica y prefactura para detectar
                        inconsistencias.
                      </CardDescription>
                    </div>
                    <span className='rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-700 shadow-xs dark:bg-background'>
                      Listo para auditar
                    </span>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4 pt-4'>
                  <div className='grid gap-2 sm:grid-cols-3'>
                    <div className='rounded-md border border-emerald-100 bg-white p-3 shadow-xs dark:bg-background'>
                      <div className='flex items-center gap-2'>
                        <FileSearch className='size-4 text-muted-foreground' />
                        <p className='text-sm font-medium'>1. Cargar</p>
                      </div>
                      <p className='mt-1 text-xs leading-5 text-muted-foreground'>
                        Ingresa HC y prefactura.
                      </p>
                    </div>
                    <div className='rounded-md border border-sky-100 bg-white p-3 shadow-xs dark:bg-background'>
                      <div className='flex items-center gap-2'>
                        <BrainCircuit className='size-4 text-muted-foreground' />
                        <p className='text-sm font-medium'>2. Analizar</p>
                      </div>
                      <p className='mt-1 text-xs leading-5 text-muted-foreground'>
                        Detecta inconsistencias.
                      </p>
                    </div>
                    <div className='rounded-md border border-amber-100 bg-white p-3 shadow-xs dark:bg-background'>
                      <div className='flex items-center gap-2'>
                        <ClipboardCheck className='size-4 text-muted-foreground' />
                        <p className='text-sm font-medium'>3. Priorizar</p>
                      </div>
                      <p className='mt-1 text-xs leading-5 text-muted-foreground'>
                        Ordena hallazgos por riesgo.
                      </p>
                    </div>
                  </div>

                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <p className='text-xs text-muted-foreground'>
                      Auditoria asistida para pertinencia, soportes y valores.
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      <Button onClick={() => navigate({ to: '/auditor-ia' })}>
                        <BrainCircuit className='size-4' />
                        Iniciar diagnostico
                      </Button>
                      <Button
                        variant='outline'
                        onClick={() => navigate({ to: '/radicados-api' })}
                      >
                        <FileSearch className='size-4' />
                        Ver auditorias API
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Actividad reciente</CardTitle>
                  <CardDescription>
                    Ultimos cruces procesados por el auditor.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value='analytics' className='space-y-4'>
            <Analytics />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Resumen',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Configuracion',
    href: '/configuracion',
    isActive: false,
    disabled: false,
  },
]
