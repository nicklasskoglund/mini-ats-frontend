// Shared source of truth for the currently acted-as customer id, read by
// the API client (to set X-Acting-As-Customer) and by ActingAsProvider
// (to render the picker). Living outside React lets the API client attach
// the header without every call site passing it explicitly, and lets the
// client itself clear a stale selection (see handleActingAsCustomerNotFound
// in errors.ts) without depending on React context.
const STORAGE_KEY = 'mini-ats:acting-as-customer'

export const actingAsEvents = new EventTarget()
export const ACTING_AS_CUSTOMER_CLEARED = 'acting-as-customer-cleared'

export function getStoredCustomerId(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setStoredCustomerId(customerId: string | null): void {
  if (customerId) {
    localStorage.setItem(STORAGE_KEY, customerId)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

/**
 * Called by the API client when the stored customer id no longer exists.
 * Idempotent: two requests can race with the same stale id (e.g. the jobs
 * list and the kanban board both carrying X-Acting-As-Customer), and only
 * the first to arrive should clear the selection and notify - otherwise
 * the second fires a duplicate "customer no longer exists" toast.
 */
export function clearStoredCustomerIdAsInvalid(): void {
  if (getStoredCustomerId() === null) {
    return
  }
  setStoredCustomerId(null)
  actingAsEvents.dispatchEvent(new Event(ACTING_AS_CUSTOMER_CLEARED))
}
