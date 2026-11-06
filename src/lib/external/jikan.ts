import type { Media } from "@/types";

type JikanItem = {
  mal_id: number;
  title: string;
  synopsis: string | null;
  year?: number | null;
  aired?: { prop?: { from?: { year?: number | null } } };
  published?: { prop?: { from?: { year?: number | null } } };
  episodes?: number | null;
  chapters?: number | null;
  images?: { jpg?: { image_url?: string } };
};

export async function searchJikan(
  kind: "anime" | "manga",
  query: string,
  limit = 12,
): Promise<(Omit<Media, "id"> & { external_id: string })[]> {
  const res = await fetch(
    `https://api.jikan.moe/v4/${kind}?q=${encodeURIComponent(query)}&limit=${limit}&sfw=true`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { data: JikanItem[] };

  return json.data.map((i) => ({
    external_id: String(i.mal_id),
    type: kind,
    title: i.title,
    synopsis: i.synopsis,
    cover_url: i.images?.jpg?.image_url ?? null,
    release_year:
      i.year ?? i.aired?.prop?.from?.year ?? i.published?.prop?.from?.year ?? null,
    total_units: i.episodes ?? i.chapters ?? null,
  }));
}
