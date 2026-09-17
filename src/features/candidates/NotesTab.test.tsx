import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CandidateRead } from '../../api/types'
import { NotesTab } from './NotesTab'

function buildCandidate(overrides: Partial<CandidateRead> = {}): CandidateRead {
  return {
    id: 'candidate-1',
    job_id: 'job-1',
    name: 'Anna Andersson',
    email: 'anna@example.com',
    phone: null,
    linkedin_url: null,
    cv_text: null,
    notes: 'Bra kandidat.',
    stage: 'new',
    ai_score: null,
    ai_summary: null,
    ai_strengths: null,
    ai_gaps: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('NotesTab', () => {
  it('prefills the textarea with the current notes', () => {
    render(<NotesTab candidate={buildCandidate()} onSave={vi.fn()} />)

    expect(screen.getByLabelText('Anteckningar')).toHaveValue('Bra kandidat.')
  })

  it('saves the edited notes', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<NotesTab candidate={buildCandidate()} onSave={onSave} />)

    fireEvent.change(screen.getByLabelText('Anteckningar'), { target: { value: 'Uppdaterad text' } })
    fireEvent.click(screen.getByRole('button', { name: 'Spara anteckningar' }))

    await vi.waitFor(() => expect(onSave).toHaveBeenCalledWith('Uppdaterad text'))
  })

  it('shows an inline error when saving fails', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('boom'))
    render(<NotesTab candidate={buildCandidate()} onSave={onSave} />)

    fireEvent.click(screen.getByRole('button', { name: 'Spara anteckningar' }))

    await screen.findByRole('alert')
    expect(screen.getByRole('alert')).toHaveTextContent('Något gick fel. Försök igen.')
  })
})
