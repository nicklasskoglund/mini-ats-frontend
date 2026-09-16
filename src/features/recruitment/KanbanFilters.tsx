// Job dropdown and name search above the board. Both filter via the API
// (job_id/name query params) - never client-side (DESIGN.md section 7).
import type { JobRead } from '../../api/types'
import './KanbanFilters.css'

interface KanbanFiltersProps {
  jobs: JobRead[]
  jobFilter: string | null
  onJobFilterChange: (jobId: string | null) => void
  nameFilter: string
  onNameFilterChange: (name: string) => void
}

export function KanbanFilters({
  jobs,
  jobFilter,
  onJobFilterChange,
  nameFilter,
  onNameFilterChange,
}: KanbanFiltersProps) {
  return (
    <div className="kanban-filters">
      <label className="kanban-filters__field">
        <span>Jobb</span>
        <select
          value={jobFilter ?? ''}
          onChange={(event) => onJobFilterChange(event.target.value || null)}
        >
          <option value="">Alla jobb</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </label>
      <label className="kanban-filters__field">
        <span>Sök kandidat</span>
        <input
          type="search"
          placeholder="Namn …"
          value={nameFilter}
          onChange={(event) => onNameFilterChange(event.target.value)}
        />
      </label>
    </div>
  )
}
