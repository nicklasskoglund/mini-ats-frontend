import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CandidateRead } from '../../api/types'
import { EditCandidateModal } from './EditCandidateModal'

function buildCandidate(overrides: Partial<CandidateRead> = {}): CandidateRead {
  return {
    id: 'candidate-1',
    job_id: 'job-1',
    name: 'Anna Andersson',
    email: 'anna@example.com',
    phone: '070-1234567',
    linkedin_url: 'https://linkedin.com/in/anna',
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

describe('EditCandidateModal', () => {
  it('prefills all four fields, with no job or stage field', () => {
    render(<EditCandidateModal candidate={buildCandidate()} onSubmit={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByLabelText('Namn')).toHaveValue('Anna Andersson')
    expect(screen.getByLabelText('E-post')).toHaveValue('anna@example.com')
    expect(screen.getByLabelText('Telefon')).toHaveValue('070-1234567')
    expect(screen.getByLabelText('LinkedIn-URL')).toHaveValue('https://linkedin.com/in/anna')
    expect(screen.queryByLabelText('Jobb')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Steg')).not.toBeInTheDocument()
  })

  it('submits the edited values and closes on success', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<EditCandidateModal candidate={buildCandidate()} onSubmit={onSubmit} onClose={onClose} />)

    fireEvent.change(screen.getByLabelText('Namn'), { target: { value: 'Anna A. Andersson' } })
    fireEvent.click(screen.getByRole('button', { name: 'Spara' }))

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Anna A. Andersson',
      email: 'anna@example.com',
      phone: '070-1234567',
      linkedinUrl: 'https://linkedin.com/in/anna',
    })
  })

  it('shows an inline error and keeps the modal open on failure', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('boom'))
    render(<EditCandidateModal candidate={buildCandidate()} onSubmit={onSubmit} onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Spara' }))

    await screen.findByRole('alert')
    expect(screen.getByRole('alert')).toHaveTextContent('Något gick fel. Försök igen.')
  })
})
