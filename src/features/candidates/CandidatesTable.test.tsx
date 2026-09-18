import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { CandidateRead } from '../../api/types'
import { CandidatesTable } from './CandidatesTable'

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
    stage: 'screening',
    ai_score: 8,
    ai_summary: null,
    ai_strengths: null,
    ai_gaps: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function renderTable(props: Partial<Parameters<typeof CandidatesTable>[0]> = {}) {
  return render(
    <MemoryRouter>
      <CandidatesTable
        candidates={[]}
        jobTitleById={new Map()}
        loading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('CandidatesTable', () => {
  it('shows skeleton rows while loading', () => {
    const { container } = renderTable({ loading: true })

    expect(container.querySelectorAll('.skeleton-bar')).toHaveLength(3)
  })

  it('shows an empty-state message when there are no candidates', () => {
    renderTable()

    expect(
      screen.getByText('Inga kandidater ännu. Lägg till den första kandidaten för att komma igång.'),
    ).toBeInTheDocument()
  })

  it('renders name as a link, job title, stage label, score and status badge', () => {
    const candidate = buildCandidate()
    renderTable({ candidates: [candidate], jobTitleById: new Map([['job-1', 'Frontend developer']]) })

    const link = screen.getByRole('link', { name: 'Anna Andersson' })
    expect(link).toHaveAttribute('href', '/candidates/candidate-1')
    expect(screen.getByText('Frontend developer')).toBeInTheDocument()
    expect(screen.getByText('Screening')).toBeInTheDocument()
    expect(screen.getByText('8/10')).toBeInTheDocument()
    expect(screen.getByText('Stark profil')).toBeInTheDocument()
  })

  it('falls back to an en dash for an unknown job', () => {
    renderTable({ candidates: [buildCandidate()], jobTitleById: new Map() })

    expect(screen.getByText('–')).toBeInTheDocument()
  })

  it('calls onEdit/onDelete via the kebab menu', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const candidate = buildCandidate()
    renderTable({ candidates: [candidate], onEdit, onDelete })

    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Redigera' }))
    expect(onEdit).toHaveBeenCalledWith(candidate)

    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Radera' }))
    expect(onDelete).toHaveBeenCalledWith(candidate)
  })
})
