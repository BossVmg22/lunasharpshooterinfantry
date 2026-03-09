import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://srtwguxztrgolfwihcsp.supabase.co"  // your actual URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNydHdndXh6dHJnb2xmd2loY3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODg3MjAsImV4cCI6MjA4ODU2NDcyMH0.AR8Zda3RXO7hd-V-GqRuaWqg6C9ZYU20qJsfW8oV_c4"           // your actual key

export const supabase = createClient(supabaseUrl, supabaseKey)
