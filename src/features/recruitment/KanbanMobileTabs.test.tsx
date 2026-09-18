import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CandidateRead, Stage } from '../../api/types'
import { KanbanMobileTabs } from './KanbanMobileTabs'

function buildBoard(overrides: Partial<Record<Stage, CandidateRead[]>> = {}) {
  return {
    new: [],
    screening: [],
    interview: [],
    offer: [],
    hired: [],
    rejected: [],
    ...overrides,
  }
}

describe('KanbanMobileTabs', () => {
  it('shows every stage with its candidate count, and marks the active one', () => {
    render(
      <KanbanMobileTabs
        activeStage="screening"
        onChange={vi.fn()}
        board={buildBoard({ new: [{} as CandidateRead], screening: [{} as CandidateRead] })}
      />,
    )

    expect(screen.getByRole('tab', { name: 'Ny (1)' })).toHaveAttribute('aria-selected', 'false')
    const active = screen.getByRole('tab', { name: 'Screening (1)' })
    expect(active).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onChange with the picked stage', () => {
    const onChange = vi.fn()
    render(<KanbanMobileTabs activeStage="new" onChange={onChange} board={buildBoard()} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Erbjudande (0)' }))

    expect(onChange).toHaveBeenCalledWith('offer')
  })
})
