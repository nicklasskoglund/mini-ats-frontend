// Route for "/candidates" (DESIGN.md section 9): table plus "+ Lägg till
// kandidat", and the Redigera/Radera dialogs the table's kebab menu opens.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CandidateRead } from '../api/types'
import { CandidatesTable } from '../features/candidates/CandidatesTable'
import { DeleteCandidateDialog } from '../features/candidates/DeleteCandidateDialog'
import { EditCandidateModal } from '../features/candidates/EditCandidateModal'
import { deleteCandidate, updateCandidate } from '../features/candidates/candidateMutations'
import { useCandidates } from '../features/candidates/useCandidates'
import { useJobs } from '../features/jobs/useJobs'
import './CandidatesPage.css'

type DialogState =
  | { type: 'none' }
  | { type: 'edit'; candidate: CandidateRead }
  | { type: 'delete'; candidate: CandidateRead }

export function CandidatesPage() {
  const { candidates, loading: candidatesLoading, loadError, reload } = useCandidates()
  const { jobs } = useJobs()
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })

  const jobTitleById = useMemo(() => new Map(jobs.map((job) => [job.id, job.title])), [jobs])
  const closeDialog = () => setDialog({ type: 'none' })

  return (
    <div>
      <h1>Kandidater</h1>
      <div className="candidates-page__toolbar">
        <Link to="/candidates/new" className="candidates-page__create">
          + Lägg till kandidat
        </Link>
      </div>

      {loadError ? (
        <div className="candidates-page__error">
          <p>Något gick fel. Försök igen.</p>
          <button type="button" onClick={reload}>
            Försök igen
          </button>
        </div>
      ) : (
        <CandidatesTable
          candidates={candidates}
          jobTitleById={jobTitleById}
          loading={candidatesLoading}
          onEdit={(candidate) => setDialog({ type: 'edit', candidate })}
          onDelete={(candidate) => setDialog({ type: 'delete', candidate })}
        />
      )}

      {dialog.type === 'edit' && (
        <EditCandidateModal
          candidate={dialog.candidate}
          onSubmit={(values) =>
            updateCandidate(dialog.candidate.id, {
              name: values.name,
              email: values.email,
              phone: values.phone || null,
              linkedin_url: values.linkedinUrl || null,
            }).then(() => reload())
          }
          onClose={closeDialog}
        />
      )}

      {dialog.type === 'delete' && (
        <DeleteCandidateDialog
          candidate={dialog.candidate}
          onDelete={(id) => deleteCandidate(id).then(() => reload())}
          onClose={closeDialog}
        />
      )}
    </div>
  )
}
