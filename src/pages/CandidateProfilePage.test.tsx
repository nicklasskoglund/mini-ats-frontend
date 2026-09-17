import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CandidateRead } from '../api/types'
import { CandidateProfilePage } from './CandidateProfilePage'

const navigateMock = vi.fn()
const useParamsMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => useParamsMock(),
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
const assessCandidateMock = vi.fn()
vi.mock('../features/candidates/candidateMutations', () => ({
  updateCandidate: (...args: unknown[]) => updateCandidateMock(...args),
  deleteCandidate: (...args: unknown[]) => deleteCandidateMock(...args),
  assessCandidate: (...args: unknown[]) => assessCandidateMock(...args),
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
    useParamsMock.mockReset().mockReturnValue({ id: 'candidate-1' })
    updateCandidateMock.mockReset().mockResolvedValue(undefined)
    deleteCandidateMock.mockReset().mockResolvedValue(undefined)
    assessCandidateMock.mockReset()
    useJobsMock.mockReturnValue({ jobs: [] })
  })

  it('shows nothing while loading', () => {
    useCandidateMock.mockReturnValue({
      candidate: null,
      setCandidate: vi.fn(),
      loading: true,
      loadError: false,
      reload: vi.fn(),
    })

    const { container } = renderPage()

    expect(container).toBeEmptyDOMElement()
  })

  it('shows a retry option on a load error', () => {
    const reload = vi.fn()
    useCandidateMock.mockReturnValue({
      candidate: null,
      setCandidate: vi.fn(),
      loading: false,
      loadError: true,
      reload,
    })

    renderPage()

    expect(screen.getByText('Något gick fel. Försök igen.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Försök igen' }))
    expect(reload).toHaveBeenCalledOnce()
  })

  it('renders the header and defaults to the Översikt tab, with the real assessment panel', () => {
    useCandidateMock.mockReturnValue({
      candidate: buildCandidate(),
      setCandidate: vi.fn(),
      loading: false,
      loadError: false,
      reload: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('Anna Andersson')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Översikt' })).toHaveAttribute('aria-selected', 'true')
    // cv_text is null on the default fixture, so the panel's "missing CV" state.
    expect(screen.getByText('Lägg till CV-text först')).toBeInTheDocument()
  })

  it('switches tabs', () => {
    useCandidateMock.mockReturnValue({
      candidate: buildCandidate({ notes: 'Bra kandidat' }),
      setCandidate: vi.fn(),
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
      setCandidate: vi.fn(),
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
      setCandidate: vi.fn(),
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

  it('runs the assessment and applies the returned candidate directly, without a reload', async () => {
    const reload = vi.fn()
    const setCandidate = vi.fn()
    const assessed = buildCandidate({ cv_text: 'Erfaren utvecklare.', ai_score: 8 })
    assessCandidateMock.mockResolvedValue(assessed)
    useCandidateMock.mockReturnValue({
      candidate: buildCandidate({ cv_text: 'Erfaren utvecklare.' }),
      setCandidate,
      loading: false,
      loadError: false,
      reload,
    })

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Kör AI-bedömning' }))

    await vi.waitFor(() =>
      expect(assessCandidateMock).toHaveBeenCalledWith('candidate-1', expect.any(AbortSignal)),
    )
    expect(setCandidate).toHaveBeenCalledWith(assessed)
    expect(reload).not.toHaveBeenCalled()
  })

  it('does not let a stale assessment for a previous candidate overwrite the one now on screen', async () => {
    // Mirrors a real fetch: rejects with AbortError once its signal aborts,
    // instead of resolving with candidate A's data after the switch.
    assessCandidateMock.mockImplementation(
      (_id: string, signal: AbortSignal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        }),
    )

    const setCandidateA = vi.fn()
    useParamsMock.mockReturnValue({ id: 'candidate-a' })
    useCandidateMock.mockReturnValue({
      candidate: buildCandidate({ id: 'candidate-a', cv_text: 'CV A', ai_score: null }),
      setCandidate: setCandidateA,
      loading: false,
      loadError: false,
      reload: vi.fn(),
    })

    const { rerender } = renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Kör AI-bedömning' }))
    expect(screen.getByText('Analyserar kandidat')).toBeInTheDocument()

    // Simulate navigating from A to B on the same route: the id param and
    // useCandidate's data change, but CandidateProfilePage itself doesn't
    // remount (React Router behavior for the same route component).
    const setCandidateB = vi.fn()
    useParamsMock.mockReturnValue({ id: 'candidate-b' })
    useCandidateMock.mockReturnValue({
      candidate: buildCandidate({ id: 'candidate-b', cv_text: 'CV B', ai_score: null }),
      setCandidate: setCandidateB,
      loading: false,
      loadError: false,
      reload: vi.fn(),
    })
    rerender(
      <MemoryRouter>
        <CandidateProfilePage />
      </MemoryRouter>,
    )

    // A's aborted request settling late must not call either candidate's
    // setCandidate - B's own state must stay exactly what useCandidate gave it.
    await vi.waitFor(() => {
      expect(screen.queryByText('Något gick fel')).not.toBeInTheDocument()
    })
    expect(setCandidateA).not.toHaveBeenCalled()
    expect(setCandidateB).not.toHaveBeenCalled()
  })
})
