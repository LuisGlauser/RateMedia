import { statusLabel } from "@/lib/constants";
import type { MediaType, ReviewKind, UserStatus } from "@/types";

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "há 3 dias", "há 2 horas"... em pt-BR. */
export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "agora há pouco";
}

/** Igual a timeAgo, com a inicial maiúscula ("Há 14 minutos"), como no feed da Home. */
export function timeAgoLabel(iso: string, now = Date.now()): string {
  const text = timeAgo(iso, now);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function monthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

/** Palavra que acompanha a % positiva de um aspecto (barras do Spotlight). */
export function aspectWord(pct: number): string {
  if (pct >= 90) return "Aclamação";
  if (pct >= 75) return "Positivo";
  if (pct >= 50) return "Misto";
  return "Negativo";
}

const PLURALS: Record<string, [string, string]> = {
  anime: ["anime", "animes"],
  manga: ["mangá", "mangás"],
  series: ["série", "séries"],
  movie: ["filme", "filmes"],
  mixed: ["título", "títulos"],
};

/** "24 títulos", "40 animes", "1 filme". */
export function itemsLabel(type: string, count: number): string {
  const [one, many] = PLURALS[type] ?? PLURALS.mixed;
  return `${count.toLocaleString("pt-BR")} ${count === 1 ? one : many}`;
}

/** Selo exibido ao lado do autor de uma crítica de obra, conforme o status dele. */
export function mediaReviewBadge(
  status: UserStatus | null,
  type: MediaType,
): { label: string; tone: string } | null {
  switch (status) {
    case "completed":
      return {
        label: type === "manga" ? "Leu tudo" : type === "movie" ? "Assistiu" : "Assistiu tudo",
        tone: "text-secondary",
      };
    case "in_progress":
      return { label: statusLabel("in_progress", type), tone: "text-tertiary" };
    case "dropped":
      return { label: "Abandonou", tone: "text-danger" };
    default:
      return null;
  }
}

/** Campanhas usam a escala "d20": nota máxima vira "Nat 20". */
export function formatScore(kind: ReviewKind, rating: number): string {
  if (kind === "campaign") return rating >= 5 ? "Nat 20 / 5.0" : `${rating.toFixed(1)} / 5.0`;
  return rating.toFixed(1);
}

export const initialsOf = (name: string): string => name.slice(0, 2).toUpperCase();
