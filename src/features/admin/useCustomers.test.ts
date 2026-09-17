import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../../api/client'
import type { CustomerSummary } from '../../api/types'
import { useCustomers } from './useCustomers'

vi.mock('../../api/client', () => ({
  apiFetch: vi.fn(),
}))

const showToast = vi.fn()
vi.mock('../../context/ToastProvider', () => ({
  useToast: () => ({ showToast }),
}))

const mockedApiFetch = vi.mocked(apiFetch)

function buildCustomer(overrides: Partial<CustomerSummary> = {}): CustomerSummary {
  return {
    id: 'customer-1',
    full_name: 'Anna Andersson',
    company_name: 'Acme AB',
    email: 'anna@acme.example',
    ...overrides,
  }
}

describe('useCustomers', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset()
    showToast.mockReset()
  })

  it('fetches customers from GET /admin/customers', async () => {
    const customers = [buildCustomer()]
    mockedApiFetch.mockResolvedValue(customers)

    const { result } = renderHook(() => useCustomers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(mockedApiFetch).toHaveBeenCalledWith('/admin/customers')
    expect(result.current.customers).toEqual(customers)
  })

  it('surfaces a load error and shows a toast on failure', async () => {
    mockedApiFetch.mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useCustomers())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.loadError).toBe(true)
    expect(showToast).toHaveBeenCalledWith('Något gick fel. Försök igen.')
  })
})
