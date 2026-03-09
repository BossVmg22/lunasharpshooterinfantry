import { useState } from 'react'
import { useContent } from '../../lib/useContent'
import { useAuth } from '../../contexts/AuthContext'
import EditableText from '../../components/EditableText'
import EditableImage from '../../components/EditableImage'
import Footer from '../../components/Footer'

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
// Practice Inspection Manual
// ============================================================
export function PIManual() {
  const { content, save, saving } = useContent('pi_manual')
  const { isStaff } = useAuth()

  const stepCount = parseInt(content.step_count ?? '7', 10) || 7
  const steps = Array.from({ length: stepCount }, (_, i) => ({
    n: i + 1,
    titleKey: `step_${i + 1}_title`,
    descKey:  `step_${i + 1}_desc`,
  }))
  const addStep    = () => save('step_count', String(stepCount + 1))
  const removeStep = () => { if (stepCount > 1) save('step_count', String(stepCount - 1)) }

  const uniformCards = [
    { key:'ub', label:'Standard (PFC+)',          titleKey:'pi_unif_b_title', titleDef:'Class B Uniform', descKey:'pi_unif_b_desc', descDef:'Required for all ranks PFC and above. No accessories, no prohibited items. Weapons prohibited during ceremony.', badge:'Class B', imgKey:'pi_unif_b_img' },
    { key:'ua', label:'Senior Officers (LTCOL+)', titleKey:'pi_unif_a_title', titleDef:'Class A Uniform', descKey:'pi_unif_a_desc', descDef:'Required for all staff at Lieutenant Colonel and above. Highest formal uniform of the LSI. Prohibited outside official events.', badge:'Class A', imgKey:'pi_unif_a_img' },
    { key:'uc', label:'Office Staff (OCS/SMC)',   titleKey:'pi_unif_c_title', titleDef:'Class C Uniform', descKey:'pi_unif_c_desc', descDef:'For qualified office-grade officers. Absolutely no weapons permitted under any circumstances.', badge:'Class C', imgKey:'pi_unif_c_img' },
  ]

  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <EditableText value={content.eyebrow ?? '🔒 Members Only — Official Manual'} onSave={v => save('eyebrow',v)} saving={saving==='eyebrow'} tag="div" multiline={false} className="page-hero-eyebrow" placeholder="Section eyebrow…" />
                <EditableText value={content.title ?? 'Practice Inspection Manual'} onSave={v => save('title',v)} saving={saving==='title'} tag="div" multiline={false} className="page-hero-title" placeholder="Page title…" />
                <EditableText value={content.subtitle ?? 'Standard procedures for the Weekly Practice Inspection (WPI) conducted every Saturday under ARCOM authority.'} onSave={v => save('subtitle',v)} saving={saving==='subtitle'} tag="div" multiline={false} className="page-hero-sub" placeholder="Page subtitle…" />
              </div>
              <div className="page-hero-meta">
                <EditableText value={content.meta_strong ?? 'SATURDAY'} onSave={v => save('meta_strong',v)} saving={saving==='meta_strong'} tag="strong" multiline={false} placeholder="Bold label…" />
                <EditableText value={content.meta ?? 'ARCOM Event'} onSave={v => save('meta',v)} saving={saving==='meta'} tag="span" multiline={false} placeholder="Meta label…" />
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="content-section">
            <div className="section-label">
              <EditableText value={content.wpi_num ?? 'WPI'} onSave={v => save('wpi_num',v)} saving={saving==='wpi_num'} tag="span" multiline={false} className="section-label-num" placeholder="§" />
              <EditableText value={content.wpi_title ?? 'Overview'} onSave={v => save('wpi_title',v)} saving={saving==='wpi_title'} tag="span" multiline={false} className="section-label-title" placeholder="Section title…" />
              <div className="section-label-rule"/>
            </div>
            <div className="alert">
              <EditableText value={content.overview ?? ''} onSave={v => save('overview',v)} saving={saving==='overview'} tag="p" placeholder="Enter WPI overview — describe the purpose, authority, and general procedures of the Weekly Practice Inspection…" />
            </div>

            <div className="subheading">Required Uniform</div>
            <div className="info-grid cols3">
              {uniformCards.map(u => (
                <div className="info-card" key={u.key}>
                  <div className="info-card-label">{u.label}</div>
                  <EditableImage value={content[u.imgKey] ?? ''} onSave={v => save(u.imgKey,v)} alt={u.titleDef} height={140} placeholder="Upload uniform image" />
                  <EditableText value={content[u.titleKey] ?? u.titleDef} onSave={v => save(u.titleKey,v)} saving={saving===u.titleKey} tag="h4" multiline={false} placeholder="Uniform class name…" style={{ marginTop:10 }} />
                  <EditableText value={content[u.descKey] ?? u.descDef} onSave={v => save(u.descKey,v)} saving={saving===u.descKey} tag="p" placeholder="Uniform requirements and restrictions…" />
                  <div style={{ marginTop:10 }}><span className="badge gold">{u.badge}</span></div>
                </div>
              ))}
            </div>

            <div className="subheading">WPI Procedure</div>
            <div>
              {steps.map(({ n, titleKey, descKey }) => (
                <div key={n} className="pi-step" style={{ position:'relative' }}>
                  <div className="pi-step-num">{n}</div>
                  <div className="pi-step-body" style={{ flex:1 }}>
                    <EditableText value={content[titleKey] ?? ''} onSave={v => save(titleKey,v)} saving={saving===titleKey} tag="div" multiline={false} className="pi-step-title" placeholder={`Step ${n} title…`} />
                    <EditableText value={content[descKey] ?? ''} onSave={v => save(descKey,v)} saving={saving===descKey} tag="div" className="pi-step-desc" placeholder={`Step ${n} — describe what happens in this step…`} />
                  </div>
                  {isStaff && n === stepCount && stepCount > 1 && (
                    <button onClick={removeStep} style={{ ...delBtn, alignSelf:'center', marginLeft:8 }} title="Remove last step">✕</button>
                  )}
                </div>
              ))}
            </div>
            {isStaff && (
              <button onClick={addStep} style={addRowBtn}>+ Add Step</button>
            )}

            <div className="subheading">Strike Triggers During WPI</div>
            <div className="alert red">
              <EditableText value={content.strike_triggers ?? 'Automatic strike during/after WPI for: Absence without authorization · Incorrect uniform · Unauthorized accessories · Disrespect during Flag Ceremony · Unauthorized weapon carry.'} onSave={v => save('strike_triggers',v)} saving={saving==='strike_triggers'} tag="p" placeholder="List actions that trigger an automatic strike during WPI…" />
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}

