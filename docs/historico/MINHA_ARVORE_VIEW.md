# Legado - Minha Árvore

> Última revisão histórica: 2026-06-13  
> Local recomendado: `docs/historico/MINHA_ARVORE_VIEW.md`  
> Origem: `docs/funcionalidades/MINHA_ARVORE_VIEW.md`  
> Status: **legado arquivado**. Este documento não é canônico para implementação atual.

---

## 1. Função deste documento

Este arquivo preserva o histórico técnico da antiga view:

```txt
/minha-arvore
```

A rota `/minha-arvore` foi removida como view ativa da árvore.

A baseline atual do produto mantém apenas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Exceção importante:

```txt
/minha-arvore/editar
```

continua vigente como rota de edição de membro. Essa rota não é a antiga view de árvore.

---

## 2. Por que este documento foi arquivado

A documentação anterior tratava `/minha-arvore` como view direta da pessoa central, com renderização ReactFlow no desktop/tablet e `MobileFamilyTreeView` no mobile.

Esse comportamento não é mais rota ativa do produto.

O conteúdo foi reclassificado porque:

- `/minha-arvore` não consta mais no roteamento ativo;
- `TreeViewMode` não possui mais `minha-arvore`;
- o produto atual usa `/mapa-familiar` como view principal;
- `/mapa-familiar` reutiliza `MobileFamilyTreeView` no mobile, mas isso não reativa a rota `/minha-arvore`;
- partes técnicas do renderer ReactFlow ainda podem existir como legado ativo, mas não representam view oficial.

---

## 3. Estado atual substituto

| Item antigo | Estado atual |
|---|---|
| `/minha-arvore` | removida como view ativa |
| `viewMode = minha-arvore` | removido |
| view direta ReactFlow como principal | substituída por `/mapa-familiar` |
| mobile segmentado da Minha Árvore | reaproveitado por `/mapa-familiar` mobile via `MobileFamilyTreeView` |
| edição da própria árvore | preservada em `/minha-arvore/editar` |

---

## 4. Conteúdo histórico preservado

A antiga view documentava:

- pessoa central;
- pais;
- avós, bisavós e tataravós;
- cônjuge;
- irmãos;
- filhos;
- netos;
- tios;
- primos;
- sobrinhos;
- pets;
- linhas de parentesco;
- filtros e destaques;
- clique em pessoa para abrir perfil;
- clique em relacionamento conjugal;
- exportação via ações da árvore;
- mobile segmentado `Paterno | Central | Materno`.

Esses conceitos foram redistribuídos para documentos canônicos atuais:

| Tema | Documento atual |
|---|---|
| Mapa Familiar vertical/mobile | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Filtros, pets e cônjuges | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Componentes | `docs/GUIA_COMPONENTES.md` |
| UX mobile | `docs/GUIA_UX_LAYOUT.md` |
| Exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |

---

## 5. Arquivos técnicos relacionados ao legado

Alguns arquivos citados pela antiga documentação ainda podem existir no código.

Não remover automaticamente:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Motivos:

- podem conter contratos ainda usados, como `FamilyTreeActions`;
- layouts com nomes antigos podem ser dependência real das views atuais;
- ReactFlow pode permanecer como dependência técnica até refatoração própria;
- remoção deve acontecer em frente separada, com busca de imports e build.

---

## 6. Regras que continuam válidas em docs atuais

Mesmo com a rota removida, algumas regras seguem válidas e foram preservadas na documentação canônica:

- `MobileFamilyTreeView` é usado por `/mapa-familiar` mobile;
- filtros de pets continuam separados entre tipo/status e grupo;
- cônjuges têm regra específica de visibilidade;
- conectores não devem inferir casamento por proximidade visual;
- exportação deve ignorar painel, header, bottom nav, overlays e loading;
- ajustes visuais não alteram dados reais.

---

## 7. Regras que não devem ser reativadas

Não reintroduzir:

```txt
/minha-arvore
viewMode = minha-arvore
```

como view ativa para resolver erro de documentação, teste ou navegação.

Não usar este documento para:

- criar rotas;
- restaurar links;
- restaurar favoritos;
- restaurar busca global;
- orientar novas alterações na árvore.

---

## 8. Quando consultar este histórico

Consultar apenas para:

- entender decisões antigas;
- recuperar contexto de ReactFlow;
- revisar motivo de componentes legados;
- planejar remoção futura de código morto;
- comparar comportamento histórico com a baseline atual.

Fonte de verdade atual:

```txt
docs/BASELINE_PRODUTO_ATUAL.md
docs/INVENTARIO_TECNICO.md
docs/DECISOES_ARQUITETURAIS.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```
