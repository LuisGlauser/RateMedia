import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { campaignRatings, mediaRatings } from "@/lib/data";
import { CAMPAIGN_STATUSES } from "@/lib/constants";
import {
  DEMO_POPULAR,
  DEMO_RPG,
  DEMO_TRENDING,
  type DemoRpg,
  type PosterCategory,
  type PosterItem,
} from "@/lib/demo-data";
import {
  EMPTY_VIEWER,
  getFeaturedLists,
  getHomeViewer,
  getLatestReviews,
  getTopCurators,
  getTrending,
  type CuratorRow,
  type FeaturedListRow,
  type FeedRow,
  type HomeViewer,
  type TrendingRow,
} from "@/lib/home-data";
import { MEDIA_TYPES } from "@/lib/constants";
import type { Campaign, Media } from "@/types";
import Hero, { DEMO_SPOTLIGHT, type SpotlightData } from "@/components/home/Hero";
import StatsStrip, { type Stats } from "@/components/home/StatsStrip";
import Poster from "@/components/home/Poster";
import SectionHeading from "@/components/home/SectionHeading";
import RpgFeatured from "@/components/home/RpgFeatured";
import CommunityFeed from "@/components/home/CommunityFeed";
import TrendingCarousel from "@/components/home/TrendingCarousel";

export const dynamic = "force-dynamic";

const TABS: { key: string; label: string }[] = [
  { key: "", label: "Todos" },
  { key: "anime", label: "Animes" },
  { key: "manga", label: "Mangás" },
  { key: "series", label: "Séries" },
  { key: "movie", label: "Filmes" },
  { key: "rpg", label: "Mesas RPG" },
];

const fmt = (n: number) => n.toLocaleString("pt-BR");

function toPoster(m: Media, rating: number | null): PosterItem {
  return {
    id: m.id,
    title: m.title,
    category: m.type as PosterCategory,
    rating,
    year: m.release_year,
    subtitle: unitsLabel(m),
    cover: m.cover_url,
  };
}

const unitsLabel = (m: { total_units: number | null }) =>
  m.total_units ? `${m.total_units} un.` : undefined;

function metaOf(type: Media["type"], units: number | null): string {
  return `${MEDIA_TYPES[type].toUpperCase()}${units ? ` • ${units} un.` : ""}`;
}

// Spotlight = obra #1 do ranking semanal (get_trending_media).
function toSpotlight(t: TrendingRow): SpotlightData {
  return {
    id: t.id,
    type: t.type,
    title: t.title,
    year: t.release_year,
    meta: metaOf(t.type, t.total_units),
    tags: [],
    synopsis: t.synopsis ?? "Sem sinopse cadastrada.",
    cover: t.cover_url,
    score: t.avg_rating,
    ratingsCount: t.ratings_count,
    aspects: { art: t.art_pct, sound: t.sound_pct, story: t.story_pct },
    delta: t.engagement_delta_pct,
  };
}