// ============================================================
// Personnel Handbook — fully dynamic sections + blocks
// ============================================================
const DEFAULT_HANDBOOK_SECTIONS = [
  {
    id: 'sec_strike',
    num: '2.0',
    title: 'Strike / Quota System',
    intro: 'The strike and quota system governs conduct and performance of all LSI personnel and staff. Failure to meet obligations results in warnings, strikes, and ultimately removal from the division.',
    blocks: [
      { id: 'blk_resp',  heading: 'Division Position Responsibilities', body: '' },
      { id: 'blk_sys',   heading: 'Division Strike System',              body: '' },
      { id: 'blk_quota', heading: 'Brigade / Academy Quota',             body: '' },
    ],
  },
]

export function Handbook() {
  const { content, save, saving } = useContent('handbook')
  const { isStaff } = useAuth()

  const sections = parseJSON(content.handbook_sections, DEFAULT_HANDBOOK_SECTIONS)
  const saveSections = (updated) => save('handbook_sections', JSON.stringify(updated))

  const updateSection     = (sIdx, field, val) => saveSections(sections.map((s, i) => i === sIdx ? { ...s, [field]: val } : s))
  const deleteSection     = (sIdx)              => saveSections(sections.filter((_, i) => i !== sIdx))
  const addSection        = ()                  => saveSections([...sections, { id:`sec_${Date.now()}`, num:`${sections.length + 2}.0`, title:'New Section', intro:'', blocks:[{ id:`blk_${Date.now()}`, heading:'New Subsection', body:'' }] }])
  const updateBlock       = (sIdx, bIdx, field, val) => saveSections(sections.map((s, i) => i !== sIdx ? s : { ...s, blocks: s.blocks.map((b, j) => j === bIdx ? { ...b, [field]: val } : b) }))
  const deleteBlock       = (sIdx, bIdx)        => saveSections(sections.map((s, i) => i !== sIdx ? s : { ...s, blocks: s.blocks.filter((_, j) => j !== bIdx) }))
  const addBlock          = (sIdx)              => saveSections(sections.map((s, i) => i !== sIdx ? s : { ...s, blocks: [...s.blocks, { id:`blk_${Date.now()}`, heading:'New Subsection', body:'' }] }))

  const sigs = [
    { tk:'sig_1_title', td:'Commanding Officer',      nk:'sig_1_name', nd:'Luna Sharpshooters Infantry', ik:'sig_1_img' },
    { tk:'sig_2_title', td:'Infantry Sergeant Major', nk:'sig_2_name', nd:'VincentPlayerZFX',            ik:'sig_2_img' },
  ]

  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <EditableText value={content.eyebrow ?? '🔒 Members Only — Official Document'} onSave={v => save('eyebrow',v)} saving={saving==='eyebrow'} tag="div" multiline={false} className="page-hero-eyebrow" placeholder="Section eyebrow…" />
                <EditableText value={content.title ?? 'Personnel Handbook'} onSave={v => save('title',v)} saving={saving==='title'} tag="div" multiline={false} className="page-hero-title" placeholder="Page title…" />
                <EditableText value={content.subtitle ?? 'Rules, regulations, strike system, and operational guidelines for all LSI personnel and staff.'} onSave={v => save('subtitle',v)} saving={saving==='subtitle'} tag="div" multiline={false} className="page-hero-sub" placeholder="Page subtitle…" />
              </div>
              <div className="page-hero-meta">
                <EditableText value={content.meta_strong ?? 'RESTRICTED'} onSave={v => save('meta_strong',v)} saving={saving==='meta_strong'} tag="strong" multiline={false} placeholder="Bold label…" />
                <EditableText value={content.meta ?? 'Property of LSI'} onSave={v => save('meta',v)} saving={saving==='meta'} tag="span" multiline={false} placeholder="Meta label…" />
              </div>
            </div>
          </div>
        </div>

        <div className="container">

          {/* Dynamic sections */}
          {sections.map((sec, sIdx) => (
            <div className="content-section" key={sec.id}>
              <div className="section-label">
                <EditableText value={sec.num} onSave={v => updateSection(sIdx,'num',v)} saving={saving==='handbook_sections'} tag="span" multiline={false} className="section-label-num" placeholder="§" />
                <EditableText value={sec.title} onSave={v => updateSection(sIdx,'title',v)} saving={saving==='handbook_sections'} tag="span" multiline={false} className="section-label-title" placeholder="Section title…" />
                <div className="section-label-rule"/>
                {isStaff && sections.length > 1 && (
                  <button onClick={() => deleteSection(sIdx)} style={{ ...delBtn, marginLeft:12, fontSize:11 }}>✕ Remove Section</button>
                )}
              </div>
              <div className="alert">
                <EditableText value={sec.intro} onSave={v => updateSection(sIdx,'intro',v)} saving={saving==='handbook_sections'} tag="p" placeholder="Enter section introduction…" />
              </div>
              {sec.blocks.map((blk, bIdx) => (
                <div key={blk.id}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:20 }}>
                    <div className="subheading" style={{ margin:0, flex:1 }}>
                      <EditableText value={blk.heading} onSave={v => updateBlock(sIdx,bIdx,'heading',v)} saving={saving==='handbook_sections'} tag="span" multiline={false} placeholder="Subsection heading…" />
                    </div>
                    {isStaff && sec.blocks.length > 1 && (
                      <button onClick={() => deleteBlock(sIdx,bIdx)} style={delBtn}>✕</button>
                    )}
                  </div>
                  <EditableText value={blk.body} onSave={v => updateBlock(sIdx,bIdx,'body',v)} saving={saving==='handbook_sections'} tag="div" placeholder="Enter content for this subsection — rules, procedures, or guidelines…" style={{ minHeight:60 }} />
                </div>
              ))}
              {isStaff && (
                <button onClick={() => addBlock(sIdx)} style={{ ...addRowBtn, marginTop:12 }}>+ Add Subsection</button>
              )}
            </div>
          ))}

          {isStaff && (
            <div style={{ margin:'8px 0 24px' }}>
              <button onClick={addSection} style={addRowBtn}>+ Add Section</button>
            </div>
          )}

          {/* Signatures — always present at bottom */}
          <div className="content-section">
            <div className="section-label">
              <EditableText value={content.sig_num ?? '4.0'} onSave={v => save('sig_num',v)} saving={saving==='sig_num'} tag="span" multiline={false} className="section-label-num" placeholder="§" />
              <EditableText value={content.sig_title ?? 'Signatures'} onSave={v => save('sig_title',v)} saving={saving==='sig_title'} tag="span" multiline={false} className="section-label-title" placeholder="Section title…" />
              <div className="section-label-rule"/>
            </div>
            <EditableText value={content.sig_intro ?? 'By acknowledging this handbook, the undersigned confirms they have read, understood, and agreed to comply with all rules, regulations, and standards of the Luna Sharpshooters Infantry.'} onSave={v => save('sig_intro',v)} saving={saving==='sig_intro'} tag="p" className="body-text" placeholder="Signature acknowledgment text…" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 60px 1fr', marginTop:40 }}>
              {sigs.map(({ tk, td, nk, nd, ik }, i) => (
                <>
                  {i === 1 && <div key="gap"/>}
                  <div key={tk} style={{ textAlign:'center' }}>
                    <EditableImage value={content[ik] ?? ''} onSave={v => save(ik,v)} alt="Signature" height={90} placeholder="Upload signature image" style={{ marginBottom:8, background:'transparent', border:'1px dashed var(--border)' }} />
                    <div style={{ height:1, background:'var(--text-dim)', marginBottom:8 }}/>
                    <EditableText value={content[tk] ?? td} onSave={v => save(tk,v)} saving={saving===tk} tag="div" multiline={false} placeholder="Title…" style={{ fontFamily:'Source Serif 4,serif', fontSize:13, color:'var(--text-dim)', fontStyle:'italic' }} />
                    <EditableText value={content[nk] ?? nd} onSave={v => save(nk,v)} saving={saving===nk} tag="div" multiline={false} placeholder="Name…" style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }} />
                  </div>
                </>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}

