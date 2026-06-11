# Exportação da árvore

> Última revisão: 2026-06-11  
> Local canônico: `docs/funcionalidades/EXPORTACAO_ARVORE.md`  
> Tipo: documentação funcional e técnica da exportação da árvore.  
> Status: fluxo canônico revisado para views ReactFlow, Mapa Familiar Vertical, Mapa Familiar Horizontal, painel desktop e controle mobile atual.

---

## 1. Objetivo

A exportação permite gerar imagem, PDF ou impressão a partir das views da árvore.

O escopo atual é:

```txt
Exportar a área visível/selecionada ou a superfície capturável atual da árvore.
```

Não está no escopo atual:

- exportação automática da árvore completa;
- exportação multipágina;
- exportação server-side;
- exportação vetorial/SVG puro;
- salvamento automático no Supabase Storage;
- histórico de exportações.

---

## 2. Views cobertas

| View | Rota | Estratégia |
|---|---|---|
| Minha Árvore | `/minha-arvore` | ReactFlow; área visível/seleção |
| Genealogia | `/genealogia` | ReactFlow; área visível/seleção |
| Visão Completa | `/visao-completa` | ReactFlow; área visível/seleção |
| Mapa Familiar Vertical | `/mapa-familiar` | captura HTML/CSS/SVG da superfície panorâmica |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | captura HTML/CSS/SVG da superfície horizontal por gerações |

Regra central:

```txt
As views ReactFlow usam a estrutura ReactFlow.
As views do Mapa Familiar usam root HTML/CSS/SVG próprio.
```

---

## 3. Arquivos principais

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/components/FamilyTree/types.ts
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeMobileNav.tsx
src/main.tsx
src/styles/mobile-tree-controls.css
```

Documentos relacionados:

```txt
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/GENEALOGIA_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/PLANO_PROXIMOS_PASSOS.md
```

---

## 4. Escopo atual

Implementado no fluxo principal:

- seleção retangular de área visível em views ReactFlow;
- exportação PNG;
- exportação PDF;
- impressão;
- cancelamento por botão;
- cancelamento por `Esc`;
- seleção mínima de `80 x 80px`;
- limite preventivo de pixels;
- bloqueio de pan/zoom durante seleção;
- exclusão de controles/overlays/menus da captura;
- mensagens de erro amigáveis.

Implementado nas views de Mapa Familiar:

- captura direta da superfície atual;
- exportação PNG;
- exportação PDF;
- impressão;
- preservação da paleta atual;
- preservação do zoom/escala visual atual;
- preservação de grupos visíveis e expandidos;
- captura dos conectores SVG;
- exclusão de botões marcados como ignoráveis.

Implementado no mobile:

- `/mapa-familiar` e `/mapa-familiar-horizontal` usam botão de controle em `HomeMobileNav`, que abre o painel inferior com ações;
- outras views de árvore podem usar `MobileTreeControlsPortal`;
- o portal mobile não deve duplicar controles nas rotas do Mapa Familiar.

---

## 5. Fluxo principal com seleção de área

Arquivos:

```txt
FamilyTree.tsx
TreeAreaSelectionOverlay.tsx
treeExport.ts
```

Fluxo:

```txt
Usuário abre a árvore ReactFlow
Usuário escolhe Exportar > Área
Overlay aparece sobre a árvore
Usuário arrasta uma área visível
Toolbar aparece
Usuário escolhe PNG, PDF ou Imprimir
Sistema captura a área
Sistema baixa arquivo ou abre impressão
Overlay fecha após sucesso
```

Cancelamento:

```txt
Cancelar ou Esc
-> overlay fecha
-> pan/zoom voltam ao normal
-> filtros, view e pessoa central são preservados
```

Regras:

- seleção retangular é comportamento das views ReactFlow;
- em Mapa Familiar, ação **Área** deve exportar diretamente a superfície atual ou exibir mensagem/fluxo equivalente, sem prometer seleção retangular se ela não existir;
- a seleção não deve alterar dados, filtros ou Supabase.

---

## 6. Fluxo do Mapa Familiar Vertical

Arquivo principal:

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
```

