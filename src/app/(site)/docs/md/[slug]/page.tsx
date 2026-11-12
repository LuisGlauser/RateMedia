import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Download } from "lucide-react";
import { CHAPTERS, findChapter, renderChapter } from "@/lib/docs";

export const dynamicParams = false;

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${findChapter(slug)?.title ?? "Documentação"} · Docs RateMedia` };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const html = await renderChapter(slug);
  if (!html) notFound();

  const index = CHAPTERS.findIndex((c) => c.slug === slug);
  const prev = CHAPTERS[index - 1];
  const next = CHAPTERS[index + 1];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <nav aria-label="Capítulos" className="flex gap-1 overflow-x-auto lg:flex-col">
          {CHAPTERS.map((c, i) => (
            <Link
              key={c.slug}
              href={`/docs/md/${c.slug}`}
              aria-current={c.slug === slug ? "page" : undefined}
              className={`whitespace-nowrap rounded px-3 py-1.5 text-sm ${
                c.slug === slug ? "bg-surface-high font-semibold text-primary" : "text-ink-muted hover:bg-surface hover:text-ink"
              }`}
            >
              {i + 1}. {c.title}
            </Link>
          ))}
        </nav>
      </aside>

      <article className="min-w-0">
        <div className="mb-4 flex justify-end">
          <a href={`/docs/md/${slug}.md`} download className="btn-ghost !px-3 !py-1 !text-xs">
            <Download aria-hidden className="size-3" /> Baixar .md
          </a>
        </div>
        <div className="doc-prose" dangerouslySetInnerHTML={{ __html: html }} />
        <nav className="mt-10 flex justify-between gap-4 border-t border-line pt-6 text-sm">
          {prev ? (
            <Link href={`/docs/md/${prev.slug}`} className="text-ink-muted hover:text-primary">← {prev.title}</Link>
          ) : <span />}
          {next && (
            <Link href={`/docs/md/${next.slug}`} className="inline-flex items-center gap-1 text-ink-muted hover:text-primary">
              {next.title} <ChevronRight aria-hidden className="size-4" />
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
