// Top bar: logo, admin-only "act as customer" picker, user menu. Visible
// on every authenticated view (DESIGN.md section 5), not just recruitment.
import { useAuth } from '../auth/AuthProvider'
import { ActingAsDropdown } from './ActingAsDropdown'
import { UserMenu } from './UserMenu'
import './Topbar.css'

export function Topbar() {
  const { role } = useAuth()

  return (
    <header className="topbar">
      <span className="topbar__logo">Mini-ATS</span>
      {role === 'admin' && <ActingAsDropdown />}
      <UserMenu />
    </header>
  )
}
