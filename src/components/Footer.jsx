import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useContent } from '../lib/useContent'
import EditableText from './EditableText'

function parseJSON(str, def) {
  if (!str) return def
  try { return JSON.parse(str) } catch { return def }
}

const DEFAULT_UNITS = [
  { label: 'All Brigades',     to: '/brigades' },
  { label: '101st Brigade',    to: '/brigades/101' },
  { label: '102nd Brigade',    to: '/brigades/102' },
  { label: '104th Brigade',    to: '/brigades/104' },
  { label: 'Infantry Academy', to: '/academy' },
]

export default function Footer() {
  const { isMember } = useAuth()
  const { content, save, saving } = useContent('footer')

  // Sync units links with the nav dropdown so deleting a unit removes it here too
  const { content: navContent } = useContent('nav')
  const unitsItems = parseJSON(navContent.units_dropdown, DEFAULT_UNITS)

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-col-title">
              <EditableText value={content.col1_title ?? 'Luna Sharpshooters Infantry'} onSave={v => save('col1_title', v)} saving={saving === 'col1_title'} tag="span" multiline={false} placeholder="Column title…" />
            </div>
            <EditableText value={content.col1_text ?? 'The main fighting force of the Philippine Army. Trained in urban and jungle warfare, serving as the first line of defense for the nation.'} onSave={v => save('col1_text', v)} saving={saving === 'col1_text'} tag="p" placeholder="Division tagline or description…" />
          </div>
          <div className="footer-col">
            <div className="footer-col-title">
              <EditableText value={content.col2_title ?? 'Navigation'} onSave={v => save('col2_title', v)} saving={saving === 'col2_title'} tag="span" multiline={false} placeholder="Column title…" />
            </div>
            {/* Units links mirror the nav dropdown — updates automatically */}
            {unitsItems.map(item => (
              <Link key={item.to} to={item.to}>{item.label}</Link>
            ))}
            <Link to="/command">Chain of Command</Link>
            <Link to="/schedule">Division Schedule</Link>
            <Link to="/operations">Operations & News</Link>
            <Link to="/gallery">Gallery</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">
              <EditableText value={content.col3_title ?? 'Manuals & Regulations'} onSave={v => save('col3_title', v)} saving={saving === 'col3_title'} tag="span" multiline={false} placeholder="Column title…" />
            </div>
            {isMember ? (
              <>
                <Link to="/manuals/pi">Practice Inspection Manual</Link>
                <Link to="/manuals/handbook">Personnel Handbook</Link>
                <Link to="/manuals/uniforms">Uniform Regulations</Link>
              </>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                🔒 Sign in as an LSI member to access manuals.
              </p>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <EditableText value={content.footer_bottom ?? 'Fort Antonio Luna, Philippines · Army Combat Command · — PROPERTY OF LSI —'} onSave={v => save('footer_bottom', v)} saving={saving === 'footer_bottom'} tag="p" multiline={false} placeholder="Footer bottom text…" />
          <div className="footer-sig">
            <EditableText value={content.footer_sig ?? 'MATULIS AT MATATAG'} onSave={v => save('footer_sig', v)} saving={saving === 'footer_sig'} tag="span" multiline={false} placeholder="Division motto…" />
          </div>
        </div>
      </div>
    </footer>
  )
}
