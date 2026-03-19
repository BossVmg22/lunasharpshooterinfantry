import { useState, useEffect } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let ticking = false
    
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
          setProgress(Math.min(100, pct))
          setVisible(scrollTop > 300)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const circumference = 2 * Math.PI * 18

  return (
    <>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '2px',
        background: 'rgba(200,149,42,0.1)', zIndex: 999, pointerEvents: 'none',
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))',
          transition: 'width 0.1s ease-out',
        }} />
      </div>

      {visible && (
        <>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            style={{
              position: 'fixed', bottom: 24, right: 20, width: 44, height: 44,
              background: 'rgba(9,13,9,0.92)', border: '1px solid var(--gold-dim)',
              borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 998,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 10V2M2 6l4-4 4 4" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}
    </>
  )
}
