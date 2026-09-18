import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { JobWithCandidateCount } from './useJobsList'
import { JobsTable } from './JobsTable'

function buildJob(overrides: Partial<JobWithCandidateCount> = {}): JobWithCandidateCount {
  return {
    id: 'job-1',
    customer_id: 'customer-1',
    title: 'Frontend developer',
    description: 'Build things',
    status: 'active',
    created_at: '2026-03-05T12:00:00Z',
    candidateCount: 3,
    ...overrides,
  }
}

describe('JobsTable', () => {
  it('shows skeleton rows while loading', () => {
    const { container } = render(
      <JobsTable jobs={[]} loading onEdit={vi.fn()} onDelete={vi.fn()} />,
    )

    expect(container.querySelectorAll('.skeleton-bar')).toHaveLength(3)
    expect(screen.queryByText('Frontend developer')).not.toBeInTheDocument()
  })

  it('shows an empty-state message when there are no jobs', () => {
    render(<JobsTable jobs={[]} loading={false} onEdit={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Inga jobb ännu. Skapa det första jobbet för att komma igång.')).toBeInTheDocument()
  })

  it('renders each job with its status label, candidate count and created date', () => {
    render(
      <JobsTable
        jobs={[buildJob({ status: 'paused', candidateCount: 5 })]}
        loading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Frontend developer')).toBeInTheDocument()
    expect(screen.getByText('Pausad')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('2026-03-05')).toBeInTheDocument()
  })

  it('calls onEdit/onDelete via the kebab menu', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const job = buildJob()
    render(<JobsTable jobs={[job]} loading={false} onEdit={onEdit} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Redigera' }))
    expect(onEdit).toHaveBeenCalledWith(job)

    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Radera' }))
    expect(onDelete).toHaveBeenCalledWith(job)
  })
})
