import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CandidateRead } from '../../api/types'
import { CvTab } from './CvTab'

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

describe('CvTab', () => {
  it('shows the empty state with a textarea and save button when there is no CV text', () => {
    render(<CvTab candidate={buildCandidate({ cv_text: null })} onSave={vi.fn()} />)

    expect(screen.getByText('Ingen CV-text ännu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spara CV-text' })).toBeInTheDocument()
  })

  it('shows the saved text and a Redigera button when CV text exists', () => {
    render(<CvTab candidate={buildCandidate({ cv_text: 'Erfaren utvecklare.' })} onSave={vi.fn()} />)

    expect(screen.getByText('Erfaren utvecklare.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Redigera' })).toBeInTheDocument()
    expect(screen.queryByText('Senast uppdaterad')).not.toBeInTheDocument()
  })

  it('switches to edit mode and saves the new text', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<CvTab candidate={buildCandidate({ cv_text: 'Gammal text' })} onSave={onSave} />)

    fireEvent.click(screen.getByRole('button', { name: 'Redigera' }))
    const textarea = screen.getByDisplayValue('Gammal text')
    fireEvent.change(textarea, { target: { value: 'Ny text' } })
    fireEvent.click(screen.getByRole('button', { name: 'Spara CV-text' }))

    await vi.waitFor(() => expect(onSave).toHaveBeenCalledWith('Ny text'))
  })

  it('cancels edit mode without saving', () => {
    render(<CvTab candidate={buildCandidate({ cv_text: 'Gammal text' })} onSave={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Redigera' }))
    fireEvent.change(screen.getByDisplayValue('Gammal text'), { target: { value: 'Utkast' } })
    fireEvent.click(screen.getByRole('button', { name: 'Avbryt' }))

    expect(screen.getByText('Gammal text')).toBeInTheDocument()
  })

  it('shows an inline error when saving fails', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('boom'))
    render(<CvTab candidate={buildCandidate({ cv_text: null })} onSave={onSave} />)

    fireEvent.click(screen.getByRole('button', { name: 'Spara CV-text' }))

    await screen.findByRole('alert')
    expect(screen.getByRole('alert')).toHaveTextContent('Något gick fel. Försök igen.')
  })
})
