// Central fetch wrapper: every call to the backend goes through here so
// that Authorization and X-Acting-As-Customer are attached in exactly one
// place (see CLAUDE.md "Admin agerar som kund" - never per call site).
import { supabase } from '../auth/supabaseClient'
import { getStoredCustomerId, clearStoredCustomerIdAsInvalid } from './actingAsStore'
import { ACTING_AS_CUSTOMER_NOT_FOUND_DETAIL, ApiError, type ErrorDetail } from './errors'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }
  const actingAsCustomerId = getStoredCustomerId()
  if (actingAsCustomerId) {
    headers.set('X-Acting-As-Customer', actingAsCustomerId)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch {
    // fetch() rejects on network failure (backend down, CORS, offline) -
    // status 0 distinguishes this from a real HTTP error response.
    throw new ApiError(0, null)
  }

  if (!response.ok) {
    const detail = await readDetail(response)

    // Clearing here (not just in the error-handling helper the UI calls
    // later) means the stale header is gone before any other in-flight or
    // subsequent request can repeat the same 404.
    if (response.status === 404 && detail === ACTING_AS_CUSTOMER_NOT_FOUND_DETAIL) {
      clearStoredCustomerIdAsInvalid()
    }

    throw new ApiError(response.status, detail)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

async function readDetail(response: Response): Promise<ErrorDetail> {
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object' && 'detail' in body) {
      return (body as { detail: ErrorDetail }).detail
    }
    return null
  } catch {
    return null
  }
}
