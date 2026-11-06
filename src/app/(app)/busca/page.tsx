import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { campaignRatings, mediaRatings } from "@/lib/data";
import { CAMPAIGN_STATUSES, MEDIA_TYPES, USER_STATUSES, statusLabel } from "@/lib/constants";
import MediaCard from "@/components/MediaCard";
import CampaignCard from "@/components/CampaignCard";
import type { Campaign, Media, MediaType, UserStatus } from "@/types";

export const dynamic = "force-dynamic";

type Params = { q?: string; tipo?: string; status?: string; min?: string; max?: string };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { q = "", tipo = "", status = "", min = "", max = "" } = await searchParams;
  const minRating = min ? Number(min) : 0;
  const maxRating = max ? Number(max) : 5;

  let media: Media[] = [];
  let campaigns: Campaign[] = [];
  let mRatings = new Map<string, number | null>();
  let cRatings = new Map<string, number | null>();
  const inRange = (r: number | null) =>
    !min && !max ? true : r !== null && r >= minRating && r <= maxRating;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();

    if (tipo !== "rpg") {
      let query = supabase.from("media").select("*").limit(60);
      if (q) query = query.ilike("title", `%${q}%`);
      if (tipo in MEDIA_TYPES) query = query.eq("type", tipo as MediaType);
      const { data } = await query;
      media = (data ?? []) as Media[];

      if (status) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: entries } = await supabase
            .from("library_entries")
            .select("media_id")
            .eq("user_id", user.id)
            .eq("status", status as UserStatus);
          const ids = new Set((entries ?? []).map((e) => e.media_id));
          media = media.filter((m) => ids.has(m.id));
        } else {
          media = [];
        }
      }
      mRatings = await mediaRatings(media.map((m) => m.id));
      media = media.filter((m) => inRange(mRatings.get(m.id) ?? null));
    }

    if (tipo === "" || tipo === "rpg") {
      let query = supabase.from("campaigns").select("*").limit(30);
      if (q) query = query.or(`title.ilike.%${q}%,system.ilike.%${q}%`);
      const { data } = await query;
      campaigns = ((data ?? []) as Campaign[]).filter(() => !status);
      cRatings = await campaignRatings(campaigns.map((c) => c.id));
      campaigns = campaigns.filter((c) => inRange(cRatings.get(c.id) ?? null));
    }
  }

  return (
    <div className="space-y-8">
      <form className="grid gap-3 rounded-card border border-line bg-bg-soft p-4 sm:grid-cols-5">
        <input name="q" defaultValue={q} placeholder="Título ou sistema..." className="input sm:col-span-2" />
        <select name="tipo" defaultValue={tipo} className="input">
          <option value="">Todos os tipos</option>
          {Object.entries(MEDIA_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
          <option value="rpg">Campanhas RPG</option>
        </select>
        <select name="status" defaultValue={status} className="input">
          <option value="">Qualquer status</option>
          {USER_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabel(s, "anime")}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input name="min" type="number" step="0.5" min="0" max="5" defaultValue={min} placeholder="Nota min" className="input" />
          <input name="max" type="number" step="0.5" min="0" max="5" defaultValue={max} placeholder="Nota máx" className="input" />
        </div>
        <button className="btn-primary sm:col-span-5">Filtrar</button>
      </form>

      {media.length > 0 && (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {media.map((m) => (
            <MediaCard key={m.id} media={m} rating={mRatings.get(m.id) ?? null} />
          ))}
        </section>
      )}

      {campaigns.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold">Campanhas ({Object.values(CAMPAIGN_STATUSES).length} status possíveis)</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} rating={cRatings.get(c.id) ?? null} />
            ))}
          </div>
        </section>
      )}

      {media.length === 0 && campaigns.length === 0 && (
        <p className="text-center text-sm text-ink-muted">Nada encontrado com esses filtros.</p>
      )}
    </div>
  );
}
