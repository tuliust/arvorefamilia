# Não regressão — mapas familiares mobile

> Última revisão: 2026-06-20  
> Local: `docs/operacao/NAO_REGRESSAO_MAPAS_MOBILE.md`  
> Escopo: complemento operacional de `docs/REGRAS_DE_NAO_REGRESSAO.md` para `/mapa-familiar` e `/mapa-familiar-horizontal` no mobile.  
> Status: vigente após consolidação dos scripts mobile, guard direcional e cleanup de conector central.

---

## 1. Objetivo

Este documento complementa `docs/REGRAS_DE_NAO_REGRESSAO.md` com regras específicas da frente mobile dos mapas familiares.

Use antes de alterar:

- `MobileFamilyTreeView.tsx`;
- `MobileFamilyHorizontalMapView.tsx`;
- `mobileFamilyTreeModel.ts`;
- `mobileFamilyMapStableMobileFix.ts`;
- `mobileFamilyMapDirectionalNavigationFix.ts`;
- `mobileFamilyMapCoreConnectorFix.ts`;
- conectores mobile;
- painel `+`;
- toolbar mobile;
- Zoom/overview;
- scripts carregados em `index.html`.

---

## 2. Scripts vigentes que não devem ser removidos sem substituição documentada

```txt
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
src/mobileFamilyMapCoreConnectorFix.ts
```

Regras:

- se remover `mobileFamilyMapStableMobileFix.ts`, documentar como `descendants`, tios, primos, painéis compactos e Zoom passam a ser controlados;
- se remover `mobileFamilyMapDirectionalNavigationFix.ts`, documentar onde a matriz de 9 telas passa a ser garantida;
- se remover `mobileFamilyMapCoreConnectorFix.ts`, garantir que a linha vertical central abaixo da pessoa principal não volte.

---

## 3. Grade 3x3 obrigatória

As telas abaixo não devem ser removidas sem decisão explícita:

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

Regra de posição:

```txt
paternal-ancestors  top-left
ancestors           top-center
maternal-ancestors  top-right
paternal-uncles     middle-left
core                middle-center
maternal-uncles     middle-right
paternal-cousins    bottom-left
descendants         bottom-center
maternal-cousins    bottom-right
```

---

## 4. Matriz direcional obrigatória

| Tela | Permitido | Bloqueado |
|---|---|---|
| `paternal-ancestors` | direita | cima, baixo, esquerda |
| `ancestors` | esquerda, direita, baixo | cima |
| `maternal-ancestors` | esquerda | cima, baixo, direita |
| `core` | cima, baixo, esquerda, direita | nenhuma, se houver conteúdo no destino |
| `paternal-uncles` | direita, baixo | cima, esquerda |
| `maternal-uncles` | esquerda, baixo | cima, direita |
| `paternal-cousins` | cima | baixo, esquerda, direita |
| `descendants` | cima | baixo, esquerda, direita |
| `maternal-cousins` | cima | baixo, esquerda, direita |

Regra: gesto bloqueado não pode alterar `data-mobile-family-tree-active-screen` nem aplicar `transform` para outra tela.

---

## 5. Scroll interno

Telas com conteúdo maior que a altura útil devem priorizar scroll interno:

```txt
descendants
paternal-uncles
maternal-uncles
paternal-cousins
maternal-cousins
```

Regras:

- o swipe só deve navegar quando o scroll interno chegou ao limite correspondente;
- o bottom nav e a safe area não podem cobrir permanentemente o último grupo;
- não pode haver tremor visual por disputa de `transform`.

---

## 6. Conectores que não podem regredir

### Pessoa central

- manter conectores superiores entre pai/mãe e pessoa central;
- manter ramificação horizontal para `Irmãos` e `Cônjuge`;
- remover/ocultar a linha vertical central abaixo da pessoa principal entre `Irmãos` e `Cônjuge`.

### Primos

- linha vertical deve conectar ao topo do grupo;
- grupo não deve ficar excessivamente baixo.

### Descendentes

- conectores não devem duplicar linhas antigas clonadas;
- `Irmãos` deve conectar a `Sobrinhos` quando houver sobrinhos;
- `Cônjuge` deve conectar a `Pets` e/ou `Filhos` quando houver dados.

---

## 7. Tios paternos e maternos

Regras:

- cards reais devem aparecer quando houver dados e filtros permitirem;
- estado vazio controlado pode aparecer apenas quando não houver card real;
- não criar dados fictícios;
- altura do grupo deve ser compacta;
- não deve haver linha vertical acima do grupo;
- modelo mobile deve considerar irmãos do pai/mãe e vínculos diretos de tio/tia.

---

## 8. Zoom e painéis superiores

Regras:

- `Zoom` deve abrir overview em `/mapa-familiar`;
- `Zoom` deve abrir overview em `/mapa-familiar-horizontal`;
- abrir/fechar Zoom não pode travar navegação;
- `Cor` e `Filtros` não devem abrir área com excesso de espaço branco abaixo das opções;
- painéis superiores não podem deslocar definitivamente a tela ativa.

---

## 9. QA mínimo antes de fechar mudança mobile

- [ ] `git diff --check`.
- [ ] `npm run build`.
- [ ] Safari/iOS em 375px ou aparelho real.
- [ ] `/mapa-familiar` carrega e não trava.
- [ ] `/mapa-familiar-horizontal` carrega e não trava.
- [ ] matriz direcional validada nas 9 telas.
- [ ] `descendants` rola internamente.
- [ ] `Tios Paternos` e `Tios Maternos` validados com dados reais ou estado vazio controlado.
- [ ] linha central abaixo da pessoa principal ausente.
- [ ] Zoom abre nas duas rotas.
- [ ] `Cor` e `Filtros` compactos.

---

## 10. Documentos relacionados

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md
docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/REGRAS_DE_NAO_REGRESSAO.md
```
