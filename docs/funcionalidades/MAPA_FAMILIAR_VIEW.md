# Mapa Familiar — views Vertical e Horizontal

> Última revisão: 2026-06-14
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`
> Tipo: documentação funcional/técnica das duas views oficiais da árvore.
> Status: revisado para separar comportamento implementado de pendências abertas.

---

## 1. Função deste documento

Este documento descreve as duas views oficiais da árvore:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Ele cobre:

- rotas e títulos;
- renderização desktop/mobile;
- filtros;
- cônjuges;
- pets;
- paletas;
- conectores;
- exportação;
- regras de mobile;
- pendências conhecidas.

Não cobre em detalhe:

- exportação: ver `docs/funcionalidades/EXPORTACAO_ARVORE.md`;
- painel/filtros/destaques: ver `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- rotas e guards: ver `docs/arquitetura/ROTAS_E_GUARDS.md`.

---

## 2. Rotas oficiais

| View | Rota | Papel |
|---|---|---|
| Árvore Familiar | `/mapa-familiar` | view vertical principal/default |
| Mapa Genealógico | `/mapa-familiar-horizontal` | view horizontal/genealógica por gerações |

Redirect vigente:

```txt
/ -> /mapa-familiar
```

com preservação de `location.search`, especialmente `?pessoa=...`.

Rotas antigas removidas do produto ativo:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção vigente:

```txt
/minha-arvore/editar
```

Essa exceção é página de edição do membro, não view da árvore.

---

## 3. `TreeViewMode`

Contrato vigente:

```txt
mapa-familiar
mapa-familiar-horizontal
```

Mapeamento:

| ViewMode | Path |
|---|---|
| `mapa-familiar` | `/mapa-familiar` |
| `mapa-familiar-horizontal` | `/mapa-familiar-horizontal` |

Fallback:

```txt
getTreeViewModeFromPath(pathname desconhecido) -> mapa-familiar
```

Regras:

- não reintroduzir `minha-arvore`, `genealogia` ou `visao-completa`;
- não criar alias silencioso para rotas removidas;
- alternância Vertical/Horizontal preserva query string.

---

## 4. Matriz de renderização

| Rota | Desktop/tablet | Mobile |
|---|---|---|
| `/mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `MobileFamilyHorizontalMapView` |

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/treeColorPalettes.ts
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-map-mobile-palettes.css
```

---

## 5. Títulos

| Rota | Título funcional/exportável |
|---|---|
| `/mapa-familiar` | `Árvore Familiar de {primeiroNome}` ou `Árvore Familiar` |
| `/mapa-familiar-horizontal` | `Mapa Genealógico de {primeiroNome}` ou `Mapa Genealógico` |

Observações:

- “Genealogia” pode aparecer como termo conceitual;
- isso não reativa `/genealogia`;
- rótulos de navegação podem ser mais curtos, desde que não contradigam a rota canônica.

---

## 6. Árvore Familiar Vertical — `/mapa-familiar`

### Desktop/tablet

Componente:

```txt
DesktopFamilyMapView
```

Responsabilidades:

- renderizar canvas vertical/panorâmico;
- agrupar relações diretas;
- aplicar filtros de grupos e status;
- exibir pessoa central;
- exibir cônjuge principal;
- suportar múltiplos núcleos conjugais da pessoa central quando dados reais existirem;
- exibir pets quando presentes e filtráveis;
- desenhar conectores SVG por âncoras;
- controlar zoom/scroll;
- responder a ações de exportação;
- informar contagens renderizadas ao painel.

Regras:

- não corrigir layout criando dados fictícios;
- não inferir conector conjugal por proximidade visual;
- conectores dependem de relacionamentos explícitos;
- alterações de layout exigem QA visual com dados reais.

### Mobile

Componente:

```txt
MobileFamilyTreeView
```

Contrato mobile:

```txt
Paterno
Central
Materno
```

Regras:

- não usar navegação `Ger X` da horizontal;
- preservar paleta ativa;
- bordas e fundos de grupos seguem tokens da paleta;
- conectores HTML/CSS devem seguir a hierarquia visual do desktop;
- controles de árvore ficam no modal mobile, não dentro do card.

