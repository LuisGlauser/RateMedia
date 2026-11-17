import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Info, TrendingDown, TrendingUp } from "lucide-react";
import AddToListButton from "@/components/AddToListButton";
import StarsFill from "@/components/StarsFill";
import { aspectWord } from "@/lib/format";
import type { SpotlightViewer } from "@/lib/home-data";
import type { MediaType } from "@/types";
import HeroActions from "./HeroActions";
import HeroRating from "./HeroRating";

export type AspectKey = "art" | "sound" | "story";

export interface SpotlightData {
  id: string | null; // null => conteúdo de demonstração (sem ações)
  type?: MediaType;
  title: string;
  original?: string;
  year?: number | string | null;
  meta: string; // ex.: "Anime • 10 Episódios • Studio Trigger"
  genre?: string;
  tags: string[];
  synopsis: string;
  cover?: string | null;
  score: number | null; // média real (0–5) ou null quando ninguém avaliou
  ratingsCount: number;
  aspects: Record<AspectKey, number | null>; // % de notas positivas por aspecto
  delta: number | null; // variação de engajamento vs. semana anterior (%)
}

export const DEMO_SPOTLIGHT: SpotlightData = {
  id: null,
  title: "Cyberpunk: Edgerunners",
  original: "サイバーパンク エッジランナーズ",
  year: 2022,
  meta: "Anime • 10 Episódios • Studio Trigger",
  genre: "Hi-Octane Sci-Fi & Dystopia",
  tags: ["Cyberpunk", "Ação visceral", "Distopia urbana", "Tragédia"],
  synopsis:
    "Em uma megalópole obcecada por tecnologia e modificações corporais ilimitadas, David Martinez, um garoto de rua brilhante e inconsequente, perde tudo num incidente trágico e decide arriscar a sanidade tornando-se um Edgerunner — um mercenário fora-da-lei cibernético de Night City.",
  score: 4.9,
  ratingsCount: 14280,
  aspects: { art: 99, sound: 98, story: 94 },
  delta: 38,
};

const BARS: { key: AspectKey; label: string; tone: string; bar: string }[] = [
  { key: "art", label: "Direção de Arte & Animação", tone: "text-secondary", bar: "bg-secondary" },
  { key: "sound", label: "Trilha Sonora Original", tone: "text-primary", bar: "bg-primary" },
  { key: "story", label: "Roteiro & Impacto Emocional", tone: "text-tertiary", bar: "bg-tertiary" },
];

