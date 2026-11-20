import { createBrowserClient } from '@supabase/ssr';

export const DEFAULT_SUPABASE_URL = 'https://nudmiaaypwfysobcrzvb.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZG1pYWF5cHdmeXNvYmNyenZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2ODQyMTcsImV4cCI6MjEwODI2MDIxN30.SfaeAudXX24Pq6jsfDNBYjgCZwr7KJ7txjbXRNaElng';

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'placeholder-url'
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : DEFAULT_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-anon-key'
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
