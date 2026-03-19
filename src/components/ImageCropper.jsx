import { useState, useRef, useEffect } from 'react'

/**
 * ImageCropper — pan to choose which part of the image to show.
 * The crop box is fixed to fill the image holder (aspect ratio locked).
 * User can only pan/zoom the image behind it.
 * Props:
 *   src        — blob URL of the selected image
 *   aspect     — aspect ratio of the image holder (width/height, e.g. 16/9, 1). null = 1
 *   onConfirm  — (blob) => void
 *   onCancel   — () => void
 */
export default function ImageCropper({ src, aspect = null, onConfirm, onCancel }) {
  const canvasRef  = useRef()
  const imgRef     = useRef(new Image())
  const stateRef   = useRef({
    imgX: 0, imgY: 0, imgScale: 1,
    dragging: false,
    lastX: 0, lastY: 0,
    cw: 0, ch: 0,
    cropX: 0, cropY: 0, cropW: 0, cropH: 0,
  })
  const rafRef     = useRef()
  const pinchRef   = useRef(null)
  const [ready, setReady] = useState(false)

  const lockedAspect = aspect ?? 1

  useEffect(() => {
    const img = imgRef.current
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const cw = canvas.width  = canvas.offsetWidth
      const ch = canvas.height = canvas.offsetHeight
      const s = stateRef.current
      s.cw = cw; s.ch = ch

      // Crop box = centered, fills 85% of canvas, locked to aspect ratio
      let cropW, cropH
      if (cw / ch > lockedAspect) {
        cropH = ch * 0.85
        cropW = cropH * lockedAspect
      } else {
        cropW = cw * 0.85
        cropH = cropW / lockedAspect
      }
      s.cropW = cropW
      s.cropH = cropH
      s.cropX = (cw - cropW) / 2
      s.cropY = (ch - cropH) / 2

      // Scale image to fill crop box, centered
      const scaleW = cropW / img.width
      const scaleH = cropH / img.height
      s.imgScale = Math.max(scaleW, scaleH)
      s.imgX = s.cropX + (cropW - img.width  * s.imgScale) / 2
      s.imgY = s.cropY + (cropH - img.height * s.imgScale) / 2

      setReady(true)
      draw()
    }
    img.src = src
  }, [src])

  const clampImg = (s) => {
    const img = imgRef.current
    const iw = img.width  * s.imgScale
    const ih = img.height * s.imgScale
    // Image must fully cover the crop box
    if (s.imgX > s.cropX) s.imgX = s.cropX
    if (s.imgY > s.cropY) s.imgY = s.cropY
    if (s.imgX + iw < s.cropX + s.cropW) s.imgX = s.cropX + s.cropW - iw
    if (s.imgY + ih < s.cropY + s.cropH) s.imgY = s.cropY + s.cropH - ih
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const img = imgRef.current
    const s   = stateRef.current
    const { cw, ch, imgX, imgY, imgScale, cropX, cropY, cropW, cropH } = s

    ctx.clearRect(0, 0, cw, ch)

    // Dark background
    ctx.fillStyle = 'rgba(0,0,0,0.85)'
    ctx.fillRect(0, 0, cw, ch)

    // Draw image clipped to crop box
    ctx.save()
    ctx.beginPath()
    ctx.rect(cropX, cropY, cropW, cropH)
    ctx.clip()
    ctx.drawImage(img, imgX, imgY, img.width * imgScale, img.height * imgScale)
    ctx.restore()

    // Crop border
    ctx.save()
    ctx.strokeStyle = '#C8952A'
    ctx.lineWidth = 2
    ctx.strokeRect(cropX, cropY, cropW, cropH)
    ctx.restore()

    // Rule of thirds
    ctx.save()
    ctx.strokeStyle = 'rgba(200,149,42,0.3)'
    ctx.lineWidth = 0.5
    for (let i = 1; i <= 2; i++) {
      const x = cropX + (cropW / 3) * i
      const y = cropY + (cropH / 3) * i
      ctx.beginPath(); ctx.moveTo(x, cropY); ctx.lineTo(x, cropY + cropH); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cropX, y); ctx.lineTo(cropX + cropW, y); ctx.stroke()
    }
    ctx.restore()

    // Corner marks
    const markLen = 16
    ctx.save()
    ctx.strokeStyle = '#C8952A'
    ctx.lineWidth = 2.5
    const corners = [
      [cropX, cropY, 1, 1], [cropX + cropW, cropY, -1, 1],
      [cropX, cropY + cropH, 1, -1], [cropX + cropW, cropY + cropH, -1, -1],
    ]
    corners.forEach(([x, y, dx, dy]) => {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx * markLen, y); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + dy * markLen); ctx.stroke()
    })
    ctx.restore()
  }

  const getPos = (e, canvas) => {
    const rect  = canvas.getBoundingClientRect()
    const touch = e.touches?.[0] ?? e.changedTouches?.[0]
    const src   = touch ?? e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  const onPointerDown = (e) => {
    if (e.touches?.length === 2) {
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
      stateRef.current.dragging = false
      return
    }
    e.preventDefault()
    const canvas = canvasRef.current
    const { x, y } = getPos(e, canvas)
    stateRef.current.dragging = true
    stateRef.current.lastX = x
    stateRef.current.lastY = y
  }

  const onPointerMove = (e) => {
    e.preventDefault()
    const s = stateRef.current

    // Pinch zoom
    if (e.touches?.length === 2 && pinchRef.current) {
      const dx   = e.touches[0].clientX - e.touches[1].clientX
      const dy   = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const ratio = dist / pinchRef.current.dist
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const mx = pinchRef.current.midX - rect.left
      const my = pinchRef.current.midY - rect.top
      const img = imgRef.current
      const minScale = Math.max(s.cropW / img.width, s.cropH / img.height)
      const newScale = Math.max(minScale, Math.min(10, pinchRef.current.imgScale * ratio))
      const r = newScale / pinchRef.current.imgScale
      s.imgX = mx - (mx - pinchRef.current.imgX) * r
      s.imgY = my - (my - pinchRef.current.imgY) * r
      s.imgScale = newScale
      clampImg(s)
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(draw)
      return
    }

    if (!s.dragging) return
    const canvas = canvasRef.current
    const { x, y } = getPos(e, canvas)
    s.imgX += x - s.lastX
    s.imgY += y - s.lastY
    s.lastX = x
    s.lastY = y
    clampImg(s)
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)
  }

  const onPointerUp = () => {
    stateRef.current.dragging = false
    pinchRef.current = null
  }

  const onWheel = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const rect   = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const s  = stateRef.current
    const img = imgRef.current
    const minScale = Math.max(s.cropW / img.width, s.cropH / img.height)
    const factor = e.deltaY < 0 ? 1.08 : 0.93
    const newScale = Math.max(minScale, Math.min(10, s.imgScale * factor))
    const ratio = newScale / s.imgScale
    s.imgX = mx - (mx - s.imgX) * ratio
    s.imgY = my - (my - s.imgY) * ratio
    s.imgScale = newScale
    clampImg(s)
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(draw)
  }

  const handleConfirm = () => {
    const s   = stateRef.current
    const img = imgRef.current
    // Crop in image pixel space
    const ix = Math.round((s.cropX - s.imgX) / s.imgScale)
    const iy = Math.round((s.cropY - s.imgY) / s.imgScale)
    const iw = Math.round(s.cropW / s.imgScale)
    const ih = Math.round(s.cropH / s.imgScale)
    const out = document.createElement('canvas')
    const maxW = 2400
    const scale = iw > maxW ? maxW / iw : 1
    out.width  = Math.round(iw * scale)
    out.height = Math.round(ih * scale)
    out.getContext('2d').drawImage(img, ix, iy, iw, ih, 0, 0, out.width, out.height)
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
            POSITION IMAGE
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2, marginTop: 2 }}>
            Drag to reposition · Scroll or pinch to zoom
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={btnStyle('ghost')}>Cancel</button>
          <button onClick={handleConfirm} disabled={!ready} style={btnStyle('gold')}>✓ Use This</button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%', maxWidth: 860,
          height: 'calc(100vh - 120px)',
          display: 'block', touchAction: 'none', cursor: 'grab',
        }}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        onWheel={onWheel}
      />

      <div style={{
        fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.5,
        padding: '8px 16px', textAlign: 'center',
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
      }}>
        DRAG TO PAN · SCROLL / PINCH TO ZOOM
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
