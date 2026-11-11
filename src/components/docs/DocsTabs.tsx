"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileCode2, FileText, FileType2, Network } from "lucide-react";

const TABS = [
  { href: "/docs", label: "Visão geral", icon: BookOpen, exact: true },
  { href: "/docs/md", label: "Markdown", icon: FileCode2 },
  { href: "/docs/diagramas", label: "Diagramas", icon: Network },
  { href: "/docs/word", label: "Word", icon: FileText },
  { href: "/docs/pdf", label: "PDF", icon: FileType2 },
];

export default function DocsTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Formatos da documentação" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex min-w-max gap-1 border-b border-line">
        {TABS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
