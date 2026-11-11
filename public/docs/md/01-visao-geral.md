# 1. Visão Geral do Projeto

| Item | Descrição |
| --- | --- |
| **Projeto** | RateMedia |
| **Versão** | 0.1.0 |
| **Disciplina** | DevOps — Fatec |
| **Tipo** | Aplicação web (SaaS social) |
| **Repositório** | `LuisGlauser/RateMedia` |
| **Documentação** | Arthur Gaspare Camzano |

## 1.1 Propósito

O **RateMedia** é uma aplicação web no estilo *Letterboxd* para **rastrear, avaliar e resenhar animes, mangás, séries e filmes** em um único lugar. O diferencial é o módulo de **campanhas de RPG de mesa**, que são criadas, divulgadas e avaliadas pela própria comunidade.

## 1.2 Problema

Fãs de cultura pop usam várias plataformas diferentes (MyAnimeList para animes, Letterboxd para filmes, planilhas para séries) e não há um espaço que reúna também as campanhas de RPG. Isso fragmenta o histórico do usuário e dificulta a descoberta de conteúdo.

## 1.3 Objetivos

1. Centralizar o acompanhamento (status e progresso) de quatro tipos de mídia.
2. Permitir notas (1–10 na interface, 0–5 no banco) e resenhas com marcação de *spoiler*.
3. Oferecer listas personalizadas, públicas ou privadas.
4. Criar uma vitrine comunitária de campanhas de RPG com avaliações.
5. Dar aos administradores ferramentas de curadoria (CRUD, importação de APIs externas), moderação e gestão de papéis.
6. Aplicar práticas de DevOps: CI no GitHub Actions, deploy contínuo na Vercel, imagem Docker e segurança por RLS.

## 1.4 Escopo

**Dentro do escopo:** cadastro/login por e-mail e senha; busca avançada com filtros, ordenação e paginação; página de obra; biblioteca pessoal; listas; perfil público; campanhas de RPG; painel administrativo; importação de metadados do AniList, Jikan e TMDB; documentação (esta).

**Fora do escopo (nesta versão):** login social, notificações em tempo real, chat, aplicativo móvel nativo, recomendações por IA, upload de imagens (as capas são URLs).

## 1.5 Público-alvo e atores

| Ator | Descrição |
| --- | --- |
| **Visitante** | Navega sem conta: vê a home, busca, obras e campanhas. |
| **Usuário autenticado** | Gerencia biblioteca, notas, resenhas, listas, perfil e campanhas próprias. |
| **Administrador** | Usuário com `role = 'admin'`: cura o catálogo, modera conteúdo e gerencia papéis. |
| **APIs externas** | AniList, Jikan (MyAnimeList) e TMDB fornecem metadados das obras. |

## 1.6 Stack tecnológica

| Camada | Tecnologia |
| --- | --- |
| Front-end | React 19, Next.js 15 (App Router, Server Components, Server Actions), Tailwind CSS 3, lucide-react |
| Back-end | Server Actions do Next.js + Supabase (PostgREST) |
| Banco de dados | PostgreSQL (Supabase) com Row Level Security |
| Autenticação | Supabase Auth (e-mail/senha) via `@supabase/ssr` com cookies |
| Integrações | AniList GraphQL, Jikan REST v4, TMDB REST v3 |
| Testes | Vitest |
| Qualidade | ESLint, TypeScript (`tsc --noEmit`) |
| CI/CD | GitHub Actions + Vercel |
| Contêiner | Docker (multi-stage, Next standalone) + Docker Compose |

## 1.7 Glossário

| Termo | Significado |
| --- | --- |
| **Obra / Media** | Item do catálogo: anime, mangá, série ou filme. |
| **Entrada de biblioteca** | Registro do usuário para uma obra (status, progresso, nota, resenha). |
| **Lista** | Coleção ordenada de obras criada pelo usuário. |
| **Campanha** | Mesa de RPG divulgada por um mestre, com sistema, sinopse e regras. |
| **RLS** | *Row Level Security*: políticas do PostgreSQL que limitam quais linhas cada usuário lê/escreve. |
| **Server Action** | Função assíncrona executada no servidor, chamada diretamente por formulários. |
| **Status editorial** | Estado de publicação da obra: publicado, rascunho ou em revisão. |
| **Unidades** | Total de episódios (anime/série), capítulos (mangá) ou 1 (filme). |
