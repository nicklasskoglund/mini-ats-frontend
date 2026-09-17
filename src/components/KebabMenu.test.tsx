import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { KebabMenu } from './KebabMenu'

function openMenu() {
  fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
}

describe('KebabMenu', () => {
  it('renders the dropdown in a portal on document.body, not inside its own container', () => {
    const { container } = render(
      <KebabMenu items={[{ label: 'Redigera', onClick: vi.fn() }]} />,
    )

    openMenu()

    const dropdown = screen.getByRole('menu')
    expect(container.contains(dropdown)).toBe(false)
    expect(document.body.contains(dropdown)).toBe(true)
  })

  it('renders an optional heading above the items', () => {
    render(<KebabMenu heading="Flytta till …" items={[{ label: 'Ny', onClick: vi.fn() }]} />)

    openMenu()

    expect(screen.getByText('Flytta till …')).toBeInTheDocument()
  })

  it('renders no heading when none is given', () => {
    render(<KebabMenu items={[{ label: 'Redigera', onClick: vi.fn() }]} />)

    openMenu()

    expect(screen.queryByRole('menu')?.querySelector('p')).toBeNull()
  })

  it('calls the item onClick and closes the menu', () => {
    const onClick = vi.fn()
    render(
      <KebabMenu
        items={[
          { label: 'Redigera', onClick: vi.fn() },
          { label: 'Radera', onClick },
        ]}
      />,
    )

    openMenu()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Radera' }))

    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('renders a custom trigger label and aria-label when given', () => {
    render(
      <KebabMenu
        triggerLabel="Flytta till … ▾"
        triggerAriaLabel="Flytta till"
        items={[{ label: 'Ny', onClick: vi.fn() }]}
      />,
    )

    expect(screen.getByRole('button', { name: 'Flytta till' })).toHaveTextContent(
      'Flytta till … ▾',
    )
  })

  it('closes when clicking outside the menu', () => {
    render(<KebabMenu items={[{ label: 'Redigera', onClick: vi.fn() }]} />)

    openMenu()
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
