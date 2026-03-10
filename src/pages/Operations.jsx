import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'
import { useAuth } from '../contexts/AuthContext'
import { useContent } from '../lib/useContent'
import EditableText from '../components/EditableText'
import { SkeletonCard } from '../components/Skeleton'
import Footer from '../components/Footer'

// ── helpers ──────────────────────────────────────────────────
const CATS = ['all','mission','announcement','news']
const CAT_COLORS = { mission:'var(--gold)', announcement:'#c06060', news:'#6ab46a' }

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ═══════════════════════════════════════════════════════
// POSTS LIST
// ═══════════════════════════════════════════════════════
export function Operations() {
  const { isStaff } = useAuth()
  const { content, save, saving } = useContent('operations_page')
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    let q = supabase.from('posts').select('id,title,slug,excerpt,category,status,created_at').order('created_at', { ascending:false })
    if (!isStaff) q = q.eq('status','published')
    const { data } = await q
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [isStaff])

  const filtered = posts.filter(p => {
    const matchCat    = filter === 'all' || p.category === filter
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt ?? '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleDelete = async (e, id) => {
    e.stopPropagation(); e.preventDefault()
    if (!confirm('Delete this post?')) return
    await supabase.from('posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-row">
              <div>
                <EditableText value={content.eyebrow ?? 'Division Dispatches'} onSave={v => save('eyebrow',v)} saving={saving==='eyebrow'} tag="div" multiline={false} className="page-hero-eyebrow" placeholder="Section eyebrow…" />
                <EditableText value={content.title ?? 'Operations & News'} onSave={v => save('title',v)} saving={saving==='title'} tag="div" multiline={false} className="page-hero-title" placeholder="Page title…" />
                <EditableText value={content.subtitle ?? 'Mission reports, announcements, and division news — publicly available.'} onSave={v => save('subtitle',v)} saving={saving==='subtitle'} tag="div" multiline={false} className="page-hero-sub" placeholder="Page subtitle…" />
              </div>
              <div className="page-hero-meta"><strong>{posts.filter(p=>p.status==='published').length}</strong>Posts</div>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding:'40px 40px' }}>
          {/* Toolbar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:28 }}>
            {/* Left: categories + search */}
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', flex:1 }}>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {CATS.map(c => (
                  <button key={c} onClick={() => setFilter(c)}
                    style={{
                      padding:'5px 14px', fontSize:10, fontWeight:700, letterSpacing:2,
                      textTransform:'uppercase', cursor:'pointer', border:'1px solid',
                      fontFamily:'Rajdhani,sans-serif',
                      background: filter===c ? 'var(--gold)' : 'transparent',
                      color:      filter===c ? '#090d09'    : 'var(--text-dim)',
                      borderColor:filter===c ? 'var(--gold)' : 'var(--border2)',
                      transition:'all 0.15s',
                    }}>
                    {c}
                  </button>
                ))}
              </div>
              {/* Search bar */}
              <div style={{ position:'relative', flex:'1', minWidth:180, maxWidth:320 }}>
                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'var(--text-muted)', pointerEvents:'none' }}>🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search posts…"
                  style={{
                    width:'100%', paddingLeft:30, paddingRight:search ? 28 : 10,
                    paddingTop:5, paddingBottom:5,
                    background:'var(--bg2)', border:'1px solid var(--border2)',
                    color:'var(--text)', fontSize:12, fontFamily:'Rajdhani,sans-serif',
                    outline:'none', letterSpacing:0.5,
                    transition:'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor='var(--gold-dim)'}
                  onBlur={e => e.target.style.borderColor='var(--border2)'}
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:12, padding:0, lineHeight:1 }}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            {isStaff && (
              <button onClick={() => navigate('/operations/new')}
                style={{ padding:'8px 20px', background:'var(--gold)', color:'#090d09', border:'none', fontSize:11, fontWeight:700, letterSpacing:2, cursor:'pointer', textTransform:'uppercase', whiteSpace:'nowrap' }}>
                + New Post
              </button>
            )}
          </div>

          {/* Search result count */}
          {search && !loading && (
            <div style={{ fontSize:11, color:'var(--text-muted)', letterSpacing:1, marginBottom:16 }}>
              {filtered.length === 0
                ? `No results for "${search}"`
                : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"`}
            </div>
          )}

          {/* Posts grid */}
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:1, background:'var(--border)', border:'1px solid var(--border)' }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', fontStyle:'italic', fontSize:13 }}>
              {search ? `No posts match "${search}"` : 'No posts yet.'}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:1, background:'var(--border)', border:'1px solid var(--border)' }}>
              {filtered.map(post => (
                <Link key={post.id} to={`/operations/${post.slug}`}
                  className="post-card"
                  style={{ textDecoration:'none', display:'block', background:'var(--panel)' }}>
                  <div style={{ padding:'24px 24px 20px', position:'relative' }}>
                    {isStaff && post.status === 'draft' && (
                      <span style={{ position:'absolute', top:16, right:16, fontSize:9, fontWeight:700, letterSpacing:2, padding:'2px 8px', border:'1px solid var(--border2)', color:'var(--text-muted)', textTransform:'uppercase' }}>
                        DRAFT
                      </span>
                    )}
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:3, color: CAT_COLORS[post.category] ?? 'var(--gold)', textTransform:'uppercase', marginBottom:10 }}>
                      {post.category}
                    </div>
                    <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, color:'var(--bright)', letterSpacing:2, lineHeight:1.1, marginBottom:10 }}>
                      {post.title}
                    </div>
                    <p style={{ fontFamily:'Source Serif 4,serif', fontSize:13, fontWeight:300, color:'var(--text-dim)', lineHeight:1.7 }}>
                      {post.excerpt}
                    </p>
                    <div style={{ marginTop:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:1 }}>
                        {new Date(post.created_at).toLocaleDateString('en-PH', { day:'numeric', month:'short', year:'numeric' })}
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        {isStaff && (
                          <>
                            <span onClick={e => { e.preventDefault(); navigate(`/operations/edit/${post.id}`) }}
                              style={{ fontSize:10, fontWeight:700, letterSpacing:1, color:'var(--gold-dim)', cursor:'pointer', padding:'2px 8px', border:'1px solid var(--border2)' }}>
                              EDIT
                            </span>
                            <span onClick={e => handleDelete(e, post.id)}
                              style={{ fontSize:10, fontWeight:700, letterSpacing:1, color:'#c06060', cursor:'pointer', padding:'2px 8px', border:'1px solid rgba(192,96,96,0.3)' }}>
                              DELETE
                            </span>
                          </>
                        )}
                        <span style={{ fontSize:10, fontWeight:700, letterSpacing:1, color:'var(--gold)' }}>READ →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  )
}

