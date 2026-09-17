import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { JobRead } from '../../api/types'
import { JobFormModal } from './JobFormModal'

function buildJob(overrides: Partial<JobRead> = {}): JobRead {
  return {
    id: 'job-1',
    customer_id: 'customer-1',
    title: 'Frontend developer',
    description: 'Build things',
    status: 'paused',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('JobFormModal', () => {
  it('create mode starts empty with no status field', () => {
    render(<JobFormModal mode="create" onSubmit={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByText('Skapa nytt jobb')).toBeInTheDocument()
    expect(screen.getByLabelText('Titel')).toHaveValue('')
    expect(screen.getByLabelText('Beskrivning')).toHaveValue('')
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument()
  })

  it('edit mode prefills all fields, including status', () => {
    render(<JobFormModal mode="edit" job={buildJob()} onSubmit={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByText('Redigera jobb')).toBeInTheDocument()
    expect(screen.getByLabelText('Titel')).toHaveValue('Frontend developer')
    expect(screen.getByLabelText('Beskrivning')).toHaveValue('Build things')
    expect(screen.getByLabelText('Status')).toHaveValue('paused')
  })

  it('falls back to Aktiv in the status dropdown for an unrecognized stored status', () => {
    render(
      <JobFormModal mode="edit" job={buildJob({ status: 'open' })} onSubmit={vi.fn()} onClose={vi.fn()} />,
    )

    expect(screen.getByLabelText('Status')).toHaveValue('active')
  })

  it('submits the current field values and closes on success', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<JobFormModal mode="create" onSubmit={onSubmit} onClose={onClose} />)

    fireEvent.change(screen.getByLabelText('Titel'), { target: { value: 'New role' } })
    fireEvent.change(screen.getByLabelText('Beskrivning'), { target: { value: 'A description' } })
    fireEvent.click(screen.getByRole('button', { name: 'Skapa jobb' }))

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'New role',
      description: 'A description',
      status: 'active',
    })
  })

  it('shows an inline error and keeps the modal open when the submission fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('boom'))
    const onClose = vi.fn()
    render(<JobFormModal mode="create" onSubmit={onSubmit} onClose={onClose} />)

    fireEvent.change(screen.getByLabelText('Titel'), { target: { value: 'New role' } })
    fireEvent.change(screen.getByLabelText('Beskrivning'), { target: { value: 'A description' } })
    fireEvent.click(screen.getByRole('button', { name: 'Skapa jobb' }))

    await screen.findByRole('alert')
    expect(screen.getByRole('alert')).toHaveTextContent('Något gick fel. Försök igen.')
    expect(onClose).not.toHaveBeenCalled()
  })
})
