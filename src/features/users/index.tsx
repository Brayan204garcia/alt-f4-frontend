import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { users } from './data/users'

const route = getRouteApi('/_authenticated/radicados-api/')

export function Users() {
  const search = route.useSearch()
  const tableNavigate = route.useNavigate()
  const navigate = useNavigate()

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Auditorias Api</h2>
            <p className='text-muted-foreground'>
              Gestiona los analisis recibidos y su estado de auditoria.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable
          data={users}
          search={search}
          navigate={tableNavigate}
          onOpenAudit={(radicado) => {
            navigate({
              to: '/radicados-api/$radicado',
              params: { radicado },
            })
          }}
        />
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
