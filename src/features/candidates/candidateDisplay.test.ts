import { describe, expect, it } from 'vitest'
import { deriveScoreLabel, deriveStatusBadge } from './candidateDisplay'

describe('deriveScoreLabel', () => {
  it('shows an en dash when there is no score', () => {
    expect(deriveScoreLabel(null)).toBe('–')
  })

  it('shows the score as x/10', () => {
    expect(deriveScoreLabel(8)).toBe('8/10')
  })

  it('does not fall back to 0 for a missing score', () => {
    expect(deriveScoreLabel(null)).not.toBe('0/10')
  })
})

describe('deriveStatusBadge', () => {
  it('is "Ej bedömd" (neutral) when there is no score', () => {
    expect(deriveStatusBadge(null)).toEqual({ label: 'Ej bedömd', tone: 'neutral' })
  })

  it('is "Stark profil" (success) at exactly 7', () => {
    expect(deriveStatusBadge(7)).toEqual({ label: 'Stark profil', tone: 'success' })
  })

  it('is "Stark profil" (success) above 7', () => {
    expect(deriveStatusBadge(10)).toEqual({ label: 'Stark profil', tone: 'success' })
  })

  it('is "Behöver granskning" (warning) below 7', () => {
    expect(deriveStatusBadge(6)).toEqual({ label: 'Behöver granskning', tone: 'warning' })
  })

  it('is "Behöver granskning" (warning) at 0', () => {
    expect(deriveStatusBadge(0)).toEqual({ label: 'Behöver granskning', tone: 'warning' })
  })
})
