// Kebab menu on a kanban card. In this step it only holds the
// "Flytta till …" submenu (DESIGN.md section 7); Redigera/Radera land
// here once the candidate profile exists (Step 5).
//
// The dropdown is rendered in a portal to document.body and positioned
// with position: fixed from the trigger's own getBoundingClientRect(),
// rather than as a normal absolutely-positioned child. A card near the
// bottom of a column otherwise gets its menu clipped by an ancestor's
// overflow (the column/card's rounded-corner clipping, DESIGN.md section
// 3) - a portal has no such ancestor to inherit clipping from.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CandidateRead, Stage } from '../../api/types'
import { STAGE_LABELS, STAGE_ORDER } from './stageLabels'
import './CandidateCardMenu.css'

interface CandidateCardMenuProps {
  candidate: CandidateRead
  onMove: (targetStage: Stage) => void
}

interface MenuPosition {
  top: number
  left: number
}

const MENU_WIDTH_PX = 160
const VIEWPORT_MARGIN_PX = 8

export function CandidateCardMenu({ candidate, onMove }: CandidateCardMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<MenuPosition | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return
    }
    const rect = triggerRef.current.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 4,
      left: Math.max(rect.right - MENU_WIDTH_PX, VIEWPORT_MARGIN_PX),
    })
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }

    // A scrolling or resized page would leave a position: fixed menu
    // visually detached from its trigger, since it no longer moves with
    // it - closing is simpler than tracking the trigger continuously.
    function handleDismiss() {
      setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('scroll', handleDismiss, true)
    window.addEventListener('resize', handleDismiss)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('scroll', handleDismiss, true)
      window.removeEventListener('resize', handleDismiss)
    }
  }, [open])

  const otherStages = STAGE_ORDER.filter((stage) => stage !== candidate.stage)

  return (
    <div className="candidate-card-menu">
      <button
        ref={triggerRef}
        type="button"
        className="candidate-card-menu__trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Fler alternativ"
        onClick={() => setOpen((current) => !current)}
      >
        ⋯
      </button>
      {open &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            className="candidate-card-menu__dropdown"
            role="menu"
            style={{ position: 'fixed', top: position.top, left: position.left }}
          >
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
          </div>,
          document.body,
        )}
    </div>
  )
}
