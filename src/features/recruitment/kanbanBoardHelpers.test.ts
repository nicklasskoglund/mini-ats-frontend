import { describe, expect, it } from 'vitest'
import type { CandidateRead, KanbanBoard } from '../../api/types'
import { moveCandidateInBoard } from './kanbanBoardHelpers'

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
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function buildEmptyBoard(): KanbanBoard {
  return { new: [], screening: [], interview: [], offer: [], hired: [], rejected: [] }
}

describe('moveCandidateInBoard', () => {
  it('removes the candidate from its current stage and adds it to the target stage', () => {
    const candidate = buildCandidate({ stage: 'new' })
    const board = { ...buildEmptyBoard(), new: [candidate] }

    const result = moveCandidateInBoard(board, candidate, 'screening')

    expect(result.new).toEqual([])
    expect(result.screening).toHaveLength(1)
    expect(result.screening[0]).toMatchObject({ id: 'candidate-1', stage: 'screening' })
  })

  it('leaves other candidates in the source column untouched', () => {
    const moving = buildCandidate({ id: 'candidate-1', stage: 'new' })
    const staying = buildCandidate({ id: 'candidate-2', stage: 'new', name: 'Bo Berg' })
    const board = { ...buildEmptyBoard(), new: [moving, staying] }

    const result = moveCandidateInBoard(board, moving, 'interview')

    expect(result.new).toEqual([staying])
    expect(result.interview.map((c) => c.id)).toEqual(['candidate-1'])
  })

  it('leaves other columns untouched', () => {
    const candidate = buildCandidate({ stage: 'new' })
    const inOffer = buildCandidate({ id: 'candidate-3', stage: 'offer', name: 'Cecilia Ek' })
    const board = { ...buildEmptyBoard(), new: [candidate], offer: [inOffer] }

    const result = moveCandidateInBoard(board, candidate, 'hired')

    expect(result.offer).toEqual([inOffer])
  })
})
