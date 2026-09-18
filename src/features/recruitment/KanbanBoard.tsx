// The recruitment kanban board (DESIGN.md section 7): filters above six
// fixed-order columns. Grouping by stage and filtering both happen
// server-side (see useKanbanBoard) - this component only renders.
//
// activeMobileStage picks which single column shows below the 720px
// breakpoint (DESIGN.md section 15). It's tracked unconditionally, but
// only has a visible effect on mobile - desktop always shows every column
// via CSS regardless of this value.
import { useState } from 'react'
import type { Stage } from '../../api/types'
import { STAGE_ORDER } from '../candidates/stageLabels'
import { KanbanColumn } from './KanbanColumn'
import { KanbanFilters } from './KanbanFilters'
import { KanbanMobileTabs } from './KanbanMobileTabs'
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
  const [activeMobileStage, setActiveMobileStage] = useState<Stage>(STAGE_ORDER[0])

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
        <>
          <KanbanMobileTabs
            activeStage={activeMobileStage}
            onChange={setActiveMobileStage}
            board={board}
          />
          <div className="kanban-board__columns">
            {STAGE_ORDER.map((stage) => (
              <div
                key={stage}
                className={
                  stage === activeMobileStage
                    ? 'kanban-board__column kanban-board__column--active'
                    : 'kanban-board__column'
                }
              >
                <KanbanColumn
                  stage={stage}
                  candidates={board[stage]}
                  jobTitleById={jobTitleById}
                  showJobTitle={showJobTitle}
                  loading={loading}
                  onMove={moveCandidate}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
