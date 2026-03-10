import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const PAGES = [
  { label: 'Home',                  to: '/',                  icon: '🏠', tags: ['home','main'] },
  { label: 'About',                 to: '/about',             icon: '📋', tags: ['about','division','info'] },
  { label: 'All Brigades',          to: '/brigades',          icon: '⚔️',  tags: ['brigades','units'] },
  { label: '101st Brigade',         to: '/brigades/101',      icon: '①',  tags: ['101','brigade'] },
  { label: '102nd Brigade',         to: '/brigades/102',      icon: '②',  tags: ['102','brigade'] },
  { label: '104th Brigade',         to: '/brigades/104',      icon: '④',  tags: ['104','brigade'] },
  { label: 'Infantry Academy',      to: '/academy',           icon: '🎓', tags: ['academy','training'] },
  { label: 'Chain of Command',      to: '/command',           icon: '🎖️',  tags: ['command','coc','officers'] },
  { label: 'Schedule',              to: '/schedule',          icon: '📅', tags: ['schedule','calendar','wpi'] },
  { label: 'Operations & News',     to: '/operations',        icon: '📡', tags: ['operations','news','posts'] },
  { label: 'Gallery',               to: '/gallery',           icon: '🖼️',  tags: ['gallery','photos','images'] },
  { label: 'PI Manual',             to: '/manuals/pi',        icon: '📖', tags: ['pi','practice','inspection','manual'] },
  { label: 'Personnel Handbook',    to: '/manuals/handbook',  icon: '📗', tags: ['handbook','rules','personnel'] },
  { label: 'Uniform Regulations',   to: '/manuals/uniforms',  icon: '👔', tags: ['uniform','dress','regulations'] },
]

export default function CommandPalette() {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Press "/" or Ctrl+K to open
  useEffect(() => {
    const onKey = (e) => {
      // Don't hijack if user is typing in an input/textarea
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === '/' || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const filtered = PAGES.filter(p => {
    if (!query) return true
    const q = query.toLowerCase()
    return p.label.toLowerCase().includes(q) || p.tags.some(t => t.includes(q))
  })

  const [cursor, setCursor] = useState(0)

  // Reset cursor on query change
  useEffect(() => { setCursor(0) }, [query])

  const go = (to) => {
    navigate(to)
    setOpen(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
    if (e.key === 'Enter' && filtered[cursor]) go(filtered[cursor].to)
    if (e.key === 'Escape') setOpen(false)
  }

  if (!open) return (
    // Subtle keyboard hint in bottom-left on desktop
    <div style={{
      position: 'fixed', bottom: 24, left: 24, zIndex: 800,
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
      color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif',
      pointerEvents: 'none',
    }}
    className="desktop-only">
      <kbd style={{ padding: '2px 7px', border: '1px solid var(--border2)', background: 'var(--panel)', color: 'var(--text-dim)', fontSize: 11, fontFamily: 'inherit', borderRadius: 2 }}>/</kbd>
      <span>QUICK NAV</span>
    </div>
  )

  return (
    <>
      {/* Backdrop */}
      <div onClick={() => setOpen(false)} style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      }} />

      {/* Palette */}
      <div style={{
        position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)',
        width: 'min(580px, 92vw)', zIndex: 8001,
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderTop: '2px solid var(--gold)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
      }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '0 16px', gap: 10 }}>
          <span style={{ color: 'var(--gold-dim)', fontSize: 14 }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--bright)', fontSize: 14, fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 600, padding: '16px 0', letterSpacing: 0.5,
            }}
          />
          <kbd onClick={() => setOpen(false)} style={{ padding: '2px 7px', border: '1px solid var(--border2)', background: 'var(--panel)', color: 'var(--text-muted)', fontSize: 10, fontFamily: 'Rajdhani, sans-serif', cursor: 'pointer' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px 20px', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
              No pages found
            </div>
          ) : filtered.map((p, i) => (
            <div key={p.to}
              onClick={() => go(p.to)}
              onMouseEnter={() => setCursor(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                cursor: 'pointer', borderBottom: '1px solid var(--border)',
                background: i === cursor ? 'rgba(200,149,42,0.08)' : 'transparent',
                borderLeft: i === cursor ? '2px solid var(--gold)' : '2px solid transparent',
                transition: 'background 0.1s',
              }}>
              <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{p.icon}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: 'var(--bright)', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase' }}>
                {p.label}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>
                {p.to}
              </span>
              {i === cursor && (
                <kbd style={{ padding: '1px 6px', border: '1px solid var(--border2)', background: 'var(--panel)', color: 'var(--gold-dim)', fontSize: 9, fontFamily: 'Rajdhani, sans-serif' }}>↵</kbd>
              )}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center' }}>
          {[['↑↓','Navigate'],['↵','Go'],['Esc','Close']].map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <kbd style={{ padding: '1px 6px', border: '1px solid var(--border2)', background: 'var(--panel)', color: 'var(--text-dim)', fontSize: 9, fontFamily: 'Rajdhani, sans-serif' }}>{k}</kbd>
              <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
