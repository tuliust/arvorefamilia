# Histórico — ajustes do Mapa Familiar mobile em 2026-06-20

> Local: `docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_20260620.md`  
> Tipo: registro histórico preventivo  
> Status: não é fonte de verdade do produto atual. Para contrato vigente, consultar `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md` e `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md`.

---

## 1. Objetivo

Este documento registra a sequência de ajustes, rollback e decisões tomadas na frente mobile do Mapa Familiar.

Ele existe para evitar que, no futuro, alguém interprete implementações revertidas ou branches temporárias como contrato vigente.

Regra de prioridade:

```txt
Código atual da main > documentação canônica > este histórico.
```

---

## 2. Contexto operacional

Durante a frente de ajustes mobile, vários testes no domínio pareciam indicar que as correções não funcionavam. Depois foi identificado que parte da confusão vinha de build/deploy:

```txt
GitHub recebia commits.
Vercel podia falhar no build ou publicar outra branch/commit.
O domínio continuava exibindo uma versão anterior.
```

A partir desse diagnóstico, a validação passou a exigir:

```txt
1. commit confirmado no GitHub;
2. deployment Vercel em Ready;
3. domínio ou preview correto;
4. teste visual só depois disso.
```

---

## 3. Refatoração ampla — tentativa revertida

Foi feita uma tentativa de refatoração ampla para consolidar a grade mobile no React e remover scripts auxiliares.

Objetivo da tentativa:

- reduzir conflitos entre React, scripts externos, swipe e toolbar;
- centralizar `activeScreen`, navegação e toolbar em componentes React;
- evitar sobreposição de handlers de toque/click.

Resultado:

- a refatoração chegou a passar build após ajustes de imports/exports;
- porém regrediu avanços visuais e funcionais já existentes;
- por decisão de produto, não foi mantida como base.

Arquivos tocados durante essa fase incluíram:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyMapToolbar.tsx
src/app/components/FamilyTree/personDisplay.ts
src/app/utils/personFields.ts
index.html
```

Commits associados à tentativa e correções de build:

```txt
8b46b3e — refactor: consolidar arvore mobile no React
682a696 — fix: preservar rolagem vertical na arvore mobile
e1ea927 — chore: remover scripts externos da arvore mobile
edeba3b — fix: renderizar paineis da toolbar diretamente no React
1732678 — fix: remover substitutos externos da toolbar mobile
6a11168 — fix: adicionar helper personDisplay usado na arvore mobile
ded63d5 — fix: exportar helpers de ano para arvore mobile
5938c37 — fix: restaurar helpers originais de personFields
```

Esses commits são histórico, não baseline visual.

---

## 4. Rollback operacional para versão estável

A versão visualmente estável recuperada estava associada ao commit:

```txt
52ee451 — fix: ajustar conectores mobile de avos e tios
```

Como a Vercel não permitia mais redeploy direto do deployment antigo, foi criada uma branch de rollback:

```txt
rollback/producao-52ee451
```

Depois, a `main` foi realinhada com essa versão estável por meio de PR/merge, sem depender de force push.

PR de restauração:

```txt
#23 — restore: alinhar main com versão estável 52ee451
```

Merge na `main`:

```txt
cbf159a — restore: alinhar main com versão estável 52ee451
```

Regra operacional decorrente:

```txt
Não usar branches antigas de rollback como baseline final sem validar preview e domínio.
```

---

## 5. Branch que buildava, mas não virou baseline

Também foi criada a branch:

```txt
rollback/mobile-9-telas-d7385dc-v2
```

Base:

```txt
d7385dc — fix: reativar fallback seguro dos controles mobile
```

Ela recuperava parte dos scripts antigos das 9 telas, mas o preview ficou visualmente desconfigurado. Portanto:

```txt
Não usar rollback/mobile-9-telas-d7385dc-v2 como produção.
Não usar essa branch como referência visual.
```

---

## 6. Ajustes pontuais mantidos após restauração

Depois da restauração da base estável, foram feitos ajustes pontuais, não uma nova refatoração ampla.

### 6.1 Zoom/overview

Arquivo criado:

```txt
src/mobileFamilyTreeZoomOverviewFix.ts
```

Objetivo:

- interceptar o botão `Zoom`;
- abrir overview com 9 cards;
- evitar que a toolbar deixe navegação travada;
- manter contagem em `pessoa`/`pessoas`;
- evitar textos auxiliares antigos no overview.

Commits associados:

```txt
eb622d6 — fix: abrir visao geral pelo botao zoom mobile
8dc84b0 — fix: carregar correcao do zoom mobile
13b58ff — fix: priorizar interceptador do zoom mobile
```

Observação técnica: a ordem em `index.html` importa. O interceptador de Zoom deve carregar antes de scripts antigos de overview.

### 6.2 Conectores da tela de Avós

Arquivo criado:

```txt
src/mobileFamilyTreeAncestorConnectorsFix.ts
```

Objetivo:

- desenhar conectores horizontais laterais em `Avós paternos` e `Avós maternos`;
- desenhar conectores verticais abaixo dos grupos de avós;
- evitar vazamento de verticais para grupos de `Bisavós` e `Tataravós`.

Commits associados:

```txt
1432592 — fix: adicionar conectores na tela mobile de avos
d429f1c — fix: carregar conectores da tela de avos mobile
54d7f37 — fix: limitar conectores aos grupos de avos mobile
f572f71 — fix: exibir verticais abaixo dos grupos de avos
```

Pendência histórica associada: a exibição das verticais abaixo de `Avós paternos` e `Avós maternos` exigia validação visual em iPhone/Safari.

### 6.3 Conectores da tela de Descendentes

Arquivo criado:

```txt
src/mobileFamilyTreeDescendantConnectorsFix.ts
```

Objetivo:

- linha superior entrando em `descendants`;
- ramificação para `Irmãos` e `Cônjuge`;
- linha de `Irmãos` para `Sobrinhos`;
- linha de `Cônjuge` para `Pets` e/ou `Filhos`;
- ocultar conectores antigos clonados;
- usar espessura compatível com as demais linhas.

Commits associados:

```txt
07ef5c1 — fix: ajustar conectores da tela mobile de descendentes
ac262bf — fix: carregar conectores da tela de descendentes mobile
83cf7b1 — fix: alinhar conectores da tela de descendentes
```

---

## 7. Contrato funcional preservado

O contrato desejado para a grade mobile permaneceu:

```txt
paternal-ancestors
ancestors
maternal-ancestors
paternal-uncles
core
maternal-uncles
paternal-cousins
descendants
maternal-cousins
```

E a navegação por swipe deve obedecer às regras registradas em:

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/REGRAS_DE_NAO_REGRESSAO.md
```

---

## 8. Lições operacionais

- Não concluir que uma correção falhou antes de confirmar o deployment correto.
- Não promover refatoração ampla quando o problema pode ser build/deploy ou cache.
- Não validar produção sem conferir branch, commit e status `Ready`.
- Preferir ajustes pontuais e reversíveis em frente visual sensível.
- Registrar como histórico tudo que foi revertido ou usado apenas como ponte de recuperação.

---

## 9. Referências vigentes

Documentos canônicos após esta frente:

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/PLANO_PROXIMOS_PASSOS.md
```
