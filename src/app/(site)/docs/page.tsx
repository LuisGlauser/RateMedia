import Link from "next/link";
import { ChevronRight, FileCode2, FileText, FileType2, Network } from "lucide-react";
import { CHAPTERS, DIAGRAMS, DOCX_URL, PDF_URL } from "@/lib/docs";

const FORMATS = [
  { href: "/docs/md", icon: FileCode2, title: "Markdown", text: `${CHAPTERS.length} capítulos navegáveis, também versionados no repositório.`, tone: "text-primary" },
  { href: "/docs/diagramas", icon: Network, title: "Diagramas", text: `${DIAGRAMS.length} diagramas: casos de uso, classes, DER, sequência, estados e arquitetura.`, tone: "text-secondary" },
  { href: "/docs/word", icon: FileText, title: "Word (.docx)", text: "Documento completo e editável, com sumário e diagramas.", tone: "text-tertiary" },
  { href: "/docs/pdf", icon: FileType2, title: "PDF", text: "Versão para leitura e impressão, com visualização no navegador.", tone: "text-danger" },
];

export default function DocsHome() {
  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FORMATS.map(({ href, icon: Icon, title, text, tone }) => (
          <Link key={href} href={href} className="group rounded-card bg-surface p-5 transition-colors hover:bg-surface-high">
            <Icon aria-hidden className={`size-7 ${tone}`} />
            <h2 className="mt-3 font-bold">{title}</h2>
            <p className="mt-1 text-sm text-ink-muted">{text}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Abrir <ChevronRight aria-hidden className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Conteúdo</h2>
        <ol className="grid gap-2 md:grid-cols-2">
          {CHAPTERS.map((c, i) => (
            <li key={c.slug}>
              <Link href={`/docs/md/${c.slug}`} className="flex gap-3 rounded-lg bg-surface-low p-4 hover:bg-surface">
                <span className="text-sm font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block text-sm font-semibold">{c.title}</span>
                  <span className="block text-xs text-ink-dim">{c.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-wrap gap-3">
        <a href={DOCX_URL} download className="btn-primary">Baixar Word</a>
        <a href={PDF_URL} download className="btn-ghost">Baixar PDF</a>
      </section>
    </div>
  );
}