---

## 7. Mapa Genealógico Horizontal — `/mapa-familiar-horizontal`

### Desktop/tablet

Componente:

```txt
DesktopFamilyHorizontalMapView
```

Responsabilidades:

- organizar pessoas por geração;
- usar `manual_generation` quando disponível;
- inferir geração apenas em memória quando necessário;
- ocultar colunas vazias;
- posicionar cônjuges adjacentes quando a regra atual os inclui;
- desenhar conectores SVG casal → filhos;
- compactar visual por geração;
- exportar com título `Mapa Genealógico`.

### Mobile

Componente:

```txt
MobileFamilyHorizontalMapView
```

Contrato:

```txt
1 geração = 1 tela
botões Ger 1/Ger 2/Ger 3... = navegação
swipe lateral = troca de geração
scroll vertical = dentro da geração ativa
sem scroll horizontal manual
```

Regras:

- não usar barra `Paterno | Central | Materno`;
- não criar subrotas por geração;
- não reintroduzir setas laterais como navegação principal;
- botão de controles fica alinhado à linha de `Ger`;
- altura rolável deve permitir visualizar cards e conectores;
- primeira tela deve corresponder à menor geração visível;
- mobile deve seguir a estrutura da horizontal desktop, não criar hierarquia alternativa.

---

## 8. Grupos e filtros

Grupos diretos esperados:

```txt
tataravos
bisavos
avos
pais
tios
primos
sobrinhos
irmaos
filhos
netos
conjuge
pets
```

Regras:

- filtros não alteram dados no Supabase;
- pessoa central deve permanecer visível quando aplicável;
- contagens devem refletir o que a view renderiza;
- cônjuge sempre visível não deve inflar contagem de cônjuges filtráveis;
- `Pets` pode participar de filtro de grupo e de status/tipo.

---

## 9. Cônjuges

### 9.1 Sempre visíveis

Não dependem do filtro `Cônjuges`:

- cônjuge da pessoa central;
- cônjuges de avós;
- cônjuges de bisavós;
- cônjuges de tataravós.

### 9.2 Filtráveis implementados no código atual

Dependem do filtro `Cônjuges`:

```txt
tios
primos
sobrinhos
filhos
netos
```

Essa regra vale para a horizontal desktop e mobile conforme o conjunto filtrável atualmente declarado nos componentes.

### 9.3 Pendência conhecida: `pais`/Geração 4

A documentação de produto desejava que cônjuges de pessoas classificadas como `pais`/Geração 4 também aparecessem na horizontal quando `Cônjuges` estivesse ativo. No código atual auditado, `pais` **não** está no conjunto de grupos filtráveis.

Portanto:

- não tratar cônjuges de `pais`/Geração 4 na horizontal como implementados;
- manter o comportamento como pendência `TREE-003` em `docs/PLANO_PROXIMOS_PASSOS.md`;
- corrigir apenas em frente de código autorizada;
- após correção, atualizar este documento e as regras de não regressão.

---

## 10. Núcleos conjugais adicionais

Na vertical `/mapa-familiar`, quando a pessoa central possui mais de um relacionamento conjugal:

- o primeiro cônjuge visível permanece como núcleo principal;
- cônjuges adicionais podem gerar bloco `Outro relacionamento`;
- filhos devem ser agrupados pelo outro pai/mãe quando houver relacionamento explícito;
- filhos sem outro pai/mãe identificado permanecem no grupo principal;
- o layout deve reservar espaço sem sobrepor irmãos, sobrinhos, filhos, netos ou pets.

Regras:

```txt
Ajuste visual não cria pessoa.
Ajuste visual não cria relacionamento.
Conector conjugal exige relacionamento explícito.
```

---

## 11. Pets

Regras:

- pets usam `PawPrint` como avatar padrão quando não há foto;
- pets seguem a paleta ativa;
- pets podem ser filtrados;
- pets não devem receber avatar de pessoa;
- compatibilidade de dados de pets não deve ser removida sem migration/análise.

---

## 12. Paletas e cards

Paletas oficiais:

