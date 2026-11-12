# 4. Histórias de Usuário

Formato: **Como** \<ator\>, **quero** \<ação\>, **para** \<benefício\>. Estimativas em *story points* (Fibonacci). Critérios de aceitação no formato *Dado / Quando / Então*.

## Épico E1 — Conta e acesso

### US01 — Criar conta
**Como** visitante, **quero** criar uma conta com username, e-mail e senha, **para** salvar meu histórico de mídias.
- **Pontos:** 3 · **Prioridade:** Alta · **UC:** UC01
- **Critérios de aceitação**
  - Dado que informei uma senha com menos de 6 caracteres, quando envio o formulário, então vejo a mensagem de erro e a conta não é criada.
  - Dado dados válidos, quando envio, então sou autenticado e redirecionado para a home.
  - Dado que me cadastrei, então um perfil com meu username é criado automaticamente.

### US02 — Entrar na conta
**Como** usuário, **quero** fazer login com e-mail e senha, **para** acessar minha biblioteca.
- **Pontos:** 2 · **Prioridade:** Alta · **UC:** UC02
- **Critérios**
  - Dado credenciais inválidas, então vejo “E-mail ou senha inválidos.”.
  - Dado que tentei abrir uma rota protegida, quando faço login, então volto para essa rota.

### US03 — Sair da conta
**Como** usuário, **quero** encerrar minha sessão, **para** proteger minha conta em computadores compartilhados.
- **Pontos:** 1 · **Prioridade:** Alta · **UC:** UC17

## Épico E2 — Descoberta

### US04 — Buscar obras
**Como** visitante, **quero** buscar obras por nome e tipo, **para** encontrar rapidamente o que procuro.
- **Pontos:** 5 · **Prioridade:** Alta · **UC:** UC03
- **Critérios**
  - Quando digito um termo, então vejo animes, mangás, séries, filmes e campanhas correspondentes.
  - Os resultados são paginados com 12 itens por página.

### US05 — Filtrar e ordenar
**Como** usuário, **quero** filtrar por nota e gênero e ordenar por popularidade, nota, recência ou A–Z, **para** descobrir obras relevantes.
- **Pontos:** 5 · **Prioridade:** Média · **UC:** UC03
- **Critérios**
  - Dado um filtro de nota mínima, então obras sem nota não aparecem.
  - Dado vários gêneros, então aparece qualquer obra com pelo menos um deles.

### US06 — Ver detalhes da obra
**Como** visitante, **quero** ver sinopse, metadados, média e críticas de uma obra, **para** decidir se vou assisti-la/lê-la.
- **Pontos:** 3 · **Prioridade:** Alta · **UC:** UC04
- **Critérios:** críticas com spoiler ficam ocultas até eu escolher revelá-las.

## Épico E3 — Biblioteca e avaliações

### US07 — Marcar status
**Como** usuário, **quero** marcar uma obra como “Quero assistir”, “Assistindo”, “Assistido” ou “Abandonado”, **para** organizar meu consumo.
- **Pontos:** 3 · **Prioridade:** Alta · **UC:** UC05
- **Critérios**
  - Para mangás os rótulos são “Quero ler / Lendo / Lido”.
  - Só existe uma entrada por obra por usuário.

### US08 — Registrar progresso
**Como** usuário, **quero** registrar o episódio/capítulo em que parei, **para** retomar de onde parei.
- **Pontos:** 2 · **Prioridade:** Média · **UC:** UC05
- **Critérios:** valores negativos ou inválidos viram 0.

### US09 — Dar nota
**Como** usuário, **quero** dar uma nota de 1 a 10, **para** registrar minha opinião e compor a média da comunidade.
- **Pontos:** 2 · **Prioridade:** Alta · **UC:** UC06
- **Critérios:** a média exibida na obra considera todas as notas registradas.

### US10 — Escrever resenha
**Como** usuário, **quero** escrever uma resenha e marcar se contém spoilers, **para** compartilhar minha análise sem estragar a experiência de outros.
- **Pontos:** 3 · **Prioridade:** Alta · **UC:** UC06

### US11 — Ver minha biblioteca
**Como** usuário, **quero** ver todas as obras da minha biblioteca agrupadas por status, **para** ter uma visão geral do meu consumo.
- **Pontos:** 3 · **Prioridade:** Alta · **UC:** UC05

## Épico E4 — Listas e perfil

### US12 — Criar listas
**Como** usuário, **quero** criar listas públicas ou privadas, **para** organizar coleções temáticas (“Top 10 isekai”).
- **Pontos:** 3 · **Prioridade:** Média · **UC:** UC07
- **Critérios:** listas privadas não aparecem para outros usuários.

