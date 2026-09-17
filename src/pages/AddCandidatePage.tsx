// "/candidates/new" (DESIGN.md section 9): its own view, not a dialog.
// Jobb is preselected from a ?job_id= query param if present (e.g. from a
// kanban view already filtered to one job).
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getGenericErrorMessage } from '../api/errors'
import { CandidateContactFields, type CandidateContactValues } from '../features/candidates/CandidateContactFields'
import { createCandidate } from '../features/candidates/candidateMutations'
import { useJobs } from '../features/jobs/useJobs'
import './AddCandidatePage.css'

export function AddCandidatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { jobs } = useJobs()

  const [contact, setContact] = useState<CandidateContactValues>({
    name: '',
    email: '',
    phone: '',
    linkedinUrl: '',
  })
  const [jobId, setJobId] = useState(searchParams.get('job_id') ?? '')
  const [cvText, setCvText] = useState('')
  const [notes, setNotes] = useState('')
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
      const candidate = await createCandidate({
        job_id: jobId,
        name: contact.name,
        email: contact.email,
        phone: contact.phone || null,
        linkedin_url: contact.linkedinUrl || null,
        cv_text: cvText || null,
        notes: notes || null,
      })
      navigate(`/candidates/${candidate.id}`)
    } catch (submitError) {
      setError(getGenericErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1>Lägg till kandidat</h1>
      <form className="add-candidate-form" onSubmit={handleSubmit} noValidate>
        <CandidateContactFields values={contact} onChange={setContact} />
        <label className="add-candidate-form__field">
          <span>Jobb</span>
          <select required value={jobId} onChange={(event) => setJobId(event.target.value)}>
            <option value="" disabled>
              Välj jobb
            </option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </label>
        <label className="add-candidate-form__field">
          <span>CV-text</span>
          <textarea rows={6} value={cvText} onChange={(event) => setCvText(event.target.value)} />
        </label>
        <label className="add-candidate-form__field">
          <span>Anteckningar</span>
          <textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        {error && (
          <p className="add-candidate-form__error" role="alert">
            {error}
          </p>
        )}
        <div className="add-candidate-form__actions">
          <button
            type="button"
            className="add-candidate-form__cancel"
            onClick={() => navigate('/candidates')}
          >
            Avbryt
          </button>
          <button type="submit" className="add-candidate-form__submit" disabled={submitting}>
            {submitting ? 'Sparar …' : 'Lägg till kandidat'}
          </button>
        </div>
      </form>
    </div>
  )
}
