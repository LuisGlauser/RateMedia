# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [0.2.0] - 2026-11-12

### Adicionado
- Central de documentação em `/docs`, separada em Markdown, Diagramas, Word e PDF.
- 11 capítulos: visão geral, requisitos, casos de uso, histórias de usuário, arquitetura, modelo de dados, classes, sequência, integrações, DevOps e testes.
- 14 diagramas Mermaid (casos de uso, classes, DER, sequência, estados, arquitetura, implantação, navegação).
- Scripts para gerar diagramas, Word e PDF (`scripts/docs`).
- README completo, guia de contribuição, código de conduta, política de segurança e changelog.
- Modelos de issue e de pull request, Dependabot, `.editorconfig` e Wiki (`wiki/`).

### Alterado
- `Dockerfile` copia a pasta `public` para a imagem *standalone*.

## [0.1.0] - 2026-11-10

### Adicionado
- Autenticação por e-mail e senha com Supabase e proteção de rotas.
- Busca avançada com filtros, ordenação e paginação.
- Página da obra com status, progresso, nota, resenha e *spoilers*.
- Biblioteca pessoal, listas e perfil.
- Campanhas de RPG com criação, edição e avaliações.
- Painel administrativo: visão geral, catálogo, importação do AniList/Jikan/TMDB, moderação e papéis.
- CI no GitHub Actions, deploy na Vercel e imagem Docker com Compose.

[Não lançado]: https://github.com/LuisGlauser/RateMedia/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/LuisGlauser/RateMedia/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/LuisGlauser/RateMedia/releases/tag/v0.1.0
