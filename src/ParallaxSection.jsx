import { useRef, useState, useEffect } from 'react'

export default function ParallaxSection({
  children,
  speed = 0.3,
  direction = 'vertical',
  className,
  style,
  overlay = true,
}) {
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const elementCenter = rect.top + rect.height / 2
      const viewportCenter = windowHeight / 2
      const distance = elementCenter - viewportCenter
      setOffset(distance * speed)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  const transform =
    direction === 'vertical'
      ? `translateY(${offset}px)`
      : `translateX(${offset}px)`

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          transform,
          transition: 'transform 0.1s ease-out',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
      {overlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(9,13,9,0.3) 0%, rgba(9,13,9,0.1) 50%, rgba(9,13,9,0.3) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}

export function ParallaxImage({
  src,
  alt,
  speed = 0.2,
  style,
  overlayColor = 'rgba(9,13,9,0.4)',
}) {
  const ref = useRef(null)
  const [translateY, setTranslateY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const distanceFromCenter = rect.top + rect.height / 2 - windowHeight / 2
      setTranslateY(distanceFromCenter * speed)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: '-20%',
        overflow: 'hidden',
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '140%',
          objectFit: 'cover',
          transform: `translateY(${translateY}px)`,
          willChange: 'transform',
        }}
      />
      {overlayColor && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: overlayColor,
          }}
        />
      )}
    </div>
  )
}

export function FloatingElement({ children, intensity = 10, duration = 3 }) {
  return (
    <div
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-${intensity}px); }
        }
      `}</style>
      {children}
    </div>
  )
}

export function HoverParallax({ children, scale = 1.05 }) {
  const ref = useRef(null)
  const [transform, setTransform] = useState('')

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    setTransform(
      `perspective(1000px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) scale(${scale})`
    )
  }

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)')
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: transform ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}
