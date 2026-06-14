# Plano de próximos passos — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: plano vivo após ajustes nas views oficiais, painel desktop, modal mobile, paletas, calendário mobile, cônjuges, avatares e horizontal mobile.

---

## Objetivo

Este documento registra apenas:

- pendências reais;
- QA visual ou funcional ainda aberto;
- divergências entre documentação e implementação;
- decisões futuras que exigem validação;
- pontos que não devem ser tratados como concluídos sem teste real;
- ações de refatoração ou produto que não pertencem aos guias canônicos.

O estado implementado fica em:

```txt
docs/GUIA_IMPLEMENTACOES.md
docs/BASELINE_PRODUTO_ATUAL.md
```

---

## 1. Situação atual das views

| View | Rota | Estado |
|---|---|---|
| Árvore Familiar Vertical | `/mapa-familiar` | Implementada; rota default de `/`; usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile. |
| Mapa Genealógico Horizontal | `/mapa-familiar-horizontal` | Implementada; usa `DesktopFamilyHorizontalMapView` no desktop/tablet e `MobileFamilyHorizontalMapView` no mobile, com uma geração por tela no mobile. |
| Calendário Familiar | `/calendario-familiar` | Implementado; filtros mobile compactos com 5 categorias em uma linha. |
| Minha Árvore | `/minha-arvore` | Removida como view ativa. |
| Genealogia | `/genealogia` | Removida como rota ativa. |
| Visão Completa | `/visao-completa` | Removida como rota ativa. |
| Edição do membro | `/minha-arvore/editar` | Vigente; rota protegida de edição de perfil/árvore do membro. |

Estado técnico consolidado:

- `/` redireciona para `/mapa-familiar`;
- `TreeViewMode` contém apenas duas views oficiais;
- `TreeHomeShell` envolve as rotas de árvore;
- painel desktop/mobile foi simplificado e não usa mais a barra `Filtros | Legendas | Ações`;
- modal mobile possui contrato próprio: Vertical/Horizontal, Cores, Grupos, Destacar e Filtros;
- busca e favoritos apontam para rotas atuais;
- aliases antigos são keywords, não rotas ativas;
- exportação foi preservada para as duas views oficiais no painel completo/desktop;
- paletas mobile foram alinhadas ao desktop;
- cards de painel desktop passaram a seguir o vocabulário visual da árvore;
- calendário mobile usa 5 botões em uma linha com bolinha colorida acima do título;
- artefatos locais e backups devem permanecer removidos/ignorados no Git.

---

## 2. Pendências abertas

