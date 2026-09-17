import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CandidateRead } from '../../api/types'
import { OverviewTab } from './OverviewTab'

function buildCandidate(overrides: Partial<CandidateRead> = {}): CandidateRead {
  return {
    id: 'candidate-1',
    job_id: 'job-1',
    name: 'Anna Andersson',
    email: 'anna@example.com',
    phone: null,
    linkedin_url: null,
    cv_text: null,
    notes: null,
    stage: 'new',
    ai_score: null,
    ai_summary: null,
    ai_strengths: null,
    ai_gaps: null,
    created_at: '2026-03-05T00:00:00Z',
    ...overrides,
  }
}

describe('OverviewTab', () => {
  it('shows all five contact rows with an en dash for missing values', () => {
    render(<OverviewTab candidate={buildCandidate()} jobTitle={undefined} />)

    expect(screen.getByText('anna@example.com')).toBeInTheDocument()
    expect(screen.getByText('2026-03-05')).toBeInTheDocument()
    // Telefon, LinkedIn and Jobb are all missing here.
    expect(screen.getAllByText('–')).toHaveLength(3)
  })

  it('renders LinkedIn as a link and shows the job title when known', () => {
    render(
      <OverviewTab
        candidate={buildCandidate({ linkedin_url: 'https://linkedin.com/in/anna' })}
        jobTitle="Frontend developer"
      />,
    )

    expect(screen.getByRole('link', { name: 'https://linkedin.com/in/anna' })).toHaveAttribute(
      'href',
      'https://linkedin.com/in/anna',
    )
    expect(screen.getByText('Frontend developer')).toBeInTheDocument()
  })

  it('shows the AI assessment placeholder, not a five-state panel', () => {
    render(<OverviewTab candidate={buildCandidate()} jobTitle={undefined} />)

    expect(screen.getByText('AI-bedömning kommer i nästa steg.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Kör AI-bedömning' })).not.toBeInTheDocument()
  })
})
