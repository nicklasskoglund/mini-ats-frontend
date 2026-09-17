// Shared modal for "Skapa nytt jobb" and "Redigera jobb" (DESIGN.md
// section 8) - the only difference is the Status field, edit-only, and
// whether fields start empty or prefilled.
import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import { getGenericErrorMessage } from '../../api/errors'
import type { JobRead } from '../../api/types'
import { JOB_STATUS_OPTIONS, type JobStatus } from './jobStatus'
import './JobFormModal.css'

export interface JobFormValues {
  title: string
  description: string
  status: JobStatus
}

interface JobFormModalProps {
  mode: 'create' | 'edit'
  job?: JobRead
  onSubmit: (values: JobFormValues) => Promise<void>
  onClose: () => void
}

const DEFAULT_STATUS: JobStatus = 'active'

function initialStatus(job: JobRead | undefined): JobStatus {
  const match = JOB_STATUS_OPTIONS.find((option) => option.value === job?.status)
  return match?.value ?? DEFAULT_STATUS
}

export function JobFormModal({ mode, job, onSubmit, onClose }: JobFormModalProps) {
  const [title, setTitle] = useState(job?.title ?? '')
  const [description, setDescription] = useState(job?.description ?? '')
  const [status, setStatus] = useState<JobStatus>(initialStatus(job))
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
      await onSubmit({ title, description, status })
      onClose()
    } catch (submitError) {
      setError(getGenericErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={mode === 'create' ? 'Skapa nytt jobb' : 'Redigera jobb'} onClose={onClose}>
      <form className="job-form" onSubmit={handleSubmit} noValidate>
        <label className="job-form__field">
          <span>Titel</span>
          <input
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="job-form__field">
          <span>Beskrivning</span>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        {mode === 'edit' && (
          <label className="job-form__field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as JobStatus)}>
              {JOB_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {error && (
          <p className="job-form__error" role="alert">
            {error}
          </p>
        )}
        <div className="job-form__actions">
          <button type="button" className="job-form__cancel" onClick={onClose}>
            Avbryt
          </button>
          <button type="submit" className="job-form__submit" disabled={submitting}>
            {submitting ? 'Sparar …' : mode === 'create' ? 'Skapa jobb' : 'Spara'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
