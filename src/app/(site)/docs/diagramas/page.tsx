import { Download, ExternalLink, FileCode2 } from "lucide-react";
import { DIAGRAMS, type DiagramKind } from "@/lib/docs";

const KINDS: DiagramKind[] = ["UML", "Banco de dados", "Arquitetura", "Sequência", "Estados"];

export default function DiagramsPage() {
  return (
    <div className="space-y-10">
      <p className="text-sm text-ink-muted">
        Diagramas escritos em Mermaid (fontes em <code className="text-secondary">public/docs/diagramas/src</code>) e exportados em SVG e PNG.
      </p>
      <nav aria-label="Categorias" className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <a key={k} href={`#${slugify(k)}`} className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink-muted hover:text-ink">
            {k}
          </a>
        ))}
      </nav>
      {KINDS.map((kind) => (
        <section key={kind} id={slugify(kind)} className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-bold">{kind}</h2>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
            {DIAGRAMS.filter((d) => d.kind === kind).map((d) => (
              <figure key={d.slug} id={d.slug} className="scroll-mt-24 overflow-hidden rounded-card bg-surface">
                <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <figcaption>
                    <span className="block font-semibold">{d.title}</span>
                    <span className="block text-xs text-ink-dim">{d.description}</span>
                  </figcaption>
                  <div className="flex flex-wrap gap-2">
                    <a href={`/docs/diagramas/${d.slug}.svg`} target="_blank" rel="noreferrer" className="btn-ghost !px-3 !py-1 !text-xs">
                      <ExternalLink aria-hidden className="size-3" /> Ampliar
                    </a>
                    <a href={`/docs/diagramas/${d.slug}.png`} download className="btn-ghost !px-3 !py-1 !text-xs">
                      <Download aria-hidden className="size-3" /> PNG
                    </a>
                    <a href={`/docs/diagramas/src/${d.slug}.mmd`} download className="btn-ghost !px-3 !py-1 !text-xs">
                      <FileCode2 aria-hidden className="size-3" /> Mermaid
                    </a>
                  </div>
                </div>
                <div className="overflow-x-auto bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático da documentação */}
                  <img src={`/docs/diagramas/${d.slug}.svg`} alt={d.title} loading="lazy" className="mx-auto h-auto max-w-full" />
                </div>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
}
