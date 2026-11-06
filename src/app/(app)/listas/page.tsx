import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function createList(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("lists").insert({
    user_id: user.id,
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
  });
  revalidatePath("/listas");
}

export default async function ListsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: lists } = await supabase
    .from("lists")
    .select("id, title, description")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Minhas listas</h1>
      <form action={createList} className="grid max-w-xl gap-3">
        <input name="title" required placeholder='Ex: "Favoritos de 2026"' className="input" />
        <input name="description" placeholder="Descrição (opcional)" className="input" />
        <button className="btn-primary w-fit">Criar lista</button>
      </form>
      <ul className="grid gap-3 sm:grid-cols-2">
        {(lists ?? []).map((l) => (
          <li key={l.id} className="rounded-card border border-line bg-bg-card p-4">
            <h3 className="font-semibold">{l.title}</h3>
            {l.description && <p className="text-sm text-ink-muted">{l.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
