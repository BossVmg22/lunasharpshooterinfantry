/* ═══════════════════════════════════════════════════════════════════
   FIXED Typewriter.jsx - Update LSI 101 v2
   Fixed infinite loop and memory leak issues
   Added proper cleanup
═══════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useRef, useCallback } from 'react'

export default function Typewriter({
  text = '',
  speed = 50,
  delay = 0,
  cursor = true,
  cursorChar = '▋',
  loop = false,
  loopDelay = 2000,
  style,
  className,
}) {
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [started, setStarted] = useState(false)
  const indexRef = useRef(0)
  const timeoutRef = useRef(null)

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setStarted(true)
      }, delay)
    } else {
      setStarted(true)
    }

    return clearTimeout
  }, [delay, clearTimeout])

  useEffect(() => {
    if (!started || !text) return

    clearTimeout()

    const type = () => {
      if (isPaused) {
        timeoutRef.current = setTimeout(() => {
          setIsPaused(false)
          setIsDeleting(true)
        }, loopDelay)
        return
      }

      if (isDeleting) {
        if (displayText.length > 0) {
          timeoutRef.current = setTimeout(() => {
            setDisplayText(displayText.slice(0, -1))
          }, speed / 2)
        } else {
          setIsDeleting(false)
          if (loop) {
            setIsPaused(true)
            indexRef.current = 0
          }
        }
      } else {
        if (indexRef.current < text.length) {
          timeoutRef.current = setTimeout(() => {
            const newText = text.slice(0, indexRef.current + 1)
            setDisplayText(newText)
            indexRef.current++
          }, speed)
        } else if (loop) {
          timeoutRef.current = setTimeout(() => {
            setIsPaused(true)
          }, loopDelay)
        }
      }
    }

    timeoutRef.current = setTimeout(type, started ? speed : 0)

    return clearTimeout
  }, [displayText, isDeleting, isPaused, text, speed, loop, loopDelay, started, clearTimeout])

  useEffect(() => {
    return clearTimeout
  }, [clearTimeout])

  const handleReset = useCallback(() => {
    setDisplayText('')
    indexRef.current = 0
    setIsDeleting(false)
    setIsPaused(false)
  }, [])

  return (
    <span className={className} style={style}>
      <span>{displayText}</span>
      {cursor && (
        <span
          style={{
            animation: 'blink 0.8s infinite',
            color: 'var(--gold)',
            marginLeft: '1px',
          }}
        >
          {cursorChar}
        </span>
      )}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  )
}

export function AnnouncementTicker({ items = [], interval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [displayText, setDisplayText] = useState('')
  const timeoutRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (items.length === 0) return
    
    setDisplayText(items[currentIndex] || '')

    const rotateAnnouncement = () => {
      setIsVisible(false)
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % items.length)
        setIsVisible(true)
      }, 300)
    }

    intervalRef.current = setInterval(rotateAnnouncement, interval)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [items.length, interval])

  useEffect(() => {
    setDisplayText(items[currentIndex] || '')
  }, [currentIndex, items])

  if (items.length === 0) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        background: 'rgba(200,149,42,0.06)',
        border: '1px solid rgba(200,149,42,0.15)',
        borderRadius: '4px',
        fontFamily: "'Source Serif 4', serif",
        fontSize: '13px',
        fontStyle: 'italic',
        color: 'var(--text)',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          fontFamily: "'Rajdhani', sans-serif",
          fontStyle: 'normal',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--gold)',
            animation: 'blink 1s infinite',
          }}
        />
        ANNOUNCEMENT
      </span>
      <span
        style={{
          flex: 1,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {displayText}
      </span>
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
