import { ApiKeyForm } from './api-key-form'
import { ContentSection } from '../components/content-section'

export function SettingsApiKey() {
  return (
    <ContentSection
      title='API Key'
      desc='Genera una clave para conectar sistemas externos con nuestra API.'
    >
      <ApiKeyForm />
    </ContentSection>
  )
}
