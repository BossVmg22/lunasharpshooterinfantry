import { useState, useEffect } from 'react'

export default function MilitaryStatusBar() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = () => time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const formatDate = () => time.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()

  return (
    <div style={{
      position: 'fixed', top: 'var(--nav-h, 56px)', left: 0, right: 0,
      background: 'rgba(200,149,42,0.05)', borderBottom: '1px solid rgba(200,149,42,0.15)',
      padding: '6px 40px', fontFamily: "'Rajdhani', sans-serif",
      fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
      zIndex: 998, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, background: '#6ab46a', borderRadius: '50%' }} />
          <span>UNCLASSIFIED</span>
        </div>
        <span style={{ color: 'var(--gold)' }}>STATUS:</span>
        <span style={{ color: '#6ab46a' }}>OPERATIONAL</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: 'var(--gold)' }}>{formatTime()}</span>
        <span style={{ color: 'var(--text-muted)' }}>{formatDate()}</span>
      </div>
    </div>
  )
}