const RPG_BADGES = [
  "bg-primary-strong/80 text-primary-on",
  "bg-secondary-strong/80 text-secondary-on",
  "bg-danger-container/80 text-danger-on",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat = "" } = await searchParams;

  let trending: PosterItem[] = DEMO_TRENDING;
  let popular: PosterItem[] = DEMO_POPULAR;
  let rpg: DemoRpg[] = DEMO_RPG;
  let spotlight: SpotlightData = DEMO_SPOTLIGHT;
  let spotlightId: string | null = null;
  let reviews: FeedRow[] = [];
  let curators: CuratorRow[] = [];
  let featuredLists: FeaturedListRow[] = [];
  let viewer: HomeViewer = EMPTY_VIEWER;
  let rpgTotal = "1.420";
  let stats: Stats = {
    works: "24.500+",
    reviews: "180.400+",
    campaigns: "1.420+",
    curators: "56.200+",
  };

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [
      { data: mediaRows },
      { data: campRows },
      works,
      reviewsCount,
      camps,
      users,
      trendingRows,
      reviewRows,
      curatorRows,
      listRows,
    ] = await Promise.all([
        supabase.from("media").select("*").order("created_at", { ascending: false }).limit(24),
        supabase
          .from("campaigns")
          .select("*, profiles(username)")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase.from("media").select("id", { count: "exact", head: true }),
        supabase.from("library_entries").select("id", { count: "exact", head: true }).not("review", "is", null),
        supabase.from("campaigns").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        // Dados reais da Home (cache de 15 min; ver src/lib/home-data.ts)
        getTrending(),
        getLatestReviews(),
        getTopCurators(),
        getFeaturedLists(),
      ]);

    reviews = reviewRows;
    curators = curatorRows;
    featuredLists = listRows;

    const media = (mediaRows ?? []) as Media[];
    if (media.length > 0) {
      const ratings = await mediaRatings(media.map((m) => m.id));
      const posters = media.map((m) => toPoster(m, ratings.get(m.id) ?? null));
      popular = posters;

      if (trendingRows.length > 0) {
        // Ranking semanal por engajamento: alimenta o carrossel e o Spotlight (#1).
        trending = trendingRows.map((t, i) => ({
          id: t.id,
          title: t.title,
          category: t.type,
          rating: t.avg_rating,
          year: t.release_year,
          subtitle: unitsLabel(t),
          rank: `#${i + 1}`,
          cover: t.cover_url,
        }));
        spotlight = toSpotlight(trendingRows[0]);
      } else {
        // Fallback (ex.: migration 002 ainda não aplicada): obras mais recentes.
        trending = posters.slice(0, 12);
        const top = media[0];
        spotlight = toSpotlight({
          id: top.id,
          type: top.type,
          title: top.title,
          synopsis: top.synopsis,
          cover_url: top.cover_url,
          release_year: top.release_year,
          total_units: top.total_units,
          avg_rating: ratings.get(top.id) ?? null,
          ratings_count: 0,
          art_pct: null,
          sound_pct: null,
          story_pct: null,
          engagement: 0,
          engagement_delta_pct: null,
        });
      }
      spotlightId = spotlight.id;
    }

    viewer = await getHomeViewer({
      spotlightId,
      reviews,
      curatorIds: curators.map((c) => c.id),
    });

    const campaigns = (campRows ?? []) as (Campaign & { profiles: { username: string } | null })[];
    if (campaigns.length > 0) {
      const cr = await campaignRatings(campaigns.map((c) => c.id));
      rpg = campaigns.map((c, i) => ({
        id: c.id,
        title: c.title,
        synopsis: c.synopsis,
        badge: c.system,
        badgeClass: RPG_BADGES[i % RPG_BADGES.length],
        system: "RPG",
        rating: cr.get(c.id) ?? 0,
        phase: CAMPAIGN_STATUSES[c.status],
        cadence: CAMPAIGN_STATUSES[c.status],
        dm: c.profiles?.username ?? "—",
        players: "—",
        sessions: "—",
        avatars: [{ letter: (c.profiles?.username ?? "M").slice(0, 1).toUpperCase(), className: "bg-primary-strong text-primary-on" }],
        extra: 0,
      }));
    }

    stats = {
      works: fmt(works.count ?? 0),
      reviews: fmt(reviewsCount.count ?? 0),
      campaigns: fmt(camps.count ?? 0),
      curators: fmt(users.count ?? 0),
    };
    rpgTotal = fmt(camps.count ?? 0);
  }

  const filtered = (cat ? popular.filter((p) => p.category === cat) : popular).slice(0, 8);

  return (
    <>
      <Hero data={spotlight} viewer={viewer.spotlight} loggedIn={viewer.userId !== null} />
      <StatsStrip stats={stats} />

      <div className="mx-auto max-w-[1280px] space-y-10 px-6 py-10 xl:px-12">
        <TrendingCarousel items={trending} />

        <RpgFeatured items={rpg} total={rpgTotal} />

        <section className="space-y-4">
          <SectionHeading eyebrow="Exploração dinâmica" title="Populares por Categoria" tone="secondary">
            <nav aria-label="Filtrar por categoria" className="flex gap-1.5 overflow-x-auto rounded-xl bg-surface p-1">
              {TABS.map((t) => (
                <Link
                  key={t.label}
                  href={t.key ? `/?cat=${t.key}` : "/"}
                  scroll={false}
                  className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-semibold tracking-[0.24px] ${
                    cat === t.key ? "bg-surface-highest text-ink" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </SectionHeading>
          {filtered.length === 0 ? (
            <p className="text-sm text-ink-dim">Nada nesta categoria ainda.</p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-8">
              {filtered.map((p) => (
                <Poster key={p.title} item={p} variant="sm" />
              ))}
            </div>
          )}
        </section>

        <CommunityFeed reviews={reviews} curators={curators} lists={featuredLists} viewer={viewer} />
      </div>
    </>
  );
}
