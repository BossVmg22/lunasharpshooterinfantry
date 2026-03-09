import { useParams, Link } from 'react-router-dom'
import { useContent } from '../lib/useContent'
import { useAuth } from '../contexts/AuthContext'
import EditableText from '../components/EditableText'
import EditableImage from '../components/EditableImage'
import Footer from '../components/Footer'

<<<<<<< HEAD
const RANK_ICONS = {
  'brigade co':    { icon: '◆◆', color: '#c8952a' },
  'brigade xo':    { icon: '◆',  color: '#a07828' },
  'brigade sgm':   { icon: '⬡⬡', color: '#8a9a70' },
  'company co':    { icon: '▲▲', color: '#b08838' },
  'company xo':    { icon: '▲',  color: '#907030' },
  'instructor':    { icon: '▸▸', color: '#6a8060' },
  'personnel':     { icon: '▸',  color: '#506050' },
  'commanding officer': { icon: '◈◈◈', color: '#c8952a' },
  'executive officer':  { icon: '◈◈',  color: '#a07828' },
  'sergeant major':     { icon: '⬡⬡',  color: '#8a9a70' },
}
function getRankIcon(r) {
  if (!r) return null
  const low = r.toLowerCase()
  for (const [k, v] of Object.entries(RANK_ICONS)) {
    if (low.startsWith(k) || low.includes(k)) return v
  }
  return null
}

=======
>>>>>>> 2122e0e3b320849ad366ee701029d8f3748c491b
const addRowBtn = {
  marginTop: 10, padding: '6px 16px', background: 'rgba(200,149,42,0.1)',
  border: '1px dashed var(--gold-dim)', color: 'var(--gold)', cursor: 'pointer',
  fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: 'Rajdhani, sans-serif',
}
const delBtn = {
  background: 'none', border: 'none', color: '#c06060', cursor: 'pointer',
  fontSize: 13, padding: '0 6px', lineHeight: 1, opacity: 0.8,
}

function parseJSON(str, def) {
  if (!str) return def
  try { return JSON.parse(str) } catch { return def }
}

const DEFAULT_COMPANIES = [
  { id: 'co_1', label: 'Company 1', img: '', name: '', desc: '', motto: '' },
  { id: 'co_2', label: 'Company 2', img: '', name: '', desc: '', motto: '' },
  { id: 'co_3', label: 'Company 3', img: '', name: '', desc: '', motto: '' },
]

const DEFAULT_PERSONNEL = [
  { rank: 'Brigade CO',  name: '[ Vacant ]' },
  { rank: 'Brigade XO',  name: '[ Vacant ]' },
  { rank: 'Brigade SGM', name: '[ Vacant ]' },
  { rank: 'Company CO',  name: '[ Vacant ]' },
  { rank: 'Company XO',  name: '[ Vacant ]' },
]

