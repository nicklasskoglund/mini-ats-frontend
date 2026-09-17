import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../../api/client'
import { createCandidate, deleteCandidate, updateCandidate } from './candidateMutations'

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
})
