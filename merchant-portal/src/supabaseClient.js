import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnrrntysxrwzatwmfvmw.supabase.co'
const supabaseAnonKey = 'sb_publishable_YpRYTggMoIkaORS6xgHj0Q_ZBmGtcYe'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

/*
  🔥 VERY IMPORTANT (for debugging RLS/Auth)

  This exposes Supabase globally in the browser so you can test in DevTools.
  You can remove this later in production if you want.
*/
if (typeof window !== "undefined") {
  window.supabase = supabase
}
