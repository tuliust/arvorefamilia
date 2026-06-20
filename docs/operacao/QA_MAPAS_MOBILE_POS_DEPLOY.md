# QA pós-deploy — mapas familiares mobile

> Última revisão: 2026-06-20  
> Local: `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md`  
> Escopo: validação operacional pós-deploy das rotas `/mapa-familiar` e `/mapa-familiar-horizontal` em mobile.  
> Status: checklist operacional. A navegação da grade 3x3 deve ser tratada como área sensível até estabilização completa em Safari/iOS.

---

## 1. Quando usar

Use este checklist depois de mudanças em:

- `MobileFamilyTreeView`;
- `MobileFamilyHorizontalMapView`;
- toolbar mobile dos mapas;
- scripts `mobileFamilyTree*`;
- conectores;
- paletas;
- scroll interno;
- overview/zoom;
- painel mobile aberto pelo botão `+`;
- listeners de touch, swipe, `MutationObserver` ou `data-mobile-family-tree-active-screen`.

---

## 2. Preparação

Antes de validar em produção:

```bash
git diff --check
npm run build
```

Quando houver mudança de comportamento de navegação, gesture, rota, árvore ou exportação:

```bash
npm test
npm run test:e2e
```

No iPhone/Safari:

- abrir em aba privada quando houver suspeita de cache;
- fechar e reabrir a aba após deploy;
- validar sem zoom do navegador alterado;
- testar em conexão comum, não só rede local;
- registrar modelo do aparelho, navegador, horário do teste e rota exata.

---

## 3. Breakpoints mínimos

Validar, quando possível:

```txt
320px
375px
390px
430px
```

Ambientes prioritários:

```txt
Safari/iOS
Chrome desktop em modo responsivo
Chrome Android, se disponível
```

---

## 4. `/mapa-familiar` — carregamento

Checklist:

- [ ] página carrega sem tela branca;
- [ ] não há travamento perceptível após abrir;
- [ ] toolbar mobile aparece abaixo do header;
- [ ] bottom nav não cobre permanentemente os cards;
- [ ] paleta ativa é aplicada aos grupos e conectores;
- [ ] navegação por swipe não gera loop visual;
- [ ] abrir/fechar painéis não deixa `body` travado;
- [ ] `data-mobile-family-tree-active-screen` acompanha a tela visual real;
- [ ] trocar cor/formato/filtros não quebra posição da tela ativa.

---

## 5. `/mapa-familiar` — grade 3x3

Validar as 9 telas:

| Tela | Esperado |
|---|---|
| `paternal-ancestors` | bisavós/tataravós paternos visíveis quando houver dados |
| `ancestors` | apenas avós paternos e maternos visíveis |
| `maternal-ancestors` | bisavós/tataravós maternos visíveis quando houver dados |
| `paternal-uncles` | título, grupo e cards de tios paternos visíveis quando houver dados |
| `core` | pai, mãe e pessoa central visíveis |
| `maternal-uncles` | título, grupo e cards de tios maternos visíveis |
| `paternal-cousins` | primos paternos quando houver dados |
| `descendants` | irmãos, cônjuge, sobrinhos, pets, filhos e netos conforme dados |
| `maternal-cousins` | primos maternos quando houver dados |

---

## 6. `/mapa-familiar` — matriz de navegação

Regra de registro de bug: informar sempre tela atual, movimento físico do dedo, direção funcional esperada, destino esperado e destino real.

Matriz a validar:

| Tela atual | Gestos funcionais permitidos | Gestos funcionais bloqueados |
|---|---|---|
| `paternal-ancestors` | direita → `ancestors` | cima, baixo, esquerda |
| `ancestors` | esquerda → `paternal-ancestors`; direita → `maternal-ancestors`; baixo → `core` | cima |
| `maternal-ancestors` | esquerda → `ancestors` | cima, baixo, direita |
| `paternal-uncles` | direita → `core`; baixo → `paternal-cousins` | cima, esquerda |
| `core` | cima → `ancestors`; esquerda → `paternal-uncles`; direita → `maternal-uncles`; baixo → `descendants` | nenhuma, se houver conteúdo de destino |
| `maternal-uncles` | esquerda → `core`; baixo → `maternal-cousins` | cima, direita |
| `paternal-cousins` | cima → `paternal-uncles` | baixo, esquerda, direita |
| `descendants` | cima → `core`, apenas quando scroll interno estiver no topo | baixo, esquerda, direita |
| `maternal-cousins` | cima → `maternal-uncles` | baixo, esquerda, direita |

