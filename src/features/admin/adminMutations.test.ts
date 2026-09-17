import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../../api/client'
import {
  createAccount,
  deleteAccount,
  getCustomerDataCounts,
  updateCustomerProfile,
} from './adminMutations'

vi.mock('../../api/client', () => ({
  apiFetch: vi.fn(),
}))

const mockedApiFetch = vi.mocked(apiFetch)

describe('adminMutations', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset()
  })

  it('createAccount POSTs to /admin/accounts with the given body', async () => {
    mockedApiFetch.mockResolvedValue({ id: 'account-1' })

    await createAccount({ email: 'a@example.com', role: 'customer', company_name: 'Acme AB' })

    expect(mockedApiFetch).toHaveBeenCalledWith('/admin/accounts', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@example.com', role: 'customer', company_name: 'Acme AB' }),
    })
  })

  it('createAccount never sends a password key for role customer', async () => {
    mockedApiFetch.mockResolvedValue({ id: 'account-1' })

    await createAccount({ email: 'a@example.com', role: 'customer' })

    const [, options] = mockedApiFetch.mock.calls[0]
    const sentBody = JSON.parse((options as { body: string }).body)
    expect(sentBody).not.toHaveProperty('password')
  })

  it('deleteAccount DELETEs /admin/accounts/{id} with no acting-as override', async () => {
    mockedApiFetch.mockResolvedValue(undefined)

    await deleteAccount('account-1')

    expect(mockedApiFetch).toHaveBeenCalledWith('/admin/accounts/account-1', { method: 'DELETE' })
  })

  it('updateCustomerProfile PATCHes /profile with the customer id as an override', async () => {
    mockedApiFetch.mockResolvedValue({ id: 'account-1' })

    await updateCustomerProfile('account-1', { website_url: 'https://acme.example' })

    expect(mockedApiFetch).toHaveBeenCalledWith('/profile', {
      method: 'PATCH',
      body: JSON.stringify({ website_url: 'https://acme.example' }),
      actingAsCustomerId: 'account-1',
    })
  })

  it('getCustomerDataCounts fetches jobs and candidates scoped to the given customer', async () => {
    mockedApiFetch.mockImplementation((path: string) => {
      if (path === '/jobs') return Promise.resolve([{ id: 'job-1' }, { id: 'job-2' }])
      if (path === '/candidates') return Promise.resolve([{ id: 'candidate-1' }])
      return Promise.reject(new Error(`unexpected call: ${path}`))
    })

    const result = await getCustomerDataCounts('account-1')

    expect(result).toEqual({ jobCount: 2, candidateCount: 1 })
    expect(mockedApiFetch).toHaveBeenCalledWith('/jobs', { actingAsCustomerId: 'account-1' })
    expect(mockedApiFetch).toHaveBeenCalledWith('/candidates', { actingAsCustomerId: 'account-1' })
  })
})
