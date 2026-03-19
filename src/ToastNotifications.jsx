/* ═══════════════════════════════════════════════════════════════════
   FIXED ToastNotifications.jsx - Update LSI 101 v2
   Fixed memory leaks and accessibility
═══════════════════════════════════════════════════════════════════ */

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useMemo(() => ({
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  }), [addToast])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
    }
  }
  return context
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        @keyframes progressShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      
      <div
        role="region"
        aria-label="Notifications"
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '360px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </>
  )
}

function Toast({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false)

  const handleRemove = useCallback(() => {
    setExiting(true)
    setTimeout(onRemove, 200)
  }, [onRemove])

  const types = {
    success: {
      bg: 'rgba(106, 180, 106, 0.15)',
      border: '#6ab46a',
      icon: '✓',
      color: '#6ab46a',
    },
    error: {
      bg: 'rgba(192, 96, 96, 0.15)',
      border: '#c06060',
      icon: '✕',
      color: '#c06060',
    },
    info: {
      bg: 'rgba(200, 149, 42, 0.15)',
      border: 'var(--gold)',
      icon: 'ℹ',
      color: 'var(--gold)',
    },
    warning: {
      bg: 'rgba(255, 180, 50, 0.15)',
      border: '#ffb432',
      icon: '⚠',
      color: '#ffb432',
    },
  }

  const t = types[toast.type] || types.info

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderLeft: `3px solid ${t.border}`,
        borderRadius: '4px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        backdropFilter: 'blur(10px)',
        animation: exiting
          ? 'slideOutRight 0.2s ease forwards'
          : 'slideInRight 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: t.border,
          color: '#090d09',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 'bold',
          flexShrink: 0,
        }}
      >
        {t.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            color: t.color,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '2px',
          }}
        >
          {toast.type}
        </div>
        <div
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.4,
          }}
        >
          {toast.message}
        </div>
      </div>
      <button
        onClick={handleRemove}
        aria-label="Close notification"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px 4px',
          fontSize: '14px',
          lineHeight: 1,
        }}
      >
        ✕
      </button>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '2px',
          background: t.border,
          opacity: 0.5,
          animation: 'progressShrink 3s linear forwards',
        }}
      />
    </div>
  )
}
