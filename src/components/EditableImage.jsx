import { useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { uploadToCloudinary } from '../lib/cloudinary'

/**
 * EditableImage — shows an image (or placeholder) and lets staff upload a new one.
 * Props:
 *   value       – current image URL (or '' / null)
 *   onSave      – async (url) => void
 *   alt         – alt text
 *   style       – wrapper styles
 *   placeholder – text shown when no image
 *   height      – height of the image box (default 120)
 */
export default function EditableImage({
  value = '',
  onSave,
  alt = 'image',
  style = {},
  placeholder = 'Click to upload image',
  height = 120,
}) {
  const { isStaff } = useAuth()
  const inputRef   = useRef()
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')

  const handleUpload = async e => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadToCloudinary(file)
      await onSave(url)
    } catch (err) {
      setError(err.message)
    }
    setUploading(false)
    e.target.value = ''
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
    <div style={boxStyle}>
      {value ? (
        <img
          src={value}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-muted, #555)', padding: 12 }}>
          <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.4 }}>🖼</div>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'Rajdhani, sans-serif' }}>
            {placeholder}
          </div>
        </div>
      )}

      {/* Staff upload overlay */}
      {isStaff && (
        <>
          <div
            onClick={() => inputRef.current?.click()}
            style={{
              position: 'absolute', inset: 0,
              background: uploading
                ? 'rgba(0,0,0,0.6)'
                : 'rgba(200,149,42,0.0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,149,42,0.18)'}
            onMouseLeave={e => !uploading && (e.currentTarget.style.background = 'rgba(200,149,42,0)')}
          >
            {uploading ? (
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', fontFamily: 'Rajdhani, sans-serif' }}>
                UPLOADING…
              </span>
            ) : (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 2,
                color: 'var(--gold)', fontFamily: 'Rajdhani, sans-serif',
                background: 'rgba(0,0,0,0.7)', padding: '4px 10px',
                opacity: 0, transition: 'opacity 0.2s',
                pointerEvents: 'none',
              }} className="img-upload-hint">
                📷 UPLOAD
              </span>
            )}
          </div>

          {/* Small upload badge always visible for staff */}
          <div style={{
            position: 'absolute', bottom: 4, right: 4,
            fontSize: 8, fontWeight: 700, letterSpacing: 1,
            color: 'var(--gold)', background: 'rgba(0,0,0,0.75)',
            padding: '2px 6px', fontFamily: 'Rajdhani, sans-serif',
            pointerEvents: 'none',
          }}>
            {value ? '📷 CHANGE' : '📷 UPLOAD'}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleUpload}
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
  )
}
