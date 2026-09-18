// Top bar: hamburger menu (mobile only, DESIGN.md section 15), logo,
// admin-only "act as customer" picker, user menu. Visible on every
// authenticated view (DESIGN.md section 5), not just recruitment.
import { useAuth } from '../auth/AuthProvider'
import { ActingAsDropdown } from './ActingAsDropdown'
import { UserMenu } from './UserMenu'
import './Topbar.css'

interface TopbarProps {
  mobileNavOpen: boolean
  onToggleMobileNav: () => void
}

export function Topbar({ mobileNavOpen, onToggleMobileNav }: TopbarProps) {
  const { role } = useAuth()

  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar__menu-toggle"
        aria-label={mobileNavOpen ? 'Stäng meny' : 'Öppna meny'}
        aria-expanded={mobileNavOpen}
        aria-controls="sidebar-nav"
        onClick={onToggleMobileNav}
      >
        <span className="topbar__menu-icon" aria-hidden="true" />
      </button>
      <span className="topbar__logo">Mini-ATS</span>
      {role === 'admin' && <ActingAsDropdown />}
      <UserMenu />
    </header>
  )
}