export default function BrigadePage() {
  const { id } = useParams()
  const { content, save, saving } = useContent(`brigade_${id}`)
  const { isStaff } = useAuth()

  // ── Companies — full JSON array, supports delete any ──────────
  const companies = parseJSON(content.companies, DEFAULT_COMPANIES)

  const updateCompany = (idx, field, val) => {
    save('companies', JSON.stringify(companies.map((c, i) => i === idx ? { ...c, [field]: val } : c)))
  }
  const deleteCompany = (idx) => {
    if (companies.length <= 1) return
    save('companies', JSON.stringify(companies.filter((_, i) => i !== idx)))
  }
  const addCompany = () => {
    save('companies', JSON.stringify([...companies, { id: `co_${Date.now()}`, label: `Company ${companies.length + 1}`, img: '', name: '', desc: '', motto: '' }]))
  }

  // ── Personnel rows ────────────────────────────────────────────
  const personnel = parseJSON(content.personnel_rows, DEFAULT_PERSONNEL)

  const updatePersonnel = (idx, field, val) => {
    save('personnel_rows', JSON.stringify(personnel.map((p, i) => i === idx ? { ...p, [field]: val } : p)))
  }
  const deletePersonnel = (idx) => {
    save('personnel_rows', JSON.stringify(personnel.filter((_, i) => i !== idx)))
  }
  const addPersonnel = () => {
    save('personnel_rows', JSON.stringify([...personnel, { rank: 'New Position', name: '[ Vacant ]' }]))
  }

  // ── Empty-state banner for brand-new brigade ──────────────────
  const isNewBrigade = !content.title && !content.description && companies.every(c => !c.name)

  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <div className="page-hero-eyebrow">
                  <Link to="/brigades" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← All Brigades</Link>
                  {'  ·  '}Brigade {id}
                </div>
                <EditableText
                  value={content.title ?? ''}
                  onSave={v => save('title', v)}
                  saving={saving === 'title'}
                  tag="div" multiline={false}
                  placeholder={`Brigade ${id} — Enter full name`}
                  style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(36px,6vw,72px)', color: 'var(--bright)', letterSpacing: 4, lineHeight: 1 }}
                />
                <EditableText
                  value={content.role ?? ''}
                  onSave={v => save('role', v)}
                  saving={saving === 'role'}
                  tag="div" multiline={false}
                  placeholder="Brigade role (e.g. Mechanized Infantry)"
                  style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 8 }}
                />
              </div>
              <div className="page-hero-meta">
                <strong style={{ color: 'var(--gold)' }}>{id}</strong>
                <EditableText value={content.meta ?? 'LSI'} onSave={v => save('meta', v)} saving={saving === 'meta'} tag="span" multiline={false} placeholder="Unit tag…" />
              </div>
            </div>
          </div>
        </div>

        <div className="container">

          {/* New brigade guidance banner */}
          {isNewBrigade && isStaff && (
            <div style={{ margin: '24px 0', padding: '18px 24px', background: 'rgba(200,149,42,0.07)', border: '1px dashed var(--gold-dim)', borderLeft: '3px solid var(--gold)' }}>
              <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6 }}>
                ✏️ New Brigade — Start Editing
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                This page has no content yet. Click any gold-highlighted field above and below to start filling in the brigade details. All changes are saved automatically.
              </div>
            </div>
          )}

          {/* Banner image */}
          <div className="content-section">
            <EditableImage value={content.banner_img ?? ''} onSave={v => save('banner_img', v)} alt="Brigade Banner" height={260} placeholder="Upload brigade banner image" />
          </div>

          {/* Overview */}
          <div className="content-section">
            <div className="section-label">
              <span className="section-label-num">01</span>
              <EditableText value={content.section1_title ?? 'Overview'} onSave={v => save('section1_title', v)} saving={saving === 'section1_title'} tag="span" multiline={false} className="section-label-title" placeholder="Section title…" />
              <div className="section-label-rule"/>
            </div>
            <div className="info-grid">
              <div className="info-card full">
                <div className="info-card-label">
                  <EditableText value={content.desc_label ?? 'Brigade Description'} onSave={v => save('desc_label', v)} saving={saving === 'desc_label'} tag="span" multiline={false} placeholder="Label name…" />
                </div>
                <EditableText value={content.description ?? ''} onSave={v => save('description', v)} saving={saving === 'description'} tag="p" placeholder="Enter the brigade's background, history, and operational role within the LSI division…" />
              </div>
              <div className="info-card">
                <div className="info-card-label">
                  <EditableText value={content.motto_label ?? 'Motto'} onSave={v => save('motto_label', v)} saving={saving === 'motto_label'} tag="span" multiline={false} placeholder="Label name…" />
                </div>
                <div className="motto">
                  <span className="motto-label">LSI</span>
                  <EditableText value={content.motto ?? ''} onSave={v => save('motto', v)} saving={saving === 'motto'} tag="span" multiline={false} placeholder="Enter brigade motto…" style={{ fontStyle: 'italic' }} />
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-label">
                  <EditableText value={content.callsign_label ?? 'Callsign'} onSave={v => save('callsign_label', v)} saving={saving === 'callsign_label'} tag="span" multiline={false} placeholder="Label name…" />
                </div>
                <EditableText value={content.callsign ?? ''} onSave={v => save('callsign', v)} saving={saving === 'callsign'} tag="p" multiline={false} placeholder="Enter callsign or designation…" />
              </div>
            </div>
          </div>

          {/* Companies — any company can be deleted */}
          <div className="content-section">
            <div className="section-label">
              <span className="section-label-num">02</span>
              <EditableText value={content.section2_title ?? 'Companies'} onSave={v => save('section2_title', v)} saving={saving === 'section2_title'} tag="span" multiline={false} className="section-label-title" placeholder="Section title…" />
              <div className="section-label-rule"/>
            </div>
            <div className="info-grid">
              {companies.map((co, idx) => (
                <div className="info-card" key={co.id} style={{ position: 'relative' }}>
                  {isStaff && companies.length > 1 && (
                    <button
                      onClick={() => deleteCompany(idx)}
                      style={{ ...delBtn, position: 'absolute', top: 8, right: 8, fontSize: 11 }}
                      title={`Remove ${co.label}`}
                    >
                      ✕ Remove
                    </button>
                  )}
                  <div className="info-card-label">
                    <EditableText value={co.label} onSave={v => updateCompany(idx, 'label', v)} saving={saving === 'companies'} tag="span" multiline={false} placeholder={`Company ${idx + 1} designation…`} />
                  </div>
                  <EditableImage value={co.img} onSave={v => updateCompany(idx, 'img', v)} alt={co.label} height={100} placeholder="Upload company image" />
                  <EditableText value={co.name} onSave={v => updateCompany(idx, 'name', v)} saving={saving === 'companies'} tag="h4" multiline={false} placeholder="Full company name…" style={{ marginTop: 10 }} />
                  <EditableText value={co.desc} onSave={v => updateCompany(idx, 'desc', v)} saving={saving === 'companies'} tag="p" placeholder="Company description — role, specialty, notable operations…" />
                  <div className="motto" style={{ marginTop: 8 }}>
                    <span className="motto-label">Motto</span>
                    <EditableText value={co.motto} onSave={v => updateCompany(idx, 'motto', v)} saving={saving === 'companies'} tag="span" multiline={false} placeholder="Company motto…" style={{ fontStyle: 'italic' }} />
                  </div>
                </div>
              ))}
            </div>
            {isStaff && (
              <button onClick={addCompany} style={addRowBtn}>+ Add Company</button>
            )}
          </div>

          {/* Key Personnel */}
          <div className="content-section">
            <div className="section-label">
              <span className="section-label-num">03</span>
              <EditableText value={content.section3_title ?? 'Key Personnel'} onSave={v => save('section3_title', v)} saving={saving === 'section3_title'} tag="span" multiline={false} className="section-label-title" placeholder="Section title…" />
              <div className="section-label-rule"/>
            </div>
            <div className="coc-list">
