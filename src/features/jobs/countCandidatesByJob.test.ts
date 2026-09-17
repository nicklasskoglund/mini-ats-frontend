import { describe, expect, it } from 'vitest'
import type { CandidateRead } from '../../api/types'
import { countCandidatesByJob } from './countCandidatesByJob'

function buildCandidate(overrides: Partial<CandidateRead>): CandidateRead {
  return {
    id: 'candidate-1',
    job_id: 'job-1',
    name: 'Anna Andersson',
    email: null,
    phone: null,
    linkedin_url: null,
    cv_text: null,
    notes: null,
    stage: 'new',
    ai_score: null,
    ai_summary: null,
    ai_strengths: null,
    ai_gaps: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('countCandidatesByJob', () => {
  it('returns an empty map for no candidates', () => {
    expect(countCandidatesByJob([])).toEqual(new Map())
  })

  it('counts candidates per job_id', () => {
    const candidates = [
      buildCandidate({ id: 'c1', job_id: 'job-1' }),
      buildCandidate({ id: 'c2', job_id: 'job-1' }),
      buildCandidate({ id: 'c3', job_id: 'job-2' }),
    ]

    const counts = countCandidatesByJob(candidates)

    expect(counts.get('job-1')).toBe(2)
    expect(counts.get('job-2')).toBe(1)
    expect(counts.get('job-3')).toBeUndefined()
  })
})
