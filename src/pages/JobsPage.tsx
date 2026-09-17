// Route for "/jobs" (DESIGN.md section 8): table, "+ Nytt jobb", and the
// create/edit/delete dialogs, wired to useJobsList.
import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { useActingAs } from '../context/ActingAsProvider'
import { DeleteJobDialog } from '../features/jobs/DeleteJobDialog'
import { JobFormModal } from '../features/jobs/JobFormModal'
import { JobsTable } from '../features/jobs/JobsTable'
import { useJobsList, type JobWithCandidateCount } from '../features/jobs/useJobsList'
import './JobsPage.css'

type DialogState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; job: JobWithCandidateCount }
  | { type: 'delete'; job: JobWithCandidateCount }

export function JobsPage() {
  const { role } = useAuth()
  const { customerId } = useActingAs()
  const { jobs, loading, loadError, reload, createJob, updateJob, deleteJob } = useJobsList()
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })

  const createDisabled = role === 'admin' && customerId === null
  const closeDialog = () => setDialog({ type: 'none' })

  return (
    <div>
      <h1>Jobb</h1>
      <div className="jobs-page__toolbar">
        <button
          type="button"
          className="jobs-page__create"
          disabled={createDisabled}
          onClick={() => setDialog({ type: 'create' })}
        >
          + Nytt jobb
        </button>
        {createDisabled && (
          <p className="jobs-page__hint">Välj en kund att agera som för att skapa jobb.</p>
        )}
      </div>

      {loadError ? (
        <div className="jobs-page__error">
          <p>Något gick fel. Försök igen.</p>
          <button type="button" onClick={reload}>
            Försök igen
          </button>
        </div>
      ) : (
        <JobsTable
          jobs={jobs}
          loading={loading}
          onEdit={(job) => setDialog({ type: 'edit', job })}
          onDelete={(job) => setDialog({ type: 'delete', job })}
        />
      )}

      {dialog.type === 'create' && (
        <JobFormModal
          mode="create"
          onSubmit={(values) =>
            createJob({ title: values.title, description: values.description })
          }
          onClose={closeDialog}
        />
      )}

      {dialog.type === 'edit' && (
        <JobFormModal
          mode="edit"
          job={dialog.job}
          onSubmit={(values) => updateJob(dialog.job.id, values)}
          onClose={closeDialog}
        />
      )}

      {dialog.type === 'delete' && (
        <DeleteJobDialog job={dialog.job} onDelete={deleteJob} onClose={closeDialog} />
      )}
    </div>
  )
}
