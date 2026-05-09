import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials missing. UI is in demo mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Vote = 'boy' | 'girl';

export interface VoteRecord {
  id: string;
  name: string;
  vote: Vote;
  device_id: string;
  created_at: string;
}
