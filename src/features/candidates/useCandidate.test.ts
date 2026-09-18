import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../../api/client'
import type { CandidateRead } from '../../api/types'
import { useCandidate } from './useCandidate'

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

describe('useCandidate', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset()
    showToast.mockReset()
  })

  it('fetches the candidate by id', async () => {
    const candidate = buildCandidate()
    mockedApiFetch.mockResolvedValue(candidate)

    const { result } = renderHook(() => useCandidate('candidate-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(mockedApiFetch).toHaveBeenCalledWith('/candidates/candidate-1')
    expect(result.current.candidate).toEqual(candidate)
  })

  it('surfaces a load error and shows a toast on failure', async () => {
    mockedApiFetch.mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useCandidate('candidate-1'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.loadError).toBe(true)
    expect(showToast).toHaveBeenCalledWith('Något gick fel. Försök igen.')
  })

  it('exposes setCandidate to apply an already-fetched update without refetching', async () => {
    mockedApiFetch.mockResolvedValue(buildCandidate())

    const { result } = renderHook(() => useCandidate('candidate-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    const assessed = buildCandidate({ ai_score: 8 })
    act(() => {
      result.current.setCandidate(assessed)
    })

    expect(result.current.candidate).toEqual(assessed)
    expect(mockedApiFetch).toHaveBeenCalledOnce()
  })
})
