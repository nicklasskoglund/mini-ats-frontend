// "Radera kandidat" (DESIGN.md section 9): a single confirmation dialog.
// DELETE /candidates/{id} returns 204 with no cascade/409 check (candidates
// have no child rows, unlike jobs) - no blocked variant needed here.
import { useState } from 'react'
import { getGenericErrorMessage } from '../../api/errors'
import type { CandidateRead } from '../../api/types'
import { Modal } from '../../components/Modal'
import './DeleteCandidateDialog.css'

interface DeleteCandidateDialogProps {
  candidate: CandidateRead
  onDelete: (candidateId: string) => Promise<void>
  onClose: () => void
}

export function DeleteCandidateDialog({ candidate, onDelete, onClose }: DeleteCandidateDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (submitting) {
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onDelete(candidate.id)
      onClose()
    } catch (deleteError) {
      setError(getGenericErrorMessage(deleteError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Radera kandidat?" onClose={onClose}>
      <p>
        Är du säker på att du vill radera &quot;{candidate.name}&quot;? Detta går inte att
        ångra.
      </p>
      {error && (
        <p className="delete-candidate-dialog__error" role="alert">
          {error}
        </p>
      )}
      <div className="delete-candidate-dialog__actions">
        <button
          type="button"
          className="delete-candidate-dialog__cancel"
          onClick={onClose}
          disabled={submitting}
        >
          Avbryt
        </button>
        <button
          type="button"
          className="delete-candidate-dialog__confirm"
          onClick={handleDelete}
          disabled={submitting}
        >
          {submitting ? 'Raderar …' : 'Radera'}
        </button>
      </div>
    </Modal>
  )
}
