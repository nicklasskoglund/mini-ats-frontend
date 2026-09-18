// Kebab menu on a kanban card: just the "Flytta till …" submenu
// (DESIGN.md section 7). Redigera/Radera live on a separate kebab menu on
// the candidate list's row and the profile header (Step 5), not here.
import type { CandidateRead, Stage } from '../../api/types'
import { KebabMenu } from '../../components/KebabMenu'
import { buildMoveToStageItems } from '../candidates/stageLabels'

interface CandidateCardMenuProps {
  candidate: CandidateRead
  onMove: (targetStage: Stage) => void
}

export function CandidateCardMenu({ candidate, onMove }: CandidateCardMenuProps) {
  return <KebabMenu heading="Flytta till …" items={buildMoveToStageItems(candidate, onMove)} />
}
