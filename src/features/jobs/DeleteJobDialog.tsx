// Job deletion (DESIGN.md section 8): a normal confirmation, which
// transitions in place to the "blocked" copy if the API responds 409.
// The candidate count comes from the already-known table row, not from
// parsing the 409's undocumented detail format (see CLAUDE.md "Inför Steg 4").
import { useState } from 'react'
import { Modal } from '../../components/Modal'
import { ApiError } from '../../api/errors'
import type { JobWithCandidateCount } from './useJobsList'
import './DeleteJobDialog.css'

interface DeleteJobDialogProps {
  job: JobWithCandidateCount
  onDelete: (jobId: string) => Promise<void>
  onClose: () => void
}

type Phase = 'confirm' | 'blocked' | 'error'

export function DeleteJobDialog({ job, onDelete, onClose }: DeleteJobDialogProps) {
  const [phase, setPhase] = useState<Phase>('confirm')
  const [submitting, setSubmitting] = useState(false)

  async function handleDelete() {
    if (submitting) {
      return
    }
    setSubmitting(true)
    try {
      await onDelete(job.id)
      onClose()
    } catch (error) {
      setPhase(error instanceof ApiError && error.status === 409 ? 'blocked' : 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'blocked') {
    return (
      <Modal title="Kan inte radera jobb" onClose={onClose}>
        <p>
          Jobbet har {job.candidateCount}{' '}
          {job.candidateCount === 1 ? 'kopplad kandidat' : 'kopplade kandidater'} som måste tas
          bort eller flyttas innan jobbet kan raderas.
        </p>
        <div className="delete-job-dialog__actions">
          <button type="button" className="delete-job-dialog__cancel" onClick={onClose}>
            Stäng
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Radera jobb?" onClose={onClose}>
      <p>Är du säker på att du vill radera &quot;{job.title}&quot;? Detta går inte att ångra.</p>
      {phase === 'error' && (
        <p className="delete-job-dialog__error" role="alert">
          Något gick fel. Försök igen.
        </p>
      )}
      <div className="delete-job-dialog__actions">
        <button
          type="button"
          className="delete-job-dialog__cancel"
          onClick={onClose}
          disabled={submitting}
        >
          Avbryt
        </button>
        <button
          type="button"
          className="delete-job-dialog__confirm"
          onClick={handleDelete}
          disabled={submitting}
        >
          {submitting ? 'Raderar …' : 'Radera'}
        </button>
      </div>
    </Modal>
  )
}
