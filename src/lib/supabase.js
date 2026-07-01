import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[RELOOK] SUPABASE_URL définie:', !!url, '| ANON_KEY définie:', !!key, '| KEY longueur:', key?.length)

export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  key ?? 'placeholder'
)
