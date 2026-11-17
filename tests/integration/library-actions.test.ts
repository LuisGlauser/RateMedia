import { beforeEach, describe, expect, it, vi } from "vitest";
import { argsOf, createSupabaseMock, form, type SupabaseMock } from "../helpers/supabase";

// Integração: action saveEntry (página da obra) <-> regras de constants.ts <-> tabela library_entries.
const mocks = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
  createClient: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath, updateTag: mocks.updateTag }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

import { saveEntry } from "@/app/(site)/obras/actions";

const MEDIA_ID = "11111111-1111-4111-8111-111111111111";
let db: SupabaseMock;

beforeEach(() => {
  vi.clearAllMocks();
  db = createSupabaseMock({ user: { id: "user-1" } });
  mocks.createClient.mockResolvedValue(db.client);
});

/** Objeto enviado no upsert da biblioteca. */
const upserted = () => argsOf(db.queries("library_entries", "upsert")[0], "upsert")?.[0] as Record<string, unknown>;

describe("saveEntry", () => {
  it("exige login e devolve o usuário para a obra depois", async () => {
    db.setUser(null);
    await expect(saveEntry(MEDIA_ID, form({ status: "completed" }))).rejects.toThrow(`NEXT_REDIRECT:/login?next=/obras/${MEDIA_ID}`);
    expect(db.queries("library_entries")).toHaveLength(0);
  });

  it("grava status, progresso e nota com upsert por usuário+obra", async () => {
    await saveEntry(MEDIA_ID, form({ status: "in_progress", progress: "12", rating: "8" }));

    const [, options] = argsOf(db.queries("library_entries", "upsert")[0], "upsert") ?? [];
    expect(upserted()).toMatchObject({
      user_id: "user-1",
      media_id: MEDIA_ID,
      status: "in_progress",
      progress: 12,
      rating: 4, // interface 1–10 -> banco 0–5
    });
    expect(options).toEqual({ onConflict: "user_id,media_id" });
  });

  it("salva só os campos enviados (painel de status não apaga a crítica)", async () => {
    await saveEntry(MEDIA_ID, form({ status: "planned" }));
    expect(upserted()).not.toHaveProperty("review");
    expect(upserted()).not.toHaveProperty("rating");
    expect(upserted()).not.toHaveProperty("progress");
  });

  it("descarta status desconhecido, normaliza progresso e anula nota fora da faixa", async () => {
    await saveEntry(MEDIA_ID, form({ status: "hackeado", progress: "-5", rating: "11" }));

    expect(upserted()).not.toHaveProperty("status");
    expect(upserted()).toMatchObject({ progress: 0, rating: null });
  });

  it("arredonda progresso fracionário para baixo e trata texto como zero", async () => {
    await saveEntry(MEDIA_ID, form({ progress: "7.9" }));
    expect(upserted().progress).toBe(7);

    await saveEntry(MEDIA_ID, form({ progress: "abc" }));
    expect((argsOf(db.queries("library_entries", "upsert")[1], "upsert")?.[0] as Record<string, unknown>).progress).toBe(0);
  });

  it("salva crítica sem espaços extras e com a marcação de spoiler", async () => {
    await saveEntry(MEDIA_ID, form({ review: "  Obra-prima!  ", spoilers: "on" }));
    expect(upserted()).toMatchObject({ review: "Obra-prima!", has_spoilers: true });
  });

  it("crítica vazia vira null e spoiler desmarcado vira false", async () => {
    await saveEntry(MEDIA_ID, form({ review: "   " }));
    expect(upserted()).toMatchObject({ review: null, has_spoilers: false });
  });

  it("revalida a página da obra e a biblioteca após salvar", async () => {
    await saveEntry(MEDIA_ID, form({ status: "completed" }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/obras/${MEDIA_ID}`);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/minha-biblioteca");
  });

  it("invalida o cache de 15 min da Home (nota, ranking e feed mudam)", async () => {
    await saveEntry(MEDIA_ID, form({ rating: "8" }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.updateTag).toHaveBeenCalledWith("home");
  });

  it("converte as notas por aspecto (1–10) para 0–5 e anula valores fora da faixa", async () => {
    await saveEntry(MEDIA_ID, form({ aspect_art: "9", aspect_sound: "10", aspect_story: "0" }));
    expect(upserted()).toMatchObject({ rating_art: 4.5, rating_sound: 5, rating_story: null });

    await saveEntry(MEDIA_ID, form({ aspect_art: "11", aspect_sound: "abc" }));
    const second = argsOf(db.queries("library_entries", "upsert")[1], "upsert")?.[0] as Record<string, unknown>;
    expect(second).toMatchObject({ rating_art: null, rating_sound: null });
    expect(second).not.toHaveProperty("rating_story");
  });

  it("salva só os aspectos enviados (avaliar a nota geral não apaga os aspectos)", async () => {
    await saveEntry(MEDIA_ID, form({ rating: "8" }));
    expect(upserted()).not.toHaveProperty("rating_art");
    expect(upserted()).not.toHaveProperty("rating_sound");
    expect(upserted()).not.toHaveProperty("rating_story");
    expect(upserted()).not.toHaveProperty("is_favorite");
  });

  it("favoritar grava is_favorite; qualquer valor diferente de 1 desfavorita", async () => {
    await saveEntry(MEDIA_ID, form({ favorite: "1" }));
    expect(upserted()).toMatchObject({ is_favorite: true });

    await saveEntry(MEDIA_ID, form({ favorite: "0" }));
    expect((argsOf(db.queries("library_entries", "upsert")[1], "upsert")?.[0] as Record<string, unknown>).is_favorite).toBe(false);
  });

  it("propaga erro do banco e não revalida o cache", async () => {
    db.setResponder((q) => (q.table === "library_entries" ? { error: { message: "violates row-level security policy" } } : undefined));

    await expect(saveEntry(MEDIA_ID, form({ status: "completed" }))).rejects.toThrow("row-level security");
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });
});
