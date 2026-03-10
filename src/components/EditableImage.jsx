import { useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLightbox } from '../contexts/LightboxContext'
import { uploadToCloudinary } from '../lib/cloudinary'
import ImageCropper from './ImageCropper'

/**
 * EditableImage
 * - Everyone: click image → lightbox fullscreen view
 * - Staff: pick a file → crop tool → upload cropped result
 * Props:
 *   value       – current image URL
 *   onSave      – (url) => void
 *   alt         – alt text
 *   caption     – optional caption shown in lightbox
 *   style       – wrapper style overrides
 *   placeholder – text when empty
 *   height      – container height in px
 *   aspect      – crop aspect ratio (e.g. 16/9, 1, 2.5) — null = free crop
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
  const { isStaff }        = useAuth()
  const { open: openLightbox } = useLightbox()
  const inputRef           = useRef()
  const [cropSrc,  setCropSrc]  = useState(null) // blob URL while cropping
  const [uploading,setUploading] = useState(false)
  const [error,    setError]    = useState('')

  // Step 1: user picks a file → show cropper
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setCropSrc(url)
    e.target.value = ''
  }

  // Step 2: cropper confirms → upload blob
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

  const handleCropCancel = () => {
    setCropSrc(null)
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
      <div style={boxStyle}>
        {value ? (
          <>
            {/* Image — click = lightbox for everyone */}
            <img
              src={value}
              alt={alt}
              loading="lazy"
              onClick={() => openLightbox(value, alt, caption)}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                cursor: 'zoom-in',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            {/* Zoom hint */}
            <div className="img-zoom-overlay" style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s', pointerEvents: 'none',
            }}>
              <span className="img-zoom-hint" style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 2,
                color: 'var(--gold)', background: 'rgba(0,0,0,0.7)',
                padding: '4px 10px', opacity: 0, transition: 'opacity 0.2s',
                fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase',
              }}>
                🔍 VIEW FULL
              </span>
            </div>
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

        {/* Staff upload button */}
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
                transition: 'border-color 0.15s',
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

      {/* Cropper — rendered as portal-like overlay above everything */}
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          aspect={aspect}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  )
}
