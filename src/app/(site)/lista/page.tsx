import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { fetchFeaturedLists } from "@/lib/home-data";
import { itemsLabel } from "@/lib/format";
import SectionHeading from "@/components/home/SectionHeading";

export const dynamic = "force-dynamic";

export default async function PublicListsPage() {
  const lists = isSupabaseConfigured() ? await fetchFeaturedLists(48) : [];

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-6 py-10 xl:px-12">
      <SectionHeading eyebrow="Comunidade" title="Listas em Destaque">
        <Link href="/listas" className="text-xs font-semibold text-primary hover:underline">
          Minhas listas
        </Link>
      </SectionHeading>

      {lists.length === 0 ? (
        <p className="rounded-xl bg-surface p-6 text-sm text-ink-dim">Nenhuma lista pública ainda.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((l) => (
            <li key={l.id}>
              <Link href={`/lista/${l.id}`} className="block space-y-2 rounded-xl bg-surface p-4 hover:bg-surface-high">
                <h3 className="font-bold tracking-[-0.3px]">“{l.title}”</h3>
                <p className="text-xs text-ink-dim">
                  Por @{l.owner_username} • {itemsLabel(l.dominant_type, l.items_count)}
                </p>
                <p className="text-[11px] font-bold tracking-label text-tertiary">
                  {l.avg_rating !== null && `★ ${l.avg_rating.toFixed(1)} `}
                  ({l.likes_count.toLocaleString("pt-BR")} {l.likes_count === 1 ? "curtida" : "curtidas"})
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
