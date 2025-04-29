import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wzxlnuaxwfblwdmmepls.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6eGxudWF4d2ZibHdkbW1lcGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzE3Mjc5NDUsImV4cCI6MTk4NzMwMzk0NX0.OmJeexn_QbPXP6OH94kJf8AVO00DkbRY6BDfkqa6ELU';

export function createNewSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: {
      params: {
        eventsPerSecond: 20,
      },
    },
  });
}

// Le client initial
export let supabase = createNewSupabaseClient();