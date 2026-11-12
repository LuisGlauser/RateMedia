import type { Metadata } from "next";
import DocsTabs from "@/components/docs/DocsTabs";

export const metadata: Metadata = {
  title: "Documentação · RateMedia",
  description: "Documentação completa do RateMedia: requisitos, casos de uso, histórias, diagramas UML, DER, Word e PDF.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 space-y-2">
        <p className="label text-secondary">Central de documentação</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Documentação do RateMedia</h1>
        <p className="max-w-2xl text-sm text-ink-muted">
          Tudo o que é preciso para entender, avaliar e manter o projeto, separado por formato.
        </p>
      </header>
      <DocsTabs />
      <div className="pt-8">{children}</div>
    </div>
  );
}
