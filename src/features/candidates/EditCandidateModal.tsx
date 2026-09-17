// "Redigera kandidat" modal (DESIGN.md section 10): Namn/E-post/Telefon/
// LinkedIn-URL only - no Jobb (CandidateUpdate has no job_id, so a
// candidate can never be moved to another job here) and no stage (stage
// changes exclusively through "Flytta till …").
import { useState, type FormEvent } from 'react'
import { getGenericErrorMessage } from '../../api/errors'
import type { CandidateRead } from '../../api/types'
import { Modal } from '../../components/Modal'
import { CandidateContactFields, type CandidateContactValues } from './CandidateContactFields'
import './EditCandidateModal.css'

interface EditCandidateModalProps {
  candidate: CandidateRead
  onSubmit: (values: CandidateContactValues) => Promise<void>
  onClose: () => void
}

export function EditCandidateModal({ candidate, onSubmit, onClose }: EditCandidateModalProps) {
  const [values, setValues] = useState<CandidateContactValues>({
    name: candidate.name,
    email: candidate.email ?? '',
    phone: candidate.phone ?? '',
    linkedinUrl: candidate.linkedin_url ?? '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) {
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(values)
      onClose()
    } catch (submitError) {
      setError(getGenericErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Redigera kandidat" onClose={onClose}>
      <form className="edit-candidate-form" onSubmit={handleSubmit} noValidate>
        <CandidateContactFields values={values} onChange={setValues} />
        {error && (
          <p className="edit-candidate-form__error" role="alert">
            {error}
          </p>
        )}
        <div className="edit-candidate-form__actions">
          <button type="button" className="edit-candidate-form__cancel" onClick={onClose}>
            Avbryt
          </button>
          <button type="submit" className="edit-candidate-form__submit" disabled={submitting}>
            {submitting ? 'Sparar …' : 'Spara'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
