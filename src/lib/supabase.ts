import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const CONFIGURED = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

// Only create the real client when configured; otherwise use a placeholder URL
export const supabase: SupabaseClient = CONFIGURED
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export const isSupabaseConfigured = () => CONFIGURED;
