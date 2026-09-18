import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CandidateRead } from '../../api/types'
import { CandidateProfileHeader } from './CandidateProfileHeader'

function buildCandidate(overrides: Partial<CandidateRead> = {}): CandidateRead {
  return {
    id: 'candidate-1',
    job_id: 'job-1',
    name: 'Anna Andersson',
    email: 'anna@example.com',
    phone: '070-1234567',
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

describe('CandidateProfileHeader', () => {
  it('shows initials, name, status badge and the static stage chip', () => {
    render(
      <CandidateProfileHeader candidate={buildCandidate()} onMove={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )

    expect(screen.getByText('AA')).toBeInTheDocument()
    expect(screen.getByText('Anna Andersson')).toBeInTheDocument()
    expect(screen.getByText('Stark profil')).toBeInTheDocument()
    expect(screen.getByText('Screening')).toBeInTheDocument()
  })

  it('joins the available contact details with " · "', () => {
    render(
      <CandidateProfileHeader candidate={buildCandidate()} onMove={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )

    expect(screen.getByText('anna@example.com · 070-1234567')).toBeInTheDocument()
  })

  it('offers every other stage via the explicit move control', () => {
    render(
      <CandidateProfileHeader candidate={buildCandidate({ stage: 'screening' })} onMove={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Flytta till' }))

    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      'Ny',
      'Intervju',
      'Erbjudande',
      'Anställd',
      'Avvisad',
    ])
  })

  it('calls onMove with the chosen stage', () => {
    const onMove = vi.fn()
    render(
      <CandidateProfileHeader candidate={buildCandidate({ stage: 'new' })} onMove={onMove} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Flytta till' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Avvisad' }))

    expect(onMove).toHaveBeenCalledWith('rejected')
  })

  it('opens a separate kebab menu for Redigera/Radera', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(
      <CandidateProfileHeader candidate={buildCandidate()} onMove={vi.fn()} onEdit={onEdit} onDelete={onDelete} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Redigera' }))
    expect(onEdit).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Fler alternativ' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Radera' }))
    expect(onDelete).toHaveBeenCalledOnce()
  })
})
