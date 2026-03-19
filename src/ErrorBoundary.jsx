/* ═══════════════════════════════════════════════════════════════════
   FIXED ErrorBoundary.jsx - Update LSI 101 v2
   Added proper error boundary with React error boundaries API
═══════════════════════════════════════════════════════════════════ */

import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    }
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error,
      errorId: Date.now().toString(36).toUpperCase()
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            background: 'var(--bg)',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '100px',
                color: 'var(--gold)',
                opacity: 0.15,
                lineHeight: 1,
                marginBottom: '-20px',
              }}
            >
              !
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '28px',
                color: 'var(--bright)',
                letterSpacing: '4px',
                marginBottom: '16px',
              }}
            >
              SYSTEM ERROR
            </div>
            <div
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: '14px',
                color: 'var(--text-dim)',
                fontStyle: 'italic',
                marginBottom: '32px',
                lineHeight: 1.7,
              }}
            >
              Something went wrong. Our technicians have been notified.
              Please try refreshing the page or return to the homepage.
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  marginBottom: '24px',
                  padding: '16px',
                  background: 'rgba(192,96,96,0.1)',
                  border: '1px solid rgba(192,96,96,0.3)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#c06060',
                  overflow: 'auto',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: 'var(--text-dim)',
                  }}
                >
                  Error Details (Dev Only)
                </summary>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 28px',
                  background: 'var(--gold)',
                  color: '#090d09',
                  border: 'none',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                ↻ Reload Page
              </button>
              <Link to="/">
                <button
                  style={{
                    padding: '12px 28px',
                    background: 'transparent',
                    color: 'var(--gold)',
                    border: '1px solid var(--gold-dim)',
                    fontFamily: "'Rajdhani', sans-serif",
                    fontWeight: 700,
                    fontSize: '12px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  ← Return Home
                </button>
              </Link>
            </div>

            <div
              style={{
                marginTop: '48px',
                paddingTop: '24px',
                borderTop: '1px solid var(--border)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                letterSpacing: '1px',
              }}
            >
              ERROR CODE: {this.state.errorId}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
