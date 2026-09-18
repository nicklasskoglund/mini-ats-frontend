// Client-side role check for rendering only (see role.ts for why this is
// UX, not real authorization). Direct navigation to a route the current
// role shouldn't see gets the "access denied" copy from DESIGN.md section
// 13, rather than a silent redirect.
import type { ReactNode } from 'react'
import { useAuth } from './AuthProvider'
import type { Role } from './role'

interface RoleGuardProps {
  allow: Role[]
  children: ReactNode
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const { role } = useAuth()

  if (!role || !allow.includes(role)) {
    return <p role="alert">Du har inte behörighet till den här resursen.</p>
  }

  return children
}
