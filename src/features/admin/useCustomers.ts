// Fetches every customer account (GET /admin/customers). Admin-only,
// global - unlike most list endpoints this doesn't take (or need)
// X-Acting-As-Customer, so there's no customerId dependency here.
import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import { getGenericErrorMessage } from '../../api/errors'
import type { CustomerSummary } from '../../api/types'
import { useToast } from '../../context/ToastProvider'

export function useCustomers() {
  const { showToast } = useToast()

  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)

    apiFetch<CustomerSummary[]>('/admin/customers')
      .then((result) => {
        if (!cancelled) {
          setCustomers(result)
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }
        setLoadError(true)
        showToast(getGenericErrorMessage(error))
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [reloadToken, showToast])

  return {
    customers,
    loading,
    loadError,
    reload: () => setReloadToken((token) => token + 1),
  }
}
