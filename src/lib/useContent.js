import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Inline log helper — avoids circular import with useActivityLog hook
async function writeLog(username, action, details) {
  if (!username) return
  await supabase.from('activity_logs').insert({
    username, action, details,
    created_at: new Date().toISOString(),
  })
}

const cache = {}
const listeners = {}
const timestampCache = {}

function notify(section, data) {
  if (listeners[section]) {
    listeners[section].forEach(fn => fn(data))
  }
}

export function useContent(section) {
  const [content,     setContent]     = useState(cache[section] ?? {})
  const [saving,      setSaving]      = useState(null)
  const [lastUpdated, setLastUpdated] = useState(timestampCache[section] ?? null)

  useEffect(() => {
    setContent(cache[section] ?? {})
    setLastUpdated(timestampCache[section] ?? null)

    if (!listeners[section]) listeners[section] = new Set()
    const handler = (data) => setContent(data)
    listeners[section].add(handler)

    if (!cache[section]) {
      supabase
        .from('content')
        .select('key, value, updated_at')
        .eq('section', section)
        .then(({ data }) => {
          if (!data) return
          const map = Object.fromEntries(data.map(r => [r.key, r.value]))
          cache[section] = map
          setContent(map)
          notify(section, map)

          // Track most recent updated_at across all keys in this section
          const latest = data.reduce((acc, r) => {
            if (!r.updated_at) return acc
            return (!acc || r.updated_at > acc) ? r.updated_at : acc
          }, null)
          if (latest) {
            timestampCache[section] = latest
            setLastUpdated(latest)
          }
        })
    }

    return () => {
      listeners[section]?.delete(handler)
    }
  }, [section])

  const save = useCallback(async (key, value) => {
    setSaving(key)
    const now = new Date().toISOString()
    const { error } = await supabase.from('content').upsert(
      { section, key, value, updated_at: now },
      { onConflict: 'section,key' }
    )
    if (!error) {
      const updated = { ...(cache[section] ?? {}), [key]: value }
      cache[section] = updated
      setContent(updated)
      notify(section, updated)
      timestampCache[section] = now
      setLastUpdated(now)
      // Detect if it's an image upload (Cloudinary URL) or text edit
      const isImage = typeof value === 'string' && value.includes('cloudinary.com')
      // Get current user's username for logging
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('username').eq('id', user.id).single()
        writeLog(prof?.username, isImage ? 'uploaded image' : 'edited text', `${section} › ${key}`)
      }
    }
    setSaving(null)
  }, [section])

  return { content, save, saving, lastUpdated, loading }
}
