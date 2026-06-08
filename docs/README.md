# Documentação - Árvore Família

> Última revisão: 2026-06-08  
> Local canônico: `docs/README.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: índice canônico da documentação revisada.

Este diretório concentra a documentação técnica, funcional, operacional e histórica do projeto **Árvore Família**.

Use este arquivo como ponto de entrada antes de consultar guias específicos. A documentação foi consolidada para reduzir duplicidade, separar estado atual de histórico e evitar que arquivos antigos sejam usados como fonte de verdade.

---

## 1. Regras de uso da documentação

Regras gerais:

- arquivos na raiz de `docs/` são guias canônicos gerais;
- arquivos em `docs/funcionalidades/` são guias canônicos de comportamento funcional específico;
- arquivos em `docs/arquitetura/` são guias canônicos de rotas, guards, arquitetura e modelo de usuários/dados;
- arquivos em `docs/operacao/` são procedimentos operacionais e de manutenção;
- arquivos em `docs/comandos/` são checklists/comandos auxiliares;
- `docs/historico/README.md` é o único resumo histórico consolidado;
- pendências reais, bugs prováveis e decisões futuras devem ficar em `PLANO_PROXIMOS_PASSOS.md`;
- scripts SQL soltos, diagnósticos antigos e documentação removida não substituem `supabase/migrations` nem os guias canônicos.

Quando houver divergência entre um guia atual e conteúdo histórico, prevalece o guia atual.

---

## 2. Guias oficiais na raiz de `docs/`

| Arquivo | Uso |
|---|---|
| `README.md` | Índice canônico da documentação. |
| `GUIA_IMPLEMENTACOES.md` | Inventário consolidado do que já foi implementado. |
| `GUIA_COMPONENTES.md` | Componentes, responsabilidades, padrões de uso e anti-regressões. |
| `GUIA_UX_LAYOUT.md` | UX, layout, responsividade, headers, árvore, menus e microcopy. |
| `GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma, causa provável e correção. |
| `PLANO_PROXIMOS_PASSOS.md` | Pendências reais, bloqueios, QA futuro e backlog pós-MVP. |
| `ATTRIBUTIONS.md` | Licenças, atribuições e cuidados com assets externos. |

---

## 3. Arquitetura

Pasta:

```txt
docs/arquitetura/
```

| Arquivo | Uso |
|---|---|
| `arquitetura/ARCHITECTURE.md` | Visão sintética da arquitetura atual, stack, camadas e integrações. |
| `arquitetura/ROTAS_E_GUARDS.md` | Rotas públicas, rotas de membro, rotas administrativas, guards e redirecionamentos. |
| `arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Modelo de usuários, pessoas, vínculos, permissões, favoritos, fórum, notificações e objetos legados. |

---

## 4. Funcionalidades

Pasta:

```txt
docs/funcionalidades/
```

| Arquivo | Escopo |
|---|---|
| `funcionalidades/PESSOAS_PERFIL_ADMIN.md` | Perfil público, perfil admin, reset, sugestões, privacidade, arquivos, eventos e relacionamento conjugal. |
| `funcionalidades/MINHA_ARVORE_VIEW.md` | View direta da árvore, ReactFlow, viewport, layout central, filtros diretos e mobile. |
| `funcionalidades/GENEALOGIA_VIEW.md` | Genealogia, Visão Completa, gerações, chips mobile, inferência visual e QA. |
| `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Legendas, linhas, conectores, filtros, destaques e painel lateral. |
| `funcionalidades/MINHA_ARVORE_EDITAR.md` | Edição da própria árvore, avatar, arquivos, eventos pessoais, dados próprios e saída sem salvar. |
| `funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` | Filtros da Minha Árvore, separação humanos/pets, contadores e modo foco. |
| `funcionalidades/FORUM.md` | Fórum, categorias, tópicos, pessoas relacionadas, menções, respostas, comentários, reações e favoritos. |
| `funcionalidades/NOTIFICACOES.md` | Notificações internas/e-mail, preferências, logs, Edge Functions, fórum e cron futuro. |
| `funcionalidades/CALENDARIO_FAMILIAR.md` | Calendário familiar, categorias, filtros mobile, Google Agenda, microcopy e QA. |
| `funcionalidades/TIMELINE.md` | Timeline de pessoa, eventos derivados, `person_events`, arquivos históricos, relacionamentos e pós-MVP. |
| `funcionalidades/EXPORTACAO_ARVORE.md` | Exportação da área visível da árvore em PNG, PDF e impressão. |

---

## 5. Operação e manutenção

Pasta:

```txt
docs/operacao/
```

| Arquivo | Uso |
|---|---|
| `operacao/README.md` | Índice da pasta operacional. |
| `operacao/DEPLOYMENT.md` | Deploy, variáveis, build, publicação, Supabase, Edge Functions e secrets. |
| `operacao/MIGRATIONS_SUPABASE.md` | Migrations, Supabase, `db push`, SQL legado, RLS, schema cache e operação segura. |
| `operacao/STORAGE_MAINTENANCE.md` | Storage, dry-run, órfãos, base64 legado, scripts administrativos e service role. |

Regras operacionais permanentes:

- `supabase/migrations` é a fonte da verdade do schema;
- SQL legado não deve ser aplicado como schema principal de ambiente novo;
- `supabase db push` só deve ser executado com revisão explícita;
- service role, dumps, tokens e secrets não devem ser versionados;
- ajuste visual não deve gerar migration;
- limpeza de Storage exige dry-run, revisão e flag explícita.

---

## 6. Comandos auxiliares

Pasta:

