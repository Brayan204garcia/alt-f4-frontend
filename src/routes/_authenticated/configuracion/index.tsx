import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/configuracion/')({
  beforeLoad: () => {
    throw redirect({
      to: '/configuracion/clave-api',
    })
  },
})
