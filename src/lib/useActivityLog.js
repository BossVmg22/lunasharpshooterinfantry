import { useCallback } from 'react'
import { supabase } from './supabase'
import { useAuth } from '../contexts/AuthContext'

/**
 * useActivityLog — call logAction() anywhere to record an activity.
 * Automatically attaches the current user's username.
 *
 * logAction(action, details)
 *   action  — short verb e.g. 'edited text', 'uploaded image', 'changed role'
 *   details — human readable string e.g. 'Brigade 101 › banner_img'
 */
export function useActivityLog() {
  const { profile } = useAuth()

  const logAction = useCallback(async (action, details = '') => {
    if (!profile?.username) return
    await supabase.from('activity_logs').insert({
      username: profile.username,
      action,
      details,
      created_at: new Date().toISOString(),
    })
  }, [profile])

  return { logAction }
}
