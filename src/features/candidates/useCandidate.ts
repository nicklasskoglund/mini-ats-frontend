// Fetches a single candidate by id (GET /candidates/{candidate_id}) for
// the profile page.
import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import { getGenericErrorMessage, isActingAsCustomerNotFound } from '../../api/errors'
import type { CandidateRead } from '../../api/types'
import { useActingAs } from '../../context/ActingAsProvider'
import { useToast } from '../../context/ToastProvider'

export function useCandidate(candidateId: string) {
  const { customerId } = useActingAs()
  const { showToast } = useToast()

  const [candidate, setCandidate] = useState<CandidateRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)

    apiFetch<CandidateRead>(`/candidates/${candidateId}`)
      .then((result) => {
        if (!cancelled) {
          setCandidate(result)
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
  }, [candidateId, customerId, reloadToken, showToast])

  return {
    candidate,
    loading,
    loadError,
    reload: () => setReloadToken((token) => token + 1),
  }
}
