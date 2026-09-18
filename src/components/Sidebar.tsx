// Left-hand navigation. Item visibility is a UX convenience only - the
// real per-route authorization is RoleGuard plus the backend, not this
// filter (see role.ts).
//
// On mobile (DESIGN.md section 15) this becomes an off-canvas panel,
// controlled by AppShell's mobileNavOpen state: a backdrop click, Escape,
// or picking a nav link all close it, the same close-affordance set as
// Modal.tsx.
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import type { Role } from '../auth/role'
import './Sidebar.css'

interface NavItem {
  label: string
  to: string
  roles: readonly Role[]
}

interface SidebarProps {
  mobileNavOpen: boolean
  onCloseMobileNav: () => void
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Rekrytering', to: '/', roles: ['admin', 'customer'] },
  { label: 'Jobb', to: '/jobs', roles: ['admin', 'customer'] },
  { label: 'Kandidater', to: '/candidates', roles: ['admin', 'customer'] },
  { label: 'Kunder & konton', to: '/admin/accounts', roles: ['admin'] },
  { label: 'Inställningar', to: '/settings', roles: ['admin', 'customer'] },
]

export function Sidebar({ mobileNavOpen, onCloseMobileNav }: SidebarProps) {
  const { role } = useAuth()
  const visibleItems = NAV_ITEMS.filter((item) => role && item.roles.includes(role))

  useEffect(() => {
    if (!mobileNavOpen) {
      return
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseMobileNav()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileNavOpen, onCloseMobileNav])

  return (
    <>
      {mobileNavOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobileNav} aria-hidden="true" />
      )}
      <nav
        id="sidebar-nav"
        className={mobileNavOpen ? 'sidebar sidebar--open' : 'sidebar'}
        aria-label="Huvudmeny"
      >
        <ul className="sidebar__list">
          {visibleItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
                }
                onClick={onCloseMobileNav}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
