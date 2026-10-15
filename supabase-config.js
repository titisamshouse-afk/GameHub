// GameHub uses a public publishable key. Row Level Security protects all database tables.
window.GAMEHUB_SUPABASE_URL = 'https://zqclemxgdonlewjetxsy.supabase.co';
window.GAMEHUB_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_tOS8Y_oUdcxBbJjqEruNJA_ipaZU-O_';
if (window.supabase && window.supabase.createClient) {
  window.ghSupabase = window.supabase.createClient(
    window.GAMEHUB_SUPABASE_URL,
    window.GAMEHUB_SUPABASE_PUBLISHABLE_KEY
  );
}
