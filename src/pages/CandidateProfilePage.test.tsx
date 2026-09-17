import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CandidateRead } from '../api/types'
import { CandidateProfilePage } from './CandidateProfilePage'

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: 'candidate-1' }),
  }
})

const useCandidateMock = vi.fn()
vi.mock('../features/candidates/useCandidate', () => ({
  useCandidate: (...args: unknown[]) => useCandidateMock(...args),
}))

const useJobsMock = vi.fn()
vi.mock('../features/jobs/useJobs', () => ({
  useJobs: () => useJobsMock(),
}))

const updateCandidateMock = vi.fn()
const deleteCandidateMock = vi.fn()
vi.mock('../features/candidates/candidateMutations', () => ({
  updateCandidate: (...args: unknown[]) => updateCandidateMock(...args),
  deleteCandidate: (...args: unknown[]) => deleteCandidateMock(...args),
}))

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

function renderPage() {
  return render(
    <MemoryRouter>
      <CandidateProfilePage />
    </MemoryRouter>,
  )
}

describe('CandidateProfilePage', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    updateCandidateMock.mockReset().mockResolvedValue(undefined)
    deleteCandidateMock.mockReset().mockResolvedValue(undefined)
    useJobsMock.mockReturnValue({ jobs: [] })
  })

  it('shows nothing while loading', () => {
    useCandidateMock.mockReturnValue({ candidate: null, loading: true, loadError: false, reload: vi.fn() })

    const { container } = renderPage()

    expect(container).toBeEmptyDOMElement()
  })

  it('shows a retry option on a load error', () => {
    const reload = vi.fn()
    useCandidateMock.mockReturnValue({ candidate: null, loading: false, loadError: true, reload })

    renderPage()

    expect(screen.getByText('Något gick fel. Försök igen.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Försök igen' }))
    expect(reload).toHaveBeenCalledOnce()
  })

  it('renders the header and defaults to the Översikt tab', () => {
    useCandidateMock.mockReturnValue({
      candidate: buildCandidate(),
      loading: false,
      loadError: false,
      reload: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('Anna Andersson')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Översikt' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('AI-bedömning kommer i nästa steg.')).toBeInTheDocument()
  })

  it('switches tabs', () => {
    useCandidateMock.mockReturnValue({
      candidate: buildCandidate({ notes: 'Bra kandidat' }),
      loading: false,
      loadError: false,
      reload: vi.fn(),
    })

    renderPage()

    fireEvent.click(screen.getByRole('tab', { name: 'Anteckningar' }))

    expect(screen.getByLabelText('Anteckningar')).toHaveValue('Bra kandidat')
  })

  it('moves the candidate to a new stage from the header', async () => {
    const reload = vi.fn()
    useCandidateMock.mockReturnValue({
      candidate: buildCandidate({ stage: 'new' }),
      loading: false,
      loadError: false,
      reload,
    })

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Flytta till' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Screening' }))

    await vi.waitFor(() =>
      expect(updateCandidateMock).toHaveBeenCalledWith('candidate-1', { stage: 'screening' }),
    )
    expect(reload).toHaveBeenCalled()
  })

  it('deletes the candidate and navigates back to the list', async () => {
    useCandidateMock.mockReturnValue({
      candidate: buildCandidate(),
      loading: false,
      loadError: false,
      reload: vi.fn(),
    })

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Radera' }))
    fireEvent.click(screen.getByRole('button', { name: 'Radera' }))

    await vi.waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/candidates'))
  })
})
