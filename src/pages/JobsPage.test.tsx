import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { JobWithCandidateCount } from '../features/jobs/useJobsList'
import { JobsPage } from './JobsPage'

const useAuthMock = vi.fn()
vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}))

const useActingAsMock = vi.fn()
vi.mock('../context/ActingAsProvider', () => ({
  useActingAs: () => useActingAsMock(),
}))

const useJobsListMock = vi.fn()
vi.mock('../features/jobs/useJobsList', () => ({
  useJobsList: () => useJobsListMock(),
}))

function buildJob(overrides: Partial<JobWithCandidateCount> = {}): JobWithCandidateCount {
  return {
    id: 'job-1',
    customer_id: 'customer-1',
    title: 'Frontend developer',
    description: 'Build things',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    candidateCount: 0,
    ...overrides,
  }
}

function setUpJobsList(overrides: Partial<ReturnType<typeof defaultJobsList>> = {}) {
  useJobsListMock.mockReturnValue({ ...defaultJobsList(), ...overrides })
}

function defaultJobsList() {
  return {
    jobs: [buildJob()],
    loading: false,
    loadError: false,
    reload: vi.fn(),
    createJob: vi.fn().mockResolvedValue(undefined),
    updateJob: vi.fn().mockResolvedValue(undefined),
    deleteJob: vi.fn().mockResolvedValue(undefined),
  }
}

describe('JobsPage', () => {
  it('enables "+ Nytt jobb" for a customer', () => {
    useAuthMock.mockReturnValue({ role: 'customer' })
    useActingAsMock.mockReturnValue({ customerId: null })
    setUpJobsList()

    render(<JobsPage />)

    expect(screen.getByRole('button', { name: '+ Nytt jobb' })).toBeEnabled()
    expect(screen.queryByText('Välj en kund att agera som för att skapa jobb.')).not.toBeInTheDocument()
  })

  it('disables "+ Nytt jobb" with a hint for an admin with no acting-as customer', () => {
    useAuthMock.mockReturnValue({ role: 'admin' })
    useActingAsMock.mockReturnValue({ customerId: null })
    setUpJobsList()

    render(<JobsPage />)

    expect(screen.getByRole('button', { name: '+ Nytt jobb' })).toBeDisabled()
    expect(screen.getByText('Välj en kund att agera som för att skapa jobb.')).toBeInTheDocument()
  })

  it('enables "+ Nytt jobb" for an admin with a customer selected', () => {
    useAuthMock.mockReturnValue({ role: 'admin' })
    useActingAsMock.mockReturnValue({ customerId: 'customer-1' })
    setUpJobsList()

    render(<JobsPage />)

    expect(screen.getByRole('button', { name: '+ Nytt jobb' })).toBeEnabled()
  })

  it('opens the edit modal from the table and closes it on cancel', () => {
    useAuthMock.mockReturnValue({ role: 'customer' })
    useActingAsMock.mockReturnValue({ customerId: null })
    setUpJobsList()

    render(<JobsPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Redigera' }))

    expect(screen.getByText('Redigera jobb')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Avbryt' }))

    expect(screen.queryByText('Redigera jobb')).not.toBeInTheDocument()
  })

  it('opens the delete dialog from the table', () => {
    useAuthMock.mockReturnValue({ role: 'customer' })
    useActingAsMock.mockReturnValue({ customerId: null })
    setUpJobsList()

    render(<JobsPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Radera' }))

    expect(screen.getByText('Radera jobb?')).toBeInTheDocument()
  })

  it('shows a retry option when the list failed to load', () => {
    useAuthMock.mockReturnValue({ role: 'customer' })
    useActingAsMock.mockReturnValue({ customerId: null })
    const reload = vi.fn()
    setUpJobsList({ loadError: true, reload })

    render(<JobsPage />)

    expect(screen.getByText('Något gick fel. Försök igen.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Försök igen' }))
    expect(reload).toHaveBeenCalledOnce()
  })
})