| ID | Área | Tipo | Ação necessária | Status |
|---|---|---|---|---|
| QA-001 | `/mapa-familiar` | QA visual/manual | Validar alinhamento panorâmico, conectores, grupos laterais, modo painel colapsado, centralização, colisões, margens, exportação e paletas com dados reais. | Aberto |
| QA-002 | `/mapa-familiar-horizontal` | QA visual/manual | Validar colunas ativas, colunas vazias ocultadas, cônjuges adjacentes, conectores casal → filhos, distribuição de troncos, filtros e exportação. | Aberto |
| QA-003 | Pets | QA funcional | Confirmar se `directRelativeFilters.pets` e `personFilters.pets` cobrem corretamente grupo Pets e status/tipo nas duas views. | Aberto |
| QA-004 | Horizontal mobile | QA visual/funcional | Validar botões `Ger 1/Ger 2/Ger 3`, swipe lateral, ausência de scroll horizontal manual, scroll vertical por geração, conectores, safe area e retorno ao estado inicial. | Aberto |
| QA-005 | Mobile Safari/iOS | QA visual | Validar posição da barra, botão de controle e comportamento dos filtros em iOS/Safari nos breakpoints 320, 375, 390 e 430px. | Aberto |
| QA-006 | Exportação | QA funcional | Validar PNG, PDF, impressão e Área em `/mapa-familiar` e `/mapa-familiar-horizontal`, incluindo título, loading, conectores, paletas, avatares e núcleos conjugais adicionais. | Aberto |
| QA-007 | Documentação cruzada | Documentação/QA | Conferir links cruzados após aplicar todos os documentos revisados no repo. | Aberto |
| QA-008 | Issue #8 | Operação | Registrar comentário final com resumo da frente e fechar a issue se não houver nova pendência. | Aberto |
| QA-009 | Paletas mobile | QA visual | Validar as paletas Branca, Azul, Laranja e Marrom no mobile contra a referência desktop, nas duas rotas da árvore. | Aberto |
| QA-010 | Avatares e datas | QA visual | Confirmar `User` para pessoas sem foto, `PawPrint` para pets e ausência de `Nascimento não informado` nos cards mobile. | Aberto |
| QA-011 | Modal mobile | QA funcional/visual | Validar título `Controles`, botão X, ausência de subtítulo, Vertical/Horizontal, Cores, Grupos, Destacar, filtros em 4 colunas e ausência de Zoom/Exportar/Restaurar. | Aberto |
| QA-012 | Conectores mobile | QA visual | Validar mobile vertical contra referência desktop e mobile horizontal até o fim de cards e linhas conectoras visíveis. | Aberto |
| QA-013 | Painel desktop | QA visual | Validar cards de Grupos e Filtros com gradiente/paleta coerente em white, visual, orange e brown. | Aberto |
| QA-014 | Calendário mobile | QA visual | Validar 5 botões em uma linha, bolinha acima do título, sem quebra/overflow em 320, 375, 390 e 430px. | Aberto |
| QA-015 | Cônjuges Geração 4 | QA funcional/visual | Validar em `/mapa-familiar-horizontal` que cônjuges da Geração 4/Pais aparecem quando filtro `Cônjuges` está ativo. | Aberto |
| QA-016 | Núcleos conjugais adicionais | QA funcional/visual | Validar em `/mapa-familiar` pessoa central com mais de um cônjuge e filhos associados a outro relacionamento. | Aberto |
| DBG-001 | Visualizar como | Debug/produto | Decidir se o dropdown temporário `Visualizar como...` fica, é removido ou protegido por flag/admin. | Aberto |
| REF-001 | `Home.tsx` | Refatoração | Extrair responsabilidades de carregamento, filtros, exportação e painel em hooks/components menores. | Backlog |
| REF-002 | `SidebarPanelTabs.tsx` | Refatoração | Renomear para nome neutro, como `TreeControlPanel`, já que não renderiza mais tabs. | Backlog |
| REF-003 | ReactFlow/Dagre | Refatoração técnica | Auditar se o stack legado ainda é necessário e planejar remoção em frente própria. | Backlog |
| REF-004 | Horizontal shared model | Refatoração técnica | Extrair view model compartilhado entre `DesktopFamilyHorizontalMapView` e `MobileFamilyHorizontalMapView`, evitando divergência de hierarquia. | Backlog |
| DOC-001 | Docs funcionais | Documentação | Atualizar também `MAPA_FAMILIAR_VIEW.md`, `ARVORE_LEGENDAS_CONECTORES_PAINEL.md` e `CALENDARIO_FAMILIAR.md` com os contratos recentes. | Aberto |
| CI-001 | CI | Infra | Criar GitHub Actions para build, Vitest e Playwright em PR/push. | Backlog |
| DEP-001 | Dependências | Manutenção | Revisar `pnpm.overrides` e consistência npm/pnpm em frente separada. | Backlog |

Regras:

- não duplicar esta tabela em outros documentos;
- documentos funcionais podem citar contexto, mas o controle de pendências fica aqui;
- fechar apenas após validação real, decisão explícita ou commit de correção;
- alteração de schema exige migration e atualização operacional.

---

## 3. Itens fechados, obsoletos ou reclassificados

