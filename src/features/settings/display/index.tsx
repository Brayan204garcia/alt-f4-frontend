import { ContentSection } from '../components/content-section'
import { DisplayForm } from './display-form'

export function SettingsDisplay() {
  return (
    <ContentSection
      title='Visualizacion'
      desc='Activa o desactiva elementos visibles dentro de la aplicacion.'
    >
      <DisplayForm />
    </ContentSection>
  )
}
