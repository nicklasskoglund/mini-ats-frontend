// Fetches every candidate in the current context (GET /candidates, no
// filters - already scoped to the effective customer by the backend).
// Used by Step 4 to count candidates per job, and reused as-is by Step 5's
// candidate list (see CLAUDE.md "Inför Steg 4").
import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import { getGenericErrorMessage, isActingAsCustomerNotFound } from '../../api/errors'
import type { CandidateRead } from '../../api/types'
import { useActingAs } from '../../context/ActingAsProvider'
import { useToast } from '../../context/ToastProvider'

export function useCandidates() {
  const { customerId } = useActingAs()
  const { showToast } = useToast()

  const [candidates, setCandidates] = useState<CandidateRead[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)

    apiFetch<CandidateRead[]>('/candidates')
      .then((result) => {
        if (!cancelled) {
          setCandidates(result)
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
    candidates,
    loading,
    loadError,
    reload: () => setReloadToken((token) => token + 1),
  }
}
