# Guia de implementações — Árvore Família

> Última revisão: 2026-06-22
> Local canônico: `docs/GUIA_IMPLEMENTACOES.md`
> Projeto: `tuliust/arvorefamilia`
> Tipo: guia de implementação vigente
> Status: revisado contra o código atual para diferenciar implementado, pendente e tensão documental em mapas mobile, exportação, vínculos, pets, IA e fatos históricos.

---

## 1. Objetivo

---

## Atualização crítica — 2026-06-22

Esta revisão separa **estado implementado no código atual** de **decisão/pendência documental**.

Estado observado no código atual:

- `HomeTreeSection.tsx` usa `DesktopFamilyHorizontalMapFilteredView` e `MobileFamilyHorizontalMapFilteredView` na horizontal.
- `MobileFamilyMapToolbar` expõe `Formato`, `Cor`, `Filtros`, `Zoom` e `+`.
- `HomeMobileNav` mantém handlers de exportação mobile e o painel completo aberto pelo `+` possui ação `Salvar`.
- `SidebarPanelTabs mobileControls`, usado pelo modal legado `Controles`, ainda renderiza `Exportar`. Portanto, a remoção de Exportar do modal mobile é pendência de decisão/código, não comportamento garantido.
- `Home.tsx` ainda mantém `Visualizar como...` no header/painel para QA/troca de pessoa central.
- O `index.html` carrega scripts recentes de mapa mobile, incluindo Zoom visual, lock de descendentes, cônjuges estendidos, filtros mobile, mapa completo e mosaico.
- A frente `/meus-vinculos` deve ser considerada consolidada com **Pets**, **Cadastrado/Pré-cadastrado** e regra de um cônjuge ativo.
- Fatos históricos sem arquivo só devem ser considerados implementados após confirmação do commit/migration correspondente em `supabase/migrations/`.


Este guia descreve as frentes implementadas no projeto e os arquivos principais que sustentam cada comportamento.

Não é objetivo deste documento:

- manter inventário exaustivo de todos os arquivos;
- duplicar checklists de QA;
- registrar histórico de decisões antigas;
- tratar pendência como comportamento entregue.

Para esses temas, use:

```txt
docs/INVENTARIO_TECNICO.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/DECISOES_ARQUITETURAIS.md
docs/PLANO_PROXIMOS_PASSOS.md
```

---

## 2. Estado implementado em síntese

| Frente | Estado |
|---|---|
| Views oficiais da árvore | Implementadas em `/mapa-familiar` e `/mapa-familiar-horizontal`. |
| Redirect raiz | Implementado para `/mapa-familiar`, preservando query string. |
| Guards | Implementados por `TreeAccessRoute`, `MemberRoute` e `ProtectedRoute`. |
| Shell da árvore | Implementado em `Home` e `HomeTreeSection`. |
| Painel desktop | Implementado sem barra de abas antigas. |
| Modal mobile de controles | Implementado com conjunto reduzido de ações. |
| Exportação | Implementada nas duas views oficiais. |
| Paletas | Implementadas com quatro chaves oficiais. |
| Busca global | Implementada com páginas vigentes e aliases antigos apontando para rotas atuais. |
| Favoritos | Implementados para páginas e entidades suportadas. |
| Calendário familiar | Implementado com filtros/categorias e integração Google Agenda quando configurada. |
| Perfil e área de membro | Implementados, incluindo onboarding condicional para pessoa viva/falecida e revisão final editável. |
| Mini Bio e Curiosidades com IA | Implementados em `/meus-dados`, com modo padrão e modo nostálgico/memorial. |
| Revisão de vínculos familiares | Implementada em `/meus-vinculos`, com busca de pessoa existente, criação manual, estados de análise e solicitação de controle de perfil. |
| Fórum | Implementado. |
| Notificações | Implementadas; no fluxo de pessoa falecida são desativadas automaticamente e `/preferencias` é pulada. |
| Admin | Implementado. |

---

## 3. Rotas, guards e navegação

Arquivos principais:

```txt
src/app/routes.tsx
src/app/components/TreeAccessRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/FamilyTree/treeViewMode.ts
```

Rotas de árvore implementadas:

