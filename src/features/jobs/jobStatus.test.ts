import { describe, expect, it } from 'vitest'
import { getJobStatusLabel } from './jobStatus'

describe('getJobStatusLabel', () => {
  it('maps the three chosen values to their Swedish labels', () => {
    expect(getJobStatusLabel('active')).toBe('Aktiv')
    expect(getJobStatusLabel('paused')).toBe('Pausad')
    expect(getJobStatusLabel('closed')).toBe('Avslutad')
  })

  it('falls back to the raw value for anything else (e.g. the API default "open")', () => {
    expect(getJobStatusLabel('open')).toBe('open')
    expect(getJobStatusLabel('whatever')).toBe('whatever')
  })
})
