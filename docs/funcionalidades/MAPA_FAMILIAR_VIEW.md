
# Mapa Familiar — views Vertical e Horizontal

> Última revisão: 2026-06-14
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`
> Tipo: documentação funcional/técnica das duas views oficiais da árvore
> Status: organizado para descrever contratos funcionais e apontar QA manual para `docs/QA_MANUAL.md`.

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

| Tema | Documento |
|---|---|
| Exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| Painel, filtros e destaques | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| QA manual | `docs/QA_MANUAL.md` |
| Pendências abertas | `docs/PLANO_PROXIMOS_PASSOS.md` |

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
★ AAAA, quando houver nascimento
✥ AAAA, quando houver falecimento
```

Regras:

- não exibir linha de nascimento sem dado real;
- não exibir linha de falecimento sem dado real;
- não exibir visualmente `Nascimento não informado`;
- não exibir visualmente `Falecimento não informado`;
- manter dívida `TREE-004` aberta até remover o fallback direto do componente React.

---

## 14. Exportação

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

## 15. QA e pendências

Este documento descreve contratos funcionais. Para execução de QA, usar:

```txt
docs/QA_MANUAL.md
```

Pendências relacionadas:

| ID | Tema |
|---|---|
| `TREE-001` | validar visualmente `/mapa-familiar` com dados reais |
| `TREE-002` | validar visualmente `/mapa-familiar-horizontal` com dados reais |
| `TREE-003` | verificar/corrigir cônjuges de `pais`/Geração 4 na horizontal |
| `TREE-004` | remover dependência de limpeza DOM para datas desconhecidas no mobile |
| `TREE-005` | decidir destino do dropdown `Visualizar como...` |

Fonte das pendências:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

<!-- ajuste-irmaos-conjuges-mapa-familiar-2026-06 -->

## Mapa familiar ? irm?os e c?njuges

Na p?gina `/mapa-familiar`:

- O grupo `Irm?os` exibe at? 4 cards antes de apresentar controle de expandir/recolher.
- Em grade dupla, quando houver quantidade ?mpar de cards vis?veis, o ?ltimo card isolado fica centralizado na segunda linha.
- C?njuges de irm?os s?o exibidos no grupo `Irm?os` quando o filtro `C?njuges` est? ativo e existe relacionamento expl?cito `tipo_relacionamento === 'conjuge'`.
- Esse comportamento n?o cria nem infere dados; depende exclusivamente dos relacionamentos persistidos.
- A regra acima se aplica ? p?gina `/mapa-familiar`. N?o assumir o mesmo comportamento para `/mapa-familiar-horizontal` sem valida??o espec?fica.
<!-- ajuste-mapa-horizontal-conjuges-filhos-2026-06 -->

## Mapa familiar horizontal ? c?njuges e filhos de casais vis?veis

Na rota `/mapa-familiar-horizontal`:

- O filtro `C?njuges` tamb?m considera c?njuges de pessoas do grupo `Irm?os`/n?cleo.
- C?njuges exibidos no mesmo grupo geracional devem ficar adjacentes e conectados verticalmente.
- Layana deve aparecer abaixo de Tassius Marcius quando `C?njuges` estiver ativo.
- Suze Souza, segundo relacionamento de M?rcio Ailton, deve aparecer apenas quando `C?njuges` estiver ativo e posicionada acima de M?rcio Ailton.
- Quando ambos os pais de um casal vis?vel estiverem exibidos, filhos comuns da 6? gera??o devem aparecer na coluna da direita e receber conex?o a partir da uni?o do casal.
- Casos cobertos: Heitor, filho de Tassius e Layana; In?cio Leal, filho de Camilla e Gilvan; Lorendo, filho de M?rcio Ailton e Suze Souza.
- A regra n?o cria nem infere v?nculos inexistentes; depende de relacionamentos expl?citos de `conjuge` e filia??o j? persistidos.

<!-- MAPA-FAMILIAR-PENDENCIAS-2026-06-18 -->
## Pontos recentes a confirmar nos mapas familiares

NÃ£o registrar os itens abaixo como implementados sem confirmaÃ§Ã£o no Git:

- contagem de cÃ´njuges no mapa horizontal;
- subida de grupos no mapa vertical quando houver poucos parentes;
- toolbar mobile com controles de visualizaÃ§Ã£o/formato/cor/filtros/exportaÃ§Ã£o;
- comportamento de popovers e painÃ©is em mobile/desktop;
- regra final de grupos, cÃ´njuges, filhos, sobrinhos e netos por filtro.

Quando confirmados, documentar separando:

- comportamento desktop;
- comportamento mobile;
- regras de contagem;
- regras de renderizaÃ§Ã£o;
- regras de filtros.
