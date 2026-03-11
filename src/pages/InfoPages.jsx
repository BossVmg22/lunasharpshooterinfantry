import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../lib/useContent'
import { useAuth } from '../contexts/AuthContext'
import EditableText from '../components/EditableText'
import EditableImage from '../components/EditableImage'
import Footer from '../components/Footer'

function parseJSON(str, def) {
  if (!str) return def
  try { return JSON.parse(str) } catch { return def }
}

const addRowBtn = {
  marginTop: 10, padding: '6px 16px', background: 'rgba(200,149,42,0.1)',
  border: '1px dashed var(--gold-dim)', color: 'var(--gold)', cursor: 'pointer',
  fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: 'Rajdhani, sans-serif',
}
const delBtn = {
  background: 'none', border: 'none', color: '#c06060', cursor: 'pointer',
  fontSize: 13, padding: '0 6px', lineHeight: 1, opacity: 0.7,
}

// ============================================================
// About
// ============================================================
export function About() {
  const { content, save, saving } = useContent('about')
  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <EditableText value={content.eyebrow ?? 'Section 1.1 — Division Information'} onSave={v => save('eyebrow',v)} saving={saving==='eyebrow'} tag="div" multiline={false} className="page-hero-eyebrow" placeholder="Section eyebrow…" />
                <EditableText value={content.title ?? 'About the Division'} onSave={v => save('title',v)} saving={saving==='title'} tag="div" multiline={false} className="page-hero-title" placeholder="Page title…" />
                <EditableText value={content.subtitle ?? 'History, mission, function, and vision of the Luna Sharpshooters Infantry.'} onSave={v => save('subtitle',v)} saving={saving==='subtitle'} tag="div" multiline={false} className="page-hero-sub" placeholder="Page subtitle…" />
              </div>
              <div className="page-hero-meta">
                <EditableText value={content.meta_strong ?? 'LSI'} onSave={v => save('meta_strong',v)} saving={saving==='meta_strong'} tag="strong" multiline={false} placeholder="Bold…" />
                <EditableText value={content.meta ?? 'Philippine Army'} onSave={v => save('meta',v)} saving={saving==='meta'} tag="span" multiline={false} placeholder="Meta…" />
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="content-section">
            <div className="section-label">
              <span className="section-label-num">1.1</span>
              <span className="section-label-title">Division Overview</span>
              <div className="section-label-rule"/>
            </div>
            <div className="info-grid">
              <div className="info-card full">
                <div className="info-card-label">Division Definition</div>
                <EditableText value={content.division_definition ?? ''} onSave={v => save('division_definition',v)} saving={saving==='division_definition'} placeholder="Define what the division is and its purpose…" />
              </div>
              <div className="info-card">
                <div className="info-card-label">Division Function</div>
                <EditableText value={content.division_function ?? ''} onSave={v => save('division_function',v)} saving={saving==='division_function'} placeholder="Describe the division's primary function…" />
              </div>
              <div className="info-card">
                <div className="info-card-label">Division Vision</div>
                <EditableText value={content.division_vision ?? ''} onSave={v => save('division_vision',v)} saving={saving==='division_vision'} placeholder="Enter the division's long-term vision…" />
              </div>
              <div className="info-card full">
                <div className="info-card-label">Division Slogan</div>
                <div className="motto"><span className="motto-label">LSI</span>
                  <EditableText value={content.slogan ?? 'Matulis at Matatag'} onSave={v => save('slogan',v)} saving={saving==='slogan'} tag="span" multiline={false} placeholder="Division slogan…" style={{ fontStyle:'italic' }} />
                </div>
              </div>
            </div>
            <div className="three-col" style={{ marginTop:24 }}>
              {[
                ['stat_brigades','stat_brigades_label','3','Active Brigades'],
                ['stat_academy','stat_academy_label','1','Infantry Academy'],
                ['stat_depts','stat_depts_label','2','Academy Depts'],
              ].map(([nk,lk,nd,ld]) => (
                <div key={nk} className="stat-block">
                  <EditableText value={content[nk] ?? nd} onSave={v => save(nk,v)} saving={saving===nk} tag="div" multiline={false} placeholder="0" style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:36, color:'var(--gold)', letterSpacing:2 }} />
                  <EditableText value={content[lk] ?? ld} onSave={v => save(lk,v)} saving={saving===lk} tag="div" multiline={false} placeholder="Label…" style={{ fontSize:9, letterSpacing:2, color:'var(--text-dim)', textTransform:'uppercase', marginTop:2 }} />
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <div className="section-label">
              <span className="section-label-num">1.2</span>
              <span className="section-label-title">Vehicles & Weaponry</span>
              <div className="section-label-rule"/>
            </div>
            <div className="two-col">
              <div>
                <div className="subheading">Vehicles</div>
                <table className="data-table">
                  <thead><tr><th style={{width:80}}>Photo</th><th>Vehicle</th><th>Role</th></tr></thead>
                  <tbody>
                    {[['vehicle_1','vehicle_1_role','vehicle_1_img','Humvee','Fast patrol and command'],
                      ['vehicle_2','vehicle_2_role','vehicle_2_img','KM450 Truck','Troop transport'],
                      ['vehicle_3','vehicle_3_role','vehicle_3_img','M35 Utility Truck','Logistics and supply'],
                    ].map(([vk,rk,ik,vd,rd]) => (
                      <tr key={vk}>
                        <td><EditableImage value={content[ik] ?? ''} onSave={v => save(ik,v)} alt={vd} height={60} placeholder="Upload" style={{width:72}} /></td>
                        <td data-label="Vehicle" className="td-label"><EditableText value={content[vk] ?? vd} onSave={v => save(vk,v)} saving={saving===vk} tag="span" multiline={false} placeholder="Vehicle name…" /></td>
                        <td data-label="Role"><EditableText value={content[rk] ?? rd} onSave={v => save(rk,v)} saving={saving===rk} tag="span" multiline={false} placeholder="Role…" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <div className="subheading">Weapons</div>
                <table className="data-table">
                  <thead><tr><th style={{width:80}}>Photo</th><th>Weapon</th><th>Type</th></tr></thead>
                  <tbody>
                    {[['weapon_1','weapon_1_type','weapon_1_img','M16','Assault Rifle'],
                      ['weapon_2','weapon_2_type','weapon_2_img','M4A1','Carbine'],
                      ['weapon_3','weapon_3_type','weapon_3_img','AWM','Sniper Rifle'],
                      ['weapon_4','weapon_4_type','weapon_4_img','RPG-7','Anti-Armor'],
                      ['weapon_5','weapon_5_type','weapon_5_img','Glock 17/18','Sidearm'],
                    ].map(([wk,tk,ik,wd,td_]) => (
                      <tr key={wk}>
                        <td><EditableImage value={content[ik] ?? ''} onSave={v => save(ik,v)} alt={wd} height={60} placeholder="Upload" style={{width:72}} /></td>
                        <td data-label="Weapon" className="td-label"><EditableText value={content[wk] ?? wd} onSave={v => save(wk,v)} saving={saving===wk} tag="span" multiline={false} placeholder="Weapon name…" /></td>
                        <td data-label="Type"><EditableText value={content[tk] ?? td_} onSave={v => save(tk,v)} saving={saving===tk} tag="span" multiline={false} placeholder="Type…" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}

// ============================================================
// Brigades — fully dynamic list (add / remove brigades)
// ============================================================
const DEFAULT_BRIGADE_IDS = ['101', '102', '104']

export function Brigades() {
  const { content, save, saving } = useContent('brigades')
  const { isStaff } = useAuth()

  const brigadeIds = parseJSON(content.brigade_ids, DEFAULT_BRIGADE_IDS)

  const addBrigade = () => {
    const newId = window.prompt('Enter new brigade number (e.g. 105):')
    if (!newId || !newId.trim()) return
    const trimmed = newId.trim()
    if (brigadeIds.includes(trimmed)) { alert(`Brigade ${trimmed} already exists.`); return }
    save('brigade_ids', JSON.stringify([...brigadeIds, trimmed]))
  }

  const removeBrigade = (id) => {
    if (!window.confirm(`Remove Brigade ${id} from this page? (Data is preserved)`)) return
    save('brigade_ids', JSON.stringify(brigadeIds.filter(b => b !== id)))
  }

  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <EditableText value={content.eyebrow ?? 'Section 1.2 — Brigade Information'} onSave={v => save('eyebrow',v)} saving={saving==='eyebrow'} tag="div" multiline={false} className="page-hero-eyebrow" placeholder="Section eyebrow…" />
                <EditableText value={content.title ?? 'Brigades'} onSave={v => save('title',v)} saving={saving==='title'} tag="div" multiline={false} className="page-hero-title" placeholder="Page title…" />
                <EditableText value={content.subtitle ?? 'Specialized brigades, each serving a distinct operational role under the Luna High Command.'} onSave={v => save('subtitle',v)} saving={saving==='subtitle'} tag="div" multiline={false} className="page-hero-sub" placeholder="Page subtitle…" />
              </div>
              <div className="page-hero-meta">
                <strong style={{ color:'var(--gold)' }}>{brigadeIds.length} BRIGADES</strong>
                <EditableText value={content.meta ?? 'Under LHC'} onSave={v => save('meta',v)} saving={saving==='meta'} tag="span" multiline={false} placeholder="Meta…" />
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="content-section">
            <div className="brigade-cards-a">
              {brigadeIds.map(id => {
                const nk  = `brigade_${id}_num`
                const ck  = `brigade_${id}_callsign`
                const rk  = `brigade_${id}_role`
                const dk  = `brigade_${id}_desc`
                const ek  = `brigade_${id}_extra`
                const mk  = `brigade_${id}_motto`
                const imgk = `brigade_${id}_img`
                return (
                  <div key={id} className="brigade-card-a" style={{ position: 'relative' }}>
                    {isStaff && (
                      <button onClick={() => removeBrigade(id)} style={{ ...delBtn, position: 'absolute', top: 8, right: 8, fontSize: 11, zIndex: 2 }} title={`Remove Brigade ${id}`}>✕ Remove</button>
                    )}
                    {/* Left panel */}
                    <div className="brigade-tab-a">
                      <EditableImage value={content[imgk] ?? ''} onSave={v => save(imgk,v)} alt={'Brigade '+id} height={72} placeholder="Upload" style={{ marginBottom: 8, width: '100%', objectFit: 'cover' }} />
                      <EditableText value={content[nk] ?? id} onSave={v => save(nk,v)} saving={saving===nk} tag="div" multiline={false} placeholder="No." style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:52, color:'var(--gold)', lineHeight:1, letterSpacing:2, position:'relative', zIndex:1, textShadow:'0 0 30px rgba(200,149,42,0.25)' }} />
                      <EditableText value={content[ck] ?? ''} onSave={v => save(ck,v)} saving={saving===ck} tag="div" multiline={false} placeholder="Callsign…" style={{ fontSize:8, fontWeight:700, letterSpacing:3, color:'var(--gold-dim)', textTransform:'uppercase', marginTop:4, position:'relative', zIndex:1 }} />
                    </div>
                    {/* Right panel */}
                    <div className="brigade-body-a">
                      <div style={{ marginBottom: 8 }}>
                        <EditableText value={content[rk] ?? ''} onSave={v => save(rk,v)} saving={saving===rk} tag="span" multiline={false} placeholder="Role…" style={{ display:'inline-block', fontSize:8, fontWeight:700, letterSpacing:2, color:'var(--gold)', textTransform:'uppercase', padding:'2px 8px', border:'1px solid var(--gold-dim)', background:'rgba(200,149,42,0.05)' }} />
                      </div>
                      <EditableText value={content[dk] ?? ''} onSave={v => save(dk,v)} saving={saving===dk} tag="p" placeholder="Enter brigade description…" style={{ fontFamily:'Source Serif 4,serif', fontSize:13.5, fontWeight:300, color:'var(--text)', lineHeight:1.8, marginBottom:10 }} />
                      <EditableText value={content[ek] ?? ''} onSave={v => save(ek,v)} saving={saving===ek} tag="p" multiline={false} placeholder="Companies and arms info…" style={{ fontSize:13, color:'var(--text-dim)', marginBottom:10 }} />
                      <div className="motto">
                        <span className="motto-label">Motto</span>
                        <EditableText value={content[mk] ?? ''} onSave={v => save(mk,v)} saving={saving===mk} tag="span" multiline={false} placeholder="Enter motto…" style={{ fontStyle:'italic' }} />
                      </div>
                      <Link to={`/brigades/${id}`} style={{ marginTop:14, fontSize:9, fontWeight:700, letterSpacing:2, color:'var(--gold)', textTransform:'uppercase', display:'flex', alignItems:'center', gap:6, textDecoration:'none', cursor:'pointer' }}>
                        <span style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--gold-dim),transparent)' }}/>
                        View Full Brigade →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
            {isStaff && (
              <button onClick={addBrigade} style={{ ...addRowBtn, marginTop: 20 }}>+ Add Brigade</button>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}

// ============================================================
// Academy
// ============================================================
export function Academy() {
  const { content, save, saving } = useContent('academy')
  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <EditableText value={content.eyebrow ?? 'Section 1.3 — Academy Information'} onSave={v => save('eyebrow',v)} saving={saving==='eyebrow'} tag="div" multiline={false} className="page-hero-eyebrow" placeholder="Section eyebrow…" />
                <EditableText value={content.title ?? 'Infantry Academy'} onSave={v => save('title',v)} saving={saving==='title'} tag="div" multiline={false} className="page-hero-title" placeholder="Page title…" />
                <EditableText value={content.subtitle ?? 'Training and producing all personnel within the division.'} onSave={v => save('subtitle',v)} saving={saving==='subtitle'} tag="div" multiline={false} className="page-hero-sub" placeholder="Page subtitle…" />
              </div>
              <div className="page-hero-meta">
                <EditableText value={content.meta_strong ?? '2 DEPTS'} onSave={v => save('meta_strong',v)} saving={saving==='meta_strong'} tag="strong" multiline={false} placeholder="Bold label…" />
                <EditableText value={content.meta ?? 'AO · RO'} onSave={v => save('meta',v)} saving={saving==='meta'} tag="span" multiline={false} placeholder="Meta label…" />
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="content-section">
            <EditableImage value={content.banner_img ?? ''} onSave={v => save('banner_img',v)} alt="Academy Banner" height={260} placeholder="Upload academy banner image" />
          </div>

          <div className="content-section">
            <div className="section-label">
              <span className="section-label-num">01</span>
              <span className="section-label-title">Overview</span>
              <div className="section-label-rule"/>
            </div>
            <div className="info-grid">
              <div className="info-card full">
                <div className="info-card-label">Academy Description</div>
                <EditableText value={content.description ?? 'The Infantry Academy is essential to the Luna Sharpshooter Infantry — responsible for producing all personnel within the division. Its main task is to train, develop, and improve future personnel and staff. Known for strictness and professionalism.'} onSave={v => save('description',v)} saving={saving==='description'} tag="p" placeholder="Enter academy description…" />
              </div>
              <div className="info-card">
                <div className="info-card-label">Motto</div>
                <div className="motto">
                  <span className="motto-label">LSI</span>
                  <EditableText value={content.motto ?? ''} onSave={v => save('motto',v)} saving={saving==='motto'} tag="span" multiline={false} placeholder="Enter motto…" style={{ fontStyle:'italic' }} />
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-label">Callsign / Designation</div>
                <EditableText value={content.callsign ?? ''} onSave={v => save('callsign',v)} saving={saving==='callsign'} tag="p" multiline={false} placeholder="Enter callsign…" />
              </div>
            </div>
            <div className="alert" style={{ marginTop:20 }}>
              <p>
                <strong style={{ color:'var(--bright)' }}>Phase Scoring: </strong>
                <EditableText value={content.scoring_info ?? '3 points and above = PASS · 2 points and below = FAIL. Phases are hosted by AO only. Selections by RO only.'} onSave={v => save('scoring_info',v)} saving={saving==='scoring_info'} tag="span" multiline={false} placeholder="Enter scoring policy…" />
              </p>
            </div>
          </div>

          <div className="content-section">
            <div className="section-label">
              <span className="section-label-num">02</span>
              <span className="section-label-title">Departments</span>
              <div className="section-label-rule"/>
            </div>
            <div className="info-grid">
              {[1, 2].map(n => (
                <div className="info-card" key={n}>
                  <div className="info-card-label">
                    <EditableText value={content[`dept_${n}_label`] ?? (n===1 ? 'Academy Department (AO)' : 'Recruitment Department (RO)')} onSave={v => save(`dept_${n}_label`,v)} saving={saving===`dept_${n}_label`} tag="span" multiline={false} placeholder="Department name…" />
                  </div>
                  <EditableImage value={content[`dept_${n}_img`] ?? ''} onSave={v => save(`dept_${n}_img`,v)} alt={`Department ${n}`} height={100} placeholder="Upload dept image" style={{ marginTop:8 }} />
                  <EditableText value={content[`dept_${n}_name`] ?? (n===1 ? 'Academy Officers' : 'Recruitment Officers')} onSave={v => save(`dept_${n}_name`,v)} saving={saving===`dept_${n}_name`} tag="h4" multiline={false} placeholder="Department full name…" style={{ marginTop:10 }} />
                  <EditableText value={content[`dept_${n}_desc`] ?? ''} onSave={v => save(`dept_${n}_desc`,v)} saving={saving===`dept_${n}_desc`} tag="p" placeholder="Describe this department's responsibilities…" />
                  <div className="motto" style={{ marginTop:14 }}>
                    <span className="motto-label">Motto</span>
                    <EditableText value={content[`dept_${n}_motto`] ?? ''} onSave={v => save(`dept_${n}_motto`,v)} saving={saving===`dept_${n}_motto`} tag="span" multiline={false} placeholder="Department motto…" style={{ fontStyle:'italic' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <div className="section-label">
              <span className="section-label-num">03</span>
              <span className="section-label-title">Equipment & Arms</span>
              <div className="section-label-rule"/>
            </div>
            <div className="two-col">
              <div>
                <div className="subheading">Vehicles</div>
                <table className="data-table">
                  <thead><tr><th style={{width:80}}>Photo</th><th>Vehicle</th><th>Role</th></tr></thead>
                  <tbody>
                    {[1,2,3].map(n => (
                      <tr key={n}>
                        <td><EditableImage value={content[`veh_${n}_img`] ?? ''} onSave={v => save(`veh_${n}_img`,v)} alt="vehicle" height={60} placeholder="Upload" style={{width:72}} /></td>
                        <td className="td-label"><EditableText value={content[`veh_${n}_name`] ?? ''} onSave={v => save(`veh_${n}_name`,v)} saving={saving===`veh_${n}_name`} tag="span" multiline={false} placeholder="Vehicle name…" /></td>
                        <td><EditableText value={content[`veh_${n}_role`] ?? ''} onSave={v => save(`veh_${n}_role`,v)} saving={saving===`veh_${n}_role`} tag="span" multiline={false} placeholder="Role…" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <div className="subheading">Weapons</div>
                <table className="data-table">
                  <thead><tr><th style={{width:80}}>Photo</th><th>Weapon</th><th>Type</th></tr></thead>
                  <tbody>
                    {[1,2,3,4].map(n => (
                      <tr key={n}>
                        <td><EditableImage value={content[`wpn_${n}_img`] ?? ''} onSave={v => save(`wpn_${n}_img`,v)} alt="weapon" height={60} placeholder="Upload" style={{width:72}} /></td>
                        <td className="td-label"><EditableText value={content[`wpn_${n}_name`] ?? ''} onSave={v => save(`wpn_${n}_name`,v)} saving={saving===`wpn_${n}_name`} tag="span" multiline={false} placeholder="Weapon name…" /></td>
                        <td><EditableText value={content[`wpn_${n}_type`] ?? ''} onSave={v => save(`wpn_${n}_type`,v)} saving={saving===`wpn_${n}_type`} tag="span" multiline={false} placeholder="Type…" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="content-section">
            <div className="section-label">
              <span className="section-label-num">04</span>
              <span className="section-label-title">Key Personnel</span>
              <div className="section-label-rule"/>
            </div>
            <div className="coc-list">
              {[
                ['Academy Director',         'dir'],
                ['Deputy Academy Director',  'dep_dir'],
                ['Academy Sergeant Major',   'sgm'],
                ['Head — Academy Dept (AO)', 'head_ao'],
                ['Head — Recruitment (RO)',  'head_ro'],
              ].map(([rank, key]) => (
                <div className="coc-row" key={key}>
                  <div className="coc-num">—</div>
                  <div className="coc-rank">{rank}</div>
                  <div className="coc-name">
                    <EditableText value={content[`personnel_${key}`] ?? '[ Vacant ]'} onSave={v => save(`personnel_${key}`,v)} saving={saving===`personnel_${key}`} tag="span" multiline={false} placeholder="[ Vacant ]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <div className="section-label">
              <span className="section-label-num">05</span>
              <span className="section-label-title">Additional Notes</span>
              <div className="section-label-rule"/>
            </div>
            <EditableText value={content.notes ?? ''} onSave={v => save('notes',v)} saving={saving==='notes'} tag="div" placeholder="Any additional notes about the academy…" style={{ minHeight:80 }} />
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}

// ============================================================
// Command — dynamic sections (add / rename / delete)
// ============================================================
const DEFAULT_PA = [
  { rank: 'Commander in Chief',                  name: '[ Vacant ]' },
  { rank: 'Secretary of National Defense',       name: 'JirokoM09' },
  { rank: 'Commanding General, Philippine Army', name: '[ Vacant ]' },
  { rank: 'Deputy Commanding General, PA',       name: '[ Vacant ]' },
  { rank: 'Chief of Staff, Philippine Army',     name: 'VyreKriegs' },
  { rank: 'Sergeant Major, Philippine Army',     name: 'GabrielDogey2230' },
]

const DEFAULT_LSI = [
  { rank: 'Commanding Officer',                    name: '[ Vacant ]' },
  { rank: 'Executive Officer',                     name: '[ Vacant ]' },
  { rank: 'Division Sergeant Major',               name: '[ Vacant ]' },
  { rank: 'Brigade CO / Academic Director',        name: '[ Vacant ]' },
  { rank: 'Brigade XO / Deputy Academic Director', name: '[ Vacant ]' },
  { rank: 'Brigade Sergeant Major',                name: '[ Vacant ]' },
  { rank: 'Company Commanding Officer',            name: '[ Vacant ]' },
  { rank: 'Company Executive Officer',             name: '[ Vacant ]' },
  { rank: 'Instructor',                            name: '[ Vacant ]' },
  { rank: 'Personnel',                             name: '[ Vacant ]' },
]

const DEFAULT_COMMAND_SECTIONS = [
  { title: 'Philippine Army High Command',    chainKey: 'pa_chain' },
  { title: 'LSI Division Chain of Command',  chainKey: 'lsi_chain' },
]

function getDefaultChain(chainKey) {
  if (chainKey === 'pa_chain')  return DEFAULT_PA
  if (chainKey === 'lsi_chain') return DEFAULT_LSI
  return []
}

function ChainSection({ title, num, chainKey, content, save, saving, isStaff, onRenameSection, onDeleteSection, onMoveSection, isFirst, isLast }) {
  const chain = parseJSON(content[chainKey], getDefaultChain(chainKey))

  const updateItem = (idx, field, val) => {
    const updated = chain.map((item, i) => i === idx ? { ...item, [field]: val } : item)
    save(chainKey, JSON.stringify(updated))
  }
  const deleteItem = (idx) => {
    save(chainKey, JSON.stringify(chain.filter((_, i) => i !== idx)))
  }
  const moveItem = (idx, dir) => {
    const newChain = [...chain]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= newChain.length) return
    ;[newChain[idx], newChain[swapIdx]] = [newChain[swapIdx], newChain[idx]]
    save(chainKey, JSON.stringify(newChain))
  }
  const addItem = () => {
    save(chainKey, JSON.stringify([...chain, { rank: 'New Position', name: '[ Vacant ]', roleLabel: 'Brigade Staff' }]))
  }

  return (
    <>
      <div className="section-label" style={{ marginTop: num > 1 ? 48 : 0 }}>
        <span className="section-label-num">3.{num}</span>
        {onRenameSection ? (
          <EditableText value={title} onSave={onRenameSection} saving={saving === 'command_sections'} tag="span" multiline={false} className="section-label-title" placeholder="Section title…" />
        ) : (
          <span className="section-label-title">{title}</span>
        )}
        <div className="section-label-rule"/>
        {isStaff && onDeleteSection && (
          <button onClick={onDeleteSection} style={{ ...delBtn, marginLeft: 12, fontSize: 11 }} title="Delete section">✕ Remove Section</button>
        )}
        {isStaff && onMoveSection && (
          <>
            <button onClick={() => onMoveSection(-1)} disabled={isFirst} title="Move Section Up" style={{ ...delBtn, marginLeft: 6, fontSize: 11, opacity: isFirst ? 0.3 : 1 }}>↑ Section</button>
            <button onClick={() => onMoveSection(1)} disabled={isLast} title="Move Section Down" style={{ ...delBtn, marginLeft: 4, fontSize: 11, opacity: isLast ? 0.3 : 1 }}>↓ Section</button>
          </>
        )}
      </div>
      <div className="coc-list">
        {chain.map((item, idx) => (
          <div key={item.rank + '_' + idx} className="coc-row" style={{ alignItems: 'stretch' }}>
            <div className="coc-num" style={{ display:'flex', alignItems:'center', justifyContent:'center', fontSize: idx === 0 ? 20 : 16, color: idx === 0 ? 'var(--gold)' : 'var(--gold-dim)', fontWeight: idx === 0 ? 700 : 400 }}>
              {String(idx + 1).padStart(2, '0')}
            </div>
            <div className="coc-rank" style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', borderRight:'1px solid var(--border)' }}>
              <EditableText value={item.rank} onSave={v => updateItem(idx, 'rank', v)} saving={saving === chainKey} tag="span" multiline={false} placeholder="Position title…"
                style={{ fontSize:13, fontWeight:700, color:'var(--bright)', letterSpacing:0.5 }} />
              <EditableText value={item.roleLabel ?? (idx === 0 ? 'Division Head' : idx === 1 ? 'Division Staff' : 'Brigade Staff')} onSave={v => updateItem(idx, 'roleLabel', v)} saving={saving === chainKey} tag="div" multiline={false} placeholder="Role label…"
                style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:1, textTransform:'uppercase', marginTop:1 }} />
            </div>
            <div className="coc-name" style={{ display:'flex', flexDirection:'column', justifyContent:'center', minWidth:200 }}>
              <EditableText value={item.name} onSave={v => updateItem(idx, 'name', v)} saving={saving === chainKey} tag="span" multiline={false} placeholder="[ Vacant ]"
                style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, color:'var(--gold-pale)', letterSpacing:2 }} />
              <div style={{ fontSize:8, color:'var(--text-muted)', letterSpacing:1, textTransform:'uppercase', marginTop:2 }}>Username</div>
            </div>
            <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:4 }}>
              {isStaff && (
                <>
                  <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} title="Move Up" style={{ ...delBtn, fontSize:11, padding:'2px 5px', opacity: idx === 0 ? 0.3 : 1 }}>↑</button>
                  <button onClick={() => moveItem(idx, 1)} disabled={idx === chain.length - 1} title="Move Down" style={{ ...delBtn, fontSize:11, padding:'2px 5px', opacity: idx === chain.length - 1 ? 0.3 : 1 }}>↓</button>
                  <button onClick={() => deleteItem(idx)} style={delBtn} title="Delete row">✕</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {isStaff && (
        <button onClick={addItem} style={addRowBtn}>+ Add Row</button>
      )}
    </>
  )
}

export function Command() {
  const { content, save, saving } = useContent('command')
  const { isStaff } = useAuth()

  const sections = parseJSON(content.command_sections, DEFAULT_COMMAND_SECTIONS)

  const saveSections = (updated) => save('command_sections', JSON.stringify(updated))

  const addSection = () => {
    const newKey = `custom_chain_${Date.now()}`
    saveSections([...sections, { title: 'New Chain of Command', chainKey: newKey }])
  }

  const deleteSection = (idx) => {
    if (sections.length <= 1) return
    saveSections(sections.filter((_, i) => i !== idx))
  }

  const renameSection = (idx, newTitle) => {
    saveSections(sections.map((s, i) => i === idx ? { ...s, title: newTitle } : s))
  }

  const moveSection = (idx, dir) => {
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= sections.length) return
    const updated = [...sections]
    ;[updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]]
    saveSections(updated)
  }

  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <EditableText value={content.eyebrow ?? 'Section 3.0 — Command Structure'} onSave={v => save('eyebrow',v)} saving={saving==='eyebrow'} tag="div" multiline={false} className="page-hero-eyebrow" placeholder="Section eyebrow…" />
                <EditableText value={content.title ?? 'Chain of Command'} onSave={v => save('title',v)} saving={saving==='title'} tag="div" multiline={false} className="page-hero-title" placeholder="Page title…" />
                <EditableText value={content.subtitle ?? 'Full command hierarchy of the LSI and the Philippine Army.'} onSave={v => save('subtitle',v)} saving={saving==='subtitle'} tag="div" multiline={false} className="page-hero-sub" placeholder="Page subtitle…" />
              </div>
              <div className="page-hero-meta">
                <EditableText value={content.meta_strong ?? 'HIGH COMMAND'} onSave={v => save('meta_strong',v)} saving={saving==='meta_strong'} tag="strong" multiline={false} placeholder="Bold label…" />
                <EditableText value={content.meta ?? 'LHC'} onSave={v => save('meta',v)} saving={saving==='meta'} tag="span" multiline={false} placeholder="Meta label…" />
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="content-section">
            {sections.map((sec, idx) => (
              <ChainSection
                key={sec.chainKey}
                title={sec.title}
                num={idx + 1}
                chainKey={sec.chainKey}
                content={content} save={save} saving={saving} isStaff={isStaff}
                onRenameSection={isStaff ? (v) => renameSection(idx, v) : null}
                onDeleteSection={isStaff && sections.length > 1 ? () => deleteSection(idx) : null}
                onMoveSection={isStaff ? (dir) => moveSection(idx, dir) : null}
                isFirst={idx === 0}
                isLast={idx === sections.length - 1}
              />
            ))}
            {isStaff && (
              <button onClick={addSection} style={{ ...addRowBtn, marginTop: 32 }}>+ Add Section</button>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}

// ============================================================
// Schedule
// ============================================================
const DEFAULT_SCHEDULE = [
  { day: 'Mon–Fri',  statusType: 'green', statusLabel: 'Regular Day',            description: 'All division personnel, staff, and departments operate at full capacity. No major events before 4:00 PM GMT+8 out of respect for academic schedules.' },
  { day: 'Saturday', statusType: 'red',   statusLabel: 'DoD Rest / HC Hell Day', description: 'Departmental operations halted (optional only). High Command Hell Day: weekly reports, meetings, Flag Ceremony, and Weekly Practice Inspection.' },
  { day: 'Sunday',   statusType: '',      statusLabel: 'Rest Day',               description: 'All operations fully optional. Designated non-working day by the CiC. Rest and spend time with family.' },
]

const smBtnInline = {
  padding: '3px 8px', background: 'rgba(200,149,42,0.2)', border: '1px solid var(--gold-dim)',
  color: 'var(--gold)', cursor: 'pointer', fontSize: 10, fontWeight: 700,
  fontFamily: 'Rajdhani, sans-serif',
}

function ScheduleRow({ row, idx, onUpdate, onDelete, isStaff, saving }) {
  const [editStatus, setEditStatus] = useState(false)
  return (
    <tr>
      <td data-label="Day" className="td-day">
        <EditableText value={row.day} onSave={v => onUpdate(idx, 'day', v)} saving={saving} tag="span" multiline={false} placeholder="Day…" />
      </td>
      <td data-label="Status">
        {isStaff && editStatus ? (
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <select value={row.statusType} onChange={e => onUpdate(idx, 'statusType', e.target.value)}
              style={{ background:'#0f1a0f', border:'1px solid var(--gold-dim)', color:'var(--text)', padding:'4px 6px', fontSize:11 }}>
              <option value="green">Green (Regular)</option>
              <option value="red">Red (Warning)</option>
              <option value="yellow">Yellow (Caution)</option>
              <option value="">Default (Grey)</option>
            </select>
            <EditableText value={row.statusLabel} onSave={v => { onUpdate(idx, 'statusLabel', v); setEditStatus(false) }} saving={saving} tag="span" multiline={false} placeholder="Status label…" />
            <button onClick={() => setEditStatus(false)} style={{ ...smBtnInline, marginTop:2 }}>Done</button>
          </div>
        ) : (
          <span className={`badge ${row.statusType}`}
            onClick={() => isStaff && setEditStatus(true)}
            style={isStaff ? { cursor:'pointer', outline:'1px dashed rgba(200,149,42,0.3)' } : {}}
            title={isStaff ? 'Click to edit status' : ''}>
            {row.statusLabel}
          </span>
        )}
      </td>
      <td data-label="Description" style={{ display:'flex', alignItems:'center', gap:8 }}>
        <EditableText value={row.description} onSave={v => onUpdate(idx, 'description', v)} saving={saving} tag="span" placeholder="Enter day description…" />
        {isStaff && (
          <button onClick={() => onDelete(idx)} style={delBtn} title="Delete row">✕</button>
        )}
      </td>
    </tr>
  )
}

export function Schedule() {
  const { content, save, saving } = useContent('schedule')
  const { isStaff } = useAuth()
  const rows = parseJSON(content.schedule_rows, DEFAULT_SCHEDULE)

  const updateRow = (idx, field, val) => {
    save('schedule_rows', JSON.stringify(rows.map((r, i) => i === idx ? { ...r, [field]: val } : r)))
  }
  const deleteRow = (idx) => {
    save('schedule_rows', JSON.stringify(rows.filter((_, i) => i !== idx)))
  }
  const addRow = () => {
    save('schedule_rows', JSON.stringify([...rows, { day: 'New Day', statusType: 'green', statusLabel: 'Regular Day', description: '' }]))
  }

  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <EditableText value={content.eyebrow ?? 'Section 1.4 — Weekly Operations'} onSave={v => save('eyebrow',v)} saving={saving==='eyebrow'} tag="div" multiline={false} className="page-hero-eyebrow" placeholder="Section eyebrow…" />
                <EditableText value={content.title ?? 'Division Schedule'} onSave={v => save('title',v)} saving={saving==='title'} tag="div" multiline={false} className="page-hero-title" placeholder="Page title…" />
                <EditableText value={content.subtitle ?? 'Official weekly operational schedule — Monday through Sunday.'} onSave={v => save('subtitle',v)} saving={saving==='subtitle'} tag="div" multiline={false} className="page-hero-sub" placeholder="Page subtitle…" />
              </div>
              <div className="page-hero-meta">
                <EditableText value={content.meta_strong ?? 'GMT+8'} onSave={v => save('meta_strong',v)} saving={saving==='meta_strong'} tag="strong" multiline={false} placeholder="Timezone…" />
                <EditableText value={content.meta ?? 'Philippine Time'} onSave={v => save('meta',v)} saving={saving==='meta'} tag="span" multiline={false} placeholder="Time zone label…" />
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="content-section">
            <table className="data-table">
              <thead><tr><th>Day</th><th>Status</th><th>Description</th></tr></thead>
              <tbody>
                {rows.map((row, idx) => (
                  <ScheduleRow key={idx} row={row} idx={idx} onUpdate={updateRow} onDelete={deleteRow} isStaff={isStaff} saving={saving === 'schedule_rows'} />
                ))}
              </tbody>
            </table>
            {isStaff && (
              <button onClick={addRow} style={addRowBtn}>+ Add Row</button>
            )}
            <div className="alert" style={{ marginTop:20 }}>
              <p>
                <EditableText value={content.alert_text ?? 'No major events, phases, or selections before 4:00 PM GMT+8 Monday–Friday, respecting each member\'s academic and personal responsibilities.'} onSave={v => save('alert_text',v)} saving={saving==='alert_text'} tag="span" placeholder="Enter schedule policy note…" />
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}
