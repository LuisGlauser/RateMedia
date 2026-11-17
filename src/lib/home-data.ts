import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { MediaType, ReviewKind, UserStatus } from "@/types";

/* ------------------------------------------------------------------ tipos */

export interface TrendingRow {
  id: string;
  type: MediaType;
  title: string;
  synopsis: string | null;
  cover_url: string | null;
  release_year: number | null;
  total_units: number | null;
  avg_rating: number | null;
  ratings_count: number;
  art_pct: number | null;
  sound_pct: number | null;
  story_pct: number | null;
  engagement: number;
  engagement_delta_pct: number | null;
}

export interface FeedRow {
  kind: ReviewKind;
  ref_id: string;
  created_at: string;
  rating: number | null;
  body: string;
  has_spoilers: boolean;
  user_id: string;
  username: string;
  avatar_url: string | null;
  target_id: string;
  target_title: string;
  target_type: MediaType | "rpg";
  target_cover: string | null;
  user_status: UserStatus | null;
  context: string | null;
  likes_count: number;
  comments_count: number;
}

export interface CuratorRow {
  id: string;
  username: string;
  avatar_url: string | null;
  reviews_30d: number;
  campaigns_count: number;
  followers_count: number;
}

export interface FeaturedListRow {
  id: string;
  title: string;
  owner_username: string;
  items_count: number;
  likes_count: number;
  avg_rating: number | null;
  dominant_type: MediaType | "mixed";
}

/* ------------------------------------------------------------ normalização */

// numeric/bigint chegam como número via PostgREST, mas garantimos o tipo.
const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));
const int = (v: unknown): number => Number(v ?? 0);

const toTrending = (r: Record<string, unknown>): TrendingRow => ({
  ...(r as unknown as TrendingRow),
  avg_rating: num(r.avg_rating),
  ratings_count: int(r.ratings_count),
  art_pct: num(r.art_pct),
  sound_pct: num(r.sound_pct),
  story_pct: num(r.story_pct),
  engagement: int(r.engagement),
  engagement_delta_pct: num(r.engagement_delta_pct),
});

const toFeed = (r: Record<string, unknown>): FeedRow => ({
  ...(r as unknown as FeedRow),
  rating: num(r.rating),
  likes_count: int(r.likes_count),
  comments_count: int(r.comments_count),
});

const toCurator = (r: Record<string, unknown>): CuratorRow => ({
  ...(r as unknown as CuratorRow),
  reviews_30d: int(r.reviews_30d),
  campaigns_count: int(r.campaigns_count),
  followers_count: int(r.followers_count),
});

const toList = (r: Record<string, unknown>): FeaturedListRow => ({
  ...(r as unknown as FeaturedListRow),
  items_count: int(r.items_count),
  likes_count: int(r.likes_count),
  avg_rating: num(r.avg_rating),
});

/* ------------------------------------------------- consultas públicas (RPC) */

async function callRpc<T>(
  name: string,
  args: Record<string, unknown>,
  map: (row: Record<string, unknown>) => T,
): Promise<T[]> {
  const { data, error } = await createPublicClient().rpc(name, args);
  if (error) throw new Error(`${name}: ${error.message}`);
  return ((data ?? []) as Record<string, unknown>[]).map(map);
}

// Cache de 15 min ("Atualizado a cada 15 min"). As Server Actions chamam
// updateTag("home") para refletir ações do usuário imediatamente.
// Se a RPC falhar (ex.: migration ainda não aplicada) nada é cacheado e a Home
// renderiza o estado vazio em vez de quebrar.
function cachedRpc<T>(
  key: string,
  name: string,
  args: Record<string, unknown>,
  map: (row: Record<string, unknown>) => T,
) {
  const run = unstable_cache(() => callRpc(name, args, map), ["home", key], {
    revalidate: 900,
    tags: ["home"],
  });
  return async (): Promise<T[]> => {
    try {
      return await run();
    } catch (e) {
      console.error("[home]", e instanceof Error ? e.message : e);
      return [];
    }
  };
}

