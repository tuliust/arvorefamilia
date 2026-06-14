# Legado — Filtros, pets e regras da antiga Minha Árvore

> Última revisão histórica: 2026-06-14  
> Local recomendado: `docs/historico/MINHA_ARVORE_FILTROS_E_PETS.md`  
> Origem: `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`  
> Status: **legado arquivado com regras extraídas para documentação canônica atual**.

---

## 1. Função deste documento

Este arquivo preserva o histórico da documentação de filtros, pets, cônjuges e avatares originalmente associada à antiga view:

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
docs/REGRAS_DE_NAO_REGRESSAO.md
```

---

## 2. Estado atual

Views oficiais que usam as regras atuais de filtros:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Exceção vigente:

```txt
/minha-arvore/editar
```

Essa rota é de edição de perfil/árvore do membro e não usa este documento como guia de view.

---

## 3. Regras preservadas na documentação canônica

As regras abaixo continuam válidas, mas devem ser consultadas nos guias atuais.

### 3.1 Separação de filtros

Estados conceituais:

| Estado | Papel atual |
|---|---|
| `personFilters` | filtra vivos, falecidos e pets por status/tipo |
| `directRelativeFilters` | filtra grupos diretos e grupos visuais |
| `visualLineFilters` | controla destaque/visibilidade de linhas conforme view |
| `activeHighlights` | controla `Destacar`: linhas, cards e grupos |
| `edgeFilters` | legado/ReactFlow; não comanda conectores HTML/SVG das views oficiais |
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
- `genero = pet` pode orientar fallback visual legado, mas não substitui regra semântica se houver divergência;
- não criar relacionamento `tutor` ou tipo `pet` sem decisão de schema;
- pets devem respeitar filtros de grupo e filtros de status/tipo quando aplicável.

### 3.3 Avatar

Contrato visual atual:

| Situação | Avatar |
|---|---|
| Pessoa com `foto_principal_url` | foto real |
| Pessoa humana sem foto | ícone `User` de `lucide-react` |
| Pet sem foto | ícone `PawPrint` de `lucide-react` |

Regra atual:

```txt
foto real > pet > pessoa sem foto
```

Não há mais distinção visual obrigatória por gênero para avatar sem foto.

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

Não inferir cônjuge por proximidade visual, sobrenome, ordem de card ou posição no layout.

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
- `/mapa-familiar-horizontal` como `/genealogia`;
- avatar por gênero como contrato obrigatório atual;
- paleta mobile como conjunto de cores hardcoded independente do desktop.

---

## 5. Estado atual por view

| View | Uso atual dos filtros |
|---|---|
| `/mapa-familiar` desktop/tablet | grupos diretos, status/tipo, cônjuges, pets, destaques e exportação |
| `/mapa-familiar` mobile | `MobileFamilyTreeView`, navegação Paterno/Central/Materno e modal mobile de controles |
| `/mapa-familiar-horizontal` desktop/tablet | grupos/status aplicados à horizontal por geração |
| `/mapa-familiar-horizontal` mobile | filtros aplicados à geração ativa/paginada, com uma geração por tela |
| `/minha-arvore/editar` | edição; não é view de filtros da árvore |

---

## 6. Modal mobile atual

O histórico de filtros foi substituído no produto ativo por um modal mobile específico.

Contrato atual:

- título `Controles`;
- sem subtítulo;
- botão superior direito com `X`;
- toggle `Vertical` / `Horizontal`;
- botões principais:
  - `Cores`;
  - `Grupos`;
  - `Destacar`;
- `Grupos` abre/fecha os cards de grupos;
- grupos não ficam visíveis por padrão no modal mobile;
- filtros de status ficam visíveis;
- filtros ficam em 4 colunas quando houver espaço conforme regra CSS atual;
- mobile não deve mostrar Zoom, Restaurar ou Exportar.

---

## 7. Contadores

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

## 8. Paletas

Contrato atual:

```txt
white
visual
orange
brown
```

Regras:

- desktop é referência visual;
- mobile deve herdar os mesmos tokens CSS `--tree-palette-*`;
- paletas afetam cards, bordas, textos, ícones, conectores, canvas e exportação;
- não criar paleta mobile paralela com classes fixas;
- se houver divergência visual, corrigir o mobile para seguir o desktop.

---

## 9. Conteúdo histórico útil

Este documento pode ser consultado para entender:

- origem da separação entre pets de grupo e pets de status;
- origem da regra de cônjuges sempre visíveis;
- origem do mobile segmentado `Paterno | Central | Materno`;
- motivo de `directRelativeFilters.pets` e `personFilters.pets` existirem separadamente;
- como regras antigas foram migradas para a baseline atual.

---

## 10. Fonte de verdade atual

Consultar:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/BASELINE_PRODUTO_ATUAL.md
```

Não usar este documento para orientar implementação nova.