| Rota | Guard | Comportamento |
|---|---|---|
| `/` | `TreeAccessRoute` | Redireciona para `/mapa-familiar`. |
| `/mapa-familiar` | `TreeAccessRoute` | View vertical principal. |
| `/mapa-familiar-horizontal` | `TreeAccessRoute` | View horizontal/genealógica. |
| `/busca` | `TreeAccessRoute` | Busca global autenticada. |

Rotas de membro implementadas:

```txt
/minha-arvore/editar
/meus-dados
/meus-vinculos
/arquivos-historicos
/preferencias
/revisao-dados
/vincular-perfil
/pessoa/:id
/pessoas/:id
/calendario-familiar
/meus-favoritos
/notificacoes
/ajustar-notificacoes
/forum/*
```

Rotas admin implementadas:

```txt
/admin
/admin/login
/admin/dashboard
/admin/home
/admin/pessoas
/admin/relacionamentos
/admin/importacao
/admin/migrar-dados
/admin/diagnostico
/admin/integridade
/admin/atividades
/admin/notificacoes
/admin/solicitacoes-vinculos
```

Rotas removidas como views:

```txt
/minha-arvore
/genealogia
/visao-completa
```


### 3.1 Fluxo de cadastro do membro

Implementado como onboarding protegido por `MemberRoute`.

#### Pessoa viva

| Etapa | Rota | Página | Componente de etapa |
|---|---|---|---|
| 1 | `/meus-dados` | `MeusDados` | `MemberOnboardingSteps activeStep={1}` |
| 2 | `/meus-vinculos` | `MeusVinculos` | `MemberOnboardingSteps activeStep={2}` |
| 3 | `/arquivos-historicos` | `ArquivosHistoricosPage` | `MemberOnboardingSteps activeStep={3}` |
| 4 | `/preferencias` | `PreferenciasPage` | `MemberOnboardingSteps activeStep={4}` |
| 5 | `/revisao-dados` | `RevisaoDados` | `MemberOnboardingSteps activeStep={5}` |

#### Pessoa falecida

Para pessoa falecida, a etapa de Preferências não faz parte do fluxo operacional.

| Etapa visual | Rota | Página | Comportamento |
|---|---|---|---|
| 1 | `/meus-dados` | `MeusDados` | dados pessoais e falecimento, sem contato/redes |
| 2 | `/meus-vinculos` | `MeusVinculos` | vínculos familiares |
| 3 | `/arquivos-historicos` | `ArquivosHistoricosPage` | arquivos; ao continuar, navega direto para revisão |
| 4 | `/revisao-dados` | `RevisaoDados` | revisão final sem notificações/permissões |

Acesso direto a `/preferencias` para pessoa falecida deve redirecionar para `/revisao-dados`.

#### Responsabilidades consolidadas

#### Fatos e arquivos históricos — estado de implementação

Não tratar fatos/memórias sem arquivo como baseline implementada sem verificar:

```txt
src/app/pages/ArquivosHistoricosPage.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/services/arquivosHistoricosService.ts
supabase/migrations/*historical*
```

Contrato desejado para a frente:

- título: `Fatos e Arquivos Históricos`;
- permitir fato/memória com título ou descrição, sem arquivo obrigatório;
- upload de imagem/PDF continua opcional e funcional;
- campos de arquivo devem aceitar `null` no banco;
- `participante_ids` não deve virar obrigatório sem migration/backfill.


- `/meus-dados`: dados pessoais, estado vital, Mini Bio, Curiosidades, assistente de IA e, quando aplicável, contato, endereço e redes sociais;
- `/meus-vinculos`: revisão guiada de vínculos familiares, busca de pessoa existente, criação manual, remoção/desfazer, solicitação de controle de perfil, badges por status e botão final no rodapé;
- `/arquivos-historicos`: arquivos/documentos da pessoa vinculada, pré-preenchimento por categoria e rascunho local;
- `/preferencias`: notificações e permissões de visualização apenas para pessoa viva;
- `/revisao-dados`: revisão final em layout de perfil, edição inline e finalização.


#### Regras implementadas em `/meus-dados` para Mini Bio e Curiosidades

- botão de IA abre modal em 10 etapas;
- campos `minibio` e `curiosidades` têm limite de 300 caracteres;
- geração preenche os dois campos simultaneamente;
- usuário pode editar os textos antes de salvar;
- modo padrão gera textos em primeira pessoa;
- tom **Nostálgico** ativa modo memorial, com terceira pessoa, passado e tom saudosista;
- geração usa `POST /api/ai` e não salva automaticamente.

