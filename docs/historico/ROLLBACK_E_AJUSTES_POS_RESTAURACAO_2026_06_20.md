# Histórico — rollback e ajustes pós-restauração mobile — 2026-06-20

> Local: `docs/historico/ROLLBACK_E_AJUSTES_POS_RESTAURACAO_2026_06_20.md`  
> Tipo: registro histórico e operacional  
> Status: histórico. Não substitui os documentos canônicos em `docs/funcionalidades/`, `docs/arquitetura/` e `docs/operacao/`.

---

## 1. Objetivo

Registrar a sequência de rollback, restauração e ajustes incrementais realizados na frente mobile de `/mapa-familiar` após uma refatoração ampla ter gerado regressões visuais.

Este documento existe para evitar três leituras incorretas no futuro:

1. tratar commits de refatoração revertida como contrato vigente;
2. usar a branch errada como base de produção;
3. confundir correções pontuais de DOM com solução estrutural definitiva.

---

## 2. Base correta após a restauração

A base funcional recuperada foi o commit:

```txt
52ee451c8e63e3af682b7b8c3a1d1df767c46c33
fix: ajustar conectores mobile de avos e tios
```

A produção foi temporariamente apontada para:

```txt
rollback/producao-52ee451
```

Depois a `main` foi alinhada à versão estável por PR/merge normal, sem `force push`:

```txt
cbf159a7d67f4bce883182fae8d81b210e9a0d7b
restore: alinhar main com versão estável 52ee451
```

Backup criado antes da restauração:

```txt
backup/main-before-rollback-52ee451-20260620-0245
```

Regra operacional: a base de trabalho vigente é a `main` restaurada a partir de `52ee451`, com os ajustes incrementais posteriores explicitamente documentados.

---

## 3. Implementações que foram tentadas, mas não são contrato vigente

### 3.1 Refatoração React-only da árvore mobile

Houve tentativa de consolidar a árvore mobile em React, incluindo uma grade 3x3 nativa e remoção de scripts externos.

Commits relevantes:

```txt
8b46b3e — refactor: consolidar arvore mobile no React
e1ea927 — chore: remover scripts externos da arvore mobile
682a696 — fix: preservar rolagem vertical na arvore mobile
```

Status: histórico. A refatoração regrediu avanços visuais e funcionais e não deve ser usada como referência isolada para produto.

### 3.2 Branch de rollback técnico `d7385dc`

Foi criada a branch:

```txt
rollback/mobile-9-telas-d7385dc-v2
```

Ela serviu para recuperar lógica antiga das 9 telas e corrigir erros de build, mas o preview ficou visualmente desconfigurado.

Status: referência técnica/histórica. Não usar como produção e não abrir PR dessa branch para a `main`.

---

## 4. Correções de build durante o processo

Durante testes de Vercel, foram corrigidos erros de import/export.

Arquivos envolvidos:

```txt
src/app/components/FamilyTree/personDisplay.ts
src/app/utils/personFields.ts
```

Correções aplicadas:

- criação de helper `personDisplay.ts` para uso em cards mobile;
- export de `getPersonBirthYear`;
- export de `getPersonDeathYear`;
- restauração/garantia de `isPersonDeceased`.

Essas correções foram necessárias para builds intermediários, mas parte do histórico foi sobrescrita pela restauração da `main`. Verificar o código atual antes de reutilizar qualquer trecho desses commits.

---

## 5. Ajustes incrementais vigentes após restauração

### 5.1 Zoom/overview mobile

Arquivo vigente:

```txt
src/mobileFamilyTreeZoomOverviewFix.ts
```

Responsabilidades atuais:

- interceptar o botão `Zoom` da toolbar mobile;
- abrir overlay `id="mobile-family-tree-overview-mode"`;
- exibir 9 grupos da grade 3x3;
- contar como `pessoa`/`pessoas`;
- navegar para tela correspondente em `/mapa-familiar`;
- navegar para geração correspondente em `/mapa-familiar-horizontal`;
- fechar overlay e destravar `body`;
- evitar que o botão Zoom deixe a navegação presa.

Observação importante: esse script precisa carregar antes de `mobileFamilyTreeOverviewMode.ts` no `index.html`.

