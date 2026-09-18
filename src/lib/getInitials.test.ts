import { describe, expect, it } from 'vitest'
import { getInitials } from './getInitials'

describe('getInitials', () => {
  it('returns "?" for null', () => {
    expect(getInitials(null)).toBe('?')
  })

  it('returns the first letter of up to two words, uppercased', () => {
    expect(getInitials('Anna Andersson')).toBe('AA')
    expect(getInitials('anna')).toBe('A')
  })

  it('ignores extra whitespace and extra name parts', () => {
    expect(getInitials('  Anna   Berit Andersson  ')).toBe('AB')
  })
})
