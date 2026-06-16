# Documentação — Árvore Família

> Última revisão: 2026-06-15
> Local canônico: `docs/README.md`
> Projeto: `tuliust/arvorefamilia`
> Status: índice canônico atualizado para registrar o fluxo de cadastro do membro em 5 etapas, as rotas `/arquivos-historicos` e `/preferencias`, e a separação entre edição, preferências e revisão final.

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
- o histórico preventivo dessas rotas fica em `docs/historico/ROTAS_REMOVIDAS.md`;
- `/minha-arvore/editar` continua vigente como rota protegida de edição completa do membro;
- o cadastro inicial do membro usa cinco etapas protegidas por `MemberRoute`:
  1. `/meus-dados`;
  2. `/meus-vinculos`;
  3. `/arquivos-historicos`;
  4. `/preferencias`;
  5. `/revisao-dados`;
- Arquivos Históricos pertencem à Etapa 3 em `/arquivos-historicos`;
- Preferências de notificação e Permissões de exibição pertencem à Etapa 4 em `/preferencias`;
- `/revisao-dados` é revisão final e finalização, sem edição completa de arquivos, notificações ou permissões;
- `MemberOnboardingSteps` é o indicador visual reutilizável das cinco etapas;
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
- `supabase/migrations/` é a fonte da verdade do schema;
- SQLs soltos ou antigos ficam classificados em `docs/historico/SQLS_LEGADOS.md` quando não forem migrations oficiais;
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
| Entender rotas antigas removidas | `docs/historico/ROTAS_REMOVIDAS.md` |
| Classificar SQL solto ou documento antigo de banco | `docs/historico/SQLS_LEGADOS.md` |

Regra:

```txt
Contrato vigente fica nos guias canônicos.
QA manual fica em QA_MANUAL.md.
Pendência fica em PLANO_PROXIMOS_PASSOS.md.
Operação fica em docs/operacao/.
Histórico fica em docs/historico/.
supabase/migrations/ é a fonte da verdade do schema.
```

---

## 3. Guias oficiais na raiz de `docs/`

| Arquivo | Uso | Status |
|---|---|---|
| `README.md` | Índice canônico da documentação. | Atualizado. |
| `BASELINE_PRODUTO_ATUAL.md` | Estado funcional observado na `main`. | Manter sincronizado. |
| `INVENTARIO_TECNICO.md` | Rotas, componentes, services, tipos, CSS, testes e documentação. | Atualizado para o onboarding em 5 etapas. |
| `GUIA_IMPLEMENTACOES.md` | Inventário consolidado do que está implementado. | Atualizado para o onboarding em 5 etapas. |
| `GUIA_COMPONENTES.md` | Componentes, responsabilidades, padrões e anti-regressões. | Atualizado com `MemberOnboardingSteps`. |
| `GUIA_UX_LAYOUT.md` | UX, layout, responsividade, árvore, menus, painéis, paletas e microcopy. | Preservar. |
| `QA_MANUAL.md` | Guia central de QA manual e pós-deploy. | Preservar. |
| `REGRAS_DE_NAO_REGRESSAO.md` | Regras e contratos mínimos para mudanças futuras. | Manter sincronizado. |
| `PLANO_PROXIMOS_PASSOS.md` | Pendências reais, QA aberto, riscos e decisões futuras. | Manter sincronizado. |
| `DECISOES_ARQUITETURAIS.md` | Decisões estruturais e justificativas. | Preservar. |
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
| `ROTAS_E_GUARDS.md` | Rotas públicas, rotas de árvore, rotas de membro, onboarding em 5 etapas, rotas administrativas, guards, redirecionamentos e navegação. |
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
| `ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Painel, filtros, controles, destaques e conectores. | Preservar. |
| `EXPORTACAO_ARVORE.md` | Exportação por Área, Imagem, PDF e Impressão. | Preservar. |
| `FAVORITOS.md` | Favoritos de páginas, pessoas, fórum e integrações. | Revisão futura recomendada. |
| `PESSOAS_PERFIL_ADMIN.md` | Perfil, reset, sugestões, privacidade, arquivos, eventos e relacionamento conjugal. | Revisão futura recomendada. |
| `MINHA_ARVORE_EDITAR.md` | Edição completa da própria árvore; diferente do onboarding inicial. | Atualizado. |
| `FORUM.md` | Fórum, tópicos, menções, respostas, reações, favoritos e notificações. | Preservar. |
| `NOTIFICACOES.md` | Notificações internas/e-mail, preferências, logs, Edge Functions e cron futuro. | Atualizado para `/preferencias`. |
| `CALENDARIO_FAMILIAR.md` | Calendário familiar, categorias, filtros mobile e Google Agenda. | Preservar. |
| `TIMELINE.md` | Timeline de pessoa, eventos derivados, arquivos históricos, relacionamentos e pós-MVP. | Preservar. |
| `CURIOSIDADES_E_IA.md` | Curiosidades, IA e geração de Mini Bio/Curiosidades em `/meus-dados`. | Atualizado. |

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
supabase/migrations/ é a fonte da verdade do schema.
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
- guardar material sobre rotas removidas, SQLs legados, refatorações e auditorias já encerradas.

| Arquivo | Uso |
|---|---|
| `README.md` | Índice histórico consolidado da pasta. |
| `ROTAS_REMOVIDAS.md` | Histórico preventivo de `/minha-arvore`, `/genealogia` e `/visao-completa`. |
| `SQLS_LEGADOS.md` | Inventário preventivo de SQLs soltos, dumps, diagnósticos e documentos antigos de banco. |

Regras:

- conteúdo histórico não prevalece sobre documentação canônica;
- histórico não deve reabrir `/minha-arvore`, `/genealogia` ou `/visao-completa`;
- SQL histórico não substitui migration oficial;
- material histórico útil deve apontar para o documento canônico atual;
- dúvidas sobre ocorrências dessas rotas antigas devem ser conferidas em `docs/historico/ROTAS_REMOVIDAS.md`;
- dúvidas sobre SQL solto devem ser conferidas em `docs/historico/SQLS_LEGADOS.md`.

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
| SQL legado, dump ou diagnóstico antigo | `docs/historico/SQLS_LEGADOS.md` |
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

Se `npm run test:e2e` não estiver configurado ou não for aplicável, registrar explicitamente essa limitação no PR/commit.

---

## 10. Checklist documental do onboarding de membro

Sempre que alterar `/meus-dados`, `/meus-vinculos`, `/arquivos-historicos`, `/preferencias` ou `/revisao-dados`, revisar:

```txt
docs/README.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/funcionalidades/MINHA_ARVORE_EDITAR.md
docs/funcionalidades/NOTIFICACOES.md
docs/funcionalidades/CURIOSIDADES_E_IA.md
docs/INVENTARIO_TECNICO.md
docs/GUIA_COMPONENTES.md
docs/GUIA_IMPLEMENTACOES.md
```

Critérios:

- rotas novas registradas como `MemberRoute`;
- etapa ativa coerente no `MemberOnboardingSteps`;
- Arquivos Históricos documentados na Etapa 3;
- Notificações e Permissões documentadas na Etapa 4;
- Revisão final documentada sem edição duplicada;
- comandos de validação executados ou limitação registrada.
