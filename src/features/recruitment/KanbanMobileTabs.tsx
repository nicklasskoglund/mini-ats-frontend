// Mobile-only stage tabs (DESIGN.md section 15): below the 720px
// breakpoint, only one column is visible at a time, picked here. Hidden
// entirely on desktop, where all six columns already show at once - same
// tablist pattern as AccountTabs (section 12).
import type { CandidateRead, Stage } from '../../api/types'
import { STAGE_LABELS, STAGE_ORDER } from '../candidates/stageLabels'
import './KanbanMobileTabs.css'

interface KanbanMobileTabsProps {
  activeStage: Stage
  onChange: (stage: Stage) => void
  board: Record<Stage, CandidateRead[]>
}

export function KanbanMobileTabs({ activeStage, onChange, board }: KanbanMobileTabsProps) {
  return (
    <div className="kanban-mobile-tabs" role="tablist">
      {STAGE_ORDER.map((stage) => {
        const isActive = activeStage === stage
        return (
          <button
            key={stage}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={
              isActive
                ? 'kanban-mobile-tabs__tab kanban-mobile-tabs__tab--active'
                : 'kanban-mobile-tabs__tab'
            }
            onClick={() => onChange(stage)}
          >
            {STAGE_LABELS[stage]} ({board[stage].length})
          </button>
        )
      })}
    </div>
  )
}
