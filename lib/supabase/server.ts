import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

let cachedServerClient:
  | ReturnType<typeof createClient<Database>>
  | null = null;

export function getServiceSupabaseClient() {
  if (cachedServerClient) {
    return cachedServerClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    );
  }

  cachedServerClient = createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
      },
    }
  );

  return cachedServerClient;
}

