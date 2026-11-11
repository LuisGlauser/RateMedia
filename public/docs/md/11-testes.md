# 11. Estratégia de Testes

## 11.1 Pirâmide

| Nível | Ferramenta | Situação |
| --- | --- | --- |
| Unitário | Vitest | Implementado (`src/lib/**/*.test.ts`). |
| Integração (APIs externas com `fetch` simulado) | Vitest + `vi.fn` | Implementado (`external.test.ts`). |
| Banco/RLS | SQL no Supabase | Manual (roteiro abaixo). |
| End-to-end | Playwright | Planejado. |

## 11.2 Suítes existentes

| Arquivo | O que verifica |
| --- | --- |
| `campaign-permissions.test.ts` | `canManageCampaign`: autor e admin podem; outros usuários e visitantes não. |
| `constants.test.ts` | `statusLabel`: “Ler” para mangás, “Assistir” para os demais. |
| `format.test.ts` | `timeAgo` em português. |
| `search.test.ts` | Filtro por nota/gênero, ordenações, paginação segura, query string e janela de páginas. |
| `external/external.test.ts` | Normalização Jikan/AniList/TMDB, tradução de gêneros, retry em 429/falha de rede, 404 → `null`, credenciais TMDB, roteamento por tipo, *fallback* AniList → Jikan, `searchAllExternal` com falhas parciais e `storageId`. |

Executar: `npm test`.

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
