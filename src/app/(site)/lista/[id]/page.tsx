import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mediaRatings } from "@/lib/data";
import { isUuid } from "@/lib/validators";
import { toggleListLike } from "@/lib/actions/social";
import type { PosterItem } from "@/lib/demo-data";
import type { Media } from "@/types";
import LikeButton from "@/components/home/LikeButton";
import Poster from "@/components/home/Poster";

export const dynamic = "force-dynamic";

export default async function PublicListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // A RLS já esconde listas privadas de quem não é o dono.
  const { data: list } = await supabase
    .from("lists")
    .select("id, title, description, profiles(username)")
    .eq("id", id)
    .maybeSingle();
  if (!list) notFound();

  const [itemsRes, likesRes, myLikeRes] = await Promise.all([
    supabase.from("list_items").select("position, media(*)").eq("list_id", id).order("position"),
    supabase.from("list_likes").select("user_id", { count: "exact", head: true }).eq("list_id", id),
    user
      ? supabase.from("list_likes").select("user_id").eq("list_id", id).eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const media = (itemsRes.data ?? [])
    .map((i) => i.media as unknown as Media | null)
    .filter((m): m is Media => m !== null);
  const ratings = await mediaRatings(media.map((m) => m.id));
  const posters: PosterItem[] = media.map((m) => ({
    id: m.id,
    title: m.title,
    category: m.type,
    rating: ratings.get(m.id) ?? null,
    year: m.release_year,
    subtitle: m.total_units ? `${m.total_units} un.` : undefined,
    cover: m.cover_url,
  }));
  const owner = (list.profiles as unknown as { username: string } | null)?.username ?? "usuário";

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-6 py-10 xl:px-12">
      <header className="space-y-2">
        <p className="label text-primary">Lista de @{owner}</p>
        <h1 className="text-4xl font-extrabold tracking-[-1px]">{list.title}</h1>
        {list.description && <p className="max-w-3xl text-ink-muted">{list.description}</p>}
        <div className="flex items-center gap-4 pt-1 text-xs font-bold tracking-label text-ink-dim">
          <span>
            {posters.length} {posters.length === 1 ? "título" : "títulos"}
          </span>
          <LikeButton
            action={toggleListLike.bind(null, id)}
            count={likesRes.count ?? 0}
            liked={Boolean(myLikeRes.data)}
            loggedIn={Boolean(user)}
          />
        </div>
      </header>

      {posters.length === 0 ? (
        <p className="rounded-xl bg-surface p-6 text-sm text-ink-dim">Esta lista ainda está vazia.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-6">
          {posters.map((p) => (
            <Poster key={p.id} item={p} variant="sm" />
          ))}
        </div>
      )}
    </div>
  );
}
