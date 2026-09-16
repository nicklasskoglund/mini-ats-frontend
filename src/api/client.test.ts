import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from './client'
import { ApiError } from './errors'
import { ACTING_AS_CUSTOMER_CLEARED, actingAsEvents, getStoredCustomerId } from './actingAsStore'

vi.mock('../auth/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}))

const { supabase } = await import('../auth/supabaseClient')
const mockedGetSession = vi.mocked(supabase.auth.getSession)

function mockSession(accessToken: string | null) {
  mockedGetSession.mockResolvedValue({
    data: { session: accessToken ? ({ access_token: accessToken } as never) : null },
    error: null,
  } as never)
}

function mockFetchResponse(response: Partial<Response> & { jsonBody?: unknown }) {
  const { jsonBody, ...rest } = response
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(jsonBody),
    ...rest,
  } as Response)
}

describe('apiFetch', () => {
  beforeEach(() => {
    localStorage.clear()
    mockSession('test-token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('attaches the Authorization header from the current session', async () => {
    globalThis.fetch = mockFetchResponse({ jsonBody: { ok: true } })

    await apiFetch('/jobs')

    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0]
    const headers = init?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer test-token')
  })

  it('omits X-Acting-As-Customer when no customer is selected', async () => {
    globalThis.fetch = mockFetchResponse({ jsonBody: { ok: true } })

    await apiFetch('/jobs')

    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0]
    const headers = init?.headers as Headers
    expect(headers.has('X-Acting-As-Customer')).toBe(false)
  })

  it('attaches X-Acting-As-Customer when a customer is stored', async () => {
    localStorage.setItem('mini-ats:acting-as-customer', 'customer-123')
    globalThis.fetch = mockFetchResponse({ jsonBody: { ok: true } })

    await apiFetch('/jobs')

    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0]
    const headers = init?.headers as Headers
    expect(headers.get('X-Acting-As-Customer')).toBe('customer-123')
  })

  it('throws an ApiError with a string detail for a plain HTTPException', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: 'No effective customer' }),
    } as Response)

    await expect(apiFetch('/jobs')).rejects.toMatchObject({
      status: 400,
      detail: 'No effective customer',
    })
  })

  it('throws an ApiError with a list detail for a Pydantic validation error', async () => {
    const validationDetail = [{ loc: ['body', 'title'], msg: 'Field required', type: 'missing' }]
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ detail: validationDetail }),
    } as Response)

    await expect(apiFetch('/jobs')).rejects.toMatchObject({
      status: 422,
      detail: validationDetail,
    })
  })

  it('throws a status-0 ApiError on a network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(apiFetch('/jobs')).rejects.toBeInstanceOf(ApiError)
    await expect(apiFetch('/jobs')).rejects.toMatchObject({ status: 0 })
  })

  it('clears the stored customer and fires ACTING_AS_CUSTOMER_CLEARED on the acting-as-customer 404', async () => {
    localStorage.setItem('mini-ats:acting-as-customer', 'stale-customer')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ detail: 'No customer found for X-Acting-As-Customer' }),
    } as Response)

    const listener = vi.fn()
    actingAsEvents.addEventListener(ACTING_AS_CUSTOMER_CLEARED, listener)

    await expect(apiFetch('/jobs')).rejects.toMatchObject({ status: 404 })

    expect(getStoredCustomerId()).toBeNull()
    expect(listener).toHaveBeenCalledOnce()

    actingAsEvents.removeEventListener(ACTING_AS_CUSTOMER_CLEARED, listener)
  })

  it('does not clear the stored customer for an unrelated 404', async () => {
    localStorage.setItem('mini-ats:acting-as-customer', 'customer-123')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ detail: 'Candidate not found' }),
    } as Response)

    await expect(apiFetch('/candidates/missing')).rejects.toMatchObject({ status: 404 })

    expect(getStoredCustomerId()).toBe('customer-123')
  })
})
