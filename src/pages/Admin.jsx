import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useActivityLog } from '../lib/useActivityLog'
import Footer from '../components/Footer'

// ── Helpers ──────────────────────────────────────────────────────────────────
const ROLES      = ['member', 'staff', 'admin']
const roleColor  = { member: 'var(--text-dim)', staff: 'var(--gold)', admin: '#c06060' }
const actionIcon = {
  'edited text':    '✏️',
  'uploaded image': '🖼️',
  'changed role':   '👤',
  'created post':   '📝',
  'edited post':    '📝',
  'deleted post':   '🗑️',
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function fmtDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtMonth(key) {
  const [y, m] = key.split('-')
  return new Date(y, m - 1).toLocaleDateString([], { month: 'long', year: 'numeric' })
}

// Group flat log rows into { year → { month → { day → [rows] } } }
function groupLogs(rows) {
  const tree = {}
  rows.forEach(row => {
    const d    = new Date(row.created_at)
    const year = String(d.getFullYear())
    const month = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const day   = `${month}-${String(d.getDate()).padStart(2, '0')}`
    if (!tree[year])         tree[year]         = {}
    if (!tree[year][month])  tree[year][month]  = {}
    if (!tree[year][month][day]) tree[year][month][day] = []
    tree[year][month][day].push(row)
  })
  return tree
}

// ── Activity Log Tab ──────────────────────────────────────────────────────────
function LogTab() {
  const [logs,        setLogs]        = useState([])
  const [tree,        setTree]        = useState({})
  const [loading,     setLoading]     = useState(true)
  const [openYears,   setOpenYears]   = useState({})
  const [openMonths,  setOpenMonths]  = useState({})
  const [openDays,    setOpenDays]    = useState({})
  const [deleting,    setDeleting]    = useState(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
    setLogs(data ?? [])
    setTree(groupLogs(data ?? []))
    setLoading(false)

    // Auto-open the most recent year and month
    if (data?.length) {
      const d     = new Date(data[0].created_at)
      const year  = String(d.getFullYear())
      const month = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const day   = `${month}-${String(d.getDate()).padStart(2, '0')}`
      setOpenYears(  { [year]: true })
      setOpenMonths( { [month]: true })
      setOpenDays(   { [day]: true })
    }
  }

  const deleteRange = async (type, key) => {
    setDeleting(key)
    // Collect IDs from the already-grouped tree — avoids timezone boundary bugs
    let ids = []
    if (type === 'day') {
      ids = (tree[key.slice(0,4)]?.[key.slice(0,7)]?.[key] ?? []).map(r => r.id)
    } else if (type === 'month') {
      const days = tree[key.slice(0,4)]?.[key] ?? {}
      ids = Object.values(days).flat().map(r => r.id)
    } else if (type === 'year') {
      const months = tree[key] ?? {}
      ids = Object.values(months).flatMap(m => Object.values(m).flat()).map(r => r.id)
    }
    if (ids.length) {
      await supabase.from('activity_logs').delete().in('id', ids)
    }
    setDeleting(null)
    fetchLogs()
  }

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--gold)', fontFamily: 'Bebas Neue,sans-serif', fontSize: 20, letterSpacing: 3 }}>
      LOADING LOGS…
    </div>
  )

  if (!logs.length) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'Rajdhani,sans-serif', fontSize: 13, letterSpacing: 2 }}>
      No activity recorded yet.
    </div>
  )

  const totalCount = logs.length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 }}>
          {totalCount} total entries
        </div>
        <button onClick={() => deleteRange('year', Object.keys(tree)[0])}
          style={delBtnStyle} disabled={!!deleting}>
          🗑 Clear All
        </button>
      </div>

      {Object.keys(tree).sort((a,b) => b-a).map(year => {
        const yearOpen    = openYears[year]
        const yearMonths  = tree[year]
        const yearCount   = Object.values(yearMonths).flatMap(m => Object.values(m)).flat().length

        return (
          <div key={year} style={envelopeStyle}>
            {/* Year header */}
            <div style={envHeaderStyle} onClick={() => setOpenYears(p => ({ ...p, [year]: !p[year] }))}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, transition: 'transform 0.2s', display: 'inline-block', transform: yearOpen ? 'rotate(90deg)' : 'rotate(0)' }}>▶</span>
                <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, color: 'var(--bright)', letterSpacing: 3 }}>{year}</span>
                <span style={countBadge}>{yearCount}</span>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteRange('year', year) }}
                style={delBtnStyle} disabled={deleting === year}>
                {deleting === year ? '…' : '🗑 Delete Year'}
              </button>
            </div>

            {yearOpen && Object.keys(yearMonths).sort((a,b) => b.localeCompare(a)).map(month => {
              const monthOpen  = openMonths[month]
              const monthDays  = yearMonths[month]
              const monthCount = Object.values(monthDays).flat().length

              return (
                <div key={month} style={{ marginLeft: 16, borderLeft: '1px solid var(--border)', paddingLeft: 12, marginTop: 4 }}>
                  {/* Month header */}
                  <div style={{ ...envHeaderStyle, background: 'var(--bg2)', padding: '8px 14px' }}
                    onClick={() => setOpenMonths(p => ({ ...p, [month]: !p[month] }))}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, transition: 'transform 0.2s', display: 'inline-block', transform: monthOpen ? 'rotate(90deg)' : 'rotate(0)' }}>▶</span>
                      <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase' }}>
                        {fmtMonth(month)}
                      </span>
                      <span style={countBadge}>{monthCount}</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteRange('month', month) }}
                      style={delBtnStyle} disabled={deleting === month}>
                      {deleting === month ? '…' : '🗑 Delete Month'}
                    </button>
                  </div>

                  {monthOpen && Object.keys(monthDays).sort((a,b) => b.localeCompare(a)).map(day => {
                    const dayOpen  = openDays[day]
                    const dayRows  = monthDays[day]

                    return (
                      <div key={day} style={{ marginLeft: 16, borderLeft: '1px solid var(--border2)', paddingLeft: 12, marginTop: 4 }}>
                        {/* Day header */}
                        <div style={{ ...envHeaderStyle, background: 'transparent', padding: '6px 10px', borderBottom: '1px solid var(--border)' }}
                          onClick={() => setOpenDays(p => ({ ...p, [day]: !p[day] }))}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 10, transition: 'transform 0.2s', display: 'inline-block', transform: dayOpen ? 'rotate(90deg)' : 'rotate(0)' }}>▶</span>
                            <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12, color: 'var(--text)', letterSpacing: 1 }}>
                              {fmtDate(day)}
                            </span>
                            <span style={countBadge}>{dayRows.length}</span>
                          </div>
                          <button onClick={e => { e.stopPropagation(); deleteRange('day', day) }}
                            style={delBtnStyle} disabled={deleting === day}>
                            {deleting === day ? '…' : '🗑 Delete Day'}
                          </button>
                        </div>

                        {/* Log rows */}
                        {dayOpen && (
                          <div style={{ paddingTop: 4, paddingBottom: 8 }}>
                            {dayRows.map(row => (
                              <div key={row.id} style={logRowStyle}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>{actionIcon[row.action] ?? '📌'}</span>
                                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{row.username}</span>
                                <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{row.action}</span>
                                {row.details && (
                                  <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace', background: 'var(--bg)', padding: '1px 6px', border: '1px solid var(--border)' }}>
                                    {row.details}
                                  </span>
                                )}
                                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 10, flexShrink: 0 }}>
                                  {fmtTime(row.created_at)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function Admin() {
  const { isAdmin, profile } = useAuth()
  const { logAction }        = useActivityLog()
  const [users,    setUsers]   = useState([])
  const [loading,  setLoading] = useState(true)
  const [msg,      setMsg]     = useState('')
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    supabase.from('profiles').select('id, username, role, created_at').order('created_at')
      .then(({ data }) => { setUsers(data ?? []); setLoading(false) })
  }, [])

  const updateRole = async (u, newRole) => {
    if (u.role === newRole) return
    setMsg('')
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', u.id)
    if (error) { setMsg('Error: ' + error.message); return }
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x))
    setMsg(`${u.username} is now ${newRole}.`)
    setTimeout(() => setMsg(''), 3000)
    logAction('changed role', `${u.username} → ${newRole}`)
  }

  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <div className="page-hero-eyebrow">Admin Only</div>
                <div className="page-hero-title">Admin Panel</div>
                <div className="page-hero-sub">Manage user roles and view division activity logs.</div>
              </div>
              <div className="page-hero-meta"><strong>⚙ ADMIN</strong>Restricted</div>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 28, gap: 0 }}>
            {[['users', '👥 Users'], ['logs', '📋 Activity Log']].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                padding: '10px 24px', background: 'transparent', border: 'none',
                borderBottom: activeTab === key ? '2px solid var(--gold)' : '2px solid transparent',
                color: activeTab === key ? 'var(--gold)' : 'var(--text-dim)',
                fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12,
                letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer',
                marginBottom: -1,
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Users tab */}
          {activeTab === 'users' && (
            <div className="content-section">
              <div className="section-label">
                <span className="section-label-num">USR</span>
                <span className="section-label-title">User Management</span>
                <div className="section-label-rule"/>
              </div>
              <div className="alert">
                <p><strong style={{ color: 'var(--bright)' }}>Roles:</strong> &nbsp;
                  <span className="badge">Member</span> — view manuals &nbsp;
                  <span className="badge gold">Staff</span> — edit all page content &nbsp;
                  <span className="badge red">Admin</span> — edit content + manage users
                </p>
              </div>
              {msg && <div className="alert" style={{ marginBottom: 16 }}><p>{msg}</p></div>}
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--gold)', fontFamily: 'Bebas Neue,sans-serif', fontSize: 20, letterSpacing: 3 }}>LOADING…</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Current Role</th>
                      <th>Joined</th>
                      <th>Change Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td data-label="Username" className="td-label">{u.username}</td>
                        <td data-label="Role">
                          <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: 1, color: roleColor[u.role], textTransform: 'uppercase' }}>
                            {u.role}
                          </span>
                        </td>
                        <td data-label="Joined" style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td data-label="Change Role">
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {ROLES.map(r => (
                              <button key={r} onClick={() => updateRole(u, r)} style={{
                                padding: '4px 12px', fontSize: 10, fontWeight: 700,
                                letterSpacing: 1.5, textTransform: 'uppercase',
                                cursor: 'pointer', border: '1px solid',
                                fontFamily: 'Rajdhani,sans-serif',
                                background: u.role === r ? 'rgba(200,149,42,0.15)' : 'transparent',
                                borderColor: u.role === r ? 'var(--gold)' : 'var(--border2)',
                                color: u.role === r ? 'var(--gold)' : 'var(--text-dim)',
                              }}>
                                {r}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Logs tab */}
          {activeTab === 'logs' && (
            <div className="content-section">
              <div className="section-label">
                <span className="section-label-num">LOG</span>
                <span className="section-label-title">Activity Log</span>
                <div className="section-label-rule"/>
              </div>
              <LogTab />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const envelopeStyle = {
  border: '1px solid var(--border)',
  marginBottom: 8,
  background: 'var(--panel)',
}
const envHeaderStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 16px', cursor: 'pointer', background: 'var(--panel2)',
  userSelect: 'none',
}
const countBadge = {
  fontSize: 10, fontWeight: 700, letterSpacing: 1,
  color: 'var(--text-muted)', background: 'var(--bg)',
  border: '1px solid var(--border)', padding: '1px 7px',
}
const delBtnStyle = {
  fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '4px 10px',
  background: 'transparent', border: '1px solid var(--border2)',
  color: '#c06060', cursor: 'pointer', fontFamily: 'Rajdhani,sans-serif',
  textTransform: 'uppercase',
}
const logRowStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '6px 10px', borderBottom: '1px solid var(--border)',
  flexWrap: 'wrap',
}
