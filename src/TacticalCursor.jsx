import { useEffect, useState, useRef } from 'react'

export default function TacticalCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)
  const [clicking, setClicking] = useState(false)
  const trailRef = useRef([])
  const frameRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = e => {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
      trailRef.current = [
        { x: e.clientX, y: e.clientY, age: 0 },
        ...trailRef.current.slice(0, 8),
      ].map(p => ({ ...p, age: (p.age || 0) + 1 }))
    }

    const handleMouseDown = () => setClicking(true)
    const handleMouseUp = () => setClicking(false)
    const handleMouseLeave = () => setVisible(false)

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    frameRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(frameRef.current)
    }
  }, [])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <>
      <style>{`
        .tactical-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 99999;
          mix-blend-mode: difference;
        }
        .tactical-crosshair {
          position: fixed;
          pointer-events: none;
          z-index: 99998;
        }
        .cursor-trail {
          position: fixed;
          pointer-events: none;
          z-index: 99997;
          width: 4px;
          height: 4px;
          background: var(--gold);
          border-radius: 50%;
          opacity: 0;
        }
      `}</style>

      {/* Cursor dot */}
      <div
        className="tactical-cursor"
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(-50%, -50%) scale(${clicking ? 0.5 : 1})`,
          transition: 'transform 0.1s ease',
          opacity: visible ? 1 : 0,
        }}
      >
        <div style={{
          width: clicking ? 6 : 8,
          height: clicking ? 6 : 8,
          background: '#c8952a',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(200, 149, 42, 0.8), 0 0 20px rgba(200, 149, 42, 0.4)',
        }} />
      </div>

      {/* Crosshair */}
      <div
        className="tactical-crosshair"
        style={{
          left: pos.x,
          top: pos.y,
          transform: 'translate(-50%, -50%)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <line x1="20" y1="0" x2="20" y2="14" stroke="#c8952a" strokeWidth="1" opacity="0.7" />
          <line x1="20" y1="26" x2="20" y2="40" stroke="#c8952a" strokeWidth="1" opacity="0.7" />
          <line x1="0" y1="20" x2="14" y2="20" stroke="#c8952a" strokeWidth="1" opacity="0.7" />
          <line x1="26" y1="20" x2="40" y2="20" stroke="#c8952a" strokeWidth="1" opacity="0.7" />
          <circle cx="20" cy="20" r="3" fill="none" stroke="#c8952a" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>

      {/* Trail */}
      {trailRef.current.slice(0, 5).map((p, i) => (
        <div
          key={i}
          className="cursor-trail"
          style={{
            left: p.x,
            top: p.y,
            transform: 'translate(-50%, -50%)',
            opacity: Math.max(0, 0.4 - i * 0.08),
            width: Math.max(2, 6 - i),
            height: Math.max(2, 6 - i),
          }}
        />
      ))}
    </>
  )
}
