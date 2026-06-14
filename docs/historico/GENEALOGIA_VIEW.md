# Legado - Genealogia e Visão Completa

> Última revisão histórica: 2026-06-13  
> Local recomendado: `docs/historico/GENEALOGIA_VIEW.md`  
> Origem: `docs/funcionalidades/GENEALOGIA_VIEW.md`  
> Status: **legado arquivado**. Este documento não é canônico para implementação atual.

---

## 1. Função deste documento

Este arquivo preserva o histórico técnico das antigas views:

```txt
/genealogia
/visao-completa
```

Essas rotas foram removidas como views ativas do produto.

A baseline atual da árvore mantém apenas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

---

## 2. Por que este documento foi arquivado

A documentação anterior descrevia:

- `/genealogia` como view ReactFlow por gerações;
- `/visao-completa` como view ReactFlow de base ampliada/completa;
- chips mobile de geração;
- `GenealogyMobileStageTabs`;
- `genealogyColumnsLayout`;
- `FamilyTree`;
- `PersonNode`;
- `GenealogySpouseEdge`;
- cabeçalhos `Geração N`.

Esse comportamento não deve mais orientar produto ativo.

O título `Genealogia de {nome}` ainda pode aparecer em `/mapa-familiar-horizontal`, mas isso é conceito visual/exportável, não restauração da rota `/genealogia`.

---

## 3. Estado atual substituto

| Item antigo | Estado atual |
|---|---|
| `/genealogia` | removida como view ativa |
| `/visao-completa` | removida como view ativa |
| `viewMode = genealogia` | removido |
| `viewMode = visao-completa` | removido |
| Genealogia ReactFlow mobile | removida do produto ativo |
| Horizontal por gerações | consolidada em `/mapa-familiar-horizontal` |
| Horizontal mobile | `MobileFamilyHorizontalMapView`, uma geração por tela |

---

## 4. Diferença importante

Não confundir:

```txt
/genealogia
```

com:

```txt
/mapa-familiar-horizontal
```

A horizontal atual:

- é rota oficial;
- usa `DesktopFamilyHorizontalMapView` no desktop/tablet;
- usa `MobileFamilyHorizontalMapView` no mobile;
- usa HTML/CSS/SVG próprio;
- pode usar `genealogyColumnsLayout` como referência técnica;
- não é a antiga view ReactFlow `/genealogia`.

---

## 5. Conteúdo histórico preservado

A antiga documentação registrava:

- agrupamento por geração;
- inferência visual de geração;
- cabeçalhos `Geração N`;
- cônjuges em layout genealógico;
- chips mobile;
- foco mobile sem filtro destrutivo;
- exportação ReactFlow;
- cuidados para não vazar CSS entre ReactFlow e Mapa Familiar.

Algumas dessas ideias seguem úteis como contexto técnico, mas foram redistribuídas:

| Tema | Documento atual |
|---|---|
| Horizontal atual | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Componentes atuais | `docs/GUIA_COMPONENTES.md` |
| UX horizontal mobile | `docs/GUIA_UX_LAYOUT.md` |
| Exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| Painel/conectores | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |

---

## 6. Arquivos técnicos relacionados ao legado

Não remover automaticamente:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/pages/home/GenealogyMobileStageTabs.tsx
```

Classificação recomendada:

| Arquivo | Tratamento |
|---|---|
| `FamilyTree.tsx` | legado ativo; extrair contratos antes de remover |
| `PersonNode.tsx` | remover apenas junto do stack ReactFlow |
| `MarriageNode.tsx` | revisar tipos antes de remover |
| `GenealogySpouseEdge.tsx` | candidato após remoção do renderer legado |
| `genealogyColumnsLayout.ts` | preservar enquanto horizontal depender |
| `GenealogyMobileStageTabs.tsx` | candidato a remoção após confirmar zero imports |

---

## 7. Regras que continuam válidas

Ainda são úteis como anti-regressão:

- não aplicar CSS de horizontal HTML/SVG em cards ReactFlow;
- não remover `genealogyColumnsLayout.ts` sem confirmar dependências;
- não usar rota antiga como fallback;
- não persistir inferência visual de geração no Supabase;
- não transformar título “Genealogia” da horizontal em rota `/genealogia`.

---

## 8. Regras que não devem ser reativadas

Não reintroduzir:

```txt
/genealogia
/visao-completa
viewMode = genealogia
viewMode = visao-completa
```

Não restaurar:

- favoritos para `/genealogia` ou `/visao-completa`;
- busca global para essas rotas;
- menu de usuário com essas rotas;
- documentação canônica tratando essas rotas como ativas.

---

## 9. Quando consultar este histórico

Consultar apenas para:

- entender por que há arquivos com nomes `Genealogy`;
- planejar remoção futura de ReactFlow legado;
- comparar layout antigo por geração com horizontal atual;
- rastrear decisões de chips mobile antigos.

Fonte de verdade atual:

```txt
docs/BASELINE_PRODUTO_ATUAL.md
docs/INVENTARIO_TECNICO.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/GUIA_COMPONENTES.md
```
