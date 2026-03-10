import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * ImageCropper — drag to pan, pinch/scroll to zoom, drag corners to resize crop box.
 * Pure canvas — zero external dependencies.
 * Props:
 *   src        — blob URL of the selected image
 *   aspect     — forced aspect ratio (e.g. 16/9, 1, 2.5) or null for free crop
 *   onConfirm  — (blob) => void  called with the cropped image as a Blob
 *   onCancel   — () => void
 */
export default function ImageCropper({ src, aspect = null, onConfirm, onCancel }) {
  const canvasRef   = useRef()
  const imgRef      = useRef(new Image())
  const stateRef    = useRef({
    // Image pan/zoom
    imgX: 0, imgY: 0, imgScale: 1,
    // Crop box (in canvas coords)
    cropX: 0, cropY: 0, cropW: 200, cropH: 200,
    // Drag state
    dragging: null, // 'image' | 'crop' | 'tl'|'tr'|'bl'|'br'|'t'|'b'|'l'|'r'
    dragStartX: 0, dragStartY: 0,
    dragStartImgX: 0, dragStartImgY: 0,
    dragStartCrop: null,
    // Canvas size
    cw: 0, ch: 0,
  })
  const [ready,       setReady]       = useState(false)
  const [outputSize,  setOutputSize]  = useState({ w: 0, h: 0 })
  const rafRef  = useRef()
  const pinchRef = useRef(null) // { dist, imgScale, imgX, imgY }

  // ── Init ───────────────────────────────────────────────────────
  useEffect(() => {
    const img = imgRef.current
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const cw = canvas.width  = canvas.offsetWidth
      const ch = canvas.height = canvas.offsetHeight
      const s  = stateRef.current

      // Fit image to canvas
      const scale = Math.min(cw / img.width, ch / img.height) * 0.85
      s.imgScale = scale
      s.imgX = (cw - img.width  * scale) / 2
      s.imgY = (ch - img.height * scale) / 2

      // Initial crop = 80% of the fitted image area, centered
      const iw = img.width  * scale
      const ih = img.height * scale
      let cropW, cropH
      if (aspect) {
        cropW = Math.min(iw * 0.9, ih * 0.9 * aspect)
        cropH = cropW / aspect
      } else {
        cropW = iw * 0.8
        cropH = ih * 0.8
      }
      s.cropX = s.imgX + (iw - cropW) / 2
      s.cropY = s.imgY + (ih - cropH) / 2
      s.cropW = cropW
      s.cropH = cropH
      s.cw = cw
      s.ch = ch

      setOutputSize({ w: Math.round(cropW / scale * img.width / iw * img.width / img.width * img.width / scale * scale), h: 0 })
      updateOutput()
      setReady(true)
      draw()
    }
    img.src = src
  }, [src])

  const updateOutput = () => {
    const s   = stateRef.current
    const img = imgRef.current
    if (!img.width) return
    // Crop in image-space pixels
    const ix = (s.cropX - s.imgX) / s.imgScale
    const iy = (s.cropY - s.imgY) / s.imgScale
    const iw = s.cropW / s.imgScale
    const ih = s.cropH / s.imgScale
    setOutputSize({ w: Math.round(Math.max(iw, 1)), h: Math.round(Math.max(ih, 1)) })
  }

  // ── Draw ───────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const img = imgRef.current
    const s   = stateRef.current
    const { cw, ch, imgX, imgY, imgScale, cropX, cropY, cropW, cropH } = s

    ctx.clearRect(0, 0, cw, ch)

    // Draw image
    ctx.save()
    ctx.drawImage(img, imgX, imgY, img.width * imgScale, img.height * imgScale)
    ctx.restore()

    // Dark overlay outside crop
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, cw, ch)
    ctx.clearRect(cropX, cropY, cropW, cropH)
    ctx.restore()

    // Redraw image inside crop area (crisp)
    ctx.save()
    ctx.beginPath()
    ctx.rect(cropX, cropY, cropW, cropH)
    ctx.clip()
    ctx.drawImage(img, imgX, imgY, img.width * imgScale, img.height * imgScale)
    ctx.restore()

    // Crop border
    ctx.save()
    ctx.strokeStyle = '#C8952A'
    ctx.lineWidth   = 1.5
    ctx.strokeRect(cropX, cropY, cropW, cropH)
    ctx.restore()

    // Rule of thirds grid
    ctx.save()
    ctx.strokeStyle = 'rgba(200,149,42,0.25)'
    ctx.lineWidth   = 0.5
    for (let i = 1; i <= 2; i++) {
      const x = cropX + (cropW / 3) * i
      const y = cropY + (cropH / 3) * i
      ctx.beginPath(); ctx.moveTo(x, cropY); ctx.lineTo(x, cropY + cropH); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cropX, y); ctx.lineTo(cropX + cropW, y); ctx.stroke()
    }
    ctx.restore()

    // Corner + edge handles
    const handles = getHandles(s)
    handles.forEach(h => {
      ctx.save()
      ctx.fillStyle   = '#C8952A'
      ctx.strokeStyle = '#090d09'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.arc(h.x, h.y, h.corner ? 6 : 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    })
  }, [])

  const getHandles = (s) => {
    const { cropX: x, cropY: y, cropW: w, cropH: h } = s
    const mx = x + w / 2, my = y + h / 2
    return [
      { id: 'tl', x, y,         corner: true },
      { id: 'tr', x: x+w, y,   corner: true },
      { id: 'bl', x, y: y+h,   corner: true },
      { id: 'br', x: x+w, y: y+h, corner: true },
      { id: 't',  x: mx, y,    corner: false },
      { id: 'b',  x: mx, y: y+h, corner: false },
      { id: 'l',  x, y: my,    corner: false },
      { id: 'r',  x: x+w, y: my, corner: false },
    ]
  }

  const hitHandle = (x, y, s) => {
    const handles = getHandles(s)
    for (const h of handles) {
      if (Math.hypot(x - h.x, y - h.y) < 12) return h.id
    }
    return null
  }

  const inCrop = (x, y, s) => {
    return x >= s.cropX && x <= s.cropX + s.cropW && y >= s.cropY && y <= s.cropY + s.cropH
  }

  // ── Clamp crop to image bounds ─────────────────────────────────
  const clampCrop = (s) => {
    const img = imgRef.current
    const imgLeft  = s.imgX
    const imgTop   = s.imgY
    const imgRight = s.imgX + img.width  * s.imgScale
    const imgBot   = s.imgY + img.height * s.imgScale

    const minSize = 30
    s.cropW = Math.max(minSize, s.cropW)
    s.cropH = Math.max(minSize, s.cropH)
    s.cropX = Math.max(imgLeft,  Math.min(s.cropX, imgRight  - s.cropW))
    s.cropY = Math.max(imgTop,   Math.min(s.cropY, imgBot - s.cropH))
    s.cropW = Math.min(s.cropW,  imgRight  - s.cropX)
    s.cropH = Math.min(s.cropH,  imgBot    - s.cropY)
  }

  // ── Pointer events ─────────────────────────────────────────────
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches?.[0] ?? e.changedTouches?.[0]
    const src   = touch ?? e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  const onPointerDown = (e) => {
    // Two-finger pinch start
    if (e.touches && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current = {
        dist: Math.hypot(dx, dy),
        imgScale: stateRef.current.imgScale,
        imgX: stateRef.current.imgX,
        imgY: stateRef.current.imgY,
        midX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        midY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
      stateRef.current.dragging = null
      return
    }
    e.preventDefault()
    const canvas = canvasRef.current
    const { x, y } = getPos(e, canvas)
    const s = stateRef.current

    const handle = hitHandle(x, y, s)
    if (handle) {
      s.dragging = handle
    } else if (inCrop(x, y, s)) {
      s.dragging = 'crop'
    } else {
      s.dragging = 'image'
    }
    s.dragStartX    = x
    s.dragStartY    = y
    s.dragStartImgX = s.imgX
    s.dragStartImgY = s.imgY
    s.dragStartCrop = { x: s.cropX, y: s.cropY, w: s.cropW, h: s.cropH }
  }

  const onPointerMove = useCallback((e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const s = stateRef.current
    if (!s.dragging) return

    const { x, y } = getPos(e, canvas)
    const dx = x - s.dragStartX
    const dy = y - s.dragStartY
    const dc = s.dragStartCrop

    if (s.dragging === 'image') {
      s.imgX = s.dragStartImgX + dx
      s.imgY = s.dragStartImgY + dy
    } else if (s.dragging === 'crop') {
      s.cropX = dc.x + dx
      s.cropY = dc.y + dy
    } else {
      // Handle resize
      let { x: cx, y: cy, w: cw, h: ch } = dc
      const d = s.dragging

      if (d.includes('l')) { cx = dc.x + dx; cw = dc.w - dx }
      if (d.includes('r')) { cw = dc.w + dx }
      if (d.includes('t')) { cy = dc.y + dy; ch = dc.h - dy }
      if (d.includes('b')) { ch = dc.h + dy }

      // Enforce aspect ratio if set
      if (aspect && (d.includes('l') || d.includes('r'))) {
        ch = cw / aspect
      } else if (aspect && (d.includes('t') || d.includes('b'))) {
        cw = ch * aspect
      }

      s.cropX = cx; s.cropY = cy; s.cropW = cw; s.cropH = ch
    }

    clampCrop(s)
    updateOutput()

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)
  }, [draw])

  const onTouchMove = useCallback((e) => {
    // Pinch zoom
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault()
      const dx   = e.touches[0].clientX - e.touches[1].clientX
      const dy   = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const ratio = dist / pinchRef.current.dist
      const s  = stateRef.current
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const mx = pinchRef.current.midX - rect.left
      const my = pinchRef.current.midY - rect.top
      const newScale = Math.max(0.1, Math.min(10, pinchRef.current.imgScale * ratio))
      const r = newScale / pinchRef.current.imgScale
      s.imgX     = mx - (mx - pinchRef.current.imgX) * r
      s.imgY     = my - (my - pinchRef.current.imgY) * r
      s.imgScale = newScale
      clampCrop(s)
      updateOutput()
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(draw)
      return
    }
    onPointerMove(e)
  }, [onPointerMove, draw])

  const onPointerUp = () => {
    stateRef.current.dragging = null
  }

  // Scroll/pinch zoom
  const onWheel = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const rect   = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const s  = stateRef.current
    const factor = e.deltaY < 0 ? 1.08 : 0.93
    const newScale = Math.max(0.1, Math.min(10, s.imgScale * factor))
    const ratio = newScale / s.imgScale
    s.imgX = mx - (mx - s.imgX) * ratio
    s.imgY = my - (my - s.imgY) * ratio
    s.imgScale = newScale
    clampCrop(s)
    updateOutput()
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)
  }

  // ── Export ─────────────────────────────────────────────────────
  const handleConfirm = () => {
    const s   = stateRef.current
    const img = imgRef.current

    // Crop in image pixel space
    const ix = Math.round((s.cropX - s.imgX) / s.imgScale)
    const iy = Math.round((s.cropY - s.imgY) / s.imgScale)
    const iw = Math.round(s.cropW / s.imgScale)
    const ih = Math.round(s.cropH / s.imgScale)

    const out = document.createElement('canvas')
    // Output at natural image resolution (capped at 2400px wide)
    const maxW = 2400
    const scale = iw > maxW ? maxW / iw : 1
    out.width  = Math.round(iw * scale)
    out.height = Math.round(ih * scale)
    const ctx = out.getContext('2d')
    ctx.drawImage(img, ix, iy, iw, ih, 0, 0, out.width, out.height)
    out.toBlob(blob => onConfirm(blob), 'image/jpeg', 0.92)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 11000,
      background: 'rgba(0,0,0,0.97)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Header */}
      <div style={{
        width: '100%', maxWidth: 860, padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--bright)', letterSpacing: 3 }}>
            CROP IMAGE
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2, marginTop: 2 }}>
            {ready
              ? `📐 ${outputSize.w} × ${outputSize.h}px  •  Drag to pan  •  Scroll to zoom  •  Drag handles to resize`
              : 'Loading…'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={btnStyle('ghost')}>Cancel</button>
          <button onClick={handleConfirm} disabled={!ready} style={btnStyle('gold')}>✓ Use This Crop</button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%', maxWidth: 860,
          height: 'calc(100vh - 120px)',
          display: 'block',
          touchAction: 'none',
          cursor: 'crosshair',
        }}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onTouchMove}
        onTouchEnd={onPointerUp}
        onWheel={onWheel}
      />

      {/* Mobile hint */}
      <div style={{
        fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.5,
        padding: '8px 16px', textAlign: 'center',
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
      }}>
        PINCH TO ZOOM  •  DRAG IMAGE TO PAN  •  DRAG CORNERS TO RESIZE CROP
      </div>
    </div>
  )
}

const btnStyle = (type) => ({
  padding: type === 'gold' ? '8px 20px' : '8px 16px',
  background: type === 'gold' ? 'var(--gold)' : 'transparent',
  color: type === 'gold' ? '#090d09' : 'var(--text-dim)',
  border: type === 'gold' ? 'none' : '1px solid var(--border2)',
  fontFamily: 'Rajdhani, sans-serif',
  fontWeight: 700, fontSize: 11, letterSpacing: 2,
  textTransform: 'uppercase', cursor: 'pointer',
})