| ID | Frente | Resultado | Status |
|---|---|---|
| EXP-001 | `/mapa-horizontal` | Rota experimental removida. | Obsoleto/removido |
| EXP-002 | `/visao-completa-teste` | Rota experimental removida. | Obsoleto/removido |
| EXP-003 | Botão Horizontal → `/visao-completa` | Substituído por `/mapa-familiar-horizontal`. | Concluído |
| ROT-001 | `/minha-arvore` como view | Removida do roteamento ativo. | Concluído |
| ROT-002 | `/genealogia` | Removida do roteamento ativo. | Concluído |
| ROT-003 | `/visao-completa` | Removida do roteamento ativo. | Concluído |
| HMAP-001 | Cônjuges na horizontal | Linha/conectores de cônjuges preservados tecnicamente. | Concluído tecnicamente; QA aberto |
| HMAP-002 | Casal → filhos | Tronco e ramais preservados tecnicamente. | Concluído tecnicamente; QA aberto |
| HMAP-003 | Colunas vazias | Colunas sem cards visíveis ocultadas. | Concluído tecnicamente; QA aberto |
| HMAP-004 | Paleta mobile horizontal | Corrigidos fallbacks de paleta no mobile horizontal. | Concluído tecnicamente; QA aberto |
| MOB-001 | Toggle Vertical/Horizontal mobile antigo | Substituído pelo modal de controles. | Concluído |
| MOB-002 | Botão de controle mobile | Alinhado às views atuais. | Concluído tecnicamente; QA iOS aberto |
| MOB-003 | Horizontal mobile por geração | `MobileFamilyHorizontalMapView` preservado. | Concluído tecnicamente; QA aberto |
| MOB-004 | Modal mobile reduzido | Modal sem Zoom, Restaurar e Exportar; com Cores, Grupos, Destacar, Filtros e Vertical/Horizontal. | Concluído tecnicamente; QA aberto |
| MOB-005 | Paletas mobile | Mobile passou a espelhar desktop nas paletas da árvore. | Concluído tecnicamente; QA aberto |
| PANEL-001 | Barra `Filtros | Legendas | Ações` | Removida/simplificada no painel atual. | Concluído |
| PANEL-002 | Cards de painel desktop | Cards passaram a seguir vocabulário visual da paleta ativa. | Concluído tecnicamente; QA aberto |
| SEARCH-001 | Busca/favoritos da horizontal | `/mapa-familiar-horizontal` incluída em busca/favoritos. | Concluído |
| AVATAR-001 | Avatares sem foto | Padronização em `User`; pets em `PawPrint`. | Concluído tecnicamente; QA aberto |
| CAL-001 | Categorias mobile | Botões de categorias em uma linha com bolinha acima do título. | Concluído tecnicamente; QA aberto |
| CLEAN-001 | Componentes órfãos | Removidos componentes sem uso. | Concluído |
| CLEAN-002 | Resolver legado | `relationshipResolverService.ts` removido. | Concluído |
| HYGIENE-001 | `test-results/` | Ignorado no `.gitignore`. | Concluído |
| HYGIENE-002 | `backups/` e `.env*.save` | Ignorados; backup/env local removidos do versionamento. | Concluído |
| DOC-000 | Docs do painel | Atualizadas para refletir painel sem abas e modal mobile. | Concluído nesta revisão |

---

## 4. QA prioritário

### 4.1 Árvore Familiar Vertical

Rota:

```txt
/mapa-familiar
```

Breakpoints:

```txt
1366x768
1440x900
1536x864
1920x1080
768px a 1023px
320px
375px
390px
430px
```

Checklist:

- [ ] abre como view padrão a partir de `/`;
- [ ] título `Árvore Familiar de {nome}`;
- [ ] botão Horizontal navega para `/mapa-familiar-horizontal`;
- [ ] painel desktop não corta controles;
- [ ] modal mobile tem apenas controles essenciais;
- [ ] cônjuge principal aparece;
- [ ] cônjuges ancestrais aparecem;
- [ ] segundo núcleo conjugal aparece quando há dados;
- [ ] filhos de outro relacionamento são agrupados corretamente;
- [ ] cônjuges colaterais dependem de filtro;
- [ ] filtro Pets funciona;
- [ ] `Destacar > Linhas` altera conectores;
- [ ] `Destacar > Grupos` não quebra layout;
- [ ] cards mobile não exibem `Nascimento não informado`;
- [ ] bordas de grupos mobile seguem a paleta;
- [ ] exportação preserva título, cards, conectores e paleta.

### 4.2 Mapa Genealógico Horizontal

Rota:

```txt
/mapa-familiar-horizontal
```

Checklist:

- [ ] título `Mapa Genealógico de {nome}`;
- [ ] colunas por geração aparecem corretamente;
- [ ] colunas vazias são ocultadas;
- [ ] cônjuges ficam adjacentes;
- [ ] cônjuges da Geração 4 aparecem com filtro `Cônjuges`;
- [ ] conectores casal → filhos são coerentes;
- [ ] filtros afetam cards esperados;
- [ ] fundo/paleta seguem desktop;
- [ ] mobile não cai em fallback azul em paleta laranja/marrom/branca;
- [ ] Vertical retorna para `/mapa-familiar` preservando query;
- [ ] exportação não corta colunas.

### 4.3 Mobile

Checklist:

- [ ] `/mapa-familiar` mobile mantém Paterno/Central/Materno;
- [ ] `/mapa-familiar-horizontal` mobile usa botões `Ger`;
- [ ] swipe lateral não conflita com scroll vertical;
- [ ] não há scroll horizontal manual na horizontal mobile;
- [ ] scroll vertical vai até cards e conectores visíveis;
- [ ] modal de controles abre/fecha;
- [ ] body destrava após fechar modal;
- [ ] bottom nav não cobre controles;
- [ ] safe area iOS está correta;
- [ ] botão de controles fica alinhado à barra de geração;
- [ ] paletas white/visual/orange/brown são coerentes com desktop;
- [ ] cards sem chave de paleta recebem fallback coerente.

### 4.4 Modal mobile

Validar:

- [ ] título `Controles`;
- [ ] subtítulo removido;
- [ ] botão X fecha;
- [ ] Vertical/Horizontal visíveis;
- [ ] Cores visível;
- [ ] Grupos visível;
- [ ] Destacar visível;
- [ ] filtros em 4 colunas;
- [ ] grupos só aparecem ao clicar em `Grupos`;
- [ ] Zoom/Restaurar/Exportar ausentes.

