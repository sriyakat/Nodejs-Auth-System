 import { useCallback, useEffect, useRef, useState } from 'react'
 import { API_URL } from './api.js'
 import './AdminDashboard.css'

 const navigation = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
   { id: 'performance', label: 'Performance', icon: 'chart' },
   { id: 'account', label: 'My account', icon: 'user' },
  { id: 'security', label: 'Security', icon: 'shield' },
]

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.6-3.2 3-5 7-5s6.4 1.8 7 5" /></>,
    shield: <><path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    arrow: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
    refresh: <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.8-2L20 12M4 12l2.6 5a7 7 0 0 0 11.8-2" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    id: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M6 16c.5-1.4 1.5-2 3-2s2.5.6 3 2m2-5h4m-4 4h4" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h17" /><path d="m7 15 4-4 3 2 5-6" /><path d="M16 7h3v3" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function getInitials(name, email) {
  const source = name || email || 'Admin'
  const initials = source.trim().split(/[\s@._-]+/).filter(Boolean).slice(0, 2)
  return initials.map((part) => part[0]).join('').toUpperCase()
}

function formatExpiry(exp) {
  if (!exp) return 'Not available'
  const date = new Date(exp * 1000)
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatWorkDate(value) {
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString()
}

function AdminDashboard({ session, error, busy, onLogout, onDismissError }) {
  const [activeSection, setActiveSection] = useState('overview')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState('')
  const [authorizationError, setAuthorizationError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [performanceLoading, setPerformanceLoading] = useState(false)
  const [performanceError, setPerformanceError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  const loadDashboard = useCallback(async (signal) => {
    setLoading(true)
    setDashboardError('')
    setAuthorizationError(false)

    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        credentials: 'include',
        signal,
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        const requestError = new Error(result.message || 'Could not load your admin profile.')
        requestError.status = response.status
        throw requestError
      }

      setProfile(result.data)
      setLastUpdated(new Date())
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setDashboardError(requestError.message || 'Unable to connect to the server.')
        setAuthorizationError(requestError.status === 401 || requestError.status === 403)
        if (requestError.status === 401 || requestError.status === 403) setProfile(null)
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [session.accessToken])

  const loadPerformance = useCallback(async (signal) => {
    setPerformanceLoading(true)
    setPerformanceError('')
    try {
      const response = await fetch(`${API_URL}/api/admin/performance`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        signal,
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        const requestError = new Error(result.message || 'Could not load employee performance.')
        requestError.status = response.status
        throw requestError
      }
      setPerformance(result.data)
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setPerformanceError(requestError.message || 'Unable to load employee performance.')
        if (requestError.status === 401 || requestError.status === 403) {
          setAuthorizationError(true)
          setProfile(null)
          setDashboardError('Your administrator access is no longer authorized.')
        }
      }
    } finally {
      if (!signal?.aborted) setPerformanceLoading(false)
    }
  }, [session.accessToken])

  useEffect(() => {
    const controller = new AbortController()
    loadDashboard(controller.signal)
    return () => controller.abort()
  }, [loadDashboard])

  useEffect(() => {
    if (activeSection !== 'performance') return undefined
    const controller = new AbortController()
    loadPerformance(controller.signal)
    return () => controller.abort()
  }, [activeSection, loadPerformance])

  useEffect(() => {
    if (!profileMenuOpen) return undefined
    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileMenuOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setProfileMenuOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileMenuOpen])

  const isAdminVerified = profile?.role?.toLowerCase() === 'admin'
  const name = profile?.name || session.name || session.email?.split('@')[0] || 'Admin'
  const initials = getInitials(profile?.name, session.email)
  const accountId = profile?.id ?? session.userId
  const roleLabel = profile?.role || (loading ? 'Verifying access…' : 'Unavailable')
  const isApiConnected = !loading && Boolean(profile) && !dashboardError
  const apiStatus = loading ? 'Checking connection' : isApiConnected ? 'Connected' : 'Unavailable'

  function navigateTo(section) {
    setActiveSection(section)
    setSidebarOpen(false)
    setProfileMenuOpen(false)
  }

  function refreshActiveSection() {
    loadDashboard()
    if (activeSection === 'performance' && isAdminVerified) loadPerformance()
  }

  return (
    <main className="admin-app">
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`admin-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <a className="admin-brand" href="/" aria-label="Auth Operations home">
          <span className="admin-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="admin-brand-copy"><strong>Auth Operations</strong><small>Manage. Monitor. Operate.</small></span>
          <button className="sidebar-close" type="button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">×</button>
        </a>

        <details className="workspace-switcher">
          <summary>
            <span className="workspace-icon">V</span>
            <span className="workspace-copy"><strong>Vertex Operations</strong><small>Current workspace</small></span>
            <span className="workspace-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="workspace-menu">
            <strong>Vertex Operations</strong>
            <span>Active workspace</span>
          </div>
        </details>

        <span className="sidebar-label">WORKSPACE</span>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navigation.filter((item) => item.id !== 'performance' || isAdminVerified).map((item) => (
            <button
              className={`admin-nav-item${activeSection === item.id ? ' active' : ''}`}
              key={item.id}
              onClick={() => navigateTo(item.id)}
              type="button"
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === 'overview' && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <span className="avatar avatar-small">{initials}</span>
            <span className="sidebar-user-copy"><strong>{name}</strong><small>{isAdminVerified ? roleLabel : loading ? roleLabel : 'Access not verified'}</small></span>
          </div>
          <button className="sidebar-logout" type="button" onClick={onLogout} disabled={busy}>
            <Icon name="logout" size={17} />
            <span>{busy ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-leading">
            <button
              className="mobile-menu-button"
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
            >
              <span /><span /><span />
            </button>
            <div className="breadcrumbs"><span>Vertex Operations</span><b>/</b><strong>{navigation.find((item) => item.id === activeSection)?.label}</strong></div>
          </div>
          <div className="topbar-actions">
            <button className="refresh-button topbar-refresh" type="button" onClick={refreshActiveSection} disabled={loading || (activeSection === 'performance' && performanceLoading)}>
              <Icon name="refresh" size={15} />
              <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
            </button>
            <span className={`secure-label${isAdminVerified ? ' session-verified' : ''}`} title={isAdminVerified ? 'Admin role confirmed by the backend' : 'Waiting for backend role verification'}>
              <span className="secure-dot" />{isAdminVerified ? 'Secure session' : loading ? 'Verifying session' : 'Session not verified'}
            </span>
            <div className="profile-menu-wrap" ref={profileMenuRef}>
              <button
                className="topbar-avatar"
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-label="Open profile menu"
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
              >
                {initials}
              </button>
              {profileMenuOpen && (
                <div className="profile-menu" role="menu">
                  <div className="profile-menu-heading"><strong>{name}</strong><span>{profile?.email || session.email}</span><small>{isAdminVerified ? roleLabel : loading ? roleLabel : 'Role unverified'}</small></div>
                  <button type="button" role="menuitem" onClick={() => navigateTo('account')}><Icon name="user" size={16} />My Account</button>
                  <button type="button" role="menuitem" onClick={() => navigateTo('security')}><Icon name="shield" size={16} />Security</button>
                  <button type="button" role="menuitem" onClick={onLogout} disabled={busy}><Icon name="logout" size={16} />{busy ? 'Signing out…' : 'Sign Out'}</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="admin-content">
          {error && (
            <div className="dashboard-alert" role="alert">
              <span>{error}</span>
              <button type="button" onClick={onDismissError} aria-label="Dismiss error">×</button>
            </div>
          )}
          {dashboardError && (
            <div className={`dashboard-alert${authorizationError ? ' authorization-alert' : ''}`} role="alert">
              <span>{authorizationError
                ? 'Your admin access could not be verified. Your role may have changed; sign out and sign in again to refresh your session.'
                : dashboardError}</span>
              {authorizationError
                ? <button type="button" onClick={onLogout} disabled={busy}>{busy ? 'Signing out…' : 'Sign out and re-login'}</button>
                : <button type="button" onClick={() => loadDashboard()} aria-label="Retry loading profile">Retry</button>}
            </div>
          )}

          {activeSection === 'overview' && (
            <>
              <div className="dashboard-heading">
                <div>
                  <div className="heading-eyebrow">AUTH OPERATIONS</div>
                  <h1>Welcome back, {name}<span className="heading-period">.</span></h1>
                  <p>Workspace / Overview</p>
                </div>
              </div>

              <section className="welcome-banner">
                <div className="banner-content">
                  <div className="banner-kicker">WORKSPACE OVERVIEW</div>
                  <h2>Your workspace at a glance</h2>
                  <p>Monitor your account, access permissions and workspace activity.</p>
                  <div className="welcome-actions">
                    {isAdminVerified && <span className="verified-admin"><Icon name="check" size={15} /> Verified administrator</span>}
                    <button className="banner-button" type="button" onClick={() => navigateTo('account')}>
                      Account details <Icon name="arrow" size={15} />
                    </button>
                  </div>
                </div>
              </section>

              <div className="section-title-row">
                <div><h2>Workspace overview</h2><p>Account, access and service status</p></div>
                {lastUpdated && <span className="updated-label">Last successful refresh · {lastUpdated.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>}
              </div>

              <div className="overview-grid">
                <article className="overview-card profile-overview">
                  <div className="card-topline"><span className="card-icon icon-lime"><Icon name="user" /></span><span className="card-overline">PROFILE</span></div>
                  {loading && !profile ? <div className="card-loading">Loading account…</div> : (
                    <div className="profile-summary">
                      <span className="avatar avatar-large">{initials}</span>
                      <div className="profile-summary-copy"><strong>{profile?.name || (dashboardError ? 'Unavailable' : 'Name unavailable')}</strong><span>{profile?.email || (dashboardError ? 'Profile could not be loaded' : session.email)}</span></div>
                    </div>
                  )}
                  <button className="card-link" type="button" onClick={() => navigateTo('account')}>Account details <span>→</span></button>
                </article>

                <article className="overview-card access-overview">
                  <div className="card-topline"><span className="card-icon icon-violet"><Icon name="shield" /></span><span className="card-overline">ACCESS LEVEL</span>{isAdminVerified && <span className="access-check"><Icon name="check" size={15} /></span>}</div>
                  <div className="access-role">{roleLabel}</div>
                  <p className="card-description">{isAdminVerified ? 'This role was confirmed by the authenticated admin API.' : authorizationError ? 'Sign in again to refresh your access.' : loading ? 'Confirming your role with the admin API.' : 'Role confirmation is not available.'}</p>
                  {isAdminVerified && <div className="access-badge"><span /> VERIFIED ROLE</div>}
                </article>

                <article className="overview-card connection-overview">
                  <div className="card-topline"><span className="card-icon icon-blue"><Icon name="lock" /></span><span className="card-overline">API CONNECTION</span></div>
                  <div className="connection-status"><span className={`connection-dot${isApiConnected ? '' : ' offline'}`} />{apiStatus}</div>
                  <p className="card-description">{dashboardError ? authorizationError ? 'The API rejected this session.' : dashboardError : profile ? 'Admin profile endpoint responded successfully.' : 'Waiting for a successful response from the admin API.'}</p>
                  <span className="endpoint-label">GET <code>/api/admin/dashboard</code></span>
                </article>
              </div>

              <section className="account-strip">
                <div className="strip-icon"><Icon name="id" size={19} /></div>
                <div className="strip-copy"><strong>Account ID</strong><span>{accountId ?? (loading ? 'Loading…' : 'Unavailable')}</span></div>
                <div className="strip-divider" />
                <div className="strip-copy"><strong>Session expires</strong><span>{formatExpiry(session.expiresAt)}</span></div>
                <button className="strip-action" type="button" onClick={() => navigateTo('security')}>Security details <span>→</span></button>
              </section>

              <div className="dashboard-footnote"><span className="footnote-icon">i</span><span>This dashboard shows account information currently available from your API.</span></div>
            </>
          )}

          {activeSection === 'account' && (
            <section className="detail-section">
              <div className="dashboard-heading">
                <div><div className="heading-eyebrow"><span className="heading-spark">✳</span> ACCOUNT SETTINGS</div><h1>My account<span className="heading-period">.</span></h1><p>Your profile information from the connected API.</p></div>
                <button className="refresh-button" type="button" onClick={() => loadDashboard()} disabled={loading}><Icon name="refresh" size={16} />{loading ? 'Refreshing…' : 'Refresh'}</button>
              </div>
              <article className="detail-card">
                <div className="detail-card-heading"><span className="avatar avatar-large">{initials}</span><div><h2>{profile?.name || name}</h2><p>{profile?.email || session.email}</p></div>{isAdminVerified && <span className="detail-role-badge">{roleLabel}</span>}</div>
                <div className="detail-fields">
                  <div className="detail-field"><span className="detail-field-icon"><Icon name="user" /></span><div><small>Full name</small><strong>{profile?.name || (loading ? 'Loading…' : 'Not available')}</strong></div></div>
                  <div className="detail-field"><span className="detail-field-icon"><Icon name="mail" /></span><div><small>Email address</small><strong>{profile?.email || session.email}</strong></div></div>
                  <div className="detail-field"><span className="detail-field-icon"><Icon name="id" /></span><div><small>Account ID</small><strong>{profile?.id ?? session.userId ?? 'Not available'}</strong></div></div>
                  <div className="detail-field"><span className="detail-field-icon"><Icon name="shield" /></span><div><small>Account role</small><strong>{roleLabel}</strong></div></div>
                </div>
              </article>
            </section>
          )}

          {activeSection === 'performance' && isAdminVerified && (
            <section className="performance-section">
              <div className="dashboard-heading">
                <div>
                  <div className="heading-eyebrow"><span className="heading-spark">✳</span> TEAM ACTIVITY</div>
                  <h1>Team performance<span className="heading-period">.</span></h1>
                  <p>Employee-submitted output totals for today and this month.</p>
                </div>
                <button className="refresh-button" type="button" onClick={() => loadPerformance()} disabled={performanceLoading}>
                  <Icon name="refresh" size={16} />
                  {performanceLoading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>

              {performanceError && (
                <div className="dashboard-alert" role="alert">
                  <span>{performanceError} If this is the first time, run the employee-output.sql database migration.</span>
                  <button type="button" onClick={() => loadPerformance()}>Retry</button>
                </div>
              )}

              <div className="performance-summary">
                <article className="performance-summary-card">
                  <span className="performance-summary-icon"><Icon name="user" /></span>
                  <div><small>TEAM MEMBERS</small><strong>{performanceLoading ? '—' : performance?.totals.users ?? 0}</strong></div>
                </article>
                <article className="performance-summary-card">
                  <span className="performance-summary-icon summary-icon-lime">↗</span>
                  <div><small>OUTPUT TODAY</small><strong>{performanceLoading ? '—' : Number(performance?.totals.todayQuantity || 0).toLocaleString()} <em>units</em></strong></div>
                </article>
                <article className="performance-summary-card">
                  <span className="performance-summary-icon summary-icon-blue"><Icon name="chart" /></span>
                  <div><small>OUTPUT THIS MONTH</small><strong>{performanceLoading ? '—' : Number(performance?.totals.monthQuantity || 0).toLocaleString()} <em>units</em></strong></div>
                </article>
              </div>

              <section className="performance-table-card">
                <div className="performance-table-heading">
                  <div><h2>Employee output</h2><p>Ranked by output submitted this month</p></div>
                  <span>{performance?.users?.length || 0} members</span>
                </div>
                {performanceLoading ? (
                  <p className="performance-empty">Loading team performance…</p>
                ) : performance?.users?.length ? (
                  <div className="performance-table-wrap">
                    <table className="performance-table">
                      <thead>
                        <tr><th>#</th><th>Team member</th><th>Role</th><th>Today</th><th>This month</th><th>All time</th><th>Last entry</th></tr>
                      </thead>
                      <tbody>
                        {performance.users.map((member, index) => (
                          <tr key={member.id}>
                            <td className="performance-rank">{String(index + 1).padStart(2, '0')}</td>
                            <td><div className="performance-member"><span className="performance-avatar">{getInitials(member.name, member.email)}</span><span><strong>{member.name || 'Unnamed user'}</strong><small>{member.email}</small></span></div></td>
                            <td><span className="performance-role">{member.role || 'User'}</span></td>
                            <td>{Number(member.todayQuantity).toLocaleString()} <small>units</small></td>
                            <td className="performance-month">{Number(member.monthQuantity).toLocaleString()} <small>units</small></td>
                            <td>{Number(member.totalQuantity).toLocaleString()} <small>units</small></td>
                            <td>{member.lastWorkDate ? formatWorkDate(member.lastWorkDate) : <span className="no-output">No entries</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="performance-empty">
                    {performanceError ? 'Performance data could not be loaded.' : 'No team member accounts were found.'}
                  </p>
                )}
                <div className="performance-table-note">Output is based on quantities submitted by each signed-in team member. All amounts use the shared unit.</div>
              </section>
            </section>
          )}

          {activeSection === 'security' && (
            <section className="detail-section">
              <div className="dashboard-heading"><div><div className="heading-eyebrow"><span className="heading-spark">✳</span> ACCOUNT PROTECTION</div><h1>Security<span className="heading-period">.</span></h1><p>Review the security details for your current session.</p></div></div>
              <article className="security-card">
                <div className="security-card-title"><span className="card-icon icon-lime"><Icon name="shield" /></span><div><h2>Session security</h2><p>Authentication is managed by your backend API.</p></div></div>
                <div className="security-row"><span>Sign-in status</span><strong className="security-active"><span />Signed in</strong></div>
                <div className="security-row"><span>Account role</span><strong>{roleLabel}</strong></div>
                <div className="security-row"><span>Access token expires</span><strong>{formatExpiry(session.expiresAt)}</strong></div>
                <div className="security-row"><span>API endpoint</span><strong className="security-endpoint">/api/admin/dashboard</strong></div>
                <button className="security-logout" type="button" onClick={onLogout} disabled={busy}><Icon name="logout" size={17} />{busy ? 'Signing out…' : 'Sign out of this session'}</button>
              </article>
              <p className="security-note"><Icon name="lock" size={15} /> Your access token is kept in memory and is not saved in browser storage.</p>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}


export default AdminDashboard
