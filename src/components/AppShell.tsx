// Layout for every authenticated route: topbar + sidebar + routed page
// content (DESIGN.md section 5). Mounted once by App.tsx, inside
// ProtectedRoute and ActingAsProvider.
//
// Owns the mobile sidebar's open/closed state (DESIGN.md section 15) here,
// above both Topbar (which renders the hamburger button) and Sidebar
// (which renders the panel it controls) - neither has a reason to know
// about the other otherwise.
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import './AppShell.css'

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="app-shell">
      <Topbar
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={() => setMobileNavOpen((current) => !current)}
      />
      <div className="app-shell__body">
        <Sidebar mobileNavOpen={mobileNavOpen} onCloseMobileNav={() => setMobileNavOpen(false)} />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
