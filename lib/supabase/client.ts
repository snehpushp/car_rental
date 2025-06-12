import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Global Supabase client for client-side usage
 * This creates a singleton instance that persists across component re-renders
 */
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient();
  }
  return supabaseClient;
} 