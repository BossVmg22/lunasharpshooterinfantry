import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, require: requireRole = 'member' }) {
  const { user, role, loading } = useAuth()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', color:'#c8952a', fontFamily:'Bebas Neue, sans-serif', fontSize:24, letterSpacing:4 }}>
      LOADING…
    </div>
  )

  // Not logged in at all
  if (!user) return <Navigate to="/login" replace />

  // Role check: member < staff < admin
  const hierarchy = { public: 0, member: 1, staff: 2, admin: 3 }
  if ((hierarchy[role] ?? 0) < (hierarchy[requireRole] ?? 1)) {
    return (
      <div style={{ padding:'80px 48px', textAlign:'center', color:'#c05050', fontFamily:'Bebas Neue,sans-serif', fontSize:32, letterSpacing:4 }}>
        ACCESS DENIED
        <p style={{ fontFamily:'Rajdhani,sans-serif', fontSize:14, letterSpacing:1, marginTop:12, color:'#686050' }}>
          Your role ({role}) does not have permission to view this page.
        </p>
      </div>
    )
  }

  return children
}
