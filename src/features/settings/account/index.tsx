import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='Cuenta'
      desc='Actualiza los datos de tu cuenta, idioma y zona horaria.'
    >
      <AccountForm />
    </ContentSection>
  )
}
