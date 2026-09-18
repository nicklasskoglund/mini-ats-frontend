import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../../api/client'
import { ApiError } from '../../api/errors'
import type { CandidateRead, JobRead, KanbanBoard } from '../../api/types'
import { useKanbanBoard } from './useKanbanBoard'

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

function buildBoard(overrides: Partial<KanbanBoard> = {}): KanbanBoard {
  return {
    new: [],
    screening: [],
    interview: [],
    offer: [],
    hired: [],
    rejected: [],
    ...overrides,
  }
}

const noJobs: JobRead[] = []

// apiFetch is generic (<T>(path, options?) => Promise<T>); a mock
// implementation can't express that per-call type, so this stub returns
// `any` and lets each test's usage narrow it.
function mockApiFetch(handler: (path: string, options?: RequestInit) => Promise<any>) {
  mockedApiFetch.mockImplementation(handler as typeof apiFetch)
}

describe('useKanbanBoard - moveCandidate', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset()
    showToast.mockReset()
  })

  it('optimistically moves the candidate and confirms with a toast on success', async () => {
    const candidate = buildCandidate({ stage: 'new' })
    const board = buildBoard({ new: [candidate] })

    mockApiFetch((path, options) => {
      if (path === '/jobs') {
        return Promise.resolve(noJobs)
      }
      if (path.startsWith('/candidates/kanban')) {
        return Promise.resolve(board)
      }
      if (options?.method === 'PATCH') {
        return Promise.resolve({ ...candidate, stage: 'screening' })
      }
      return Promise.reject(new Error(`unexpected call: ${path}`))
    })

    const { result } = renderHook(() => useKanbanBoard())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.board.new).toHaveLength(1)

    await act(async () => {
      await result.current.moveCandidate(candidate, 'screening')
    })

    expect(result.current.board.new).toHaveLength(0)
    expect(result.current.board.screening).toHaveLength(1)
    expect(showToast).toHaveBeenCalledWith(
      expect.stringContaining('Anna Andersson flyttades till Screening'),
    )
  })

  it('reverts the move and shows the generic error toast when the PATCH fails', async () => {
    const candidate = buildCandidate({ stage: 'new' })
    const board = buildBoard({ new: [candidate] })

    mockApiFetch((path, options) => {
      if (path === '/jobs') {
        return Promise.resolve(noJobs)
      }
      if (path.startsWith('/candidates/kanban')) {
        return Promise.resolve(board)
      }
      if (options?.method === 'PATCH') {
        return Promise.reject(new ApiError(500, 'boom'))
      }
      return Promise.reject(new Error(`unexpected call: ${path}`))
    })

    const { result } = renderHook(() => useKanbanBoard())

    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.moveCandidate(candidate, 'screening')
    })

    expect(result.current.board.new).toHaveLength(1)
    expect(result.current.board.screening).toHaveLength(0)
    expect(showToast).toHaveBeenCalledWith('Något gick fel. Försök igen.')
  })

  it('does nothing when moving a candidate to its current stage', async () => {
    const candidate = buildCandidate({ stage: 'new' })
    const board = buildBoard({ new: [candidate] })

    mockApiFetch((path) => {
      if (path === '/jobs') {
        return Promise.resolve(noJobs)
      }
      if (path.startsWith('/candidates/kanban')) {
        return Promise.resolve(board)
      }
      return Promise.reject(new Error(`unexpected call: ${path}`))
    })

    const { result } = renderHook(() => useKanbanBoard())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.moveCandidate(candidate, 'new')
    })

    expect(mockedApiFetch).not.toHaveBeenCalledWith(
      expect.stringContaining(`/candidates/${candidate.id}`),
      expect.anything(),
    )
  })
})
