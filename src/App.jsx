import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'

import Home    from './pages/Home'
import Login   from './pages/Login'
import Admin   from './pages/Admin'
import { About, Brigades, Academy, Command, Schedule } from './pages/InfoPages'
import BrigadePage from './pages/BrigadePage'
import { PIManual, Handbook, Uniforms } from './pages/manuals/Manuals'
import Gallery from './pages/gallery/Gallery'
import { Operations, PostDetail, PostEditor } from './pages/Operations'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/about"    element={<About />} />
          <Route path="/brigades" element={<Brigades />} />
          <Route path="/brigades/:id" element={<BrigadePage />} />
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
    </AuthProvider>
  )
}


