import { useEffect } from 'react'

export function SettingsDocumentacion() {
  const docUrl = 'https://api.bryan.lat/redoc#operation/health_health_get'

  useEffect(() => {
    window.location.href = docUrl
  }, [docUrl])

  return (
    <div className='flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground'>
      Redirigiendo a la documentación de la API...
    </div>
  )
}
