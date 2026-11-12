import { Download, FileText } from "lucide-react";
import { CHAPTERS, DOCX_URL } from "@/lib/docs";

export default function WordPage() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4">
        <div className="flex items-center gap-4 rounded-card bg-surface p-6">
          <FileText aria-hidden className="size-12 shrink-0 text-tertiary" />
          <div className="min-w-0 flex-1">
            <h2 className="font-bold">RateMedia-Documentacao.docx</h2>
            <p className="text-sm text-ink-muted">
              Documento editável (Microsoft Word / LibreOffice / Google Docs) com capa, sumário, tabelas e todos os diagramas.
            </p>
          </div>
        </div>
        <a href={DOCX_URL} download className="btn-primary">
          <Download aria-hidden className="size-4" /> Baixar Word
        </a>
        <p className="text-xs text-ink-dim">
          Dica: ao abrir no Word, clique com o botão direito no sumário e escolha “Atualizar campo” para gerar os números de página.
        </p>
      </section>
      <aside className="rounded-card bg-surface-low p-5">
        <h3 className="label mb-3 text-ink-dim">Capítulos do documento</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-muted">
          {CHAPTERS.map((c) => <li key={c.slug}>{c.title}</li>)}
        </ol>
      </aside>
    </div>
  );
}
