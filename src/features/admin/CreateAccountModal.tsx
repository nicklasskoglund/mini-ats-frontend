// "Skapa konto" (DESIGN.md section 12), modal-dialog like Job's create
// form. Roll gates most of the form: Lösenord only applies to Admin
// (never sent for Kund - the contract 400s if the key is present at all,
// see adminMutations.ts), while Företagsnamn and "Fler företagsuppgifter"
// only apply to Kund (an admin account has no company profile).
import { useState, type FormEvent } from 'react'
import { getGenericErrorMessage } from '../../api/errors'
import type { AccountRole, AdminAccountCreate, ProfileUpdate } from '../../api/types'
import { Modal } from '../../components/Modal'
import { useToast } from '../../context/ToastProvider'
import { createAccount, updateCustomerProfile } from './adminMutations'
import './CreateAccountModal.css'

interface CreateAccountModalProps {
  onCreated: () => void
  onClose: () => void
}

interface FormValues {
  fullName: string
  email: string
  role: AccountRole
  password: string
  companyName: string
  websiteUrl: string
  linkedinUrl: string
  phone: string
  contactEmail: string
  address: string
  description: string
}

const INITIAL_VALUES: FormValues = {
  fullName: '',
  email: '',
  role: 'customer',
  password: '',
  companyName: '',
  websiteUrl: '',
  linkedinUrl: '',
  phone: '',
  contactEmail: '',
  address: '',
  description: '',
}

function hasExtraCompanyDetails(values: FormValues): boolean {
  return Boolean(
    values.websiteUrl ||
      values.linkedinUrl ||
      values.phone ||
      values.contactEmail ||
      values.address ||
      values.description,
  )
}

export function CreateAccountModal({ onCreated, onClose }: CreateAccountModalProps) {
  const { showToast } = useToast()
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
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

    const body: AdminAccountCreate = {
      email: values.email,
      role: values.role,
      full_name: values.fullName,
    }
    if (values.role === 'admin') {
      body.password = values.password
    } else {
      body.company_name = values.companyName
    }

    try {
      const account = await createAccount(body)

      if (values.role === 'customer' && hasExtraCompanyDetails(values)) {
        const profileUpdate: ProfileUpdate = {
          website_url: values.websiteUrl || null,
          linkedin_url: values.linkedinUrl || null,
          phone: values.phone || null,
          contact_email: values.contactEmail || null,
          address: values.address || null,
          description: values.description || null,
        }
        try {
          await updateCustomerProfile(account.id, profileUpdate)
        } catch {
          showToast(
            'Kontot skapades, men de extra företagsuppgifterna kunde inte sparas. Försök igen från kundens inställningar.',
          )
        }
      }

      onCreated()
    } catch (submitError) {
      setError(getGenericErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Skapa konto" onClose={onClose}>
      <form className="create-account-form" onSubmit={handleSubmit} noValidate>
        <label className="create-account-form__field">
          <span>Namn</span>
          <input
            type="text"
            required
            value={values.fullName}
            onChange={(event) => updateField('fullName', event.target.value)}
          />
        </label>
        <label className="create-account-form__field">
          <span>E-post</span>
          <input
            type="email"
            required
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
        </label>
        <label className="create-account-form__field">
          <span>Roll</span>
          <select
            value={values.role}
            onChange={(event) => updateField('role', event.target.value as AccountRole)}
          >
            <option value="customer">Kund</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {values.role === 'admin' && (
          <label className="create-account-form__field">
            <span>Lösenord</span>
            <input
              type="password"
              required
              minLength={8}
              value={values.password}
              onChange={(event) => updateField('password', event.target.value)}
            />
          </label>
        )}

        {values.role === 'customer' && (
          <>
            <label className="create-account-form__field">
              <span>Företagsnamn</span>
              <input
                type="text"
                required
                value={values.companyName}
                onChange={(event) => updateField('companyName', event.target.value)}
              />
            </label>

            <details className="create-account-form__extra">
              <summary>Fler företagsuppgifter (valfritt)</summary>
              <div className="create-account-form__extra-fields">
                <label className="create-account-form__field">
                  <span>Webbplats</span>
                  <input
                    type="url"
                    value={values.websiteUrl}
                    onChange={(event) => updateField('websiteUrl', event.target.value)}
                  />
                </label>
                <label className="create-account-form__field">
                  <span>LinkedIn</span>
                  <input
                    type="url"
                    value={values.linkedinUrl}
                    onChange={(event) => updateField('linkedinUrl', event.target.value)}
                  />
                </label>
                <label className="create-account-form__field">
                  <span>Telefon</span>
                  <input
                    type="tel"
                    value={values.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                  />
                </label>
                <label className="create-account-form__field">
                  <span>Kontakt-e-post</span>
                  <input
                    type="email"
                    value={values.contactEmail}
                    onChange={(event) => updateField('contactEmail', event.target.value)}
                  />
                </label>
                <label className="create-account-form__field">
                  <span>Adress</span>
                  <input
                    type="text"
                    value={values.address}
                    onChange={(event) => updateField('address', event.target.value)}
                  />
                </label>
                <label className="create-account-form__field">
                  <span>Beskrivning</span>
                  <textarea
                    rows={3}
                    value={values.description}
                    onChange={(event) => updateField('description', event.target.value)}
                  />
                </label>
              </div>
            </details>
          </>
        )}

        {error && (
          <p className="create-account-form__error" role="alert">
            {error}
          </p>
        )}

        <div className="create-account-form__actions">
          <button type="button" className="create-account-form__cancel" onClick={onClose}>
            Avbryt
          </button>
          <button type="submit" className="create-account-form__submit" disabled={submitting}>
            {submitting ? 'Sparar …' : 'Skapa konto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