// ═══════════════════════════════════════════════════════
// SINGLE POST
// ═══════════════════════════════════════════════════════
export function PostDetail() {
  const { slug } = useParams()
  const { isStaff } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('posts').select('*').eq('slug', slug).single()
      .then(({ data }) => { setPost(data); setLoading(false) })
  }, [slug])

  if (loading) return (
    <div className="page-wrap">
      <div style={{ padding:'44px 0 36px', background:'var(--bg2)', borderBottom:'1px solid var(--border)' }}>
        <div className="container">
          <div className="skeleton" style={{ width:120, height:12, marginBottom:20 }} />
          <div className="skeleton" style={{ width:'60%', height:48, marginBottom:16 }} />
          <div className="skeleton" style={{ width:140, height:12 }} />
        </div>
      </div>
      <div className="container" style={{ padding:'52px 40px', maxWidth:780 }}>
        <div className="skeleton" style={{ width:'100%', height:320, marginBottom:36 }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: i % 3 === 2 ? '70%' : '100%', height:16, marginBottom:14 }} />
        ))}
      </div>
    </div>
  )
  if (!post) return <div style={{ padding:120, textAlign:'center', color:'var(--text-dim)', fontSize:14 }}>Post not found.</div>

  return (
    <>
      <div className="page-wrap">
        <div style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'44px 0 36px', position:'relative' }}>
          {post.cover_url && (
            <div style={{ position:'absolute', inset:0, backgroundImage:`url(${post.cover_url})`, backgroundSize:'cover', backgroundPosition:'center', opacity:0.12 }}/>
          )}
          <div className="container" style={{ position:'relative', zIndex:1 }}>
            <Link to="/operations" style={{ fontSize:11, color:'var(--text-muted)', letterSpacing:1.5, display:'inline-flex', alignItems:'center', gap:6, marginBottom:20 }}>
              ← Back to Operations
            </Link>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, color: CAT_COLORS[post.category] ?? 'var(--gold)', textTransform:'uppercase', marginBottom:10 }}>
              {post.category}
              {isStaff && post.status === 'draft' && <span style={{ marginLeft:10, color:'var(--text-muted)' }}>[DRAFT]</span>}
            </div>
            <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(32px,5vw,56px)', letterSpacing:4, color:'var(--bright)', lineHeight:1, marginBottom:16 }}>
              {post.title}
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <span style={{ fontSize:11, color:'var(--text-muted)', letterSpacing:1 }}>
                {new Date(post.created_at).toLocaleDateString('en-PH', { day:'numeric', month:'long', year:'numeric' })}
              </span>
              {isStaff && (
                <button onClick={() => navigate(`/operations/edit/${post.id}`)}
                  style={{ padding:'4px 14px', background:'rgba(200,149,42,0.1)', border:'1px solid var(--gold-dim)', color:'var(--gold)', fontSize:10, fontWeight:700, letterSpacing:2, cursor:'pointer', fontFamily:'Rajdhani,sans-serif' }}>
                  ✏ Edit Post
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container" style={{ padding:'52px 40px', maxWidth:780 }}>
          {post.cover_url && (
            <img src={post.cover_url} alt={post.title}
              style={{ width:'100%', maxHeight:420, objectFit:'cover', marginBottom:36, border:'1px solid var(--border)' }}/>
          )}
          <div style={{ fontFamily:'Source Serif 4,serif', fontSize:16, fontWeight:300, color:'var(--text)', lineHeight:2 }}>
            {(post.body ?? '').split('\n').map((line, i) => (
              line.trim() ? <p key={i} style={{ marginBottom:18 }}>{line}</p> : <br key={i}/>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}

// ═══════════════════════════════════════════════════════
// POST EDITOR (new + edit)
// ═══════════════════════════════════════════════════════
export function PostEditor() {
  const { id } = useParams()
  const isNew  = !id
  const navigate = useNavigate()
  const { isStaff } = useAuth()

  const [form,    setForm]    = useState({ title:'', slug:'', excerpt:'', body:'', cover_url:'', category:'mission', status:'published' })
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (!isNew) {
      supabase.from('posts').select('*').eq('id', id).single()
        .then(({ data }) => { if (data) setForm(data); setLoading(false) })
    }
  }, [id])

  const f = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val }
      if (key === 'title' && isNew) next.slug = slugify(val)
      return next
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true); setError('')
    const payload = { ...form, updated_at: new Date().toISOString() }
    let err
    if (isNew) {
      const res = await supabase.from('posts').insert(payload)
      err = res.error
    } else {
      const res = await supabase.from('posts').update(payload).eq('id', id)
      err = res.error
    }
    if (err) { setError(err.message); setSaving(false); return }
    navigate(`/operations/${form.slug}`)
  }

  if (!isStaff) return <div style={{ padding:80, textAlign:'center', color:'#c06060', fontFamily:'Bebas Neue,sans-serif', fontSize:28, letterSpacing:4 }}>ACCESS DENIED</div>
  if (loading)  return (
    <div className="page-wrap">
      <div className="page-hero"><div className="container"><div className="skeleton" style={{ width:200, height:40, marginTop:8 }} /></div></div>
      <div className="container" style={{ padding:'48px 40px', maxWidth:820 }}>
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height:44, marginBottom:16 }} />)}
      </div>
    </div>
  )

  return (
    <>
      <div className="page-wrap">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow">Staff · Post Editor</div>
            <div className="page-hero-title">{isNew ? 'New Post' : 'Edit Post'}</div>
          </div>
        </div>

        <div className="container" style={{ padding:'48px 40px', maxWidth:820 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <FField label="Title"    value={form.title}    onChange={v=>f('title',v)} required />
              <FField label="Slug"     value={form.slug}     onChange={v=>f('slug',v)}  required />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ marginBottom:14 }}>
                <label style={lbStyle}>Category</label>
                <select value={form.category} onChange={e=>f('category',e.target.value)} style={inStyle}>
                  {['mission','announcement','news'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbStyle}>Status</label>
                <select value={form.status} onChange={e=>f('status',e.target.value)} style={inStyle}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <FField label="Excerpt (short summary)" value={form.excerpt}   onChange={v=>f('excerpt',v)} />
            <FField label="Cover Image URL (paste URL)" value={form.cover_url} onChange={v=>f('cover_url',v)} />
            <div style={{ marginBottom:14 }}>
              <label style={lbStyle}>— or upload Cover Image (Cloudinary) —</label>
              <input type="file" accept="image/*" onChange={async e => {
                const file = e.target.files[0]; if (!file) return
                setSaving(true)
                try { const url = await uploadToCloudinary(file); f('cover_url', url) }
                catch(err) { setError('Image upload failed: ' + err.message) }
                setSaving(false)
              }} style={{ ...inStyle, paddingTop:8 }} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={lbStyle}>Body</label>
              <textarea rows={14} value={form.body} onChange={e=>f('body',e.target.value)}
                style={{ ...inStyle, resize:'vertical', lineHeight:1.7, fontFamily:'Source Serif 4,serif', fontSize:14 }} />
            </div>
            {error && <div style={{ color:'#c06060', fontSize:12, marginBottom:14 }}>{error}</div>}
            <div style={{ display:'flex', gap:12 }}>
              <button type="submit" style={{ padding:'11px 28px', background:'var(--gold)', color:'#090d09', border:'none', fontWeight:700, fontSize:11, letterSpacing:2, cursor:'pointer' }}>
                {saving ? 'SAVING…' : isNew ? 'PUBLISH POST' : 'SAVE CHANGES'}
              </button>
              <button type="button" onClick={() => navigate(-1)}
                style={{ padding:'11px 22px', background:'transparent', color:'var(--text-dim)', border:'1px solid var(--border2)', fontWeight:700, fontSize:11, letterSpacing:2, cursor:'pointer' }}>
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer/>
    </>
  )
}

const lbStyle = { display:'block', fontSize:9, fontWeight:700, letterSpacing:3, color:'var(--gold-dim)', textTransform:'uppercase', marginBottom:6 }
const inStyle  = { width:'100%', background:'var(--bg)', color:'var(--bright)', border:'1px solid var(--border2)', padding:'10px 12px', fontSize:13, fontFamily:'Rajdhani,sans-serif', outline:'none' }
function FField({ label, value, onChange, required }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={lbStyle}>{label}</label>
      <input type="text" required={required} value={value} onChange={e => onChange(e.target.value)} style={inStyle}
        onFocus={e => e.target.style.borderColor='var(--gold)'}
        onBlur={e  => e.target.style.borderColor='var(--border2)'} />
    </div>
  )
}
