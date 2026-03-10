import { useState, useEffect } from 'react'

/**
 * Sticky back-to-top button + scroll progress bar.
 * Appears after scrolling 300px. Works on both mobile and desktop.
 */
export default function BackToTop() {
  const [visible,  setVisible]  = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const total    = document.documentElement.scrollHeight - window.innerHeight
      setVisible(scrolled > 300)
      setProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  // Circumference of the SVG circle
  const r   = 18
  const circ = 2 * Math.PI * r

  return (
    <>
      {/* Scroll progress bar — thin gold line at top of viewport */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0,
        height: 2,
        width: `${progress}%`,
        background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))',
        zIndex: 9998,
        transition: 'width 0.1s linear',
        pointerEvents: 'none',
      }} />

      {/* Back-to-top button */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        style={{
          position:   'fixed',
          bottom:     24,
          right:      24,
          width:      44,
          height:     44,
          background: 'rgba(9,13,9,0.92)',
          border:     '1px solid var(--gold-dim)',
          cursor:     'pointer',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex:     900,
          backdropFilter: 'blur(8px)',
          opacity:    visible ? 1 : 0,
          transform:  visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        {/* Circular SVG progress ring */}
        <svg width="44" height="44" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border)" strokeWidth="1.5" />
          {/* Progress arc */}
          <circle
            cx="22" cy="22" r={r}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.5"
            strokeDasharray={circ}
            strokeDashoffset={circ - (circ * progress) / 100}
            strokeLinecap="butt"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
        {/* Arrow icon */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position: 'relative', zIndex: 1 }}>
          <path d="M6 10V2M2 6l4-4 4 4" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </>
  )
}
