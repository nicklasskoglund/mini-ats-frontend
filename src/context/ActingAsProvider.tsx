// Holds which customer an admin is currently acting as (DESIGN.md section
// 6). The selection lives in localStorage via actingAsStore so the API
// client can attach X-Acting-As-Customer without needing this context, and
// so the choice survives a reload. Non-admins never touch this - the
// picker isn't shown to them.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { apiFetch } from '../api/client'
import { ACTING_AS_CUSTOMER_CLEARED, actingAsEvents, getStoredCustomerId, setStoredCustomerId } from '../api/actingAsStore'
import { getGenericErrorMessage } from '../api/errors'
import type { CustomerSummary } from '../api/types'
import { useAuth } from '../auth/AuthProvider'
import { useToast } from './ToastProvider'

interface ActingAsContextValue {
  customerId: string | null
  customers: CustomerSummary[]
  loading: boolean
  setActingAsCustomer: (customerId: string | null) => void
}

const ActingAsContext = createContext<ActingAsContextValue | undefined>(undefined)

export function ActingAsProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  const { showToast } = useToast()
  const [customerId, setCustomerId] = useState<string | null>(() => getStoredCustomerId())
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [loading, setLoading] = useState(() => role === 'admin')

  useEffect(() => {
    function handleCleared() {
      setCustomerId(null)
    }
    actingAsEvents.addEventListener(ACTING_AS_CUSTOMER_CLEARED, handleCleared)
    return () => actingAsEvents.removeEventListener(ACTING_AS_CUSTOMER_CLEARED, handleCleared)
  }, [])

  useEffect(() => {
    if (role !== 'admin') {
      return
    }
    let cancelled = false
    apiFetch<CustomerSummary[]>('/admin/customers')
      .then((result) => {
        if (!cancelled) {
          setCustomers(result)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(getGenericErrorMessage(error))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [role, showToast])

  const setActingAsCustomer = useCallback((newCustomerId: string | null) => {
    setStoredCustomerId(newCustomerId)
    setCustomerId(newCustomerId)
  }, [])

  return (
    <ActingAsContext.Provider value={{ customerId, customers, loading, setActingAsCustomer }}>
      {children}
    </ActingAsContext.Provider>
  )
}

export function useActingAs(): ActingAsContextValue {
  const context = useContext(ActingAsContext)
  if (!context) {
    throw new Error('useActingAs must be used within an ActingAsProvider')
  }
  return context
}