Root esperado:

```txt
[data-family-map-export-root="true"]
```

Comportamento:

- captura HTML/CSS/SVG da superfície panorâmica;
- não depende de ReactFlow;
- captura cards visuais, conectores SVG e estado atual;
- respeita paleta atual;
- respeita zoom manual e escala responsiva;
- respeita grupos expandidos/recolhidos;
- ignora botões de expansão quando marcados para exportação.

Arquivo gerado:

```txt
mapa-familiar-*.png
mapa-familiar-*.pdf
```

---

## 7. Fluxo do Mapa Familiar Horizontal

Arquivo principal:

```txt
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
```

Roots esperados:

```txt
data-family-map-export-root="true"
data-family-map-horizontal-root="true"
```

Comportamento:

- captura HTML/CSS/SVG da superfície horizontal;
- captura colunas ativas;
- captura conectores de cônjuges e casal → filhos;
- preserva colunas vazias ocultadas;
- preserva filtros ativos;
- preserva cônjuges visíveis;
- respeita paleta atual;
- respeita zoom manual e escala responsiva.

Arquivo gerado:

```txt
mapa-familiar-horizontal-*.png
mapa-familiar-horizontal-*.pdf
```

Regras:

- a view horizontal não deve usar captura de `.react-flow` como fonte principal;
- conectores SVG devem permanecer dentro da superfície capturável;
- elementos de controle mobile/desktop não devem entrar na captura;
- se não houver root, a exportação deve falhar com mensagem compreensível.

---

## 8. Painel desktop

O painel desktop em `SidebarPanelTabs.tsx` oferece ações:

| Opção | Ação |
|---|---|
| Área | `startAreaSelection` |
| Imagem | `saveImage` |
| PDF | `savePdf` |
| Imprimir | `print` |

Regras:

- `SIDEBAR_TREE_ACTION_EVENT` envia a ação para `HomeTreeSection`;
- `HomeTreeSection` chama a ref da árvore/view atual;
- `FamilyTree`, `DesktopFamilyMapView` e `DesktopFamilyHorizontalMapView` devem expor `FamilyTreeActions`;
- botões não devem alterar dados nem filtros.

---

## 9. Mobile

### 9.1 Rotas do Mapa Familiar

Em mobile, nas rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

o botão de controle é renderizado por:

```txt
src/app/pages/home/HomeMobileNav.tsx
```

Ele abre o painel inferior de `Home.tsx`, reutilizando o conteúdo funcional do painel desktop.

Regras:

- não renderizar `MobileTreeControlsPortal` nessas rotas;
- evitar duplicidade de botões;
- manter o botão alinhado à barra superior da árvore;
- o painel aberto deve permitir filtros, cores, exportação e destaques conforme a view suportar.

### 9.2 Outras views

`MobileTreeControlsPortal` pode atuar em views ReactFlow como:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Regras:

- o portal deve aparecer apenas em rotas de árvore suportadas;
- não deve aparecer em páginas internas como `/minha-arvore/editar`, `/meus-favoritos` ou `/calendario-familiar`;
- deve reutilizar `treeExport.ts`;
- deve manter `useCORS: true` e `allowTaint: false`.

---

## 10. `treeExport.ts`

Responsabilidades:

- montar nome de arquivo;
- resolver alvo de exportação;
- capturar elemento com `html2canvas`;
- recortar canvas quando houver seleção;
- baixar PNG;
- gerar PDF;
- abrir janela de impressão;
- imprimir canvas;
- ignorar elementos de UI não exportáveis.

Ordem esperada de resolução de alvo:

```txt
1. alvo explícito da view, quando fornecido;
2. root do Mapa Familiar;
3. root ReactFlow;
4. fallback seguro para data-export-root="family-tree".
```

Regras:

