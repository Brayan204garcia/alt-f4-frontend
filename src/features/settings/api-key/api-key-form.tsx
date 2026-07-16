import { useMemo, useState } from 'react'
import { Check, Copy, KeyRound, RefreshCcw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function generateApiKey() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)

  return `altf4_sic_${Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')}`
}

function maskApiKey(apiKey: string) {
  if (!apiKey) return ''

  return `${apiKey.slice(0, 13)}${'*'.repeat(28)}${apiKey.slice(-8)}`
}

export function ApiKeyForm() {
  const [apiKey, setApiKey] = useState('')
  const [copied, setCopied] = useState(false)
  const maskedApiKey = useMemo(() => maskApiKey(apiKey), [apiKey])

  function handleGenerate() {
    setApiKey(generateApiKey())
    setCopied(false)
  }

  async function handleCopy() {
    if (!apiKey) return

    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
  }

  return (
    <div className='space-y-6'>
      <Alert>
        <KeyRound />
        <AlertTitle>Conexion por API</AlertTitle>
        <AlertDescription>
          Usa esta clave para enviar historia clinica y prefactura desde sistemas
          externos. Guardala en un lugar seguro.
        </AlertDescription>
      </Alert>

      <Card className='rounded-lg'>
        <CardHeader>
          <div className='flex items-center justify-between gap-3'>
            <CardTitle className='text-base'>Clave de integracion</CardTitle>
            <Badge variant={apiKey ? 'default' : 'secondary'}>
              {apiKey ? 'Activa' : 'Sin generar'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='api-key'>API Key</Label>
            <div className='flex gap-2'>
              <Input
                id='api-key'
                readOnly
                value={maskedApiKey}
                placeholder='Genera una clave para habilitar la conexion'
              />
              <Button
                type='button'
                variant='outline'
                size='icon'
                disabled={!apiKey}
                onClick={handleCopy}
                title='Copiar API Key'
              >
                {copied ? <Check className='size-4' /> : <Copy className='size-4' />}
              </Button>
            </div>
          </div>

          <div className='flex flex-wrap gap-2'>
            <Button type='button' onClick={handleGenerate}>
              <KeyRound className='size-4' />
              Generar API Key
            </Button>
            <Button
              type='button'
              variant='outline'
              disabled={!apiKey}
              onClick={handleGenerate}
            >
              <RefreshCcw className='size-4' />
              Regenerar
            </Button>
          </div>

          <div className='rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground'>
            Envia la clave en tus solicitudes como encabezado
            <span className='font-medium text-foreground'> x-api-key</span>.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