<<<<<<< HEAD
              {personnel.map((p, idx) => {
                const icon = getRankIcon(p.rank)
                return (
                <div className="coc-row" key={idx} style={{ alignItems: 'center' }}>
                  <div className="coc-num">—</div>
                  <div className="coc-rank" style={{ flex: 1, display:'flex', alignItems:'center', gap:8 }}>
                    {icon && <span style={{ fontFamily:'monospace', fontSize:11, color:icon.color, letterSpacing:1, minWidth:36, opacity:0.9 }}>{icon.icon}</span>}
=======
              {personnel.map((p, idx) => (
                <div className="coc-row" key={idx} style={{ alignItems: 'center' }}>
                  <div className="coc-num">—</div>
                  <div className="coc-rank" style={{ flex: 1 }}>
>>>>>>> 2122e0e3b320849ad366ee701029d8f3748c491b
                    <EditableText value={p.rank} onSave={v => updatePersonnel(idx, 'rank', v)} saving={saving === 'personnel_rows'} tag="span" multiline={false} placeholder="Position title…" />
                  </div>
                  <div className="coc-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <EditableText value={p.name} onSave={v => updatePersonnel(idx, 'name', v)} saving={saving === 'personnel_rows'} tag="span" multiline={false} placeholder="[ Vacant ]" />
                    {isStaff && (
                      <button onClick={() => deletePersonnel(idx)} style={delBtn} title="Delete">✕</button>
                    )}
                  </div>
                </div>
<<<<<<< HEAD
                )
              })}
=======
              ))}
>>>>>>> 2122e0e3b320849ad366ee701029d8f3748c491b
            </div>
            {isStaff && (
              <button onClick={addPersonnel} style={addRowBtn}>+ Add Personnel</button>
            )}
          </div>

          {/* Additional Notes */}
          <div className="content-section">
            <div className="section-label">
              <span className="section-label-num">04</span>
              <EditableText value={content.section4_title ?? 'Additional Notes'} onSave={v => save('section4_title', v)} saving={saving === 'section4_title'} tag="span" multiline={false} className="section-label-title" placeholder="Section title…" />
              <div className="section-label-rule"/>
            </div>
            <EditableText value={content.notes ?? ''} onSave={v => save('notes', v)} saving={saving === 'notes'} tag="div" placeholder="Any additional notes, special orders, or remarks about this brigade…" style={{ minHeight: 80 }} />
          </div>

        </div>
      </div>
      <Footer/>
    </>
  )
}
