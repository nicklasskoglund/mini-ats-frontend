// Central error shape and parsing rules for API responses, confirmed
// against the backend source (see CLAUDE.md "Admin agerar som kund"):
// `detail` is a string for every hand-written HTTPException AND for some
// 422s (Postgres constraint violations), or a list of ValidationError
// objects only for Pydantic's own 422s. Never assume the list form.
import type { ValidationError } from './types'

export type ErrorDetail = string | ValidationError[] | null

export class ApiError extends Error {
  readonly status: number
  readonly detail: ErrorDetail

  constructor(status: number, detail: ErrorDetail) {
    super(typeof detail === 'string' ? detail : 'API request failed')
    this.status = status
    this.detail = detail
  }
}

export function isValidationDetail(detail: ErrorDetail): detail is ValidationError[] {
  return Array.isArray(detail)
}

export const ACTING_AS_CUSTOMER_NOT_FOUND_DETAIL = 'No customer found for X-Acting-As-Customer'

/**
 * True for the 404 that means the acted-as customer no longer exists.
 * client.ts already clears the stale selection and fires
 * ACTING_AS_CUSTOMER_CLEARED as soon as this response comes back (a single,
 * central place - see actingAsStore.ts), regardless of which call site
 * triggered it. Callers only need this predicate to avoid ALSO showing
 * their own generic error message on top of the dedicated toast that the
 * ACTING_AS_CUSTOMER_CLEARED listener already displays.
 */
export function isActingAsCustomerNotFound(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 404 &&
    error.detail === ACTING_AS_CUSTOMER_NOT_FOUND_DETAIL
  )
}

/** Fallback copy for errors a call site doesn't handle more specifically. */
export function getGenericErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return 'Du har inte behörighet till den här resursen.'
  }
  return 'Något gick fel. Försök igen.'
}
