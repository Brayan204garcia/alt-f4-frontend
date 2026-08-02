import { useState } from 'react'
import { isAxiosError } from 'axios'
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Plus,
  RefreshCcw,
  ShieldOff,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  createApiKey,
  useApiKeysQuery,
  useClientsQuery,
  useCreateApiKeyMutation,
  useCreateClientMutation,
  useRevokeApiKeyMutation,
  useRotateApiKeyMutation,
} from './api-keys-api'
import type { ApiKey, Client, CreatedApiKey, RotateKeyResponse } from './types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateStr))
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err) && err.response?.data?.detail) {
    return String(err.response.data.detail)
  }
  return fallback
}

// ─── Modal: Mostrar raw_key UNA SOLA VEZ ─────────────────────────────────────

function RawKeyReveal({
  rawKey,
  title,
  onClose,
}: {
  rawKey: string
  title: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(rawKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <KeyRound className='size-5 text-amber-500' />
            {title}
          </DialogTitle>
          <DialogDescription>
            Esta es la única vez que verás esta clave. Cópiala ahora y
            guárdala en un lugar seguro.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <Alert className='border-amber-500/40 bg-amber-500/10'>
            <AlertTriangle className='size-4 text-amber-500' />
            <AlertTitle className='text-amber-600 dark:text-amber-400'>
              ¡Atención!
            </AlertTitle>
            <AlertDescription className='text-amber-700 dark:text-amber-300'>
              Después de cerrar este modal, la clave no será recuperable.
            </AlertDescription>
          </Alert>

          <div className='space-y-2'>
            <Label htmlFor='raw-key-display'>Clave API</Label>
            <div className='flex gap-2'>
              <Input
                id='raw-key-display'
                readOnly
                type={visible ? 'text' : 'password'}
                value={rawKey}
                className='font-mono text-sm'
              />
              <Button
                variant='outline'
                size='icon'
                onClick={() => setVisible((v) => !v)}
                title={visible ? 'Ocultar' : 'Mostrar'}
              >
                {visible ? (
                  <EyeOff className='size-4' />
                ) : (
                  <Eye className='size-4' />
                )}
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={handleCopy}
                title='Copiar clave'
              >
                {copied ? (
                  <Check className='size-4 text-green-500' />
                ) : (
                  <Copy className='size-4' />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className='w-full'>
            Ya copié mi clave — Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal: Crear Cliente ─────────────────────────────────────────────────────

function CreateClientDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: (client: Client, createdKey: CreatedApiKey) => void
}) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mutation = useCreateClientMutation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // 1. Crear el cliente
      const newClient = await mutation.mutateAsync({ name })

      // 2. Generar instantáneamente la API Key para el nuevo cliente
      const createdKey = await createApiKey(newClient.id, {
        name: 'Produccion',
        scopes: ['write:historias'],
      })

      toast.success('Cliente y API Key creados correctamente')
      setName('')
      onClose()
      onSuccess(newClient, createdKey)
    } catch (err) {
      toast.error(
        extractErrorMessage(
          err,
          'Error al crear el cliente o generar la API Key'
        )
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Building2 className='size-5' />
            Nuevo Cliente
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='client-name'>Nombre del cliente</Label>
            <Input
              id='client-name'
              placeholder='Ej: IPS Salud y Vida'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              autoFocus
            />
          </div>
          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <Plus className='size-4' />
              )}
              Crear cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal: Confirmar Revocación ──────────────────────────────────────────────

function ConfirmRevokeDialog({
  open,
  keyName,
  onConfirm,
  onClose,
  isPending,
}: {
  open: boolean
  keyName: string
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-destructive'>
            <ShieldOff className='size-5' />
            Revocar API Key
          </DialogTitle>
          <DialogDescription>
            ¿Seguro que quieres revocar la key{' '}
            <strong>"{keyName}"</strong>? Esta acción es permanente. Cualquier
            sistema que la use recibirá{' '}
            <code className='rounded bg-muted px-1'>401</code> de inmediato.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Trash2 className='size-4' />
            )}
            Sí, revocar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal: Confirmar Rotación ────────────────────────────────────────────────

function ConfirmRotateDialog({
  open,
  keyName,
  onConfirm,
  onClose,
  isPending,
}: {
  open: boolean
  keyName: string
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <RefreshCcw className='size-5 text-amber-500' />
            Rotar API Key
          </DialogTitle>
          <DialogDescription>
            La key <strong>"{keyName}"</strong> quedará revocada
            automáticamente y se generará una nueva con los mismos permisos.
            Útil cuando una key fue compromised.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <RefreshCcw className='size-4' />
            )}
            Rotar key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Panel de keys de un cliente ─────────────────────────────────────────────

function ClientKeysPanel({
  client,
  onShowRawKey,
}: {
  client: Client
  onShowRawKey: (rawKey: string, title: string) => void
}) {
  const [revoke, setRevoke] = useState<ApiKey | null>(null)
  const [rotate, setRotate] = useState<ApiKey | null>(null)

  const { data: keys, isLoading, error } = useApiKeysQuery(client.id)
  const createKeyMutation = useCreateApiKeyMutation(client.id)
  const revokeMutation = useRevokeApiKeyMutation(client.id)
  const rotateMutation = useRotateApiKeyMutation(client.id)

  async function handleCreateKey() {
    try {
      const created = await createKeyMutation.mutateAsync({
        name: 'Produccion',
        scopes: ['write:historias'],
      })
      onShowRawKey(created.raw_key, `Nueva key — ${created.name}`)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Error al crear la API Key'))
    }
  }

  async function handleRevoke() {
    if (!revoke) return
    try {
      await revokeMutation.mutateAsync(revoke.id)
      toast.success(`Key "${revoke.name}" revocada correctamente`)
      setRevoke(null)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Error al revocar la key'))
    }
  }

  async function handleRotate() {
    if (!rotate) return
    try {
      const result: RotateKeyResponse = await rotateMutation.mutateAsync(
        rotate.id
      )
      setRotate(null)
      onShowRawKey(result.new_raw_key, `Nueva key — ${result.name}`)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Error al rotar la key'))
    }
  }

  return (
    <>
      {revoke && (
        <ConfirmRevokeDialog
          open
          keyName={revoke.name}
          onConfirm={handleRevoke}
          onClose={() => setRevoke(null)}
          isPending={revokeMutation.isPending}
        />
      )}
      {rotate && (
        <ConfirmRotateDialog
          open
          keyName={rotate.name}
          onConfirm={handleRotate}
          onClose={() => setRotate(null)}
          isPending={rotateMutation.isPending}
        />
      )}

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            {isLoading
              ? 'Cargando keys…'
              : `${(keys ?? []).length} key${(keys ?? []).length !== 1 ? 's' : ''}`}
          </p>
          <Button
            size='sm'
            variant='outline'
            onClick={handleCreateKey}
            disabled={createKeyMutation.isPending}
          >
            {createKeyMutation.isPending ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Plus className='size-3.5' />
            )}
            Crear key
          </Button>
        </div>

        {error && (
          <Alert variant='destructive'>
            <AlertTriangle className='size-4' />
            <AlertDescription>
              {extractErrorMessage(error, 'Error al cargar las keys')}
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className='space-y-2'>
            {[1, 2].map((i) => (
              <Skeleton key={i} className='h-16 w-full rounded-lg' />
            ))}
          </div>
        )}

        {!isLoading && !error && (keys ?? []).length === 0 && (
          <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center text-muted-foreground'>
            <KeyRound className='mb-2 size-8 opacity-30' />
            <p className='text-sm'>Sin keys aún.</p>
            <p className='text-xs'>Crea la primera para este cliente.</p>
          </div>
        )}

        {(keys ?? []).map((key) => (
          <div
            key={key.id}
            className='group flex flex-col gap-2 rounded-lg border bg-card p-3 transition-colors hover:border-border/80 sm:flex-row sm:items-center sm:justify-between'
          >
            <div className='flex items-start gap-3'>
              <div
                className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                  key.active
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {key.active ? (
                  <ShieldCheck className='size-4' />
                ) : (
                  <ShieldOff className='size-4' />
                )}
              </div>
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-sm font-medium'>{key.name}</span>
                  <Badge
                    variant={key.active ? 'default' : 'secondary'}
                    className='text-xs'
                  >
                    {key.active ? 'Activa' : 'Revocada'}
                  </Badge>
                </div>
                <p className='mt-0.5 font-mono text-xs text-muted-foreground'>
                  {key.key_prefix}…
                </p>
                <div className='mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground'>
                  <span>
                    <span className='font-medium text-foreground'>Scope:</span>{' '}
                    {key.scopes}
                  </span>
                  <span>
                    <span className='font-medium text-foreground'>Creada:</span>{' '}
                    {formatDate(key.created_at)}
                  </span>
                  {key.last_used_at && (
                    <span>
                      <span className='font-medium text-foreground'>
                        Último uso:
                      </span>{' '}
                      {formatDate(key.last_used_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {key.active && (
              <div className='flex shrink-0 gap-2 sm:ml-4'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setRotate(key)}
                  className='h-8 gap-1.5 text-xs'
                >
                  <RefreshCcw className='size-3.5' />
                  Rotar
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setRevoke(key)}
                  className='h-8 gap-1.5 border-destructive/40 text-xs text-destructive hover:border-destructive hover:bg-destructive/10'
                >
                  <Trash2 className='size-3.5' />
                  Revocar
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ApiKeyForm() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showCreateClient, setShowCreateClient] = useState(false)
  const [rawKeyReveal, setRawKeyReveal] = useState<{
    rawKey: string
    title: string
  } | null>(null)

  const {
    data: clients,
    isLoading: loadingClients,
    error: clientsError,
  } = useClientsQuery()

  return (
    <div className='space-y-6'>
      {/* ── Clientes ─── */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div>
            <h4 className='text-sm font-semibold'>Clientes</h4>
            <p className='text-xs text-muted-foreground'>
              Selecciona un cliente para ver y gestionar sus keys.
            </p>
          </div>
          <Button
            size='sm'
            onClick={() => setShowCreateClient(true)}
            className='gap-1.5'
          >
            <Plus className='size-3.5' />
            Nuevo cliente
          </Button>
        </div>

        {clientsError && (
          <Alert variant='destructive'>
            <AlertTriangle className='size-4' />
            <AlertDescription>
              {extractErrorMessage(
                clientsError,
                'Error al cargar clientes. Verifica que el backend esté activo.'
              )}
            </AlertDescription>
          </Alert>
        )}

        {loadingClients && (
          <div className='space-y-2'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-12 w-full rounded-lg' />
            ))}
          </div>
        )}

        {!loadingClients && !clientsError && (clients ?? []).length === 0 && (
          <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center text-muted-foreground'>
            <Building2 className='mb-2 size-8 opacity-30' />
            <p className='text-sm'>Sin clientes registrados.</p>
            <p className='text-xs'>Crea el primero con el botón de arriba.</p>
          </div>
        )}

        <div className='space-y-1.5'>
          {(clients ?? []).map((client) => {
            const isSelected = selectedClient?.id === client.id
            return (
              <button
                key={client.id}
                onClick={() => setSelectedClient(isSelected ? null : client)}
                className={`group flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                  isSelected
                    ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                    : 'border-border hover:border-border/80 hover:bg-muted/30'
                }`}
              >
                <div
                  className={`flex size-9 items-center justify-center rounded-full ${
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Building2 className='size-4' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{client.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    Creado: {formatDate(client.created_at)}
                  </p>
                </div>
                <ChevronRight
                  className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                    isSelected ? 'rotate-90' : ''
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Panel de keys del cliente seleccionado ─── */}
      {selectedClient && (
        <>
          <Separator />
          <Card className='rounded-lg'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-sm font-semibold'>
                    API Keys — {selectedClient.name}
                  </CardTitle>
                  <CardDescription className='mt-0.5 text-xs'>
                    Gestiona las keys de acceso para este cliente.
                  </CardDescription>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-7'
                  onClick={() => setSelectedClient(null)}
                  title='Cerrar panel'
                >
                  <X className='size-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ClientKeysPanel
                client={selectedClient}
                onShowRawKey={(rawKey, title) => setRawKeyReveal({ rawKey, title })}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal para crear cliente */}
      <CreateClientDialog
        open={showCreateClient}
        onClose={() => setShowCreateClient(false)}
        onSuccess={(client, createdKey) => {
          setSelectedClient(client)
          setRawKeyReveal({
            rawKey: createdKey.raw_key,
            title: `API Key Creada — ${client.name}`,
          })
        }}
      />

      {/* Modal para mostrar la raw_key recien creada/rotada */}
      {rawKeyReveal && (
        <RawKeyReveal
          rawKey={rawKeyReveal.rawKey}
          title={rawKeyReveal.title}
          onClose={() => setRawKeyReveal(null)}
        />
      )}
    </div>
  )
}
