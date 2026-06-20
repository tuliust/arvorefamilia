# Baseline padrão — mapas familiares mobile

> Data: 2026-06-20  
> Escopo: `/mapa-familiar` e `/mapa-familiar-horizontal` no mobile  
> Branch de preservação: `baseline/mapas-mobile-padrao-2026-06-20`  
> Status: padrão de referência para evitar regressões após os últimos ajustes do chat.

---

## 1. Objetivo

Este documento salva a estrutura atual das páginas mobile:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

como padrão operacional e visual para futuras alterações.

A branch abaixo foi criada a partir da `main` no estado atual:

```txt
baseline/mapas-mobile-padrao-2026-06-20
```

Use esta baseline para comparação visual, análise de regressão ou rollback controlado.

---

## 2. Estrutura padrão de `/mapa-familiar` no mobile

A rota `/mapa-familiar` usa uma grade 3x3.

| Posição | Tela técnica | Nome funcional | Conteúdo padrão |
|---|---|---|---|
| Superior esquerda | `paternal-ancestors` | Bisavós paternos | ancestrais profundos paternos |
| Superior centro | `ancestors` | Avós | avós paternos e maternos |
| Superior direita | `maternal-ancestors` | Bisavós maternos | ancestrais profundos maternos |
| Meio esquerda | `paternal-uncles` | Tios paternos | tios/tias paternos, incluindo vínculos diretos quando existirem |
| Meio centro | `core` | Núcleo central | pai, mãe e pessoa principal |
| Meio direita | `maternal-uncles` | Tios maternos | tios/tias maternos, incluindo vínculos diretos quando existirem |
| Inferior esquerda | `paternal-cousins` | Primos paternos | primos paternos |
| Inferior centro | `descendants` | Descendentes | irmãos, sobrinhos, cônjuge, pets, filhos e netos |
| Inferior direita | `maternal-cousins` | Primos maternos | primos maternos |

Regra de não regressão: os grupos descendentes **não devem aparecer visualmente na tela `core`**. Eles pertencem à tela `descendants`.

---

## 3. Estrutura padrão de `/mapa-familiar-horizontal` no mobile

A rota `/mapa-familiar-horizontal` usa navegação por gerações.

Gerações reconhecidas:

| Geração | Nome funcional |
|---|---|
| 1 | Tataravós |
| 2 | Bisavós |
| 3 | Avós |
| 4 | Pais |
| 5 | Núcleo |
| 6 | Descendentes |

A página deve preservar:

- botões `Ger N`;
- uma geração ativa por vez;
- scroll vertical interno na geração ativa;
- swipe lateral entre gerações;
- conectores da estrutura horizontal;
- botão `Zoom` com janela própria por gerações.

---

## 4. Scripts vigentes carregados em `index.html`

A estrutura padrão depende destes scripts mobile carregados no final do documento:

```txt
src/mobileFamilyHorizontalZoomOverview.ts
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
src/mobileFamilyMapCoreConnectorFix.ts
```

Função de cada um:

| Arquivo | Papel padrão |
|---|---|
| `mobileFamilyHorizontalZoomOverview.ts` | janela de Zoom específica de `/mapa-familiar-horizontal`, por gerações |
| `mobileFamilyMapStableMobileFix.ts` | estabilidade geral, tela `descendants`, tios, primos, painéis compactos e Zoom 3x3 de `/mapa-familiar` |
| `mobileFamilyMapDirectionalNavigationFix.ts` | matriz direcional da grade 3x3 em `/mapa-familiar` |
| `mobileFamilyMapCoreConnectorFix.ts` | oculta linha central duplicada, linhas de tios e fonte visual duplicada dos descendentes no `core` |

---

## 5. Últimas implementações consolidadas nesta baseline

### 5.1 `/mapa-familiar` — `core` sem descendentes duplicados

Foi mantida tecnicamente a fonte de dados/clonagem dos descendentes, mas os elementos marcados como fonte visual no `core` são ocultos por CSS escopado:

```txt
[data-mobile-family-tree-descendant-source="true"]
[data-mobile-family-tree-descendant-connector="true"]
```

Resultado esperado:

```txt
core = pai + mãe + pessoa principal
descendants = irmãos + sobrinhos + cônjuge + pets + filhos + netos
```

### 5.2 `/mapa-familiar-horizontal` — Zoom por gerações

Foi criada uma janela própria para o botão `Zoom` da horizontal:

```txt
src/mobileFamilyHorizontalZoomOverview.ts
```

A janela lista as gerações disponíveis e navega clicando no botão `Ger N` correspondente.

### 5.3 Tios paternos/maternos

As linhas verticais acima dos grupos de tios são ocultadas pelo cleanup mobile. A tela de tios paternos deve navegar para `paternal-cousins` ao gesto funcional para baixo e bloquear gesto funcional para esquerda.

### 5.4 `descendants`

A tela `descendants` deve bloquear esquerda, direita e baixo. A única direção funcional permitida é cima, voltando para `core`, respeitando antes o scroll interno quando houver conteúdo rolável.

---

## 6. Matriz direcional padrão de `/mapa-familiar`

| Tela atual | Permitido | Bloqueado |
|---|---|---|
| `paternal-ancestors` | direita → `ancestors` | cima, baixo, esquerda |
| `ancestors` | esquerda → `paternal-ancestors`; direita → `maternal-ancestors`; baixo → `core` | cima |
| `maternal-ancestors` | esquerda → `ancestors` | cima, baixo, direita |
| `paternal-uncles` | direita → `core`; baixo → `paternal-cousins` | cima, esquerda |
| `core` | cima → `ancestors`; baixo → `descendants`; esquerda → `paternal-uncles`; direita → `maternal-uncles` | nenhuma, se houver destino |
| `maternal-uncles` | esquerda → `core`; baixo → `maternal-cousins` | cima, direita |
| `paternal-cousins` | cima → `paternal-uncles` | baixo, esquerda, direita |
| `descendants` | cima → `core` | baixo, esquerda, direita |
| `maternal-cousins` | cima → `maternal-uncles` | baixo, esquerda, direita |

---

## 7. Checklist de comparação para evitar regressão

Antes de aprovar alteração futura, comparar contra esta baseline:

- [ ] `/mapa-familiar` abre sem travar.
- [ ] `core` não mostra grupos descendentes abaixo da pessoa principal.
- [ ] `descendants` mostra os grupos descendentes.
- [ ] swipe da grade 3x3 respeita a matriz direcional.
- [ ] tios paternos e maternos não mostram linha vertical acima do grupo.
- [ ] `paternal-uncles` bloqueia esquerda e desce para `paternal-cousins`.
- [ ] `descendants` bloqueia esquerda, direita e baixo.
- [ ] `/mapa-familiar-horizontal` abre sem travar.
- [ ] Zoom da horizontal abre janela por gerações, não janela 3x3.
- [ ] tocar em uma geração no Zoom horizontal navega para `Ger N`.
- [ ] fechar Zoom não trava scroll, swipe nem bottom nav.
- [ ] painéis `Formato`, `Cor` e `Filtros` não abrem com espaço branco excessivo.

---

## 8. Documentos canônicos relacionados

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/operacao/NAO_REGRESSAO_MAPAS_MOBILE.md
docs/ATUALIZACAO_DOCUMENTAL_2026_06_20.md
```

---

## 9. Observação

A baseline foi registrada via GitHub connector. Build/testes locais devem ser executados em ambiente com runtime do projeto:

```bash
git diff --check
npm run build
npm test
npm run test:e2e
```
