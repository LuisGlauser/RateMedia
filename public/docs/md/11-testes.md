# 11. Estratégia de Testes

## 11.1 Pirâmide

| Nível | Ferramenta | Local | Situação |
| --- | --- | --- | --- |
| Unitário | Vitest (projeto `unit`) | `src/**/*.test.ts`, `tests/unit/` | Implementado |
| Integração | Vitest (projeto `integration`) | `tests/integration/` | Implementado |
| End-to-end | Playwright | `tests/e2e/` | Implementado |
| Performance | Script Node | `tests/performance/load-test.mjs` | Implementado |
| Banco/RLS | SQL no Supabase | — | Manual (roteiro abaixo) |

## 11.2 Suítes

| Suíte | O que verifica |
| --- | --- |
| Unitários | Filtros, ordenação e paginação da busca; `timeAgo`; rótulos por tipo; médias; `canManageCampaign`; cliente HTTP (timeout, retry, 429); normalização AniList/Jikan/TMDB e *fallback*; links e arquivos da documentação. |
| Integração | Server Actions de autenticação, biblioteca, listas, campanhas e admin com um dublê do Supabase (`tests/helpers/supabase.ts`); middleware de sessão; `data.ts`; pipeline catálogo → busca. |
| E2E | Home, busca pela barra do topo, filtros, ordenação, paginação, login/cadastro, campanhas e página 404 no navegador. |
| Performance | Latência p50/p95/p99, vazão e taxa de erros nos perfis *smoke* (1 conexão), *load* (10) e *stress* (50), com limites que reprovam a CI. |

Comandos: `npm test` (unitários + integração), `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`, `npm run test:perf`.

## 11.3 Casos de teste manuais (aceitação)

| ID | Cenário | Passos | Resultado esperado |
| --- | --- | --- | --- |
| CT01 | Cadastro com senha curta | Cadastrar com senha “123” | Mensagem de erro; nenhuma conta criada. |
| CT02 | Rota protegida | Acessar `/minha-biblioteca` deslogado | Redireciona para `/login?next=/minha-biblioteca`. |
| CT03 | Login com retorno | Fazer login a partir do CT02 | Volta para `/minha-biblioteca`. |
| CT04 | Avaliar obra | Dar nota 8 em uma obra | `rating = 4.0`; média atualizada. |
| CT05 | Spoiler | Resenha com “contém spoilers” | Texto oculto para outros usuários até clicar. |
| CT06 | Lista privada | Criar lista privada e acessar com outra conta | Lista não visível. |
| CT07 | Obra duplicada na lista | Adicionar a mesma obra duas vezes | Sem erro, sem duplicata. |
| CT08 | Campanha de terceiro | Tentar editar campanha de outro usuário | Operação ignorada/bloqueada. |
| CT09 | Avaliar campanha 2× | Avaliar, depois avaliar de novo | Mantém só a última avaliação. |
| CT10 | Painel admin sem permissão | Usuário comum abre `/admin` | Acesso negado. |
| CT11 | Importação repetida | Importar a mesma obra duas vezes | Uma única obra; edições preservadas. |
| CT12 | AniList fora do ar | Bloquear `graphql.anilist.co` e buscar anime | Resultados vindos do Jikan. |
| CT13 | Moderação | Limpar resenha | Texto removido, nota mantida. |
| CT14 | Auto-rebaixamento | Admin tenta tirar o próprio papel | Nada muda. |
| CT15 | Documentação | Acessar `/docs` e baixar Word/PDF | Arquivos abrem corretamente. |

## 11.4 Critérios de qualidade

- CI verde (lint, typecheck, testes e build) obrigatório para *merge*.
- Toda regra de negócio nova em `lib/` deve vir acompanhada de teste unitário.
