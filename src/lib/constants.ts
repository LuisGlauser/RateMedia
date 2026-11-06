import type { CampaignStatus, MediaType, UserStatus } from "@/types";

export const MEDIA_TYPES: Record<MediaType, string> = {
  anime: "Anime",
  manga: "Mangá",
  series: "Série",
  movie: "Filme",
};

// Rótulos dinâmicos por categoria (assistir x ler).
export function statusLabel(status: UserStatus, type: MediaType): string {
  const reading = type === "manga";
  const labels: Record<UserStatus, string> = {
    planned: reading ? "Quero Ler" : "Quero Assistir",
    in_progress: reading ? "Lendo" : "Assistindo",
    completed: reading ? "Lido" : "Assistido",
    dropped: "Abandonado",
  };
  return labels[status];
}

export const USER_STATUSES: UserStatus[] = ["planned", "in_progress", "completed", "dropped"];

export const CAMPAIGN_STATUSES: Record<CampaignStatus, string> = {
  recruiting: "Recrutando",
  ongoing: "Em andamento",
  finished: "Encerrada",
  paused: "Pausada",
};
