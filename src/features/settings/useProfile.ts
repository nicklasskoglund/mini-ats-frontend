// Fetches and updates the effective profile (GET/PATCH /profile). Never
// calls the API when an admin has no acting-as customer selected
// (DESIGN.md section 6: "Inställningar visar: Välj en kund för att se
// profilen. Inget API-anrop görs.") - the backend 400s for that case
// anyway, but the page must not even try.
import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import { getGenericErrorMessage, isActingAsCustomerNotFound } from '../../api/errors'
import type { ProfileRead, ProfileUpdate } from '../../api/types'
import { useAuth } from '../../auth/AuthProvider'
import { useActingAs } from '../../context/ActingAsProvider'
import { useToast } from '../../context/ToastProvider'

export function useProfile() {
  const { role } = useAuth()
  const { customerId } = useActingAs()
  const { showToast } = useToast()
  const enabled = role === 'customer' || customerId !== null

  const [profile, setProfile] = useState<ProfileRead | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [loadError, setLoadError] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setProfile(null)
      setLoading(false)
      setLoadError(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setLoadError(false)

    apiFetch<ProfileRead>('/profile')
      .then((result) => {
        if (!cancelled) {
          setProfile(result)
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
  }, [enabled, customerId, reloadToken, showToast])

  async function updateProfile(input: ProfileUpdate): Promise<void> {
    const updated = await apiFetch<ProfileRead>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
    setProfile(updated)
  }

  return {
    profile,
    loading,
    loadError,
    enabled,
    reload: () => setReloadToken((token) => token + 1),
    updateProfile,
  }
}
