import { useEffect, useState, useRef, useCallback, useMemo } from 'react'

export default function TacticalCursor() {
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)
  const [clicking, setClicking] = useState(false)
  const [isTouch, setIsTouch] = useState(true)
  const trailRef = useRef([])
  const frameRef = useRef(null)
  const posRef = useRef({ x: -100, y: -100 })

  useEffect(() => {
    setMounted(true)
    
    if (typeof window === 'undefined') return
    
    const touchQuery = window.matchMedia('(pointer: coarse), (hover: none)')
    setIsTouch(touchQuery.matches)
    
    if (touchQuery.matches) return

    const handleMouseMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
      trailRef.current = [
        { x: e.clientX, y: e.clientY },
        ...trailRef.current.slice(0, 8),
      ]
    }

    const handleMouseDown = () => setClicking(true)
    const handleMouseUp = () => setClicking(false)
    const handleMouseLeave = () => setVisible(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  if (!mounted || isTouch) return null

  return (
    <>
      <style>{`
        .tcursor { position: fixed; pointer-events: none; z-index: 99999; }
        .tcrosshair { position: fixed; pointer-events: none; z-index: 99998; }
        .ttrail { position: fixed; pointer-events: none; z-index: 99997; background: var(--gold); border-radius: 50%; }
      `}</style>

      <div className="tcursor" style={{
        left: pos.x, top: pos.y,
        transform: `translate(-50%, -50%) scale(${clicking ? 0.5 : 1})`,
        transition: 'transform 0.1s ease', opacity: visible ? 1 : 0,
      }}>
        <div style={{
          width: clicking ? 6 : 8, height: clicking ? 6 : 8,
          background: '#c8952a', borderRadius: '50%',
          boxShadow: '0 0 10px rgba(200, 149, 42, 0.8)',
        }} />
      </div>

      <div className="tcrosshair" style={{
        left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)',
        opacity: visible ? 1 : 0, transition: 'opacity 0.2s',
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <line x1="20" y1="0" x2="20" y2="14" stroke="#c8952a" strokeWidth="1" opacity="0.7" />
          <line x1="20" y1="26" x2="20" y2="40" stroke="#c8952a" strokeWidth="1" opacity="0.7" />
          <line x1="0" y1="20" x2="14" y2="20" stroke="#c8952a" strokeWidth="1" opacity="0.7" />
          <line x1="26" y1="20" x2="40" y2="20" stroke="#c8952a" strokeWidth="1" opacity="0.7" />
          <circle cx="20" cy="20" r="3" fill="none" stroke="#c8952a" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>

      {trailRef.current.slice(0, 5).map((p, i) => (
        <div key={i} className="ttrail" style={{
          left: p.x, top: p.y, transform: 'translate(-50%, -50%)',
          opacity: Math.max(0, 0.4 - i * 0.08),
          width: Math.max(2, 6 - i), height: Math.max(2, 6 - i),
        }} />
      ))}
    </>
  )
}
