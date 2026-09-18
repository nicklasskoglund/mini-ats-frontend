// Candidate list (DESIGN.md section 9): Namn/Jobb/Steg/Poäng plus a kebab
// menu with Redigera/Radera - same content and behavior as the profile
// header's kebab (section 10).
import { Link } from 'react-router-dom'
import type { CandidateRead } from '../../api/types'
import { KebabMenu } from '../../components/KebabMenu'
import { SkeletonTableRows } from '../../components/Skeleton'
import { deriveScoreLabel, deriveStatusBadge } from './candidateDisplay'
import { STAGE_LABELS } from './stageLabels'
import './CandidatesTable.css'

interface CandidatesTableProps {
  candidates: CandidateRead[]
  jobTitleById: Map<string, string>
  loading: boolean
  onEdit: (candidate: CandidateRead) => void
  onDelete: (candidate: CandidateRead) => void
}

export function CandidatesTable({
  candidates,
  jobTitleById,
  loading,
  onEdit,
  onDelete,
}: CandidatesTableProps) {
  return (
    <div className="candidates-table-container">
      <table className="candidates-table">
        <thead>
          <tr>
            <th>Namn</th>
            <th>Jobb</th>
            <th>Steg</th>
            <th>Poäng</th>
            <th aria-label="Åtgärder" />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonTableRows rows={3} colSpan={5} />
          ) : candidates.length === 0 ? (
            <tr>
              <td colSpan={5} className="candidates-table__empty">
                Inga kandidater ännu. Lägg till den första kandidaten för att komma igång.
              </td>
            </tr>
          ) : (
            candidates.map((candidate) => {
              const badge = deriveStatusBadge(candidate.ai_score)
              return (
                <tr key={candidate.id}>
                  <td>
                    <Link to={`/candidates/${candidate.id}`}>{candidate.name}</Link>
                  </td>
                  <td>{jobTitleById.get(candidate.job_id) ?? '–'}</td>
                  <td>{STAGE_LABELS[candidate.stage]}</td>
                  <td>
                    <span className="candidates-table__score">
                      {deriveScoreLabel(candidate.ai_score)}
                    </span>
                    <span className={`candidates-table__badge candidates-table__badge--${badge.tone}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="candidates-table__actions">
                    <KebabMenu
                      items={[
                        { label: 'Redigera', onClick: () => onEdit(candidate) },
                        { label: 'Radera', onClick: () => onDelete(candidate) },
                      ]}
                    />
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
