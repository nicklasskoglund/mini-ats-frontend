// Anteckningar tab (DESIGN.md section 10): a single free-text field saved
// against `notes`. No empty/filled distinction like the CV tab - just an
// always-editable textarea. No timestamp, same reason as the CV tab.
import { useEffect, useState, type FormEvent } from 'react'
import { getGenericErrorMessage } from '../../api/errors'
import type { CandidateRead } from '../../api/types'
import './NotesTab.css'

interface NotesTabProps {
  candidate: CandidateRead
  onSave: (notes: string) => Promise<void>
}

export function NotesTab({ candidate, onSave }: NotesTabProps) {
  const [draft, setDraft] = useState(candidate.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(candidate.notes ?? '')
  }, [candidate.notes])

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (submitting) {
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSave(draft)
    } catch (saveError) {
      setError(getGenericErrorMessage(saveError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="notes-tab" onSubmit={handleSave}>
      <textarea
        rows={12}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-label="Anteckningar"
      />
      {error && (
        <p className="notes-tab__error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="notes-tab__submit" disabled={submitting}>
        {submitting ? 'Sparar …' : 'Spara anteckningar'}
      </button>
    </form>
  )
}