- não usar `allowTaint: true` sem revisão;
- manter `useCORS: true`;
- novos overlays/menus precisam de marcador de ignore;
- não capturar painel lateral, botão mobile, bottom nav ou menus de usuário.

---

## 11. Elementos ignorados

Seletores/atributos relevantes:

```txt
.react-flow__controls
.react-flow__minimap
[data-tree-node-menu="true"]
[data-tree-selection-overlay="true"]
[data-tree-legend="true"]
[data-tree-export-ignore="true"]
.mobile-tree-controls-portal
```

Regras:

- controles de zoom não devem aparecer;
- menu de node não deve aparecer;
- overlay de seleção não deve aparecer;
- legenda marcada não deve aparecer;
- bottom nav mobile não deve aparecer;
- botão de controle mobile não deve aparecer;
- novos overlays devem receber atributo de ignore.

---

## 12. Restrições técnicas

### 12.1 CORS

A captura usa `html2canvas`.

Configuração esperada:

```txt
useCORS: true
allowTaint: false
```

Não resolver erro de CORS com `allowTaint: true` sem revisão técnica.

### 12.2 Tamanho de canvas

Manter limite preventivo para evitar travamento do navegador.

Referência atual:

```txt
12.000.000 pixels
```

Se o limite for atingido:

- reduzir área exportada;
- orientar usuário a diminuir zoom;
- dividir escopo manualmente;
- não prometer exportação completa automática.

### 12.3 PDF

Regras:

- respeitar proporção da área capturada;
- evitar esticar imagem;
- não prometer PDF multipágina automático;
- não prometer árvore completa em PDF no escopo atual.

### 12.4 Impressão

Regras:

- abrir fluxo de impressão com imagem capturada;
- exibir erro se popup/janela de impressão falhar;
- não depender de Storage;
- não salvar arquivo automaticamente no banco.

---

## 13. Acessibilidade e UX

Regras:

- ações de exportação devem ter texto ou `aria-label`;
- cancelar seleção deve ser possível por botão e `Esc`;
- mensagens devem ser compreensíveis;
- não exibir IDs técnicos;
- não bloquear a árvore após erro;
- exportar não deve alterar view, pessoa central, filtros, paleta ou permissões;
- falha de exportação deve exibir toast/erro amigável.

---

## 14. QA mínimo

### Views ReactFlow

Validar:

- seleção de área;
- PNG;
- PDF;
- impressão;
- cancelamento por `Esc`;
- zoom/pan após cancelar;
- exclusão de overlays.

Rotas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

### Mapa Familiar Vertical

Validar:

```txt
/mapa-familiar
```

Checklist:

- exporta cards visuais;
- exporta conectores SVG;
- não exporta painel/botões;
- preserva paleta;
- preserva estado expandido/recolhido;
- título/controles não entram indevidamente se marcados fora da superfície.

### Mapa Familiar Horizontal

Validar:

```txt
/mapa-familiar-horizontal
```

Checklist:

- exporta colunas visíveis;
- não cria coluna vazia no artefato;
- exporta conectores de cônjuges;
- exporta troncos casal → filhos;
- não exporta controles mobile ou bottom nav;
- preserva filtros e paleta.

### Mobile

Breakpoints:

```txt
320px
375px
390px
430px
```

Checklist:

- botão de controle abre painel;
- ações de exportação aparecem;
- painel fecha após sucesso;
- não há dois painéis concorrentes;
- bottom nav não aparece no artefato.

---

## 15. Anti-regressões

Não fazer:

- reintroduzir exportação específica duplicada fora de `treeExport.ts`;
- importar `html2canvas`/`jspdf` diretamente em novos componentes sem necessidade;
- capturar `.react-flow` para `/mapa-familiar-horizontal`;
- ocultar conectores SVG antes da captura;
- exportar painel lateral ou bottom nav;
- prometer árvore completa ou PDF multipágina;
- alterar dados ou Supabase durante exportação;
- usar o fluxo mobile antigo nas rotas do Mapa Familiar.
