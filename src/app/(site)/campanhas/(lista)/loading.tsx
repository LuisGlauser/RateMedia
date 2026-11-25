// Mostrado na hora em que o usuário clica num link, enquanto o servidor monta a
// página. Sem este arquivo, o Next mantém a página anterior na tela até a nova
// ficar pronta, e a navegação parece travada. Também permite pré-carregar os
// links visíveis (prefetch) das páginas dinâmicas.
//
// Fica só em páginas sem notFound(): com um loading acima, o Next começa a
// enviar a resposta antes do notFound() e a página inexistente responde 200.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-[1280px] px-6 py-8">
      <span className="sr-only">Carregando…</span>
      <div className="animate-pulse space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-40 rounded bg-surface-high" />
          <div className="h-9 w-2/3 max-w-xl rounded bg-surface-high" />
          <div className="h-4 w-1/2 max-w-md rounded bg-surface" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[2/3] rounded-card bg-surface" />
              <div className="h-3 w-3/4 rounded bg-surface-high" />
              <div className="h-3 w-1/2 rounded bg-surface" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
