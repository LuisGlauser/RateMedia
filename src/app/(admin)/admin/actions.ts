"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data";
import { MEDIA_TYPES, PUBLISH_STATUSES } from "@/lib/constants";
import type { MediaType, PublishStatus } from "@/types";

const text = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);
const int = (v: FormDataEntryValue | null) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
};

function mediaFields(formData: FormData) {
  const type = String(formData.get("type")) as MediaType;
  const status = String(formData.get("publish_status")) as PublishStatus;
  const cover = text(formData.get("cover_url"), 500);
  return {
    type: type in MEDIA_TYPES ? type : "anime",
    title: text(formData.get("title"), 200),
    subtitle: text(formData.get("subtitle"), 120) || null,
    synopsis: text(formData.get("synopsis"), 4000) || null,
    cover_url: /^https?:\/\//i.test(cover) ? cover : null,
    release_year: int(formData.get("release_year")),
    total_units: int(formData.get("total_units")),
    genres: text(formData.get("genres"), 300).split(",").map((g) => g.trim()).filter(Boolean).slice(0, 8),
    publish_status: status in PUBLISH_STATUSES ? status : "published",
  };
}

export async function createMedia(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const fields = mediaFields(formData);
  if (!fields.title) return;
  const supabase = await createClient();
  await supabase.from("media").insert({ ...fields, external_source: "manual", created_by: admin.id });
  revalidatePath("/admin", "layout");
  redirect("/admin/catalogo");
}

export async function updateMedia(formData: FormData) {
  if (!(await requireAdmin())) return;
  const fields = mediaFields(formData);
  if (!fields.title) return;
  const supabase = await createClient();
  await supabase.from("media").update(fields).eq("id", String(formData.get("id")));
  revalidatePath("/admin", "layout");
  redirect("/admin/catalogo");
}

export async function deleteMedia(formData: FormData) {
  if (!(await requireAdmin())) return;
  const supabase = await createClient();
  await supabase.from("media").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin", "layout");
}

export async function deleteCampaignReview(formData: FormData) {
  if (!(await requireAdmin())) return;
  const supabase = await createClient();
  await supabase.from("campaign_reviews").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/moderacao");
}

/** Remove só o texto da resenha; a nota do usuário é preservada. */
export async function clearLibraryReview(formData: FormData) {
  if (!(await requireAdmin())) return;
  const supabase = await createClient();
  await supabase.from("library_entries").update({ review: null }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/moderacao");
}

export async function setUserRole(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const id = String(formData.get("id"));
  if (id === admin.id) return; // evita o admin remover o próprio acesso
  const role = formData.get("role") === "admin" ? "admin" : "user";
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin/usuarios");
}