#### Regras implementadas em `/meus-vinculos`

- layout em largura total, sem painel lateral de resumo;
- card superior usa `Familiares de [Primeiro Nome]`;
- cards-resumo funcionam como âncoras para `Pais`, `Filhos`, `Pets`, `Cônjuges` e `Irmãos`;
- pluralização usa `Nenhum vínculo`, `1 vínculo` e `N vínculos`;
- pessoas sem usuário/auth vinculado exibem `Pré-cadastrado`; pessoas com vínculo de usuário/auth exibem `Cadastrado`;
- vínculos novos/alterados exibem `Em análise`;
- remoções exibem `Remoção em análise` e permanecem visíveis para desfazer;
- solicitações de controle exibem `Controle em análise`;
- busca de pessoa existente ocorre antes da criação manual para reduzir duplicidade;
- cards de filhos humanos usam `Filho`, `Filha` ou `Filho(a)` conforme gênero disponível; pets ficam em grupo próprio e não devem ser contados como filhos humanos;
- dropdown `Outro pai/mãe` tenta pré-selecionar outro responsável conhecido.

#### Regras implementadas para pessoa falecida

#### Regras implementadas/esperadas em `/meus-vinculos` após Prompt 4

- `Pets` é grupo próprio e não deve aparecer dentro de `Filhos`.
- Pessoa é pet quando `humano_ou_pet === 'Pet'`.
- Se o service retornar pets dentro de `relationships.filhos`, a UI deve separar:
  - filhos humanos: `filhos.filter(p => p.humano_ou_pet !== 'Pet')`;
  - pets: `filhos.filter(p => p.humano_ou_pet === 'Pet')`.
- Card de pet não usa rótulos como `Alterar mãe`/`Alterar pai`; quando necessário, usar `Outros tutores`.
- Ao criar pet localmente pela seção de Pets, preencher `humano_ou_pet: 'Pet'`.
- Cônjuges: apenas um relacionamento conjugal ativo por vez.
- Se a pessoa em revisão ou o cônjuge for falecido, o relacionamento deve ficar inativo e o controle de ativo deve ser protegido/desabilitado.
- Drafts de `sessionStorage` antigos, sem chave `pets`, devem continuar funcionando.


- ocultar **Cidade de residência**;
- exibir **Dia ou Ano de Falecimento** e **Local de falecimento**;
- ocultar **Contato, endereço e redes sociais**;
- desativar notificações;
- desativar mensagens/WhatsApp;
- ativar permissões de visualização;
- ocultar Preferências no stepper;
- ocultar boxes de contato/notificações/permissões na revisão final.

#### Regras implementadas na revisão final

- revisão estruturada em cards/boxes;
- botões compactos de lápis para edição inline;
- **Finalizar e acessar árvore** no topo, ao lado de **Editar perfil**;
- mini bio removida do topo e mantida no box próprio;
- rodapé antigo removido;
- badges por gênero em pessoa principal e familiares;
- badge **Em análise** para vínculo pendente/local.

---

## 4. Shell da árvore

Arquivos:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/SidebarPanelTabs.tsx
```

Implementado:

- carregamento de pessoas e relacionamentos;
- resolução de pessoa central;
- controle de filtros e paletas;
- alternância Vertical/Horizontal;
- painel lateral desktop;
- modal mobile de controles;
- exportação por ações disparadas pelo painel;
- favoritos da página atual;
- preservação de `location.search`;
- debug temporário `Visualizar como...`, quando presente.

Dívida técnica:

- `Home.tsx` concentra responsabilidades demais;
- `SidebarPanelTabs.tsx` mantém nome histórico apesar de não representar mais abas persistentes.

---

## 5. Views oficiais da árvore

Matriz implementada:

| View | Desktop/tablet | Mobile |
|---|---|---|
| `/mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapFilteredView` | `MobileFamilyHorizontalMapFilteredView` |

### `/mapa-familiar`

Implementado:

- canvas vertical principal;
- grupos familiares;
- filtros de relações diretas;
- filtros por status/tipo;
- conectores;
- paletas;
- pets;
- cônjuge principal;
- núcleos conjugais adicionais da pessoa central quando existem dados;
- exportação;
- zoom/restauração no desktop;
- versão mobile segmentada.

### `/mapa-familiar-horizontal`

Implementado:

- organização por gerações;
- ocultação de colunas vazias;
- cônjuges adjacentes conforme grupos suportados;
- conectores casal/filhos;
- exportação;
- versão mobile filtrada com uma geração por tela;
- botões `Ger X`, swipe lateral e scroll vertical.

Pendência relevante:

```txt
Cônjuges de pais/Geração 4 ainda não devem ser tratados como implementados.
Ver TREE-003 no docs/PLANO_PROXIMOS_PASSOS.md.
```

---

## 6. Painel, filtros e controles

Implementado no desktop:

```txt
Zoom +
Zoom -
Restaurar visualização
Vertical
Horizontal
Cores
Exportar
Destacar
Filtros de grupos
Filtros de status
```

Implementado no mobile:

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros de status
```

