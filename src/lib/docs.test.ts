import { describe, expect, it } from "vitest";
import { CHAPTERS, DIAGRAMS, renderChapter, rewriteLinks } from "./docs";
import { existsSync } from "node:fs";
import path from "node:path";

const pub = (...p: string[]) => path.join(process.cwd(), "public", "docs", ...p);

describe("documentação", () => {
  it("reescreve imagens e links relativos para rotas do site", () => {
    expect(rewriteLinks("![x](../diagramas/der.svg)")).toBe("![x](/docs/diagramas/der.svg)");
    expect(rewriteLinks("[a](02-requisitos.md)")).toBe("[a](/docs/md/02-requisitos)");
    expect(rewriteLinks("[w](../word/a.docx)")).toBe("[w](/docs/word/a.docx)");
  });

  it("todos os capítulos e diagramas existem em public/docs", () => {
    CHAPTERS.forEach((c) => expect(existsSync(pub("md", `${c.slug}.md`))).toBe(true));
    DIAGRAMS.forEach((d) => {
      expect(existsSync(pub("diagramas", `${d.slug}.svg`))).toBe(true);
      expect(existsSync(pub("diagramas", "src", `${d.slug}.mmd`))).toBe(true);
    });
    expect(existsSync(pub("word", "RateMedia-Documentacao.docx"))).toBe(true);
    expect(existsSync(pub("pdf", "RateMedia-Documentacao.pdf"))).toBe(true);
  });

  it("renderiza Markdown em HTML e ignora slugs desconhecidos", async () => {
    const html = await renderChapter("06-modelo-de-dados");
    expect(html).toContain("<table>");
    expect(html).toContain('src="/docs/diagramas/der.svg"');
    expect(await renderChapter("../../package")).toBeNull();
  });
});
