import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Usuário logado, consultado uma única vez por requisição.
 * Navbar, páginas e helpers chamam esta função em vez de `auth.getUser()`
 * para não repetir a mesma ida ao Supabase Auth em cada componente.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Papel e username do usuário logado (uma consulta por requisição). */
export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("username, role").eq("id", user.id).single();
  return { user, username: (data?.username as string | undefined) ?? null, role: (data?.role as string | undefined) ?? null };
});
