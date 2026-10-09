import { useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function App() {
  const [resetToken, setResetToken] = useState(
    () => new URLSearchParams(window.location.search).get('token') || '',
  )
  const [mode, setMode] = useState(
    () => new URLSearchParams(window.location.search).has('token') ? 'reset' : 'login',
  )
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)

  const isRegistering = mode === 'register'
  const isForgotPassword = mode === 'forgot'
  const isResettingPassword = mode === 'reset'
  const isRecoveryMode = isForgotPassword || isResettingPassword

  function switchMode(nextMode) {
    setMode(nextMode)
    setMessage('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const currentMode = mode
    const formData = new FormData(form)
    let endpoint
    let payload

    if (currentMode === 'register') {
      endpoint = 'register'
      payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      }
    } else if (currentMode === 'forgot') {
      endpoint = 'forgot-password'
      payload = { email: formData.get('email') }
    } else if (currentMode === 'reset') {
      endpoint = 'reset-password'
      payload = {
        token: resetToken,
        newPassword: formData.get('newPassword'),
      }
    } else {
      endpoint = 'login'
      payload = {
        email: formData.get('email'),
        password: formData.get('password'),
      }
    }

    setBusy(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        setError(result.message || 'Request failed. Please try again.')
        return
      }

      if (currentMode === 'register') {
        setMode('login')
        setMessage(result.message || 'Account created. You can now sign in.')
        form.reset()
      } else if (currentMode === 'forgot') {
        setMessage(result.message)
        form.reset()
      } else if (currentMode === 'reset') {
        setResetToken('')
        setMode('login')
        window.history.replaceState(null, '', window.location.pathname)
        setMessage(result.message)
        form.reset()
      } else {
        setSession({
          email: payload.email,
          accessToken: result.accessToken,
        })
      }
    } catch {
      setError('Could not connect to the server. Check that the API is running.')
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    setBusy(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.accessToken}` },
        credentials: 'include',
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        setError(result.message || 'Could not sign out. Please try again.')
        return
      }

      setSession(null)
      setMessage('You have been signed out.')
    } catch {
      setError('Could not connect to the server. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const heading = isRegistering
    ? 'Create your account'
    : isForgotPassword
      ? 'Forgot your password?'
      : isResettingPassword
        ? 'Set a new password'
        : 'Sign in to Nexora'
  const eyebrow = isRegistering
    ? 'GET STARTED'
    : isRecoveryMode
      ? 'ACCOUNT RECOVERY'
      : 'WELCOME BACK'
  const description = isRegistering
    ? 'Set up your account in just a few steps.'
    : isForgotPassword
      ? 'Enter your account email and we will send a secure reset link.'
      : isResettingPassword
        ? 'Choose a new password for your account.'
        : 'Enter your details to access your workspace.'

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="Authentication">
        <aside className="brand-panel">
          <a className="brand" href="/" aria-label="Nexora home">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>nexora</span>
          </a>

          <div className="brand-copy">
            <span className="eyebrow">YOUR SPACE. YOUR RULES.</span>
            <h1>Everything you need, right where you belong.</h1>
            <p>
              A calmer, more secure way to manage your account and keep your
              work moving.
            </p>
          </div>

          <div className="orbit-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-core">
              <span className="orbit-core-dot" />
            </div>
            <span className="orbit-star star-one">✳</span>
            <span className="orbit-star star-two">✳</span>
            <span className="orbit-spark">+</span>
          </div>

          <div className="brand-footer">
            <span className="status-dot" />
            <span>Protected by end-to-end security</span>
          </div>
        </aside>

        <section className="form-panel">
          {session ? (
            <div className="welcome-card">
              <div className="success-icon" aria-hidden="true">✓</div>
              <span className="eyebrow">SIGNED IN</span>
              <h2>Welcome back.</h2>
              <p>
                You are signed in as <strong>{session.email}</strong>.
              </p>
              {error && <p className="form-message error-message" role="alert">{error}</p>}
              <button
                className="submit-button"
                type="button"
                onClick={handleLogout}
                disabled={busy}
              >
                {busy ? 'Signing out…' : 'Sign out'}
                {!busy && <span aria-hidden="true">↗</span>}
              </button>
            </div>
          ) : (
            <div className="form-content">
              <div className="mobile-brand">
                <span className="brand-mark" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span>nexora</span>
              </div>

              <div className="form-heading">
                <span className="eyebrow">{eyebrow}</span>
                <h2>{heading}</h2>
                <p>{description}</p>
              </div>

              {!isRecoveryMode && (
                <div className="auth-tabs" role="tablist" aria-label="Choose an action">
                  <button
                    className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
                    id="login-tab"
                    type="button"
                    role="tab"
                    aria-selected={mode === 'login'}
                    aria-controls="auth-form"
                    onClick={() => switchMode('login')}
                  >
                    Sign in
                  </button>
                  <button
                    className={mode === 'register' ? 'auth-tab active' : 'auth-tab'}
                    id="register-tab"
                    type="button"
                    role="tab"
                    aria-selected={mode === 'register'}
                    aria-controls="auth-form"
                    onClick={() => switchMode('register')}
                  >
                    Create account
                  </button>
                </div>
              )}

              <form
                id="auth-form"
                className="auth-form"
                onSubmit={handleSubmit}
                aria-labelledby={!isRecoveryMode ? (isRegistering ? 'register-tab' : 'login-tab') : undefined}
              >
                {isRegistering && (
                  <label className="field">
                    <span>Full name</span>
                    <input
                      autoComplete="name"
                      name="name"
                      placeholder="e.g. Ayesha Khan"
                      minLength={3}
                      maxLength={50}
                      required
                    />
                  </label>
                )}

                {(mode === 'login' || isRegistering || isForgotPassword) && (
                  <label className="field">
                    <span>Email address</span>
                    <input
                      autoComplete="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </label>
                )}

                {(mode === 'login' || isRegistering) && (
                  <label className="field">
                    <span>Password</span>
                    <input
                      autoComplete={isRegistering ? 'new-password' : 'current-password'}
                      name="password"
                      type="password"
                      placeholder={isRegistering ? 'At least 6 characters' : 'Enter your password'}
                      minLength={isRegistering ? 6 : undefined}
                      required
                    />
                  </label>
                )}

                {isResettingPassword && (
                  <label className="field">
                    <span>New password</span>
                    <input
                      autoComplete="new-password"
                      name="newPassword"
                      type="password"
                      placeholder="At least 6 characters"
                      minLength={6}
                      required
                    />
                  </label>
                )}

                {message && <p className="form-message success-message" role="status">{message}</p>}
                {error && <p className="form-message error-message" role="alert">{error}</p>}

                <button className="submit-button" type="submit" disabled={busy}>
                  {busy
                    ? (isRegistering ? 'Creating account…' : isForgotPassword ? 'Sending link…' : isResettingPassword ? 'Updating password…' : 'Signing in…')
                    : (isRegistering ? 'Create account' : isForgotPassword ? 'Send reset link' : isResettingPassword ? 'Update password' : 'Sign in')}
                  {!busy && <span aria-hidden="true">↗</span>}
                </button>
              </form>

              {mode === 'login' && (
                <button
                  className="text-link forgot-link"
                  type="button"
                  onClick={() => switchMode('forgot')}
                >
                  Forgot password?
                </button>
              )}
              {isRecoveryMode && (
                <button
                  className="text-link back-link"
                  type="button"
                  onClick={() => switchMode('login')}
                >
                  Back to sign in
                </button>
              )}

              <p className="legal-note">
                By continuing, you agree to our <span>Terms of Service</span> and{' '}
                <span>Privacy Policy</span>.
              </p>
            </div>
          )}
        </section>
      </section>
      <footer className="page-footer">
        <span>© 2026 Nexora</span>
        <span>Made for your peace of mind</span>
      </footer>
    </main>
  )
}

export default App
