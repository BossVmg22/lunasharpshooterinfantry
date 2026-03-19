/* ═══════════════════════════════════════════════════════════════════
   FIXED ScrollProgress.jsx - Update LSI 101 v2
   Now includes BackToTop functionality (removed duplicate)
   Fixed z-index conflicts with navbar
═══════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useCallback } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [showIndicator, setShowIndicator] = useState(false)

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
    setProgress(Math.min(100, scrollPercent))
    setShowIndicator(scrollTop > 300)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const circumference = 2 * Math.PI * 18

  return (
    <>
      <style>{`
        @keyframes progressPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
      
      {/* Top progress bar - positioned below navbar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'rgba(200,149,42,0.1)',
        zIndex: 999,
        pointerEvents: 'none',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--gold-dim), var(--gold), var(--gold-pale))',
          transition: 'width 0.1s ease-out',
          boxShadow: '0 0 8px rgba(200, 149, 42, 0.6)',
        }} />
      </div>

      {/* Side indicator - only shows when scrolled */}
      {showIndicator && (
        <div style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 998,
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

      {/* Jump to top button - with circular progress indicator */}
      {showIndicator && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '20px',
            width: '44px',
            height: '44px',
            border: '1px solid var(--gold-dim)',
            borderRadius: '4px',
            background: 'rgba(9,13,9,0.92)',
            backdropFilter: 'blur(10px)',
            color: 'var(--gold)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 998,
            transition: 'all 0.2s ease',
            opacity: 0.9,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(200,149,42,0.15)'
            e.currentTarget.style.opacity = 1
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(9,13,9,0.92)'
            e.currentTarget.style.opacity = 0.9
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {/* Circular SVG progress ring */}
          <svg 
            width="44" 
            height="44" 
            style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
          >
            <circle 
              cx="22" 
              cy="22" 
              r={18} 
              fill="none" 
              stroke="var(--border)" 
              strokeWidth="1.5" 
            />
            <circle
              cx="22"
              cy="22"
              r={18}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="1.5"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * progress) / 100}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
          
          {/* Arrow icon */}
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none" 
            style={{ position: 'relative', zIndex: 1 }}
          >
            <path 
              d="M6 10V2M2 6l4-4 4 4" 
              stroke="var(--gold)" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </>
  )
}