Removido da UI vigente:

```txt
Filtros | Legendas | Ações
```

Arquivos relacionados:

```txt
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
src/styles/tree-panel-palette-cards.css
```

---

## 7. Paletas, cards e CSS escopado

Paletas implementadas:

```txt
white
visual
orange
brown
```

Arquivos:

```txt
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-map-mobile-palettes.css
src/styles/tree-panel-palette-cards.css
```

Implementado:

- paleta ativa aplicada a canvas, cards, bordas, texto e conectores;
- correções mobile escopadas;
- painel desktop com cards coerentes com a paleta;
- avatares com foto real, `User` para pessoa sem foto e `PawPrint` para pet.

Atenção:

- CSS novo deve ser escopado por root, data attribute ou container;
- não usar alteração global de tema para resolver problema local da árvore.

---

## 8. Exportação

Arquivos:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapFilteredView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapFilteredView.tsx
```

Implementado:

- exportação por área;
- exportação PNG;
- exportação PDF;
- impressão;
- mensagens de loading;
- proteção contra captura grande demais;
- ignorar UI transitória com atributos de exportação.

Não implementado no modal mobile:

```txt
Exportar
```

Essa ausência é intencional.

---

## 9. Calendário familiar

Arquivos:

```txt
src/app/pages/CalendarioFamiliar.tsx
src/styles/calendar-mobile-category-buttons.css
```

Implementado:

- categorias visuais;
- filtros;
- layout mobile com 5 botões em linha quando o espaço permite;
- bolinha colorida acima do texto;
- título em uma linha;
- integração com Google Agenda quando ambiente/OAuth/secrets estão configurados.

Detalhes operacionais ficam em `docs/operacao/OAUTH_GOOGLE.md`.

---

## 10. Perfil, pessoas e área do membro

Arquivos principais:

```txt
src/app/pages/ArquivosHistoricosPage.tsx
src/app/pages/PreferenciasPage.tsx
src/app/components/member/MemberOnboardingSteps.tsx
src/app/pages/PersonProfile.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/VincularPerfil.tsx
src/app/components/person/
src/app/services/memberProfileService.ts
src/app/services/dataService.ts
```

Implementado:

- perfil de pessoa por `/pessoa/:id` e `/pessoas/:id`;
- retorno via `?voltar=` restrito a destinos seguros;
- edição de dados do membro por `/minha-arvore/editar`;
- dados pessoais, vínculos e solicitação de vínculo;
- componentes de perfil, arquivos, eventos e dados relacionados.

---

## 11. Fórum, favoritos e notificações

### Fórum

Arquivos:

```txt
src/app/pages/forum/
src/app/services/forumService.ts
```

Implementado:

- home do fórum;
- criação, edição e visualização de tópicos;
- respostas/comentários conforme service;
- favoritos e notificações quando integrados.

### Favoritos

Arquivos:

```txt
src/app/components/favorites/
src/app/services/favoritesService.ts
src/app/constants/favoritePages.ts
```

Implementado:

- favoritos de páginas oficiais;
- favoritos de pessoas/conteúdos suportados;
- atalhos para `/mapa-familiar` e `/mapa-familiar-horizontal`.

### Notificações

Arquivos:

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/services/userEngagementService.ts
```

Implementado:

