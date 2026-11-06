import type { Media } from "@/types";

type TmdbItem = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
};

export async function searchTmdb(
  kind: "movie" | "series",
  query: string,
): Promise<(Omit<Media, "id"> & { external_id: string })[]> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return [];

  const endpoint = kind === "movie" ? "movie" : "tv";
  const res = await fetch(
    `https://api.themoviedb.org/3/search/${endpoint}?api_key=${key}&language=pt-BR&query=${encodeURIComponent(query)}`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { results: TmdbItem[] };

  return json.results.slice(0, 12).map((i) => {
    const date = i.release_date ?? i.first_air_date ?? "";
    return {
      external_id: String(i.id),
      type: kind,
      title: i.title ?? i.name ?? "Sem título",
      synopsis: i.overview || null,
      cover_url: i.poster_path ? `https://image.tmdb.org/t/p/w342${i.poster_path}` : null,
      release_year: date ? Number(date.slice(0, 4)) : null,
      total_units: kind === "movie" ? 1 : null,
    };
  });
}