// ============================================================
// Uniform Regulations — dynamic sections, rows, headers
// ============================================================
const DEFAULT_UNIFORM_SECTIONS = [
  {
    id: 'sec_formal',
    heading: 'Formal Uniforms',
    cols: ['Uniform', 'Eligible Personnel', 'Description'],
    rows: [
      { id:'r1', col1:'Class C Uniform', col2:'OCS / SMC Graduates', col3:'Used for office work and programs within the fort. Absolutely no weapons permitted.', img:'' },
      { id:'r2', col1:'Class B Uniform', col2:'PFC and above',        col3:'Used for WPI, Flag Ceremony, and formal events. Prohibited outside official events.',     img:'' },
      { id:'r3', col1:'Class A Uniform', col2:'LTCOL and above',      col3:'Used for WPI, Flag Ceremony, and formal events. Prohibited outside official events.',     img:'' },
    ],
  },
  {
    id: 'sec_bdu',
    heading: 'Operational / BDU Uniforms',
    cols: ['Uniform', 'Eligible Personnel', 'Description'],
    rows: [
      { id:'r1', col1:'BDU + Beret',         col2:'Staff Only',        col3:'Worn by staff while on duty. Personnel and cadets strictly prohibited.',              img:'' },
      { id:'r2', col1:'BDU + Helmet + Vest',  col2:'Graduated Members', col3:'Worn by members assigned to a brigade. May be used during events or regular duties.', img:'' },
      { id:'r3', col1:'Full BDU',             col2:'Cadets Only',       col3:'Exclusively for Division Cadets. All personnel and staff are prohibited.',             img:'' },
    ],
  },
  {
    id: 'sec_wait',
    heading: 'Brigade Waiting Uniforms',
    note: 'Pending re-addition in-game. Will be enforced upon release.',
    cols: ['Unit', 'Headgear', 'Full Composition'],
    rows: [
      { id:'r1', col1:'101st Brigade',   col2:'Patrol Cap', col3:'LSI BDU + LSI Vest + Patrol Cap', img:'' },
      { id:'r2', col1:'102nd Brigade',   col2:'Bonnie Hat', col3:'LSI BDU + LSI Vest + Bonnie Hat', img:'' },
      { id:'r3', col1:'104th Brigade',   col2:'Helmet',     col3:'LSI BDU + Helmet',                img:'' },
      { id:'r4', col1:'Staff / Officer', col2:'LSI Beret',  col3:'LSI Beret + Class C Uniform',     img:'' },
    ],
  },
]

