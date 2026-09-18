// Jobs list (DESIGN.md section 8): Titel/Status/Antal kandidater/Skapad,
// plus a kebab menu for Redigera/Radera. Skeleton rows while loading, a
// short message when there are none (avsnitt 13's loading/empty states).
import { KebabMenu } from '../../components/KebabMenu'
import { SkeletonTableRows } from '../../components/Skeleton'
import { formatDate } from '../../lib/formatDate'
import { getJobStatusLabel } from './jobStatus'
import type { JobWithCandidateCount } from './useJobsList'
import './JobsTable.css'

interface JobsTableProps {
  jobs: JobWithCandidateCount[]
  loading: boolean
  onEdit: (job: JobWithCandidateCount) => void
  onDelete: (job: JobWithCandidateCount) => void
}

export function JobsTable({ jobs, loading, onEdit, onDelete }: JobsTableProps) {
  return (
    <div className="jobs-table-container">
      <table className="jobs-table">
        <thead>
          <tr>
            <th>Titel</th>
            <th>Status</th>
            <th>Antal kandidater</th>
            <th>Skapad</th>
            <th aria-label="Åtgärder" />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonTableRows rows={3} colSpan={5} />
          ) : jobs.length === 0 ? (
            <tr>
              <td colSpan={5} className="jobs-table__empty">
                Inga jobb ännu. Skapa det första jobbet för att komma igång.
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{getJobStatusLabel(job.status)}</td>
                <td>{job.candidateCount}</td>
                <td>{formatDate(job.created_at)}</td>
                <td className="jobs-table__actions">
                  <KebabMenu
                    items={[
                      { label: 'Redigera', onClick: () => onEdit(job) },
                      { label: 'Radera', onClick: () => onDelete(job) },
                    ]}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
