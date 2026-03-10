import { Link, useLocation } from 'react-router-dom'

const LABEL_MAP = {
  '':          'Home',
  'about':     'About',
  'brigades':  'Brigades',
  'academy':   'Infantry Academy',
  'command':   'Chain of Command',
  'schedule':  'Schedule',
  'operations':'Operations',
  'gallery':   'Gallery',
  'manuals':   'Manuals',
  'pi':        'PI Manual',
  'handbook':  'Handbook',
  'uniforms':  'Uniforms',
  'login':     'Sign In',
  'admin':     'Admin',
  'new':       'New Post',
  'edit':      'Edit Post',
}

export default function Breadcrumb() {
  const { pathname } = useLocation()
  if (pathname === '/') return null

  const parts = pathname.split('/').filter(Boolean)

  const crumbs = [
    { label: 'Home', to: '/' },
    ...parts.map((p, i) => ({
      label: LABEL_MAP[p] ?? p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      to: '/' + parts.slice(0, i + 1).join('/'),
    })),
  ]

  return (
    <nav
      className="breadcrumb-desktop"
      aria-label="Breadcrumb"
      style={{
        position: 'fixed',
        top: 'var(--nav-h)',
        left: 0, right: 0,
        height: 28,
        background: 'rgba(9,13,9,0.90)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        zIndex: 995,
        gap: 6,
        backdropFilter: 'blur(6px)',
      }}>
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={c.to} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!isLast ? (
              <Link to={c.to} style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 2,
                color: 'var(--text-muted)', textTransform: 'uppercase',
                textDecoration: 'none', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--gold-dim)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
              >{c.label}</Link>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase' }}>
                {c.label}
              </span>
            )}
            {!isLast && <span style={{ fontSize: 8, color: 'var(--border2)' }}>›</span>}
          </span>
        )
      })}
    </nav>
  )
}