### 5.2 Conectores da tela `ancestors`

Arquivo vigente:

```txt
src/mobileFamilyTreeAncestorConnectorsFix.ts
```

Responsabilidades atuais:

- desenhar conectores quando a tela de Avós está visível na área da árvore;
- localizar a tela `[data-mobile-family-tree-screen="ancestors"]`;
- considerar apenas grupos com card mobile cujo título normalizado contenha `avos`;
- ignorar grupos com `bisavos` ou `tataravos`;
- inferir lado paterno/materno por atributo `data-mobile-family-tree-grandparent-side` ou pelo título do grupo;
- desenhar linhas horizontais laterais para ancestrais paternos/maternos;
- desenhar linhas verticais abaixo de `Avós paternos` e `Avós maternos`;
- remover camadas de conectores quando a tela de Avós não estiver visível.

Pendência visual aberta: confirmar em iPhone/Safari se as linhas verticais abaixo dos grupos de avós aparecem corretamente e não vazam para as telas de bisavós.

### 5.3 Conectores da tela `descendants`

Arquivo vigente:

```txt
src/mobileFamilyTreeDescendantConnectorsFix.ts
```

Responsabilidades atuais:

- desenhar conector superior da tela `descendants`;
- ramificar para `Irmãos` e `Cônjuge` quando ambos existem;
- conectar `Irmãos` a `Sobrinhos` quando houver sobrinhos;
- usar grupos encontrados dentro da tela `descendants`, preferencialmente dentro de `.mobile-family-descendant-screen__grid`;
- ocultar conectores antigos clonados;
- usar espessura visual compatível com as demais linhas;
- recalcular em resize, orientationchange, visibilitychange, click, touchend e mutações no root.

Pendência visual aberta: confirmar se as linhas encostam no topo dos grupos `Irmãos` e `Cônjuge` sem espaçamento excessivo.

---

## 6. Ordem atual de scripts em `index.html`

Na `main` atual, os scripts auxiliares mobile são carregados explicitamente em `index.html`.

Ordem relevante:

```txt
src/mobileFamilyTreeMutationPerformanceGuard.ts
src/main.tsx
src/firstLoginMobileTutorialFixes.ts
src/mobileCuriositiesNavigationFix.ts
src/mobileTreePanelViewportFix.ts
src/mobileFamilyTreeNavigationRules.ts
src/staticMobileFamilyTreeScreens.ts
src/mobileFamilyTreeScreenStateGuards.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeUncleScreenGuards.ts
src/mobileFamilyTreeUncleSizingFix.ts
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeSwipeHints.ts
src/mobileFamilyTreeZoomOverviewFix.ts
src/mobileFamilyTreeOverviewMode.ts
src/mobileFamilyTreeOverviewFixes.ts
src/mobileFamilyTreeAncestorConnectorsFix.ts
src/mobileFamilyTreeDescendantConnectorsFix.ts
src/mobileFamilyTreeCoreDescendantConnector.ts
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
src/mobileFamilyTreeScrollAndVisibilityFix.ts
```

Não alterar essa ordem sem revalidar:

- abertura do Zoom;
- navegação por swipe;
- telas de avós/bisavós;
- tela `descendants`;
- scroll interno em iPhone/Safari.

---

## 7. Pontos que permanecem como QA, não como concluídos

Até validação visual estável, manter estes pontos como QA aberto:

| ID | Tema |
|---|---|
| `MOB-006` | Confirmar conectores verticais abaixo de `Avós paternos` e `Avós maternos`. |
| `MOB-007` | Confirmar conectores internos de `descendants`, especialmente espessura e encaixe no topo dos grupos. |
| `MOB-ZOOM` | Confirmar que Zoom abre o overview, fecha pelo `X`, navega por grupo e não trava swipe/bottom nav. |
| `MOB-ROLLBACK` | Garantir que testes sejam feitos no deployment correto da `main` restaurada, não em previews antigos. |

---

## 8. Documentos canônicos relacionados

Este arquivo preserva o histórico. Para contrato vigente, usar:

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/QA_MANUAL.md
docs/PLANO_PROXIMOS_PASSOS.md
```