export default function Hero({
  data,
  viewer = null,
  loggedIn = false,
}: {
  data: SpotlightData;
  viewer?: SpotlightViewer | null;
  loggedIn?: boolean;
}) {
  const detailHref = data.id ? `/obras/${data.id}` : "/busca";
  const interactive = data.id !== null && data.type !== undefined;
  const votes =
    data.ratingsCount > 0
      ? `${data.ratingsCount.toLocaleString("pt-BR")} ${data.ratingsCount === 1 ? "avaliação" : "avaliações"} da comunidade`
      : "Sem avaliações ainda";

  return (
    <section className="relative isolate overflow-hidden">
      {/* Fundo ambiente: capa desfocada (quando existe) + scrims */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_20%,rgba(160,120,255,0.18),transparent_55%),radial-gradient(ellipse_at_20%_80%,rgba(0,166,224,0.12),transparent_50%)]" />
      {data.cover && (
        <Image
          src={data.cover}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover opacity-40 mix-blend-multiply"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/70 to-transparent" />

      <div className="mx-auto grid max-w-[1280px] gap-6 px-6 pb-24 pt-20 lg:grid-cols-12 lg:px-12 lg:pt-28">
        <div className="space-y-4 lg:col-span-8 lg:self-end">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-primary-strong/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-label text-primary backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-primary" />
              Spotlight da semana #01
            </span>
            {data.delta !== null && (
              <span className="flex items-center gap-1 rounded bg-surface-high/80 px-2 py-0.5 text-[11px] font-bold tracking-label text-ink-muted">
                {data.delta >= 0 ? (
                  <TrendingUp aria-hidden className="size-3 text-secondary" />
                ) : (
                  <TrendingDown aria-hidden className="size-3 text-danger" />
                )}
                {data.delta > 0 ? "+" : ""}
                {data.delta}% Engajamento
              </span>
            )}
            <span className="rounded bg-surface-high/80 px-2 py-0.5 text-[11px] font-bold tracking-label text-ink-muted">
              {data.meta}
            </span>
          </div>

          <div>
            <h1 className="max-w-4xl text-4xl font-extrabold uppercase leading-[56px] tracking-[-1.2px] drop-shadow-xl sm:text-5xl">
              {data.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs tracking-[0.24px]">
              {data.original && <span className="font-bold text-secondary">{data.original}</span>}
              {data.year && (
                <>
                  {data.original && <span className="text-ink-dim">•</span>}
                  <span className="font-semibold text-ink-muted">{data.year}</span>
                </>
              )}
              {data.genre && (
                <>
                  <span className="text-ink-dim">•</span>
                  <span className="font-semibold text-ink-muted">{data.genre}</span>
                </>
              )}
            </div>
          </div>

          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.tags.map((t) => (
                <span
                  key={t}
                  className="rounded bg-surface-high/60 px-2.5 py-1 text-[11px] font-bold uppercase tracking-label backdrop-blur-md"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <p className="line-clamp-4 max-w-3xl text-base leading-[26px] text-ink-muted/90">
            {data.synopsis}
          </p>

          {interactive ? (
            <HeroActions
              key={data.id}
              mediaId={data.id!}
              mediaTitle={data.title}
              mediaType={data.type!}
              loggedIn={loggedIn}
              status={viewer?.status ?? null}
              isFavorite={viewer?.isFavorite ?? false}
            />
          ) : (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {/* Sem obra no banco (demonstração): o botão só leva à busca. */}
              <AddToListButton mediaId={null} mediaTitle={data.title} />
              <span className="inline-flex items-center gap-1 rounded bg-surface-high px-4 py-2 text-sm font-semibold">
                Definir Status
                <ChevronDown aria-hidden className="size-2.5" />
              </span>
              <Link
                href={detailHref}
                className="inline-flex items-center gap-1 rounded bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-high"
              >
                <Info aria-hidden className="size-4" />
                Ver Detalhes Completos
              </Link>
            </div>
          )}
        </div>

        {/* Widget de nota */}
        <aside className="space-y-4 self-end rounded-xl bg-surface/85 p-6 shadow-2xl backdrop-blur-[24px] lg:col-span-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="label text-ink-dim">Nota global RateMedia</p>
              <p className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold leading-[48px] tracking-[-1.44px]">
                  {data.score !== null ? data.score.toFixed(1) : "—"}
                </span>
                <span className="text-lg font-semibold tracking-[-0.9px] text-ink-dim">/ 5.0</span>
              </p>
            </div>
            <div className="flex flex-col items-end">
              <StarsFill value={data.score ?? 0} />
              <p className="pt-0.5 text-right text-xs text-ink-dim">{votes}</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {BARS.map((b) => {
              const pct = data.aspects[b.key];
              return (
                <div key={b.key} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold tracking-label">
                    <span className="text-ink-muted">{b.label}</span>
                    <span className={pct === null ? "text-ink-dim" : b.tone}>
                      {pct === null ? "Sem dados" : `${pct}% ${aspectWord(pct)}`}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={b.label}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct ?? 0}
                    className="h-1.5 overflow-hidden rounded-full bg-surface-highest"
                  >
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ${b.bar}`}
                      style={{ width: `${pct ?? 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {interactive ? (
            <HeroRating
              key={data.id}
              mediaId={data.id!}
              loggedIn={loggedIn}
              rating={viewer?.rating ?? null}
              aspects={{
                art: viewer?.art ?? null,
                sound: viewer?.sound ?? null,
                story: viewer?.story ?? null,
              }}
            />
          ) : (
            <p className="rounded-lg bg-surface-low px-4 py-2 text-[11px] font-bold tracking-label text-ink-muted">
              Cadastre obras para liberar as avaliações.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
