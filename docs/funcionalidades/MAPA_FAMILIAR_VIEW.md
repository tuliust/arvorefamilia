# Mapa Familiar — views Vertical e Horizontal

> Última revisão: 2026-06-20  
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`  
> Tipo: documentação funcional/técnica das duas views oficiais da árvore  
> Status: revisado após ajustes mobile de grade 3x3, tela de descendentes, tios, overview/zoom e painel `+`.

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
- filtros e grupos;
- cônjuges;
- pets;
- paletas;
- conectores;
- exportação;
- regras mobile;
- QA e pendências conhecidas.

Documentação complementar específica do mobile:

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
```

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
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
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

### 6.1 Desktop/tablet

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

### 6.2 Mobile

Componente:

```txt
MobileFamilyTreeView
```

Contrato mobile atual:

- `/mapa-familiar` mobile usa grade 3x3;
- a tela central é `core`;
- navegação por swipe/overview deve posicionar o stage na célula correta;
- grupos e cards seguem a paleta ativa;
- conectores HTML/CSS devem respeitar a hierarquia visual;
- telas com conteúdo maior que a altura útil devem ter rolagem interna.

Grade oficial:

| Posição | Tela técnica | Conteúdo |
|---|---|---|
| Superior esquerda | `paternal-ancestors` | bisavós/tataravós paternos |
| Superior centro | `ancestors` | avós paternos e maternos |
| Superior direita | `maternal-ancestors` | bisavós/tataravós maternos |
| Meio esquerda | `paternal-uncles` | tios paternos |
| Meio centro | `core` | pai, mãe e pessoa central |
| Meio direita | `maternal-uncles` | tios maternos |
| Inferior esquerda | `paternal-cousins` | primos paternos |
| Inferior centro | `descendants` | irmãos, cônjuge, sobrinhos, pets, filhos e netos |
| Inferior direita | `maternal-cousins` | primos maternos |

Detalhes completos ficam em:

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
```

---

## 7. Mapa Genealógico Horizontal — `/mapa-familiar-horizontal`

### 7.1 Desktop/tablet

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

### 7.2 Mobile

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

A documentação anterior desejava que cônjuges de pessoas classificadas como `pais`/Geração 4 também aparecessem na horizontal quando `Cônjuges` estivesse ativo. No código atual auditado, `pais` não está consolidado como grupo filtrável.

Portanto:

- não tratar cônjuges de `pais`/Geração 4 na horizontal como implementados sem nova verificação;
- manter a pendência em `docs/PLANO_PROXIMOS_PASSOS.md`;
- corrigir apenas em frente de código autorizada;
- após correção, atualizar este documento, `REGRAS_DE_NAO_REGRESSAO.md` e `QA_MANUAL.md`.

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

---

## 13. Cards mobile de pessoas

Contrato visual em `/mapa-familiar` mobile:

```txt
Nome da pessoa
★ AAAA, quando houver nascimento
✥ AAAA, quando houver falecimento
```

Regras:

- não exibir linha de nascimento sem dado real;
- não exibir linha de falecimento sem dado real;
- não exibir visualmente `Nascimento não informado`;
- não exibir visualmente `Falecimento não informado`;
- manter dívida técnica aberta até remover o fallback direto do componente React.

---

## 14. Zoom/overview mobile

O botão `Zoom` da toolbar mobile deve abrir um overview com 9 cards.

Em `/mapa-familiar`:

- cada card leva à tela correspondente da grade 3x3;
- o stage é posicionado por `transform`;
- a tela ativa é registrada em `data-mobile-family-tree-active-screen`.

Em `/mapa-familiar-horizontal`:

- o overview também deve abrir;
- cada card direciona para a geração horizontal correspondente.

Arquivo principal:

```txt
src/mobileFamilyTreeZoomOverviewFix.ts
```

---

## 15. Botão `+` mobile

O botão `+` abre o painel mobile completo de visualização.

Contrato:

- overlay escurecido;
- painel principal branco/opaco;
- rolagem interna própria;
- painel excluído da exportação.

Arquivo relacionado:

```txt
src/mobileFamilyMapFullPanelStyleFix.ts
```

---

## 16. Exportação

A exportação é suportada nas duas views oficiais.

Resumo:

- Área;
- Imagem/PNG;
- PDF;
- Imprimir.

Detalhes técnicos ficam em:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

QA manual fica em:

```txt
docs/QA_MANUAL.md
```

---

## 17. QA e pendências

Este documento descreve contratos funcionais. Para execução de QA, usar:

```txt
docs/QA_MANUAL.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
```

Pendências relacionadas:

| ID | Tema |
|---|---|
| `TREE-001` | validar visualmente `/mapa-familiar` com dados reais |
| `TREE-002` | validar visualmente `/mapa-familiar-horizontal` com dados reais |
| `TREE-003` | verificar/corrigir cônjuges de `pais`/Geração 4 na horizontal |
| `TREE-004` | remover dependência de limpeza DOM para datas desconhecidas no mobile |
| `MOB-001` | confirmar rolagem interna de `descendants` em iPhone/Safari |
| `MOB-002` | confirmar exibição estável dos cards em `paternal-uncles` |
| `MOB-003` | avaliar consolidação de scripts auxiliares mobile no React |
| `MOB-004` | confirmar mapeamento do overview da horizontal por geração |
| `MOB-005` | confirmar overlay opaco do painel `+` em iPhone/Safari |

Fonte das pendências:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```
