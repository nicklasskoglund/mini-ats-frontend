// "Radera kundkonto" (DESIGN.md section 12): a single confirmation that
// names exactly what's being destroyed. Job/candidate counts aren't on
// CustomerSummary at all, so they're fetched on demand here, scoped to
// this specific account via apiFetch's one-off actingAsCustomerId
// override (see adminMutations.ts) - never the admin's globally selected
// acting-as customer.
import { useEffect, useState } from 'react'
import type { CustomerSummary } from '../../api/types'
import { Modal } from '../../components/Modal'
import { getCustomerDataCounts } from './adminMutations'
import './DeleteAccountDialog.css'

interface DeleteAccountDialogProps {
  customer: CustomerSummary
  onDelete: (accountId: string) => Promise<void>
  onClose: () => void
}

interface Counts {
  jobCount: number
  candidateCount: number
}

export function DeleteAccountDialog({ customer, onDelete, onClose }: DeleteAccountDialogProps) {
  const [counts, setCounts] = useState<Counts | null>(null)
  const [countsError, setCountsError] = useState(false)
  const [countsReloadToken, setCountsReloadToken] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setCounts(null)
    setCountsError(false)

    getCustomerDataCounts(customer.id)
      .then((result) => {
        if (!cancelled) {
          setCounts(result)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCountsError(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [customer.id, countsReloadToken])

  async function handleDelete() {
    if (submitting || !counts) {
      return
    }
    setSubmitting(true)
    setDeleteError(false)
    try {
      await onDelete(customer.id)
      onClose()
    } catch {
      setDeleteError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const displayName = customer.company_name ?? customer.full_name ?? customer.email ?? 'kontot'

  return (
    <Modal title="Radera kundkonto" onClose={onClose}>
      <p>
        Är du säker på att du vill radera &quot;{displayName}&quot;? Följande raderas permanent:
      </p>

      {countsError ? (
        <p className="delete-account-dialog__error" role="alert">
          Något gick fel. Försök igen.{' '}
          <button
            type="button"
            className="delete-account-dialog__retry"
            onClick={() => setCountsReloadToken((token) => token + 1)}
          >
            Försök igen
          </button>
        </p>
      ) : counts ? (
        <ul className="delete-account-dialog__list">
          <li>{counts.jobCount} jobb</li>
          <li>{counts.candidateCount} kandidater</li>
          <li>All tillhörande data</li>
        </ul>
      ) : (
        <p className="delete-account-dialog__loading">Hämtar information …</p>
      )}

      <p>Detta går inte att ångra.</p>

      {deleteError && (
        <p className="delete-account-dialog__error" role="alert">
          Något gick fel. Försök igen.
        </p>
      )}

      <div className="delete-account-dialog__actions">
        <button
          type="button"
          className="delete-account-dialog__cancel"
          onClick={onClose}
          disabled={submitting}
        >
          Avbryt
        </button>
        <button
          type="button"
          className="delete-account-dialog__confirm"
          onClick={handleDelete}
          disabled={submitting || !counts}
        >
          {submitting ? 'Raderar …' : 'Radera'}
        </button>
      </div>
    </Modal>
  )
}
