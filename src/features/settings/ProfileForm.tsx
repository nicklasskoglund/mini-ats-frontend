// The editable profile form on /settings (DESIGN.md section 6). Renders
// the same fields regardless of viewer role - an admin editing an acted-as
// customer's profile sees exactly what that customer would see, per
// "Gränssnittet ser i övrigt exakt likadant ut som för kunden själv."
import { useState, type FormEvent } from 'react'
import { getGenericErrorMessage } from '../../api/errors'
import type { ProfileRead, ProfileUpdate } from '../../api/types'
import { useToast } from '../../context/ToastProvider'
import './ProfileForm.css'

interface ProfileFormProps {
  profile: ProfileRead
  onSave: (input: ProfileUpdate) => Promise<void>
}

interface FormValues {
  fullName: string
  companyName: string
  websiteUrl: string
  linkedinUrl: string
  phone: string
  contactEmail: string
  address: string
  description: string
}

function toFormValues(profile: ProfileRead): FormValues {
  return {
    fullName: profile.full_name ?? '',
    companyName: profile.company_name ?? '',
    websiteUrl: profile.website_url ?? '',
    linkedinUrl: profile.linkedin_url ?? '',
    phone: profile.phone ?? '',
    contactEmail: profile.contact_email ?? '',
    address: profile.address ?? '',
    description: profile.description ?? '',
  }
}

export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const { showToast } = useToast()
  const [values, setValues] = useState<FormValues>(() => toFormValues(profile))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) {
      return
    }
    setSubmitting(true)
    setError(null)

    const input: ProfileUpdate = {
      full_name: values.fullName || null,
      company_name: values.companyName || null,
      website_url: values.websiteUrl || null,
      linkedin_url: values.linkedinUrl || null,
      phone: values.phone || null,
      contact_email: values.contactEmail || null,
      address: values.address || null,
      description: values.description || null,
    }

    try {
      await onSave(input)
      showToast('Profilen har sparats.')
    } catch (submitError) {
      setError(getGenericErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <p className="profile-form__meta">
        Kund sedan {new Date(profile.created_at).toLocaleDateString('sv-SE')}
      </p>

      <label className="profile-form__field">
        <span>Namn</span>
        <input
          type="text"
          value={values.fullName}
          onChange={(event) => updateField('fullName', event.target.value)}
        />
      </label>
      <label className="profile-form__field">
        <span>Företagsnamn</span>
        <input
          type="text"
          value={values.companyName}
          onChange={(event) => updateField('companyName', event.target.value)}
        />
      </label>
      <label className="profile-form__field">
        <span>Webbplats</span>
        <input
          type="url"
          value={values.websiteUrl}
          onChange={(event) => updateField('websiteUrl', event.target.value)}
        />
      </label>
      <label className="profile-form__field">
        <span>LinkedIn</span>
        <input
          type="url"
          value={values.linkedinUrl}
          onChange={(event) => updateField('linkedinUrl', event.target.value)}
        />
      </label>
      <label className="profile-form__field">
        <span>Telefon</span>
        <input
          type="tel"
          value={values.phone}
          onChange={(event) => updateField('phone', event.target.value)}
        />
      </label>
      <label className="profile-form__field">
        <span>Kontakt-e-post</span>
        <input
          type="email"
          value={values.contactEmail}
          onChange={(event) => updateField('contactEmail', event.target.value)}
        />
      </label>
      <label className="profile-form__field">
        <span>Adress</span>
        <input
          type="text"
          value={values.address}
          onChange={(event) => updateField('address', event.target.value)}
        />
      </label>
      <label className="profile-form__field">
        <span>Beskrivning</span>
        <textarea
          rows={4}
          value={values.description}
          onChange={(event) => updateField('description', event.target.value)}
        />
      </label>

      {error && (
        <p className="profile-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="profile-form__actions">
        <button type="submit" className="profile-form__submit" disabled={submitting}>
          {submitting ? 'Sparar …' : 'Spara'}
        </button>
      </div>
    </form>
  )
}
