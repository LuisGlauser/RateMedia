# Deploy e CI/CD

![Implantação](https://raw.githubusercontent.com/LuisGlauser/RateMedia/main/public/docs/diagramas/implantacao.png)

## GitHub Actions

`.github/workflows/ci.yml` roda em todo push e PR para a `main`: `npm ci` → lint → typecheck → testes → build → `npm audit`.

## Vercel

1. Importe o repositório em https://vercel.com/new (framework **Next.js**).
2. Em **Settings → Environment Variables**, cadastre `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e, se quiser, as variáveis do TMDB.
3. Cada PR gera um preview; o merge na `main` publica em produção.

## Versões e releases

- Versionamento semântico (`vMAJOR.MINOR.PATCH`).
- Atualize o [CHANGELOG](https://github.com/LuisGlauser/RateMedia/blob/main/CHANGELOG.md), crie a tag (`git tag -a v0.2.0 -m "v0.2.0"`) e publique a release no GitHub.

## Docker

Imagem multi-stage com Next.js `standalone`, usuário sem privilégios e *healthcheck*. Veja [DevOps](https://github.com/LuisGlauser/RateMedia/blob/main/public/docs/md/10-devops.md).
