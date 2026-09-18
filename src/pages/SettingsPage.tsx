// Route for "/settings" (DESIGN.md section 6). Visible to every role, but
// an admin with no acting-as customer selected sees a placeholder instead
// of the form - no API call is made in that case.
import { ProfileForm } from '../features/settings/ProfileForm'
import { useProfile } from '../features/settings/useProfile'
import './SettingsPage.css'

export function SettingsPage() {
  const { profile, loading, loadError, enabled, reload, updateProfile } = useProfile()

  return (
    <div>
      <h1>Inställningar</h1>

      {!enabled && <p className="settings-page__hint">Välj en kund för att se profilen.</p>}

      {enabled && loadError && (
        <div className="settings-page__error">
          <p>Något gick fel. Försök igen.</p>
          <button type="button" onClick={reload}>
            Försök igen
          </button>
        </div>
      )}

      {enabled && !loadError && !loading && profile && (
        <ProfileForm key={profile.id} profile={profile} onSave={updateProfile} />
      )}
    </div>
  )
}
