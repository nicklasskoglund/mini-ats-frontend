// Centered login view (DESIGN.md section 4) - no sidebar/topbar, those only
// exist behind authentication. Signs in directly against Supabase Auth;
// AuthProvider picks up the resulting session via its own listener.
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { supabase } from '../auth/supabaseClient'
import './LoginPage.css'

export function LoginPage() {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return null
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) {
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        // Supabase returns status 400 for invalid credentials; anything
        // else (5xx, rate limiting) gets the generic fallback copy.
        setError(
          signInError.status === 400
            ? 'Fel e-postadress eller lösenord.'
            : 'Något gick fel. Försök igen.',
        )
      }
    } catch {
      setError('Något gick fel. Försök igen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h1>Mini-ATS</h1>
        <label className="login-form__field">
          <span>E-post</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="login-form__field">
          <span>Lösenord</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && (
          <p className="login-form__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="login-form__submit" disabled={submitting}>
          {submitting ? 'Loggar in …' : 'Logga in'}
        </button>
      </form>
    </div>
  )
}
