import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { CandidateRead } from '../api/types'
import { CandidatesPage } from './CandidatesPage'

const useCandidatesMock = vi.fn()
vi.mock('../features/candidates/useCandidates', () => ({
  useCandidates: () => useCandidatesMock(),
}))

const useJobsMock = vi.fn()
vi.mock('../features/jobs/useJobs', () => ({
  useJobs: () => useJobsMock(),
}))

vi.mock('../features/candidates/candidateMutations', () => ({
  updateCandidate: vi.fn().mockResolvedValue(undefined),
  deleteCandidate: vi.fn().mockResolvedValue(undefined),
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
      <CandidatesPage />
    </MemoryRouter>,
  )
}

describe('CandidatesPage', () => {
  it('links "+ Lägg till kandidat" to /candidates/new', () => {
    useCandidatesMock.mockReturnValue({
      candidates: [],
      loading: false,
      loadError: false,
      reload: vi.fn(),
    })
    useJobsMock.mockReturnValue({ jobs: [] })

    renderPage()

    expect(screen.getByRole('link', { name: '+ Lägg till kandidat' })).toHaveAttribute(
      'href',
      '/candidates/new',
    )
  })

  it('opens the edit modal from the table', () => {
    useCandidatesMock.mockReturnValue({
      candidates: [buildCandidate()],
      loading: false,
      loadError: false,
      reload: vi.fn(),
    })
    useJobsMock.mockReturnValue({ jobs: [] })

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Redigera' }))

    expect(screen.getByText('Redigera kandidat')).toBeInTheDocument()
  })

  it('opens the delete dialog from the table', () => {
    useCandidatesMock.mockReturnValue({
      candidates: [buildCandidate()],
      loading: false,
      loadError: false,
      reload: vi.fn(),
    })
    useJobsMock.mockReturnValue({ jobs: [] })

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Radera' }))

    expect(screen.getByText('Radera kandidat?')).toBeInTheDocument()
  })

  it('shows a retry option when the list failed to load', () => {
    const reload = vi.fn()
    useCandidatesMock.mockReturnValue({
      candidates: [],
      loading: false,
      loadError: true,
      reload,
    })
    useJobsMock.mockReturnValue({ jobs: [] })

    renderPage()

    expect(screen.getByText('Något gick fel. Försök igen.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Försök igen' }))
    expect(reload).toHaveBeenCalledOnce()
  })
})
