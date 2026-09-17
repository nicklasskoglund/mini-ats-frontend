// Kebab menu on a kanban card. In this step it only holds the
// "Flytta till …" submenu (DESIGN.md section 7); Redigera/Radera land
// here once the candidate profile exists (Step 5). Rendering/positioning
// mechanics live in the shared KebabMenu component.
import type { CandidateRead, Stage } from '../../api/types'
import { KebabMenu } from '../../components/KebabMenu'
import { STAGE_LABELS, STAGE_ORDER } from './stageLabels'

interface CandidateCardMenuProps {
  candidate: CandidateRead
  onMove: (targetStage: Stage) => void
}

export function CandidateCardMenu({ candidate, onMove }: CandidateCardMenuProps) {
  const otherStages = STAGE_ORDER.filter((stage) => stage !== candidate.stage)

  return (
    <KebabMenu
      heading="Flytta till …"
      items={otherStages.map((stage) => ({
        label: STAGE_LABELS[stage],
        onClick: () => onMove(stage),
      }))}
    />
  )
}
