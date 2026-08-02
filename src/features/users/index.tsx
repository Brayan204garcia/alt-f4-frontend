import { useMemo } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useCasosAuditadosQuery } from './api/casos-api'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'

const route = getRouteApi('/_authenticated/radicados-api/')

export function Users() {
  const search = route.useSearch()
  const tableNavigate = route.useNavigate()
  const navigate = useNavigate()

  // Convert search params to API parameters
  const queryParams = useMemo(() => {
    const page = typeof search.page === 'number' ? search.page : 1
    const page_size =
      typeof search.pageSize === 'number' ? search.pageSize : 10

    let es_consistente: boolean | undefined = undefined
    if (
      Array.isArray(search.es_consistente) &&
      search.es_consistente.length === 1
    ) {
      es_consistente = search.es_consistente[0] === 'true'
    }

    const severidad =
      Array.isArray(search.severidad_maxima) && search.severidad_maxima.length > 0
        ? search.severidad_maxima[0]
        : undefined

    const resultado_estado =
      Array.isArray(search.estado_analisis) && search.estado_analisis.length > 0
        ? search.estado_analisis[0]
        : undefined

    return {
      page,
      page_size,
      es_consistente,
      severidad,
      resultado_estado,
    }
  }, [search])

  const { data, isLoading, error } = useCasosAuditadosQuery(queryParams)

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Auditorías API</h2>
            <p className='text-muted-foreground'>
              Gestiona los análisis recibidos y su estado de auditoría.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable
          data={data?.items ?? []}
          search={search}
          navigate={tableNavigate}
          isLoading={isLoading}
          error={error}
          total={data?.total}
          pageCount={data?.total_pages}
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
