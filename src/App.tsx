// Route tree and provider composition. AuthProvider must wrap everything
// (ToastProvider/ActingAsProvider both read the session), ToastProvider
// must wrap ActingAsProvider (which shows toasts on customer-fetch errors).
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { AuthProvider } from './auth/AuthProvider'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { RoleGuard } from './auth/RoleGuard'
import { ActingAsProvider } from './context/ActingAsProvider'
import { ToastProvider } from './context/ToastProvider'
import { AdminAccountsPage } from './pages/AdminAccountsPage'
import { CandidatesPage } from './pages/CandidatesPage'
import { JobsPage } from './pages/JobsPage'
import { LoginPage } from './pages/LoginPage'
import { RecruitmentPage } from './pages/RecruitmentPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ActingAsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<RecruitmentPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/candidates" element={<CandidatesPage />} />
                <Route
                  path="/admin/accounts"
                  element={
                    <RoleGuard allow={['admin']}>
                      <AdminAccountsPage />
                    </RoleGuard>
                  }
                />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ActingAsProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
