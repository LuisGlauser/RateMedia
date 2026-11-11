import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

/** Pasta pública com os arquivos da documentação (md, diagramas, word, pdf). */
const DOCS_DIR = path.join(process.cwd(), "public", "docs");

export const DOCX_URL = "/docs/word/RateMedia-Documentacao.docx";
export const PDF_URL = "/docs/pdf/RateMedia-Documentacao.pdf";

export interface Chapter {
  slug: string;
  title: string;
  summary: string;
}

export const CHAPTERS: Chapter[] = [
  { slug: "01-visao-geral", title: "Visão geral", summary: "Propósito, objetivos, escopo, atores, stack e glossário." },
  { slug: "02-requisitos", title: "Requisitos", summary: "Requisitos funcionais, não funcionais e regras de negócio." },
  { slug: "03-casos-de-uso", title: "Casos de uso", summary: "Diagrama e especificação detalhada dos 17 casos de uso." },
  { slug: "04-historias-de-usuario", title: "Histórias de usuário", summary: "26 histórias em 7 épicos com critérios de aceitação." },
  { slug: "05-arquitetura", title: "Arquitetura", summary: "Camadas, pastas, navegação, ADRs e fluxo de sessão." },
  { slug: "06-modelo-de-dados", title: "Modelo de dados (DER)", summary: "DER, dicionário de dados, triggers, RLS e migrações." },
  { slug: "07-diagrama-de-classes", title: "Diagrama de classes", summary: "Domínio, integração externa e diagramas de estado." },
  { slug: "08-diagramas-de-sequencia", title: "Diagramas de sequência", summary: "Login, avaliação, listas, campanhas, importação e moderação." },
  { slug: "09-api-e-integracoes", title: "Server Actions e integrações", summary: "Actions, APIs AniList/Jikan/TMDB e variáveis de ambiente." },
  { slug: "10-devops", title: "DevOps", summary: "CI no GitHub Actions, deploy na Vercel, Docker e fluxo Git." },
  { slug: "11-testes", title: "Testes", summary: "Suítes automatizadas, casos de teste manuais e critérios." },
];

export type DiagramKind = "UML" | "Banco de dados" | "Arquitetura" | "Sequência" | "Estados";

export interface Diagram {
  slug: string;
  title: string;
  kind: DiagramKind;
  description: string;
}

export const DIAGRAMS: Diagram[] = [
  { slug: "casos-de-uso", title: "Casos de uso", kind: "UML", description: "Atores (visitante, usuário, admin, APIs) e os 17 casos de uso." },
  { slug: "classes", title: "Diagrama de classes", kind: "UML", description: "Entidades de domínio, enums e provedores externos." },
  { slug: "der", title: "DER — Entidade-Relacionamento", kind: "Banco de dados", description: "Tabelas do PostgreSQL/Supabase com chaves e cardinalidades." },
  { slug: "arquitetura", title: "Arquitetura", kind: "Arquitetura", description: "Navegador, Next.js na Vercel, Supabase e APIs externas." },
  { slug: "implantacao", title: "Implantação (CI/CD)", kind: "Arquitetura", description: "GitHub, GitHub Actions, Vercel, Supabase e Docker." },
  { slug: "navegacao", title: "Mapa de navegação", kind: "Arquitetura", description: "Rotas públicas, protegidas e administrativas." },
  { slug: "seq-cadastro-login", title: "Sequência — cadastro e login", kind: "Sequência", description: "signUp, trigger de perfil e signIn com redirecionamento." },
  { slug: "seq-avaliar-obra", title: "Sequência — avaliar obra", kind: "Sequência", description: "saveEntry com upsert e RLS." },
  { slug: "seq-adicionar-lista", title: "Sequência — adicionar à lista", kind: "Sequência", description: "AddToListButton e actions de listas." },
  { slug: "seq-campanha", title: "Sequência — campanhas de RPG", kind: "Sequência", description: "Criar, avaliar, editar e excluir campanha." },
  { slug: "seq-importar-obra", title: "Sequência — importar obra", kind: "Sequência", description: "Busca externa com fallback e importação no servidor." },
  { slug: "seq-moderacao", title: "Sequência — moderação e papéis", kind: "Sequência", description: "requireAdmin, moderação e troca de papel." },
  { slug: "estados-biblioteca", title: "Estados — biblioteca", kind: "Estados", description: "Ciclo de vida do status de uma obra." },
  { slug: "estados-campanha", title: "Estados — campanha", kind: "Estados", description: "Ciclo de vida do status de uma campanha." },
];

export const findChapter = (slug: string) => CHAPTERS.find((c) => c.slug === slug);

/** Lê o Markdown do capítulo e converte para HTML, ajustando links e imagens para as rotas do site. */
export async function renderChapter(slug: string): Promise<string | null> {
  if (!findChapter(slug)) return null;
  const source = await readFile(path.join(DOCS_DIR, "md", `${slug}.md`), "utf8");
  return marked.parse(rewriteLinks(source), { gfm: true, async: false }) as string;
}

/** Converte caminhos relativos dos .md em rotas do site. Exportada para testes. */
export function rewriteLinks(md: string): string {
  return md
    .replace(/\(\.\.\/(diagramas|word|pdf)\//g, "(/docs/$1/")
    .replace(/\((\d{2}-[a-z0-9-]+)\.md\)/g, "(/docs/md/$1)");
}
