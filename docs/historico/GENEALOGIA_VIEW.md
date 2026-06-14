# Legado — Genealogia e Visão Completa

> Última revisão histórica: 2026-06-14  
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

A rota horizontal atual pode usar linguagem genealógica no produto, mas a rota `/genealogia` não voltou a existir.

---

## 2. Por que este documento foi arquivado

A documentação anterior descrevia:

- `/genealogia` como view ReactFlow por gerações;
- `/visao-completa` como view ReactFlow de base ampliada/completa;
- chips mobile de geração antigos;
- `GenealogyMobileStageTabs`;
- `GenealogyFilterGrid`;
- `FamilyTree`;
- `PersonNode`;
- `GenealogySpouseEdge`;
- cabeçalhos `Geração N`.

Esse comportamento não orienta mais o produto ativo.

O título visual/exportável atual da horizontal deve ser documentado nos guias canônicos como:

```txt
Mapa Genealógico de {primeiroNome}
```

Isso não reativa a rota `/genealogia`.

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
| Horizontal desktop/tablet | `DesktopFamilyHorizontalMapView` |
| Horizontal mobile | `MobileFamilyHorizontalMapView`, uma geração por tela |
| Título conceitual atual | `Mapa Genealógico de {primeiroNome}` |

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
- usa `genealogyColumnsLayout` como referência técnica de ordenação/layout;
- deve seguir o desktop como referência estrutural;
- no mobile, funciona como recorte/paginação responsiva da estrutura desktop;
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

Algumas dessas ideias continuam úteis como contexto técnico, mas foram redistribuídas:

| Tema | Documento atual |
|---|---|
| Horizontal atual | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Componentes atuais | `docs/GUIA_COMPONENTES.md` |
| UX horizontal mobile | `docs/GUIA_UX_LAYOUT.md` |
| Exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| Painel/conectores | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Pendências e QA | `docs/PLANO_PROXIMOS_PASSOS.md` |

---

## 6. Regras atuais derivadas do histórico

As regras abaixo continuam válidas, mas devem ser consultadas nos documentos canônicos atuais.

### 6.1 Gerações

- `/mapa-familiar-horizontal` organiza pessoas por geração.
- `pessoas.manual_generation` é a fonte primária quando disponível.
- Inferência visual pode ocorrer em memória, mas não deve persistir alteração no Supabase.
- A ordem visual deve preservar relações familiares e, quando possível, nascimento.

### 6.2 Mobile horizontal

Contrato atual:

```txt
1 geração = 1 tela
botões Ger 1, Ger 2, Ger 3... = atalho de geração
swipe lateral = troca de geração
scroll vertical = rolagem dentro da geração ativa
```

Regras atuais:

- não usar `G1/G2/G3` como microcopy final se o contrato vigente usa `Ger X`;
- não usar barra `Paterno | Central | Materno` na horizontal mobile;
- não criar subrotas por geração;
- não permitir scroll horizontal manual como navegação principal;
- a altura de rolagem deve considerar cards e linhas conectoras visíveis;
- o desktop é a referência para paletas, hierarquia e conectores.

### 6.3 Conectores

- Conector conjugal depende de relacionamento explícito.
- Não inferir casamento por proximidade visual.
- Mobile deve adaptar escala e recorte, não criar outra hierarquia.
- A refatoração futura ideal é um view model compartilhado entre desktop e mobile.

---

## 7. Arquivos técnicos relacionados ao legado

Não remover automaticamente:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Classificação recomendada:

| Arquivo | Tratamento |
|---|---|
| `FamilyTree.tsx` | legado ativo; remover apenas após extrair contratos e confirmar zero uso |
| `PersonNode.tsx` | remover apenas junto do stack ReactFlow |
| `MarriageNode.tsx` | revisar tipos antes de remover |
| `GenealogySpouseEdge.tsx` | candidato após remoção do renderer legado |
| `genealogyColumnsLayout.ts` | preservar enquanto horizontal depender dele |

Arquivos antigos removidos ou candidatos já tratados em outras frentes não devem ser restaurados por conveniência:

```txt
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/app/pages/home/GenealogyFilterGrid.tsx
```

Se um import quebrar, primeiro validar se o fluxo ainda é vigente. Não restaurar a antiga view ReactFlow para resolver erro local.

---

## 8. Paletas e avatares

Regras atuais que substituem comportamentos históricos:

- desktop é a referência visual das paletas;
- mobile deve herdar tokens `--tree-palette-*`;
- não usar cores hardcoded de `teal/cyan/blue/orange/brown` no mobile fora dos tokens;
- pessoa com `foto_principal_url` usa foto;
- pessoa sem foto usa `User` de `lucide-react`;
- pet usa `PawPrint` de `lucide-react`;
- não há mais distinção visual de avatar por gênero como contrato de produto.

Essas regras devem ficar nos guias canônicos de UX, componentes e não regressão.

---

## 9. Regras que não devem ser reativadas

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
- botão Horizontal apontando para `/visao-completa`;
- documentação canônica tratando essas rotas como ativas;
- horizontal mobile com barra `Paterno | Central | Materno`;
- ReactFlow como renderer público principal da horizontal sem decisão arquitetural específica.

---

## 10. Quando consultar este histórico

Consultar apenas para:

- entender por que há arquivos com nomes `Genealogy`;
- planejar remoção futura de ReactFlow legado;
- comparar layout antigo por geração com horizontal atual;
- rastrear decisões de chips mobile antigos;
- identificar regras que já foram migradas para docs canônicas.

Fonte de verdade atual:

```txt
docs/README.md
docs/BASELINE_PRODUTO_ATUAL.md
docs/INVENTARIO_TECNICO.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/REGRAS_DE_NAO_REGRESSAO.md
```
