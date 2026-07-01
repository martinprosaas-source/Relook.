import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('[RELOOK] Variables Supabase manquantes — vérifie VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans Vercel')
}

export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  key ?? 'placeholder'
)
