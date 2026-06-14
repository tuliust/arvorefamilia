# Legado - Filtros, pets e regras da antiga Minha Árvore

> Última revisão histórica: 2026-06-13  
> Local recomendado: `docs/historico/MINHA_ARVORE_FILTROS_E_PETS.md`  
> Origem: `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`  
> Status: **legado arquivado com regras extraídas para documentação canônica atual**.

---

## 1. Função deste documento

Este arquivo preserva o histórico da documentação de filtros, pets e cônjuges originalmente associada à antiga view:

```txt
/minha-arvore
```

A rota `/minha-arvore` não é mais view ativa.

As regras ainda vigentes foram transferidas para:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
```

---

## 2. Estado atual

Views oficiais que usam regras atuais de filtros:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Exceção vigente:

```txt
/minha-arvore/editar
```

é rota de edição e não usa este documento como guia de view.

---

## 3. Regras preservadas na documentação canônica

As regras abaixo continuam válidas e já devem ser consultadas nos guias atuais.

### 3.1 Separação de filtros

Estados conceituais:

| Estado | Papel |
|---|---|
| `personFilters` | filtra vivos, falecidos e pets por status/tipo |
| `directRelativeFilters` | filtra grupos diretos e grupos visuais |
| `edgeFilters` | legado/ReactFlow; não comanda conectores HTML/SVG das views oficiais |
| `visualLineFilters` | destaque/linhas visuais conforme view |
| `genealogyFilters` | legado associado a views removidas; não é filtro principal das views oficiais |

Regra:

```txt
Filtro de grupo não é filtro de vida.
Filtro de vida não é filtro de linha.
Destaque não altera dados nem contadores.
```

### 3.2 Pets

Regra semântica:

```txt
pessoas.humano_ou_pet === 'Pet'
```

Helpers recomendados:

```txt
isPetFamilyMember(pessoa)
isHumanFamilyMember(pessoa)
```

Regras:

- não inferir pet pelo nome;
- não inferir pet apenas pelo grupo visual;
- `genero = pet` pode orientar avatar, mas não substitui regra semântica se houver divergência;
- não criar relacionamento `tutor` ou tipo `pet` sem decisão de schema.

### 3.3 Avatar

Prioridade visual:

1. `foto_principal_url`;
2. `genero`;
3. fallback visual.

Valores visuais esperados:

```txt
homem
mulher
pet
```

### 3.4 Cônjuges

Sempre visíveis quando existirem:

- cônjuge da pessoa central;
- cônjuges de avós;
- cônjuges de bisavós;
- cônjuges de tataravós.

Filtráveis:

- cônjuges de tios;
- cônjuges de primos;
- cônjuges de sobrinhos;
- cônjuges de filhos;
- cônjuges de netos.

Regra crítica:

```txt
Conector conjugal deve depender de relacionamento conjuge explícito.
```

---

## 4. Regras que não devem voltar como estavam

Não documentar novamente como produto ativo:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Não tratar:

- `directRelativeFilters` como contrato da antiga view `/minha-arvore`;
- `GenealogyFilters` como filtro principal das views oficiais;
- `MobileFamilyHorizontalMapView` como barra `Paterno | Central | Materno`;
- `/mapa-familiar-horizontal` como `/genealogia`.

---

## 5. Estado atual por view

| View | Uso atual dos filtros |
|---|---|
| `/mapa-familiar` desktop/tablet | grupos diretos, status/tipo, cônjuges e pets |
| `/mapa-familiar` mobile | `MobileFamilyTreeView` com comportamento mobile compartilhado |
| `/mapa-familiar-horizontal` desktop/tablet | grupos/status aplicados à horizontal por geração |
| `/mapa-familiar-horizontal` mobile | filtros aplicados à geração ativa/paginada |
| `/minha-arvore/editar` | edição; não é view de filtros da árvore |

---

## 6. Contadores

Regra preservada:

```txt
Desligar um grupo não deve zerar a contagem do próprio card.
```

A contagem deve considerar:

- escopo da view;
- filtros de status/tipo;
- dados renderizados;
- contagem efetiva retornada pela view quando disponível.

Cônjuges sempre visíveis não devem inflar a contagem de cônjuges filtráveis.

---

## 7. Conteúdo histórico útil

Este documento pode ser consultado para entender:

- origem da separação entre pets de grupo e pets de status;
- origem da regra de cônjuges sempre visíveis;
- mobile segmentado `Paterno | Central | Materno`;
- motivo de `directRelativeFilters.pets` e `personFilters.pets` existirem separadamente.

---

## 8. Fonte de verdade atual

Consultar:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/REGRAS_DE_NAO_REGRESSAO.md
```

Não usar este documento para orientar implementação nova.
