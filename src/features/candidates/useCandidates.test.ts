import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../../api/client'
import type { CandidateRead } from '../../api/types'
import { useCandidates } from './useCandidates'

vi.mock('../../api/client', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('../../context/ActingAsProvider', () => ({
  useActingAs: () => ({
    customerId: null,
    customers: [],
    loading: false,
    setActingAsCustomer: vi.fn(),
  }),
}))

const showToast = vi.fn()
vi.mock('../../context/ToastProvider', () => ({
  useToast: () => ({ showToast }),
}))

const mockedApiFetch = vi.mocked(apiFetch)

function buildCandidate(overrides: Partial<CandidateRead> = {}): CandidateRead {
  return {
    id: 'candidate-1',
    job_id: 'job-1',
    name: 'Anna Andersson',
    email: null,
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

describe('useCandidates', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset()
    showToast.mockReset()
  })

  it('loads candidates from GET /candidates with no filters', async () => {
    const candidates = [buildCandidate()]
    mockedApiFetch.mockResolvedValue(candidates)

    const { result } = renderHook(() => useCandidates())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(mockedApiFetch).toHaveBeenCalledWith('/candidates')
    expect(result.current.candidates).toEqual(candidates)
    expect(result.current.loadError).toBe(false)
  })

  it('surfaces a load error and shows a toast on failure', async () => {
    mockedApiFetch.mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useCandidates())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.loadError).toBe(true)
    expect(showToast).toHaveBeenCalledWith('Något gick fel. Försök igen.')
  })
})
