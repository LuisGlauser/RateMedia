import Link from "next/link";
import { FileCode2 } from "lucide-react";
import { CHAPTERS } from "@/lib/docs";

export default function MarkdownIndex() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">
        Os arquivos-fonte ficam em <code className="text-secondary">public/docs/md</code> e podem ser lidos no GitHub ou baixados.
      </p>
      <ul className="divide-y divide-line rounded-card bg-surface">
        {CHAPTERS.map((c) => (
          <li key={c.slug} className="flex flex-wrap items-center gap-3 p-4">
            <FileCode2 aria-hidden className="size-5 text-primary" />
            <Link href={`/docs/md/${c.slug}`} className="min-w-0 flex-1">
              <span className="block font-semibold hover:text-primary">{c.title}</span>
              <span className="block text-xs text-ink-dim">{c.summary}</span>
            </Link>
            <a href={`/docs/md/${c.slug}.md`} download className="btn-ghost !px-3 !py-1 !text-xs">
              .md
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
