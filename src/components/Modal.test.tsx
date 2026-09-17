import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders the title and children in a portal on document.body', () => {
    const { container } = render(
      <Modal title="Skapa nytt jobb" onClose={vi.fn()}>
        <p>Innehåll</p>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog')
    expect(container.contains(dialog)).toBe(false)
    expect(screen.getByText('Skapa nytt jobb')).toBeInTheDocument()
    expect(screen.getByText('Innehåll')).toBeInTheDocument()
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal title="Skapa nytt jobb" onClose={onClose}>
        <p>Innehåll</p>
      </Modal>,
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes on backdrop click but not on a click inside the panel', () => {
    const onClose = vi.fn()
    render(
      <Modal title="Skapa nytt jobb" onClose={onClose}>
        <p>Innehåll</p>
      </Modal>,
    )

    fireEvent.mouseDown(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.mouseDown(screen.getByRole('dialog').parentElement as HTMLElement)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes via the close button', () => {
    const onClose = vi.fn()
    render(
      <Modal title="Skapa nytt jobb" onClose={onClose}>
        <p>Innehåll</p>
      </Modal>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Stäng' }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
