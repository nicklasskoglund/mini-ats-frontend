// One kanban column: header with count, drop target for drag & drop
// (dashed highlight while dragging over it, per DESIGN.md section 7), and
// either skeleton placeholders, an empty-state message, or the cards.
import { useRef, useState, type DragEvent } from 'react'
import type { CandidateRead, Stage } from '../../api/types'
import { STAGE_LABELS } from '../candidates/stageLabels'
import { CandidateCard } from './CandidateCard'
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
  // dragenter/dragleave fire for every child the pointer crosses, not just
  // the column itself - moving over a card inside the column fires enter
  // (child) then leave (column background), so a plain boolean flickers
  // off and on. A counter only reaches zero once the pointer has actually
  // left every nested element, matching the guaranteed enter-before-leave
  // ordering for that transition.
  const dragDepthRef = useRef(0)

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    dragDepthRef.current += 1
    setDragOver(true)
  }

  function handleDragLeave() {
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) {
      setDragOver(false)
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    dragDepthRef.current = 0
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
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
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
