# Plano de próximos passos — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Baseline revisada: `main` em `833108f`  
> Status: plano vivo após fechamento técnico da frente de rotas, painel, CSS, docs e higiene do repositório.

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
| Mapa Familiar Vertical | `/mapa-familiar` | Implementada; rota default de `/`; usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile. |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | Implementada; usa `DesktopFamilyHorizontalMapView` no desktop/tablet e `MobileFamilyHorizontalMapView` no mobile, com uma geração por tela no mobile. |
| Minha Árvore | `/minha-arvore` | Removida como view ativa. |
| Genealogia | `/genealogia` | Removida como rota ativa. |
| Visão Completa | `/visao-completa` | Removida como rota ativa. |
| Edição do membro | `/minha-arvore/editar` | Vigente; rota protegida de edição de perfil/árvore do membro. |

Estado técnico consolidado:

- `/` redireciona para `/mapa-familiar`;
- `TreeViewMode` contém apenas duas views oficiais;
- `TreeHomeShell` envolve as rotas de árvore;
- painel desktop/mobile foi simplificado e não usa mais a barra `Filtros | Legendas | Ações`;
- busca e favoritos apontam para rotas atuais;
- aliases antigos são keywords, não rotas ativas;
- exportação foi preservada para as duas views oficiais;
- artefatos locais e backups foram removidos/ignorados no Git;
- build, unit tests e E2E passaram na validação final.

---

## 2. Pendências abertas

| ID | Área | Tipo | Ação necessária | Status |
|---|---|---|---|---|
| QA-001 | `/mapa-familiar` | QA visual/manual | Validar alinhamento panorâmico, conectores, grupos laterais, modo painel colapsado, centralização, colisões, margens, exportação e paletas com dados reais. | Aberto |
| QA-002 | `/mapa-familiar-horizontal` | QA visual/manual | Validar colunas ativas, colunas vazias ocultadas, cônjuges adjacentes, conectores casal → filhos, distribuição de troncos, filtros e exportação. | Aberto |
| QA-003 | Pets | QA funcional | Confirmar se `directRelativeFilters.pets` e `personFilters.pets` cobrem corretamente grupo Pets e status/tipo nas duas views. | Aberto |
| QA-004 | Horizontal mobile | QA visual/funcional | Validar chips `G1/G2/G3`, swipe lateral, scroll vertical por geração, conectores, safe-area e retorno ao estado inicial. | Aberto |
| QA-005 | Mobile Safari/iOS | QA visual | Validar posição da barra e do botão de controle em iOS/Safari nos breakpoints 320, 375, 390 e 430px. | Aberto |
| QA-006 | Exportação | QA funcional | Validar PNG, PDF, impressão e Área em `/mapa-familiar` e `/mapa-familiar-horizontal`, incluindo título, loading, conectores, paletas e avatares. | Aberto |
| QA-007 | Documentação cruzada | Documentação/QA | Conferir links cruzados após aplicar todos os documentos revisados no repo. | Aberto |
| QA-008 | Issue #8 | Operação | Registrar comentário final com resumo da frente e fechar a issue se não houver nova pendência. | Aberto |
| REF-001 | `Home.tsx` | Refatoração | Extrair responsabilidades de carregamento, filtros, exportação e painel em hooks/components menores. | Backlog |
| REF-002 | `SidebarPanelTabs.tsx` | Refatoração | Renomear para nome neutro, como `TreeControlPanel`, já que não renderiza mais tabs. | Backlog |
| REF-003 | ReactFlow/Dagre | Refatoração técnica | Auditar se o stack legado ainda é necessário e planejar remoção em frente própria. | Backlog |
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
|---|---|---|---|
| EXP-001 | `/mapa-horizontal` | Rota experimental removida. | Obsoleto/removido |
| EXP-002 | `/visao-completa-teste` | Rota experimental removida. | Obsoleto/removido |
| EXP-003 | Botão Horizontal → `/visao-completa` | Substituído por `/mapa-familiar-horizontal`. | Concluído |
| ROT-001 | `/minha-arvore` como view | Removida do roteamento ativo. | Concluído |
| ROT-002 | `/genealogia` | Removida do roteamento ativo. | Concluído |
| ROT-003 | `/visao-completa` | Removida do roteamento ativo. | Concluído |
| HMAP-001 | Cônjuges na horizontal | Linha/conectores de cônjuges preservados tecnicamente. | Concluído tecnicamente; QA aberto |
| HMAP-002 | Casal → filhos | Tronco e ramais preservados tecnicamente. | Concluído tecnicamente; QA aberto |
| HMAP-003 | Colunas vazias | Colunas sem cards visíveis ocultadas. | Concluído tecnicamente; QA aberto |
| MOB-001 | Toggle Vertical/Horizontal mobile antigo | Removido/substituído pelo modal de controles. | Concluído |
| MOB-002 | Botão de controle mobile | Alinhado às views atuais. | Concluído tecnicamente; QA iOS aberto |
| MOB-003 | Horizontal mobile por geração | `MobileFamilyHorizontalMapView` preservado. | Concluído tecnicamente; QA aberto |
| PANEL-001 | Barra `Filtros | Legendas | Ações` | Removida/simplificada no painel atual. | Concluído |
| SEARCH-001 | Busca/favoritos da horizontal | `/mapa-familiar-horizontal` incluída em busca/favoritos. | Concluído |
| CLEAN-001 | Componentes órfãos | Removidos componentes sem uso. | Concluído |
| CLEAN-002 | Resolver legado | `relationshipResolverService.ts` removido. | Concluído |
| HYGIENE-001 | `test-results/` | Ignorado no `.gitignore`. | Concluído |
| HYGIENE-002 | `backups/` e `.env*.save` | Ignorados; backup/env local removidos do versionamento. | Concluído |
| DOC-001 | Docs do painel | Atualizadas para refletir painel sem abas. | Concluído nesta revisão |

