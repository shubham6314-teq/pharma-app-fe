import { PagePanel } from '../../components/ui/PagePanel'
import { ProfilePanel } from '../../features/auth/components/ProfilePanel'

export function ProfilePage() {
  return (
    <PagePanel
      title="Profile"
      description="Edit your name or email, then save. Changing email or password signs you out."
    >
      <ProfilePanel />
    </PagePanel>
  )
}
