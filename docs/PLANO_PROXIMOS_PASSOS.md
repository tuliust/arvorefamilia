# Plano de próximos passos - Árvore Família

> Última revisão: 2026-06-08  
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: revisão final da documentação concluída; manter apenas pendências reais futuras.

## Objetivo

Este documento registra apenas:

- pendências reais encontradas durante a revisão final da documentação;
- divergências entre documentação e implementação;
- ações futuras que não devem ser executadas nesta frente;
- pontos de QA, migration, refatoração ou melhoria identificados durante a auditoria documental.

O estado consolidado do que já foi implementado deve permanecer em `docs/GUIA_IMPLEMENTACOES.md`.

---

## 1. Situação atual

As pendências funcionais e visuais anteriormente registradas neste arquivo foram consideradas finalizadas e validadas.

A revisão arquivo por arquivo de `docs/` foi concluída. Qualquer divergência futura entre documentação e código deve ser registrada nas seções abaixo, sem alteração de código, sem migration e sem modificação direta no repositório.

---

## 2. Pendências identificadas durante a revisão documental

| ID | Documento de origem | Tipo | Ação necessária | Status |
|---|---|---|---|---|
| DOC-001 | `docs/funcionalidades/GENEALOGIA_VIEW.md` | bug provável / necessidade de QA | Avaliar se `GenealogyMobileStageTabs` deve usar gerações inferidas pelo layout. O componente monta chips a partir de `pessoas[].manual_generation`, enquanto `FamilyTree` infere gerações internamente antes do layout. | Aberto |
| DOC-002 | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | necessidade de ajuste visual / encoding | Corrigir strings quebradas por encoding em `src/app/pages/MinhaArvore.tsx`, como `Arquivos Hist?ricos`, `hist?ricos` e `Sess?o encerrada.`. | Aberto |
| DOC-003 | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | melhoria futura / decisão pendente | Definir se `Complemento` e múltiplas redes sociais devem persistir em schema próprio. Hoje `Complemento` é campo visual local e múltiplas redes são parcialmente sincronizadas apenas para campos legados da primeira rede. | Aberto |

---

## 3. Backlog futuro confirmado

| Frente | Direção futura | Status |
|---|---|---|
| Favoritos expandidos | Avaliar favoritos para arquivos históricos, relacionamentos, fórum, eventos, páginas, timeline e histórias. | A confirmar na revisão de favoritos/documentação relacionada. |
| Notificações avançadas | Push real, WhatsApp real, fila/retry avançado e cron externo automatizado. | Pós-MVP. |
| WhatsApp avançado | Privacidade forte em banco/API e log seguro de clique. | Pós-MVP. |
| Timeline avançada | Upload por evento, privacidade por evento e exportação PDF. | Pós-MVP. |
| Exportação avançada | Exportar árvore completa, além da área visível. | Pós-MVP. |
| Parentesco avançado | Integração visual direta na árvore, Genealogia e Visão Completa. | Pós-MVP. |
| Fórum avançado | Moderação ampliada, busca refinada, anexos e filtros adicionais. | Pós-MVP. |
| Home dinâmica | Aniversários, memórias do dia, novidades e destaques. | Pós-MVP. |
| Admin Integridade | Filtros por severidade, paginação e ações assistidas. | Pós-MVP técnico. |
| Storage legado | Prevenir uploads órfãos e avaliar limpeza auditada de legado/base64. | Pós-MVP técnico. |

---

## 4. Critérios permanentes de bloqueio

- build quebrado;
- login quebrado;
- usuário comum acessando área admin;
- usuário comum alterando dado restrito diretamente;
- RLS liberando escrita indevida;
- perda ou corrupção de dados;
- secret, dump, token, backup sensível ou service role no frontend/repositório;
- migration obrigatória ausente no ambiente final;
- divergência crítica entre documentação e implementação;
- documentação canônica orientando ação insegura de Supabase, Storage, Auth ou migrations;
- responsividade impedindo uso em mobile;
- árvore principal, perfil de pessoa, fórum, notificações ou edição da própria árvore inutilizáveis.

---

## 5. Regras para a revisão final da documentação

- não alterar código do sistema;
- não aplicar migration;
- não alterar dados reais;
- não criar usuário;
- não fazer validação visual autenticada;
- não atualizar arquivos diretamente pelo conector GitHub;
- comparar documentação com código, rotas, componentes, services, hooks, migrations e fluxos reais quando necessário;
- gerar arquivos revisados para download no chat;
- registrar neste plano apenas pendências reais encontradas durante a revisão;
- evitar duplicação entre documentos;
- preservar alertas de segurança, Supabase, RLS, migrations e dados reais.

---

