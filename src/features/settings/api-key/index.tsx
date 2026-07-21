import { ContentSection } from '../components/content-section'
import { ApiKeyForm } from './api-key-form'

export function SettingsApiKey() {
  return (
    <ContentSection
      title='Clave API'
      desc='Genera una clave para conectar sistemas externos con nuestra API.'
    >
      <ApiKeyForm />
    </ContentSection>
  )
}
