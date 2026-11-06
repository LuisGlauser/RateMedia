# RateMedia

Aplicação web no estilo Letterboxd para rastrear, avaliar e resenhar **animes, mangás, séries e filmes**, com um diferencial: **campanhas de RPG** criadas e avaliadas pela comunidade.

Projeto final da disciplina de DevOps (Fatec). Sem Docker nesta fase: foco em desenvolvimento local simples e deploy direto na Vercel.

## Stack

- Next.js 15 (App Router, Server Actions) + React 19
- Tailwind CSS
- Supabase (PostgreSQL + Auth e-mail/senha + RLS)
- APIs externas: Jikan (animes/mangás) e TMDB (filmes/séries)
- CI: GitHub Actions · Deploy: Vercel

## Estrutura

```
src/
  app/
    (auth)/          login, cadastro e Server Actions de autenticação
    obras/[id]/      detalhe da obra: status, progresso, nota e críticas
    busca/           busca global com filtros (tipo, status, nota)
    campanhas/       listagem, criação e detalhe com avaliações
    minha-biblioteca/ obras do usuário por status
    listas/          listas personalizadas
    admin/           CRUD de obras e moderação (somente admin)
  components/        Navbar, SearchBar, MediaCard, CampaignCard, AuthForm...
  lib/
    supabase/        clients browser/server
    external/        integrações Jikan e TMDB
  middleware.ts      renova sessão e protege rotas privadas
supabase/schema.sql  tabelas, enums, triggers e políticas RLS
```

## Rodando localmente

1. `npm install`
2. Crie um projeto no [Supabase](https://supabase.com) e execute `supabase/schema.sql` no SQL Editor.
3. `cp .env.example .env.local` e preencha as variáveis (URL e anon key do Supabase; chave TMDB opcional).
4. `npm run dev` e acesse http://localhost:3000.

### Tornar um usuário administrador

Crie uma conta e, no SQL Editor:

```sql
update profiles set role = 'admin' where username = 'seu_usuario';
```

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Testes (Vitest) |

## CI/CD

- `.github/workflows/ci.yml`: instala dependências, lint, typecheck, testes e build a cada push/PR.
- Deploy: importe o repositório na Vercel e defina as variáveis de ambiente. Cada PR gera um preview; `main` publica em produção.

## Segurança

- Credenciais apenas em variáveis de ambiente (`.env.local` fora do Git; use `.env.example` como modelo).
- Permissões garantidas por RLS no Supabase; ações de admin revalidadas no servidor.

## Próximos passos

- Importação de obras via Jikan/TMDB no painel admin
- Itens de lista (adicionar obras às listas)
- Testes E2E e monitoramento
- Terminar o visual das telas Busca, Perfil/Listas e Painel Admin conforme o Figma
- Trocar os ícones por SVGs exportados do Figma e usar as capas reais
