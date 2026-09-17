import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../../api/client'
import type { ProfileRead } from '../../api/types'
import { useProfile } from './useProfile'

vi.mock('../../api/client', () => ({
  apiFetch: vi.fn(),
}))

const showToast = vi.fn()
vi.mock('../../context/ToastProvider', () => ({
  useToast: () => ({ showToast }),
}))

const authMock = vi.fn()
vi.mock('../../auth/AuthProvider', () => ({
  useAuth: () => authMock(),
}))

const actingAsMock = vi.fn()
vi.mock('../../context/ActingAsProvider', () => ({
  useActingAs: () => actingAsMock(),
}))

const mockedApiFetch = vi.mocked(apiFetch)

function buildProfile(overrides: Partial<ProfileRead> = {}): ProfileRead {
  return {
    id: 'customer-1',
    role: 'customer',
    full_name: 'Anna Andersson',
    company_name: 'Acme AB',
    website_url: null,
    linkedin_url: null,
    phone: null,
    contact_email: null,
    address: null,
    description: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('useProfile', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset()
    showToast.mockReset()
    authMock.mockReset()
    actingAsMock.mockReset()
  })

  it('fetches the profile when the viewer is a customer', async () => {
    authMock.mockReturnValue({ role: 'customer' })
    actingAsMock.mockReturnValue({ customerId: null })
    mockedApiFetch.mockResolvedValue(buildProfile())

    const { result } = renderHook(() => useProfile())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockedApiFetch).toHaveBeenCalledWith('/profile')
    expect(result.current.enabled).toBe(true)
    expect(result.current.profile?.company_name).toBe('Acme AB')
  })

  it('never calls the API when an admin has no acting-as customer selected', () => {
    authMock.mockReturnValue({ role: 'admin' })
    actingAsMock.mockReturnValue({ customerId: null })

    const { result } = renderHook(() => useProfile())

    expect(mockedApiFetch).not.toHaveBeenCalled()
    expect(result.current.enabled).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  it('fetches the acted-as customer profile once an admin selects one', async () => {
    authMock.mockReturnValue({ role: 'admin' })
    actingAsMock.mockReturnValue({ customerId: 'customer-1' })
    mockedApiFetch.mockResolvedValue(buildProfile())

    const { result } = renderHook(() => useProfile())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockedApiFetch).toHaveBeenCalledWith('/profile')
    expect(result.current.enabled).toBe(true)
  })

  it('surfaces a load error and shows a toast on failure', async () => {
    authMock.mockReturnValue({ role: 'customer' })
    actingAsMock.mockReturnValue({ customerId: null })
    mockedApiFetch.mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useProfile())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.loadError).toBe(true)
    expect(showToast).toHaveBeenCalledWith('Något gick fel. Försök igen.')
  })

  it('updates the profile in place from the PATCH response', async () => {
    authMock.mockReturnValue({ role: 'customer' })
    actingAsMock.mockReturnValue({ customerId: null })
    mockedApiFetch.mockResolvedValueOnce(buildProfile())

    const { result } = renderHook(() => useProfile())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const updated = buildProfile({ company_name: 'Nytt namn AB' })
    mockedApiFetch.mockResolvedValueOnce(updated)

    await result.current.updateProfile({ company_name: 'Nytt namn AB' })

    expect(mockedApiFetch).toHaveBeenLastCalledWith('/profile', {
      method: 'PATCH',
      body: JSON.stringify({ company_name: 'Nytt namn AB' }),
    })
    await waitFor(() => expect(result.current.profile?.company_name).toBe('Nytt namn AB'))
  })
})
