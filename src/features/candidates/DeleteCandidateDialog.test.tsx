import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CandidateRead } from '../../api/types'
import { DeleteCandidateDialog } from './DeleteCandidateDialog'

function buildCandidate(overrides: Partial<CandidateRead> = {}): CandidateRead {
  return {
    id: 'candidate-1',
    job_id: 'job-1',
    name: 'Anna Andersson',
    email: 'anna@example.com',
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

describe('DeleteCandidateDialog', () => {
  it('shows the confirmation with the candidate name', () => {
    render(<DeleteCandidateDialog candidate={buildCandidate()} onDelete={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByText('Radera kandidat?')).toBeInTheDocument()
    expect(screen.getByText(/Anna Andersson/)).toBeInTheDocument()
  })

  it('deletes and closes on success', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<DeleteCandidateDialog candidate={buildCandidate()} onDelete={onDelete} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Radera' }))

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(onDelete).toHaveBeenCalledWith('candidate-1')
  })

  it('shows an inline error and stays open on failure', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('boom'))
    render(<DeleteCandidateDialog candidate={buildCandidate()} onDelete={onDelete} onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Radera' }))

    await screen.findByRole('alert')
    expect(screen.getByRole('alert')).toHaveTextContent('Något gick fel. Försök igen.')
    expect(screen.getByRole('button', { name: 'Radera' })).toBeInTheDocument()
  })
})
