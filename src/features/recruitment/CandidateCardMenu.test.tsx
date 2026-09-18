import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CandidateRead } from '../../api/types'
import { CandidateCardMenu } from './CandidateCardMenu'

function buildCandidate(overrides: Partial<CandidateRead> = {}): CandidateRead {
  return {
    id: 'candidate-1',
    job_id: 'job-1',
    name: 'Anna Andersson',
    email: null,
    phone: null,
    linkedin_url: null,
    cv_text: null,
    notes: null,
    stage: 'new',
    ai_score: null,
    ai_summary: null,
    ai_strengths: null,
    ai_gaps: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function openMenu() {
  fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
}

describe('CandidateCardMenu', () => {
  it('renders the dropdown in a portal on document.body, not inside the card', () => {
    // Regression test for the clipped-menu bug: a dropdown nested inside
    // the card/column would previously get cut off by their rounded-corner
    // overflow clipping when the card sat near the bottom of a column.
    const { container } = render(
      <CandidateCardMenu candidate={buildCandidate()} onMove={vi.fn()} />,
    )

    openMenu()

    const dropdown = screen.getByRole('menu')
    expect(container.contains(dropdown)).toBe(false)
    expect(document.body.contains(dropdown)).toBe(true)
  })

  it('lists every stage except the candidate\'s current one, so all are reachable', () => {
    render(<CandidateCardMenu candidate={buildCandidate({ stage: 'screening' })} onMove={vi.fn()} />)

    openMenu()

    const items = screen.getAllByRole('menuitem').map((item) => item.textContent)
    expect(items).toEqual(['Ny', 'Intervju', 'Erbjudande', 'Anställd', 'Avvisad'])
  })

  it('calls onMove with the chosen stage and closes the menu', () => {
    const onMove = vi.fn()
    render(<CandidateCardMenu candidate={buildCandidate({ stage: 'new' })} onMove={onMove} />)

    openMenu()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Avvisad' }))

    expect(onMove).toHaveBeenCalledWith('rejected')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
