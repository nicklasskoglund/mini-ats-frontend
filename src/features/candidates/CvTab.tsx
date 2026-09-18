// CV tab (DESIGN.md section 10): an empty state that doubles as the entry
// form, or the saved text with a "Redigera" button. No timestamp (see
// DESIGN.md section 10 - CandidateRead has no updated_at).
import { useEffect, useState, type FormEvent } from 'react'
import { getGenericErrorMessage } from '../../api/errors'
import type { CandidateRead } from '../../api/types'
import './CvTab.css'

interface CvTabProps {
  candidate: CandidateRead
  onSave: (cvText: string) => Promise<void>
}

export function CvTab({ candidate, onSave }: CvTabProps) {
  const [editing, setEditing] = useState(candidate.cv_text == null)
  const [draft, setDraft] = useState(candidate.cv_text ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(candidate.cv_text ?? '')
    setEditing(candidate.cv_text == null)
  }, [candidate.cv_text])

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (submitting) {
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSave(draft)
      setEditing(false)
    } catch (saveError) {
      setError(getGenericErrorMessage(saveError))
    } finally {
      setSubmitting(false)
    }
  }

  if (!editing) {
    return (
      <div className="cv-tab">
        <p className="cv-tab__text">{candidate.cv_text}</p>
        <button type="button" className="cv-tab__edit" onClick={() => setEditing(true)}>
          Redigera
        </button>
      </div>
    )
  }

  const hasSavedText = candidate.cv_text != null

  return (
    <form className="cv-tab" onSubmit={handleSave}>
      {!hasSavedText && (
        <>
          <p className="cv-tab__empty-title">Ingen CV-text ännu</p>
          <p className="cv-tab__empty-hint">
            Klistra in CV-texten för att kunna köra en AI-bedömning.
          </p>
        </>
      )}
      <textarea rows={12} value={draft} onChange={(event) => setDraft(event.target.value)} />
      {error && (
        <p className="cv-tab__error" role="alert">
          {error}
        </p>
      )}
      <div className="cv-tab__actions">
        {hasSavedText && (
          <button
            type="button"
            className="cv-tab__cancel"
            onClick={() => {
              setDraft(candidate.cv_text ?? '')
              setEditing(false)
              setError(null)
            }}
          >
            Avbryt
          </button>
        )}
        <button type="submit" className="cv-tab__submit" disabled={submitting}>
          {submitting ? 'Sparar …' : 'Spara CV-text'}
        </button>
      </div>
    </form>
  )
}
