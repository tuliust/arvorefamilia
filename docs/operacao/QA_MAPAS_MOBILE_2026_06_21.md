# QA — mapas familiares mobile — rodada 2026-06-21

> Última revisão: 2026-06-21  
> Local: `docs/operacao/QA_MAPAS_MOBILE_2026_06_21.md`  
> Escopo: validação pós-deploy dos ajustes de `/mapa-familiar` e `/mapa-familiar-horizontal` mobile.  
> Status: checklist operacional complementar ao `docs/QA_MANUAL.md`.

---

## 1. Ambiente mínimo

Validar, preferencialmente, em:

```txt
Safari/iPhone
375px
390px
430px
janela privada/anônima após deploy
```

Quando possível, complementar com:

```txt
Chrome Android
Chrome desktop em device toolbar
```

---

## 2. Comandos recomendados antes/depois do deploy

```bash
git diff --check
npm run build
npm test
npm run test:e2e
```

Se algum comando não puder ser executado, registrar explicitamente a limitação no PR/commit ou relatório de deploy.

---

## 3. `/mapa-familiar` — navegação 3x3

Checklist:

- [ ] A rota `/mapa-familiar` abre no mobile sem erro.
- [ ] A tela inicial é `core`.
- [ ] Swipe para a esquerda abre `paternal-uncles`.
- [ ] Swipe para a direita abre `maternal-uncles`.
- [ ] Swipe para baixo a partir de `core` abre `descendants`.
- [ ] Swipe de retorno respeita o contrato direcional.
- [ ] Não há scroll horizontal global indevido.
- [ ] Bottom nav não cobre títulos ou cards principais de forma permanente.

---

## 4. Tios paternos

Checklist:

- [ ] O título `Tios Paternos` aparece.
- [ ] O grupo fica centralizado na tela.
- [ ] O grupo não tem área colorida indevida à direita ou abaixo.
- [ ] A linha horizontal sai da direita do grupo em direção ao card do pai/core.
- [ ] A linha vertical sai da parte inferior do grupo e desce até o final da tela.
- [ ] Cards permanecem legíveis.
- [ ] Quando o filtro de cônjuges está ativo, aparecem cônjuges esperados como Ildo, Maria Nubia e Enildes, conforme dados disponíveis.
- [ ] Mário aparece no grupo quando a lista está expandida.
- [ ] Cônjuges têm cor diferente do parente principal, mas próxima da paleta do grupo.

---

## 5. Tios maternos

Checklist:

- [ ] O título `Tios Maternos` aparece.
- [ ] O grupo fica centralizado na tela.
- [ ] O grupo não tem área colorida indevida à esquerda ou abaixo.
- [ ] A linha horizontal sai da esquerda do grupo em direção ao card da mãe/core.
- [ ] A linha vertical sai da parte inferior do grupo e desce até o final da tela.
- [ ] Cards permanecem legíveis.
- [ ] Quando o filtro de cônjuges está ativo, Monika aparece conforme dados disponíveis.
- [ ] Cônjuges têm cor diferente do parente principal, mas próxima da paleta do grupo.

---

## 6. Filtros mobile de cônjuges

Checklist:

- [ ] Abrir painel **Filtros**.
- [ ] O botão **Apenas meus familiares** aparece ativo visualmente.
- [ ] Tocar em **Apenas meus familiares** não altera a exibição.
- [ ] O botão **Exibir cônjuges de tios, primos etc** funciona como toggle.
- [ ] Toggle ativado exibe cônjuges nos grupos suportados.
- [ ] Toggle desativado oculta cônjuges estendidos.
- [ ] Estado visual do botão acompanha ativo/inativo.
- [ ] O estado não interfere nos cards da pessoa central ou no cônjuge principal.

Grupos a validar:

```txt
Tios
Primos
Sobrinhos
Filhos
Netos
Irmãos, quando aplicável
```

---

## 7. Zoom/overview de `/mapa-familiar`

Checklist:

- [ ] Botão **Zoom** abre a janela **Visão geral**.
- [ ] A janela exibe 9 cards.
- [ ] Títulos estão compactos e legíveis.
- [ ] `DESCENDENTES` aparece em uma linha quando possível.
- [ ] Não aparecem subtítulos como `Ancestrais profundos`.
- [ ] Cada card exibe ícone central.
- [ ] Cada card exibe badge de contagem.
- [ ] Tocar em cada card abre a tela correta.
- [ ] Card atual é identificado visualmente.
- [ ] Abrir Zoom a partir de `descendants` não causa tremor.
- [ ] Fechar o Zoom destrava a tela.

---

## 8. Mapa completo em tela única

Fluxo:

```txt
/mapa-familiar → Zoom → Exibir mapa completo
```

Checklist:

- [ ] O botão **Exibir mapa completo** aparece abaixo dos 9 cards.
- [ ] O botão abre overlay dedicado.
- [ ] O overlay mostra uma tela única/mosaico, não uma grade de 9 cards soltos.
- [ ] Grupos aparecem conectados por linhas.
- [ ] Bisavós/avós aparecem nos grupos corretos.
- [ ] Tios paternos e maternos aparecem nas laterais do núcleo.
- [ ] Pai, mãe e pessoa central aparecem no centro visual.
- [ ] Primos paternos e maternos aparecem abaixo dos tios correspondentes.
- [ ] Irmãos, cônjuge, sobrinhos, pets, filhos e netos aparecem quando houver dados.
- [ ] Gesto de pinça amplia e reduz.
- [ ] Arraste com um dedo move o canvas.
- [ ] Botão **Reenquadrar** reposiciona o mosaico.
- [ ] Botão fechar remove o overlay.
- [ ] Body/scroll não fica travado depois de fechar.

---

## 9. `/mapa-familiar-horizontal` mobile

Checklist:

- [ ] A rota `/mapa-familiar-horizontal` abre no mobile.
- [ ] As gerações continuam navegáveis por `Ger X`.
- [ ] Swipe lateral continua funcionando.
- [ ] Scroll vertical da geração ativa continua funcionando.
- [ ] O filtro **Exibir cônjuges de tios, primos etc** respeita o estado `extended/direct`.
- [ ] Cards de cônjuges marcados por `data-family-map-spouse-tone="true"` têm cor diferente e próxima à geração.
- [ ] **Apenas meus familiares** segue ativo visualmente e sem ação funcional.

---

## 10. Paletas

Validar ao menos:

```txt
visual
white
orange
brown
```

Checklist:

- [ ] Cards seguem a paleta ativa.
- [ ] Cônjuges usam variação tonal, não a mesma cor exata do parente.
- [ ] Conectores seguem a paleta/conector esperado.
- [ ] Títulos preservam contraste.
- [ ] Mapa completo mantém legibilidade ao trocar paleta.

---

## 11. Critérios de aceite

A rodada pode ser considerada validada se:

- [ ] não houver tremor no `descendants`;
- [ ] Zoom 3x3 navegar corretamente;
- [ ] mapa completo abrir, fechar, pinçar, arrastar e reenquadrar;
- [ ] filtros de cônjuges funcionarem como toggle independente;
- [ ] **Apenas meus familiares** permanecer ativo e sem ação;
- [ ] tios tiverem linhas horizontais e verticais corretas;
- [ ] cônjuges tiverem cor distinta;
- [ ] não houver áreas coloridas residuais abaixo ou ao lado dos grupos de tios;
- [ ] `/mapa-familiar-horizontal` não regredir em navegação e scroll.
