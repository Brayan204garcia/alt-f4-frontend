import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Perfil'
      desc='Asi se mostrara tu informacion dentro del sistema.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
