// Kebab menu on a kanban card. In this step it only holds the
// "Flytta till …" submenu (DESIGN.md section 7); Redigera/Radera land
// here once the candidate profile exists (Step 5).
import { useEffect, useRef, useState } from 'react'
import type { CandidateRead, Stage } from '../../api/types'
import { STAGE_LABELS, STAGE_ORDER } from './stageLabels'
import './CandidateCardMenu.css'

interface CandidateCardMenuProps {
  candidate: CandidateRead
  onMove: (targetStage: Stage) => void
}

export function CandidateCardMenu({ candidate, onMove }: CandidateCardMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const otherStages = STAGE_ORDER.filter((stage) => stage !== candidate.stage)

  return (
    <div className="candidate-card-menu" ref={containerRef}>
      <button
        type="button"
        className="candidate-card-menu__trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Fler alternativ"
        onClick={() => setOpen((current) => !current)}
      >
        ⋯
      </button>
      {open && (
        <div className="candidate-card-menu__dropdown" role="menu">
          <p className="candidate-card-menu__heading">Flytta till …</p>
          {otherStages.map((stage) => (
            <button
              key={stage}
              type="button"
              role="menuitem"
              className="candidate-card-menu__item"
              onClick={() => {
                setOpen(false)
                onMove(stage)
              }}
            >
              {STAGE_LABELS[stage]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

