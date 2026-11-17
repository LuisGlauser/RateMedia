"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PosterItem } from "@/lib/demo-data";
import Poster from "./Poster";
import SectionHeading from "./SectionHeading";

/** Carrossel "Em Alta Esta Semana": rolagem com snap, setas e rolagem por toque/teclado. */
export default function TrendingCarousel({ items }: { items: PosterItem[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, items]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const arrow =
    "rounded bg-surface p-1.5 transition-colors hover:bg-surface-high disabled:cursor-default disabled:opacity-40 disabled:hover:bg-surface";

  return (
    <section className="space-y-4" aria-roledescription="carrossel">
      <SectionHeading eyebrow="Tendências de audiência" title="Em Alta Esta Semana">
        <div className="flex items-center gap-2 text-xs text-ink-dim">
          Atualizado a cada 15 min
          <span className="flex gap-1">
            <button type="button" aria-label="Anterior" disabled={edge.start} onClick={() => scroll(-1)} className={arrow}>
              <ChevronLeft aria-hidden className="size-3" />
            </button>
            <button type="button" aria-label="Próximo" disabled={edge.end} onClick={() => scroll(1)} className={arrow}>
              <ChevronRight aria-hidden className="size-3" />
            </button>
          </span>
        </div>
      </SectionHeading>

      <ul
        ref={ref}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((p) => (
          <li
            key={p.id ?? p.title}
            className="w-40 shrink-0 snap-start sm:w-44 lg:w-[calc((100%-6.25rem)/6)]"
          >
            <Poster item={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
