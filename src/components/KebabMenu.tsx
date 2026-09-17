// Generic "⋯" action menu, extracted from the kanban card's original
// move-to menu (Step 3) so every kebab menu in the app shares one
// implementation instead of copying the mechanics per feature.
//
// The dropdown is rendered in a portal to document.body and positioned
// with position: fixed from the trigger's own getBoundingClientRect(),
// rather than as a normal absolutely-positioned child. An item near the
// edge of its container otherwise gets its menu clipped by an ancestor's
// overflow (e.g. the rounded-corner clipping on cards/panels, DESIGN.md
// section 3) - a portal has no such ancestor to inherit clipping from.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './KebabMenu.css'

export interface KebabMenuItem {
  label: string
  onClick: () => void
}

interface KebabMenuProps {
  /** Optional non-interactive label shown above the items, e.g. "Flytta till …". */
  heading?: string
  items: KebabMenuItem[]
}

interface MenuPosition {
  top: number
  left: number
}

const MENU_WIDTH_PX = 160
const VIEWPORT_MARGIN_PX = 8

export function KebabMenu({ heading, items }: KebabMenuProps) {
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

  return (
    <div className="kebab-menu">
      <button
        ref={triggerRef}
        type="button"
        className="kebab-menu__trigger"
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
            className="kebab-menu__dropdown"
            role="menu"
            style={{ position: 'fixed', top: position.top, left: position.left }}
          >
            {heading && <p className="kebab-menu__heading">{heading}</p>}
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className="kebab-menu__item"
                onClick={() => {
                  setOpen(false)
                  item.onClick()
                }}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  )
}
