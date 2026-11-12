# Instalação

## Pré-requisitos

- Node.js 22+ e npm
- Git
- Conta no Supabase (opcional: sem ela o site mostra dados de demonstração)
- Docker Desktop (opcional)

## Rodando localmente

```bash
git clone https://github.com/LuisGlauser/RateMedia.git
cd RateMedia
npm install
cp .env.example .env.local
npm run dev
```

Acesse http://localhost:3000.

## Configurando o Supabase

1. Crie um projeto em https://supabase.com.
2. Em **Project Settings → API**, copie a URL e a chave `anon` para o `.env.local`.
3. No **SQL Editor**, execute em ordem:
   1. `supabase/schema.sql`
   2. `supabase/migrations/002_telas_busca_perfil_admin.sql`
   3. `supabase/migrations/003_fix_has_spoilers_e_colunas.sql`
4. Crie uma conta no site e torne-a admin:
   ```sql
   update profiles set role = 'admin' where username = 'seu_usuario';
   ```

## TMDB (filmes e séries)

Crie uma conta em https://www.themoviedb.org/settings/api e preencha `TMDB_API_READ_TOKEN` (ou `TMDB_API_KEY`). AniList e Jikan não precisam de chave.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Para dados reais | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Para dados reais | Chave pública *anon* |
| `TMDB_API_READ_TOKEN` | Não | Token de leitura do TMDB (prioritário) |
| `TMDB_API_KEY` | Não | Chave v3 do TMDB (alternativa) |

> Nunca coloque a chave `service_role` em nenhum arquivo do projeto.

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos |
| `npm test` | Testes unitários e de integração (veja [[Testes]]) |

## Docker

```bash
docker compose --env-file .env.local up --build
```

Sem credenciais: `docker compose up --build`.
