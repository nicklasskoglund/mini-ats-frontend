// Pure grouping/count used for the jobs table's "Antal kandidater" column.
// JobRead has no candidate_count field (see CLAUDE.md "Inför Steg 4") -
// counted client-side from the same GET /candidates response Step 5's
// candidate list reuses.
import type { CandidateRead } from '../../api/types'

export function countCandidatesByJob(candidates: CandidateRead[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const candidate of candidates) {
    counts.set(candidate.job_id, (counts.get(candidate.job_id) ?? 0) + 1)
  }
  return counts
}
