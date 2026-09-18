import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/errors'
import type { JobWithCandidateCount } from './useJobsList'
import { DeleteJobDialog } from './DeleteJobDialog'

function buildJob(overrides: Partial<JobWithCandidateCount> = {}): JobWithCandidateCount {
  return {
    id: 'job-1',
    customer_id: 'customer-1',
    title: 'Frontend developer',
    description: 'Build things',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    candidateCount: 3,
    ...overrides,
  }
}

describe('DeleteJobDialog', () => {
  it('shows the normal confirmation with the job title', () => {
    render(<DeleteJobDialog job={buildJob()} onDelete={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByText('Radera jobb?')).toBeInTheDocument()
    expect(screen.getByText(/Frontend developer/)).toBeInTheDocument()
  })

  it('deletes and closes on success', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<DeleteJobDialog job={buildJob()} onDelete={onDelete} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Radera' }))

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(onDelete).toHaveBeenCalledWith('job-1')
  })

  it('switches to the blocked dialog on a 409, using the already-known candidate count', async () => {
    const onDelete = vi.fn().mockRejectedValue(new ApiError(409, 'Job has candidates'))
    render(<DeleteJobDialog job={buildJob({ candidateCount: 4 })} onDelete={onDelete} onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Radera' }))

    await screen.findByText('Kan inte radera jobb')
    expect(screen.getByText(/har 4 kopplade kandidater/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Radera' })).not.toBeInTheDocument()
    // Two "Stäng"-labelled buttons are expected: the modal's own "×"
    // close button, plus the dialog's explicit action button.
    expect(screen.getAllByRole('button', { name: 'Stäng' })).toHaveLength(2)
  })

  it('uses singular phrasing for exactly one candidate', async () => {
    const onDelete = vi.fn().mockRejectedValue(new ApiError(409, 'Job has candidates'))
    render(<DeleteJobDialog job={buildJob({ candidateCount: 1 })} onDelete={onDelete} onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Radera' }))

    await screen.findByText(/har 1 kopplad kandidat /)
  })

  it('shows an inline error and stays on the confirm dialog for a non-409 failure', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('network down'))
    render(<DeleteJobDialog job={buildJob()} onDelete={onDelete} onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Radera' }))

    await screen.findByRole('alert')
    expect(screen.getByRole('alert')).toHaveTextContent('Något gick fel. Försök igen.')
    expect(screen.getByRole('button', { name: 'Radera' })).toBeInTheDocument()
  })
})
