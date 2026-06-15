# Regras de não regressão — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/REGRAS_DE_NAO_REGRESSAO.md`  
> Projeto: `tuliust/arvorefamilia`  
> Tipo: checklist de QA e prevenção de regressões  
> Status: revisado para separar regras vigentes de pendências ainda abertas.

---

## 1. Objetivo

Este documento define regras e checklists mínimos para evitar regressões.

Use antes de alterar:

- rotas;
- `TreeViewMode`;
- árvore;
- painel desktop;
- modal mobile;
- paletas/CSS;
- exportação;
- favoritos/busca;
- calendário;
- guards/permissões;
- documentação.

---

## 2. Comandos mínimos

Mudança somente documental:

```bash
git diff --check
npm run build
```

Mudança de código não visual:

```bash
git diff --check
npm run build
npm test
```

Mudança em rotas, guards, árvore, navegação, exportação ou mobile:

```bash
git diff --check
npm run build
npm test
npm run test:e2e
```

Mudança visual/CSS:

```bash
git diff --check
npm run build
npm run test:e2e
```

QA manual continua obrigatório para alterações visuais.

---

## 3. Buscas obrigatórias

Antes de fechar limpeza ou refatoração da árvore:

```bash
rg "/minha-arvore|/genealogia|/visao-completa" docs src tests
rg "TreeViewMode|treeViewMode" docs src tests
rg "Filtros \| Legendas \| Ações" docs src
rg "MobileTreeControlsPortal" docs src
rg "Nascimento não informado|Falecimento não informado" docs src
rg "FILTERABLE_SPOUSE_ANCHOR_GROUPS|ANCESTOR_SPOUSE_ANCHOR_GROUPS" docs src
rg "data-tree-route-view|data-export-root|data-tree-export-ignore" docs src
```

Interpretação:

- `/minha-arvore/editar` pode permanecer;
- `genealogia` pode existir como conceito textual, não como rota ativa;
- aliases antigos podem existir se apontarem para rotas atuais;
- `Nascimento não informado` pode existir como dívida técnica transitória, mas não deve aparecer no resultado visual mobile;
- documentos históricos podem conter legado se estiverem claramente marcados.

---

## 4. Rotas

