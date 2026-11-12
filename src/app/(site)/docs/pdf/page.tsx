import { Download, ExternalLink } from "lucide-react";
import { PDF_URL } from "@/lib/docs";

export default function PdfPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <a href={PDF_URL} download className="btn-primary">
          <Download aria-hidden className="size-4" /> Baixar PDF
        </a>
        <a href={PDF_URL} target="_blank" rel="noreferrer" className="btn-ghost">
          <ExternalLink aria-hidden className="size-4" /> Abrir em nova aba
        </a>
      </div>
      <object data={PDF_URL} type="application/pdf" className="h-[80vh] w-full rounded-card bg-surface">
        <p className="p-6 text-sm text-ink-muted">
          Seu navegador não exibe PDFs embutidos. <a href={PDF_URL} className="text-primary underline">Abra o arquivo</a>.
        </p>
      </object>
    </div>
  );
}
