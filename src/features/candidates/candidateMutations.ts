// Plain create/update/delete calls against /candidates - not hook state,
// so both the candidate list (Step 5) and the profile page can call them
// and independently decide how to refresh their own data afterwards.
import { apiFetch } from '../../api/client'
import type { CandidateCreate, CandidateRead, CandidateUpdate } from '../../api/types'

export function createCandidate(input: CandidateCreate): Promise<CandidateRead> {
  return apiFetch<CandidateRead>('/candidates', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateCandidate(
  candidateId: string,
  input: CandidateUpdate,
): Promise<CandidateRead> {
  return apiFetch<CandidateRead>(`/candidates/${candidateId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteCandidate(candidateId: string): Promise<void> {
  // 204, no cascade/409 check - candidates have no child rows (unlike jobs).
  return apiFetch<void>(`/candidates/${candidateId}`, { method: 'DELETE' })
}

// The caller owns the AbortController (see AiAssessmentPanel.tsx): it
// needs the same controller to cover the timeout, unmounting, and
// switching to a different candidate with one abort path, not just a
// fire-and-forget AbortSignal.timeout() this function couldn't otherwise
// trigger itself.
export function assessCandidate(candidateId: string, signal: AbortSignal): Promise<CandidateRead> {
  return apiFetch<CandidateRead>(`/candidates/${candidateId}/assess`, {
    method: 'POST',
    signal,
  })
}
