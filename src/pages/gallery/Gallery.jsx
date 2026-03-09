import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadToCloudinary } from '../../lib/cloudinary'
import { useAuth } from '../../contexts/AuthContext'
import Footer from '../../components/Footer'
import { useContent } from '../../lib/useContent'
import EditableText from '../../components/EditableText'

const CATEGORIES = ['all','operations','inspection','ceremony','academy','general']

export default function Gallery() {
  const { isStaff, isMember } = useAuth()
  const { content, save, saving } = useContent('gallery_page')
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [lightbox,   setLightbox]   = useState(null)   // item
  const [uploading,  setUploading]  = useState(false)
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState({ title:'', caption:'', image_url:'', category:'general' })
  const [formError,  setFormError]  = useState('')
  const fileRef = useRef()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  // Upload image to Supabase Storage
  const handleFileChange = async e => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setFormError('')
    try {
      const url = await uploadToCloudinary(file)
      setForm(f => ({ ...f, image_url: url }))
    } catch (err) {
      setFormError('Upload failed: ' + err.message)
    }
    setUploading(false)
  }

  const handleAdd = async e => {
    e.preventDefault()
    setFormError('')
    if (!form.image_url) { setFormError('Please upload an image or enter a URL.'); return }
    const { error } = await supabase.from('gallery').insert({ ...form })
    if (error) { setFormError(error.message); return }
    setShowForm(false)
    setForm({ title:'', caption:'', image_url:'', category:'general' })
    load()
  }

  const handleDelete = async id => {
    if (!confirm('Delete this image?')) return
    await supabase.from('gallery').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    if (lightbox?.id === id) setLightbox(null)
  }

  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <EditableText value={content.eyebrow ?? 'Division Media'} onSave={v => save('eyebrow',v)} saving={saving==='eyebrow'} tag="div" multiline={false} className="page-hero-eyebrow" placeholder="Section eyebrow…" />
                <EditableText value={content.title ?? 'Gallery'} onSave={v => save('title',v)} saving={saving==='title'} tag="div" multiline={false} className="page-hero-title" placeholder="Page title…" />
                <EditableText value={content.subtitle ?? 'Official photographs from LSI operations, inspections, ceremonies, and Academy events.'} onSave={v => save('subtitle',v)} saving={saving==='subtitle'} tag="div" multiline={false} className="page-hero-sub" placeholder="Page subtitle…" />
              </div>
              <div className="page-hero-meta"><strong>{items.length}</strong>Photos</div>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding:'40px 40px' }}>

          {/* Filter + Upload bar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:28 }}>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  style={{
                    padding:'5px 14px', fontSize:10, fontWeight:700, letterSpacing:2,
                    textTransform:'uppercase', cursor:'pointer', border:'1px solid',
                    fontFamily:'Rajdhani,sans-serif',
                    background: filter === c ? 'var(--gold)' : 'transparent',
                    color:      filter === c ? '#090d09'    : 'var(--text-dim)',
                    borderColor:filter === c ? 'var(--gold)' : 'var(--border2)',
                  }}>
                  {c}
                </button>
              ))}
            </div>
            {isMember && (
              <button onClick={() => setShowForm(s => !s)}
                style={{ padding:'8px 20px', background:'var(--gold)', color:'#090d09', border:'none', fontSize:11, fontWeight:700, letterSpacing:2, cursor:'pointer', textTransform:'uppercase' }}>
                {showForm ? '✕ Cancel' : '+ Add Photo'}
              </button>
            )}
          </div>

          {/* Upload form */}
          {isMember && showForm && (
            <form onSubmit={handleAdd} style={{ background:'var(--panel)', border:'1px solid var(--border)', borderTop:'2px solid var(--gold)', padding:24, marginBottom:28 }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:3, color:'var(--bright)', marginBottom:20 }}>ADD PHOTO</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <FormField label="Title" value={form.title}   onChange={v => setForm(f=>({...f,title:v}))} />
                <FormField label="Caption" value={form.caption} onChange={v => setForm(f=>({...f,caption:v}))} />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} style={inputStyle}>
                  {CATEGORIES.filter(c=>c!=='all').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={labelStyle}>Upload Image (via Cloudinary)</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange}
                  style={{ ...inputStyle, paddingTop:8 }} />
                {uploading && <div style={{ fontSize:11, color:'var(--gold)', marginTop:6 }}>Uploading…</div>}
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={labelStyle}>— or paste Image URL —</label>
                <input type="url" placeholder="https://..." value={form.image_url}
                  onChange={e => setForm(f=>({...f,image_url:e.target.value}))}
                  style={inputStyle} />
              </div>
              {form.image_url && (
                <img src={form.image_url} alt="preview" style={{ height:80, objectFit:'cover', marginBottom:12, border:'1px solid var(--border)' }} />
              )}
              {formError && <div style={{ color:'#c06060', fontSize:12, marginBottom:10 }}>{formError}</div>}
              <button type="submit" style={{ padding:'9px 24px', background:'var(--gold)', color:'#090d09', border:'none', fontWeight:700, fontSize:11, letterSpacing:2, cursor:'pointer' }}>
                SAVE PHOTO
              </button>
            </form>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{ textAlign:'center', padding:60, color:'var(--gold)', fontFamily:'Bebas Neue,sans-serif', fontSize:22, letterSpacing:3 }}>LOADING…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', fontStyle:'italic', fontSize:13 }}>No photos in this category yet.</div>
          ) : (
            <div style={{ columns:'3 280px', gap:4 }}>
              {filtered.map(item => (
                <div key={item.id} style={{ breakInside:'avoid', marginBottom:4, position:'relative', cursor:'pointer', overflow:'hidden', display:'block' }}
                  onClick={() => setLightbox(item)}>
                  <img src={item.image_url} alt={item.title}
                    style={{ width:'100%', display:'block', transition:'transform 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform='scale(1.03)'}
                    onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                  />
                  {/* Overlay */}
                  <div style={{
                    position:'absolute', inset:0,
                    background:'linear-gradient(0deg,rgba(9,13,9,0.85) 0%,transparent 50%)',
                    opacity:0, transition:'opacity 0.2s',
                    display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:14,
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity=1}
                  onMouseLeave={e => e.currentTarget.style.opacity=0}>
                    {item.title && <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:15, color:'var(--bright)', letterSpacing:2 }}>{item.title}</div>}
                    {item.caption && <div style={{ fontSize:11, color:'var(--text)', marginTop:2 }}>{item.caption}</div>}
                  </div>
                  {/* Staff delete */}
                  {isStaff && (
                    <button onClick={e => { e.stopPropagation(); handleDelete(item.id) }}
                      style={{ position:'absolute', top:8, right:8, background:'rgba(122,20,20,0.85)', border:'none', color:'#fff', width:26, height:26, cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      ✕
                    </button>
                  )}
                  {/* Category tag */}
                  <div style={{ position:'absolute', top:8, left:8, background:'rgba(9,13,9,0.8)', padding:'2px 8px', fontSize:9, fontWeight:700, letterSpacing:2, color:'var(--gold-dim)', textTransform:'uppercase' }}>
                    {item.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:5000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ maxWidth:900, width:'100%', background:'var(--panel)', border:'1px solid var(--border)' }}>
            <img src={lightbox.image_url} alt={lightbox.title} style={{ width:'100%', maxHeight:'70vh', objectFit:'contain', display:'block' }} />
            <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                {lightbox.title   && <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, color:'var(--bright)', letterSpacing:2 }}>{lightbox.title}</div>}
                {lightbox.caption && <div style={{ fontSize:13, color:'var(--text-dim)', fontFamily:'Source Serif 4,serif', fontWeight:300, marginTop:4 }}>{lightbox.caption}</div>}
                <div style={{ fontSize:9, color:'var(--text-muted)', letterSpacing:2, marginTop:6, textTransform:'uppercase' }}>{lightbox.category}</div>
              </div>
              <button onClick={() => setLightbox(null)}
                style={{ background:'none', border:'1px solid var(--border2)', color:'var(--text-dim)', padding:'6px 14px', cursor:'pointer', fontSize:11, letterSpacing:1, fontFamily:'Rajdhani,sans-serif', fontWeight:700 }}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer/>
    </>
  )
}

const labelStyle = { display:'block', fontSize:9, fontWeight:700, letterSpacing:3, color:'var(--gold-dim)', textTransform:'uppercase', marginBottom:6 }
const inputStyle  = {
  width:'100%', background:'var(--bg)', color:'var(--bright)',
  border:'1px solid var(--border2)', padding:'9px 12px',
  fontSize:13, fontFamily:'Rajdhani,sans-serif', outline:'none',
}

function FormField({ label, value, onChange }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={labelStyle}>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} style={inputStyle}
        onFocus={e => e.target.style.borderColor='var(--gold)'}
        onBlur={e  => e.target.style.borderColor='var(--border2)'} />
    </div>
  )
}
