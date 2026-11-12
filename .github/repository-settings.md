# Configurações recomendadas do repositório

Itens que só podem ser ajustados por quem administra o repositório no GitHub.

## About (engrenagem ao lado de "About")

- **Description:** Plataforma para acompanhar, avaliar e resenhar animes, mangás, séries e filmes, com campanhas de RPG da comunidade. Next.js + Supabase.
- **Website:** URL de produção da Vercel
- **Topics:** `nextjs` `react` `typescript` `tailwindcss` `supabase` `postgresql` `vercel` `docker` `github-actions` `devops` `anime` `manga` `movies` `tv-series` `rpg` `letterboxd` `fatec` `server-actions`
- Marcar: **Releases**, **Deployments**; desmarcar **Packages** se não usar.

## Features (Settings → General)

- ✅ Wikis → depois rode `scripts/publish-wiki.sh`
- ✅ Issues (usa os templates de `.github/ISSUE_TEMPLATE`)
- ✅ Discussions (opcional)
- ✅ Projects (quadro Kanban: Backlog → Em andamento → Revisão → Concluído)

## Pull Requests

- Permitir apenas **Squash merging**, com título do PR como mensagem.
- ✅ Automatically delete head branches.

## Branch protection (Settings → Branches → `main`)

- ✅ Require a pull request before merging (1 aprovação)
- ✅ Require status checks: `build-and-test`
- ✅ Require branches to be up to date
- ✅ Block force pushes

## Security (Settings → Code security)

- ✅ Dependabot alerts e security updates
- ✅ Secret scanning e push protection
- ✅ Private vulnerability reporting

## Labels

Crie as labels de `.github/labels.yml`.

## Releases

Para cada tag (`v0.1.0`, `v0.2.0`…), crie uma release copiando a seção correspondente do `CHANGELOG.md`.