### US13 — Adicionar obra à lista
**Como** usuário, **quero** adicionar uma obra a uma ou mais listas diretamente da página da obra, **para** não perder tempo navegando.
- **Pontos:** 5 · **Prioridade:** Média · **UC:** UC08
- **Critérios**
  - Vejo em quais listas a obra já está.
  - Posso criar uma nova lista que já contém a obra.
  - Adicionar a mesma obra duas vezes não gera erro nem duplicata.

### US14 — Personalizar perfil
**Como** usuário, **quero** editar bio, localização, avatar e banner, **para** expressar minha identidade na comunidade.
- **Pontos:** 2 · **Prioridade:** Baixa · **UC:** UC09

## Épico E5 — Campanhas de RPG

### US15 — Explorar campanhas
**Como** jogador, **quero** ver campanhas com sistema, status e nota, **para** encontrar uma mesa que combine comigo.
- **Pontos:** 3 · **Prioridade:** Alta · **UC:** UC10

### US16 — Publicar campanha
**Como** mestre, **quero** publicar minha campanha com sistema, sinopse, regras e status, **para** recrutar jogadores.
- **Pontos:** 5 · **Prioridade:** Alta · **UC:** UC11
- **Critérios:** título, sistema e sinopse são obrigatórios; a capa só aceita URL `http(s)`.

### US17 — Gerenciar minha campanha
**Como** mestre, **quero** editar ou excluir minha campanha, **para** mantê-la atualizada.
- **Pontos:** 3 · **Prioridade:** Alta · **UC:** UC11
- **Critérios:** outro usuário não consegue editar nem excluir a campanha.

### US18 — Avaliar campanha
**Como** jogador, **quero** avaliar uma campanha com nota e comentário, **para** ajudar outros jogadores.
- **Pontos:** 2 · **Prioridade:** Alta · **UC:** UC12
- **Critérios:** uma nova avaliação minha substitui a anterior.

## Épico E6 — Administração

### US19 — Painel de visão geral
**Como** administrador, **quero** ver métricas do sistema (obras indexadas, rascunhos em revisão, usuários, avaliações), **para** acompanhar a plataforma.
- **Pontos:** 3 · **Prioridade:** Média · **UC:** UC13

### US20 — Curar catálogo
**Como** administrador, **quero** criar, editar e excluir obras com status editorial, **para** manter o catálogo correto.
- **Pontos:** 5 · **Prioridade:** Alta · **UC:** UC13

### US21 — Importar de APIs externas
**Como** administrador, **quero** importar obras do AniList, Jikan e TMDB, **para** popular o catálogo sem digitação manual.
- **Pontos:** 8 · **Prioridade:** Alta · **UC:** UC14
- **Critérios**
  - Se o AniList estiver fora do ar, a busca usa o Jikan.
  - Importar a mesma obra novamente não sobrescreve minhas alterações.
  - Anime e mangá com o mesmo id externo não colidem.

### US22 — Moderar conteúdo
**Como** administrador, **quero** remover resenhas e avaliações abusivas, **para** manter a comunidade saudável.
- **Pontos:** 3 · **Prioridade:** Alta · **UC:** UC15
- **Critérios:** limpar uma resenha preserva a nota do usuário.

### US23 — Gerenciar papéis
**Como** administrador, **quero** promover ou rebaixar usuários, **para** distribuir a moderação.
- **Pontos:** 2 · **Prioridade:** Média · **UC:** UC16
- **Critérios:** não consigo remover meu próprio acesso de admin.

## Épico E7 — DevOps e documentação

### US24 — Pipeline de integração contínua
**Como** desenvolvedor, **quero** que lint, typecheck, testes e build rodem em cada PR, **para** evitar regressões.
- **Pontos:** 3 · **Prioridade:** Alta

### US25 — Deploy contínuo
**Como** equipe, **quero** que cada PR gere um preview e a `main` publique em produção na Vercel, **para** validar mudanças rapidamente.
- **Pontos:** 2 · **Prioridade:** Alta

### US26 — Documentação acessível
**Como** avaliador/novo integrante, **quero** acessar toda a documentação em `/docs` nos formatos Markdown, Word, PDF e diagramas, **para** entender o projeto sem precisar ler o código.
- **Pontos:** 5 · **Prioridade:** Média

## Resumo do backlog

| Épico | Histórias | Pontos |
| --- | --- | --- |
| E1 Conta e acesso | US01–US03 | 6 |
| E2 Descoberta | US04–US06 | 13 |
| E3 Biblioteca e avaliações | US07–US11 | 13 |
| E4 Listas e perfil | US12–US14 | 10 |
| E5 Campanhas de RPG | US15–US18 | 13 |
| E6 Administração | US19–US23 | 21 |
| E7 DevOps e documentação | US24–US26 | 10 |
| **Total** | **26** | **86** |