### Devem permanecer

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
/minha-arvore/editar
/busca
/entrar
/termos
/privacidade
/meus-dados
/meus-vinculos
/vincular-perfil
/pessoa/:id
/pessoas/:id
/calendario-familiar
/meus-favoritos
/notificacoes
/ajustar-notificacoes
/forum/*
/admin/*
```

### Não devem voltar como views ativas

```txt
/minha-arvore
/genealogia
/visao-completa
```

Checklist:

- [ ] `/` redireciona para `/mapa-familiar` ou login conforme guard.
- [ ] `/?pessoa=abc` preserva `?pessoa=abc`.
- [ ] `/mapa-familiar` é protegida.
- [ ] `/mapa-familiar-horizontal` é protegida.
- [ ] `/minha-arvore/editar` continua em `MemberRoute`.
- [ ] rotas antigas não renderizam views da árvore.

---

## 5. `TreeViewMode`

Deve conter apenas:

```txt
mapa-familiar
mapa-familiar-horizontal
```

Checklist:

- [ ] `VIEW_MODE_TO_PATH` contém só as duas rotas oficiais.
- [ ] `PATH_TO_VIEW_MODE` contém `/`, `/mapa-familiar` e `/mapa-familiar-horizontal`.
- [ ] fallback retorna `mapa-familiar`.
- [ ] alternância preserva `location.search`.
- [ ] nenhuma view antiga entra no tipo.

---

## 6. Renderização da árvore

Matriz obrigatória:

| Rota | Desktop/tablet | Mobile |
|---|---|---|
| `/mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `MobileFamilyHorizontalMapView` |

Checklist:

- [ ] vertical desktop renderiza mapa vertical.
- [ ] vertical mobile renderiza `MobileFamilyTreeView`.
- [ ] horizontal desktop renderiza `DesktopFamilyHorizontalMapView`.
- [ ] horizontal mobile renderiza `MobileFamilyHorizontalMapView`.
- [ ] horizontal mobile usa botões `Ger X`.
- [ ] horizontal mobile não usa Paterno/Central/Materno.
- [ ] horizontal mobile não usa scroll horizontal manual como navegação principal.
- [ ] `?pessoa=...` continua preservado.

---

## 7. Painel desktop

Deve funcionar:

```txt
Zoom +
Zoom -
Restaurar/Fit
Vertical
Horizontal
Cores
Exportar
Destacar
Filtros/grupos
Filtros de status
```

Não deve voltar:

```txt
Filtros | Legendas | Ações
activeSidebarPanel como contrato de produto
aba Legendas persistente
aba Ações persistente
```

Checklist:

- [ ] filtros acessíveis sem aba.
- [ ] exportação funciona.
- [ ] paletas funcionam.
- [ ] destaque funciona.
- [ ] painel não aparece na exportação.
- [ ] cards do painel seguem paleta ativa.
- [ ] `Área` funciona como toggle.

---

## 8. Modal mobile de controles

Deve conter:

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros de status
```

Não deve conter:

```txt
Zoom +
Zoom -
Restaurar visualização
Exportar
```

Checklist:

- [ ] modal abre em `/mapa-familiar`.
- [ ] modal abre em `/mapa-familiar-horizontal`.
- [ ] título é `Controles`.
- [ ] não há subtítulo.
- [ ] botão de fechar é `X`.
- [ ] overlay fecha.
- [ ] body destrava ao fechar.
- [ ] grupos aparecem apenas após clicar em `Grupos`.
- [ ] filtros permanecem visíveis.
- [ ] modal não entra na exportação.

---

## 9. Paletas

Paletas vigentes:

```txt
white
visual
orange
brown
```

Checklist:

- [ ] desktop e mobile usam a mesma paleta ativa.
- [ ] cards mudam com a paleta.
- [ ] bordas mudam com a paleta.
- [ ] conectores mudam com a paleta.
- [ ] labels/títulos preservam contraste.
- [ ] exportação preserva paleta.
- [ ] paletas não azuis não caem em fallback azul.
- [ ] não há seletor global `svg path` afetando ícones fora da árvore.

QA obrigatório:

```txt
white desktop/mobile
visual desktop/mobile
orange desktop/mobile
brown desktop/mobile
```

---

## 10. Cards e avatares

Contrato:

| Caso | UI |
|---|---|
| Pessoa com foto | foto real |
| Pessoa sem foto | `User` |
| Pet | `PawPrint` |

Checklist:

- [ ] pessoa sem foto usa `User`.
- [ ] pet usa `PawPrint`.
- [ ] não há fallback por gênero.
- [ ] ícones preservam contraste.
- [ ] exportação preserva ícones.

Cards mobile:

- [ ] nascimento aparece apenas quando há ano/data real.
- [ ] falecimento aparece apenas quando há ano/data real.
- [ ] `Nascimento não informado` não aparece no resultado visual.
- [ ] `Falecimento não informado` não aparece no resultado visual.
- [ ] dívida `TREE-004` permanece aberta até correção estrutural no componente.

---

## 11. Cônjuges

### Implementado/esperado

- cônjuge da pessoa central;
- múltiplos núcleos conjugais da pessoa central quando há dados;
- cônjuges de `avos`, `bisavos` e `tataravos` como ancestrais sempre visíveis;
- cônjuges filtráveis atualmente suportados por código: `tios`, `primos`, `sobrinhos`, `filhos`, `netos`.

### Pendência conhecida

```txt
TREE-003 — cônjuges de pais/Geração 4 na horizontal
```

Checklist:

- [ ] não declarar `pais`/Geração 4 como implementado até código incluir esse grupo.
- [ ] se corrigir, atualizar docs e testes/QA no mesmo commit.
- [ ] nunca inferir conector conjugal por proximidade visual.
- [ ] não criar dado fictício para resolver layout.

---

## 12. Conectores

Checklist geral:

- [ ] conectores representam relações explícitas.
- [ ] conectores seguem paleta ativa.
- [ ] conectores aparecem na exportação.
- [ ] conectores não afetam ícones SVG internos.
- [ ] ajuste de conector não usa seletor global.

Por view:

- [ ] vertical desktop: âncoras e grupos corretos.
- [ ] vertical mobile: alinhamento Pai/Mãe/ancestrais coerente.
- [ ] horizontal desktop: casal → filhos por geração.
- [ ] horizontal mobile: conectores da geração ativa visíveis até fim do scroll.

---

## 13. Calendário familiar

Checklist mobile:

- [ ] 5 botões em uma linha quando possível.
- [ ] bolinha colorida acima do texto.
- [ ] título em uma linha.
- [ ] sem overflow horizontal indevido.
- [ ] categorias continuam filtrando eventos.
- [ ] Google Agenda não quebra quando OAuth não está configurado.
- [ ] limites de test users/OAuth ficam documentados em operação.

---

## 14. Exportação

Checklist:

- [ ] `Área` abre seleção.
- [ ] segundo clique em `Área` fecha seleção.
- [ ] PNG gera arquivo.
- [ ] PDF gera arquivo.
- [ ] Imprimir abre fluxo de impressão.
- [ ] loading aparece durante ação real.
- [ ] erro de tamanho grande é claro.
- [ ] header não aparece na captura.
- [ ] painel não aparece na captura.
- [ ] bottom nav não aparece na captura.
- [ ] modal mobile não aparece na captura.
- [ ] debug não aparece na captura.
- [ ] paleta ativa aparece na captura.

---

## 15. Favoritos e busca global

Favoritos:

- [ ] `/mapa-familiar` é favoritável.
- [ ] `/mapa-familiar-horizontal` é favoritável.
- [ ] rotas antigas não aparecem como páginas ativas.
- [ ] favoritos não salvam zoom/filtro como rota.

Busca:

- [ ] busca encontra as duas views oficiais.
- [ ] aliases antigos apontam para rotas atuais.
- [ ] `/minha-arvore` não volta como destino ativo.
- [ ] `/genealogia` não volta como destino ativo.
- [ ] `/visao-completa` não volta como destino ativo.

---

## 16. Guards e segurança

Checklist:

- [ ] árvore protegida por `TreeAccessRoute`.
- [ ] área de membro protegida por `MemberRoute`.
- [ ] admin protegido por `ProtectedRoute`.
- [ ] UI não substitui policy/RLS.
- [ ] service role não vai para frontend.
- [ ] secrets não são versionados.
- [ ] migrations não contêm dados reais sensíveis.
- [ ] Edge Functions documentam secrets esperados sem valores.

---

## 17. Remoção de arquivos

Antes de remover:

```bash
rg "NOME_DO_ARQUIVO|SímboloExportado" src docs tests
npm run build
npm test
npm run test:e2e
```

Checklist:

- [ ] não há imports diretos.
- [ ] não há uso indireto por tipo/helper.
- [ ] documentação foi atualizada.
- [ ] se era legado ativo, remoção foi feita em frente própria.
- [ ] se era histórico útil, foi movido/resumido em `docs/historico/`.

---

## 18. CSS

Regras:

- escopar por rota, container ou data attribute;
- evitar mudanças globais de tema para corrigir detalhe local;
- não usar `!important` sem justificativa de contenção;
- não usar seletor global em SVG;
- validar mobile real;
- validar exportação.

Arquivos sensíveis:

```txt
src/styles/index.css
src/styles/theme.css
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-map-mobile-palettes.css
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
src/styles/calendar-mobile-category-buttons.css
```

---

## 19. Documentação

Checklist:

- [ ] `BASELINE_PRODUTO_ATUAL.md` reflete comportamento implementado.
- [ ] `GUIA_IMPLEMENTACOES.md` não chama pendência de implementada.
- [ ] `INVENTARIO_TECNICO.md` marca legado ativo corretamente.
- [ ] `GUIA_COMPONENTES.md` descreve responsabilidades atuais.
- [ ] `GUIA_UX_LAYOUT.md` separa UX desejada de dívida técnica.
- [ ] `PLANO_PROXIMOS_PASSOS.md` contém riscos/pendências abertas.
- [ ] docs históricos não parecem fonte de verdade vigente.
- [ ] links cruzados apontam para arquivos existentes.

---

## 20. Checklist final antes de push

```bash
git status --short
git diff --check
npm run build
npm test
npm run test:e2e
git status --short
```

Regras finais:

- [ ] não usar `git add .` quando a frente é documental.
- [ ] adicionar apenas arquivos esperados.
- [ ] revisar `git diff --cached --stat`.
- [ ] não commitar `dist/`, backups, envs ou dumps.
- [ ] registrar pendências reais no `PLANO_PROXIMOS_PASSOS.md`.
