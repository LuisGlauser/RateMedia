import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data";
import { MEDIA_TYPES } from "@/lib/constants";
import type { Media, MediaType } from "@/types";

export const dynamic = "force-dynamic";

async function createMedia(formData: FormData) {
  "use server";
  const admin = await requireAdmin();
  if (!admin) return;
  const supabase = await createClient();
  const type = String(formData.get("type")) as MediaType;
  await supabase.from("media").insert({
    type: type in MEDIA_TYPES ? type : "anime",
    title: String(formData.get("title") ?? "").trim(),
    synopsis: String(formData.get("synopsis") ?? "").trim() || null,
    cover_url: String(formData.get("cover_url") ?? "").trim() || null,
    release_year: Number(formData.get("release_year")) || null,
    total_units: Number(formData.get("total_units")) || null,
    external_source: "manual",
    created_by: admin.id,
  });
  revalidatePath("/admin");
}

async function deleteMedia(formData: FormData) {
  "use server";
  if (!(await requireAdmin())) return;
  const supabase = await createClient();
  await supabase.from("media").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin");
}

async function deleteReview(formData: FormData) {
  "use server";
  if (!(await requireAdmin())) return;
  const supabase = await createClient();
  await supabase.from("campaign_reviews").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin");
}

export default async function AdminPage() {
  if (!(await requireAdmin())) notFound();
  const supabase = await createClient();

  const [{ data: media }, { data: reviews }] = await Promise.all([
    supabase.from("media").select("*").order("created_at", { ascending: false }).limit(50),
    supabase
      .from("campaign_reviews")
      .select("id, comment, rating, campaigns(title)")
      .not("comment", "is", null)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="space-y-12">
      <h1 className="text-2xl font-bold">Painel do administrador</h1>

      <section className="space-y-4">
        <h2 className="font-bold">Cadastrar obra</h2>
        <form action={createMedia} className="grid max-w-2xl gap-3 sm:grid-cols-2">
          <input name="title" required placeholder="Título" className="input sm:col-span-2" />
          <select name="type" className="input">
            {Object.entries(MEDIA_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input name="release_year" type="number" placeholder="Ano" className="input" />
          <input name="total_units" type="number" placeholder="Episódios/capítulos" className="input" />
          <input name="cover_url" placeholder="URL da capa" className="input" />
          <textarea name="synopsis" rows={3} placeholder="Sinopse" className="input sm:col-span-2" />
          <button className="btn-primary w-fit">Cadastrar</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Obras ({(media ?? []).length})</h2>
        <ul className="divide-y divide-line rounded-card border border-line">
          {((media ?? []) as Media[]).map((m) => (
            <li key={m.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <span>{m.title} <span className="text-ink-muted">· {MEDIA_TYPES[m.type]}</span></span>
              <form action={deleteMedia}>
                <input type="hidden" name="id" value={m.id} />
                <button className="text-danger hover:underline">Excluir</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Moderar comentários de campanhas</h2>
        <ul className="divide-y divide-line rounded-card border border-line">
          {(reviews ?? []).map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 px-4 py-2 text-sm">
              <span className="text-ink-muted">{r.comment}</span>
              <form action={deleteReview}>
                <input type="hidden" name="id" value={r.id} />
                <button className="text-danger hover:underline">Remover</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
