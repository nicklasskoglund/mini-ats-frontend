import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../../api/client'
import { assessCandidate, createCandidate, deleteCandidate, updateCandidate } from './candidateMutations'

vi.mock('../../api/client', () => ({
  apiFetch: vi.fn(),
}))

const mockedApiFetch = vi.mocked(apiFetch)

describe('candidateMutations', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset()
  })

  it('createCandidate POSTs to /candidates with the given body', async () => {
    mockedApiFetch.mockResolvedValue({ id: 'candidate-1' })

    await createCandidate({ job_id: 'job-1', name: 'Anna Andersson', email: 'anna@example.com' })

    expect(mockedApiFetch).toHaveBeenCalledWith('/candidates', {
      method: 'POST',
      body: JSON.stringify({ job_id: 'job-1', name: 'Anna Andersson', email: 'anna@example.com' }),
    })
  })

  it('updateCandidate PATCHes /candidates/{id} with the given body', async () => {
    mockedApiFetch.mockResolvedValue({ id: 'candidate-1' })

    await updateCandidate('candidate-1', { name: 'New name' })

    expect(mockedApiFetch).toHaveBeenCalledWith('/candidates/candidate-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'New name' }),
    })
  })

  it('deleteCandidate DELETEs /candidates/{id}', async () => {
    mockedApiFetch.mockResolvedValue(undefined)

    await deleteCandidate('candidate-1')

    expect(mockedApiFetch).toHaveBeenCalledWith('/candidates/candidate-1', { method: 'DELETE' })
  })

  it('assessCandidate POSTs to /candidates/{id}/assess with the given signal', async () => {
    mockedApiFetch.mockResolvedValue({ id: 'candidate-1' })
    const controller = new AbortController()

    await assessCandidate('candidate-1', controller.signal)

    expect(mockedApiFetch).toHaveBeenCalledWith('/candidates/candidate-1/assess', {
      method: 'POST',
      signal: controller.signal,
    })
  })
})
