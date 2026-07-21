import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <ContentSection
      title='Apariencia'
      desc='Personaliza el tema visual y la tipografia del sistema.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
