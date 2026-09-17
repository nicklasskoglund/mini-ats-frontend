// Plain calls against /admin/accounts and /profile - not hook state, so
// the create/delete flows can compose them freely (see CreateAccountModal
// and DeleteAccountDialog).
import { apiFetch } from '../../api/client'
import type {
  AdminAccountCreate,
  AdminAccountRead,
  CandidateRead,
  JobRead,
  ProfileUpdate,
  ProfileRead,
} from '../../api/types'

export function createAccount(input: AdminAccountCreate): Promise<AdminAccountRead> {
  return apiFetch<AdminAccountRead>('/admin/accounts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteAccount(accountId: string): Promise<void> {
  // No X-Acting-As-Customer parameter on this endpoint - it's an
  // unconditional admin action, not scoped by acting-as context.
  return apiFetch<void>(`/admin/accounts/${accountId}`, { method: 'DELETE' })
}

/**
 * The "Fler företagsuppgifter" fields aren't part of POST /admin/accounts -
 * they're a second, separate call against the newly created customer's own
 * profile, using the one-off actingAsCustomerId override (never the global
 * acting-as selection) so this doesn't disturb whatever customer the admin
 * was already acting as.
 */
export function updateCustomerProfile(
  customerId: string,
  input: ProfileUpdate,
): Promise<ProfileRead> {
  return apiFetch<ProfileRead>('/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
    actingAsCustomerId: customerId,
  })
}

/**
 * Fetched on demand when the delete dialog opens, scoped to the specific
 * account being considered for deletion via the same one-off override -
 * never the admin's globally selected acting-as customer.
 */
export async function getCustomerDataCounts(
  customerId: string,
): Promise<{ jobCount: number; candidateCount: number }> {
  const [jobs, candidates] = await Promise.all([
    apiFetch<JobRead[]>('/jobs', { actingAsCustomerId: customerId }),
    apiFetch<CandidateRead[]>('/candidates', { actingAsCustomerId: customerId }),
  ])
  return { jobCount: jobs.length, candidateCount: candidates.length }
}
