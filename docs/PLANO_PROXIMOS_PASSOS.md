# Plano de próximos passos - Árvore Família

> Última revisão: 2026-06-11  
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: plano vivo revisado após consolidação de `/mapa-familiar-horizontal`, painel Vertical/Horizontal, conectores casal → filhos, controles mobile, remoção de rotas experimentais e atualização das pendências reais.

## Objetivo

Este documento registra apenas:

- pendências reais encontradas durante revisão documental, QA visual ou implementação;
- divergências entre documentação e implementação;
- ações futuras que não devem ser executadas sem decisão explícita;
- pontos de QA, migration, refatoração ou melhoria identificados durante auditoria técnica;
- pendências remanescentes após ajustes de árvore, mobile, Mapa Familiar e documentação.

O estado consolidado do que já está implementado deve permanecer em `docs/GUIA_IMPLEMENTACOES.md`.

---

## 1. Situação atual

Views da árvore:

| View | Rota | Estado |
|---|---|---|
| Mapa Familiar Vertical | `/mapa-familiar` | Implementada; view default de `/`; usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile. |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | Implementada; usa `DesktopFamilyHorizontalMapView`, colunas por geração, conectores SVG e painel compartilhado. |
| Minha Árvore | `/minha-arvore` | Implementada; ReactFlow no desktop/tablet e `MobileFamilyTreeView` no mobile. |
| Genealogia | `/genealogia` | Implementada; ReactFlow por gerações; chips mobile. |
| Visão Completa | `/visao-completa` | Implementada; ReactFlow por gerações com base completa. |

Rotas experimentais removidas:

```txt
/mapa-horizontal
/visao-completa-teste
```

Estado técnico recente:

- `/` redireciona para `/mapa-familiar`;
- `TreeViewMode` inclui `mapa-familiar-horizontal`;
- `/mapa-familiar-horizontal` é protegida por `TreeAccessRoute`;
- painel desktop mostra **Vertical** e **Horizontal**;
- **Vertical** aponta para `/mapa-familiar`;
- **Horizontal** aponta para `/mapa-familiar-horizontal`;
- mobile não usa toggle Vertical/Horizontal;
- `/mapa-familiar-horizontal` mobile possui barra visual `Paterno | Central | Materno`, ainda sem comportamento funcional definido;
- botão de controle mobile fica alinhado à barra superior;
- `MobileTreeControlsPortal` não deve renderizar nas rotas `/mapa-familiar` e `/mapa-familiar-horizontal`.

---

## 2. Pendências abertas

| ID | Documento/origem | Tipo | Ação necessária | Status |
|---|---|---|---|---|
| DOC-014 | `/mapa-familiar` / `DesktopFamilyMapView.tsx` | QA visual manual autenticado | Validar alinhamento panorâmico, conectores, grupos laterais, painel colapsado, centralização, colisões, margens, desktop/tablet, exportação e resoluções reais com dados autenticados. | Aberto |
| DOC-025 | `/mapa-familiar-horizontal` / `DesktopFamilyHorizontalMapView.tsx` | QA visual manual autenticado | Validar colunas ativas, colunas vazias ocultadas, cônjuges adjacentes, conectores casal → filhos, distribuição de troncos no gap, filhos ordenados por nascimento e filtros combinados. | Aberto |
| DOC-026 | `Home.tsx` / filtros diretos | Bug funcional | Corrigir o filtro de grupo **Pets** se `directRelativeFilters.pets` ainda estiver sendo forçado como `true`, impedindo ocultar/exibir pets pelo card de grupo. | Aberto |
| DOC-027 | `/mapa-familiar-horizontal` mobile | Produto/UX | Definir comportamento real dos botões `Paterno`, `Central` e `Materno` na barra mobile da view horizontal. Hoje a barra é visual e `Central` fica ativo por padrão. | Aberto |
| DOC-028 | `HomeMobileNav.tsx` / mobile Safari | QA visual | Validar posição da barra e do botão de controle em iOS/Safari nos breakpoints 320, 375, 390 e 430px. | Aberto |
| DOC-029 | Exportação das views visuais | QA funcional | Validar PNG, PDF e impressão de `/mapa-familiar` e `/mapa-familiar-horizontal`, incluindo paletas, conectores e ocultação de controles. | Aberto |
| DOC-030 | Documentação cruzada | Documentação | Após aplicar novos docs, conferir links cruzados em README, ARCHITECTURE, ROTAS, GUIA_COMPONENTES, GUIA_UX_LAYOUT e funcionalidades. | Aberto |

Regras:

