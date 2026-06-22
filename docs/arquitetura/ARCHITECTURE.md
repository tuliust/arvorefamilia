# Arquitetura atual — Árvore Família

> Última revisão: 2026-06-22
> Local canônico: `docs/arquitetura/ARCHITECTURE.md`
> Tipo: visão técnica de alto nível.
> Status: revisado contra o código atual, com arquitetura mobile composta por React + scripts auxiliares DOM/CSS.

---

## 1. Objetivo

Este documento descreve a arquitetura vigente do projeto **Árvore Família** em alto nível.

Ele responde:

- quais são as camadas do sistema;
- quais rotas e views formam a Home pós-login;
- onde ficam services, componentes, estilos, migrations e Edge Functions;
- quais contratos técnicos não devem ser alterados sem decisão explícita;
- quais dívidas estruturais exigem frente própria.

Para detalhes específicos, consulte:

| Tema | Documento |
|---|---|
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Modelo de dados | `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| Estado implementado | `docs/GUIA_IMPLEMENTACOES.md` |
| Componentes | `docs/GUIA_COMPONENTES.md` |
| UX/layout | `docs/GUIA_UX_LAYOUT.md` |
| Mapa Familiar | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Painel/conectores | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| Operação | `docs/operacao/README.md` |
| Pendências | `docs/PLANO_PROXIMOS_PASSOS.md` |

---

## 2. Stack

| Camada | Tecnologia/recurso |
|---|---|
| Frontend | React, TypeScript, Vite |
| Roteamento | React Router com `createBrowserRouter` |
| UI | Tailwind, CSS em `src/styles`, componentes locais, `lucide-react` |
| Árvore vigente | HTML/CSS/SVG próprio nas views oficiais |
| Exportação | `html2canvas`, `jspdf`, utilitários em `treeExport.ts` |
| Auth/banco | Supabase Auth, Postgres, RLS, RPCs |
| Storage | Supabase Storage |
| Backend server-side | Supabase Edge Functions e rotas serverless `/api/*` quando configuradas |
| Testes | Vitest e Playwright |
| Integrações | Google Agenda/OAuth, Resend, OpenAI server-side quando habilitados |

Regra:

```txt
Secrets e service role não pertencem ao frontend.
```

---

## 3. Organização de código

```txt
src/app/
  components/             componentes reutilizáveis
  components/ui/          componentes base de UI
  components/layout/      headers, menus e layout
  components/FamilyTree/  views, layouts, cards, utilitários e legado da árvore
  components/person/      componentes de pessoa/perfil
  components/favorites/   favoritos
  components/Timeline/    timeline
  constants/              catálogos e páginas favoritáveis
  contexts/               AuthContext
  lib/                    cliente Supabase
  pages/                  páginas públicas, membro, fórum, admin e Home
  pages/home/             shell e controles da árvore
  services/               acesso a Supabase, RPCs, Storage e integrações
  types/                  contratos TypeScript
  utils/                  funções puras
  routes.tsx              roteamento e guards

src/styles/
  estilos globais e CSS escopado por área/feature

supabase/
  migrations/             fonte da verdade do schema
  functions/              Edge Functions

scripts/
  rotinas operacionais, diagnósticos e migrações controladas
```

---

## 4. Separação de responsabilidades

| Camada | Responsabilidade |
|---|---|
| Pages | orquestração de tela, estado local e composição |
| Components | UI e interação visual |
| Services | Supabase, RPCs, Storage e integrações |
| Utils/layouts | cálculos puros e modelos de visualização |
| CSS escopado | layout, responsividade e paletas |
| Migrations | schema, RLS, RPCs, triggers e constraints |
| Edge Functions | execução server-side com secrets |
| Operação | deploy, migrations, Storage, OAuth e troubleshooting |

Anti-padrões:

- componente visual acessando Supabase diretamente sem service;
- CSS criando dado ou alterando relação familiar;
- ajuste visual gerando migration;
- Edge Function sendo chamada como substituta de RLS;
- documento histórico usado como fonte de verdade vigente.

---

## 5. Rotas e guards

Guards principais:

| Guard | Uso |
|---|---|
| `TreeAccessRoute` | `/`, `/mapa-familiar`, `/mapa-familiar-horizontal`, `/busca` |
| `MemberRoute` | perfis, calendário, favoritos, notificações, fórum e páginas de membro |
| `ProtectedRoute` | `/admin/*` |

Views oficiais da árvore:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Rotas antigas removidas como views ativas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção vigente:

```txt
/minha-arvore/editar
```

Detalhes ficam em `docs/arquitetura/ROTAS_E_GUARDS.md`.

---

## 6. Shell da Home e views da árvore

A Home pós-login é o shell compartilhado das duas views oficiais.

Arquivos centrais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/components/FamilyTree/treeViewMode.ts
```

Contrato de `TreeViewMode`:

```ts
export type TreeViewMode =
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal';
```

Matriz de renderização:

| View | Desktop/tablet | Mobile |
|---|---|---|
| `mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapFilteredView` | `MobileFamilyHorizontalMapFilteredView` |

Regras:

- `/` redireciona para `/mapa-familiar`;
- a troca Vertical/Horizontal preserva `location.search`;
- `?pessoa=...` não pode ser perdido;
- títulos exportáveis seguem o documento funcional;
- rotas antigas não devem virar fallback.

---

## 7. Árvore visual

Arquivos críticos:

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapFilteredView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapFilteredView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/components/FamilyTree/utils/treeExport.ts
```

Contratos:

- desktop é referência visual/estrutural;
- mobile adapta layout e navegação;
- paletas são aplicadas por tokens e CSS escopado;
- conectores dependem de relações explícitas;
- exportação captura HTML/CSS/SVG, não painel/overlays;
- pets e pessoas sem foto usam fallback visual, não Storage.

Ponto aberto documentado:

```txt
Cônjuges de `pais`/Geração 4 na horizontal devem permanecer como pendência até correção de código confirmada.
```

---

## 8. Legado ativo da árvore

Há arquivos herdados de ReactFlow/Dagre que não são renderer público principal das views atuais, mas ainda podem conter tipos, contratos ou dependências indiretas.

Exemplos:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/nodeTypes.ts
src/app/components/FamilyTree/edgeTypes.ts
```

Regra:

```txt
Não remover legado ReactFlow/Dagre em limpeza genérica.
```

A remoção exige frente própria:

1. mapear imports;
2. extrair tipos úteis;
3. validar build/testes;
4. validar exportação;
5. atualizar documentação;
6. remover dependências se ficarem órfãs.

---

## 9. Dados, banco e Supabase

Fonte da verdade de schema:

```txt
supabase/migrations/
```

Camadas de acesso:

| Área | Responsabilidade |
|---|---|
| `services/` | chamadas a Supabase, RPCs, Storage e integrações |
| RLS/policies | segurança de leitura/escrita por usuário/perfil |
| RPCs | operações administrativas ou agregadas |
| Edge Functions | processamento server-side com secrets |
| Migrations | alterações versionadas de schema |

Regras:

- SQL solto não substitui migration;
- mudança visual não cria migration;
- alteração de coluna/tabela/RPC/policy/trigger exige migration;
- service role fica apenas em ambiente operacional/server-side;
- dumps, tokens e dados reais não devem ser versionados.

---

## 10. Edge Functions e integrações

Edge Functions relevantes podem incluir:

```txt
run-daily-notifications
google-calendar-auth
google-calendar-callback
google-calendar-sync
```

Rotas serverless de provedor podem incluir:

```txt
/api/*
```

Regras:

- secrets ficam no Supabase ou provedor serverless;
- não usar prefixo `VITE_` em secrets;
- fallback SPA não deve capturar `/api/*`;
- OAuth Google depende de consent screen, redirect URI, escopos e test users quando em Testing;
- IA/OpenAI deve ser executada server-side, nunca no frontend.

Detalhes ficam em `docs/operacao/`.

---

## 11. CSS e estilos

CSS vigente combina Tailwind e arquivos em `src/styles`.

Regras:

- novo CSS deve ser escopado por root, rota, container ou data attribute;
- não usar seletor global `svg path`;
- paletas da árvore devem seguir tokens;
- mobile não deve redefinir paleta como fonte própria;
- CSS legado só deve ser removido após busca e QA visual;
- correção visual não deve alterar dados.

Arquivos críticos mudam conforme a frente, mas incluem:

```txt
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-map-mobile-palettes.css
src/styles/tree-panel-palette-cards.css
src/styles/mobile-tree-controls.css
src/styles/calendar-mobile-category-buttons.css
```

---

## 12. Exportação

A exportação é client-side e usa `treeExport.ts`.

Contratos:

- PNG, PDF, Impressão e Área;
- captura a view ativa;
- ignora painel, header, bottom nav, overlay, loading e debug;
- preserva paleta, conectores, cards, título e filtros;
- limita capturas grandes;
- normaliza SVGs e cores incompatíveis.

Detalhes ficam em `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

---

## 13. Testes

Scripts esperados:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

Uso:

- build para qualquer mudança relevante;
- Vitest para utils/modelos/contratos;
- Playwright para rotas, guards e smoke test;
- QA manual para layout, mobile, paletas, exportação e fluxos autenticados.

---

## 14. Dívidas arquiteturais conhecidas

| ID | Dívida | Direção |
|---|---|---|
| ARCH-001 | ausência de CI obrigatório | criar workflow de build/testes |
| ARCH-002 | `Home.tsx` concentra estado e efeitos demais | extrair hooks/domínios por etapas |
| ARCH-003 | `SidebarPanelTabs.tsx` mantém nome histórico | renomear apenas em refatoração própria |
| ARCH-004 | legado ReactFlow/Dagre ainda existe | remover somente após auditoria de imports |
| ARCH-005 | limpeza DOM em `src/main.tsx` para fallback vital mobile | migrar para solução no componente |
| TREE-003 | cônjuges de `pais`/Geração 4 pendentes na horizontal | corrigir em frente de código autorizada |

As pendências vivas ficam em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

---

## 15. Critérios para mudança arquitetural

Antes de alterar arquitetura:

1. registrar decisão em `docs/DECISOES_ARQUITETURAIS.md`;
2. atualizar documento funcional afetado;
3. atualizar inventário técnico;
4. atualizar regras de não regressão;
5. rodar validações;
6. não misturar mudança arquitetural com grande alteração visual sem necessidade.

Critérios mínimos:

```bash
git diff --check
npm run build
npm test
npm run test:e2e
```

## 15. Consolidação 2026-06-22 — arquitetura mobile e dívidas críticas

### 15.1 Renderização horizontal atual

A horizontal atual deve ser tratada como versão filtrada:

```txt
/mapa-familiar-horizontal desktop/tablet -> DesktopFamilyHorizontalMapFilteredView
/mapa-familiar-horizontal mobile         -> MobileFamilyHorizontalMapFilteredView
```

Os nomes antigos `DesktopFamilyHorizontalMapView` e `MobileFamilyHorizontalMapView` podem existir como histórico, dependência interna ou documentação antiga, mas não devem ser usados como matriz canônica sem nova auditoria.

### 15.2 Arquitetura mobile composta

A versão mobile de `/mapa-familiar` não é apenas um componente React isolado. O comportamento vigente depende de:

- `MobileFamilyTreeView`;
- `MobileFamilyMapToolbar`;
- `HomeMobileNav`;
- scripts auxiliares `mobileFamilyTree*` e `mobileFamilyMap*` carregados no `index.html`;
- CSS escopado em `src/styles/`;
- atributos como `data-mobile-family-tree-root`, `data-mobile-family-tree-stage`, `data-mobile-family-tree-screen`, `data-tree-export-ignore`.

Regra arquitetural:

```txt
Não remover ou substituir script mobile global sem documentar:
rota afetada,
seletor raiz,
atributo de escopo,
risco de MutationObserver,
risco de touch/swipe,
QA mínimo em Safari/iOS.
```

### 15.3 Exportação mobile

A toolbar principal mobile não expõe `Exportar` como item fixo. A exportação pode existir em painel/popup auxiliar e continua sujeita ao contrato de `data-tree-export-ignore`.

Nenhum overlay, toolbar, modal, painel completo, popover, bottom nav, loading ou debug deve entrar no canvas exportado.

### 15.4 IA e privacidade

A arquitetura server-side da IA deve preservar:

- `OPENAI_API_KEY` fora do frontend;
- contexto mínimo necessário;
- nenhum envio de service role, tokens ou secrets;
- nenhum envio padrão de telefone, endereço, WhatsApp ou rede social sem regra explícita de privacidade;
- nenhuma inferência genealógica sensível por nome/sufixo quando o grafo não sustenta a resposta.

### 15.5 Onboarding e fatos históricos

Após a frente de fatos históricos, arquivos sem anexo devem ser tratados como registros históricos textuais, não como objetos de Storage. Qualquer dependência de `url`, `storage_bucket`, `storage_path` ou `mime_type` obrigatórios deve ser resolvida por migration antes de deploy do frontend dependente.