Checklist:

- [ ] nenhum gesto bloqueado muda de tela;
- [ ] nenhum gesto permitido fica sem resposta quando há conteúdo no destino;
- [ ] gestos em telas com scroll interno priorizam rolagem antes de navegação;
- [ ] as setas de orientação aparecem apenas nas direções permitidas;
- [ ] o overview/Zoom leva para a mesma tela que o gesto levaria.

---

## 7. `/mapa-familiar` — `ancestors` e ancestrais profundos

Checklist:

- [ ] `ancestors` mostra apenas `Avós Paternos` e `Avós Maternos`;
- [ ] não há linhas verticais acima dos grupos de avós;
- [ ] `Avós Paternos` tem linha horizontal para a esquerda;
- [ ] `Avós Maternos` tem linha horizontal para a direita;
- [ ] `paternal-ancestors` usa largura reduzida e conecta visualmente para a direita;
- [ ] `maternal-ancestors` usa largura reduzida e conecta visualmente para a esquerda;
- [ ] bordas/cards de ancestrais profundos seguem a família visual dos avós;
- [ ] não existe navegação vertical em ancestrais profundos.

---

## 8. `/mapa-familiar` — `descendants`

Checklist:

- [ ] tela aparece ao navegar para baixo a partir de `core`;
- [ ] há scroll interno quando conteúdo ultrapassa a altura útil;
- [ ] o último grupo é alcançável sem ficar escondido pelo bottom nav;
- [ ] swipe para cima/baixo não bloqueia a rolagem interna enquanto há conteúdo para rolar;
- [ ] volta para `core` somente quando a rolagem interna estiver no topo;
- [ ] linha entra na tela e ramifica para `Irmãos` e `Cônjuge`;
- [ ] `Irmãos` conecta a `Sobrinhos` quando houver sobrinhos;
- [ ] `Cônjuge` conecta a `Pets` e `Filhos` quando houver ambos;
- [ ] se só houver `Pets`, o grupo ocupa sozinho a área abaixo de `Cônjuge`;
- [ ] se só houver `Filhos`, o grupo ocupa sozinho a área abaixo de `Cônjuge`;
- [ ] não aparecem linhas antigas transparentes ou duplicadas.

---

## 9. `/mapa-familiar` — tios

### `paternal-uncles`

Checklist:

- [ ] título `Tios Paternos` aparece;
- [ ] grupo aparece centralizado;
- [ ] cards aparecem e são legíveis;
- [ ] não há linha vertical acima do grupo;
- [ ] se houver mais cards do que a área útil, a tela permite rolagem interna;
- [ ] swipe para direita leva para `core`;
- [ ] swipe para baixo leva para `paternal-cousins`;
- [ ] swipe para cima não muda de tela;
- [ ] swipe para esquerda não muda de tela;
- [ ] largura do grupo não deixa excesso de área vazia quando há poucos cards.

### `maternal-uncles`

Checklist:

- [ ] título `Tios Maternos` aparece;
- [ ] grupo aparece centralizado;
- [ ] grupo não fica grande demais;
- [ ] cards são legíveis;
- [ ] não há linha vertical acima do grupo;
- [ ] se houver mais cards do que a área útil, a tela permite rolagem interna;
- [ ] swipe para esquerda leva para `core`;
- [ ] swipe para baixo leva para `maternal-cousins`;
- [ ] swipe para cima não muda de tela;
- [ ] swipe para direita não muda de tela.

---

## 10. Títulos de grupos

Validar que os títulos abaixo aparecem escuros, legíveis e com fonte compacta:

```txt
Avós Paternos
Avós Maternos
Bisavós Paternos
Bisavós Maternos
Tios Paternos
Tios Maternos
Irmãos
Sobrinhos
Pets
Filhos
Netos
```

Checklist:

- [ ] nenhum título aparece branco sobre fundo branco;
- [ ] nenhum título fica transparente;
- [ ] nenhum título é encoberto por conector;
- [ ] títulos não quebram layout em 320px.

---

## 11. Zoom/overview em `/mapa-familiar`

Checklist:

- [ ] botão `Zoom` abre overview com 9 cards;
- [ ] botão de fechar fecha o overview;
- [ ] tocar em cada card fecha o overview;
- [ ] cada card navega para a tela correta da grade 3x3;
- [ ] card atual é identificado visualmente;
- [ ] ao navegar, a tela de destino não aparece deslocada ou vazia;
- [ ] o overview não entra na exportação;
- [ ] overview não deixa `body` travado após fechar.

---

## 12. `/mapa-familiar-horizontal`

Checklist:

- [ ] página carrega sem travar;
- [ ] mobile renderiza `MobileFamilyHorizontalMapView`;
- [ ] botões `Ger X` funcionam;
- [ ] swipe lateral troca geração;
- [ ] scroll vertical da geração ativa funciona;
- [ ] botão `Zoom` abre overview com 9 cards;
- [ ] card do overview direciona para a geração correspondente;
- [ ] botão `+` abre painel completo com overlay escuro e painel branco/opaco.

---

## 13. Painel do botão `+`

Checklist:

- [ ] botão `+` abre painel;
- [ ] overlay escurece o fundo;
- [ ] painel principal é branco/opaco;
- [ ] conteúdo interno tem scroll;
- [ ] fechar pelo overlay funciona;
- [ ] fechar por ação interna funciona;
- [ ] body destrava ao fechar;
- [ ] painel não aparece na exportação.

---

## 14. Critérios de aprovação

A frente mobile só deve ser considerada validada quando:

- [ ] `/mapa-familiar` e `/mapa-familiar-horizontal` carregarem em Safari/iOS;
- [ ] overview abrir nas duas rotas;
- [ ] cards do overview navegarem corretamente;
- [ ] as 9 telas da grade forem acessíveis de acordo com a matriz;
- [ ] gestos bloqueados não navegarem;
- [ ] `descendants` rolar internamente;
- [ ] tios exibirem cards quando houver dados e respeitarem a matriz de gestos;
- [ ] painel `+` não tiver fundo transparente;
- [ ] não houver travamento perceptível após abrir a página.

---

## 15. Pendências a registrar se falharem

| Sintoma | Registrar em |
|---|---|
| `descendants` não rola | `docs/PLANO_PROXIMOS_PASSOS.md` como `MOB-001` |
| tios não exibem cards ou não rolam | `docs/PLANO_PROXIMOS_PASSOS.md` como `MOB-002` |
| gestos mudam para tela incorreta | `docs/PLANO_PROXIMOS_PASSOS.md` como `MOB-003` |
| scripts mobile causam lentidão | `docs/PLANO_PROXIMOS_PASSOS.md` como `MOB-003` ou subitem técnico |
| overview horizontal não navega corretamente | `docs/PLANO_PROXIMOS_PASSOS.md` como `MOB-004` |
| painel `+` aparece transparente | `docs/PLANO_PROXIMOS_PASSOS.md` como `MOB-005` |
| conectores reaparecem duplicados após ajuste de navegação | `docs/PLANO_PROXIMOS_PASSOS.md` como `MOB-006` |

---

## 16. Nota de contenção de regressão

Se a navegação da grade 3x3 voltar a falhar, não adicionar outro script de captura global de touch antes de auditar estes arquivos:

```txt
src/mobileFamilyTreeNavigationRules.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeUncleScreenGuards.ts
src/mobileFamilyTreeSwipeHints.ts
src/mobileFamilyTreeZoomOverviewFix.ts
```

A correção preferencial é centralizar destino, bloqueio e disponibilidade de tela em uma única camada.
