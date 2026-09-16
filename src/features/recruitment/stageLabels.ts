// Fixed column order and Swedish labels for the kanban board
// (DESIGN.md section 7). The API's stage values are the source of truth;
// this only maps them to what the UI shows.
import type { Stage } from '../../api/types'

export const STAGE_ORDER: readonly Stage[] = [
  'new',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
]

export const STAGE_LABELS: Record<Stage, string> = {
  new: 'Ny',
  screening: 'Screening',
  interview: 'Intervju',
  offer: 'Erbjudande',
  hired: 'Anställd',
  rejected: 'Avvisad',
}
