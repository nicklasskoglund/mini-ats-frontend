// Fixed pipeline order and Swedish labels for a candidate's stage
// (DESIGN.md section 7). The API's stage values are the source of truth;
// this only maps them to what the UI shows. Originally kanban-specific
// (Step 3); moved here in Step 5 once the candidate list and profile
// header needed the same mapping and move-to-stage menu.
import type { CandidateRead, Stage } from '../../api/types'
import type { KebabMenuItem } from '../../components/KebabMenu'

export const STAGE_ORDER: readonly Stage[] = [
  'new',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
]

export const STAGE_LABELS: Record<Stage, string> = {
  new: 'Ny',
  screening: 'Screening',
  interview: 'Intervju',
  offer: 'Erbjudande',
  hired: 'Anställd',
  rejected: 'Avvisad',
}

/**
 * The "Flytta till …" menu items for a candidate - every stage except its
 * current one. Shared by the kanban card's kebab menu (CandidateCardMenu)
 * and the candidate profile header's explicit move button.
 */
export function buildMoveToStageItems(
  candidate: Pick<CandidateRead, 'stage'>,
  onMove: (targetStage: Stage) => void,
): KebabMenuItem[] {
  return STAGE_ORDER.filter((stage) => stage !== candidate.stage).map((stage) => ({
    label: STAGE_LABELS[stage],
    onClick: () => onMove(stage),
  }))
}