- não duplicar essas pendências em outros documentos;
- documentos funcionais podem mencionar o contexto, mas o controle fica nesta tabela;
- fechar item apenas após validação técnica, QA visual ou decisão explícita;
- se houver alteração de schema, criar migration e atualizar `docs/operacao/MIGRATIONS_SUPABASE.md`.

---

## 3. Itens fechados, obsoletos ou reclassificados

| ID | Documento/origem | Resultado | Status |
|---|---|---|
| DOC-001 | Genealogia/Visão Completa mobile | Chips mobile passaram a usar base de gerações inferidas. | Concluído tecnicamente; manter QA visual. |
| DOC-004 | `/minha-arvore` mobile ReactFlow | Obsoleto para a rota mobile principal, pois `/minha-arvore` mobile usa `MobileFamilyTreeView`. | Obsoleto/substituído. |
| DOC-005 | Exportação mobile rápida | `MobileTreeControlsPortal` passou a usar fluxo canônico de `treeExport.ts`. | Concluído tecnicamente; manter QA. |
| DOC-013 | Minha Árvore mobile segmentada | Malha 3×3 com Paterno/Central/Materno, ancestrais, laterais e preview durante swipe. | Concluído tecnicamente; manter QA visual. |
| DOC-014-parcial | `/mapa-familiar` busca/favoritos | `/mapa-familiar` já consta em busca/favoritos quando implementado no código. | Fechado se confirmado no código atual. |
| DOC-016 | Exportação do Mapa Familiar Vertical | Captura HTML/CSS/SVG por root próprio. | Concluído tecnicamente; manter QA. |
| DOC-017 / DOC-020 | Laterais e painel colapsado do Mapa Familiar | Reclassificados para QA visual consolidado do DOC-014. | Reclassificado. |
| DOC-024 | Navegação preservando contexto | Perfis abertos a partir das views preservam retorno por `?voltar=...` quando fluxo está ativo. | Concluído tecnicamente; manter QA. |
| EXP-001 | `/mapa-horizontal` | Rota experimental removida. | Obsoleto/removido. |
| EXP-002 | `/visao-completa-teste` | Rota experimental removida. | Obsoleto/removido. |
| EXP-003 | Botão Horizontal apontando para `/visao-completa` | Substituído por `/mapa-familiar-horizontal`. | Concluído. |
| HMAP-001 | Conectores de cônjuges na horizontal | Implementada linha vertical entre cônjuges. | Concluído tecnicamente; manter QA. |
| HMAP-002 | Conectores casal → filhos | Implementado tronco horizontal/vertical e ramais para filhos. | Concluído tecnicamente; manter QA. |
| HMAP-003 | Colunas vazias | Colunas sem cards visíveis passam a ser ocultadas. | Concluído tecnicamente; manter QA. |
| HMAP-004 | Cônjuges colaterais | Cônjuges de tios, primos, sobrinhos e filhos são reincluídos quando filtro **Cônjuges** está ativo. | Concluído tecnicamente; manter QA. |
| MOB-001 | Toggle Vertical/Horizontal mobile | Removida das páginas `/mapa-familiar` e `/mapa-familiar-horizontal`. | Concluído. |
| MOB-002 | Botão de controle mobile | Reposicionado para alinhar com a barra superior das views de mapa. | Concluído tecnicamente; manter QA em iOS. |

---

## 4. QA prioritário

### 4.1 Mapa Familiar Vertical

Rotas:

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

- abre como view padrão a partir de `/`;
- título correto no desktop;
- painel desktop não corta controles;
- botão **Horizontal** navega para `/mapa-familiar-horizontal`;
- cônjuge principal aparece;
- cônjuges ancestrais aparecem;
- cônjuges colaterais dependem do filtro **Cônjuges**;
- filtros de vida funcionam;
- grupo Pets deve ser validado especificamente;
- zoom com `Ctrl + scroll` afeta apenas a área da árvore;
- header e painel ficam fixos;
- exportação PNG/PDF/impressão preserva superfície.

### 4.2 Mapa Familiar Horizontal

Rota:

```txt
/mapa-familiar-horizontal
```

Checklist:

- botão **Vertical** retorna para `/mapa-familiar`;
- colunas são definidas por `manual_generation` quando válido;
- valores fora de 1 a 6 são limitados;
- colunas vazias somem;
- filhos de casal ficam do mais velho ao mais novo;
- cônjuges aparecem em linhas coladas;
- linha vertical entre cônjuges aparece;
- tronco casal → filhos aparece quando há filhos visíveis;
- múltiplos troncos no mesmo gap não ficam sobrepostos;
- filhos invisíveis por filtro não recebem linha;
- cônjuges de tios/primos aparecem com filtro **Cônjuges** ativo;
- cônjuges de tios/primos somem com filtro **Cônjuges** inativo;
- cônjuge central e cônjuges ancestrais permanecem;
- cards respeitam paletas;
- exportação preserva colunas e conectores.

