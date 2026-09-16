// Role derivation for the authenticated user.
//
// Deliberately NOT sourced from GET /profile: that endpoint requires an
// "effective customer" and 400s for an admin with none selected (see
// app/routers/profile.py), so it can't be used to find out the logged-in
// user's own role. Role and name are instead read straight from the
// Supabase session's user_metadata, which the backend's handle_new_user
// trigger populates from the same data at account-creation time - no extra
// API call needed.
//
// user_metadata (unlike app_metadata) can in principle be edited by the
// user via the client SDK, so this makes AuthProvider's role a UX signal
// only (what the nav/RoleGuard show). The real authorization check already
// happens server-side against profiles.role, which a customer can never
// change themselves (ProfileUpdate excludes role entirely).
import type { Session } from '@supabase/supabase-js'

export type Role = 'admin' | 'customer'

export function deriveRole(session: Session | null): Role | null {
  const role = session?.user.user_metadata?.role
  return role === 'admin' || role === 'customer' ? role : null
}

export function deriveFullName(session: Session | null): string | null {
  const fullName = session?.user.user_metadata?.full_name
  return typeof fullName === 'string' && fullName.length > 0 ? fullName : null
}
