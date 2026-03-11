import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useContent } from '../lib/useContent'
import { supabase } from '../lib/supabase'
import EditableText from '../components/EditableText'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'


const CAT_COLORS = { mission: 'var(--gold)', announcement: '#c06060', news: '#6ab46a' }

function parseJSON(str, def) {
  if (!str) return def
  try { return JSON.parse(str) } catch { return def }
}

// ── Auto-synced brigade card — Option A: horizontal split ──
function BrigadeHomeCard({ id }) {
  const { content } = useContent(`brigade_${id}`)

  const title       = content.title       || ''
  const role        = content.role        || ''
  const description = content.description || ''
  const callsign    = content.callsign    || ''

  return (
    <Link to={`/brigades/${id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div className="brigade-home-card post-card">
        {/* Left panel */}
        <div className="brigade-home-left">
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 54, color: 'var(--gold)', lineHeight: 1, letterSpacing: 2, position: 'relative', zIndex: 1, textShadow: '0 0 30px rgba(200,149,42,0.25)' }}>
            {id}
          </div>
          {callsign && (
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 3, color: 'var(--gold-dim)', textTransform: 'uppercase', marginTop: 4, position: 'relative', zIndex: 1 }}>
              {callsign}
            </div>
          )}
        </div>
        {/* Right panel */}
        <div className="brigade-home-right">
          {role && (
            <div style={{ display: 'inline-block', fontSize: 8, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', padding: '2px 8px', border: '1px solid var(--gold-dim)', background: 'rgba(200,149,42,0.05)', marginBottom: 8 }}>
              {role}
            </div>
          )}
          {title ? (
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, color: 'var(--bright)', letterSpacing: 2, marginBottom: 8, lineHeight: 1.1 }}>{title}</div>
          ) : (
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8, fontStyle: 'italic' }}>[ No name set ]</div>
          )}
          {description ? (
            <p style={{ fontFamily: 'Source Serif 4,serif', fontSize: 12, fontWeight: 300, color: 'var(--text-dim)', lineHeight: 1.7, flex: 1 }}>
              {description.length > 100 ? description.slice(0, 100) + '…' : description}
            </p>
          ) : (
            <p style={{ fontFamily: 'Source Serif 4,serif', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', flex: 1 }}>No description yet.</p>
          )}
          <div style={{ marginTop: 14, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--gold-dim), transparent)' }} />
            View Brigade →
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const { content, save, saving } = useContent('home')
  const { content: brigadesContent } = useContent('brigades')
  const { isMember, isStaff } = useAuth()
  const openLightbox = (src, alt = '', caption = '') =>
    window.dispatchEvent(new CustomEvent('lsi:lightbox', { detail: { src, alt, caption } }))
  const navigate = useNavigate()
  const revealRef = useRef([])
  const [latestPosts,   setLatestPosts]   = useState([])
  const [latestGallery, setLatestGallery] = useState([])

  useEffect(() => {
    supabase.from('posts').select('id,title,slug,excerpt,category,created_at').eq('status', 'published').order('created_at', { ascending: false }).limit(3)
      .then(({ data }) => setLatestPosts(data ?? []))
    supabase.from('gallery').select('id,title,image_url').order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => setLatestGallery(data ?? []))
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) } })
    }, { threshold: 0.08 })
    revealRef.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const r = i => el => { revealRef.current[i] = el }

  const brigadeIds = parseJSON(brigadesContent.brigade_ids, ['101','102','104'])

  return (
    <>
      {/* ── HERO ───────────────────────── */}
      <section style={heroStyle}>
        <div style={heroBg}/>
        <div style={heroGrid}/>
        <div style={heroGlow}/>
        <div style={heroVignette}/>
        {['tl','tr','bl','br'].map(p => <div key={p} className="hero-corner" style={cornerStyle(p)}/>)}

        {/* Scroll cue */}
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, zIndex: 2 }}>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: 3, color: 'var(--gold-dim)', textTransform: 'uppercase' }}>Scroll</span>
          <span style={{ fontSize: 11, color: 'var(--gold-dim)', animation: 'lsi-bounce 1.8s ease-in-out infinite' }}>↓</span>
        </div>

        <div className="hero-content" style={{ position: 'relative', zIndex: 1, padding: '0 48px', maxWidth: 860 }}>
          <div style={eyebrow}>
            <span style={{ width: 24, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
            <EditableText value={content.hero_eyebrow ?? 'Official Division Portal'} onSave={v => save('hero_eyebrow', v)} saving={saving === 'hero_eyebrow'} tag="span" multiline={false} />
          </div>
          <EditableText value={content.hero_sub ?? 'Luna Sharpshooter Infantry'} onSave={v => save('hero_sub', v)} saving={saving === 'hero_sub'} tag="p" multiline={false}
            style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 300, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }} />

          <h1 style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(72px,11vw,130px)', letterSpacing: 5, color: 'var(--bright)', lineHeight: .88, marginBottom: 16 }}>
            <EditableText value={content.hero_title_1 ?? 'SHARP'} onSave={v => save('hero_title_1', v)} saving={saving === 'hero_title_1'} tag="span" multiline={false} />
            <EditableText value={content.hero_title_2 ?? 'SHOOTERS'} onSave={v => save('hero_title_2', v)} saving={saving === 'hero_title_2'} tag="span" multiline={false} style={{ color: 'var(--gold)', display: 'block', textShadow: '0 0 60px rgba(200,149,42,0.3)' }} />
          </h1>

          {/* Diamond divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 40, height: 1, background: 'var(--gold)' }}/>
            <div style={{ width: 6, height: 6, background: 'var(--gold)', transform: 'rotate(45deg)' }}/>
            <div style={{ width: 80, height: 1, background: 'linear-gradient(90deg,var(--gold-dim),transparent)' }}/>
          </div>

          <EditableText
            value={content.hero_tagline ?? ''}
            onSave={v => save('hero_tagline', v)}
            saving={saving === 'hero_tagline'}
            tag="p"
            placeholder="Enter division tagline or slogan…"
            style={{ fontFamily: 'Source Serif 4,serif', fontSize: 15, fontWeight: 300, color: 'var(--text)', lineHeight: 1.8, maxWidth: 520, marginBottom: 32, fontStyle: 'italic' }}
          />

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
            <button className="btn-primary" onClick={() => navigate('/about')}>
              <EditableText value={content.btn_primary ?? 'Division Overview'} onSave={v => save('btn_primary', v)} saving={saving === 'btn_primary'} tag="span" multiline={false} />
            </button>
            {isMember
              ? <button className="btn-ghost btn-ghost-gold" onClick={() => navigate('/manuals/pi')}>
                  <EditableText value={content.btn_secondary ?? 'Practice Inspection Manual'} onSave={v => save('btn_secondary', v)} saving={saving === 'btn_secondary'} tag="span" multiline={false} />
                </button>
              : <button className="btn-ghost btn-ghost-gold" onClick={() => navigate('/login')}>🔒 Sign In for Manuals</button>
            }
          </div>

          <div style={{ display: 'flex', gap: 40, paddingTop: 28, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {[
              ['hero_stat1_num','hero_stat1_label','3','Active Brigades'],
              ['hero_stat2_num','hero_stat2_label','1','Infantry Academy'],
              ['hero_stat3_num','hero_stat3_label','PH','Fort Antonio Luna'],
              ['hero_stat4_num','hero_stat4_label','ACC','Army Combat Cmd'],
            ].map(([nk, lk, nd, ld]) => (
              <div key={nk}>
                <EditableText value={content[nk] ?? nd} onSave={v => save(nk, v)} saving={saving === nk} tag="span" multiline={false} style={{ display: 'block', fontFamily: 'Bebas Neue,sans-serif', fontSize: 30, color: 'var(--gold)', letterSpacing: 2 }} />
                <EditableText value={content[lk] ?? ld} onSave={v => save(lk, v)} saving={saving === lk} tag="p" multiline={false} style={{ fontSize: 9, letterSpacing: 2, color: 'var(--text-dim)', textTransform: 'uppercase', marginTop: 2 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

          

      {/* ── QUICK LINKS ───────────────── */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="section-label reveal" ref={r(0)}>
            <span className="section-label-num">
              <EditableText value={content.quick_heading ?? 'QUICK ACCESS'} onSave={v => save('quick_heading', v)} saving={saving === 'quick_heading'} tag="span" multiline={false} />
            </span>
            <div className="section-label-rule"/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }} className="reveal home-quick-grid" ref={r(1)}>
            {[
              ['quick_1_icon','quick_1_label','quick_1_sub','📋','PI Manual','Practice Inspection','/manuals/pi', true],
              ['quick_2_icon','quick_2_label','quick_2_sub','📖','Handbook','Personnel Rules','/manuals/handbook', true],
              ['quick_3_icon','quick_3_label','quick_3_sub','🎖️','Uniforms','Dress Regulations','/manuals/uniforms', true],
              ['quick_4_icon','quick_4_label','quick_4_sub','⚔️','Command','Chain of Command','/command', false],
            ].map(([ik, lk, sk, id, ld, sd, to, memberOnly]) => (
              <div key={lk}
                onClick={() => navigate(memberOnly && !isMember ? '/login' : to)}
                style={{ background: 'var(--panel)', padding: '22px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--panel2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--panel)'}
              >
                <EditableText value={content[ik] ?? id} onSave={v => save(ik, v)} saving={saving === ik} tag="div" multiline={false} style={{ fontSize: 22 }} />
                <EditableText value={content[lk] ?? ld} onSave={v => save(lk, v)} saving={saving === lk} tag="div" multiline={false} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--bright)', textTransform: 'uppercase' }} />
                <EditableText value={content[sk] ?? sd} onSave={v => save(sk, v)} saving={saving === sk} tag="div" multiline={false} style={{ fontSize: 11, color: 'var(--text-dim)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRIGADES OVERVIEW — auto-synced from brigade pages ── */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ paddingTop: 56, paddingBottom: 56 }}>
          <div className="section-label reveal" ref={r(2)}>
            <span className="section-label-num">01</span>
            <EditableText value={content.brigades_heading ?? 'Our Brigades'} onSave={v => save('brigades_heading', v)} saving={saving === 'brigades_heading'} tag="span" multiline={false} className="section-label-title" />
            <div className="section-label-rule"/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }} className="reveal home-brigade-grid" ref={r(3)}>
            {brigadeIds.map(id => (
              <BrigadeHomeCard key={id} id={id} />
            ))}
          </div>
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <span onClick={() => navigate('/brigades')} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold-dim)', cursor: 'pointer', textTransform: 'uppercase' }}>
              All Brigades →
            </span>
          </div>
        </div>
      </section>

      {/* ── NOTICES ───────────────────── */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ paddingTop: 56, paddingBottom: 56 }}>
          <div className="section-label reveal" ref={r(4)}>
            <span className="section-label-num">02</span>
            <EditableText value={content.notices_heading ?? 'Division Notices'} onSave={v => save('notices_heading', v)} saving={saving === 'notices_heading'} tag="span" multiline={false} className="section-label-title" />
            <div className="section-label-rule"/>
          </div>
          <div style={{ border: '1px solid var(--border)', overflow: 'hidden' }} className="reveal" ref={r(5)}>
            {parseJSON(content.notices_list, [
              { date: 'SAT', sub: 'Weekly', title: 'Practice Inspection (WPI)', text: 'All personnel must attend in correct uniform.', type: 'Mandatory' },
              { date: 'MON–FRI', sub: 'Weekdays', title: 'No Events Before 4:00 PM GMT+8', text: 'No major events, phases, or selections before 4:00 PM.', type: 'Standing' },
              { date: 'SUN', sub: 'Rest Day', title: 'Full Rest Day', text: 'All operations optional by CiC decree.', type: 'Optional' },
            ]).map((notice, idx, arr) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '88px 1fr auto', alignItems: 'center', borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none', position: 'relative' }}>
                <div style={{ padding: '14px 16px', background: 'rgba(200,149,42,0.04)', borderRight: '1px solid var(--border)', textAlign: 'center' }}>
                  <EditableText value={notice.date} onSave={v => { const u = arr.map((n,i) => i===idx?{...n,date:v}:n); save('notices_list', JSON.stringify(u)) }} saving={saving==='notices_list'} tag="div" multiline={false}
                    style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 15, color: 'var(--gold)', letterSpacing: 1, display: 'block' }} />
                  <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{notice.sub ?? ''}</div>
                </div>
                <div style={{ padding: '12px 18px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--bright)', letterSpacing: 0.5, marginBottom: 2 }}>{notice.title ?? ''}</div>
                  <EditableText value={notice.text} onSave={v => { const u = arr.map((n,i) => i===idx?{...n,text:v}:n); save('notices_list', JSON.stringify(u)) }} saving={saving==='notices_list'}
                    placeholder="Enter notice text…" style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, fontFamily: 'Source Serif 4,serif', fontWeight: 300 }} />
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '2px 8px', fontSize: 8, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', border: '1px solid',
                    borderColor: notice.type === 'Mandatory' ? 'rgba(200,149,42,0.4)' : notice.type === 'Optional' ? 'rgba(106,180,106,0.4)' : 'var(--border2)',
                    color: notice.type === 'Mandatory' ? 'var(--gold)' : notice.type === 'Optional' ? '#6ab46a' : 'var(--text-muted)',
                    background: notice.type === 'Mandatory' ? 'rgba(200,149,42,0.06)' : notice.type === 'Optional' ? 'rgba(106,180,106,0.06)' : 'transparent',
                    fontFamily: 'Rajdhani,sans-serif' }}>{notice.type ?? ''}</span>
                  {isStaff && (
                    <button onClick={() => { const u = arr.filter((_,i) => i !== idx); save('notices_list', JSON.stringify(u)) }}
                      style={{ background: 'none', border: 'none', color: '#c06060', cursor: 'pointer', fontSize: 12, padding: '0 4px', opacity: 0.7 }}>✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {isStaff && (
            <button onClick={() => {
              const current = parseJSON(content.notices_list, [
                { date: 'SAT', sub: 'Weekly', title: 'Practice Inspection (WPI)', text: 'All personnel must attend in correct uniform.', type: 'Mandatory' },
                { date: 'MON–FRI', sub: 'Weekdays', title: 'No Events Before 4:00 PM GMT+8', text: 'No major events, phases, or selections before 4:00 PM.', type: 'Standing' },
                { date: 'SUN', sub: 'Rest Day', title: 'Full Rest Day', text: 'All operations optional by CiC decree.', type: 'Optional' },
              ])
              save('notices_list', JSON.stringify([...current, { date: 'DATE', sub: '', title: 'New Notice', text: 'Enter notice…', type: 'Standing' }]))
            }} style={{ marginTop: 10, padding: '6px 16px', background: 'rgba(200,149,42,0.1)', border: '1px dashed var(--gold-dim)', color: 'var(--gold)', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: 'Rajdhani, sans-serif' }}>
              + Add Notice
            </button>
          )}
        </div>
      </section>

      {/* ── LATEST OPERATIONS ─────────── */}
      {latestPosts.length > 0 && (
        <section style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ paddingTop: 56, paddingBottom: 56 }}>
            <div className="section-label reveal">
              <span className="section-label-num">03</span>
              <EditableText value={content.ops_heading ?? 'Latest Operations'} onSave={v => save('ops_heading', v)} saving={saving === 'ops_heading'} tag="span" multiline={false} className="section-label-title" />
              <div className="section-label-rule"/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }} className="home-ops-grid">
              {latestPosts.map(post => (
                <div key={post.id} onClick={() => navigate(`/operations/${post.slug}`)}
                  className="post-card"
                  style={{ background: 'var(--panel)', padding: '22px 22px 18px', cursor: 'pointer' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: CAT_COLORS[post.category] ?? 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>{post.category}</div>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 20, color: 'var(--bright)', letterSpacing: 2, lineHeight: 1.1, marginBottom: 8 }}>{post.title}</div>
                  <p style={{ fontFamily: 'Source Serif 4,serif', fontSize: 12.5, fontWeight: 300, color: 'var(--text-dim)', lineHeight: 1.65 }}>{post.excerpt}</p>
                  <div style={{ marginTop: 12, fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--gold)' }}>READ REPORT →</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <span onClick={() => navigate('/operations')} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold-dim)', cursor: 'pointer', textTransform: 'uppercase' }}>
                All Operations & News →
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── GALLERY PREVIEW ───────────── */}
      {latestGallery.length > 0 && (
        <section style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ paddingTop: 56, paddingBottom: 56 }}>
            <div className="section-label reveal">
              <span className="section-label-num">04</span>
              <EditableText value={content.gallery_heading ?? 'Gallery'} onSave={v => save('gallery_heading', v)} saving={saving === 'gallery_heading'} tag="span" multiline={false} className="section-label-title" />
              <div className="section-label-rule"/>
            </div>
            <div className="home-gallery-masonry reveal">
              {latestGallery.slice(0,5).map((img, i) => (
                <div key={img.id}
                  className={`gallery-masonry-item${i === 0 ? ' gallery-masonry-featured' : ''}`}
                  style={{ position: 'relative', overflow: 'hidden', cursor: 'zoom-in' }}>
                  <img src={img.image_url} alt={img.title}
                    loading="lazy"
                    onClick={() => openLightbox(img.image_url, img.title)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', display: 'block' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}/>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(9,13,9,0.5) 0%, transparent 50%)', pointerEvents: 'none' }} />
                  {i === 0 && img.title && (
                    <div style={{ position: 'absolute', bottom: 12, left: 14, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: 'var(--gold-dim)', textTransform: 'uppercase' }}>{img.title}</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <span onClick={() => navigate('/gallery')} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--gold-dim)', cursor: 'pointer', textTransform: 'uppercase' }}>
                View Full Gallery →
              </span>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}

const heroStyle = {
  position: 'relative', minHeight: 'calc(100vh - 56px)',
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
  paddingBottom: 72, overflow: 'hidden',
}
const heroBg = {
  position: 'absolute', inset: 0,
  background: 'radial-gradient(ellipse 70% 50% at 65% 30%, rgba(22,42,22,0.95) 0%,transparent 70%), radial-gradient(ellipse 50% 70% at 15% 70%, rgba(200,149,42,0.07) 0%,transparent 60%)',
}
const heroGrid = {
  position: 'absolute', inset: 0,
  backgroundImage: 'linear-gradient(rgba(200,149,42,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(200,149,42,0.035) 1px,transparent 1px)',
  backgroundSize: '80px 80px',
}
const heroGlow = {
  position: 'absolute', inset: 0,
  background: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(200,149,42,0.07) 0%, transparent 60%)',
}
const heroVignette = {
  position: 'absolute', inset: 0,
  background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)',
}
const eyebrow = {
  display: 'inline-flex', alignItems: 'center', gap: 10,
  fontSize: 10, fontWeight: 700, letterSpacing: 5,
  color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 18,
}
function cornerStyle(pos) {
  const map = { tl:{top:80,left:48,borderWidth:'2px 0 0 2px'}, tr:{top:80,right:48,borderWidth:'2px 2px 0 0'}, bl:{bottom:40,left:48,borderWidth:'0 0 2px 2px'}, br:{bottom:40,right:48,borderWidth:'0 2px 2px 0'} }
  return { position: 'absolute', width: 48, height: 48, borderColor: 'var(--gold-dim)', borderStyle: 'solid', opacity: .35, ...map[pos] }
}
