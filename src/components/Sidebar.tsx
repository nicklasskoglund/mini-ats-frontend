// Left-hand navigation. Item visibility is a UX convenience only - the
// real per-route authorization is RoleGuard plus the backend, not this
// filter (see role.ts).
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import type { Role } from '../auth/role'
import './Sidebar.css'

interface NavItem {
  label: string
  to: string
  roles: readonly Role[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Rekrytering', to: '/', roles: ['admin', 'customer'] },
  { label: 'Jobb', to: '/jobs', roles: ['admin', 'customer'] },
  { label: 'Kandidater', to: '/candidates', roles: ['admin', 'customer'] },
  { label: 'Kunder & konton', to: '/admin/accounts', roles: ['admin'] },
  { label: 'Inställningar', to: '/settings', roles: ['admin', 'customer'] },
]

export function Sidebar() {
  const { role } = useAuth()
  const visibleItems = NAV_ITEMS.filter((item) => role && item.roles.includes(role))

  return (
    <nav className="sidebar" aria-label="Huvudmeny">
      <ul className="sidebar__list">
        {visibleItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
