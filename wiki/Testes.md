# Testes

O projeto tem quatro níveis de testes, todos executados na pipeline de CI.

| Tipo | Ferramenta | Onde | O que valida |
| --- | --- | --- | --- |
| Unitários | Vitest | `src/**/*.test.ts`, `tests/unit/` | Regras isoladas: busca, formatação, rótulos, médias, permissões, cliente HTTP das APIs, documentação |
| Integração | Vitest | `tests/integration/` | Server Actions ↔ Supabase (simulado) ↔ cache/redirect do Next, middleware, painel admin ↔ APIs externas |
| E2E | Playwright | `tests/e2e/` | Fluxos no navegador: home, busca, filtros, ordenação, paginação, login/cadastro, campanhas, 404 |
| Performance | Script Node | `tests/performance/` | Latência p50/p95/p99, vazão (req/s) e taxa de erros sob carga |

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm test` | Unitários + integração |
| `npm run test:unit` | Só unitários |
| `npm run test:integration` | Só integração |
| `npm run test:watch` | Vitest em modo observação |
| `npm run test:e2e` | E2E (Playwright) |
| `npm run test:e2e:ui` | E2E com interface do Playwright |
| `npm run test:perf` | Teste de carga (servidor precisa estar no ar) |

## Rodando os E2E

```bash
npx playwright install chromium   # só na primeira vez
npm run build                     # sem as variáveis do Supabase (modo demonstração)
npm run test:e2e                  # relatório em playwright-report/
```

Os E2E e a performance usam o **modo demonstração** (build sem `NEXT_PUBLIC_SUPABASE_*`): os dados são sempre os mesmos e nenhum banco real é alterado. Se o seu `.env.local` tiver as chaves do Supabase, renomeie-o temporariamente antes do build. Para testar um servidor publicado, use `E2E_BASE_URL=https://... npm run test:e2e`.

## Performance

Com o servidor de produção rodando (`npm run start`) em outro terminal:

```bash
npm run test:perf                       # perfil "load"
PERF_PROFILE=smoke npm run test:perf
PERF_PROFILE=stress npm run test:perf
```

| Perfil | Conexões | Duração | p95 máximo | Erros máximos | Vazão mínima |
| --- | --- | --- | --- | --- | --- |
| smoke | 1 | 10 s | 800 ms | 0% | — |
| load | 10 | 30 s | 1500 ms | 1% | 5 req/s |
| stress | 50 | 30 s | 4000 ms | 5% | — |

## Dublê do Supabase

Os testes de integração usam `tests/helpers/supabase.ts`, que registra as consultas enviadas ao banco. Só o banco e a rede são simulados; o resto do código roda de verdade.
