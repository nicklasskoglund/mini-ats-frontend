// Job status labels (DESIGN.md section 8). The backend has no enum for
// `status` (plain string, defaults to "open") - active/paused/closed are
// entirely the frontend's chosen values, used consistently everywhere.
export type JobStatus = 'active' | 'paused' | 'closed'

export const JOB_STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'active', label: 'Aktiv' },
  { value: 'paused', label: 'Pausad' },
  { value: 'closed', label: 'Avslutad' },
]

/**
 * Falls back to the raw value for anything that isn't one of our three
 * chosen values - e.g. "open", the API's own default for a job created
 * before this UI existed. Showing the raw string beats hiding or
 * mislabeling data we don't recognize.
 */
export function getJobStatusLabel(status: string): string {
  return JOB_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}