## 6. Controle da revisão documental

| Ordem | Documento | Status | Observações |
|---:|---|---|---|
| 1 | `docs/PLANO_PROXIMOS_PASSOS.md` | Revisado | Plano limpo e atualizado durante a auditoria. |
| 2 | `docs/README.md` | Revisado nesta etapa | Índice canônico final alinhado à documentação consolidada e ao histórico resumido. |
| 3 | `docs/GUIA_IMPLEMENTACOES.md` | Revisado | Inventário consolidado. |
| 4 | `docs/GUIA_UX_LAYOUT.md` | Revisado | Guia visual reorganizado. |
| 5 | `docs/GUIA_COMPONENTES.md` | Revisado | Catálogo técnico revisado. |
| 6 | `docs/GUIA_CORRECAO_ERROS.md` | Revisado | Troubleshooting reestruturado. |
| 7 | `docs/arquitetura/ARCHITECTURE.md` | Revisado | Arquitetura atualizada. |
| 8 | `docs/arquitetura/ROTAS_E_GUARDS.md` | Revisado | Rotas e guards alinhados. |
| 9 | `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Revisado | Modelo de dados consolidado. |
| 10 | `docs/operacao/MIGRATIONS_SUPABASE.md` | Revisado | Procedimentos seguros e migrations recentes. |
| 11 | `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md` | Revisado | Perfil/admin/reset/sugestões/conjugal. |
| 12 | `docs/funcionalidades/MINHA_ARVORE_VIEW.md` | Revisado | View direta da árvore. |
| 13 | `docs/funcionalidades/GENEALOGIA_VIEW.md` | Revisado | Gerações e Visão Completa; gerou DOC-001. |
| 14 | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Revisado | Legendas, conectores e filtros. |
| 15 | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | Revisado | Edição própria; gerou DOC-002 e DOC-003. |
| 16 | `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` | Revisado | Filtros e pets. |
| 17 | `docs/funcionalidades/FORUM.md` | Revisado | Fórum, reações, favoritos e notificações. |
| 18 | `docs/funcionalidades/NOTIFICACOES.md` | Revisado | Preferências, logs, e-mail, Edge Functions e fórum. |
| 19 | `docs/funcionalidades/CALENDARIO_FAMILIAR.md` | Revisado nesta etapa | Calendário, filtros mobile e Google Agenda. |
| 20 | `docs/funcionalidades/TIMELINE.md` | Revisado nesta etapa | Timeline alinhada a `person_events` e `/minha-arvore/editar`. |
| 21 | `docs/funcionalidades/EXPORTACAO_ARVORE.md` | Revisado nesta etapa | Exportação da área visível da árvore. |
| 22 | `docs/operacao/README.md` | Pendente | Validar índice operacional. |
| 23 | `docs/operacao/DEPLOYMENT.md` | Pendente | Validar deploy, variáveis e build. |
| 24 | `docs/operacao/STORAGE_MAINTENANCE.md` | Pendente | Validar manutenção de Storage e limpeza auditada. |
| 25 | `docs/comandos/GIT_RESPONSIVIDADE.md` | Pendente | Confirmar se permanece como histórico/checklist. |
| 26 | `docs/ATTRIBUTIONS.md` | Pendente | Validar licenças e atribuições. |
| 27 | `docs/historico/README.md` | Pendente | Validar classificação histórica. |
| 28 | `docs/historico/*` | Pendente | Marcar como histórico e evitar conflito com guias canônicos. |
| 29 | `docs/historico/documentacao-antiga/*` | Pendente | Sugerir manter, fundir, mover ou remover em etapa posterior. |

---

## 7. Comandos para o commit documental final

Executar apenas quando todos os arquivos revisados forem substituídos manualmente:

```bash
git status --short
git diff --check
npm run build
```

Commit sugerido:

```bash
git add docs/README.md docs/GUIA_IMPLEMENTACOES.md docs/GUIA_COMPONENTES.md docs/GUIA_UX_LAYOUT.md docs/GUIA_CORRECAO_ERROS.md docs/PLANO_PROXIMOS_PASSOS.md
git add docs/arquitetura/ARCHITECTURE.md docs/arquitetura/ROTAS_E_GUARDS.md docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
git add docs/operacao/README.md docs/operacao/DEPLOYMENT.md docs/operacao/STORAGE_MAINTENANCE.md docs/operacao/MIGRATIONS_SUPABASE.md
git add docs/funcionalidades/*.md docs/comandos/GIT_RESPONSIVIDADE.md docs/ATTRIBUTIONS.md docs/historico/README.md
git commit -m "docs: revise final project documentation"
git pull --rebase origin main
git push origin main
```

Não usar `git add .`.
