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
