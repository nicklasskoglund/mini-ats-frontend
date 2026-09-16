// Pure derivations for the candidate card (DESIGN.md section 7). Kept
// separate from rendering so the ai_score -> badge/score-chip rules are
// unit-testable on their own.

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
