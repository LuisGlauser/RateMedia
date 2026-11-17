import { describe, expect, it } from "vitest";
import { aspectWord, formatScore, itemsLabel, mediaReviewBadge, timeAgo, timeAgoLabel } from "./format";
import { isUuid } from "./validators";

describe("timeAgo", () => {
  const now = new Date("2026-11-05T12:00:00Z").getTime();
  it("formata em português", () => {
    expect(timeAgo("2026-11-02T12:00:00Z", now)).toBe("há 3 dias");
    expect(timeAgo("2026-11-05T10:00:00Z", now)).toBe("há 2 horas");
    expect(timeAgo("2026-11-05T11:59:50Z", now)).toBe("agora há pouco");
  });
});

describe("timeAgoLabel", () => {
  const now = new Date("2026-11-10T12:00:00Z").getTime();
  const ago = (ms: number) => new Date(now - ms).toISOString();

  it("capitaliza a primeira letra, como no feed da Home", () => {
    expect(timeAgoLabel(ago(14 * 60_000), now)).toBe("Há 14 minutos");
    expect(timeAgoLabel(ago(2 * 3_600_000), now)).toBe("Há 2 horas");
    expect(timeAgoLabel(ago(30_000), now)).toBe("Agora há pouco");
  });
});

describe("aspectWord", () => {
  it("classifica a % positiva", () => {
    expect(aspectWord(99)).toBe("Aclamação");
    expect(aspectWord(80)).toBe("Positivo");
    expect(aspectWord(50)).toBe("Misto");
    expect(aspectWord(10)).toBe("Negativo");
  });
});

describe("itemsLabel", () => {
  it("concorda singular/plural por tipo", () => {
    expect(itemsLabel("anime", 40)).toBe("40 animes");
    expect(itemsLabel("movie", 1)).toBe("1 filme");
    expect(itemsLabel("mixed", 24)).toBe("24 títulos");
    expect(itemsLabel("desconhecido", 2)).toBe("2 títulos");
  });
});

describe("mediaReviewBadge", () => {
  it("varia o selo conforme status e tipo", () => {
    expect(mediaReviewBadge("completed", "anime")?.label).toBe("Assistiu tudo");
    expect(mediaReviewBadge("completed", "movie")?.label).toBe("Assistiu");
    expect(mediaReviewBadge("completed", "manga")?.label).toBe("Leu tudo");
    expect(mediaReviewBadge("in_progress", "manga")?.label).toBe("Lendo");
    expect(mediaReviewBadge("dropped", "series")?.label).toBe("Abandonou");
    expect(mediaReviewBadge("planned", "anime")).toBeNull();
    expect(mediaReviewBadge(null, "anime")).toBeNull();
  });
});

describe("formatScore", () => {
  it("usa Nat 20 só para nota máxima de campanha", () => {
    expect(formatScore("campaign", 5)).toBe("Nat 20 / 5.0");
    expect(formatScore("campaign", 4.5)).toBe("4.5 / 5.0");
    expect(formatScore("media", 5)).toBe("5.0");
  });
});

describe("isUuid", () => {
  it("valida UUIDs", () => {
    expect(isUuid("10000000-0000-4000-8000-000000000001")).toBe(true);
    expect(isUuid("abc")).toBe(false);
    expect(isUuid(undefined)).toBe(false);
  });
});
