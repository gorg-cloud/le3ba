import { createClient } from '@supabase/supabase-js'

export const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '' ||
      typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim() === '') {
    return {
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
    } as any;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