export function Uniforms() {
  const { content, save, saving } = useContent('uniforms')
  const { isStaff } = useAuth()

  const sections = parseJSON(content.uniform_sections, DEFAULT_UNIFORM_SECTIONS)
  const saveSections = (updated) => save('uniform_sections', JSON.stringify(updated))

  const updateSectionField = (sIdx, field, val) => saveSections(sections.map((s, i) => i === sIdx ? { ...s, [field]: val } : s))
  const deleteSection      = (sIdx)              => saveSections(sections.filter((_, i) => i !== sIdx))
  const addSection         = ()                  => saveSections([...sections, { id:`sec_${Date.now()}`, heading:'New Uniform Category', cols:['Uniform','Eligible Personnel','Description'], rows:[{ id:`r_${Date.now()}`, col1:'New Uniform', col2:'All Personnel', col3:'Enter description here…', img:'' }] }])
  const updateRow          = (sIdx, rIdx, field, val) => saveSections(sections.map((s, i) => i !== sIdx ? s : { ...s, rows: s.rows.map((r, j) => j === rIdx ? { ...r, [field]: val } : r) }))
  const deleteRow          = (sIdx, rIdx)        => saveSections(sections.map((s, i) => i !== sIdx ? s : { ...s, rows: s.rows.filter((_, j) => j !== rIdx) }))
  const addRow             = (sIdx)              => saveSections(sections.map((s, i) => i !== sIdx ? s : { ...s, rows: [...s.rows, { id:`r_${Date.now()}`, col1:'New Uniform', col2:'All Personnel', col3:'Enter description here…', img:'' }] }))
  const updateCol          = (sIdx, cIdx, val)   => saveSections(sections.map((s, i) => { if (i !== sIdx) return s; const cols=[...(s.cols||[])]; cols[cIdx]=val; return { ...s, cols } }))

  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <EditableText value={content.eyebrow ?? '🔒 Members Only — Section 1.5'} onSave={v => save('eyebrow',v)} saving={saving==='eyebrow'} tag="div" multiline={false} className="page-hero-eyebrow" placeholder="Section eyebrow…" />
                <EditableText value={content.title ?? 'Uniform Regulations'} onSave={v => save('title',v)} saving={saving==='title'} tag="div" multiline={false} className="page-hero-title" placeholder="Page title…" />
                <EditableText value={content.subtitle ?? 'All personnel are required to wear assigned uniforms at all times. No exemptions except PF/VIP individuals.'} onSave={v => save('subtitle',v)} saving={saving==='subtitle'} tag="div" multiline={false} className="page-hero-sub" placeholder="Page subtitle…" />
              </div>
              <div className="page-hero-meta">
                <EditableText value={content.meta_strong ?? 'MANDATORY'} onSave={v => save('meta_strong',v)} saving={saving==='meta_strong'} tag="strong" multiline={false} placeholder="Bold label…" />
                <EditableText value={content.meta ?? 'Always in Effect'} onSave={v => save('meta',v)} saving={saving==='meta'} tag="span" multiline={false} placeholder="Meta label…" />
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="content-section">
            <div className="alert">
              <EditableText value={content.uniforms_alert ?? 'Only CXO+OCS GRAD officers may wear custom uniforms. Wearing prohibited uniforms, skin tones, hairstyles, or accessories will result in consequences based on severity.'} onSave={v => save('uniforms_alert',v)} saving={saving==='uniforms_alert'} tag="p" placeholder="Enter general uniform policy notice…" />
            </div>

            {sections.map((sec, sIdx) => (
              <div key={sec.id} style={{ marginTop:28 }}>
                {/* Section heading */}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <div className="subheading" style={{ margin:0, flex:1 }}>
                    <EditableText value={sec.heading} onSave={v => updateSectionField(sIdx,'heading',v)} saving={saving==='uniform_sections'} tag="span" multiline={false} placeholder="Category heading…" />
                  </div>
                  {isStaff && sections.length > 1 && (
                    <button onClick={() => deleteSection(sIdx)} style={{ ...delBtn, fontSize:11 }}>✕ Remove Category</button>
                  )}
                </div>

                {/* Optional note */}
                {'note' in sec && (
                  <EditableText value={sec.note} onSave={v => updateSectionField(sIdx,'note',v)} saving={saving==='uniform_sections'} tag="p" className="body-text" placeholder="Optional note for this category…" style={{ marginBottom:10 }} />
                )}

                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width:90 }}>Photo</th>
                      {(sec.cols || ['Col 1','Col 2','Col 3']).map((col, cIdx) => (
                        <th key={cIdx}>
                          <EditableText value={col} onSave={v => updateCol(sIdx,cIdx,v)} saving={saving==='uniform_sections'} tag="span" multiline={false} placeholder="Header…" />
                        </th>
                      ))}
                      {isStaff && <th style={{ width:32 }}/>}
                    </tr>
                  </thead>
                  <tbody>
                    {sec.rows.map((row, rIdx) => (
                      <tr key={row.id}>
                        <td>
                          <EditableImage value={row.img ?? ''} onSave={v => updateRow(sIdx,rIdx,'img',v)} alt={row.col1} height={72} placeholder="Upload" style={{ width:80 }} />
                        </td>
                        <td data-label={sec.cols?.[0] ?? 'Col 1'} className="td-label">
                          <EditableText value={row.col1 ?? ''} onSave={v => updateRow(sIdx,rIdx,'col1',v)} saving={saving==='uniform_sections'} tag="span" multiline={false} placeholder="Enter value…" />
                        </td>
                        <td data-label={sec.cols?.[1] ?? 'Col 2'} className="td-accent">
                          <EditableText value={row.col2 ?? ''} onSave={v => updateRow(sIdx,rIdx,'col2',v)} saving={saving==='uniform_sections'} tag="span" multiline={false} placeholder="Enter value…" />
                        </td>
                        <td data-label={sec.cols?.[2] ?? 'Col 3'}>
                          <EditableText value={row.col3 ?? ''} onSave={v => updateRow(sIdx,rIdx,'col3',v)} saving={saving==='uniform_sections'} tag="span" placeholder="Enter value…" />
                        </td>
                        {isStaff && (
                          <td>
                            {sec.rows.length > 1 && (
                              <button onClick={() => deleteRow(sIdx,rIdx)} style={delBtn} title="Delete row">✕</button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {isStaff && (
                  <button onClick={() => addRow(sIdx)} style={addRowBtn}>+ Add Row</button>
                )}
              </div>
            ))}

            {isStaff && (
              <div style={{ marginTop:24 }}>
                <button onClick={addSection} style={addRowBtn}>+ Add Uniform Category</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}
