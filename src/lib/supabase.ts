import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // During build/prerendering, we don't want to crash the process
  // just warn and export a dummy client or null
  console.warn('Supabase credentials are missing. App will not function until variables are set.')
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        signInWithPassword: async () => ({ data: null, error: { message: 'Missing keys' } }),
        getUser: async () => ({ data: { user: null }, error: { message: 'Missing keys' } }),
        signOut: async () => ({ error: { message: 'Missing keys' } }),
      },
      from: () => ({
        select: () => ({ data: null, error: { message: 'Missing keys' } }),
        insert: () => ({ data: null, error: { message: 'Missing keys' } }),
        update: () => ({ data: null, error: { message: 'Missing keys' } }),
        eq: () => ({ data: null, error: { message: 'Missing keys' } }),
        single: () => ({ data: null, error: { message: 'Missing keys' } }),
        order: () => ({ data: null, error: { message: 'Missing keys' } }),
        limit: () => ({ data: null, error: { message: 'Missing keys' } }),
      }),
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: { message: 'Missing keys' } }),
        }),
      },
    }
