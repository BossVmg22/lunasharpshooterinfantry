import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useContent } from '../lib/useContent'
import { supabase } from '../lib/supabase'
import EditableText from '../components/EditableText'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { useLightbox } from '../contexts/LightboxContext'

const CAT_COLORS = { mission: 'var(--gold)', announcement: '#c06060', news: '#6ab46a' }

function parseJSON(str, def) {
  if (!str) return def
  try { return JSON.parse(str) } catch { return def }
}

// ── Auto-synced brigade card — pulls directly from brigade page data ──
function BrigadeHomeCard({ id }) {
  const { content } = useContent(`brigade_${id}`)
  const navigate = useNavigate()

  const title       = content.title       || ''
  const role        = content.role        || ''
  const description = content.description || ''
  const callsign    = content.callsign    || ''

  return (
    <Link to={`/brigades/${id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        className="post-card"
        style={{ background: 'var(--panel)', padding: '26px 22px', cursor: 'pointer', height: '100%', position: 'relative', overflow: 'hidden' }}
      >
        {/* Gold accent line top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--gold-dim), transparent)' }} />

        {/* Brigade number */}
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 52, color: 'var(--gold-dim)', lineHeight: 1, marginBottom: 4, letterSpacing: 2 }}>
          {id}
        </div>

        {/* Callsign */}
        {callsign && (
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>
            {callsign}
          </div>
        )}

        {/* Brigade full name */}
        {title ? (
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, color: 'var(--bright)', letterSpacing: 2, marginBottom: 8, lineHeight: 1.1 }}>
            {title}
          </div>
        ) : (
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8, fontStyle: 'italic' }}>
            [ No name set ]
          </div>
        )}

        {/* Role */}
        {role && (
          <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
            {role}
          </div>
        )}

        {/* Description */}
        {description ? (
          <p style={{ fontFamily: 'Source Serif 4,serif', fontSize: 13, fontWeight: 300, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 0 }}>
            {description.length > 120 ? description.slice(0, 120) + '…' : description}
          </p>
        ) : (
          <p style={{ fontFamily: 'Source Serif 4,serif', fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No description yet.
          </p>
        )}

        <div style={{ marginTop: 16, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--gold-dim)', textTransform: 'uppercase' }}>
          View Brigade →
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const { content, save, saving } = useContent('home')
  const { content: brigadesContent } = useContent('brigades')
  const { isMember, isStaff } = useAuth()
  const { open: openLightbox } = useLightbox()
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
        {['tl','tr','bl','br'].map(p => <div key={p} style={cornerStyle(p)}/>)}

        <div className="hero-content" style={{ position: 'relative', zIndex: 1, padding: '0 48px', maxWidth: 860 }}>
          <div style={eyebrow}>
            <EditableText value={content.hero_eyebrow ?? 'Official Division Portal'} onSave={v => save('hero_eyebrow', v)} saving={saving === 'hero_eyebrow'} tag="span" multiline={false} />
          </div>
          <EditableText value={content.hero_sub ?? 'Luna Sharpshooter Infantry'} onSave={v => save('hero_sub', v)} saving={saving === 'hero_sub'} tag="p" multiline={false}
            style={{ fontFamily: 'Source Serif 4,serif', fontSize: 18, fontWeight: 300, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }} />

          <h1 style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(72px,11vw,130px)', letterSpacing: 5, color: 'var(--bright)', lineHeight: .88, marginBottom: 16 }}>
            <EditableText value={content.hero_title_1 ?? 'SHARP'} onSave={v => save('hero_title_1', v)} saving={saving === 'hero_title_1'} tag="span" multiline={false} />
            <EditableText value={content.hero_title_2 ?? 'SHOOTERS'} onSave={v => save('hero_title_2', v)} saving={saving === 'hero_title_2'} tag="span" multiline={false} style={{ color: 'var(--gold)', display: 'block' }} />
          </h1>
          <div style={{ width: 100, height: 2, background: 'linear-gradient(90deg,var(--gold),transparent)', marginBottom: 20 }}/>

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
              ? <button className="btn-ghost" onClick={() => navigate('/manuals/pi')}>
                  <EditableText value={content.btn_secondary ?? 'Practice Inspection Manual'} onSave={v => save('btn_secondary', v)} saving={saving === 'btn_secondary'} tag="span" multiline={false} />
                </button>
              : <button className="btn-ghost" onClick={() => navigate('/login')}>🔒 Sign In for Manuals</button>
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
        <div className="container" style={{ padding: '48px 40px' }}>
          <div className="section-label reveal" ref={r(0)}>
            <span className="section-label-num">
              <EditableText value={content.quick_heading ?? 'QUICK ACCESS'} onSave={v => save('quick_heading', v)} saving={saving === 'quick_heading'} tag="span" multiline={false} />
            </span>
            <div className="section-label-rule"/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }} className="reveal" ref={r(1)}>
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
        <div className="container" style={{ padding: '56px 40px' }}>
          <div className="section-label reveal" ref={r(2)}>
            <span className="section-label-num">01</span>
            <EditableText value={content.brigades_heading ?? 'Our Brigades'} onSave={v => save('brigades_heading', v)} saving={saving === 'brigades_heading'} tag="span" multiline={false} className="section-label-title" />
            <div className="section-label-rule"/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(brigadeIds.length, 3)},1fr)`, gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }} className="reveal" ref={r(3)}>
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
        <div className="container" style={{ padding: '56px 40px' }}>
          <div className="section-label reveal" ref={r(4)}>
            <span className="section-label-num">02</span>
            <EditableText value={content.notices_heading ?? 'Division Notices'} onSave={v => save('notices_heading', v)} saving={saving === 'notices_heading'} tag="span" multiline={false} className="section-label-title" />
            <div className="section-label-rule"/>
          </div>
          <div style={{ border: '1px solid var(--border)' }} className="reveal" ref={r(5)}>
            {parseJSON(content.notices_list, [
              { date: 'SAT', text: 'Weekly Practice Inspection (WPI) — all personnel must attend in correct uniform.' },
              { date: 'MON–FRI', text: 'No major events, phases, or selections before 4:00 PM GMT+8.' },
              { date: 'SUN', text: 'Full rest day — all operations optional by CiC decree.' },
            ]).map((notice, idx, arr) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
                <EditableText
                  value={notice.date}
                  onSave={v => {
                    const updated = arr.map((n, i) => i === idx ? { ...n, date: v } : n)
                    save('notices_list', JSON.stringify(updated))
                  }}
                  saving={saving === 'notices_list'}
                  tag="div" multiline={false}
                  style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, color: 'var(--gold-dim)', letterSpacing: 1, minWidth: 70, paddingTop: 2 }}
                />
                <EditableText
                  value={notice.text}
                  onSave={v => {
                    const updated = arr.map((n, i) => i === idx ? { ...n, text: v } : n)
                    save('notices_list', JSON.stringify(updated))
                  }}
                  saving={saving === 'notices_list'}
                  placeholder="Enter notice text…"
                  style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, flex: 1 }}
                />
                {isStaff && (
                  <button onClick={() => {
                    const updated = arr.filter((_, i) => i !== idx)
                    save('notices_list', JSON.stringify(updated))
                  }} style={{ background: 'none', border: 'none', color: '#c06060', cursor: 'pointer', fontSize: 13, padding: '0 4px', opacity: 0.7 }}>✕</button>
                )}
              </div>
            ))}
          </div>
          {isStaff && (
            <button onClick={() => {
              const current = parseJSON(content.notices_list, [
                { date: 'SAT', text: 'Weekly Practice Inspection (WPI) — all personnel must attend in correct uniform.' },
                { date: 'MON–FRI', text: 'No major events, phases, or selections before 4:00 PM GMT+8.' },
                { date: 'SUN', text: 'Full rest day — all operations optional by CiC decree.' },
              ])
              save('notices_list', JSON.stringify([...current, { date: 'DATE', text: 'Enter notice…' }]))
            }} style={{ marginTop: 10, padding: '6px 16px', background: 'rgba(200,149,42,0.1)', border: '1px dashed var(--gold-dim)', color: 'var(--gold)', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: 'Rajdhani, sans-serif' }}>
              + Add Notice
            </button>
          )}
        </div>
      </section>

      {/* ── LATEST OPERATIONS ─────────── */}
      {latestPosts.length > 0 && (
        <section style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ padding: '56px 40px' }}>
            <div className="section-label reveal">
              <span className="section-label-num">03</span>
              <EditableText value={content.ops_heading ?? 'Latest Operations'} onSave={v => save('ops_heading', v)} saving={saving === 'ops_heading'} tag="span" multiline={false} className="section-label-title" />
              <div className="section-label-rule"/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
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
          <div className="container" style={{ padding: '56px 40px' }}>
            <div className="section-label reveal">
              <span className="section-label-num">04</span>
              <EditableText value={content.gallery_heading ?? 'Gallery'} onSave={v => save('gallery_heading', v)} saving={saving === 'gallery_heading'} tag="span" multiline={false} className="section-label-title" />
              <div className="section-label-rule"/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
              {latestGallery.map(img => (
                <div key={img.id}
                  style={{ aspectRatio: '16/9', overflow: 'hidden', cursor: 'zoom-in', position: 'relative' }}>
                  <img src={img.image_url} alt={img.title}
                    loading="lazy"
                    onClick={() => openLightbox(img.image_url, img.title)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}/>
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
const eyebrow = {
  display: 'inline-flex', alignItems: 'center', gap: 10,
  fontSize: 10, fontWeight: 700, letterSpacing: 5,
  color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 18,
}
function cornerStyle(pos) {
  const map = { tl:{top:80,left:48,borderWidth:'2px 0 0 2px'}, tr:{top:80,right:48,borderWidth:'2px 2px 0 0'}, bl:{bottom:40,left:48,borderWidth:'0 0 2px 2px'}, br:{bottom:40,right:48,borderWidth:'0 2px 2px 0'} }
  return { position: 'absolute', width: 48, height: 48, borderColor: 'var(--gold-dim)', borderStyle: 'solid', opacity: .35, ...map[pos], '@media(max-width:768px)': { display: 'none' } }
}
