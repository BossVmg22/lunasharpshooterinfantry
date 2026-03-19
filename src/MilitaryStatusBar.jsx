/* ═══════════════════════════════════════════════════════════════════
   FIXED MilitaryStatusBar.jsx - Update LSI 101 v2
   Fixed z-index to work with navbar (nav height = 56px)
   Optimized ticker animation
═══════════════════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react'

export default function MilitaryStatusBar() {
  const [time, setTime] = useState(new Date())
  const [status, setStatus] = useState('OPERATIONAL')

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date()
      setTime(now)
      const hour = now.getHours()
      if (hour >= 8 && hour < 17) {
        setStatus('ACTIVE DUTY HOURS')
      } else if (hour >= 17 && hour < 22) {
        setStatus('EXTENDED OPS')
      } else {
        setStatus('STAND-BY MODE')
      }
    }

    updateStatus()
    const timer = setInterval(updateStatus, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = () => {
    return time.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatDate = () => {
    return time.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).toUpperCase()
  }

  const getTimezone = () => {
    const offset = -time.getTimezoneOffset()
    const hours = Math.floor(Math.abs(offset) / 60)
    const sign = offset >= 0 ? '+' : '-'
    return `GMT${sign}${hours}`
  }

  return (
    <div style={{
      position: 'fixed',
      top: 'var(--nav-h, 56px)',
      left: 0,
      right: 0,
      background: 'linear-gradient(90deg, rgba(200,149,42,0.08) 0%, rgba(200,149,42,0.03) 50%, rgba(200,149,42,0.08) 100%)',
      borderBottom: '1px solid rgba(200,149,42,0.15)',
      padding: '6px 0',
      fontFamily: "'Rajdhani', sans-serif",
      fontSize: '11px',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      overflow: 'hidden',
      zIndex: 998,
    }}>
      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes scrollTicker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
      }}>
        {/* Left: Classification & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--gold)',
            fontWeight: 700,
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              background: '#6ab46a',
              borderRadius: '50%',
              animation: 'statusPulse 2s ease-in-out infinite',
              boxShadow: '0 0 8px rgba(106, 180, 106, 0.8)',
            }} />
            UNCLASSIFIED
          </div>

          <div style={{
            width: '1px',
            height: '12px',
            background: 'rgba(200,149,42,0.3)',
          }} />

          <div style={{
            color: 'var(--text-dim)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{
              color: 'var(--gold)',
              fontWeight: 700,
            }}>STATUS:</span>
            <span style={{
              color: '#6ab46a',
              animation: 'statusPulse 3s ease-in-out infinite',
            }}>{status}</span>
          </div>
        </div>

        {/* Center: Scrolling ticker */}
        <div style={{
          flex: 1,
          maxWidth: '400px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            whiteSpace: 'nowrap',
            color: 'var(--text-muted)',
            fontSize: '10px',
            animation: 'scrollTicker 30s linear infinite',
          }}>
            ⚡ LSI PORTAL v2.0 ⚡ ALL SYSTEMS NOMINAL ⚡ SECURE CONNECTION ⚡ 
            MAINTAIN VIGILANCE ⚡ DISCIPLINE IS STRENGTH ⚡ ONWARD SHARPSHOOTERS ⚡
          </div>
        </div>

        {/* Right: Time Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-dim)',
          }}>
            <span style={{ 
              fontSize: '16px', 
              fontFamily: "'Bebas Neue', sans-serif", 
              color: 'var(--gold)', 
              letterSpacing: '1px' 
            }}>
              {formatTime()}
            </span>
            <span style={{
              fontSize: '9px',
              color: 'var(--gold-dim)',
              borderLeft: '1px solid rgba(200,149,42,0.3)',
              paddingLeft: '8px',
            }}>
              {getTimezone()}
            </span>
          </div>

          <div style={{
            width: '1px',
            height: '12px',
            background: 'rgba(200,149,42,0.3)',
          }} />

          <div style={{
            color: 'var(--text-muted)',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '1px',
          }}>
            {formatDate()}
          </div>
        </div>
      </div>
    </div>
  )
}
