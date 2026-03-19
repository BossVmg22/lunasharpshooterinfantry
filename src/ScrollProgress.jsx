import { useState, useEffect } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [showIndicator, setShowIndicator] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(Math.min(100, scrollPercent))
      
      if (scrollTop > 400) {
        setShowIndicator(false)
      } else {
        setShowIndicator(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <style>{`
        @keyframes progressPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
      
      {/* Top progress bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'rgba(200,149,42,0.1)',
        zIndex: 9999,
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--gold-dim), var(--gold), var(--gold-pale))',
          transition: 'width 0.1s ease-out',
          boxShadow: '0 0 10px rgba(200, 149, 42, 0.5)',
        }} />
      </div>

      {/* Side indicator (shows when scrolled) */}
      {!showIndicator && (
        <div style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '1px solid var(--gold-dim)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(9,13,9,0.9)',
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '12px',
              color: 'var(--gold)',
              letterSpacing: '1px',
            }}>
              {Math.round(progress)}%
            </span>
          </div>
          
          {/* Vertical progress track */}
          <div style={{
            width: '2px',
            height: '60px',
            background: 'rgba(200,149,42,0.2)',
            borderRadius: '1px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${progress}%`,
              background: 'var(--gold)',
              transition: 'height 0.1s ease-out',
              boxShadow: '0 0 8px rgba(200, 149, 42, 0.6)',
            }} />
          </div>
          
          {/* Scroll indicator text */}
          <span style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '8px',
            color: 'var(--text-muted)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}>
            Scroll
          </span>
        </div>
      )}

      {/* Jump to top button */}
      {!showIndicator && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '30px',
            width: '44px',
            height: '44px',
            border: '1px solid var(--gold-dim)',
            borderRadius: '4px',
            background: 'rgba(9,13,9,0.9)',
            backdropFilter: 'blur(10px)',
            color: 'var(--gold)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            zIndex: 9997,
            transition: 'all 0.2s ease',
            opacity: 0.8,
          }}
          onMouseEnter={e => {
            e.target.style.background = 'rgba(200,149,42,0.15)'
            e.target.style.opacity = 1
          }}
          onMouseLeave={e => {
            e.target.style.background = 'rgba(9,13,9,0.9)'
            e.target.style.opacity = 0.8
          }}
        >
          ↑
        </button>
      )}
    </>
  )
}
