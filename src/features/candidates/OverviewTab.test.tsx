import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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
    render(<OverviewTab candidate={buildCandidate()} jobTitle={undefined} onAssess={vi.fn()} />)

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
        onAssess={vi.fn()}
      />,
    )

    expect(screen.getByRole('link', { name: 'https://linkedin.com/in/anna' })).toHaveAttribute(
      'href',
      'https://linkedin.com/in/anna',
    )
    expect(screen.getByText('Frontend developer')).toBeInTheDocument()
  })

  it('renders the AI assessment panel in the right column', () => {
    // Full state coverage lives in AiAssessmentPanel.test.tsx - this just
    // confirms OverviewTab wires the candidate/onAssess through to it.
    render(
      <OverviewTab candidate={buildCandidate({ cv_text: null })} jobTitle={undefined} onAssess={vi.fn()} />,
    )

    expect(screen.getByText('Lägg till CV-text först')).toBeInTheDocument()
  })
})
