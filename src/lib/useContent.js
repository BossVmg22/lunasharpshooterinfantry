import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// In-memory cache shared across all hook instances
const cache = {}
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
    // Reset content immediately when section changes
    setContent(cache[section] ?? {})
    // Register listener so all instances of useContent(section) stay in sync
    if (!listeners[section]) listeners[section] = new Set()
    const handler = (data) => setContent(data)
    listeners[section].add(handler)

    // Load from DB if not cached
    if (!cache[section]) {
      supabase
        .from('content')
        .select('key, value')
        .eq('section', section)
        .then(({ data }) => {
          if (!data) return
          const map = Object.fromEntries(data.map(r => [r.key, r.value]))
          cache[section] = map
          setContent(map)
          notify(section, map)
        })
    }

    return () => {
      listeners[section]?.delete(handler)
    }
  }, [section])

  const save = useCallback(async (key, value) => {
    setSaving(key)
    const { error } = await supabase.from('content').upsert(
      { section, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'section,key' }
    )
    if (!error) {
      const updated = { ...(cache[section] ?? {}), [key]: value }
      cache[section] = updated
      setContent(updated)
      notify(section, updated)
    }
    setSaving(null)
  }, [section])

  return { content, save, saving }
}
