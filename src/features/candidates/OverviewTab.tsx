// Översikt tab (DESIGN.md section 10): contact details on the left, an AI
// assessment placeholder on the right. The real assessment panel (five
// states, POST /assess) is Step 6's - this is a deliberately honest
// placeholder so no button here promises functionality that doesn't
// exist yet (designprincip 3, "inga falska kontroller").
import type { ReactNode } from 'react'
import type { CandidateRead } from '../../api/types'
import { formatDate } from '../../lib/formatDate'
import './OverviewTab.css'

interface OverviewTabProps {
  candidate: CandidateRead
  jobTitle: string | undefined
}

export function OverviewTab({ candidate, jobTitle }: OverviewTabProps) {
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
        <p>AI-bedömning kommer i nästa steg.</p>
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
