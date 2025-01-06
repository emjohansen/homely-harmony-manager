import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vdhfgdjfuvruegwpzyuz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkaGZnZGpmdXZydWVnd3B6eXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MTM3NjQsImV4cCI6MjA1MTM4OTc2NH0.4qh4cH7_mCA7gy9Zz4I7q0Mhh8sEwiJqYalQ2qtVBSk";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: 'supabase.auth.token',
      flowType: 'pkce'
    }
  }
);