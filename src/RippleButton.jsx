import { useState, useRef } from 'react'

export default function RippleButton({ children, variant = 'primary', onClick, disabled, style, className, ...props }) {
  const [ripples, setRipples] = useState([])
  const buttonRef = useRef(null)

  const handleClick = (e) => {
    if (disabled) return

    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size: Math.max(rect.width, rect.height),
    }

    setRipples(prev => [...prev, newRipple])

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)

    if (onClick) onClick(e)
  }

  const variants = {
    primary: {
      background: 'var(--gold)',
      color: '#090d09',
      border: 'none',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text)',
      border: '1px solid var(--border2)',
    },
    ghostGold: {
      background: 'rgba(200,149,42,0.04)',
      color: 'var(--gold)',
      border: '1px solid var(--gold-dim)',
    },
    danger: {
      background: 'transparent',
      color: '#c06060',
      border: '1px solid rgba(192,96,96,0.4)',
    },
  }

  const v = variants[variant] || variants.primary

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: variant === 'primary' ? '12px 26px' : '11px 24px',
        background: v.background,
        color: v.color,
        border: v.border,
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Rajdhani', sans-serif",
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          if (variant === 'primary') {
            e.target.style.background = 'var(--gold-pale)'
            e.target.style.transform = 'translateY(-1px)'
            e.target.style.boxShadow = '0 4px 16px rgba(200,149,42,0.3)'
          } else if (variant === 'ghostGold') {
            e.target.style.background = 'rgba(200,149,42,0.1)'
            e.target.style.borderColor = 'var(--gold)'
          } else if (variant === 'ghost') {
            e.target.style.borderColor = 'var(--gold-dim)'
            e.target.style.color = 'var(--gold)'
          }
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          if (variant === 'primary') {
            e.target.style.background = 'var(--gold)'
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = 'none'
          } else if (variant === 'ghostGold') {
            e.target.style.background = 'rgba(200,149,42,0.04)'
            e.target.style.borderColor = 'var(--gold-dim)'
          } else if (variant === 'ghost') {
            e.target.style.borderColor = 'var(--border2)'
            e.target.style.color = 'var(--text)'
          }
        }
      }}
      onMouseDown={e => {
        if (!disabled) {
          e.target.style.transform = 'scale(0.98)'
        }
      }}
      onMouseUp={e => {
        if (!disabled) {
          e.target.style.transform = 'translateY(0)'
        }
      }}
      {...props}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            width: ripple.size,
            height: ripple.size,
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            animation: 'rippleEffect 0.6s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      ))}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      
      <style>{`
        @keyframes rippleEffect {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  )
}