- central de notificações;
- preferências;
- suporte a dispatch interno/e-mail conforme configuração.

---

## 12. Admin e operação

Rotas/admin implementadas:

```txt
/admin/*
```

Áreas principais:

- dashboard;
- home/settings;
- pessoas;
- relacionamentos;
- importação;
- migração de dados;
- diagnóstico;
- integridade;
- atividades;
- notificações;
- solicitações de vínculos.

Operação relacionada:

```txt
supabase/migrations/
supabase/functions/
scripts/
docs/operacao/
```

Regra operacional:

```txt
mudança visual ou documental não exige migration;
mudança de schema exige migration;
Edge Function/secrets/service role exigem documentação operacional.
```

---

## 13. Legado técnico preservado

Alguns arquivos com origem ReactFlow ou nomes históricos podem continuar no código por dependência técnica, tipos, compatibilidade ou helpers.

Exemplos:

```txt
FamilyTree.tsx
PersonNode.tsx
MarriageNode.tsx
GenealogySpouseEdge.tsx
OrthogonalChildEdge.tsx
buildTreeGraph.ts
layouts/directFamilyDistributedLayout.ts
layouts/genealogyColumnsLayout.ts
```

Regra:

```txt
Não remover legado ativo em limpeza documental.
Remoção de ReactFlow/legado exige frente própria, inventário de uso e testes.
```

---

## 14. Pendências não implementadas

Pendências conhecidas que não devem ser descritas como implementadas:

| ID | Pendência | Onde registrar |
|---|---|---|
| `TREE-003` | Verificar/corrigir cônjuges de pais/Geração 4 na horizontal. | `docs/PLANO_PROXIMOS_PASSOS.md` |
| `TREE-004` | Remover dependência de limpeza DOM para esconder fallbacks de datas no mobile. | `docs/PLANO_PROXIMOS_PASSOS.md` |
| `TREE-005` | Decidir destino do debug `Visualizar como...`. | `docs/PLANO_PROXIMOS_PASSOS.md` |
| `ARCH-002` | Clarificar responsabilidades transversais de `src/main.tsx`. | `docs/PLANO_PROXIMOS_PASSOS.md` |
| `MOB-*` | QA visual real de modal e horizontal mobile. | `docs/PLANO_PROXIMOS_PASSOS.md` |

---

## 15. Validação

Após alteração funcional:

```bash
git diff --check
npm run build
npm test
npm run test:e2e
```

Após alteração somente documental:

```bash
git diff --check
npm run build
```

Se a documentação alterar contratos de rotas, árvore, guards ou navegação, também rodar:

```bash
npm test
npm run test:e2e
```

<!-- IMPLEMENTACOES-CONSOLIDADAS-2026-06-18 -->
## Frentes recentes documentadas por status

### Confirmadas na `main`

#### Onboarding do membro

ReferÃªncia: `5ef555c`

Rotas principais:

- `/meus-dados`
- `/meus-vinculos`
- `/arquivos-historicos`
- `/preferencias`
- `/revisao-dados`

Resumo:

- regras condicionais para pessoa viva/falecida;
- revisÃ£o final em formato de perfil;
- ediÃ§Ã£o inline;
- rascunho local de arquivos histÃ³ricos;
- suporte visual/metadados locais para participantes em arquivos histÃ³ricos;
- limpeza de campos incompatÃ­veis no payload.

#### PadronizaÃ§Ã£o de formulÃ¡rios de pessoas

ReferÃªncia: `1b64790`

Rotas principais:

- `/minha-arvore/editar`
- `/admin/pessoas/:id/editar`
- `/admin/pessoas/nova`
- `/admin/pessoas/:id`

Resumo:

- componentes compartilhados em `src/app/components/person/`;
- labels alinhados ao onboarding;
- seÃ§Ãµes com Ã­cone e descriÃ§Ã£o;
- contexto de privacidade para membro/admin;
- reaproveitamento seletivo sem copiar o onboarding.

#### Admin Dashboard

ReferÃªncia: `b84d101`

Resumo:

- cards Membros, RelaÃ§Ãµes e Pendentes funcionam como botÃµes de navegaÃ§Ã£o;
- card MemÃ³ria permanece informativo enquanto nÃ£o houver rota definida.

