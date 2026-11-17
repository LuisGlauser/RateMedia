import Link from "next/link";
import { BadgeCheck, LibraryBig, UsersRound } from "lucide-react";
import Avatar from "@/components/Avatar";
import { itemsLabel } from "@/lib/format";
import { likeKey, type CuratorRow, type FeaturedListRow, type FeedRow, type HomeViewer } from "@/lib/home-data";
import { toggleFollow } from "@/lib/actions/social";
import SectionHeading from "./SectionHeading";
import ReviewCard from "./ReviewCard";
import FollowButton from "./FollowButton";

const RANK_TONES = ["text-secondary", "text-tertiary", "text-ink-dim"];
const LIST_TONES = ["text-secondary", "text-tertiary", "text-primary"];

function curatorInfo(c: CuratorRow): string {
  // Mestres de RPG aparecem com sessões/campanhas quando isso supera as críticas.
  if (c.campaigns_count > c.reviews_30d) {
    return `${c.campaigns_count.toLocaleString("pt-BR")} ${c.campaigns_count === 1 ? "campanha mestrada" : "campanhas mestradas"}`;
  }
  return `${c.reviews_30d.toLocaleString("pt-BR")} ${c.reviews_30d === 1 ? "review" : "reviews"} este mês`;
}

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-lg bg-surface-low p-4 text-xs leading-5 text-ink-dim">{children}</p>
);

export default function CommunityFeed({
  reviews,
  curators,
  lists,
  viewer,
}: {
  reviews: FeedRow[];
  curators: CuratorRow[];
  lists: FeaturedListRow[];
  viewer: HomeViewer;
}) {
  const loggedIn = viewer.userId !== null;
  const liked = new Set(viewer.liked);
  const following = new Set(viewer.following);

  return (
    <section className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-8">
        <SectionHeading eyebrow="Pulso social" title="Últimas Avaliações da Comunidade" tone="secondary">
          <Link href="/avaliacoes" className="text-xs font-semibold tracking-[0.24px] text-primary hover:underline">
            Ver todas
          </Link>
        </SectionHeading>

        <div className="space-y-2">
          {reviews.length === 0 ? (
            <div className="rounded-xl bg-surface p-6 text-sm text-ink-dim">
              Ainda não há críticas publicadas. Abra uma obra, escreva a primeira e ela aparece aqui.
            </div>
          ) : (
            reviews.map((r) => (
              <ReviewCard
                key={likeKey(r.kind, r.ref_id)}
                row={r}
                liked={liked.has(likeKey(r.kind, r.ref_id))}
                loggedIn={loggedIn}
              />
            ))
          )}
        </div>
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="space-y-4 rounded-xl bg-surface p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-[-0.9px]">Curadores Top da Semana</h3>
            <BadgeCheck aria-hidden className="size-5 text-secondary" />
          </div>
          {curators.length === 0 ? (
            <Empty>Os curadores aparecem aqui quando a comunidade começar a publicar críticas.</Empty>
          ) : (
            <ul className="space-y-2">
              {curators.map((c, i) => (
                <li key={c.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface-low p-2">
                  <div className="flex min-w-0 items-center">
                    <span className={`w-4 text-[11px] font-bold tracking-label ${RANK_TONES[i] ?? "text-ink-dim"}`}>
                      {i + 1}
                    </span>
                    <Avatar name={c.username} url={c.avatar_url} className="ml-2 size-8 text-xs" />
                    <div className="min-w-0 pl-2">
                      <p className="truncate text-xs font-semibold tracking-[0.24px]">{c.username}</p>
                      <p className="text-xs text-ink-dim">{curatorInfo(c)}</p>
                    </div>
                  </div>
                  {c.id !== viewer.userId && (
                    <FollowButton
                      action={toggleFollow.bind(null, c.id)}
                      following={following.has(c.id)}
                      loggedIn={loggedIn}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4 rounded-xl bg-surface p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-[-0.9px]">Listas em Destaque</h3>
            <LibraryBig aria-hidden className="size-5 text-primary" />
          </div>
          {lists.length === 0 ? (
            <Empty>Nenhuma lista pública ainda. Crie uma em “Adicionar à Lista” e compartilhe.</Empty>
          ) : (
            <ul className="space-y-2">
              {lists.map((l, i) => (
                <li key={l.id}>
                  <Link href={`/lista/${l.id}`} className="block space-y-1 rounded-lg bg-surface-low p-2 hover:bg-surface-high">
                    <p className="text-xs font-bold tracking-[0.24px]">“{l.title}”</p>
                    <p className="flex items-center justify-between gap-2 text-[11px] font-bold tracking-label">
                      <span className="text-ink-dim">
                        Por @{l.owner_username} • {itemsLabel(l.dominant_type, l.items_count)}
                      </span>
                      <span className={`shrink-0 ${LIST_TONES[i % LIST_TONES.length]}`}>
                        {l.avg_rating !== null && `★ ${l.avg_rating.toFixed(1)} `}
                        ({l.likes_count.toLocaleString("pt-BR")} {l.likes_count === 1 ? "curtida" : "curtidas"})
                      </span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/lista"
            className="block rounded bg-surface-high py-2 text-center text-xs font-semibold tracking-[0.24px] hover:bg-surface-highest"
          >
            Explorar Mais Listas
          </Link>
        </div>

        <div className="space-y-2 rounded-xl bg-[linear-gradient(150deg,rgba(160,120,255,0.2)_0%,#1d2026_50%)] p-6">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-label text-primary">
            <UsersRound aria-hidden className="size-4" />
            Mesa própria
          </p>
          <h4 className="text-lg font-extrabold leading-[26px] tracking-[-0.9px]">
            Mestre de RPG? Catalogue sua campanha no RATEMEDIA
          </h4>
          <p className="text-xs leading-[18px] text-ink-muted">
            Crie logs de sessão, vincule fichas dos jogadores, receba avaliações da sua mesa e
            compartilhe seu universo com a comunidade.
          </p>
          <Link
            href="/campanhas/nova"
            className="mt-2 inline-block rounded bg-primary px-4 py-1 text-xs font-bold tracking-[0.24px] text-primary-on hover:bg-primary-strong"
          >
            Criar Ficha de Campanha
          </Link>
        </div>
      </aside>
    </section>
  );
}
