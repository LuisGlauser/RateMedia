# Guia de contribuição

Obrigado por contribuir com o **RateMedia**! Este guia explica como preparar o ambiente, organizar o trabalho e enviar mudanças.

## Ambiente

1. Faça um fork (ou crie uma branch, se tiver acesso) e clone o repositório.
2. `npm install`
3. `cp .env.example .env.local` e preencha as variáveis (veja [Instalação](https://github.com/LuisGlauser/RateMedia/wiki/Instalação) na Wiki).
4. `npm run dev`

## Fluxo de trabalho

| Etapa | Regra |
| --- | --- |
| Branch | A partir da `main`, com prefixo: `feat/`, `fix/`, `docs/`, `refactor/`, `test/`, `build/`, `ci/` |
| Commits | [Conventional Commits](https://www.conventionalcommits.org/pt-br/) em português: `feat: adiciona filtro por ano` |
| Pull request | Preencha o template, vincule a issue (`Closes #12`) e aguarde o CI verde |
| Revisão | Pelo menos uma aprovação antes do merge |
| Merge | *Squash and merge* para PRs pequenos; *Create a merge commit* quando os commits precisam ser preservados (ex.: versões com tag) |

### Tipos de commit

| Tipo | Uso |
| --- | --- |
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `refactor` | Mudança de código sem alterar comportamento |
| `test` | Testes |
| `build` | Dependências, Docker, configuração de build |
| `ci` | GitHub Actions e pipelines |
| `chore` | Tarefas de manutenção |

## Antes de abrir o PR

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

- Regras de negócio novas precisam de teste unitário; Server Actions novas, de teste de integração em `tests/integration`; fluxos novos de tela, de teste E2E em `tests/e2e`. Veja a página [Testes](https://github.com/LuisGlauser/RateMedia/wiki/Testes) da Wiki.
- Mudanças no banco entram como nova migração em `supabase/migrations/NNN_descricao.sql` (idempotente) e atualizam o [modelo de dados](public/docs/md/06-modelo-de-dados.md).
- Mudanças de comportamento atualizam a documentação em `public/docs/md` e, se preciso, os diagramas em `public/docs/diagramas/src`.

## Documentação

- Diagramas: edite os `.mmd` e rode `scripts/docs/render-diagrams.mjs`.
- Word e PDF: rode `scripts/docs/build-docs.sh` (precisa de pandoc e Playwright).

## Padrões de código

- TypeScript estrito; evite `any`.
- Componentes de servidor por padrão; use `"use client"` só quando necessário.
- Toda escrita no banco passa por Server Action que valida a entrada e confere o usuário.
- Textos da interface em português (pt-BR).

## Reportando problemas

Use os [modelos de issue](https://github.com/LuisGlauser/RateMedia/issues/new/choose). Para falhas de segurança, siga a [política de segurança](SECURITY.md) e **não** abra issue pública.
