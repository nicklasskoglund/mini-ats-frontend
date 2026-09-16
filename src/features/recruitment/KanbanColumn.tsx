// One kanban column: header with count, drop target for drag & drop
// (dashed highlight while dragging over it, per DESIGN.md section 7), and
// either skeleton placeholders, an empty-state message, or the cards.
import { useState, type DragEvent } from 'react'
import type { CandidateRead, Stage } from '../../api/types'
import { CandidateCard } from './CandidateCard'
import { STAGE_LABELS } from './stageLabels'
import './KanbanColumn.css'

interface KanbanColumnProps {
  stage: Stage
  candidates: CandidateRead[]
  jobTitleById: Map<string, string>
  showJobTitle: boolean
  loading: boolean
  onMove: (candidate: CandidateRead, targetStage: Stage) => void
}

export function KanbanColumn({
  stage,
  candidates,
  jobTitleById,
  showJobTitle,
  loading,
  onMove,
}: KanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false)

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragOver(false)
    const data = event.dataTransfer.getData('application/json')
    if (!data) {
      return
    }
    const candidate: CandidateRead = JSON.parse(data)
    onMove(candidate, stage)
  }

  return (
    <div
      className={dragOver ? 'kanban-column kanban-column--drag-over' : 'kanban-column'}
      onDragOver={handleDragOver}
      onDragEnter={() => setDragOver(true)}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="kanban-column__header">
        <span className="kanban-column__title">{STAGE_LABELS[stage]}</span>
        {!loading && <span className="kanban-column__count">{candidates.length}</span>}
      </div>
      <div className="kanban-column__list">
        {loading ? (
          <>
            <div className="kanban-column__skeleton-card" />
            <div className="kanban-column__skeleton-card" />
          </>
        ) : candidates.length === 0 ? (
          <p className="kanban-column__empty">Inga kandidater här.</p>
        ) : (
          candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              jobTitle={jobTitleById.get(candidate.job_id)}
              showJobTitle={showJobTitle}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </div>
  )
}
