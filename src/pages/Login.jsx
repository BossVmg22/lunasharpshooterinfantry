import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode,     setMode]     = useState('signin')   // 'signin' | 'signup'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else navigate('/')
    } else {
      if (!username.trim()) { setError('Username is required'); setLoading(false); return }
      const { error } = await signUp(email, password, username)
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm, then sign in.')
    }
    setLoading(false)
  }

  return (
    <div className="page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 18px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 13, letterSpacing: 4, color: 'var(--gold-dim)', marginBottom: 8 }}>
            ARMY COMBAT COMMAND
          </div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, letterSpacing: 4, color: 'var(--bright)' }}>
            LSI PORTAL
          </div>
          <div style={{ fontFamily: 'Source Serif 4, serif', fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic', marginTop: 6 }}>
            {mode === 'signin' ? 'Sign in to access division resources' : 'Create your LSI member account'}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderTop: '2px solid var(--gold)' }}>
          {/* Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
            {['signin', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                style={{
                  padding: '12px', background: mode === m ? 'rgba(200,149,42,0.08)' : 'transparent',
                  border: 'none', borderBottom: mode === m ? '2px solid var(--gold)' : '2px solid transparent',
                  color: mode === m ? 'var(--gold)' : 'var(--text-dim)',
                  fontFamily: 'Rajdhani, sans-serif', fontSize: 12, fontWeight: 700,
                  letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer',
                }}>
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 28 }}>
            {mode === 'signup' && (
              <Field label="Username" value={username} onChange={setUsername} placeholder="your_callsign" />
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="email@example.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

            {error   && <div style={msgStyle('var(--red)')}>{error}</div>}
            {success && <div style={msgStyle('var(--green-mid)', '#6ab46a')}>{success}</div>}

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? 'LOADING…' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>

            {mode === 'signin' && (
              <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                Manuals are accessible to all LSI members.
              </div>
            )}
          </form>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 }}>← Back to site</Link>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: 3, color: 'var(--gold-dim)', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type} value={value} placeholder={placeholder} required
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: 'var(--bg)', color: 'var(--bright)',
          border: '1px solid var(--border2)', padding: '10px 14px',
          fontSize: 14, outline: 'none',
          fontFamily: 'Rajdhani, sans-serif',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  )
}

const msgStyle = (bg, color = '#c06060') => ({
  background: bg + '22', border: `1px solid ${bg}`,
  color, padding: '10px 14px', fontSize: 12,
  marginBottom: 12, lineHeight: 1.5,
})
