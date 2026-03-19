import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function EditableText({ value = '', onSave, saving, tag: Tag = 'p', style = {}, multiline = true, className = '', placeholder = '[ Click to edit ]' }) {
  const { isStaff } = useAuth()
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(value)
  const [hovered, setHovered] = useState(false)

  useEffect(() => { if (!editing) setDraft(value) }, [value, editing])

  if (!isStaff) return <Tag style={style} className={className}>{value}</Tag>

  const isEmpty = !value || value.trim() === ''

  if (editing) {
    const InputEl = multiline ? 'textarea' : 'input'
    return (
      <div style={{ position: 'relative' }}>
        <InputEl
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') { setDraft(value); setEditing(false) }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || !multiline)) {
              onSave(draft); setEditing(false)
            }
          }}
          style={{
            width: '100%', minHeight: multiline ? 80 : 'auto',
            background: '#0f1f0f', color: '#f0ece0',
            border: '1px solid #c8952a', padding: '8px 12px',
            fontFamily: 'inherit', fontSize: 'inherit',
            lineHeight: 'inherit', resize: 'vertical',
            outline: 'none', borderRadius: 0,
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button onClick={() => { onSave(draft); setEditing(false) }}
            style={btnStyle('#c8952a', '#0a0f0a')}>
            {saving ? '…' : '✓ Save'}
          </button>
          <button onClick={() => { setDraft(value); setEditing(false) }}
            style={btnStyle('#333', '#ccc')}>
            Cancel
          </button>
        </div>
        <span style={{ fontSize: 10, color: '#686050', marginTop: 4, display: 'block' }}>
          Ctrl+Enter to save · Esc to cancel
        </span>
      </div>
    )
  }

  return (
    <Tag
      style={{
        ...style,
        cursor: 'text',
        borderRadius: 2,
        transition: 'background 0.15s, box-shadow 0.15s',
        background: hovered ? 'rgba(200,149,42,0.08)' : 'transparent',
        boxShadow: hovered ? 'inset 0 0 0 1px rgba(200,149,42,0.3)' : (isEmpty ? 'inset 0 0 0 1px rgba(200,149,42,0.15)' : 'none'),
      }}
      className={className}
      onClick={() => { setDraft(value); setEditing(true) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isEmpty
        ? <span style={{ color: 'rgba(200,149,42,0.4)', fontStyle: 'italic', fontWeight: 400, fontSize: '0.88em', pointerEvents: 'none' }}>{placeholder}</span>
        : value}
    </Tag>
  )
}

const btnStyle = (bg, color) => ({
  padding: '5px 14px',
  background: bg, color,
  border: 'none', cursor: 'pointer',
  fontSize: 11, fontWeight: 700, letterSpacing: 1,
  fontFamily: 'Rajdhani, sans-serif',
})
