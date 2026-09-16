// Single Supabase client instance, shared across the app. The frontend
// authenticates directly against Supabase Auth and never talks to the
// database directly - all data access goes through the backend API.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Check your .env file.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
