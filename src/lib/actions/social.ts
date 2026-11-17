"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validators";
import type { ReviewKind } from "@/types";

async function requireUser(next: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return { supabase, user };
}

const refreshHome = () => {
  updateTag("home");
  revalidatePath("/");
};

const refColumn = (kind: ReviewKind) => (kind === "media" ? "entry_id" : "campaign_review_id");

function assertReview(kind: string, refId: string): asserts kind is ReviewKind {
  if ((kind !== "media" && kind !== "campaign") || !isUuid(refId)) {
    throw new Error("Avaliação inválida.");
  }
}

/** Curte/descurte uma avaliação. */
export async function toggleReviewLike(kind: ReviewKind, refId: string): Promise<{ liked: boolean }> {
  assertReview(kind, refId);
  const { supabase, user } = await requireUser("/");
  const col = refColumn(kind);

  const { data: existing } = await supabase
    .from("review_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq(col, refId)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("review_likes").delete().eq("id", existing.id)
    : await supabase.from("review_likes").insert({ user_id: user.id, [col]: refId });
  if (error) throw new Error(error.message);

  refreshHome();
  return { liked: !existing };
}

export async function toggleFollow(targetUserId: string): Promise<{ liked: boolean }> {
  if (!isUuid(targetUserId)) throw new Error("Usuário inválido.");
  const { supabase, user } = await requireUser("/");
  if (user.id === targetUserId) throw new Error("Você não pode seguir a si mesmo.");

  const { data: existing } = await supabase
    .from("follows")
    .select("followed_id")
    .eq("follower_id", user.id)
    .eq("followed_id", targetUserId)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("follows").delete().eq("follower_id", user.id).eq("followed_id", targetUserId)
    : await supabase.from("follows").insert({ follower_id: user.id, followed_id: targetUserId });
  if (error) throw new Error(error.message);

  refreshHome();
  return { liked: !existing };
}

export async function toggleListLike(listId: string): Promise<{ liked: boolean }> {
  if (!isUuid(listId)) throw new Error("Lista inválida.");
  const { supabase, user } = await requireUser(`/lista/${listId}`);

  const { data: existing } = await supabase
    .from("list_likes")
    .select("list_id")
    .eq("list_id", listId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("list_likes").delete().eq("list_id", listId).eq("user_id", user.id)
    : await supabase.from("list_likes").insert({ list_id: listId, user_id: user.id });
  if (error) throw new Error(error.message);

  refreshHome();
  revalidatePath(`/lista/${listId}`);
  return { liked: !existing };
}

export async function addReviewComment(kind: ReviewKind, refId: string, formData: FormData) {
  assertReview(kind, refId);
  const path = `/avaliacoes/${kind}/${refId}`;
  const { supabase, user } = await requireUser(path);

  const body = String(formData.get("body") ?? "").trim();
  if (body.length === 0 || body.length > 1000) return;

  const { error } = await supabase
    .from("review_comments")
    .insert({ user_id: user.id, body, [refColumn(kind)]: refId });
  if (error) throw new Error(error.message);

  refreshHome();
  revalidatePath(path);
}

/** Remove um comentário (autor ou admin; a RLS garante a permissão). */
export async function deleteReviewComment(commentId: string, path: string) {
  if (!isUuid(commentId) || !path.startsWith("/avaliacoes/")) throw new Error("Pedido inválido.");
  const { supabase } = await requireUser(path);
  const { error } = await supabase.from("review_comments").delete().eq("id", commentId);
  if (error) throw new Error(error.message);

  refreshHome();
  revalidatePath(path);
}
