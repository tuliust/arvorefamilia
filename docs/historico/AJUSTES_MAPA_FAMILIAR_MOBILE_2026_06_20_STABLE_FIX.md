# Ajustes consolidados — mapa familiar mobile

> Data: 2026-06-20  
> Escopo: `/mapa-familiar` e `/mapa-familiar-horizontal` no mobile  
> Baseline preservada: `docs/historico/BASELINE_MAPA_FAMILIAR_MOBILE_2026_06_20_1631.md`

## Objetivo

Reduzir regressões causadas por múltiplos scripts DOM globais competindo pelo mesmo `transform`, pelos mesmos listeners de toque, pelo mesmo estado do botão `Zoom` e pelos mesmos estilos de altura/overflow.

## Mudanças executadas

### 1. Baseline preservada

Foi registrada a versão imediatamente anterior aos novos ajustes em:

```txt
 docs/historico/BASELINE_MAPA_FAMILIAR_MOBILE_2026_06_20_1631.md
```

Commit de referência salvo na baseline: `a44fc4b2b63eaf5bc15fff956b1eca44ea88c8ad`.

### 2. Modelo mobile de tios

Arquivo alterado:

```txt
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
```

O modelo passou a considerar relacionamentos diretos de tios/tias, além da inferência tradicional por irmãos do pai/mãe.

Tipos contemplados por normalização textual:

- `tio`, `tia`, `uncle`, `aunt`;
- `tio_paterno`, `tia_paterna`, termos com `paterno/paterna/father/dad`;
- `tio_materno`, `tia_materna`, termos com `materno/materna/mother/mom/mae`;
- casos inversos com `sobrinho/sobrinha/nephew/niece`.

Esse ajuste não inventa pessoas. Ele apenas permite que vínculos já cadastrados como relação direta de tio/tia sejam usados no mobile.

### 3. Script consolidado

Arquivo criado:

```txt
src/mobileFamilyMapStableMobileFix.ts
```

Responsabilidades concentradas neste script:

- criar tela inferior estável de `descendants` sem o ciclo de tremor causado pelos patches antigos;
- controlar apenas o swipe vertical entre `core` e `descendants`;
- preservar scroll nativo quando o conteúdo ainda pode rolar;
- compactar `Tios Maternos` e `Tios Paternos` com alinhamento superior;
- marcar conectores principais dos grupos de primos e ajustar a linha vertical até o topo do grupo;
- controlar o overlay do botão `Zoom` para `/mapa-familiar` e `/mapa-familiar-horizontal`;
- reduzir a altura dos painéis móveis `Cor`, `Filtros` e `Formato`.

### 4. Redução de scripts concorrentes

Arquivo alterado:

```txt
index.html
```

Foram retirados do carregamento os scripts que disputavam touch/transform/overview/sizing:

- `mobileFamilyTreeViewportContentFix.ts`;
- `mobileFamilyTreeNavigationRules.ts`;
- `mobileFamilyTreeUncleScreenGuards.ts`;
- `mobileFamilyTreeUncleSizingFix.ts`;
- `mobileFamilyTreeDescendantScreen.ts`;
- `mobileFamilyTreeZoomOverviewFix.ts`;
- `mobileFamilyTreeOverviewMode.ts`;
- `mobileFamilyTreeOverviewFixes.ts`;
- `mobileFamilyTreeScrollAndVisibilityFix.ts`;
- `mobileFamilyMapMicroLayoutFix.ts`.

O novo arquivo `mobileFamilyMapStableMobileFix.ts` foi carregado por último para assumir os ajustes mobile consolidados.

## Checklist de QA recomendado

Validar após o deploy Vercel:

1. `/mapa-familiar`
   - abrir `Primos Maternos` e confirmar linha vertical conectada ao topo do grupo;
   - abrir `Tios Maternos` e verificar altura reduzida;
   - abrir `Tios Paternos` e verificar se os cards aparecem quando houver relação real cadastrada;
   - navegar para a tela inferior de `Irmãos`, `Cônjuge`, `Pets`, `Sobrinhos`, `Filhos` e `Netos` e confirmar que não há tremor;
   - confirmar que o scroll interno funciona sem esconder o último grupo atrás do bottom nav.

2. `/mapa-familiar-horizontal`
   - tocar em `Zoom` e confirmar abertura do overview;
   - fechar o overview;
   - tocar em uma geração no overview e confirmar navegação;
   - confirmar que a navegação horizontal por gerações não trava após abrir/fechar `Zoom`.

3. Ambas as páginas
   - abrir `Cor` e confirmar altura menor do painel;
   - abrir `Filtros` e confirmar altura menor do painel;
   - testar em 375px, 390px e 430px no Safari/iOS.

## Observação

Não foram executados `npm run build`, `npm test` ou `npm run test:e2e` neste ambiente, pois o acesso disponível foi via GitHub connector. A validação definitiva depende do deploy e do teste manual em Safari/iOS.
