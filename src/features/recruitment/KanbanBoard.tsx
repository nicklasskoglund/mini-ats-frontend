// The recruitment kanban board (DESIGN.md section 7): filters above six
// fixed-order columns. Grouping by stage and filtering both happen
// server-side (see useKanbanBoard) - this component only renders.
import { STAGE_ORDER } from '../candidates/stageLabels'
import { KanbanColumn } from './KanbanColumn'
import { KanbanFilters } from './KanbanFilters'
import { useKanbanBoard } from './useKanbanBoard'
import './KanbanBoard.css'

export function KanbanBoard() {
  const {
    board,
    jobs,
    jobTitleById,
    loading,
    loadError,
    jobFilter,
    setJobFilter,
    nameFilter,
    setNameFilter,
    moveCandidate,
    reload,
  } = useKanbanBoard()

  const showJobTitle = jobFilter === null

  return (
    <div className="kanban-board">
      <KanbanFilters
        jobs={jobs}
        jobFilter={jobFilter}
        onJobFilterChange={setJobFilter}
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
      />

      {loadError ? (
        <div className="kanban-board__error">
          <p>Något gick fel. Försök igen.</p>
          <button type="button" onClick={reload}>
            Försök igen
          </button>
        </div>
      ) : (
        <div className="kanban-board__columns">
          {STAGE_ORDER.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              candidates={board[stage]}
              jobTitleById={jobTitleById}
              showJobTitle={showJobTitle}
              loading={loading}
              onMove={moveCandidate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
