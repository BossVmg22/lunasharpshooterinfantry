/* ═══════════════════════════════════════════════════════════════════
   FIXED ParticleGrid.jsx - Update LSI 101 v2
   Fixed memory leaks with proper cleanup
   Optimized performance with throttled resize
═══════════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useCallback } from 'react'

export default function ParticleGrid() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const particlesRef = useRef([])
  const animationRef = useRef(null)
  const resizeTimeoutRef = useRef(null)

  const initParticles = useCallback((width, height) => {
    const count = Math.min(80, Math.floor((width * height) / 15000))
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0

    const resize = () => {
      if (resizeTimeoutRef.current) {
        cancelAnimationFrame(resizeTimeoutRef.current)
      }
      resizeTimeoutRef.current = requestAnimationFrame(() => {
        width = canvas.width = canvas.offsetWidth
        height = canvas.height = canvas.offsetHeight
        if (width > 0 && height > 0) {
          initParticles(width, height)
        }
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      particlesRef.current.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        const dx = mouseRef.current.x - p.x
        const dy = mouseRef.current.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120
          p.x -= (dx / dist) * force * 2
          p.y -= (dy / dist) * force * 2
          p.opacity = Math.min(1, p.opacity + force * 0.3)
        } else {
          p.opacity = Math.max(0.2, p.opacity - 0.01)
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 149, 42, ${p.opacity})`
        ctx.fill()

        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j]
          const dx2 = p2.x - p.x
          const dy2 = p2.y - p.y
          const d = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          if (d < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(200, 149, 42, ${(100 - d) / 300})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (resizeTimeoutRef.current) {
        cancelAnimationFrame(resizeTimeoutRef.current)
      }
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [initParticles])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.6,
        pointerEvents: 'none',
      }}
    />
  )
}
