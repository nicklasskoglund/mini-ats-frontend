// Candidate profile header (DESIGN.md section 10): initials, name,
// AI-status badge, static stage chip, the explicit "Flytta till … ▾"
// move control, and a separate "⋯" kebab for Redigera/Radera.
import type { CandidateRead, Stage } from '../../api/types'
import { KebabMenu } from '../../components/KebabMenu'
import { getInitials } from '../../lib/getInitials'
import { deriveStatusBadge } from './candidateDisplay'
import { buildMoveToStageItems, STAGE_LABELS } from './stageLabels'
import './CandidateProfileHeader.css'

interface CandidateProfileHeaderProps {
  candidate: CandidateRead
  onMove: (targetStage: Stage) => void
  onEdit: () => void
  onDelete: () => void
}

export function CandidateProfileHeader({
  candidate,
  onMove,
  onEdit,
  onDelete,
}: CandidateProfileHeaderProps) {
  const badge = deriveStatusBadge(candidate.ai_score)
  const contactLine = [candidate.email, candidate.phone, candidate.linkedin_url]
    .filter((value): value is string => Boolean(value))
    .join(' · ')

  return (
    <div className="candidate-profile-header">
      <div className="candidate-profile-header__row">
        <span className="candidate-profile-header__avatar" aria-hidden="true">
          {getInitials(candidate.name)}
        </span>
        <span className="candidate-profile-header__name">{candidate.name}</span>
        <span
          className={`candidate-profile-header__badge candidate-profile-header__badge--${badge.tone}`}
        >
          {badge.label}
        </span>
        <span className="candidate-profile-header__stage-chip">
          {STAGE_LABELS[candidate.stage]}
        </span>
        <div className="candidate-profile-header__spacer" />
        <KebabMenu
          triggerLabel="Flytta till … ▾"
          triggerAriaLabel="Flytta till"
          items={buildMoveToStageItems(candidate, onMove)}
        />
        <KebabMenu
          items={[
            { label: 'Redigera', onClick: onEdit },
            { label: 'Radera', onClick: onDelete },
          ]}
        />
      </div>
      {contactLine && <p className="candidate-profile-header__contact">{contactLine}</p>}
    </div>
  )
}
