import { useState, useEffect, useRef } from 'react'

export default function Typewriter({ text = '', speed = 50, loop = false, loopDelay = 2000, style }) {
  const [display, setDisplay] = useState('')
  const indexRef = useRef(0)
  const timeoutRef = useRef(null)

  useEffect(() => {
    setDisplay('')
    indexRef.current = 0

    const type = () => {
      if (indexRef.current < text.length) {
        setDisplay(text.slice(0, indexRef.current + 1))
        indexRef.current++
        timeoutRef.current = setTimeout(type, speed)
      } else if (loop) {
        setTimeout(() => {
          setDisplay('')
          indexRef.current = 0
        }, loopDelay)
      }
    }

    timeoutRef.current = setTimeout(type, speed)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [text, speed, loop, loopDelay])

  return (
    <span style={style}>
      {display}
      <span style={{ color: 'var(--gold)', animation: 'blink 0.8s infinite' }}>▋</span>
      <style>{`@keyframes blink { 0%, 50% { opacity: 1 } 51%, 100% { opacity: 0 } }`}</style>
    </span>
  )
}

export function AnnouncementTicker({ items = [], interval = 5000 }) {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (items.length <= 1) return
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % items.length)
        setVisible(true)
      }, 300)
    }, interval)
    return () => clearInterval(t)
  }, [items.length, interval])

  if (!items.length) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
      background: 'rgba(200,149,42,0.06)', border: '1px solid rgba(200,149,42,0.15)',
      borderRadius: 4, fontFamily: "'Source Serif 4', serif", fontSize: 13, fontStyle: 'italic', color: 'var(--text)',
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", fontStyle: 'normal', letterSpacing: 2, color: 'var(--gold)' }}>
        <span style={{ width: 6, height: 6, background: 'var(--gold)', borderRadius: '50%', display: 'inline-block', marginRight: 6 }} />
        ANNOUNCEMENT
      </span>
      <span style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s' }}>{items[idx]}</span>
    </div>
  )
}
