// Redirects to /login when there is no active session. Renders nothing
// while the initial session check is still in flight, to avoid a flash of
// the login page for an already-authenticated user.
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}
