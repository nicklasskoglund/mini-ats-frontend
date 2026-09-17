// Name/initials, role and sign-out, as specified in DESIGN.md section 5.
import { useAuth } from '../auth/AuthProvider'
import type { Role } from '../auth/role'
import { getInitials } from '../lib/getInitials'
import './UserMenu.css'

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  customer: 'Kund',
}

export function UserMenu() {
  const { fullName, role, signOut } = useAuth()

  return (
    <div className="user-menu">
      <span className="user-menu__avatar" aria-hidden="true">
        {getInitials(fullName)}
      </span>
      <span className="user-menu__name">{fullName ?? 'Okänd användare'}</span>
      {role && <span className="user-menu__role">{ROLE_LABELS[role]}</span>}
      <button type="button" className="user-menu__signout" onClick={() => void signOut()}>
        Logga ut
      </button>
    </div>
  )
}
