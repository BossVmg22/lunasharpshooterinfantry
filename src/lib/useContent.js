import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// In-memory cache shared across all hook instances
const cache = {}
<<<<<<< HEAD
const metaCache = {}
const listeners = {}
const metaListeners = {}

function notify(section, data) {
  if (listeners[section]) listeners[section].forEach(fn => fn(data))
}
function notifyMeta(section, meta) {
  if (metaListeners[section]) metaListeners[section].forEach(fn => fn(meta))
}

export function useContent(section) {
  const [content,     setContent]     = useState(cache[section] ?? {})
  const [saving,      setSaving]      = useState(null)
  const [lastUpdated, setLastUpdated] = useState(metaCache[section]?.lastUpdated ?? null)

  useEffect(() => {
    // ── BUG FIX: immediately sync state when section changes ──
    // useState initializer only runs on mount, so navigating between brigade pages
    // (same component, different section) kept showing the previous brigade's content.
    const alreadyCached = cache[section]
    if (alreadyCached) {
      setContent(alreadyCached)
      if (metaCache[section]) setLastUpdated(metaCache[section].lastUpdated)
    } else {
      setContent({})
      setLastUpdated(null)
    }

    if (!listeners[section])     listeners[section]     = new Set()
    if (!metaListeners[section]) metaListeners[section] = new Set()

    const handler     = (data) => setContent(data)
    const metaHandler = (meta) => setLastUpdated(meta.lastUpdated)
    listeners[section].add(handler)
    metaListeners[section].add(metaHandler)

    if (!cache[section]) {
      supabase
        .from('content')
        .select('key, value, updated_at')
=======
const listeners = {}

function notify(section, data) {
  if (listeners[section]) {
    listeners[section].forEach(fn => fn(data))
  }
}

export function useContent(section) {
  const [content, setContent] = useState(cache[section] ?? {})
  const [saving,  setSaving]  = useState(null)

  useEffect(() => {
    // Register listener so all instances of useContent(section) stay in sync
    if (!listeners[section]) listeners[section] = new Set()
    const handler = (data) => setContent(data)
    listeners[section].add(handler)

    // Load from DB if not cached
    if (!cache[section]) {
      supabase
        .from('content')
        .select('key, value')
>>>>>>> 2122e0e3b320849ad366ee701029d8f3748c491b
        .eq('section', section)
        .then(({ data }) => {
          if (!data) return
          const map = Object.fromEntries(data.map(r => [r.key, r.value]))
          cache[section] = map
          setContent(map)
          notify(section, map)
<<<<<<< HEAD

          const dates = data.map(r => r.updated_at).filter(Boolean)
          if (dates.length) {
            const latest = dates.sort().at(-1)
            metaCache[section] = { lastUpdated: latest }
            setLastUpdated(latest)
            notifyMeta(section, { lastUpdated: latest })
          }
=======
>>>>>>> 2122e0e3b320849ad366ee701029d8f3748c491b
        })
    }

    return () => {
      listeners[section]?.delete(handler)
<<<<<<< HEAD
      metaListeners[section]?.delete(metaHandler)
=======
>>>>>>> 2122e0e3b320849ad366ee701029d8f3748c491b
    }
  }, [section])

  const save = useCallback(async (key, value) => {
    setSaving(key)
<<<<<<< HEAD
    const now = new Date().toISOString()
    const { error } = await supabase.from('content').upsert(
      { section, key, value, updated_at: now },
=======
    const { error } = await supabase.from('content').upsert(
      { section, key, value, updated_at: new Date().toISOString() },
>>>>>>> 2122e0e3b320849ad366ee701029d8f3748c491b
      { onConflict: 'section,key' }
    )
    if (!error) {
      const updated = { ...(cache[section] ?? {}), [key]: value }
      cache[section] = updated
      setContent(updated)
      notify(section, updated)
<<<<<<< HEAD
      metaCache[section] = { lastUpdated: now }
      setLastUpdated(now)
      notifyMeta(section, { lastUpdated: now })
=======
>>>>>>> 2122e0e3b320849ad366ee701029d8f3748c491b
    }
    setSaving(null)
  }, [section])

<<<<<<< HEAD
  return { content, save, saving, lastUpdated }
=======
  return { content, save, saving }
>>>>>>> 2122e0e3b320849ad366ee701029d8f3748c491b
}
