// Layout for every authenticated route: topbar + sidebar + routed page
// content (DESIGN.md section 5). Mounted once by App.tsx, inside
// ProtectedRoute and ActingAsProvider.
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import './AppShell.css'

export function AppShell() {
  return (
    <div className="app-shell">
      <Topbar />
      <div className="app-shell__body">
        <Sidebar />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
