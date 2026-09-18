// Namn/E-post/Telefon/LinkedIn-URL fields, identical in "Lägg till
// kandidat" (DESIGN.md section 9) and "Redigera kandidat" (section 10) -
// shared so the two forms don't duplicate the same four fields.
import './CandidateContactFields.css'

export interface CandidateContactValues {
  name: string
  email: string
  phone: string
  linkedinUrl: string
}

interface CandidateContactFieldsProps {
  values: CandidateContactValues
  onChange: (values: CandidateContactValues) => void
}

export function CandidateContactFields({ values, onChange }: CandidateContactFieldsProps) {
  return (
    <>
      <label className="candidate-contact-fields__field">
        <span>Namn</span>
        <input
          type="text"
          required
          value={values.name}
          onChange={(event) => onChange({ ...values, name: event.target.value })}
        />
      </label>
      <label className="candidate-contact-fields__field">
        <span>E-post</span>
        <input
          type="email"
          required
          value={values.email}
          onChange={(event) => onChange({ ...values, email: event.target.value })}
        />
      </label>
      <label className="candidate-contact-fields__field">
        <span>Telefon</span>
        <input
          type="tel"
          value={values.phone}
          onChange={(event) => onChange({ ...values, phone: event.target.value })}
        />
      </label>
      <label className="candidate-contact-fields__field">
        <span>LinkedIn-URL</span>
        <input
          type="url"
          value={values.linkedinUrl}
          onChange={(event) => onChange({ ...values, linkedinUrl: event.target.value })}
        />
      </label>
    </>
  )
}
