import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { fetchReviewsPage, getViewerLikes, likeKey } from "@/lib/home-data";
import ReviewCard from "@/components/home/ReviewCard";
import SectionHeading from "@/components/home/SectionHeading";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const page = Math.max(1, Number.parseInt(p ?? "1", 10) || 1);

  const fetched = isSupabaseConfigured() ? await fetchReviewsPage(page, PAGE_SIZE) : [];
  const rows = fetched.slice(0, PAGE_SIZE);
  const hasNext = fetched.length > PAGE_SIZE;
  const { userId, liked } = rows.length ? await getViewerLikes(rows) : { userId: null, liked: [] };
  const likedSet = new Set(liked);

  const pager = "rounded bg-surface px-4 py-2 text-xs font-semibold hover:bg-surface-high";

  return (
    <div className="mx-auto max-w-[960px] space-y-6 px-6 py-10">
      <SectionHeading eyebrow="Pulso social" title="Avaliações da Comunidade" tone="secondary" />

      {rows.length === 0 ? (
        <p className="rounded-xl bg-surface p-6 text-sm text-ink-dim">
          Nenhuma crítica por aqui ainda.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <ReviewCard
              key={likeKey(r.kind, r.ref_id)}
              row={r}
              liked={likedSet.has(likeKey(r.kind, r.ref_id))}
              loggedIn={userId !== null}
            />
          ))}
        </div>
      )}

      <nav aria-label="Paginação" className="flex items-center justify-between">
        {page > 1 ? (
          <Link href={`/avaliacoes?p=${page - 1}`} className={pager}>
            ← Mais recentes
          </Link>
        ) : (
          <span />
        )}
        {hasNext && (
          <Link href={`/avaliacoes?p=${page + 1}`} className={pager}>
            Mais antigas →
          </Link>
        )}
      </nav>
    </div>
  );
}
