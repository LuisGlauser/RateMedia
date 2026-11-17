import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Star } from "lucide-react";
import Avatar from "@/components/Avatar";
import { formatScore, mediaReviewBadge, timeAgoLabel } from "@/lib/format";
import type { FeedRow } from "@/lib/home-data";
import { toggleReviewLike } from "@/lib/actions/social";
import LikeButton from "./LikeButton";

/** Avaliação real (obra ou campanha) no estilo do feed "Pulso Social". */
export default function ReviewCard({
  row,
  liked,
  loggedIn,
  linkThread = true,
}: {
  row: FeedRow;
  liked: boolean;
  loggedIn: boolean;
  linkThread?: boolean;
}) {
  const isCampaign = row.kind === "campaign";
  const badge = isCampaign
    ? { label: `Mesa RPG${row.context ? ` • ${row.context}` : ""}`, tone: "text-primary" }
    : mediaReviewBadge(row.user_status, row.target_type as Exclude<FeedRow["target_type"], "rpg">);
  const note = isCampaign
    ? "Campanha de RPG"
    : row.has_spoilers
      ? "Contém spoilers"
      : "Revisão sem spoilers";
  const targetHref = isCampaign ? `/campanhas/${row.target_id}` : `/obras/${row.target_id}`;
  const threadHref = `/avaliacoes/${row.kind}/${row.ref_id}`;
  const comments = `${row.comments_count.toLocaleString("pt-BR")} ${row.comments_count === 1 ? "comentário" : "comentários"}`;

  return (
    <article className="flex gap-4 rounded-xl bg-surface p-4">
      <Link
        href={targetHref}
        tabIndex={-1}
        aria-hidden
        className="relative hidden aspect-[2/3] h-[120px] shrink-0 overflow-hidden rounded bg-surface-low sm:block"
      >
        {row.target_cover && (
          <Image src={row.target_cover} alt="" fill sizes="80px" className="object-cover" />
        )}
      </Link>

      <div className="min-w-0 flex-1 space-y-1">
        <header className="flex flex-wrap items-center justify-between gap-y-1">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={row.username} url={row.avatar_url} />
            <span className="truncate text-xs font-bold tracking-[0.24px]">{row.username}</span>
            {badge && (
              <span className={`rounded-full bg-surface-highest px-2 py-0.5 text-[11px] font-bold tracking-label ${badge.tone}`}>
                {badge.label}
              </span>
            )}
          </div>
          <time dateTime={row.created_at} className="text-xs text-ink-dim">
            {timeAgoLabel(row.created_at)}
          </time>
        </header>

        <p className="flex flex-wrap items-center gap-x-2">
          <Link href={targetHref} className="text-lg font-semibold tracking-[-0.9px] hover:underline">
            {row.target_title}
          </Link>
          {row.rating !== null && (
            <span className="flex items-center gap-0.5 text-xs font-bold tracking-[0.24px] text-tertiary">
              <Star aria-hidden className="size-3 fill-current" />
              {formatScore(row.kind, row.rating)}
            </span>
          )}
        </p>

        {row.has_spoilers ? (
          <details className="rounded bg-surface-low px-3 py-2 text-sm">
            <summary className="cursor-pointer text-xs font-semibold text-danger">
              Este comentário contém spoilers. Mostrar
            </summary>
            <p className="mt-2 whitespace-pre-line text-ink-muted">{row.body}</p>
          </details>
        ) : (
          <p className="line-clamp-4 whitespace-pre-line text-sm leading-[22.75px] text-ink-muted">
            “{row.body}”
          </p>
        )}

        <footer className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-bold tracking-label text-ink-dim">
          <LikeButton
            action={toggleReviewLike.bind(null, row.kind, row.ref_id)}
            count={row.likes_count}
            liked={liked}
            loggedIn={loggedIn}
          />
          {linkThread ? (
            <Link href={threadHref} className="flex items-center gap-1 hover:text-ink">
              <MessageSquare aria-hidden className="size-3" />
              {comments}
            </Link>
          ) : (
            <span className="flex items-center gap-1">
              <MessageSquare aria-hidden className="size-3" />
              {comments}
            </span>
          )}
          <span className="text-ink-dim/70">{note}</span>
        </footer>
      </div>
    </article>
  );
}
