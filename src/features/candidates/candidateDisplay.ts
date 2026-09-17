// Pure derivations from ai_score (DESIGN.md section 7). Kept separate from
// rendering so the score-chip/status-badge rules are unit-testable on
// their own. Originally kanban-card-specific (Step 3); moved here in
// Step 5 once the candidate list and profile header needed the same
// derivation, instead of duplicating it a third time.

export type BadgeTone = 'neutral' | 'success' | 'warning'

export interface StatusBadge {
  label: string
  tone: BadgeTone
}

/**
 * `ai_score == null` (not falsy) deliberately distinguishes "not yet
 * assessed" from a genuine score - a `?? 0` style fallback would render a
 * missing score as "0/10", which DESIGN.md section 7 explicitly forbids.
 */
export function deriveScoreLabel(aiScore: number | null): string {
  return aiScore == null ? '–' : `${aiScore}/10`
}

export function deriveStatusBadge(aiScore: number | null): StatusBadge {
  if (aiScore == null) {
    return { label: 'Ej bedömd', tone: 'neutral' }
  }
  if (aiScore >= 7) {
    return { label: 'Stark profil', tone: 'success' }
  }
  return { label: 'Behöver granskning', tone: 'warning' }
}
