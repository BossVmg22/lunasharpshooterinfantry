import { useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { uploadToCloudinary } from '../lib/cloudinary'
import ImageCropper from './ImageCropper'

/**
 * EditableImage
 * - Everyone: click image → lightbox fullscreen view (via window event)
 * - Staff: pick a file → crop tool → upload cropped result
 */
export default function EditableImage({
  value = '',
  onSave,
  alt = 'image',
  caption = '',
  style = {},
  placeholder = 'Upload image',
  height = 120,
  aspect = null,
}) {
  const { isStaff }          = useAuth()
  const inputRef             = useRef()
  const wrapRef              = useRef()
  const [cropSrc, setCropSrc]     = useState(null)
  const [cropAspect, setCropAspect] = useState(aspect)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Measure the actual rendered box so cropper matches exactly
    if (wrapRef.current) {
      const { offsetWidth, offsetHeight } = wrapRef.current
      if (offsetWidth && offsetHeight) {
        setCropAspect(offsetWidth / offsetHeight)
      }
    }
    const url = URL.createObjectURL(file)
    setCropSrc(url)
    e.target.value = ''
  }

  const handleCropConfirm = async (blob) => {
    setCropSrc(null)
    setUploading(true)
    setError('')
    try {
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' })
      const url  = await uploadToCloudinary(file)
      await onSave(url)
    } catch (err) {
      setError(err.message)
    }
    setUploading(false)
  }

  const handleCropCancel = () => setCropSrc(null)

  // Open lightbox via a custom window event — avoids circular context import
  const openLightbox = () => {
    if (!value) return
    window.dispatchEvent(new CustomEvent('lsi:lightbox', { detail: { src: value, alt, caption } }))
  }

  const boxStyle = {
    position: 'relative',
    width: '100%',
    height,
    background: 'var(--bg2, #0d1a0d)',
    border: '1px solid var(--border, #2a3a2a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...style,
  }

  return (
    <>
      <div ref={wrapRef} style={boxStyle}>
        {value ? (
          <>
            <img
              src={value}
              alt={alt}
              loading="lazy"
              onClick={openLightbox}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                cursor: 'zoom-in',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          </>
        ) : (
          <div
            style={{ textAlign: 'center', color: 'var(--text-muted, #555)', padding: 12, cursor: isStaff ? 'pointer' : 'default' }}
            onClick={() => isStaff && inputRef.current?.click()}
          >
            <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.4 }}>🖼</div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Rajdhani, sans-serif' }}>
              {isStaff ? placeholder : 'No image'}
            </div>
          </div>
        )}

        {isStaff && (
          <>
            <button
              onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
              disabled={uploading}
              style={{
                position: 'absolute', bottom: 6, right: 6,
                fontSize: 9, fontWeight: 700, letterSpacing: 1,
                color: uploading ? 'var(--text-muted)' : 'var(--gold)',
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid var(--gold-dim)',
                padding: '4px 10px',
                cursor: uploading ? 'wait' : 'pointer',
                fontFamily: 'Rajdhani, sans-serif',
                zIndex: 2,
              }}
            >
              {uploading ? '⏳ UPLOADING…' : value ? '✂️ CROP & REPLACE' : '📷 UPLOAD & CROP'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </>
        )}

        {error && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#c06060', color: '#fff', fontSize: 10,
            padding: '3px 8px', fontFamily: 'Rajdhani, sans-serif',
          }}>
            {error}
          </div>
        )}
      </div>

      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          aspect={cropAspect}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  )
}
