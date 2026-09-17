import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('formats an ISO date string as a Swedish date', () => {
    expect(formatDate('2026-03-05T12:00:00Z')).toBe('2026-03-05')
  })
})
