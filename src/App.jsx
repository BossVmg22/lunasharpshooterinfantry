import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LightboxProvider } from './contexts/LightboxContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import BackToTop from './components/BackToTop'
import CommandPalette from './components/CommandPalette'
import Breadcrumb from './components/Breadcrumb'

import Home    from './pages/Home'
import Login   from './pages/Login'
import Admin   from './pages/Admin'
import { About, Brigades, Academy, Command, Schedule } from './pages/InfoPages'
import BrigadePage from './pages/BrigadePage'
import { PIManual, Handbook, Uniforms } from './pages/manuals/Manuals'
import Gallery from './pages/gallery/Gallery'
import { Operations, PostDetail, PostEditor } from './pages/Operations'

function BrigadePageKeyed() {
  const { id } = useParams()
  return <BrigadePage key={id} />
}

function NotFound() {
  return (
    <div className="page-wrap" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(80px, 20vw, 160px)', color: 'var(--gold)', lineHeight: 1, letterSpacing: 8, opacity: 0.15 }}>
          404
        </div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(20px, 5vw, 32px)', color: 'var(--bright)', letterSpacing: 6, marginTop: -16, marginBottom: 16 }}>
          PAGE NOT FOUND
        </div>
        <div style={{ fontFamily: 'Source Serif 4, serif', fontSize: 14, color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
          The page you're looking for doesn't exist or has been moved.
        </div>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'var(--gold)', color: '#090d09', border: 'none',
            padding: '12px 32px', fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700, fontSize: 13, letterSpacing: 2,
            textTransform: 'uppercase', cursor: 'pointer',
          }}>
            ← Back to Home
          </button>
        </Link>
        <div style={{ marginTop: 48, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['About', '/about'], ['Brigades', '/brigades'], ['Gallery', '/gallery'], ['Operations', '/operations']].map(([label, to]) => (
            <Link key={to} to={to} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase' }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <LightboxProvider>
      <BrowserRouter>
        <Navbar />
        <Breadcrumb />
        <BackToTop />
        <CommandPalette />
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/about"    element={<About />} />
          <Route path="/brigades" element={<Brigades />} />
          <Route path="/brigades/:id" element={<BrigadePageKeyed />} />
          <Route path="/academy"  element={<Academy />} />
          <Route path="/command"  element={<Command />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/gallery"  element={<Gallery />} />
          <Route path="/operations"          element={<Operations />} />
          <Route path="/operations/new"      element={<ProtectedRoute require="staff"><PostEditor /></ProtectedRoute>} />
          <Route path="/operations/edit/:id" element={<ProtectedRoute require="staff"><PostEditor /></ProtectedRoute>} />
          <Route path="/operations/:slug"    element={<PostDetail />} />
          <Route path="/manuals/pi"       element={<ProtectedRoute><PIManual /></ProtectedRoute>} />
          <Route path="/manuals/handbook" element={<ProtectedRoute><Handbook /></ProtectedRoute>} />
          <Route path="/manuals/uniforms" element={<ProtectedRoute><Uniforms /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute require="admin"><Admin /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </LightboxProvider>
    </AuthProvider>
  )
}
