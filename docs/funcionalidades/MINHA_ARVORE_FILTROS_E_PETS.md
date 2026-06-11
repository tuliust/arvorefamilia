# Minha Árvore - filtros, pets e regras de exibição

> Última revisão: 2026-06-11
> Local canônico: `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`
> Tipo: documentação funcional da view **Minha Árvore**.
> Status: revisado com regras atuais de filtros/status, pets, coluna `genero`, filtro **Cônjuges**, impacto no Mapa Familiar e regras mobile compartilhadas por `MobileFamilyTreeView`.

---

## 1. Função deste documento

Este documento descreve as regras específicas da view **Minha Árvore** relacionadas a:

- filtros de grupos familiares;
- filtros por status/tipo;
- pets;
- separação entre filhos humanos e pets;
- contadores dos cards;
- modo foco da pessoa central;
- impacto dos filtros na renderização da árvore.

Para layout, viewport e ReactFlow, use:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
```

Para legendas, conectores e painel lateral, use:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Para regras próprias da view panorâmica desktop/tablet, use:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

---

## 2. Arquivos principais

```txt
src/app/pages/Home.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/CentralPersonFocusPanel.tsx
src/app/services/memberTreeService.ts
src/app/utils/personEntity.ts
```

Tipos principais:

```txt
DirectRelativeFilters
DirectRelativeGroup
EdgeFilters
VisualLineFilters
```

---

## 3. Modelo atual para pets

O modelo atual preserva compatibilidade com o banco existente.

Regra de domínio:

```txt
pessoas.humano_ou_pet === 'Pet'
```

define semanticamente que a pessoa é pet no domínio legado. Em telas visuais novas, `pessoas.genero = 'pet'` também orienta o avatar de pet, mas não substitui automaticamente a regra semântica enquanto não houver migração/backfill definido.

O relacionamento técnico ainda pode usar:

```txt
relacionamentos.tipo_relacionamento = 'filho'
```

para ligar o pet à família.

Não há migration atual para:

- tipo de relacionamento `pet`;
- tipo de relacionamento `tutor`;
- backfill semântico;
- tabela separada de pets.

Portanto:

- não salvar `tipo_relacionamento = 'pet'` sem migration;
- não criar UI que dependa de `tutor` sem schema;
- documentar qualquer futura mudança de domínio antes de migrar dados.

---



## 3.1 Coluna `genero` e avatar visual

A coluna `pessoas.genero` foi adotada como fonte direta para os avatares gráficos do Mapa Familiar.

Valores esperados:

| Valor | Uso visual |
|---|---|
| `homem` | avatar masculino |
| `mulher` | avatar feminino |
| `pet` | avatar de pet |

Regras:

- foto principal (`foto_principal_url`) tem prioridade sobre avatar gráfico;
- `genero = pet` deve usar o avatar/ícone de pet;
- `genero = homem` ou `genero = mulher` deve escolher avatar humano correspondente;
- `genero` não substitui automaticamente `humano_ou_pet` enquanto o domínio legado continuar existindo;
- se `genero` foi criado manualmente no Supabase, criar migration versionada;
- se o build acusar erro de tipo, atualizar o contrato `Pessoa` para incluir `genero?: 'homem' | 'mulher' | 'pet' | string | null`.

Não fazer:

- inferir gênero por nome quando `genero` existe;
- tratar `genero = pet` como relacionamento familiar;
- alterar RLS ou permissões para corrigir avatar visual.

---

### 3.2 Uso de `genero` no mobile

A partir da revisão de 2026-06-11, a regra de avatar visual por `genero` também se aplica aos cards mobile renderizados por `MobileFamilyTreeView`.

Escopo:

```txt
/minha-arvore em mobile
/mapa-familiar em mobile, quando usa fallback para MobileFamilyTreeView
```

Regras de exibição:

| Dado disponível | Resultado esperado no avatar mobile |
|---|---|
| `foto_principal_url` válida | exibe a foto real da pessoa/pet |
| sem foto + `genero = homem` | exibe avatar gráfico masculino |
| sem foto + `genero = mulher` | exibe avatar gráfico feminino |
| sem foto + `genero = pet` | exibe avatar/ícone de pet |
| sem foto + `genero` ausente | usa fallback visual definido em `FamilyTreeVisualCards.tsx`, sem alterar domínio |

Regras complementares:

- o mobile deve reutilizar a mesma lógica visual de `FamilyTreeVisualCards.tsx` sempre que possível;
- o avatar de pet no mobile não deve depender de relacionamento `filho`;
- `genero = pet` orienta avatar, mas a regra semântica de pet continua sendo `humano_ou_pet === 'Pet'` enquanto não houver backfill/migration de domínio;
- alterações de avatar, badge ou texto do card são visuais e não exigem migration.

### 3.3 Linhas vitais nos cards mobile

Nos cards mobile de `MobileFamilyTreeView`, as linhas de nascimento e falecimento devem exibir apenas o ano ao lado dos ícones.

Exemplos esperados:

```txt
⭐ 1962
✝ 2009
```

Não exibir no mobile:

```txt
⭐ Paulo Afonso/BA 1962
✝ Natal/RN 2009
```

Regras:

- aplicar a Pai, Mãe, pessoa central, avós, bisavós, tataravós, irmãos, sobrinhos, cônjuge, filhos, netos, tios, primos e pets;
- manter fallbacks textuais quando não houver ano;
- não alterar a regra desktop/tablet do Mapa Familiar, que pode usar `vitalMode="full"` em contextos com espaço suficiente;
- não criar migration para essa alteração.

## 4. Helpers obrigatórios

Arquivo:

```txt
src/app/utils/personEntity.ts
```

Usar:

```txt
isHumanFamilyMember(pessoa)
isPetFamilyMember(pessoa)
```

Regras:

- não inferir pet por nome;
- não inferir pet pelo grupo visual;
- não inferir pet apenas pelo relacionamento;
- a fonte semântica é `pessoas.humano_ou_pet`;
- evitar comparações duplicadas em componentes.

---

## 5. Filtros por status/tipo

Estado em `Home.tsx`:

```ts
personFilters = {
  vivos: true,
  falecidos: true,
  pets: true,
}
```

Responsabilidade:

- controlar quais cards de pessoas são renderizados;
- preservar a pessoa central;
- não recalcular a estrutura familiar;
- não alterar dados no Supabase.

Regra central:

```txt
Filtros de status/tipo não devem reorganizar a árvore.
```

Resultado esperado:

- desativar **Vivos** oculta pessoas vivas;
- desativar **Falecidos** oculta pessoas falecidas;
- desativar **Pets** oculta pets;
- a pessoa central permanece visível;
- ramos paterno/materno não devem trocar de lado por causa desses filtros;
- conectores estruturais não devem mudar a semântica da árvore.

---

## 6. Filtros de grupos diretos

Estado em `Home.tsx`:

```ts
directRelativeFilters = {
  pais,
  avos,
  bisavos,
  tataravos,
  conjuge,
  filhos,
  netos,
  irmaos,
  sobrinhos,
  tios,
  primos,
  pets,
}
```

No painel superior, `DirectRelationKpiGrid` usa `DirectRelativeFilterGrid` com `excludedKeys={['pais']}`. Na prática, o card **Pai e Mãe** não aparece no grid principal de filtros, embora exista no tipo/default interno.

Opções visíveis no grid principal:

```txt
Tataravós
Bisavós
Avós
Tios
Primos
Cônjuges
Irmãos
Filhos
Sobrinhos
Netos
```

Regras:

- card de grupo oculta/exibe grupo;
- desativar um grupo não deve zerar o número exibido no próprio card;
- cards com contagem `0` continuam clicáveis;
- grupos diretos não substituem filtros de linhas;
- grupos diretos não persistem no banco;
- em mobile, a view direta usa defaults para evitar painel lateral complexo;
- no mobile segmentado atual, `directRelativeFilters` não funciona como controle interativo de ocultação das telas de núcleo, ancestrais, tios e primos; o código normaliza esses filtros para os defaults e a filtragem efetiva dos cards acontece por `visiblePersonIds`, derivado dos filtros por status/tipo.

---


### 6.1 Impacto dos filtros no layout mobile segmentado

No mobile segmentado da `/minha-arvore`, há uma diferença importante entre os filtros visuais da árvore ReactFlow e a renderização da malha `MobileFamilyTreeView`.

Estado atual confirmado:

- `MobileFamilyTreeView.tsx` recebe `directRelativeFilters`, mas a composição das telas da malha é montada a partir do modelo familiar e filtrada principalmente por `visiblePersonIds`;
- em `Home.tsx`, no mobile da `/minha-arvore`, os filtros diretos continuam normalizados para defaults para evitar complexidade de painel lateral nessa experiência;
- por isso, os filtros de grupos diretos ainda não atuam como controles interativos para ocultar telas inteiras da malha 3×3;
- os filtros por status/tipo (`vivos`, `falecidos`, `pets`) continuam afetando os cards visíveis por meio de `visiblePersonIds`;
- a pessoa central deve continuar preservada mesmo quando filtros por status/tipo ocultarem outras pessoas.

Mapeamento real no mobile segmentado:

| Estado/filtro | Impacto atual no mobile segmentado |
|---|---|
| `personFilters.vivos` | Pode ocultar pessoas vivas, exceto preservações obrigatórias como pessoa central. |
| `personFilters.falecidos` | Pode ocultar pessoas falecidas. |
| `personFilters.pets` | Pode ocultar pets. |
| `directRelativeFilters` | Mantido como estado/tipo compartilhado, mas normalizado para defaults no mobile da `/minha-arvore`; não deve ser documentado como filtro interativo ativo das telas da malha enquanto o código não implementar essa lógica. |
| `edgeFilters` | Controla linhas do ReactFlow; não deve ser tratado como controlador dos conectores HTML/CSS do mobile segmentado. |
| `visualLineFilters` | Destaca linhas ReactFlow já visíveis quando aplicável; não cria cards, telas ou conectores HTML/CSS novos. |

Telas atuais da malha mobile:

```txt
[ vazio            ] [ Ancestrais globais ] [ vazio           ]
[ Tios Paternos    ] [ Central             ] [ Tios Maternos   ]
[ Primos Paternos  ] [ vazio               ] [ Primos Maternos ]
```

Intenção de produto para evolução futura:

| Filtro/grupo | Comportamento futuro possível |
|---|---|
| `pais` | Ocultar/exibir pais na tela Central, quando aplicável. |
| `avos`, `bisavos`, `tataravos` | Ocultar/exibir grupos da tela de Ancestrais globais. |
| `tios` | Ocultar/exibir telas de Tios paternos e maternos. |
| `primos` | Ocultar/exibir telas de Primos paternos e maternos. |
| `conjuge` | Ocultar/exibir bloco de cônjuge na Central. |
| `irmaos` | Ocultar/exibir bloco de irmãos na Central. |
| `filhos`, `netos` | Ocultar/exibir descendentes na Central. |
| `pets` | Ocultar/exibir bloco de pets, sem misturar com filhos humanos. |

Regras para implementação futura:

- grupo oculto por filtro não deve deixar container vazio com conector solto;
- quando não houver pessoas após filtro, exibir estado vazio discreto somente quando fizer sentido para a tela ativa;
- filtros diretos não devem alterar dados reais nem relacionamentos;
- a ocultação de grupo deve preservar a integridade visual da malha e dos conectores.

---


### 6.3 Regras visuais recentes do mobile segmentado

As regras abaixo foram consolidadas para evitar divergência entre `/minha-arvore` mobile e `/mapa-familiar` mobile:

- o card principal da pessoa central não exibe badge **VOCÊ**;
- os cards de Pai e Mãe continuam podendo exibir labels próprios;
- linhas vitais exibem somente o ano;
- avatares usam foto real ou fallback por `genero`;
- conectores HTML/CSS não são comandados diretamente por `edgeFilters`;
- filtros diretos ainda não devem ser documentados como controle interativo pleno das telas da malha enquanto o código não implementar essa lógica.



### 6.2 Filtro **Cônjuges** no Mapa Familiar

No painel lateral, o rótulo funcional deve ser **Cônjuges**, não **Cônjuge**.

No `Mapa Familiar`, a regra do filtro é específica:

| Tipo de cônjuge | Estado inicial | Controlado pelo filtro **Cônjuges**? |
|---|---:|---:|
| Cônjuge da pessoa central | visível quando existir | Não |
| Cônjuges de tataravós, bisavós e avós | visíveis quando existirem | Não |
| Cônjuges de tios | ocultos inicialmente | Sim |
| Cônjuges de primos | ocultos inicialmente | Sim |
| Cônjuges de sobrinhos | ocultos inicialmente | Sim |
| Cônjuges de filhos | ocultos inicialmente | Sim |
| Cônjuges de netos | ocultos inicialmente | Sim |

Regras:

- `directRelativeFilters.conjuge` deve representar a exibição de cônjuges colaterais no Mapa Familiar;
- desligar **Cônjuges** não deve esconder o cônjuge principal da pessoa central;
- desligar **Cônjuges** não deve esconder cônjuges ancestrais de tataravós, bisavós e avós;
- conectores internos entre cônjuges só devem ser desenhados quando a relação `conjuge` existir explicitamente;
- não conectar visualmente pessoas adjacentes apenas porque ficaram lado a lado no grid.

Na `/minha-arvore` ReactFlow, o comportamento legado do grupo `conjuge` pode continuar existindo conforme o layout direto. A regra acima é específica do `DesktopFamilyMapView` e deve permanecer detalhada em `MAPA_FAMILIAR_VIEW.md`.

---

## 7. Contadores

Contadores de grupos diretos devem respeitar os filtros inferiores de status/tipo, mas não devem ser zerados pelo próprio toggle do grupo.

Exemplos:

| Ação | Resultado esperado |
|---|---|
| Desativar **Bisavós** | Card **Bisavós** mantém a contagem calculada. |
| Desativar **Falecidos** com bisavós todos falecidos | Card **Bisavós** pode ir para `0`. |
| Reativar **Falecidos** | Contagem volta ao valor anterior. |
| Card com `0` | Continua clicável/restaurável. |

Regra:

```txt
O filtro de status/tipo altera contagem. O toggle do próprio grupo altera visibilidade, não o número-base do card.
```

---

## 8. Separação entre filhos humanos e pets

Regra consolidada:

```txt
Filhos = apenas humanos.
Pets = apenas pets.
```

Aplicações:

| Área | Regra |
|---|---|
| `/minha-arvore` | pets podem aparecer no grupo **Pets**. |
| `/genealogia` | pets não entram na visão genealógica formal. |
| `/visao-completa` | pets não entram na visão genealógica completa. |
| Perfil de pessoa | pets aparecem em card próprio quando vinculados. |
| `/minha-arvore/editar` | card **Filhos** conta humanos; card **Pets** conta pets. |

Regras adicionais:

- pets não geram netos;
- netos derivam apenas de filhos humanos;
- IA/curiosidades não devem tratar pet como filho humano;
- métricas de “mais filhos” contam apenas humanos.

---

## 9. Legenda e relação com linhas

A aba **Legendas** controla três famílias de estado:

| Controle | Estado | Efeito |
|---|---|---|
| Cards | `personFilters` | mostra/oculta pessoas vivas, falecidas e pets. |
| Linhas | `edgeFilters` | mostra/oculta linhas. |
| Destacar | `visualLineFilters` | muda estilo de linhas visíveis. |
| Cores dos grupos | `directRelativeFilters` | mostra/oculta grupos diretos da Minha Árvore. |

Regra obrigatória:

```txt
Destaque não cria linha nova.
Destaque não reexibe linha oculta.
Destaque não altera cards.
```

---

## 10. Modo foco da pessoa central

Quando a view **Minha Árvore** renderiza apenas a pessoa central como `personNode` real, `FamilyTree.tsx` ativa o modo foco.

Condições:

- `viewMode === 'minha-arvore'`;
- existe exatamente um `personNode` real;
- esse node é a pessoa central.

Implementação:

- continua usando `personNode`;
- `PersonNodeData.useCentralFocusPanel = true`;
- `PersonNode.tsx` renderiza `CentralPersonFocusPanel`;
- não cria novo node type;
- não altera Supabase;
- não altera Genealogia ou Visão Completa.

Dados exibíveis no foco:

- foto ou placeholder;
- nome completo;
- badge vivo/falecido/pet;
- idade ou anos de vida;
- nascimento/naturalidade, respeitando privacidade;
- local atual;
- geração sociológica;
- contagem de arquivos históricos;
- minibio/curiosidades limitadas;
- botões de visualizar perfil e adicionar conexão.

---

## 11. Admin e edição de vínculos com pets

Enquanto não houver relacionamento semântico próprio para pet:

| Situação | Label de UI | Valor persistido |
|---|---|---|
| humano → humano | Filho(a) | `filho`, `pai` ou `mae`, conforme direção |
| humano → pet | Pet da família | vínculo técnico compatível |
| pet envolvido | Pet da família | vínculo técnico compatível |

Regras:

- não usar `tipo_relacionamento = 'pet'` sem migration;
- não usar `tipo_relacionamento = 'tutor'` sem migration;
- usuário comum deve solicitar alteração quando não puder editar diretamente;
- admin pode executar diretamente quando a regra de permissão permitir;
- documentação de mudança futura deve passar por `MIGRATIONS_SUPABASE.md`.

---

## 12. Responsividade do painel

Regras de layout:

- containers com `min-h-0` e `min-w-0`;
- área de filtros com rolagem interna;
- grids com `minmax(0, 1fr)`;
- botões com `w-full`, `min-w-0`, `overflow-hidden`;
- textos com `truncate`;
- evitar overflow horizontal global;
- cards com `0` não devem ficar desabilitados.

---

## 13. Antirregressões

Não reintroduzir:

- pet dentro do grupo **Filhos**;
- pet em **Genealogia** ou **Visão Completa**;
- card **Pets** no grid superior de grupos diretos;
- desativação de grupo zerando o próprio contador;
- card com `0` não clicável;
- filtro de status recalculando ramos paterno/materno;
- destaque de linhas recriando edge oculta;
- comparação manual `humano_ou_pet === 'Pet'` espalhada sem helper;
- migration de `pet/tutor` sem plano e backfill.

---

## 14. Backlog futuro

Evoluções possíveis, não bloqueantes:

- relacionamento semântico `pet`;
- relacionamento semântico `tutor`;
- backfill seguro dos pets existentes;
- preferência persistida de exibir/ocultar pets;
- métricas próprias de pets;
- card específico de pet no modo foco;
- persistência dos filtros por usuário em banco.

Se avançar, revisar:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

## 15. Checklist de QA

Validar em `/minha-arvore`:

- desativar **Vivos**;
- desativar **Falecidos**;
- desativar **Pets**;
- confirmar que a pessoa central permanece visível;
- confirmar que ramos não trocam de lado;
- desativar grupo direto e confirmar que seu número não zera;
- confirmar que cards com `0` continuam clicáveis;
- confirmar que pets aparecem no grupo **Pets**;
- confirmar que pets não aparecem em **Genealogia**;
- confirmar que pets não aparecem em **Visão Completa**;
- confirmar card **Pets** separado no perfil e em `/minha-arvore/editar`;
- testar modo foco quando apenas a pessoa central permanece;
- validar as 7 telas do mobile segmentado da Minha Árvore;
- confirmar que grupos ocultos por filtro não deixam containers vazios ou conectores soltos;
- confirmar que pets continuam separados de filhos humanos no núcleo mobile;
- testar desktop, tablet e mobile;
- validar avatar por `genero` no Mapa Familiar;
- validar que o filtro **Cônjuges** não oculta cônjuge principal nem cônjuges ancestrais;
- validar que cônjuges colaterais aparecem apenas quando **Cônjuges** está ativo.

Comando técnico:

```bash
npm run build
```
