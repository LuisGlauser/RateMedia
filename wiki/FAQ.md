# FAQ

**O site abre sem Supabase?**
Sim. Sem as variáveis do Supabase, as páginas mostram dados de demonstração.

**Erro "has_spoilers não existe" ao salvar avaliação.**
Rode `supabase/migrations/003_fix_has_spoilers_e_colunas.sql` no SQL Editor.

**Filmes e séries não aparecem na importação.**
Configure `TMDB_API_READ_TOKEN` ou `TMDB_API_KEY`.

**A busca de animes falhou.**
O AniList pode estar fora do ar ou bloqueado na sua rede; o sistema tenta o Jikan automaticamente. Verifique firewall/VPN.

**Como viro admin?**
`update profiles set role = 'admin' where username = 'seu_usuario';`

**Onde está a documentação completa?**
Na rota `/docs` do site e em `public/docs` no repositório (Markdown, diagramas, Word e PDF).
