import { Separator } from '@/components/ui/separator'
import { ApiKeyForm } from './api-key-form'

export function SettingsApiKey() {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>Gestión de API Keys</h3>
      </div>
      <Separator className='my-4 flex-none' />
      <div className='faded-bottom h-full w-full overflow-y-auto scroll-smooth pe-4 pb-12'>
        <div className='-mx-1 px-1.5'>
          <ApiKeyForm />
        </div>
      </div>
    </div>
  )
}
