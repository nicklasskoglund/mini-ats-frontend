// Översikt tab (DESIGN.md section 10): contact details on the left, the
// AI assessment panel (DESIGN.md section 11) on the right.
import type { ReactNode } from 'react'
import type { CandidateRead } from '../../api/types'
import { formatDate } from '../../lib/formatDate'
import { AiAssessmentPanel } from './AiAssessmentPanel'
import './OverviewTab.css'

interface OverviewTabProps {
  candidate: CandidateRead
  jobTitle: string | undefined
  onAssess: (signal: AbortSignal) => Promise<void>
}

export function OverviewTab({ candidate, jobTitle, onAssess }: OverviewTabProps) {
  return (
    <div className="overview-tab">
      <div className="overview-tab__contact">
        <h2>Kontaktuppgifter</h2>
        <dl>
          <ContactRow label="E-post" value={candidate.email} />
          <ContactRow label="Telefon" value={candidate.phone} />
          <ContactRow
            label="LinkedIn"
            value={
              candidate.linkedin_url ? (
                <a href={candidate.linkedin_url} target="_blank" rel="noreferrer">
                  {candidate.linkedin_url}
                </a>
              ) : null
            }
          />
          <ContactRow label="Jobb" value={jobTitle} />
          <ContactRow label="Skapad" value={formatDate(candidate.created_at)} />
        </dl>
      </div>
      <div className="overview-tab__assessment">
        <h2>AI-bedömning</h2>
        <AiAssessmentPanel candidate={candidate} onAssess={onAssess} />
      </div>
    </div>
  )
}

function ContactRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="overview-tab__row">
      <dt>{label}</dt>
      <dd>{value ?? '–'}</dd>
    </div>
  )
}
