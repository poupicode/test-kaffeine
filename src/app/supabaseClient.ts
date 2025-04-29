import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://wzxlnuaxwfblwdmmepls.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6eGxudWF4d2ZibHdkbW1lcGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzE3Mjc5NDUsImV4cCI6MTk4NzMwMzk0NX0.OmJeexn_QbPXP6OH94kJf8AVO00DkbRY6BDfkqa6ELU',
  {
    realtime: {
      params: {
        eventsPerSecond: 20,
      },
    },
  }
)
