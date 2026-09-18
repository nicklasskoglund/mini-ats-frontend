import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ACTING_AS_CUSTOMER_CLEARED,
  actingAsEvents,
  clearStoredCustomerIdAsInvalid,
  getStoredCustomerId,
  setStoredCustomerId,
} from './actingAsStore'

describe('clearStoredCustomerIdAsInvalid', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('clears the stored id and fires the event when one was set', () => {
    setStoredCustomerId('customer-123')
    const listener = vi.fn()
    actingAsEvents.addEventListener(ACTING_AS_CUSTOMER_CLEARED, listener)

    clearStoredCustomerIdAsInvalid()

    expect(getStoredCustomerId()).toBeNull()
    expect(listener).toHaveBeenCalledOnce()
    actingAsEvents.removeEventListener(ACTING_AS_CUSTOMER_CLEARED, listener)
  })

  it('does not fire a second event for a concurrent call once already cleared', () => {
    // Simulates two in-flight requests (e.g. jobs + kanban) both hitting the
    // acting-as-customer-not-found 404 for the same stale id.
    setStoredCustomerId('customer-123')
    const listener = vi.fn()
    actingAsEvents.addEventListener(ACTING_AS_CUSTOMER_CLEARED, listener)

    clearStoredCustomerIdAsInvalid()
    clearStoredCustomerIdAsInvalid()

    expect(listener).toHaveBeenCalledOnce()
    actingAsEvents.removeEventListener(ACTING_AS_CUSTOMER_CLEARED, listener)
  })
})
