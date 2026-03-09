import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/Footer'

export default function Admin() {
  const { isAdmin } = useAuth()
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [msg,     setMsg]     = useState('')

  useEffect(() => {
    supabase.from('profiles').select('id, username, role, created_at').order('created_at')
      .then(({ data }) => { setUsers(data ?? []); setLoading(false) })
  }, [])

  const updateRole = async (id, role) => {
    setMsg('')
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) { setMsg('Error: ' + error.message); return }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    setMsg('Role updated successfully.')
    setTimeout(() => setMsg(''), 3000)
  }

  const ROLES = ['member', 'staff', 'admin']
  const roleColor = { member:'var(--text-dim)', staff:'var(--gold)', admin:'#c06060' }

  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <div className="page-hero-eyebrow">Admin Only</div>
                <div className="page-hero-title">Admin Panel</div>
                <div className="page-hero-sub">Manage user roles and division access. Admins can promote members to Staff or Admin.</div>
              </div>
              <div className="page-hero-meta"><strong>⚙ ADMIN</strong>Restricted</div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="content-section">
            <div className="section-label">
              <span className="section-label-num">USR</span>
              <span className="section-label-title">User Management</span>
              <div className="section-label-rule"/>
            </div>

            <div className="alert">
              <p><strong style={{color:'var(--bright)'}}>Roles:</strong> &nbsp;
                <span className="badge">Member</span> — view manuals &nbsp;
                <span className="badge gold">Staff</span> — edit all page content &nbsp;
                <span className="badge red">Admin</span> — edit content + manage users
              </p>
            </div>

            {msg && <div className="alert" style={{ marginBottom:16 }}><p>{msg}</p></div>}

            {loading ? (
              <div style={{ padding:40, textAlign:'center', color:'var(--gold)', fontFamily:'Bebas Neue,sans-serif', fontSize:20, letterSpacing:3 }}>LOADING…</div>
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
                        <span style={{ fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:12, letterSpacing:1, color: roleColor[u.role], textTransform:'uppercase' }}>
                          {u.role}
                        </span>
                      </td>
                      <td data-label="Joined" style={{ fontSize:12, color:'var(--text-dim)' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td data-label="Change Role">
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                          {ROLES.map(r => (
                            <button key={r} onClick={() => updateRole(u.id, r)}
                              style={{
                                padding:'4px 12px', fontSize:10, fontWeight:700,
                                letterSpacing:1.5, textTransform:'uppercase',
                                cursor:'pointer', border:'1px solid',
                                fontFamily:'Rajdhani,sans-serif',
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
        </div>
      </div>
      <Footer/>
    </>
  )
}