```txt
docs/comandos/
```

| Arquivo | Uso |
|---|---|
| `comandos/GIT_RESPONSIVIDADE.md` | Checklist operacional/histórico de Git, responsividade e validações antes de commit. |

Esse documento não substitui `GUIA_UX_LAYOUT.md` nem `PLANO_PROXIMOS_PASSOS.md`.

---

## 7. Histórico consolidado

Pasta:

```txt
docs/historico/
```

| Arquivo | Uso |
|---|---|
| `historico/README.md` | Resumo histórico consolidado das auditorias, QA, responsividade, exportação e documentação antiga. |

A pasta histórica foi consolidada. Os arquivos históricos individuais e `docs/historico/documentacao-antiga/*` foram substituídos pelo resumo consolidado em `docs/historico/README.md`.

Não recriar documentos históricos individuais salvo necessidade explícita de rastreabilidade futura. Se um novo diagnóstico for criado, ele deve declarar que é histórico e não substitui os guias canônicos.

---

## 8. Onde documentar cada tipo de informação

| Tipo de informação | Destino correto |
|---|---|
| Estado consolidado de implementação | `GUIA_IMPLEMENTACOES.md` |
| Layout, responsividade, visual, menu, header, microcopy | `GUIA_UX_LAYOUT.md` |
| Componentes, props, responsabilidades e anti-regressões | `GUIA_COMPONENTES.md` |
| Sintoma, erro, causa provável e correção | `GUIA_CORRECAO_ERROS.md` |
| Pendência real, bug provável, decisão futura ou pós-MVP | `PLANO_PROXIMOS_PASSOS.md` |
| Rota, guard, permissão ou navegação | `arquitetura/ROTAS_E_GUARDS.md` |
| Usuários, pessoas, vínculos e estrutura de dados | `arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| Arquitetura geral | `arquitetura/ARCHITECTURE.md` |
| Deploy e publicação | `operacao/DEPLOYMENT.md` |
| Migrations, RLS, schema cache e SQL legado | `operacao/MIGRATIONS_SUPABASE.md` |
| Storage, órfãos, base64 legado e scripts administrativos | `operacao/STORAGE_MAINTENANCE.md` |
| Funcionalidade específica | `funcionalidades/<NOME>.md` |
| Licenças e atribuições | `ATTRIBUTIONS.md` |
| Histórico consolidado | `historico/README.md` |

---

## 9. Pendências reais abertas

As pendências abertas da revisão documental ficam apenas em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

No fechamento desta revisão documental, o plano mantém três itens abertos:

| ID | Origem | Tipo |
|---|---|---|
| `DOC-001` | `funcionalidades/GENEALOGIA_VIEW.md` | bug provável / necessidade de QA |
| `DOC-002` | `funcionalidades/MINHA_ARVORE_EDITAR.md` | ajuste visual / encoding |
| `DOC-003` | `funcionalidades/MINHA_ARVORE_EDITAR.md` | melhoria futura / decisão pendente |

Não duplicar essas pendências em outros arquivos. Documentos funcionais podem mencionar o contexto técnico, mas o controle deve permanecer no plano.

---

## 10. Critérios permanentes de bloqueio

Antes de lançamento, commit final ou deploy, bloquear se houver:

- build quebrado;
- login quebrado;
- usuário comum acessando admin;
- usuário comum alterando dado restrito diretamente;
- RLS liberando escrita indevida;
- perda ou corrupção de dados;
- secret, token, dump, backup sensível ou service role no frontend/repositório;
- migration obrigatória ausente no ambiente final;
- documentação canônica orientando ação insegura de Supabase, Storage, Auth ou migrations;
- responsividade impedindo uso em mobile;
- árvore principal, perfil de pessoa, fórum, notificações ou edição da própria árvore inutilizáveis.

---

## 11. Checklist antes de criar nova documentação

Antes de criar um novo `.md`, verificar:

- se o tema já está coberto por guia canônico;
- se o conteúdo é funcional, operacional, arquitetural, legal ou histórico;
- se o documento evita duplicidade;
- se pendências foram registradas no plano;
- se há referência cruzada para o documento canônico correto;
- se há dado sensível, secret, dump, token ou conteúdo privado que não deve ser versionado;
- se o arquivo precisa mesmo existir ou se o conteúdo pode ser incorporado a um documento existente.

---

## 12. Validação final da documentação

Antes do commit final:

```bash
git status --short
git diff --check
npm run build
```

Se algum documento operacional, migration, Edge Function ou script for alterado futuramente, validar também o comando específico documentado no guia correspondente.

---

## 13. Commit documental final

Usar `git add` explícito, não `git add .`.

Sugestão:

```bash
git add docs/README.md docs/GUIA_IMPLEMENTACOES.md docs/GUIA_COMPONENTES.md docs/GUIA_UX_LAYOUT.md docs/GUIA_CORRECAO_ERROS.md docs/PLANO_PROXIMOS_PASSOS.md

git add docs/arquitetura/ARCHITECTURE.md docs/arquitetura/ROTAS_E_GUARDS.md docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md

git add docs/operacao/README.md docs/operacao/DEPLOYMENT.md docs/operacao/STORAGE_MAINTENANCE.md docs/operacao/MIGRATIONS_SUPABASE.md

git add docs/funcionalidades/*.md docs/comandos/GIT_RESPONSIVIDADE.md docs/ATTRIBUTIONS.md docs/historico/README.md

git commit -m "docs: revise final project documentation"

git pull --rebase origin main

git push origin main
```

Arquivos removidos por consolidação histórica devem permanecer staged como `D` no commit final.