#### Dropdown â€œVisualizar comoâ€

ReferÃªncia: `4fecf05`

Resumo:

- seletor movido para o header;
- opÃ§Ãµes ordenadas;
- nomes encurtados para primeiro e segundo nome;
- remoÃ§Ã£o do seletor flutuante/debug.

#### Ajustes mobile do onboarding

ReferÃªncia: `2627820`

Resumo:

- inputs mobile com fonte mÃ­nima de 16px para evitar auto-zoom;
- etapas do onboarding sem scroll horizontal;
- tooltips funcionais por toque;
- header mobile de `/meus-dados` sem aÃ§Ãµes laterais;
- refinamentos de espaÃ§amento e botÃµes no fluxo mobile.

### NÃ£o confirmadas

Frentes sem commit/merge/push confirmado devem permanecer em `PLANO_PROXIMOS_PASSOS.md`, nÃ£o no baseline.

<!-- RODADA2-IMPLEMENTACOES-2026-06-18 -->
## ImplementaÃ§Ãµes complementares â€” segunda rodada

### Frente: Ã¡rvore, painel e header

Arquivos/Ã¡reas citados no levantamento:

- src/app/pages/Home.tsx
- src/app/pages/home/HomeHeader.tsx
- src/app/pages/home/SidebarPanelTabs.tsx
- src/app/pages/home/DesktopTreeVisualizationPanel.tsx
- src/app/pages/home/FirstLoginTutorial.tsx
- src/styles/home-sidebar-unified.css

Contratos de implementaÃ§Ã£o:

- Header nÃ£o deve concentrar todos os controles da Ã¡rvore.
- O painel lateral Ã© o local preferencial para visualizaÃ§Ã£o, formato, grupos, estatÃ­sticas e seletor **Visualizar como**.
- Tour inicial/holofote devem apontar para elementos reais e nÃ£o para controles antigos.
- Scripts temporÃ¡rios nÃ£o devem ser versionados, salvo quando explicitamente necessÃ¡rio.

### Frente: mobile e pÃ¡ginas internas

Ãreas impactadas:

- /minha-arvore/editar
- /calendario-familiar
- /admin
- /meus-favoritos
- /notificacoes
- /mapa-familiar

Contratos:

- Melhorias mobile nÃ£o devem alterar regras de negÃ³cio.
- Busca/filtros devem ser compactos quando a tela for estreita.
- NotificaÃ§Ãµes devem priorizar um card limpo por item.
- Favoritar/desfavoritar deve usar metÃ¡fora consistente de estrela.
- Dicas ou modais automÃ¡ticos no mobile nÃ£o devem bloquear acesso ao sistema.

### Frente: Curiosidades

Arquivos/Ã¡reas citados:

