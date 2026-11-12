# 9. Server Actions e Integrações

## 9.1 Server Actions

| Módulo | Action | Entrada | Autorização | Efeito |
| --- | --- | --- | --- | --- |
| `(auth)/actions.ts` | `signUp` | username, email, password | — | Cria usuário e sessão. |
| | `signIn` | email, password, next | — | Cria sessão; redireciona para `next` interno. |
| | `signOut` | — | sessão | Encerra sessão. |
| `obras/actions.ts` | `saveEntry(mediaId)` | status?, progress?, rating? (1–10), review?, spoilers? | sessão + RLS | Upsert em `library_entries`. |
| `listas/actions.ts` | `createList` | title, description, is_public | sessão | Insert em `lists`. |
| | `deleteList` | id | dono | Delete em `lists`. |
| | `removeListItem` | list_id, media_id | dono (RLS) | Delete em `list_items`. |
| | `updateProfile` | bio, location, avatar_url, banner_url | próprio | Update em `profiles`. |
| `lib/actions/lists.ts` | `getMyListsForMedia` | mediaId (UUID) | sessão | Listas + flag `hasMedia`. |
| | `setMediaInList` | listId, mediaId, add | dono | Insert/Delete em `list_items`. |
| | `createListWithMedia` | title, isPublic, mediaId | sessão | Cria lista e adiciona obra. |
| `campanhas/actions.ts` | `createCampaign` | campos da campanha | sessão | Insert em `campaigns`. |
| | `submitCampaignReview(id)` | rating 0–5, comment | sessão | Upsert em `campaign_reviews`. |
| | `updateCampaign` / `deleteCampaign` | id + campos | autor ou admin | Update/Delete em `campaigns`. |
| `admin/actions.ts` | `createMedia` / `updateMedia` / `deleteMedia` | campos da obra | admin | CRUD em `media`. |
| | `importExternalMedia` | type, source, external_id | admin | Busca na API e upsert em `media`. |
| | `clearLibraryReview` | id | admin | `review = null`. |
| | `deleteCampaignReview` | id | admin | Delete em `campaign_reviews`. |
| | `setUserRole` | id, role | admin (não a si mesmo) | Update em `profiles.role`. |

Todas as actions que alteram dados chamam `revalidatePath` para atualizar as páginas afetadas.

## 9.2 Respostas tipadas (listas)

```ts
type MutationResult =
  | { status: "ok" }
  | { status: "login" }
  | { status: "error"; message: string };
```

## 9.3 APIs externas

| API | Tipos | Endpoint | Autenticação | Cache |
| --- | --- | --- | --- | --- |
| AniList | anime, mangá | `POST https://graphql.anilist.co` | Nenhuma | 1 h |
| Jikan v4 | anime, mangá (*fallback*) | `GET https://api.jikan.moe/v4/{anime|manga}` | Nenhuma (3 req/s, 60 req/min) | 1 h / 24 h detalhe |
| TMDB v3 | filme, série | `https://api.themoviedb.org/3` | `TMDB_API_READ_TOKEN` (Bearer) ou `TMDB_API_KEY` | 1 h |

**Normalização:** todas as respostas viram `ExternalMedia` (título, subtítulo — estúdio/autor/emissora —, sinopse sem HTML, capa, ano, unidades e gêneros traduzidos para pt-BR, sem duplicatas).

**Resiliência (`fetchJson`)**
- Timeout de 15 s via `AbortSignal.timeout`.
- Uma nova tentativa após HTTP 429 (respeitando `Retry-After`, até 5 s) ou falha de rede (espera de 1,1 s).
- Erros viram `ExternalApiError`, que aciona o *fallback* AniList → Jikan.
- `searchAllExternal` usa `Promise.allSettled`: um tipo com falha é reportado em `failed` sem derrubar os demais.

## 9.4 Variáveis de ambiente

| Variável | Onde | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | cliente + servidor | Sim (para dados reais) | URL do projeto Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente + servidor | Sim (para dados reais) | Chave pública *anon*. |
| `TMDB_API_READ_TOKEN` | servidor | Não | Token v4 do TMDB (prioritário). |
| `TMDB_API_KEY` | servidor | Não | Chave v3 do TMDB (alternativa). |
