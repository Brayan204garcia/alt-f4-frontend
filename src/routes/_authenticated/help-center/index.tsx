import { createFileRoute } from '@tanstack/react-router'
import { ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createFileRoute('/_authenticated/help-center/')({
  component: AboutUs,
})

const teamMembers = ['Michel', 'Brayan', 'Andres', 'Jesus', 'Juan']

const partnerLogos = [
  {
    name: 'Samsung Innovation Campus',
    url: 'https://urosario.edu.co/sites/default/files/styles/article_47_22_md/public/articles/2025-10/nota-samsung-innovation-campus.png',
    featured: true,
  },
  {
    name: 'Universidad del Rosario',
    url: 'https://urosario.edu.co/sites/default/files/2025-04/logo_vertical_ur_rojo.png',
  },
  {
    name: 'Health & Life IPS SAS',
    url: 'https://www.elhospital.com/logos/profile/limage-11346.webp',
  },
]

function AboutUs() {
  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='space-y-5'>
        <section className='border-b pb-5'>
          <p className='text-sm font-medium tracking-wide text-muted-foreground uppercase'>
            Sobre Nosotros
          </p>
          <h1 className='mt-2 text-3xl font-bold tracking-tight'>
            GRUPO ALT-F4
          </h1>
          <div className='mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3'>
            <div className='rounded-md border bg-card p-3'>
              SAMSUNG INNOVATION CAMPUS 2025 - 2026
            </div>
            <div className='rounded-md border bg-card p-3'>
              RETO: Auditor médico digital
            </div>
            <div className='rounded-md border bg-card p-3'>
              Health & Life IPS SAS
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-xl font-semibold tracking-tight'>Integrantes</h2>
          <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
            {teamMembers.map((member) => (
              <Card key={member} className='gap-0 overflow-hidden py-0'>
                <div className='flex aspect-square items-center justify-center border-b bg-muted/40'>
                  <ImageIcon className='size-10 text-muted-foreground' />
                </div>
                <CardHeader className='px-4 pt-4 pb-2'>
                  <CardTitle className='text-base'>{member}</CardTitle>
                </CardHeader>
                <CardContent className='px-4 pt-0 pb-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full justify-center gap-2'
                  >
                    <span className='flex size-4 items-center justify-center rounded-sm bg-[#0A66C2] text-[10px] leading-none font-bold text-white'>
                      in
                    </span>
                    LinkedIn
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className='space-y-4 border-t pt-5'>
          <div>
            <h2 className='text-xl font-semibold tracking-tight'>
              Muchas gracias a:
            </h2>
          </div>

          <div className='flex flex-wrap items-center justify-center gap-4'>
            {partnerLogos.map((partner) => (
              <img
                key={partner.name}
                src={partner.url}
                alt={partner.name}
                className={
                  partner.featured
                    ? 'max-h-28 w-72 object-contain'
                    : 'max-h-20 w-36 object-contain'
                }
              />
            ))}
          </div>

          <p className='mx-auto max-w-4xl text-center text-xs leading-5 text-muted-foreground'>
            Los logos y marcas mostrados pertenecen a sus respectivos titulares.
            Se usan unicamente con fines academicos y demostrativos.
          </p>
        </section>
      </Main>
    </>
  )
}