```txt
white
visual
orange
brown
```

Contrato:

- desktop é referência visual;
- mobile herda o mesmo contrato visual;
- cards, bordas, grupos, conectores, labels e canvas mudam juntos;
- exportação preserva a paleta ativa;
- a paleta Visual/Azul pode usar gradientes teal/ciano/azul;
- paletas Branca, Laranja e Marrom não podem cair em fallback azul/teal.

Arquivos críticos:

```txt
src/app/components/FamilyTree/treeColorPalettes.ts
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-map-mobile-palettes.css
src/styles/tree-panel-palette-cards.css
```

---

## 13. Cards mobile de pessoas

Contrato visual em `/mapa-familiar` mobile:

```txt
Nome da pessoa
★ AAAA, se houver nascimento
✥ AAAA, se houver falecimento
```

Regras:

- não exibir `Nascimento não informado`;
- não exibir `Falecimento não informado`;
- não exibir linha de nascimento sem ano/data real;
- não exibir linha de falecimento sem ano/data real;
- manter contraste em todas as paletas.

### Dívida técnica conhecida

O contrato visual acima é vigente, mas a solução atual depende de limpeza/ocultação posterior em `src/main.tsx`. A correção estrutural deve remover o fallback no componente React. Pendência registrada como `TREE-004`.

---

## 14. Conectores

### Vertical desktop

- SVG por âncoras;
- recalculado com filtros, zoom, painel e modo wide;
- não invade cards;
- não cria relação por proximidade.

### Vertical mobile

- conectores HTML/CSS;
- seguem eixo visual de Paterno/Central/Materno;
- usam paleta ativa;
- não afetam horizontal mobile.

### Horizontal desktop

- SVG por geração/casal/filhos;
- cônjuge adjacente quando incluído pelas regras atuais;
- casal → tronco → filhos;
- colunas vazias ocultadas;
- conector conjugal depende de relacionamento explícito.

### Horizontal mobile

- recorte por geração;
- conectores da geração ativa;
- scroll vertical considera cards e linhas;
- sem scroll horizontal manual.

---

## 15. Exportação

A exportação das views oficiais é detalhada em:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Contrato resumido:

- exportar Área, PNG, PDF e Imprimir;
- não capturar painel, header, bottom nav, modal, overlays, loading ou debug;
- preservar título, paleta, conectores, cards e filtros;
- capturar a view ativa ou a área selecionada.

---

## 16. Debug temporário

O seletor `Visualizar como...`, quando presente:

- é ferramenta de QA/debug;
- não deve entrar na exportação;
- não deve ser tratado como produto final sem decisão;
- está registrado como pendência `TREE-005`.

---

## 17. Checklist mínimo de QA

### Rotas

- [ ] `/mapa-familiar` renderiza vertical.
- [ ] `/mapa-familiar-horizontal` renderiza horizontal.
- [ ] `/` redireciona preservando query.
- [ ] `/minha-arvore`, `/genealogia`, `/visao-completa` não voltaram como views ativas.
- [ ] `/minha-arvore/editar` permanece vigente.

### Desktop

- [ ] Painel funciona sem abas antigas.
- [ ] Paletas funcionam nas duas views.
- [ ] Cônjuges e pets respeitam filtros.
- [ ] Conectores não invadem cards.
- [ ] Exportação funciona.

### Mobile

- [ ] Vertical usa Paterno/Central/Materno.
- [ ] Horizontal usa `Ger X`.
- [ ] Modal mobile não mostra Zoom/Exportar.
- [ ] Paletas não caem em fallback azul indevido.
- [ ] Cards não exibem microcopy de dado ausente.

---

## 18. Buscas úteis

```bash
rg "/minha-arvore|/genealogia|/visao-completa" docs src
rg "TreeViewMode|treeViewMode" docs src
rg "DesktopFamilyMapView|MobileFamilyTreeView" docs src
rg "DesktopFamilyHorizontalMapView|MobileFamilyHorizontalMapView" docs src
rg "FILTERABLE_SPOUSE_ANCHOR_GROUPS" src
rg "Nascimento não informado|Falecimento não informado" docs src
```
