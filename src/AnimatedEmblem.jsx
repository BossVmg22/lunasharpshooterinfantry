import { useEffect, useRef, useState } from 'react'

export default function AnimatedEmblem({ size = 80, animated = true, style }) {
  const [phase, setPhase] = useState(0)
  const frameRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (!animated) return

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      setPhase((elapsed / 3000) % 1)
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [animated])

  const glowIntensity = animated ? 0.3 + Math.sin(phase * Math.PI * 2) * 0.2 : 0.3
  const rotation = animated ? Math.sin(phase * Math.PI * 2) * 3 : 0

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        filter: `drop-shadow(0 0 ${size * glowIntensity}px rgba(200, 149, 42, ${glowIntensity}))`,
        transform: `rotate(${rotation}deg)`,
        transition: animated ? 'none' : 'filter 0.3s ease',
        ...style,
      }}
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8952a" />
          <stop offset="50%" stopColor="#ecdfa0" />
          <stop offset="100%" stopColor="#c8952a" />
        </linearGradient>
        <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3e1a" />
          <stop offset="100%" stopColor="#162a16" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer ring */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Middle ring */}
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="1"
        opacity="0.5"
        strokeDasharray="4 4"
      />

      {/* Inner circle background */}
      <circle
        cx="50"
        cy="50"
        r="32"
        fill="url(#innerGradient)"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
      />

      {/* Star (Sharpshooter symbol) */}
      <polygon
        points="50,20 54,38 72,38 58,50 64,68 50,56 36,68 42,50 28,38 46,38"
        fill="url(#goldGradient)"
        filter="url(#glow)"
        opacity="0.9"
      />

      {/* Crosshairs */}
      <line x1="50" y1="8" x2="50" y2="18" stroke="#c8952a" strokeWidth="1" opacity="0.6" />
      <line x1="50" y1="82" x2="50" y2="92" stroke="#c8952a" strokeWidth="1" opacity="0.6" />
      <line x1="8" y1="50" x2="18" y2="50" stroke="#c8952a" strokeWidth="1" opacity="0.6" />
      <line x1="82" y1="50" x2="92" y2="50" stroke="#c8952a" strokeWidth="1" opacity="0.6" />

      {/* Corner accents */}
      <path d="M15 15 L25 15 L25 18 L18 18 L18 25 L15 25 Z" fill="#c8952a" opacity="0.5" />
      <path d="M85 15 L75 15 L75 18 L82 18 L82 25 L85 25 Z" fill="#c8952a" opacity="0.5" />
      <path d="M15 85 L25 85 L25 82 L18 82 L18 75 L15 75 Z" fill="#c8952a" opacity="0.5" />
      <path d="M85 85 L75 85 L75 82 L82 82 L82 75 L85 75 Z" fill="#c8952a" opacity="0.5" />

      {/* Animated pulse ring */}
      {animated && (
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#c8952a"
          strokeWidth="1"
          opacity={0.3 + Math.sin(phase * Math.PI * 2) * 0.2}
          strokeDasharray="8 8"
        />
      )}
    </svg>
  )
}

export function StaticEmblem({ size = 60, style }) {
  return <AnimatedEmblem size={size} animated={false} style={style} />
}
