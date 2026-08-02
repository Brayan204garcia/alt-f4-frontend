import { createFileRoute } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { openWelcomeModal } from '@/components/welcome-modal'

export const Route = createFileRoute('/_authenticated/help-center/')({
  component: AboutUs,
})

const teamMembers = ['Michel Pulistar', 'Andres Suarez', 'Brayan Garcia', 'Jesus Avendaño', 'Juan Zambrano']

function AboutUs() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main className='space-y-8'>
        <section className='border-b pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4'>
          <div>
            <p className='text-xs font-bold tracking-widest text-primary uppercase'>
              Equipo
            </p>
            <h1 className='mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl'>
              GRUPO ALT-F4 IA
            </h1>
            <div className='mt-4 grid gap-3 text-sm font-medium text-muted-foreground sm:grid-cols-2 lg:grid-cols-3'>
              <div className='rounded-lg border bg-card/60 p-3.5 backdrop-blur-xs shadow-xs'>
                SAMSUNG INNOVATION CAMPUS 2025 - 2026
              </div>
              <div className='rounded-lg border bg-card/60 p-3.5 backdrop-blur-xs shadow-xs'>
                RETO: Auditor médico digital
              </div>
              <div className='rounded-lg border bg-card/60 p-3.5 backdrop-blur-xs shadow-xs'>
                Health & Life IPS SAS
              </div>
            </div>
          </div>

          <Button
            onClick={() => openWelcomeModal()}
            className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md shrink-0'
          >
            <Sparkles className='size-4 me-2' />
            Ver Presentación del Sistema
          </Button>
        </section>

        <section className='space-y-4'>
          <h2 className='text-xl font-bold tracking-tight'>Equipo</h2>

          <div className='grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'>
            {teamMembers.map((member) => (
              <div
                key={member}
                className='group flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/80 p-3.5 px-4.5 backdrop-blur-xs transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-md dark:bg-card/40'
              >
                <span className='text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary'>
                  {member}
                </span>

                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 shrink-0 justify-center gap-1.5 border-border/80 px-3 hover:border-[#0A66C2] hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] transition-all duration-200 shadow-xs'
                  asChild
                >
                  <a
                    href='https://linkedin.com'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <span className='flex size-3.5 items-center justify-center rounded-xs bg-[#0A66C2] text-[9px] leading-none font-bold text-white'>
                      in
                    </span>
                    <span className='text-xs font-medium'>LinkedIn</span>
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </section>
      </Main>
    </>
  )
}
