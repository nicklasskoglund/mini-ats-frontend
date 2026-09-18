import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../../api/client'
import { ApiError } from '../../api/errors'
import type { CandidateRead, JobRead } from '../../api/types'
import { useJobsList } from './useJobsList'

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

function buildJob(overrides: Partial<JobRead> = {}): JobRead {
  return {
    id: 'job-1',
    customer_id: 'customer-1',
    title: 'Frontend developer',
    description: 'Build things',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

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

// apiFetch is generic; a mock implementation can't express that per-call
// type, so this stub returns `any` and each test's fixtures narrow it.
function mockApiFetch(handler: (path: string, options?: RequestInit) => Promise<any>) {
  mockedApiFetch.mockImplementation(handler as typeof apiFetch)
}

describe('useJobsList', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset()
    showToast.mockReset()
  })

  it('combines jobs with their candidate counts', async () => {
    const jobs = [buildJob({ id: 'job-1' }), buildJob({ id: 'job-2', title: 'Backend developer' })]
    const candidates = [
      buildCandidate({ id: 'c1', job_id: 'job-1' }),
      buildCandidate({ id: 'c2', job_id: 'job-1' }),
    ]

    mockApiFetch((path) => {
      if (path === '/jobs') return Promise.resolve(jobs)
      if (path === '/candidates') return Promise.resolve(candidates)
      return Promise.reject(new Error(`unexpected call: ${path}`))
    })

    const { result } = renderHook(() => useJobsList())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const job1 = result.current.jobs.find((job) => job.id === 'job-1')
    const job2 = result.current.jobs.find((job) => job.id === 'job-2')
    expect(job1?.candidateCount).toBe(2)
    expect(job2?.candidateCount).toBe(0)
  })

  it('creates a job with status "active" explicit and reloads the list', async () => {
    const initialJobs = [buildJob({ id: 'job-1' })]
    const afterCreate = [...initialJobs, buildJob({ id: 'job-2', title: 'New role' })]
    let jobsCallCount = 0

    mockApiFetch((path, options) => {
      if (path === '/jobs' && options?.method === 'POST') {
        expect(JSON.parse(options.body as string)).toEqual({
          title: 'New role',
          description: 'A new role',
          status: 'active',
        })
        return Promise.resolve(buildJob({ id: 'job-2', title: 'New role' }))
      }
      if (path === '/jobs') {
        jobsCallCount += 1
        return Promise.resolve(jobsCallCount === 1 ? initialJobs : afterCreate)
      }
      if (path === '/candidates') return Promise.resolve([])
      return Promise.reject(new Error(`unexpected call: ${path}`))
    })

    const { result } = renderHook(() => useJobsList())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createJob({ title: 'New role', description: 'A new role' })
    })

    await waitFor(() => expect(result.current.jobs).toHaveLength(2))
  })

  it('updates a job with the given title, description and status', async () => {
    mockApiFetch((path, options) => {
      if (path === '/jobs/job-1' && options?.method === 'PATCH') {
        expect(JSON.parse(options.body as string)).toEqual({
          title: 'Updated title',
          description: 'Updated description',
          status: 'paused',
        })
        return Promise.resolve(buildJob({ status: 'paused' }))
      }
      if (path === '/jobs') return Promise.resolve([buildJob()])
      if (path === '/candidates') return Promise.resolve([])
      return Promise.reject(new Error(`unexpected call: ${path}`))
    })

    const { result } = renderHook(() => useJobsList())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.updateJob('job-1', {
        title: 'Updated title',
        description: 'Updated description',
        status: 'paused',
      })
    })
  })

  it('propagates a 409 from deleteJob without swallowing it', async () => {
    mockApiFetch((path, options) => {
      if (path === '/jobs/job-1' && options?.method === 'DELETE') {
        return Promise.reject(new ApiError(409, 'boom'))
      }
      if (path === '/jobs') return Promise.resolve([buildJob()])
      if (path === '/candidates') return Promise.resolve([])
      return Promise.reject(new Error(`unexpected call: ${path}`))
    })

    const { result } = renderHook(() => useJobsList())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(result.current.deleteJob('job-1')).rejects.toMatchObject({ status: 409 })
  })
})
