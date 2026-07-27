const SUPABASE_URL = "https://khsqeyxsturmexsghpbp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_gsnPsdUFNvU0hLFSrd3IwQ_S59dW8DG";

if (typeof globalThis !== 'undefined') {
  globalThis.SUPABASE_URL = SUPABASE_URL;
  globalThis.SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;
  if (typeof globalThis.SUPABASE_ANON_KEY !== 'string' || !globalThis.SUPABASE_ANON_KEY.trim()) {
    globalThis.SUPABASE_ANON_KEY = SUPABASE_PUBLISHABLE_KEY;
  }
}