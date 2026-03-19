import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const DEFAULT_UNITS = [
  { label: 'All Brigades',     to: '/brigades' },
  { label: '101st Brigade',    to: '/brigades/101' },
  { label: '102nd Brigade',    to: '/brigades/102' },
  { label: '104th Brigade',    to: '/brigades/104' },
  { label: 'Infantry Academy', to: '/academy' },
]
const DEFAULT_MANUALS = [
  { label: 'Practice Inspection', to: '/manuals/pi' },
  { label: 'Personnel Handbook',  to: '/manuals/handbook' },
  { label: 'Uniform Regulations', to: '/manuals/uniforms' },
]

function parseItems(str, def) {
  if (!str) return def
  try { return JSON.parse(str) } catch { return def }
}

// Bottom nav tabs shown on mobile
const BOTTOM_TABS = [
  { label: 'Home',      to: '/',           icon: '🏠' },
  { label: 'About',     to: '/about',       icon: '📋' },
  { label: 'Units',     to: '/brigades',    icon: '🎖️' },
  { label: 'Ops',       to: '/operations',  icon: '⚔️' },
  { label: 'More',      to: null,           icon: '☰'  },
]

export default function Navbar() {
  const { user, profile, isAdmin, isStaff, isMember, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [openDrop,   setOpenDrop]   = useState(null)
  const [moreOpen,   setMoreOpen]   = useState(false)

  const [unitsItems,   setUnitsItems]   = useState(DEFAULT_UNITS)
  const [manualsItems, setManualsItems] = useState(DEFAULT_MANUALS)
  const [editingItem,  setEditingItem]  = useState(null)
  const [editDraft,    setEditDraft]    = useState({ label: '', to: '' })
  const [addingGroup,  setAddingGroup]  = useState(null)
  const [addDraft,     setAddDraft]     = useState({ label: '', to: '' })

  useEffect(() => { setMoreOpen(false) }, [location.pathname])

  useEffect(() => {
    supabase.from('content').select('key,value').eq('section','nav').then(({ data }) => {
      if (!data) return
      const map = Object.fromEntries(data.map(r => [r.key, r.value]))
      if (map.units_dropdown)   setUnitsItems(parseItems(map.units_dropdown,   DEFAULT_UNITS))
      if (map.manuals_dropdown) setManualsItems(parseItems(map.manuals_dropdown, DEFAULT_MANUALS))
    })
  }, [])

  const persistItems = async (key, items) => {
    await supabase.from('content').upsert(
      { section: 'nav', key, value: JSON.stringify(items), updated_at: new Date().toISOString() },
      { onConflict: 'section,key' }
    )
  }

  const getItems  = g => g === 'Units' ? unitsItems : manualsItems
  const setItems  = (g, v) => g === 'Units' ? setUnitsItems(v) : setManualsItems(v)
  const storeKey  = g => g === 'Units' ? 'units_dropdown' : 'manuals_dropdown'

  const handleDeleteItem = (group, idx) => {
    const updated = getItems(group).filter((_, i) => i !== idx)
    setItems(group, updated); persistItems(storeKey(group), updated)
  }
  const startEditItem = (group, idx) => {
    setEditDraft({ ...getItems(group)[idx] }); setEditingItem({ group, idx })
  }
  const saveEditItem = () => {
    if (!editingItem) return
    const { group, idx } = editingItem
    const updated = getItems(group).map((item, i) => i === idx ? { ...editDraft } : item)
    setItems(group, updated); persistItems(storeKey(group), updated); setEditingItem(null)
  }
  const handleAddItem = (group) => {
    if (!addDraft.label || !addDraft.to) return
    const updated = [...getItems(group), { ...addDraft }]
    setItems(group, updated); persistItems(storeKey(group), updated)
    setAddingGroup(null); setAddDraft({ label: '', to: '' })
  }
  const handleSignOut = async () => { await signOut(); navigate('/') }

  const NAV_LINKS = [
    { label: 'Home',       to: '/' },
    { label: 'About',      to: '/about' },
    { label: 'Units',      to: '/brigades',   children: unitsItems },
    { label: 'Operations', to: '/operations' },
    { label: 'Gallery',    to: '/gallery' },
    { label: 'Manuals',    to: '/manuals/pi', memberOnly: true, children: manualsItems },
    { label: 'Command',    to: '/command' },
    { label: 'Schedule',   to: '/schedule' },
  ]

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <>
      <style>{`
        :root { --bottom-nav-h: 56px; }
        @media (min-width: 901px) { :root { --bottom-nav-h: 0px; } }

        /* ── Top navbar ── */
        .lsi-topnav {
          position: fixed; top: 0; left: 0; right: 0; height: var(--nav-h);
          background: rgba(9,13,9,0.97); backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; padding: 0 20px;
          z-index: 1000; gap: 0;
        }
        .lsi-brand {
          display: flex; align-items: center; gap: 10px;
          margin-right: 20px; text-decoration: none; flex-shrink: 0;
        }
        .lsi-emblem {
          width: 30px; height: 30px; flex-shrink: 0; border: 2px solid var(--gold-dim);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif; font-size: 13px; color: var(--gold);
        }
        .lsi-brandtext .lsi-unit {
          font-size: 7px; letter-spacing: 2px; color: var(--gold-dim);
          font-weight: 700; text-transform: uppercase; line-height: 1;
        }
        .lsi-brandtext .lsi-name {
          font-family: 'Bebas Neue', sans-serif; font-size: 14px;
          color: var(--bright); letter-spacing: 1.5px; line-height: 1.2; white-space: nowrap;
        }
        .lsi-desktop-links {
          display: flex; align-items: center; gap: 0; flex: 1;
        }
        .lsi-nav-link {
          padding: 0 11px; height: var(--nav-h);
          display: flex; align-items: center; gap: 3px;
          font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
          color: var(--text-dim); text-decoration: none;
          border-bottom: 2px solid transparent; transition: all 0.15s; white-space: nowrap;
        }
        .lsi-nav-link:hover, .lsi-nav-link.active { color: var(--gold); }
        .lsi-nav-link.active { border-bottom-color: var(--gold); background: rgba(200,149,42,0.06); }
        .lsi-nav-right {
          margin-left: auto; display: flex; align-items: center; gap: 6px; flex-shrink: 0;
        }
        .lsi-pill {
          display: flex; align-items: center; gap: 4px;
          font-size: 10px; letter-spacing: 0.5px; font-weight: 600;
          padding: 4px 8px; border: 1px solid transparent;
          font-family: 'Rajdhani', sans-serif; white-space: nowrap;
        }
        .lsi-signin-btn {
          padding: 6px 14px; background: var(--gold); color: #090d09;
          border: none; font-weight: 700; font-size: 10px; letter-spacing: 1.5px;
          cursor: pointer; text-transform: uppercase; font-family: 'Rajdhani', sans-serif;
        }
        .lsi-dropdown {
          position: absolute; top: 100%; left: 0;
          background: var(--bg2); border: 1px solid var(--border2);
          border-top: 2px solid var(--gold); min-width: 220px; z-index: 100;
        }
        .lsi-drop-item {
          display: block; padding: 11px 18px;
          font-size: 12px; font-weight: 600; letter-spacing: 1px;
          color: var(--text-dim); text-decoration: none;
          border-bottom: 1px solid var(--border); transition: all 0.15s;
        }
        .lsi-drop-item:hover { color: var(--gold); background: rgba(200,149,42,0.05); }
        .lsi-edit-banner {
          position: fixed; top: var(--nav-h); left: 0; right: 0;
          background: rgba(200,149,42,0.12); border-bottom: 1px solid var(--gold-dim);
          padding: 5px 24px; font-size: 11px; color: var(--gold); letter-spacing: 1px;
          z-index: 990; text-align: center; font-weight: 700;
          font-family: 'Rajdhani', sans-serif;
        }

        /* ── Mobile bottom nav ── */
        .lsi-bottom-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; height: var(--bottom-nav-h);
          background: rgba(9,13,9,0.98); border-top: 1px solid var(--border);
          z-index: 1000; align-items: stretch;
        }
        .lsi-bottom-tab {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px;
          text-decoration: none; color: var(--text-muted);
          font-size: 9px; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; font-family: 'Rajdhani', sans-serif;
          border: none; background: none; cursor: pointer;
          transition: color 0.15s; padding: 0;
        }
        .lsi-bottom-tab.active { color: var(--gold); }
        .lsi-bottom-tab .tab-icon { font-size: 18px; line-height: 1; }

        /* More drawer — slides up from bottom */
        .lsi-more-drawer {
          display: none;
          position: fixed; bottom: var(--bottom-nav-h); left: 0; right: 0;
          background: var(--bg2); border-top: 2px solid var(--gold-dim);
          z-index: 999; max-height: 70vh; overflow-y: auto;
        }
        .lsi-more-drawer.open { display: block; }
        .lsi-drawer-link {
          display: block; padding: 13px 20px;
          font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--text); text-decoration: none; border-bottom: 1px solid var(--border);
        }
        .lsi-drawer-sublink {
          display: block; padding: 10px 20px 10px 36px;
          font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
          color: var(--text-dim); text-decoration: none; border-bottom: 1px solid var(--border);
        }

        /* ── Responsive breakpoints ── */
        @media (max-width: 900px) {
          .lsi-topnav { display: none !important; }
          .lsi-bottom-nav { display: flex !important; }
          .lsi-pill.username { display: none; }
          /* Push page content above bottom nav */
          .page-wrap { padding-bottom: var(--bottom-nav-h) !important; padding-top: 0 !important; }
        }
        @media (min-width: 901px) {
          .lsi-bottom-nav { display: none !important; }
          .lsi-more-drawer { display: none !important; }
        }
      `}</style>

      {/* ── Top navbar ── */}
      <nav className="lsi-topnav">
        <Link to="/" className="lsi-brand">
          <div className="lsi-emblem">LSI</div>
          <div className="lsi-brandtext">
            <div className="lsi-unit">Army Combat Command</div>
            <div className="lsi-name">Luna Sharpshooters Infantry</div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="lsi-desktop-links">
          {NAV_LINKS.map(link => {
            if (link.memberOnly && !isMember) return null
            const active = isActive(link.to)
            if (link.children) {
              return (
                <div key={link.label} style={{ position: 'relative' }}
                  onMouseEnter={() => setOpenDrop(link.label)}
                  onMouseLeave={() => { setOpenDrop(null); setAddingGroup(null) }}>
                  <Link to={link.to} className={`lsi-nav-link${active ? ' active' : ''}`}>
                    {link.label} <span style={{ fontSize: 8, color: 'var(--text-muted)', marginLeft: 2 }}>▾</span>
                    {link.memberOnly && <span style={{ fontSize: 9 }}>🔒</span>}
                  </Link>
                  {openDrop === link.label && (
                    <div className="lsi-dropdown">
                      {link.children.map((c, idx) => (
                        editingItem?.group === link.label && editingItem?.idx === idx ? (
                          <div key={idx} style={{ padding: '8px 12px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                            <input value={editDraft.label} onChange={e => setEditDraft(d => ({ ...d, label: e.target.value }))} placeholder="Label" style={inpStyle} autoFocus />
                            <input value={editDraft.to} onChange={e => setEditDraft(d => ({ ...d, to: e.target.value }))} placeholder="/path" style={{ ...inpStyle, marginTop: 4 }} />
                            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                              <button onClick={saveEditItem} style={smBtn('#c8952a','#000')}>✓ Save</button>
                              <button onClick={() => setEditingItem(null)} style={smBtn('#333','#ccc')}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                            <Link to={c.to} className="lsi-drop-item" style={{ flex: 1, borderBottom: 'none' }} onClick={() => setOpenDrop(null)}>{c.label}</Link>
                            {isAdmin && (
                              <div style={{ display: 'flex', gap: 2, paddingRight: 8 }}>
                                <button onClick={() => startEditItem(link.label, idx)} style={iconBtn} title="Edit">✏</button>
                                <button onClick={() => handleDeleteItem(link.label, idx)} style={{ ...iconBtn, color: '#c06060' }} title="Delete">✕</button>
                              </div>
                            )}
                          </div>
                        )
                      ))}
                      {isAdmin && (addingGroup === link.label ? (
                        <div style={{ padding: '8px 12px', background: 'rgba(200,149,42,0.06)' }}>
                          <input value={addDraft.label} onChange={e => setAddDraft(d => ({ ...d, label: e.target.value }))} placeholder="Label" style={inpStyle} autoFocus />
                          <input value={addDraft.to} onChange={e => setAddDraft(d => ({ ...d, to: e.target.value }))} placeholder="/path" style={{ ...inpStyle, marginTop: 4 }} />
                          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                            <button onClick={() => handleAddItem(link.label)} style={smBtn('#c8952a','#000')}>+ Add</button>
                            <button onClick={() => { setAddingGroup(null); setAddDraft({ label:'', to:'' }) }} style={smBtn('#333','#ccc')}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setAddingGroup(link.label)}
                          style={{ width:'100%', padding:'9px 18px', background:'transparent', border:'none', borderTop:'1px solid var(--border)', color:'var(--gold)', fontSize:11, fontWeight:700, letterSpacing:1, cursor:'pointer', textAlign:'left', fontFamily:'Rajdhani, sans-serif' }}>
                          + Add Item
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            return (
              <Link key={link.to} to={link.to} className={`lsi-nav-link${active ? ' active' : ''}`}>{link.label}</Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="lsi-nav-right">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="lsi-pill" style={{ background:'rgba(200,149,42,0.15)', color:'var(--gold)', border:'1px solid var(--gold-dim)' }}>⚙ Admin</Link>
              )}
              <div className="lsi-pill username">
                <span style={{ color:'var(--gold)', fontWeight:700 }}>{profile?.username ?? '…'}</span>
                <span style={{ color:'var(--text-muted)', fontSize:9, letterSpacing:1, marginLeft:2, textTransform:'uppercase' }}>{profile?.role}</span>
              </div>
              <button onClick={handleSignOut} className="lsi-pill" style={{ cursor:'pointer', border:'1px solid var(--border2)', background:'transparent', color:'var(--text-dim)' }}>Sign Out</button>
            </>
          ) : (
            <Link to="/login"><button className="lsi-signin-btn">Sign In</button></Link>
          )}
        </div>
      </nav>

      {/* ── Mobile bottom nav ── */}
      <nav className="lsi-bottom-nav">
        {BOTTOM_TABS.map(tab => {
          if (tab.to === null) {
            // "More" button
            return (
              <button key="more" className={`lsi-bottom-tab${moreOpen ? ' active' : ''}`} onClick={() => setMoreOpen(o => !o)}>
                <span className="tab-icon">{moreOpen ? '✕' : tab.icon}</span>
                <span>{moreOpen ? 'Close' : tab.label}</span>
              </button>
            )
          }
          const active = isActive(tab.to)
          return (
            <Link key={tab.to} to={tab.to} className={`lsi-bottom-tab${active ? ' active' : ''}`}>
              <span className="tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ── More drawer (mobile) ── */}
      <div className={`lsi-more-drawer${moreOpen ? ' open' : ''}`}>
        {/* Extra nav links not in bottom tabs */}
        {[
          { label: 'Gallery',  to: '/gallery',   icon: '🖼\uFE0F' },
          { label: 'Command',  to: '/command',   icon: '🏛\uFE0F' },
          { label: 'Schedule', to: '/schedule',  icon: '📅' },
          ...(isAdmin  ? [{ label: 'Admin Panel', to: '/admin', icon: '⚙\uFE0F' }] : []),
        ].map(item => (
          <Link key={item.to} to={item.to} className="lsi-drawer-link" onClick={() => setMoreOpen(false)}>
            {item.icon} {item.label}
          </Link>
        ))}

        {/* Units sub-links */}
        <div className="lsi-drawer-link" style={{ color: 'var(--gold-dim)', fontSize: 10, letterSpacing: 2, paddingBottom: 6 }}>UNITS</div>
        {unitsItems.map(c => (
          <Link key={c.to} to={c.to} className="lsi-drawer-sublink" onClick={() => setMoreOpen(false)}>› {c.label}</Link>
        ))}

        {/* Manuals sub-links — members only */}
        {isMember && (
          <>
            <div className="lsi-drawer-link" style={{ color: 'var(--gold-dim)', fontSize: 10, letterSpacing: 2, paddingBottom: 6 }}>📖 MANUALS</div>
            {manualsItems.map(c => (
              <Link key={c.to} to={c.to} className="lsi-drawer-sublink" onClick={() => setMoreOpen(false)}>› {c.label}</Link>
            ))}
          </>
        )}

        {/* User info / sign in */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', marginTop: 4 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 13 }}>{profile?.username}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{profile?.role}</span>
              </div>
              <button onClick={() => { handleSignOut(); setMoreOpen(false) }}
                style={{ background: 'none', border: '1px solid var(--border2)', color: 'var(--text-dim)', padding: '6px 14px', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: 'Rajdhani, sans-serif' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setMoreOpen(false)}>
              <button style={{ background: 'var(--gold)', color: '#090d09', border: 'none', padding: '8px 24px', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 1, fontFamily: 'Rajdhani, sans-serif' }}>
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>

      {isStaff && (
        <div className="lsi-edit-banner">
          ✏️ {isAdmin ? 'Admin' : 'Staff'} Mode — Click any highlighted text to edit it
        </div>
      )}
    </>
  )
}

const inpStyle = { width:'100%', padding:'5px 8px', background:'#0f1a0f', border:'1px solid var(--gold-dim)', color:'#f0ece0', fontSize:11, fontFamily:'Rajdhani, sans-serif', outline:'none', boxSizing:'border-box' }
const smBtn = (bg, color) => ({ padding:'4px 10px', background:bg, color, border:'none', cursor:'pointer', fontSize:10, fontWeight:700, fontFamily:'Rajdhani, sans-serif', letterSpacing:0.5 })
const iconBtn = { background:'none', border:'none', cursor:'pointer', color:'var(--gold)', fontSize:11, padding:'2px 4px', opacity:0.8, lineHeight:1 }
