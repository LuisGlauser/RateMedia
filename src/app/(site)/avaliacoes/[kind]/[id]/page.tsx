import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validators";
import { timeAgo } from "@/lib/format";
import type { FeedRow } from "@/lib/home-data";
import type { ReviewKind } from "@/types";
import { addReviewComment, deleteReviewComment } from "@/lib/actions/social";
import Avatar from "@/components/Avatar";
import ReviewCard from "@/components/home/ReviewCard";

export const dynamic = "force-dynamic";

interface Author {
  username: string;
  avatar_url: string | null;
}
interface CommentRow {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: Author | null;
}

export default async function ReviewThread({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if ((kind !== "media" && kind !== "campaign") || !isUuid(id)) notFound();
  const k = kind as ReviewKind;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const refCol = k === "media" ? "entry_id" : "campaign_review_id";

  // Carrega a avaliação já no formato do feed para reutilizar o ReviewCard.
  let row: FeedRow | null = null;
  if (k === "media") {
    const { data } = await supabase
      .from("library_entries")
      .select(
        "id, rating, review, has_spoilers, status, updated_at, user_id, profiles(username, avatar_url), media(id, title, type, cover_url)",
      )
      .eq("id", id)
      .not("review", "is", null)
      .maybeSingle();
    if (data?.media && data.profiles) {
      const media = data.media as unknown as { id: string; title: string; type: FeedRow["target_type"]; cover_url: string | null };
      const author = data.profiles as unknown as Author;
      row = {
        kind: "media",
        ref_id: data.id,
        created_at: data.updated_at,
        rating: data.rating === null ? null : Number(data.rating),
        body: data.review,
        has_spoilers: data.has_spoilers,
        user_id: data.user_id,
        username: author.username,
        avatar_url: author.avatar_url,
        target_id: media.id,
        target_title: media.title,
        target_type: media.type,
        target_cover: media.cover_url,
        user_status: data.status,
        context: null,
        likes_count: 0,
        comments_count: 0,
      };
    }
  } else {
    const { data } = await supabase
      .from("campaign_reviews")
      .select(
        "id, rating, comment, created_at, user_id, profiles(username, avatar_url), campaigns(id, title, system, cover_url)",
      )
      .eq("id", id)
      .not("comment", "is", null)
      .maybeSingle();
    if (data?.campaigns && data.profiles) {
      const campaign = data.campaigns as unknown as { id: string; title: string; system: string; cover_url: string | null };
      const author = data.profiles as unknown as Author;
      row = {
        kind: "campaign",
        ref_id: data.id,
        created_at: data.created_at,
        rating: Number(data.rating),
        body: data.comment,
        has_spoilers: false,
        user_id: data.user_id,
        username: author.username,
        avatar_url: author.avatar_url,
        target_id: campaign.id,
        target_title: campaign.title,
        target_cover: campaign.cover_url,
        target_type: "rpg",
        user_status: null,
        context: campaign.system,
        likes_count: 0,
        comments_count: 0,
      };
    }
  }
  if (!row) notFound();

  const [likesRes, myLikeRes, commentsRes, roleRes] = await Promise.all([
    supabase.from("review_likes").select("id", { count: "exact", head: true }).eq(refCol, id),
    user
      ? supabase.from("review_likes").select("id").eq(refCol, id).eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("review_comments")
      .select("id, body, created_at, user_id, profiles(username, avatar_url)")
      .eq(refCol, id)
      .order("created_at", { ascending: true }),
    user
      ? supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const comments = (commentsRes.data ?? []) as unknown as CommentRow[];
  row = { ...row, likes_count: likesRes.count ?? 0, comments_count: comments.length };
  const isAdmin = roleRes.data?.role === "admin";
  const path = `/avaliacoes/${k}/${id}`;

  return (
    <div className="mx-auto max-w-[760px] space-y-6 px-6 py-10">
      <Link href="/avaliacoes" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
        <ArrowLeft aria-hidden className="size-3.5" />
        Todas as avaliações
      </Link>

      <ReviewCard row={row} liked={Boolean(myLikeRes.data)} loggedIn={Boolean(user)} linkThread={false} />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-[-0.5px]">Comentários</h2>

        {comments.length === 0 ? (
          <p className="rounded-xl bg-surface p-5 text-sm text-ink-dim">Seja o primeiro a comentar.</p>
        ) : (
          <ul className="space-y-2">
            {comments.map((c) => {
              const name = c.profiles?.username ?? "usuário";
              return (
                <li key={c.id} className="flex gap-3 rounded-xl bg-surface p-4">
                  <Avatar name={name} url={c.profiles?.avatar_url} className="size-8 text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold">{name}</span>
                      <span className="flex items-center gap-2 text-ink-dim">
                        {timeAgo(c.created_at)}
                        {(isAdmin || c.user_id === user?.id) && (
                          <form action={deleteReviewComment.bind(null, c.id, path)}>
                            <button aria-label="Excluir comentário" className="hover:text-danger">
                              <Trash2 aria-hidden className="size-3.5" />
                            </button>
                          </form>
                        )}
                      </span>
                    </p>
                    <p className="whitespace-pre-line pt-1 text-sm leading-6 text-ink-muted">{c.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {user ? (
          <form action={addReviewComment.bind(null, k, id)} className="space-y-2 rounded-xl bg-surface p-4">
            <label htmlFor="body" className="text-xs font-medium">
              Seu comentário
            </label>
            <textarea id="body" name="body" required maxLength={1000} rows={3} className="input" />
            <button className="btn-primary !py-1.5 !text-xs">Comentar</button>
          </form>
        ) : (
          <p className="rounded-xl bg-surface p-4 text-sm text-ink-muted">
            <Link href={`/login?next=${encodeURIComponent(path)}`} className="font-semibold text-primary hover:underline">
              Entre
            </Link>{" "}
            para comentar.
          </p>
        )}
      </section>
    </div>
  );
}
