// Hand-written from openapi.json. Only the schemas actually used by the
// app so far - extend as later steps touch more of the contract, never
// from memory (see CLAUDE.md "API-kontraktet").

/** One row in GET /admin/customers - fuels the "act as a customer" picker. */
export interface CustomerSummary {
  id: string
  full_name: string | null
  company_name: string | null
  email: string | null
}

/** One entry in HTTPValidationError.detail, for Pydantic's own 422s. */
export interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

/** A candidate's pipeline stage - a real backend enum, unlike jobs.status. */
export type Stage = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'

/** Candidate as returned by the API (GET/PATCH /candidates, /candidates/kanban). */
export interface CandidateRead {
  id: string
  job_id: string
  name: string
  email: string | null
  phone: string | null
  linkedin_url: string | null
  cv_text: string | null
  notes: string | null
  stage: Stage
  ai_score: number | null
  ai_summary: string | null
  ai_strengths: string[] | null
  ai_gaps: string[] | null
  created_at: string
}

/** Request body for PATCH /candidates/{candidate_id}. Only the fields we send. */
export interface CandidateUpdate {
  stage?: Stage
}

/**
 * GET /candidates/kanban's response: candidates grouped by stage server-side.
 * All six keys are always present (empty arrays, never missing).
 */
export type KanbanBoard = Record<Stage, CandidateRead[]>

/** Job as returned by GET /jobs. Only id/title are used before Step 4. */
export interface JobRead {
  id: string
  customer_id: string
  title: string
  description: string | null
  status: string
  created_at: string
}
