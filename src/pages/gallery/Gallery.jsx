import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadToCloudinary, optimizeCloudinaryUrl } from '../../lib/cloudinary'
import { useAuth } from '../../contexts/AuthContext'
import { useContent } from '../../lib/useContent'
import { useLightbox } from '../../contexts/LightboxContext'
import EditableText from '../../components/EditableText'
import { SkeletonGalleryItem } from '../../components/Skeleton'
import Footer from '../../components/Footer'

const DEFAULT_CATEGORIES = ['all','operations','inspection','ceremony','academy','general']

export default function Gallery() {
  const { isStaff, isMember, isAdmin } = useAuth()
  const { content, save, saving } = useContent('gallery_page')
  const { content: gallerySettings, save: saveSettings } = useContent('gallery_settings')
  const { open: openLightbox } = useLightbox()

  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [uploading,  setUploading]  = useState(false)
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState({ title:'', caption:'', image_url:'', category:'general' })
  const [formError,  setFormError]  = useState('')
  const [showCatMgr, setShowCatMgr] = useState(false)
  const [newCat,     setNewCat]     = useState('')
  const fileRef = useRef()

  // Load categories from Supabase content, fallback to defaults
  const categories = (() => {
    if (!gallerySettings.categories) return DEFAULT_CATEGORIES
    try { return JSON.parse(gallerySettings.categories) } catch { return DEFAULT_CATEGORIES }
  })()

  const addCategory = () => {
    const trimmed = newCat.trim().toLowerCase().replace(/\s+/g, '-')
    if (!trimmed || categories.includes(trimmed)) return
    const updated = [...categories, trimmed]
    saveSettings('categories', JSON.stringify(updated))
    setNewCat('')
  }

  const removeCategory = (cat) => {
    if (cat === 'all') return
    const updated = categories.filter(c => c !== cat)
    saveSettings('categories', JSON.stringify(updated))
    if (filter === cat) setFilter('all')
  }

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

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
              {categories.map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  style={{
                    padding:'5px 14px', fontSize:10, fontWeight:700, letterSpacing:2,
                    textTransform:'uppercase', cursor:'pointer', border:'1px solid',
                    fontFamily:'Rajdhani,sans-serif',
                    background: filter === c ? 'var(--gold)' : 'transparent',
                    color:      filter === c ? '#090d09'    : 'var(--text-dim)',
                    borderColor:filter === c ? 'var(--gold)' : 'var(--border2)',
                    transition:'all 0.15s',
                  }}>
                  {c}
                </button>
              ))}
              {/* Admin: manage categories */}
              {isAdmin && (
                <button onClick={() => setShowCatMgr(s => !s)}
                  style={{ padding:'5px 10px', fontSize:10, fontWeight:700, letterSpacing:1, cursor:'pointer', border:'1px dashed var(--gold-dim)', background:'transparent', color:'var(--gold-dim)', fontFamily:'Rajdhani,sans-serif' }}
                  title="Manage categories">
                  ⚙
                </button>
              )}
            </div>
            {isMember && (
              <button onClick={() => setShowForm(s => !s)}
                style={{ padding:'8px 20px', background:'var(--gold)', color:'#090d09', border:'none', fontSize:11, fontWeight:700, letterSpacing:2, cursor:'pointer', textTransform:'uppercase' }}>
                {showForm ? '✕ Cancel' : '+ Add Photo'}
              </button>
            )}
          </div>

          {/* Admin: Category manager */}
          {isAdmin && showCatMgr && (
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderTop:'2px solid var(--gold-dim)', padding:20, marginBottom:24 }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:3, color:'var(--bright)', marginBottom:14 }}>MANAGE CATEGORIES</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
                {categories.filter(c => c !== 'all').map(c => (
                  <div key={c} style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', border:'1px solid var(--border2)', background:'var(--bg2)' }}>
                    <span style={{ fontSize:11, fontWeight:700, letterSpacing:1, color:'var(--text)', textTransform:'uppercase' }}>{c}</span>
                    <button onClick={() => removeCategory(c)}
                      style={{ background:'none', border:'none', color:'#c06060', cursor:'pointer', fontSize:11, padding:'0 2px', lineHeight:1 }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input
                  type="text" value={newCat} onChange={e => setNewCat(e.target.value)}
                  placeholder="New category name…"
                  onKeyDown={e => e.key === 'Enter' && addCategory()}
                  style={{ flex:1, background:'var(--bg)', border:'1px solid var(--border2)', color:'var(--bright)', padding:'7px 12px', fontSize:12, fontFamily:'Rajdhani,sans-serif', outline:'none' }}
                />
                <button onClick={addCategory}
                  style={{ padding:'7px 18px', background:'var(--gold)', color:'#090d09', border:'none', fontSize:11, fontWeight:700, letterSpacing:1, cursor:'pointer', fontFamily:'Rajdhani,sans-serif' }}>
                  + ADD
                </button>
              </div>
            </div>
          )}

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
                  {categories.filter(c=>c!=='all').map(c => <option key={c} value={c}>{c}</option>)}
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
                <img src={optimizeCloudinaryUrl(form.image_url, 200)} alt="preview" style={{ height:80, objectFit:'cover', marginBottom:12, border:'1px solid var(--border)' }} />
              )}
              {formError && <div style={{ color:'#c06060', fontSize:12, marginBottom:10 }}>{formError}</div>}
              <button type="submit" style={{ padding:'9px 24px', background:'var(--gold)', color:'#090d09', border:'none', fontWeight:700, fontSize:11, letterSpacing:2, cursor:'pointer' }}>
                SAVE PHOTO
              </button>
            </form>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{ columns:'3 280px', gap:4 }}>
              {Array.from({ length: 9 }).map((_, i) => <SkeletonGalleryItem key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', fontStyle:'italic', fontSize:13 }}>No photos in this category yet.</div>
          ) : (
            <div style={{ columns:'3 280px', gap:4 }}>
              {filtered.map(item => (
                <div key={item.id} className="gallery-item" style={{ breakInside:'avoid', marginBottom:4, position:'relative', cursor:'zoom-in', overflow:'hidden', display:'block' }}
                  onClick={() => openLightbox(optimizeCloudinaryUrl(item.image_url, 1200), item.title, item.caption)}>
                  <img
                    src={optimizeCloudinaryUrl(item.image_url, 600)}
                    alt={item.title}
                    loading="lazy"
                    style={{ width:'100%', display:'block', transition:'transform 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform='scale(1.04)'}
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
