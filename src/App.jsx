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
          <Route path="*" element={
            <div style={{ padding:'120px 48px', textAlign:'center', color:'var(--gold)', fontFamily:'Bebas Neue,sans-serif', fontSize:48, letterSpacing:6 }}>
              404 — PAGE NOT FOUND
            </div>
          } />
        </Routes>
      </BrowserRouter>
      </LightboxProvider>
    </AuthProvider>
  )
}
