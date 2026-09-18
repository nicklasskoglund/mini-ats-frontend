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
  /**
   * Override the default "⋯" icon trigger with a labelled button, e.g.
   * "Flytta till … ▾" for the candidate profile header's explicit move
   * control (DESIGN.md section 10) - same menu mechanics, different
   * visible trigger than the plain action kebabs.
   */
  triggerLabel?: string
  triggerAriaLabel?: string
}

interface MenuPosition {
  top: number
  left: number
}

const MENU_WIDTH_PX = 160
const VIEWPORT_MARGIN_PX = 8

export function KebabMenu({ heading, items, triggerLabel, triggerAriaLabel }: KebabMenuProps) {
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

    // Escape returns focus to the trigger, same as Modal.tsx - without
    // this a keyboard user has no way to close the menu at all, since the
    // dropdown is portaled to the end of document.body and so isn't
    // reachable by continuing to Tab from the trigger in visual order.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleDismiss, true)
    window.addEventListener('resize', handleDismiss)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleDismiss, true)
      window.removeEventListener('resize', handleDismiss)
    }
  }, [open])

  // Moves focus into the dropdown as soon as it's positioned, so a
  // keyboard user who activated the trigger lands on the first item
  // instead of the menu opening with focus left behind on the trigger.
  useEffect(() => {
    if (open && position) {
      dropdownRef.current?.querySelector('button')?.focus()
    }
  }, [open, position])

  return (
    <div className="kebab-menu">
      <button
        ref={triggerRef}
        type="button"
        className={triggerLabel ? 'kebab-menu__trigger kebab-menu__trigger--labelled' : 'kebab-menu__trigger'}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={triggerAriaLabel ?? 'Fler alternativ'}
        onClick={() => setOpen((current) => !current)}
      >
        {triggerLabel ?? '⋯'}
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
