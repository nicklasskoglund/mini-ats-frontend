// Fetches every job in the current context (GET /jobs, already scoped to
// the effective customer by the backend).
import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import { getGenericErrorMessage, isActingAsCustomerNotFound } from '../../api/errors'
import type { JobRead } from '../../api/types'
import { useActingAs } from '../../context/ActingAsProvider'
import { useToast } from '../../context/ToastProvider'

export function useJobs() {
  const { customerId } = useActingAs()
  const { showToast } = useToast()

  const [jobs, setJobs] = useState<JobRead[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)

    apiFetch<JobRead[]>('/jobs')
      .then((result) => {
        if (!cancelled) {
          setJobs(result)
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }
        if (!isActingAsCustomerNotFound(error)) {
          setLoadError(true)
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
  }, [customerId, reloadToken, showToast])

  return {
    jobs,
    loading,
    loadError,
    reload: () => setReloadToken((token) => token + 1),
  }
}
