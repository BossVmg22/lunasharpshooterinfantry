import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://srtwguxztrgolf..."  // your actual URL
const supabaseKey = "eyJhbGciOiJl..."           // your actual key

export const supabase = createClient(supabaseUrl, supabaseKey)
