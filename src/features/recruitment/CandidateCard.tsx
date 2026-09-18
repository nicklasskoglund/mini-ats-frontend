// One card on the kanban board (DESIGN.md section 7): name, job title
// (only when the board isn't already filtered to one job), score chip,
// status badge, and the "move to" menu. Draggable on desktop; touch
// devices never fire native HTML5 drag events, so mobile naturally falls
// back to the menu without extra code (see section 15).
import type { DragEvent } from 'react'
import type { CandidateRead, Stage } from '../../api/types'
import { CandidateCardMenu } from './CandidateCardMenu'
import { deriveScoreLabel, deriveStatusBadge } from '../candidates/candidateDisplay'
import './CandidateCard.css'

interface CandidateCardProps {
  candidate: CandidateRead
  jobTitle: string | undefined
  showJobTitle: boolean
  onMove: (candidate: CandidateRead, targetStage: Stage) => void
}

export function CandidateCard({ candidate, jobTitle, showJobTitle, onMove }: CandidateCardProps) {
  const scoreLabel = deriveScoreLabel(candidate.ai_score)
  const badge = deriveStatusBadge(candidate.ai_score)

  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    event.dataTransfer.setData('application/json', JSON.stringify(candidate))
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="candidate-card" draggable onDragStart={handleDragStart}>
      <div className="candidate-card__header">
        <span className="candidate-card__name">{candidate.name}</span>
        <CandidateCardMenu candidate={candidate} onMove={(stage) => onMove(candidate, stage)} />
      </div>
      {showJobTitle && jobTitle && <p className="candidate-card__job">{jobTitle}</p>}
      <div className="candidate-card__footer">
        <span className="candidate-card__score">{scoreLabel}</span>
        <span className={`candidate-card__badge candidate-card__badge--${badge.tone}`}>
          {badge.label}
        </span>
      </div>
    </div>
  )
}
