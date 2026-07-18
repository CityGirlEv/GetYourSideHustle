import { createClient } from '@supabase/supabase-js';

// These environment variables should be defined in a .env file at the project root.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://YOUR_SUPABASE_PROJECT.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
