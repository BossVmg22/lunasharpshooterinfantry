import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://srtwguxztrgolfwihcsp.supabase.co"
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNydHdndXh6dHJnb2xmd2loY3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODg3MjAsImV4cCI6MjA4ODU2NDcyMH0.AR8Zda3RXO7hd-V-GqRuaWqg6C9ZYU20qJsfW8oV_c4"

export const supabase = createClient(supabaseUrl, supabaseKey)
