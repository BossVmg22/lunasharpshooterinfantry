/* ═══════════════════════════════════════════════════════════════════
   FIXED TacticalCursor.jsx - Update LSI 101 v2
   Fixed SSR issue with proper useState initialization
   Fixed memory leak with trail cleanup
═══════════════════════════════════════════════════════════════════ */

import { useEffect, useState, useRef, useCallback } from 'react'

export default function TacticalCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)
  const [clicking, setClicking] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(true)
  const trailRef = useRef([])
  const frameRef = useRef(null)

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches)
  }, [])

  const handleMouseMove = useCallback((e) => {
    setPos({ x: e.clientX, y: e.clientY })
    setVisible(true)
    trailRef.current = [
      { x: e.clientX, y: e.clientY, age: 0 },
      ...trailRef.current.slice(0, 8),
    ].map(p => ({ ...p, age: (p.age || 0) + 1 }))
  }, [])

  const handleMouseDown = useCallback(() => setClicking(true), [])
  const handleMouseUp = useCallback(() => setClicking(false), [])
  const handleMouseLeave = useCallback(() => setVisible(false), [])

  useEffect(() => {
    if (isTouchDevice) return

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      trailRef.current = []
    }
  }, [isTouchDevice, handleMouseMove, handleMouseDown, handleMouseUp, handleMouseLeave])

  if (isTouchDevice) {
    return null
  }

  return (
    <>
      <style>{`
        .tactical-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 99999;
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
          background: var(--gold);
          border-radius: 50%;
          pointer-events: none;
        }
      `}</style>

      {/* Cursor dot */}
      <div
        className="tactical-cursor"
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(-50%, -50%) scale(${clicking ? 0.5 : 1})`,
          transition: clicking ? 'none' : 'transform 0.1s ease',
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

      {/* Trail dots */}
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