---

## 4. QA prioritário

### 4.1 Mapa Familiar Vertical

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
- [ ] título `Mapa Familiar de {nome}`;
- [ ] botão Horizontal navega para `/mapa-familiar-horizontal`;
- [ ] painel desktop não corta controles;
- [ ] cônjuge principal aparece;
- [ ] cônjuges ancestrais aparecem;
- [ ] cônjuges colaterais dependem de filtro;
- [ ] filtro Pets funciona;
- [ ] `Destacar > Linhas` altera conectores;
- [ ] `Destacar > Grupos` não quebra layout;
- [ ] exportação preserva título, cards, conectores e paleta.

### 4.2 Mapa Familiar Horizontal

Rota:

```txt
/mapa-familiar-horizontal
```

Checklist:

- [ ] colunas por geração aparecem corretamente;
- [ ] colunas vazias são ocultadas;
- [ ] cônjuges ficam adjacentes;
- [ ] conectores casal → filhos são coerentes;
- [ ] filtros afetam cards esperados;
- [ ] fundo transparente permanece onde definido;
- [ ] Vertical retorna para `/mapa-familiar` preservando query;
- [ ] exportação não corta colunas.

### 4.3 Mobile

Checklist:

- [ ] `/mapa-familiar` mobile mantém Paterno/Central/Materno;
- [ ] `/mapa-familiar-horizontal` mobile usa chips de geração;
- [ ] swipe lateral não conflita com scroll vertical;
- [ ] modal de controles abre/fecha;
- [ ] body destrava após fechar modal;
- [ ] bottom nav não cobre controles;
- [ ] safe area iOS está correta.

### 4.4 Exportação

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
- [ ] overlay/loading não aparecem;
- [ ] SVGs dos cards não viram quadrados escuros;
- [ ] conectores aparecem;
- [ ] paleta ativa é respeitada;
- [ ] filtros ativos são respeitados.

---

## 5. Critério para fechar a Issue #8

Fechar a issue quando:

- [ ] docs revisadas forem aplicadas no repo;
- [ ] build passar;
- [ ] unit tests passarem;
- [ ] E2E passar;
- [ ] `git status --short` ficar limpo;
- [ ] comentário final registrar commits e escopo concluído.

Comentário sugerido:

```md
Frente concluída na main.

Resumo:
- Mantidas apenas as views `/mapa-familiar` e `/mapa-familiar-horizontal`.
- Preservada `/minha-arvore/editar`.
- Removidas views antigas `/minha-arvore`, `/genealogia` e `/visao-completa`.
- Painel simplificado sem `Filtros | Legendas | Ações`.
- Busca/favoritos alinhados às rotas atuais.
- Componentes órfãos, resolver legado, backups e cópia local de ambiente removidos.
- `.gitignore` atualizado para artefatos locais.
- Docs canônicas revisadas.
- Build, Vitest e Playwright passaram.
```

---

## 6. Comandos de fechamento

```bash
npm run build
npm test
npm run test:e2e
git diff --check
git status --short
```

Se tudo passar:

```bash
git add docs
git commit -m "docs: atualiza documentacao final da arvore"
git push
```

Depois fechar a Issue #8.
