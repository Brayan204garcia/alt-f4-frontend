import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  endpoint: z.string().min(1, 'El endpoint es requerido.'),
  payload: z.string().min(1, 'El payload es requerido.'),
})

type UserInviteForm = z.infer<typeof formSchema>

type UserInviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersInviteDialog({
  open,
  onOpenChange,
}: UserInviteDialogProps) {
  const form = useForm<UserInviteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: '/api/auditorias',
      payload: `{
  "radicado": "RAD-2026-0001",
  "paciente": "Maria Gomez",
  "eps": "Sura EPS",
  "fecha": "2026-07-15",
  "historiaClinica": "...",
  "prefactura": "..."
}`,
    },
  })

  const onSubmit = (values: UserInviteForm) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <Send /> Probar API
          </DialogTitle>
          <DialogDescription>
            Simula el envio de una historia clinica y prefactura hacia nuestra
            API para validar la integracion.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='user-invite-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='endpoint'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='/api/auditorias'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='payload'
              render={({ field }) => (
                <FormItem className=''>
                  <FormLabel>Payload JSON</FormLabel>
                  <FormControl>
                    <Textarea
                      className='min-h-52 resize-none font-mono text-xs'
                      placeholder='Pega aqui el JSON de prueba'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>Cancelar</Button>
          </DialogClose>
          <Button type='submit' form='user-invite-form'>
            Simular envio <Send />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
