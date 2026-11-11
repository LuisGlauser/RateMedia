# 2. Requisitos

## 2.1 Requisitos funcionais

| ID | Requisito | Prioridade | Ator |
| --- | --- | --- | --- |
| RF01 | Cadastrar conta com username, e-mail e senha (mín. 6 caracteres). | Alta | Visitante |
| RF02 | Autenticar com e-mail e senha e redirecionar para a rota de origem (`next`). | Alta | Visitante |
| RF03 | Encerrar sessão. | Alta | Usuário |
| RF04 | Buscar obras e campanhas por texto e tipo. | Alta | Todos |
| RF05 | Filtrar a busca por faixa de nota e gêneros. | Média | Todos |
| RF06 | Ordenar a busca (mais bem avaliados, populares, recentes, A–Z) e paginar (12 por página). | Média | Todos |
| RF07 | Exibir a página da obra com sinopse, metadados, média de notas e críticas da comunidade. | Alta | Todos |
| RF08 | Definir status da obra na biblioteca (Quero assistir/ler, Assistindo/Lendo, Concluído, Abandonado). | Alta | Usuário |
| RF09 | Registrar progresso (episódios/capítulos). | Média | Usuário |
| RF10 | Avaliar a obra com nota de 1 a 10. | Alta | Usuário |
| RF11 | Escrever resenha e marcar se contém spoilers. | Alta | Usuário |
| RF12 | Visualizar “Minha biblioteca” agrupada por status. | Alta | Usuário |
| RF13 | Criar, visualizar e excluir listas (públicas ou privadas). | Média | Usuário |
| RF14 | Adicionar/remover obras de listas a partir da página da obra; criar lista já com a obra. | Média | Usuário |
| RF15 | Editar perfil (bio, localização, avatar e banner). | Baixa | Usuário |
| RF16 | Listar campanhas de RPG com nota média e quantidade de avaliações. | Alta | Todos |
| RF17 | Criar campanha (título, sistema, sinopse, regras, status, capa). | Alta | Usuário |
| RF18 | Editar e excluir campanha (apenas autor ou admin). | Alta | Usuário/Admin |
| RF19 | Avaliar campanha (nota 0–5 e comentário), uma avaliação por usuário. | Alta | Usuário |
| RF20 | Painel admin com visão geral (métricas). | Média | Admin |
| RF21 | CRUD do catálogo de obras com status editorial. | Alta | Admin |
| RF22 | Importar obras do AniList/Jikan (anime/mangá) e TMDB (filme/série) sem duplicar. | Alta | Admin |
| RF23 | Moderar resenhas (limpar texto preservando a nota) e excluir avaliações de campanhas. | Alta | Admin |
| RF24 | Promover/rebaixar usuários entre `user` e `admin` (exceto a si mesmo). | Média | Admin |
| RF25 | Disponibilizar documentação do projeto em `/docs` (Markdown, diagramas, Word e PDF). | Média | Todos |

## 2.2 Requisitos não funcionais

| ID | Categoria | Requisito |
| --- | --- | --- |
| RNF01 | Segurança | Todas as tabelas com RLS habilitada; escrita apenas pelo dono do registro ou admin. |
| RNF02 | Segurança | Credenciais somente em variáveis de ambiente; `.env.local` fora do Git; nenhuma chave `service_role` no front-end. |
| RNF03 | Segurança | Ações administrativas revalidadas no servidor (`requireAdmin()`), além da RLS. |
| RNF04 | Segurança | Entradas sanitizadas: `trim`, limites de tamanho, URLs só `http(s)`, UUIDs validados, redirecionamentos apenas para destinos conhecidos. |
| RNF05 | Desempenho | Respostas das APIs externas cacheadas (Data Cache do Next: 1 h na busca, 24 h no detalhe). |
| RNF06 | Disponibilidade | *Fallback* AniList → Jikan; falha de um tipo de mídia não derruba a busca geral. |
| RNF07 | Resiliência | Timeout de 15 s e nova tentativa em HTTP 429 ou falha de rede nas APIs externas. |
| RNF08 | Usabilidade | Interface em português (pt-BR), tema escuro, responsiva (mobile-first). |
| RNF09 | Portabilidade | Executável localmente (`npm run dev`), em Docker e na Vercel. |
| RNF10 | Manutenibilidade | TypeScript estrito, ESLint, testes automatizados com Vitest e CI em todo PR. |
| RNF11 | Degradação | Sem Supabase configurado, as páginas exibem dados de demonstração em vez de falhar. |

## 2.3 Regras de negócio

| ID | Regra |
| --- | --- |
| RN01 | Cada usuário tem no máximo **uma** entrada por obra (`unique(user_id, media_id)`). |
| RN02 | A nota da obra é informada de 1 a 10 e armazenada de 0 a 5 (`rating = nota / 2`, `numeric(2,1)`). |
| RN03 | Cada usuário avalia uma campanha **uma única vez**; nova avaliação substitui a anterior (upsert). |
| RN04 | Somente o autor ou um administrador pode editar/excluir uma campanha. |
| RN05 | Uma obra externa é única por `(external_source, external_id)`; `external_id` inclui o tipo (`anime:20`) para evitar colisão. |
| RN06 | Importação não sobrescreve curadoria existente (`ignoreDuplicates`). |
| RN07 | Ao criar conta, um perfil é criado automaticamente (trigger `on_auth_user_created`); o username padrão é a parte local do e-mail. |
| RN08 | Usuários comuns não podem alterar o próprio `role` (política `profiles_update_own`). |
| RN09 | O administrador não pode remover o próprio acesso de admin. |
| RN10 | Listas privadas (e seus itens) só são visíveis ao dono. |
| RN11 | Moderação de resenha remove apenas o texto; a nota é preservada. |
| RN12 | Rótulos de status mudam conforme o tipo: mangá usa “Ler/Lendo/Lido”, demais “Assistir/Assistindo/Assistido”. |
| RN13 | Rotas `/minha-biblioteca`, `/listas`, `/campanhas/nova` e `/admin` exigem sessão; o visitante é redirecionado para `/login?next=…`. |