- src/app/pages/curiosidades/*
- src/app/utils/geoDistance.ts
- src/app/services/memoryWallService.ts
- src/app/pages/home/DiscoverMoreFlow.tsx
- src/app/pages/home/DiscoverResultCard.tsx
- src/app/pages/MeusFavoritos.tsx
- supabase/migrations/20260618120000_create_family_memory_wall_posts.sql
- supabase/migrations/20260618123000_add_curiosity_discovery_favorites.sql

Contratos:

- CÃ¡lculos geogrÃ¡ficos devem usar utilitÃ¡rio compartilhado.
- Mural de lembranÃ§as Ã© persistente.
- Descobertas podem ser favoritedas e compartilhadas.
- A rota familiar usa coordenadas de cidades de residÃªncia atual quando disponÃ­veis.
- Quando coordenadas forem insuficientes, a UI deve cair para fallback textual, nÃ£o quebrar.

### Frente: toolbar mobile dos mapas

Arquivos citados:

- src/app/components/FamilyTree/MobileFamilyMapToolbar.tsx
- src/app/pages/home/HomeMobileNav.tsx
- src/app/pages/home/SidebarPanelTabs.tsx

Contratos:

- AÃ§Ãµes rÃ¡pidas ficam em popovers dedicados.
- O botÃ£o + abre painel mobile completo.
- Desktop/tablet nÃ£o devem ser afetados por refinamentos exclusivos de mobile.

## Atualização 2026-06-22 — Implementações finalizadas

## Levantamento consolidado — ciclo funcional 2026-06-22

### Commits confirmados no branch `feature/questionario-ia-vinculos-pets`

| Frente | Commit | Status | Resultado funcional |
|---|---:|---|---|
| Prompt 6A — mapa familiar, tour e painel | `5e64d74` | Build e push confirmados | Dropdown `Família de [Nome]`, contagem de `Cadastrados`, tour revisado e layout compacto desktop para árvore pequena. |
| Prompt 7A — questionário e geração de perfil | `4a1a995` | Build e push confirmados | Questionário persistido refinado; hash de geração só após geração concluída; contexto de IA sanitizado. |
| Prompt 7B — vínculos, pets e cônjuges | `c9a8f27` | Build e push confirmados | Pets separados de filhos; cônjuge ativo único no estado local; badges e solicitações pendentes preservados. |
| Prompt 7C — fatos e arquivos históricos | `6185b6d` | Build e push confirmados | Fatos sem arquivo integrados a `arquivos_historicos` e à timeline do perfil; migration para anexo opcional. |
| Prompt 7D — UX final de onboarding | `de4f60f` | Build e push confirmados | Questionário reduzido a 8 etapas, headers sem ações no onboarding, textos IA até 500 caracteres, títulos fora de containers e ajustes de rótulos. |

### Hotfix incorporado ao ciclo

- `MeusDados.tsx`: correção do `ReferenceError: MapPin is not defined` com import explícito de `MapPin` em `lucide-react`.
- O build posterior passou, indicando que o erro de runtime foi removido no estado final aplicado.

### Frentes consolidadas neste ciclo

1. **Mapa familiar desktop**
   - Dropdown do painel passa a priorizar a pessoa vinculada/visualizada e exibir `Família de [Nome]`.
   - Contagem de `Cadastrados` usa `user_person_links` como fonte conceitual.
   - Tour separa IA/datas importantes de favoritos.
   - Layout compacto para árvore pequena vertical desktop.

2. **Questionário de perfil e IA**
   - A pergunta inicial passa a ser `Qual é o seu estilo?`.
   - `Nostálgico` volta a ser apenas um tom; não define pessoa falecida.
   - O modo memorial depende do toggle `Você está escrevendo o perfil de uma pessoa falecida?`.
   - Removidas etapas 9 e 10.
   - Última etapa não exibe `Avançar`; fechamento ocorre por `Confirmar meus dados`.
   - Mini Bio e Curiosidades passam a aceitar até 500 caracteres.
   - IA deve gerar cerca de 400–450 caracteres por campo, sem iniciar necessariamente com o nome da pessoa.
   - IA pode considerar campos estruturados seguros: idade aproximada, nascimento/falecimento, profissão, vínculos e fatos históricos, sem dados sensíveis ou URLs/storage.

3. **Meus Vínculos**
   - Pets permanecem em grupo próprio, não em `Filhos`.
   - Pet criado manualmente usa `humano_ou_pet: 'Pet'`.
   - Estado local mantém no máximo um cônjuge ativo.
   - Removidos botões redundantes em estado vazio dos grupos.
   - `Sobre mim` e `Familiares de [Nome]` foram deslocados para fora dos cards, com hierarquia visual maior.
   - `Salvar textos` foi removido; textos são salvos no avanço da etapa.
   - Rótulo feminino de irmã passa a ser `Irmã` quando houver indicação de gênero feminino.

4. **Fatos e Arquivos Históricos**
   - Registro histórico pode existir com ou sem anexo.
   - Registro sem anexo é `Fato`/`Memória`; registro com imagem/PDF continua como `Arquivo`.
   - Timeline do perfil integra ambos.
   - `ano` ordena cronologicamente; sem `ano` fica ao final.
   - Storage continua opcional e só é acionado quando há upload real.

5. **Headers do onboarding**
   - Nas páginas `/meus-dados`, `/meus-vinculos`, `/arquivos-historicos`, `/preferencias` e `/revisao-dados`, o header não exibe ações à direita.
   - Mantém apenas ícone, título e subtítulo do lado esquerdo.

### Fora do escopo e preservado

- Scripts mobile de mapa familiar.
- `index.html`.
- Documentação mobile 3x3 como contrato já consolidado.
- Alterações adicionais de schema fora das migrations já aplicadas para questionário e fatos sem arquivo.