export const getTrending = cachedRpc("trending", "get_trending_media", { p_limit: 12 }, toTrending);
export const getLatestReviews = cachedRpc("reviews", "get_latest_reviews", { p_limit: 6 }, toFeed);
export const getTopCurators = cachedRpc("curators", "get_top_curators", { p_limit: 3 }, toCurator);
export const getFeaturedLists = cachedRpc("lists", "get_featured_lists", { p_limit: 3 }, toList);

/**
 * Página do feed completo (sem cache; paginação por offset). Busca uma linha a mais
 * que `pageSize` para a página saber se existe "próxima".
 */
export async function fetchReviewsPage(page: number, pageSize = 20): Promise<FeedRow[]> {
  try {
    return await callRpc(
      "get_latest_reviews",
      { p_limit: pageSize + 1, p_offset: Math.max(0, page - 1) * pageSize },
      toFeed,
    );
  } catch (e) {
    console.error("[avaliacoes]", e instanceof Error ? e.message : e);
    return [];
  }
}

export async function fetchFeaturedLists(limit: number): Promise<FeaturedListRow[]> {
  try {
    return await callRpc("get_featured_lists", { p_limit: limit, p_offset: 0 }, toList);
  } catch (e) {
    console.error("[listas]", e instanceof Error ? e.message : e);
    return [];
  }
}

/* ---------------------------------------------- contexto do usuário logado */

export const likeKey = (kind: ReviewKind, id: string) => `${kind}:${id}`;

/** Quais avaliações o usuário atual já curtiu (chaves "media:<id>" / "campaign:<id>"). */
export async function getViewerLikes(
  rows: Pick<FeedRow, "kind" | "ref_id">[],
): Promise<{ userId: string | null; liked: string[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, liked: [] };

  const entryIds = rows.filter((r) => r.kind === "media").map((r) => r.ref_id);
  const campaignIds = rows.filter((r) => r.kind === "campaign").map((r) => r.ref_id);
  const filters: string[] = [];
  if (entryIds.length) filters.push(`entry_id.in.(${entryIds.join(",")})`);
  if (campaignIds.length) filters.push(`campaign_review_id.in.(${campaignIds.join(",")})`);
  if (filters.length === 0) return { userId: user.id, liked: [] };

  const { data } = await supabase
    .from("review_likes")
    .select("entry_id, campaign_review_id")
    .eq("user_id", user.id)
    .or(filters.join(","));

  const liked = (data ?? []).map((l) =>
    l.entry_id ? likeKey("media", l.entry_id) : likeKey("campaign", l.campaign_review_id),
  );
  return { userId: user.id, liked };
}

export interface SpotlightViewer {
  rating: number | null; // 0–5, passos de 0,5
  art: number | null;
  sound: number | null;
  story: number | null;
  status: UserStatus | null;
  isFavorite: boolean;
}

export interface HomeViewer {
  userId: string | null;
  spotlight: SpotlightViewer | null;
  liked: string[];
  following: string[];
}

export const EMPTY_VIEWER: HomeViewer = { userId: null, spotlight: null, liked: [], following: [] };

export async function getHomeViewer(opts: {
  spotlightId: string | null;
  reviews: FeedRow[];
  curatorIds: string[];
}): Promise<HomeViewer> {
  const { userId, liked } = await getViewerLikes(opts.reviews);
  if (!userId) return EMPTY_VIEWER;
  const supabase = await createClient();

  const [followsRes, entryRes] = await Promise.all([
    opts.curatorIds.length
      ? supabase
          .from("follows")
          .select("followed_id")
          .eq("follower_id", userId)
          .in("followed_id", opts.curatorIds)
      : Promise.resolve({ data: [] as { followed_id: string }[] }),
    opts.spotlightId
      ? supabase
          .from("library_entries")
          .select("rating, rating_art, rating_sound, rating_story, status, is_favorite")
          .eq("user_id", userId)
          .eq("media_id", opts.spotlightId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const e = entryRes.data;
  const spotlight: SpotlightViewer | null = opts.spotlightId
    ? {
        rating: num(e?.rating),
        art: num(e?.rating_art),
        sound: num(e?.rating_sound),
        story: num(e?.rating_story),
        status: (e?.status as UserStatus | undefined) ?? null,
        isFavorite: Boolean(e?.is_favorite),
      }
    : null;

  return {
    userId,
    spotlight,
    liked,
    following: (followsRes.data ?? []).map((f) => f.followed_id),
  };
}
