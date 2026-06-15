
# Documentação — Árvore Família

> Última revisão: 2026-06-14
> Local canônico: `docs/README.md`
> Projeto: `tuliust/arvorefamilia`
> Status: índice canônico reorganizado para incluir `docs/QA_MANUAL.md` e separar contratos, QA manual, pendências, arquitetura, funcionalidades, operação e histórico.

Este diretório concentra a documentação técnica, funcional, operacional e histórica do projeto **Árvore Família**.

Use este arquivo como ponto de entrada. A documentação canônica deve registrar comportamento implementado, contratos vigentes ou pendências explicitamente classificadas.

---

## 1. Estado atual consolidado

A baseline funcional atual registra:

- `/entrar` funciona como home pública, login, cadastro, primeiro acesso e aceite legal;
- `/` redireciona para `/mapa-familiar`, preservando `location.search`;
- as views oficiais da árvore são:
  - **Árvore Familiar** — `/mapa-familiar`;
  - **Mapa Genealógico** — `/mapa-familiar-horizontal`;
- as views antigas foram removidas do roteamento ativo:
  - `/minha-arvore`;
  - `/genealogia`;
  - `/visao-completa`;
- `/minha-arvore/editar` continua vigente como rota protegida de edição do membro;
- `TreeViewMode` possui apenas:
  - `mapa-familiar`;
  - `mapa-familiar-horizontal`;
- `/mapa-familiar` usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile;
- `/mapa-familiar-horizontal` usa `DesktopFamilyHorizontalMapView` no desktop/tablet e `MobileFamilyHorizontalMapView` no mobile;
- o painel desktop não possui mais a barra `Filtros | Legendas | Ações`;
- o modal mobile é reduzido e não exibe Zoom, Restaurar visualização ou Exportar;
- a horizontal mobile opera com uma geração por tela, botões `Ger X`, swipe lateral e scroll vertical interno;
- exportação cobre Área, Imagem/PNG, PDF e Imprimir nas views oficiais;
- a referência visual de paletas é o desktop, com adaptação mobile por tokens/overrides escopados;
- as paletas oficiais são `white`, `visual`, `orange` e `brown`;
- cards mobile não devem exibir visualmente `Nascimento não informado` ou `Falecimento não informado`;
- a vertical suporta núcleos conjugais adicionais quando há dados reais;
- cônjuges de `pais`/Geração 4 na horizontal continuam pendência documentada, não implementação consolidada;
- `/calendario-familiar` possui filtros mobile compactos por categoria;
- ReactFlow/Dagre permanecem como legado ativo/dependência técnica e não devem ser removidos sem frente própria.

---

## 2. Como usar a documentação

| Necessidade | Documento principal |
|---|---|
| Entender o estado funcional vigente | `BASELINE_PRODUTO_ATUAL.md` |
| Ver mapa técnico de arquivos, services, CSS e legado | `INVENTARIO_TECNICO.md` |
| Ver o que está implementado por frente | `GUIA_IMPLEMENTACOES.md` |
| Entender responsabilidades de componentes | `GUIA_COMPONENTES.md` |
| Revisar UX, layout, responsividade e paletas | `GUIA_UX_LAYOUT.md` |
| Validar manualmente rotas, árvore, mobile, exportação e deploy | `QA_MANUAL.md` |
| Conferir regras que não podem regredir | `REGRAS_DE_NAO_REGRESSAO.md` |
| Ver pendências, riscos e decisões futuras | `PLANO_PROXIMOS_PASSOS.md` |
| Ver decisões estruturais | `DECISOES_ARQUITETURAIS.md` |
| Investigar erro por sintoma | `GUIA_CORRECAO_ERROS.md` |

Regra:

```txt
Contrato vigente fica nos guias canônicos.
QA manual fica em QA_MANUAL.md.
Pendência fica em PLANO_PROXIMOS_PASSOS.md.
Operação fica em docs/operacao/.
Histórico fica em docs/historico/.
```

---

## 3. Guias oficiais na raiz de `docs/`

| Arquivo | Uso | Status |
|---|---|---|
| `README.md` | Índice canônico da documentação. | Atualizado. |
| `BASELINE_PRODUTO_ATUAL.md` | Estado funcional observado na `main`. | Atualizado. |
| `INVENTARIO_TECNICO.md` | Rotas, componentes, services, tipos, CSS, testes e documentação. | Manter sincronizado. |
| `GUIA_IMPLEMENTACOES.md` | Inventário consolidado do que está implementado. | Atualizado. |
| `GUIA_COMPONENTES.md` | Componentes, responsabilidades, padrões e anti-regressões. | Atualizado. |
| `GUIA_UX_LAYOUT.md` | UX, layout, responsividade, árvore, menus, painéis, paletas e microcopy. | Atualizado. |
| `QA_MANUAL.md` | Guia central de QA manual e pós-deploy. | Novo. |
| `REGRAS_DE_NAO_REGRESSAO.md` | Regras e contratos mínimos para mudanças futuras. | Atualizado. |
| `PLANO_PROXIMOS_PASSOS.md` | Pendências reais, QA aberto, riscos e decisões futuras. | Atualizado. |
| `DECISOES_ARQUITETURAIS.md` | Decisões estruturais e justificativas. | Atualizado. |
| `GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma, causa provável e correção. | Preservar. |
| `ATTRIBUTIONS.md` | Licenças, atribuições e cuidados com assets externos. | Preservar. |

---

## 4. Arquitetura

Pasta:

```txt
docs/arquitetura/
```

| Arquivo | Uso |
|---|---|
| `ARCHITECTURE.md` | Visão sintética da arquitetura atual, stack, camadas, shell da Home, duas views da árvore, exportação client-side, paletas e integrações. |
| `ROTAS_E_GUARDS.md` | Rotas públicas, rotas de árvore, rotas de membro, rotas administrativas, guards, redirecionamentos e navegação. |
| `ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Modelo de usuários, pessoas, vínculos, permissões, favoritos, fórum, notificações, relacionamentos e objetos legados. |

