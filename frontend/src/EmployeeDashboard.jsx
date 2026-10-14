import { useCallback, useEffect, useState } from 'react'
import { API_URL } from './api.js'
import './EmployeeDashboard.css'

function localDateValue() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function formatWorkDate(value) {
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString()
}

function EmployeeDashboard({ session, error, busy, onLogout, onDismissError }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageError, setPageError] = useState('')
  const [success, setSuccess] = useState('')
  const [workDate, setWorkDate] = useState(localDateValue)

  const loadEntries = useCallback(async (signal) => {
    setLoading(true)
    setPageError('')
    try {
      const response = await fetch(`${API_URL}/api/user/performance`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        signal,
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not load your submitted output.')
      }
      setEntries(result.data)
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setPageError(requestError.message || 'Unable to connect to the server.')
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [session.accessToken])

  useEffect(() => {
    const controller = new AbortController()
    loadEntries(controller.signal)
    return () => controller.abort()
  }, [loadEntries])

  async function handleSubmit(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setSaving(true)
    setPageError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/api/user/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          workDate,
          quantity: Number(form.get('quantity')),
          notes: form.get('notes'),
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not save your output.')
      }
      setSuccess('Aaj ka output save ho gaya.')
      formElement.reset()
      setWorkDate(localDateValue())
      await loadEntries()
    } catch (requestError) {
      setPageError(requestError.message || 'Unable to connect to the server.')
    } finally {
      setSaving(false)
    }
  }

  const thisMonthTotal = entries.reduce((total, entry) => {
    const [year, month] = String(entry.workDate).slice(0, 10).split('-').map(Number)
    const now = new Date()
    return year === now.getFullYear() && month === now.getMonth() + 1
      ? total + Number(entry.quantity)
      : total
  }, 0)

  return (
    <main className="employee-page">
      <header className="employee-header">
        <a className="employee-brand" href="/" aria-label="Auth Operations home">
          <span className="employee-brand-mark"><i /><i /><i /></span>
          <span className="employee-brand-copy"><strong>Auth Operations</strong><small>Manage. Monitor. Operate.</small></span>
        </a>
        <div className="employee-user">
          <div className="employee-user-copy"><strong>{session.name || session.email}</strong><span>Team member</span></div>
          <button type="button" onClick={onLogout} disabled={busy}>{busy ? 'Signing out…' : 'Sign out'}</button>
        </div>
      </header>

      <div className="employee-content">
        {error && <div className="employee-alert" role="alert"><span>{error}</span><button type="button" onClick={onDismissError}>×</button></div>}
        {pageError && <div className="employee-alert" role="alert"><span>{pageError}</span><button type="button" onClick={() => loadEntries()}>Retry</button></div>}

        <div className="employee-heading">
          <span className="employee-eyebrow">YOUR WORKSPACE</span>
          <h1>Daily work output<span>.</span></h1>
          <p>Log the work you completed. Your admin can see your submitted totals.</p>
        </div>

        {success && <div className="employee-success" role="status">{success}</div>}

        <div className="employee-grid">
          <section className="output-form-card">
            <div className="output-card-heading">
              <span className="output-icon">↗</span>
              <div><h2>Submit your output</h2><p>Enter the quantity you completed.</p></div>
            </div>
            <form className="output-form" onSubmit={handleSubmit}>
              <label>
                <span>Work date</span>
                <input
                  name="workDate"
                  type="date"
                  value={workDate}
                  max={localDateValue()}
                  onChange={(event) => setWorkDate(event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Quantity completed</span>
                <input
                  name="quantity"
                  type="number"
                  min="0.01"
                  max="9999999999.99"
                  step="0.01"
                  placeholder="e.g. 25"
                  required
                />
                <small>Use the same unit for everyone (for example, orders or items).</small>
              </label>
              <label>
                <span>Note <em>Optional</em></span>
                <textarea name="notes" maxLength="250" rows="3" placeholder="Add a short note about today's work" />
              </label>
              <button className="output-submit" type="submit" disabled={saving}>
                {saving ? 'Saving output…' : 'Save daily output'}
                {!saving && <span aria-hidden="true">→</span>}
              </button>
            </form>
            <p className="output-privacy">Your entries are linked to your signed-in account and cannot be submitted for another user.</p>
          </section>

          <section className="employee-stat-card">
            <span className="employee-stat-label">THIS MONTH</span>
            <strong>{loading ? '—' : thisMonthTotal.toLocaleString()}</strong>
            <span className="employee-stat-unit">units submitted</span>
            <div className="employee-stat-divider" />
            <span className="employee-stat-label">RECENT ENTRIES</span>
            <strong className="employee-entry-count">{entries.length}</strong>
            <span className="employee-stat-unit">latest records shown</span>
          </section>
        </div>

        <section className="employee-history">
          <div className="employee-history-heading"><div><h2>My submitted output</h2><p>Your latest entries</p></div><span>Last 100 entries</span></div>
          {loading ? <p className="employee-empty">Loading your history…</p> : entries.length === 0 ? (
            <p className="employee-empty">No output submitted yet. Your first entry will show here.</p>
          ) : (
            <div className="employee-table-wrap">
              <table className="employee-table">
                <thead><tr><th>Work date</th><th>Quantity</th><th>Note</th></tr></thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatWorkDate(entry.workDate)}</td>
                      <td className="employee-quantity">{Number(entry.quantity).toLocaleString()} units</td>
                      <td>{entry.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default EmployeeDashboard
