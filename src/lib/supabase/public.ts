import { createClient } from "@supabase/supabase-js";

// Cliente sem cookies/sessão, para consultas públicas que podem ser cacheadas
// (unstable_cache não pode ler cookies()). Só enxerga o que a RLS libera ao anon.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
