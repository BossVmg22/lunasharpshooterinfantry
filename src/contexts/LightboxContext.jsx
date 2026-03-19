import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const LightboxContext = createContext(null)

export function LightboxProvider({ children }) {
  const [lightbox, setLightbox] = useState(null)

  const open  = useCallback((src, alt = '', caption = '') => setLightbox({ src, alt, caption }), [])
  const close = useCallback(() => setLightbox(null), [])

  // Listen for events from EditableImage (avoids circular import)
  useEffect(() => {
    const handler = (e) => {
      const { src, alt, caption } = e.detail
      open(src, alt, caption)
    }
    window.addEventListener('lsi:lightbox', handler)
    return () => window.removeEventListener('lsi:lightbox', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, close])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  return (
    <LightboxContext.Provider value={{ open, close }}>
      {children}

      {lightbox && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.93)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(6px)',
            animation: 'lbFadeIn 0.18s ease',
          }}
        >
          <button
            onClick={close}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(200,149,42,0.12)',
              border: '1px solid var(--gold-dim)',
              color: 'var(--gold)', width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 18, zIndex: 1, borderRadius: 0,
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
            }}
            aria-label="Close"
          >
            ✕
          </button>

          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '100%',
              maxHeight: lightbox.caption ? 'calc(100vh - 100px)' : 'calc(100vh - 48px)',
              objectFit: 'contain',
              display: 'block',
              border: '1px solid var(--border)',
              boxShadow: '0 0 60px rgba(0,0,0,0.8)',
              animation: 'lbSlideUp 0.2s ease',
            }}
          />

          {lightbox.caption && (
            <div
              onClick={e => e.stopPropagation()}
              style={{
                marginTop: 14,
                padding: '8px 20px',
                background: 'rgba(15,21,15,0.85)',
                border: '1px solid var(--border)',
                borderTop: '2px solid var(--gold-dim)',
                maxWidth: 700, width: '100%', textAlign: 'center',
              }}
            >
              <p style={{
                fontFamily: 'Source Serif 4, serif', fontSize: 13,
                fontWeight: 300, color: 'var(--text)', margin: 0, lineHeight: 1.6,
              }}>
                {lightbox.caption}
              </p>
            </div>
          )}

          <div style={{
            position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
            fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)',
            fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
            textTransform: 'uppercase', pointerEvents: 'none',
          }}>
            Click anywhere or press ESC to close
          </div>
        </div>
      )}

      <style>{`
        @keyframes lbFadeIn {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes lbSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
      `}</style>
    </LightboxContext.Provider>
  )
}

export function useLightbox() {
  return useContext(LightboxContext)
}