### 4.5 Paletas, painel e avatares

Validar nas duas views e nos dois ambientes:

- [ ] paleta Branca igual ao desktop;
- [ ] paleta Azul igual ao desktop;
- [ ] paleta Laranja igual ao desktop;
- [ ] paleta Marrom igual ao desktop;
- [ ] cards, bordas, textos e conectores mudam juntos;
- [ ] painel desktop usa gradiente/paleta dos cards;
- [ ] pessoa sem foto usa `User`;
- [ ] pet usa `PawPrint`;
- [ ] fotos reais continuam aparecendo;
- [ ] exportação preserva avatares.

### 4.6 Calendário familiar mobile

Rota:

```txt
/calendario-familiar
```

Breakpoints:

```txt
320px
375px
390px
430px
```

Checklist:

- [ ] 5 botões aparecem em uma linha;
- [ ] bolinha colorida aparece acima do título;
- [ ] títulos ficam em uma linha;
- [ ] sem overflow horizontal;
- [ ] `Aniversário` não quebra;
- [ ] `Falecimento` não quebra;
- [ ] card do mês permanece estável;
- [ ] calendário mensal não é afetado pelos estilos dos botões.

### 4.7 Exportação

Testar nas duas views:

- [ ] Área → PNG;
- [ ] Área → PDF;
- [ ] Área → Imprimir;
- [ ] Imagem/PNG;
- [ ] PDF;
- [ ] Imprimir.

Verificar:

- [ ] título aparece;
- [ ] painel não aparece;
- [ ] header não aparece;
- [ ] bottom nav não aparece;
- [ ] modal/debug não aparece;
- [ ] overlay/loading não aparece;
- [ ] SVGs dos cards não viram quadrados escuros;
- [ ] conectores aparecem;
- [ ] paleta ativa é respeitada;
- [ ] filtros ativos são respeitados;
- [ ] núcleos conjugais adicionais são capturados quando visíveis.

---

## 5. Critério para fechar a Issue #8

Fechar a issue quando:

- [ ] docs revisadas forem aplicadas no repo;
- [ ] build passar;
- [ ] unit tests passarem;
- [ ] E2E passar;
- [ ] QA mobile essencial for registrado;
- [ ] `git status --short` ficar limpo;
- [ ] comentário final registrar commits e escopo concluído.

Comentário sugerido:

```md
Frente concluída na main.

Resumo:
- Mantidas apenas as views `/mapa-familiar` e `/mapa-familiar-horizontal`.
- Preservada `/minha-arvore/editar`.
- Removidas views antigas `/minha-arvore`, `/genealogia` e `/visao-completa`.
- Painel desktop simplificado sem `Filtros | Legendas | Ações`.
- Modal mobile específico com Vertical/Horizontal, Cores, Grupos, Destacar e Filtros.
- Busca/favoritos alinhados às rotas atuais.
- Paletas mobile alinhadas ao desktop.
- Cards de painel desktop alinhados ao visual da árvore.
- Avatares padronizados: `User` para pessoas sem foto e `PawPrint` para pets.
- Calendário mobile com 5 categorias em uma linha e bolinha acima do título.
- Horizontal revisada para cônjuges e paletas mobile.

Validações:
- build:
- unit:
- e2e:
- QA manual:
```

---

## 6. Próximas frentes recomendadas

### Frente A — QA visual real

Prioridade alta.

Escopo:

```txt
/mapa-familiar
/mapa-familiar-horizontal
/calendario-familiar
mobile iOS/Safari
desktop 1366/1440
paletas
exportação
```

### Frente B — Documentos funcionais

Prioridade alta.

Atualizar:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/funcionalidades/CALENDARIO_FAMILIAR.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
docs/REGRAS_DE_NAO_REGRESSAO.md
```

### Frente C — Refatoração de `Home.tsx`

Prioridade média.

Extrair:

```txt
useTreeDataLoader
useTreeFilters
useTreeExportActions
useTreeDebugViewer
TreeControlPanel
```

### Frente D — Modelo compartilhado da horizontal

Prioridade média.

Objetivo:

```txt
Evitar divergência entre DesktopFamilyHorizontalMapView e MobileFamilyHorizontalMapView.
```

### Frente E — Remoção planejada de legado ReactFlow

Prioridade baixa/média.

Não iniciar sem inventário de imports, plano de rollback e QA de exportação.

---

## 7. Comandos antes de fechar qualquer lote

```bash
npm run build
npm test
npm run test:e2e
git diff --check
git status --short
```
