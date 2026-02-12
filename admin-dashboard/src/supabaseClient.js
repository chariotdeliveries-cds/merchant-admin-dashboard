import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnrrntysxrwzatwmfvmw.supabase.co'
const supabaseAnonKey = 'sb_publishable_YpRYTggMoIkaORS6xgHj0Q_ZBmGtcYe'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)