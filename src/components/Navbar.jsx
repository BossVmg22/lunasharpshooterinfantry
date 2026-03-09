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

export default function Navbar() {
  const { user, profile, isAdmin, isStaff, isMember, signOut } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [open,     setOpen]     = useState(false)
  const [openDrop, setOpenDrop] = useState(null)

  const [unitsItems,   setUnitsItems]   = useState(DEFAULT_UNITS)
  const [manualsItems, setManualsItems] = useState(DEFAULT_MANUALS)

  const [editingItem, setEditingItem] = useState(null)
  const [editDraft,   setEditDraft]   = useState({ label: '', to: '' })
  const [addingGroup, setAddingGroup] = useState(null)
  const [addDraft,    setAddDraft]    = useState({ label: '', to: '' })

  // Fix: inject responsive styles inside component lifecycle, not at module level
  useEffect(() => {
    const id = 'lsi-nav-responsive'
    if (!document.getElementById(id)) {
      const el = document.createElement('style')
      el.id = id
      el.textContent = `
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .lsi-mobile-menu { display: none !important; }
        }
      `
      document.head.appendChild(el)
    }
    return () => {}
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    supabase.from('content').select('key,value').eq('section', 'nav').then(({ data }) => {
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

  const getItems = g  => g === 'Units' ? unitsItems : manualsItems
  const setItems = (g, v) => g === 'Units' ? setUnitsItems(v) : setManualsItems(v)
  const storeKey = g  => g === 'Units' ? 'units_dropdown' : 'manuals_dropdown'

  const handleDeleteItem = (group, idx) => {
    const updated = getItems(group).filter((_, i) => i !== idx)
    setItems(group, updated)
    persistItems(storeKey(group), updated)
  }

  const startEditItem = (group, idx) => {
    const item = getItems(group)[idx]
    setEditDraft({ label: item.label, to: item.to })
    setEditingItem({ group, idx })
  }

  const saveEditItem = () => {
    if (!editingItem) return
    const { group, idx } = editingItem
    const updated = getItems(group).map((item, i) => i === idx ? { ...editDraft } : item)
    setItems(group, updated)
    persistItems(storeKey(group), updated)
    setEditingItem(null)
  }

  const handleAddItem = (group) => {
    if (!addDraft.label || !addDraft.to) return
    const updated = [...getItems(group), { ...addDraft }]
    setItems(group, updated)
    persistItems(storeKey(group), updated)
    setAddingGroup(null)
    setAddDraft({ label: '', to: '' })
  }

  const handleSignOut = async () => { await signOut(); navigate('/') }

  const NAV_LINKS = [
    { label: 'Home',       to: '/' },
    { label: 'About',      to: '/about' },
    { label: 'Units',      to: '/brigades', children: unitsItems },
    { label: 'Operations', to: '/operations' },
    { label: 'Gallery',    to: '/gallery' },
    { label: 'Manuals',    to: '/manuals/pi', memberOnly: true, children: manualsItems },
    { label: 'Command',    to: '/command' },
    { label: 'Schedule',   to: '/schedule' },
  ]

  return (
    <>
      <nav style={styles.nav}>
        <Link to="/" style={styles.brand} onClick={() => setOpen(false)}>
          <div style={styles.emblem}>LSI</div>
          <div>
            <div style={styles.unit}>Army Combat Command</div>
            <div style={styles.name}>Luna Sharpshooters Infantry</div>
          </div>
        </Link>

        {/* Desktop links — hidden on mobile via .nav-links-desktop class */}
        <div style={styles.links} className="nav-links-desktop">
          {NAV_LINKS.map(link => {
            if (link.memberOnly && !isMember) return null
            const active = location.pathname === link.to || location.pathname.startsWith(link.to + '/')
            if (link.children) {
              const isDropOpen = openDrop === link.label
              return (
                <div key={link.label}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setOpenDrop(link.label)}
                  onMouseLeave={() => { setOpenDrop(null); setAddingGroup(null) }}
                >
                  <Link to={link.to} style={{ ...styles.link, ...(active ? styles.linkActive : {}) }}>
                    {link.label} <span style={{ fontSize: 8, color: 'var(--text-muted)', marginLeft: 2 }}>▾</span>
                    {link.memberOnly && <span style={styles.lockIcon}>🔒</span>}
                  </Link>
                  {isDropOpen && (
                    <div style={styles.dropdown}>
                      {link.children.map((c, idx) => (
                        editingItem && editingItem.group === link.label && editingItem.idx === idx ? (
                          <div key={idx} style={{ padding: '8px 12px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                            <input value={editDraft.label} onChange={e => setEditDraft(d => ({ ...d, label: e.target.value }))}
                              placeholder="Label" style={inpStyle} autoFocus />
                            <input value={editDraft.to} onChange={e => setEditDraft(d => ({ ...d, to: e.target.value }))}
                              placeholder="/path" style={{ ...inpStyle, marginTop: 4 }} />
                            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                              <button onClick={saveEditItem} style={smBtn('#c8952a', '#000')}>✓ Save</button>
                              <button onClick={() => setEditingItem(null)} style={smBtn('#333', '#ccc')}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                            <Link to={c.to} style={{ ...styles.dropItem, flex: 1, borderBottom: 'none' }}
                              onClick={() => setOpenDrop(null)}>
                              {c.label}
                            </Link>
                            {isAdmin && (
                              <div style={{ display: 'flex', gap: 2, paddingRight: 8 }}>
                                <button onClick={() => startEditItem(link.label, idx)} style={iconBtn} title="Edit">✏</button>
                                <button onClick={() => handleDeleteItem(link.label, idx)} style={{ ...iconBtn, color: '#c06060' }} title="Delete">✕</button>
                              </div>
                            )}
                          </div>
                        )
                      ))}
                      {isAdmin && (
                        addingGroup === link.label ? (
                          <div style={{ padding: '8px 12px', background: 'rgba(200,149,42,0.06)' }}>
                            <input value={addDraft.label} onChange={e => setAddDraft(d => ({ ...d, label: e.target.value }))}
                              placeholder="Label" style={inpStyle} autoFocus />
                            <input value={addDraft.to} onChange={e => setAddDraft(d => ({ ...d, to: e.target.value }))}
                              placeholder="/path (e.g. /brigades/105)" style={{ ...inpStyle, marginTop: 4 }} />
                            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                              <button onClick={() => handleAddItem(link.label)} style={smBtn('#c8952a', '#000')}>+ Add</button>
                              <button onClick={() => { setAddingGroup(null); setAddDraft({ label: '', to: '' }) }} style={smBtn('#333', '#ccc')}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setAddingGroup(link.label)}
                            style={{ width: '100%', padding: '9px 18px', background: 'transparent', border: 'none', borderTop: '1px solid var(--border)', color: 'var(--gold)', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', textAlign: 'left' }}>
                            + Add Item
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              )
            }
            return (
              <Link key={link.to} to={link.to}
                style={{ ...styles.link, ...(active ? styles.linkActive : {}) }}>
                {link.label}
              </Link>
            )
          })}
        </div>

        <div style={styles.right}>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" style={{ ...styles.pill, background: 'rgba(200,149,42,0.15)', color: 'var(--gold)', border: '1px solid var(--gold-dim)' }}>
                  ⚙ Admin
                </Link>
              )}
              <div style={styles.pill}>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{profile?.username ?? '…'}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: 1, marginLeft: 4, textTransform: 'uppercase' }}>
                  {profile?.role}
                </span>
              </div>
              <button onClick={handleSignOut} style={{ ...styles.pill, cursor: 'pointer', border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text-dim)' }}>
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login">
              <button style={styles.signInBtn}>Sign In</button>
            </Link>
          )}
          {/* Hamburger — shown on mobile via .nav-hamburger class */}
          <button
            className="nav-hamburger"
            onClick={() => setOpen(o => !o)}
            style={{ ...styles.hamburger }}
            aria-label="menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lsi-mobile-menu" style={styles.mobileMenu}>
          {NAV_LINKS.map(link => {
            if (link.memberOnly && !isMember) return (
              <div key={link.label} style={{ ...styles.mobileLink, color: 'var(--text-muted)' }}>
                {link.label} <span style={{ fontSize: 10 }}>🔒 Members only</span>
              </div>
            )
            return (
              <div key={link.label}>
                <Link to={link.to} style={styles.mobileLink} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
                {link.children?.map(c => (
                  <Link key={c.to} to={c.to}
                    style={{ ...styles.mobileLink, paddingLeft: 32, fontSize: 12, color: 'var(--text-dim)' }}
                    onClick={() => setOpen(false)}>
                    › {c.label}
                  </Link>
                ))}
              </div>
            )
          })}
          {isAdmin && (
            <Link to="/admin" style={{ ...styles.mobileLink, color: 'var(--gold)' }} onClick={() => setOpen(false)}>
              ⚙ Admin Panel
            </Link>
          )}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', marginTop: 8 }}>
            {user ? (
              <button onClick={() => { handleSignOut(); setOpen(false) }}
                style={{ background: 'none', border: '1px solid var(--border2)', color: 'var(--text-dim)', padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                Sign Out ({profile?.username})
              </button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>
                <button style={{ background: 'var(--gold)', color: '#090d09', border: 'none', padding: '8px 20px', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      )}

      {isStaff && (
        <div style={styles.editBanner}>
          ✏️ {isAdmin ? 'Admin' : 'Staff'} Mode — Click any highlighted text to edit it
        </div>
      )}
    </>
  )
}

const inpStyle = {
  width: '100%', padding: '5px 8px', background: '#0f1a0f',
  border: '1px solid var(--gold-dim)', color: '#f0ece0',
  fontSize: 11, fontFamily: 'Rajdhani, sans-serif', outline: 'none',
  boxSizing: 'border-box',
}
const smBtn = (bg, color) => ({
  padding: '4px 10px', background: bg, color, border: 'none',
  cursor: 'pointer', fontSize: 10, fontWeight: 700,
  fontFamily: 'Rajdhani, sans-serif', letterSpacing: 0.5,
})
const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--gold)', fontSize: 11, padding: '2px 4px',
  opacity: 0.8, lineHeight: 1,
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, height: 'var(--nav-h)',
    background: 'rgba(9,13,9,0.97)', backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', padding: '0 24px',
    zIndex: 1000, gap: 0,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 12, marginRight: 28, textDecoration: 'none', flexShrink: 0 },
  emblem: {
    width: 32, height: 32, border: '2px solid var(--gold-dim)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: 'var(--gold)',
  },
  unit: { fontSize: 8, letterSpacing: 3, color: 'var(--gold-dim)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 },
  name: { fontFamily: 'Bebas Neue, sans-serif', fontSize: 15, color: 'var(--bright)', letterSpacing: 2, lineHeight: 1.2 },
  links: { display: 'flex', alignItems: 'center', gap: 2, flex: 1 },
  link: {
    padding: '0 13px', height: 'var(--nav-h)',
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'var(--text-dim)', textDecoration: 'none',
    borderBottom: '2px solid transparent', transition: 'all 0.15s', whiteSpace: 'nowrap',
  },
  linkActive: { color: 'var(--gold)', borderBottomColor: 'var(--gold)' },
  lockIcon: { fontSize: 9, marginLeft: 2 },
  dropdown: {
    position: 'absolute', top: '100%', left: 0,
    background: 'var(--bg2)', border: '1px solid var(--border2)',
    borderTop: '2px solid var(--gold)', minWidth: 230, zIndex: 100,
  },
  dropItem: {
    display: 'block', padding: '11px 18px',
    fontSize: 12, fontWeight: 600, letterSpacing: 1,
    color: 'var(--text-dim)', textDecoration: 'none', transition: 'all 0.15s',
  },
  right: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 },
  pill: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, letterSpacing: 0.5, fontWeight: 600,
    padding: '4px 10px', border: '1px solid transparent',
    fontFamily: 'Rajdhani, sans-serif',
  },
  signInBtn: {
    padding: '6px 18px', background: 'var(--gold)', color: '#090d09',
    border: 'none', fontWeight: 700, fontSize: 11, letterSpacing: 2,
    cursor: 'pointer', textTransform: 'uppercase',
  },
  // Hidden by default; shown on mobile via injected CSS .nav-hamburger class
  hamburger: {
    display: 'none', background: 'none', border: 'none',
    color: 'var(--text)', fontSize: 20, cursor: 'pointer', padding: '0 4px',
    alignItems: 'center', justifyContent: 'center',
  },
  mobileMenu: {
    position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0,
    background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
    zIndex: 999, maxHeight: 'calc(100vh - var(--nav-h))', overflowY: 'auto',
  },
  mobileLink: {
    display: 'block', padding: '13px 20px',
    fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--border)',
  },
  editBanner: {
    position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0,
    background: 'rgba(200,149,42,0.12)', borderBottom: '1px solid var(--gold-dim)',
    padding: '5px 24px', fontSize: 11, color: 'var(--gold)', letterSpacing: 1,
    zIndex: 990, textAlign: 'center', fontWeight: 700,
  },
}
