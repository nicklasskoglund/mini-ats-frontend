import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AddCandidatePage } from './AddCandidatePage'

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const useJobsMock = vi.fn()
vi.mock('../features/jobs/useJobs', () => ({
  useJobs: () => useJobsMock(),
}))

const createCandidateMock = vi.fn()
vi.mock('../features/candidates/candidateMutations', () => ({
  createCandidate: (...args: unknown[]) => createCandidateMock(...args),
}))

function renderPage(initialPath = '/candidates/new') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AddCandidatePage />
    </MemoryRouter>,
  )
}

describe('AddCandidatePage', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    createCandidateMock.mockReset()
    useJobsMock.mockReturnValue({
      jobs: [
        { id: 'job-1', customer_id: 'c1', title: 'Frontend developer', description: null, status: 'active', created_at: '2026-01-01T00:00:00Z' },
      ],
    })
  })

  it('preselects the job from the ?job_id= query param', () => {
    renderPage('/candidates/new?job_id=job-1')

    expect(screen.getByLabelText('Jobb')).toHaveValue('job-1')
  })

  it('submits the form and navigates to the new candidate\'s profile', async () => {
    createCandidateMock.mockResolvedValue({ id: 'candidate-1' })
    renderPage('/candidates/new?job_id=job-1')

    fireEvent.change(screen.getByLabelText('Namn'), { target: { value: 'Anna Andersson' } })
    fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'anna@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lägg till kandidat' }))

    await vi.waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/candidates/candidate-1'))
    expect(createCandidateMock).toHaveBeenCalledWith({
      job_id: 'job-1',
      name: 'Anna Andersson',
      email: 'anna@example.com',
      phone: null,
      linkedin_url: null,
      cv_text: null,
      notes: null,
    })
  })

  it('shows an inline error and does not navigate on failure', async () => {
    createCandidateMock.mockRejectedValue(new Error('boom'))
    renderPage('/candidates/new?job_id=job-1')

    fireEvent.change(screen.getByLabelText('Namn'), { target: { value: 'Anna Andersson' } })
    fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'anna@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lägg till kandidat' }))

    await screen.findByRole('alert')
    expect(screen.getByRole('alert')).toHaveTextContent('Något gick fel. Försök igen.')
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