### 4.3 Mobile

Rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
/minha-arvore
/genealogia
/visao-completa
```

Checklist:

- `/mapa-familiar` mantém barra nativa `Paterno | Central | Materno`;
- `/mapa-familiar-horizontal` mostra barra visual equivalente;
- não há toggle Vertical/Horizontal;
- botão de controle está na mesma linha da barra;
- painel inferior abre com filtros/ações;
- não há duplicidade com `MobileTreeControlsPortal`;
- bottom nav não cobre conteúdo essencial;
- Safari/iOS respeita `safe-area`.

---

## 5. Pendência específica: filtro Pets

### Problema

O card de filtro **Pets** do painel de grupos pode não ocultar/exibir cards de pets na view horizontal e/ou vertical.

### Causa provável

Há indício de que `directRelativeFilters.pets` tenha sido forçado como `true` no estado derivado em `Home.tsx`.

### Ação recomendada

Revisar `Home.tsx` e separar claramente:

| Estado | Papel |
|---|---|
| `personFilters.pets` | filtro de tipo/status de vida |
| `directRelativeFilters.pets` | filtro do grupo Pets no painel de grupos |

Critério de aceite:

- desligar **Pets** em grupos remove cards de pets;
- ligar **Pets** recoloca cards de pets;
- filtro de vida/tipo **Pets** continua independente;
- contadores refletem estado visível;
- não quebra cônjuges, filhos ou grupos diretos.

---

## 6. Pendência específica: barra mobile da horizontal

### Estado atual

Em `/mapa-familiar-horizontal`, a barra mobile:

```txt
Paterno | Central | Materno
```

é renderizada como estrutura visual, com **Central** ativo por padrão.

### Decisão pendente

Definir se a barra deve:

1. filtrar colunas por ramo;
2. navegar horizontalmente para uma região;
3. alterar foco/scroll;
4. alternar subconjuntos de relações;
5. ser removida da horizontal.

Enquanto não houver decisão, não implementar comportamento sem validação de produto.

---

## 7. Pendência específica: conectores da horizontal

### Estado atual

A view horizontal desenha:

- linha vertical entre cônjuges;
- linha horizontal do casal ao gap;
- tronco vertical no gap;
- ramais horizontais até filhos.

### Pontos a validar

- sobreposição em famílias grandes;
- conexão quando um dos cônjuges está oculto;
- conexão quando filhos estão filtrados;
- conexão quando coluna seguinte foi compactada após ocultação de coluna vazia;
- comportamento com múltiplos casais na mesma geração;
- exportação com conectores.

Se falhar, ajustar em `DesktopFamilyHorizontalMapView.tsx`, não em CSS global.

---

## 8. Pendência documental

Após substituir os arquivos revisados, conferir:

```txt
docs/README.md
docs/arquitetura/ARCHITECTURE.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
docs/funcionalidades/GENEALOGIA_VIEW.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

Critérios:

- todas as views oficiais aparecem com nomes corretos;
- `/mapa-familiar-horizontal` aparece em rotas, arquitetura, componentes e UX;
- `/mapa-horizontal` e `/visao-completa-teste` não aparecem como rotas ativas;
- Mapa Familiar Vertical e Horizontal estão no mesmo documento funcional ou com links cruzados claros;
- pendências reais ficam apenas neste plano.

---

## 9. Regras para fechar pendências

Um item só deve ser fechado quando houver:

- commit aplicado;
- build local validado ou justificativa explícita;
- QA visual mínimo quando a mudança for visual;
- documentação atualizada, se o comportamento for canônico;
- ausência de regressão nas views relacionadas.

Comando mínimo:

```bash
npm run build
git diff --check
```

Para QA mobile:

```txt
iPhone/Safari real ou emulador confiável
320px
375px
390px
430px
```

---

## 10. Backlog pós-MVP

Itens que não devem ser tratados como bug do MVP sem decisão explícita:

- exportação completa da árvore;
- PDF multipágina;
- exportação vetorial;
- sincronização avançada de calendário;
- comportamento final da barra Paterno/Central/Materno na horizontal;
- edição visual de `manual_generation` por drag-and-drop;
- assistente automático de organização de gerações;
- persistência de layout personalizado por usuário;
- versão alternativa da horizontal usando ReactFlow.