---

## 5. Funcionalidades

Pasta:

```txt
docs/funcionalidades/
```

| Arquivo | Escopo | Status |
|---|---|---|
| `MAPA_FAMILIAR_VIEW.md` | Documento canônico de `/mapa-familiar` e `/mapa-familiar-horizontal`. | Referência principal. |
| `ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Painel, filtros, controles, destaques e conectores. | Atualizado. |
| `EXPORTACAO_ARVORE.md` | Exportação por Área, Imagem, PDF e Impressão. | Atualizado. |
| `FAVORITOS.md` | Favoritos de páginas, pessoas, fórum e integrações. | Revisão futura recomendada. |
| `PESSOAS_PERFIL_ADMIN.md` | Perfil, reset, sugestões, privacidade, arquivos, eventos e relacionamento conjugal. | Revisão futura recomendada. |
| `MINHA_ARVORE_EDITAR.md` | Edição da própria árvore e CSS mobile escopado. | Vigente; não confundir com `/minha-arvore` removida. |
| `FORUM.md` | Fórum, tópicos, menções, respostas, reações, favoritos e notificações. | Preservar. |
| `NOTIFICACOES.md` | Notificações internas/e-mail, preferências, logs, Edge Functions e cron futuro. | Preservar. |
| `CALENDARIO_FAMILIAR.md` | Calendário familiar, categorias, filtros mobile e Google Agenda. | Atualizado. |
| `TIMELINE.md` | Timeline de pessoa, eventos derivados, arquivos históricos, relacionamentos e pós-MVP. | Preservar. |
| `CURIOSIDADES_E_IA.md` | Curiosidades, IA e geração de conteúdo. | Preservar. |

Documentos sobre antigas views da árvore devem permanecer apenas em `docs/historico/` ou marcados como legado.

---

## 6. Operação

Pasta:

```txt
docs/operacao/
```

| Arquivo | Uso |
|---|---|
| `README.md` | Índice operacional e regras gerais. |
| `DEPLOY.md` | Atalho curto de deploy. |
| `DEPLOYMENT.md` | Guia completo de deploy, cache, fallback SPA, Supabase, Edge Functions, `/api/*`, OAuth e troubleshooting. |
| `MIGRATIONS_SUPABASE.md` | Fluxo seguro de migrations, schema, RLS, RPCs e schema cache. |
| `OAUTH_GOOGLE.md` | Operação Google OAuth/Agenda, consent screen, test users, redirects e secrets. |
| `STORAGE_MAINTENANCE.md` | Buckets, objetos órfãos, base64 legado e scripts administrativos. |

Regra operacional:

```txt
Ajuste visual, layout, paleta, modal, exportação client-side ou documentação não exige migration.
Mudança de schema, RLS, RPC, trigger, bucket/policy, Edge Function ou secret exige revisão operacional.
```

---

## 7. Histórico

Pasta:

```txt
docs/historico/
```

Uso:

- preservar contexto de decisões passadas;
- manter documentação antiga sem confundi-la com contrato vigente;
- guardar material sobre rotas removidas, refatorações e auditorias já encerradas.

Regras:

- conteúdo histórico não prevalece sobre documentação canônica;
- histórico não deve reabrir `/minha-arvore`, `/genealogia` ou `/visao-completa`;
- material histórico útil deve apontar para o documento canônico atual.

---

## 8. Onde registrar cada tipo de mudança

| Tipo de informação | Onde registrar |
|---|---|
| Estado implementado | `BASELINE_PRODUTO_ATUAL.md` ou documento funcional específico |
| Responsabilidade técnica | `INVENTARIO_TECNICO.md` ou `GUIA_COMPONENTES.md` |
| UX/layout | `GUIA_UX_LAYOUT.md` |
| QA manual | `QA_MANUAL.md` |
| Regra que não pode regredir | `REGRAS_DE_NAO_REGRESSAO.md` |
| Pendência ou risco | `PLANO_PROXIMOS_PASSOS.md` |
| Deploy/operação | `docs/operacao/*` |
| Banco/schema | `docs/operacao/MIGRATIONS_SUPABASE.md` e `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| História/legado | `docs/historico/*` |

---

## 9. Validação antes de alterar documentação

Para mudança documental simples:

```bash
git diff --check
npm run build
```

Para reorganização que altera contratos ou guias canônicos:

```bash
git diff --check
npm run build
npm test
```

Para mudança que afeta QA manual, árvore, rotas, deploy ou operação:

```bash
git diff --check
npm run build
npm test
npm run test:e2e
```

Validações manuais centralizadas ficam em:

```txt
docs/QA_MANUAL.md
```

---

## 10. Anti-regressões documentais

- Não documentar `/minha-arvore`, `/genealogia` ou `/visao-completa` como views ativas.
- Não tratar `/minha-arvore/editar` como view antiga da árvore.
- Não documentar `pais`/Geração 4 na horizontal como implementado até `TREE-003` ser corrigido no código.
- Não transformar checklist manual em pendência fechada sem validação real.
- Não duplicar checklists longos de QA fora de `QA_MANUAL.md`.
- Não colocar secrets, service role, tokens ou chaves reais na documentação.
- Não tratar SQL solto como fonte principal do schema.
- Não usar docs históricas como fonte de implementação vigente.
