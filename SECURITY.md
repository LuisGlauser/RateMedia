# Política de segurança

## Versões suportadas

| Versão | Suporte |
| --- | --- |
| 0.2.x | ✅ |
| < 0.2 | ❌ |

## Como reportar uma vulnerabilidade

**Não abra issue pública.** Use o recurso [*Report a vulnerability*](https://github.com/LuisGlauser/RateMedia/security/advisories/new) do GitHub ou entre em contato diretamente com os mantenedores.

Inclua:

- descrição do problema e impacto;
- passos para reproduzir;
- versão, rota ou arquivo afetado;
- sugestão de correção, se houver.

Prazo de resposta: confirmação em até 5 dias úteis e plano de correção em até 15 dias.

## Práticas adotadas

- *Row Level Security* em todas as tabelas do Supabase.
- Ações administrativas verificadas também no servidor (`requireAdmin()`).
- Somente a chave pública *anon* é usada; nenhuma chave `service_role` no projeto.
- Segredos apenas em variáveis de ambiente (`.env.local` está no `.gitignore`).
- Entradas sanitizadas e redirecionamentos restritos a rotas internas.
- Imagem Docker executada com usuário sem privilégios.
- `npm audit` no pipeline de CI e atualizações de dependências pelo Dependabot.
