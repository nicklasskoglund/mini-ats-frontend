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

/**
 * Request body for POST /candidates. `email` is optional in the contract
 * but required by the "Add candidate" form (DESIGN.md section 9, the
 * frontend's own stricter rule - same pattern as jobs.status in Step 4).
 */
export interface CandidateCreate {
  job_id: string
  name: string
  email?: string | null
  phone?: string | null
  linkedin_url?: string | null
  cv_text?: string | null
  notes?: string | null
}

/** Request body for PATCH /candidates/{candidate_id}. All fields optional (partial update). */
export interface CandidateUpdate {
  name?: string
  email?: string | null
  phone?: string | null
  linkedin_url?: string | null
  cv_text?: string | null
  notes?: string | null
  stage?: Stage
}

/**
 * GET /candidates/kanban's response: candidates grouped by stage server-side.
 * All six keys are always present (empty arrays, never missing).
 */
export type KanbanBoard = Record<Stage, CandidateRead[]>

/** Job as returned by GET /jobs. */
export interface JobRead {
  id: string
  customer_id: string
  title: string
  description: string | null
  status: string
  created_at: string
}

/**
 * Request body for POST /jobs. `status` has no backend enum (plain string,
 * default "open" if omitted) - the app always sends "active" explicitly so
 * "open" never appears alongside the three chosen values (see
 * features/jobs/jobStatus.ts).
 */
export interface JobCreate {
  title: string
  description?: string | null
  status?: string
}

/** Request body for PATCH /jobs/{job_id}. All fields optional (partial update). */
export interface JobUpdate {
  title?: string
  description?: string | null
  status?: string
}

export type AccountRole = 'admin' | 'customer'

/**
 * Request body for POST /admin/accounts. `password` must be omitted
 * entirely (not sent as null) for role "customer" - the backend 400s if
 * the key is present at all, regardless of value (see
 * features/admin/adminMutations.ts).
 */
export interface AdminAccountCreate {
  email: string
  password?: string
  role: AccountRole
  full_name?: string | null
  company_name?: string | null
}

/** The created account, as returned by POST /admin/accounts. */
export interface AdminAccountRead {
  id: string
  email: string
  role: AccountRole
  full_name: string | null
  company_name: string | null
}

/** Profile as returned by GET/PATCH /profile. */
export interface ProfileRead {
  id: string
  role: string
  full_name: string | null
  company_name: string | null
  website_url: string | null
  linkedin_url: string | null
  phone: string | null
  contact_email: string | null
  address: string | null
  description: string | null
  created_at: string
}

/** Request body for PATCH /profile. All fields optional (partial update). */
export interface ProfileUpdate {
  full_name?: string | null
  company_name?: string | null
  website_url?: string | null
  linkedin_url?: string | null
  phone?: string | null
  contact_email?: string | null
  address?: string | null
  description?: string | null
}
