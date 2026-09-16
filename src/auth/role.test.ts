import { describe, expect, it } from 'vitest'
import type { Session } from '@supabase/supabase-js'
import { deriveFullName, deriveRole } from './role'

function buildSession(userMetadata: Record<string, unknown>): Session {
  return {
    access_token: 'token',
    refresh_token: 'refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'user-1',
      app_metadata: {},
      user_metadata: userMetadata,
      aud: 'authenticated',
      created_at: '2026-01-01T00:00:00Z',
    },
  } as Session
}

describe('deriveRole', () => {
  it('returns null for a null session', () => {
    expect(deriveRole(null)).toBeNull()
  })

  it('returns admin when user_metadata.role is admin', () => {
    expect(deriveRole(buildSession({ role: 'admin' }))).toBe('admin')
  })

  it('returns customer when user_metadata.role is customer', () => {
    expect(deriveRole(buildSession({ role: 'customer' }))).toBe('customer')
  })

  it('returns null for an unrecognized or missing role value', () => {
    expect(deriveRole(buildSession({ role: 'superadmin' }))).toBeNull()
    expect(deriveRole(buildSession({}))).toBeNull()
  })
})

describe('deriveFullName', () => {
  it('returns the name from user_metadata when present', () => {
    expect(deriveFullName(buildSession({ full_name: 'Anna Andersson' }))).toBe('Anna Andersson')
  })

  it('returns null when missing or empty', () => {
    expect(deriveFullName(buildSession({}))).toBeNull()
    expect(deriveFullName(buildSession({ full_name: '' }))).toBeNull()
    expect(deriveFullName(null)).toBeNull()
  })
})
