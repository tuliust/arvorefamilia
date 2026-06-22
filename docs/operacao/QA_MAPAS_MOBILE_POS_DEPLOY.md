# QA pós-deploy — mapas familiares mobile

> Última revisão: 2026-06-22  
> Local: `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md`  
> Escopo: validação operacional pós-deploy das rotas `/mapa-familiar` e `/mapa-familiar-horizontal` em mobile.  
> Status: checklist atualizado conforme baseline `baseline/mapas-mobile-padrao-2026-06-20`.

---

## 1. Quando usar

Use este checklist depois de mudanças em:

- `MobileFamilyTreeView`;
- `MobileFamilyHorizontalMapView`;
- toolbar mobile dos mapas;
- `mobileFamilyHorizontalZoomOverview.ts`;
- `mobileFamilyMapStableMobileFix.ts`;
- `mobileFamilyMapDirectionalNavigationFix.ts`;
- `mobileFamilyMapCoreConnectorFix.ts`;
- scripts `mobileFamilyTree*` ainda carregados;
- conectores;
- paletas;
- scroll interno;
- overview/Zoom;
- painel mobile aberto pelo botão `+`;
- listeners de touch, swipe, `MutationObserver` ou `data-mobile-family-tree-active-screen`.

---

Complemento de scripts vigentes da rodada mais recente:

```txt
src/mobileFamilyMapCoreConnectorFix.ts
src/mobileVisualizationPanelFamilyStatsFix.ts
src/mobileFamilyMapZoomOverviewVisualFix.ts
src/mobileFamilyMapDescendantsStabilityLock.ts
src/mobileFamilyMapExtendedSpouseCards.ts
src/mobileFamilyMapFilterButtonsBehaviorFix.ts
src/mobileFamilyMapFullOverview.ts
src/mobileFamilyMapFullOverviewMosaicFix.ts
```

## 2. Preparação

Antes de validar em produção, executar localmente quando houver runtime disponível:

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
- testar em conexão comum;
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

## 4. Conferência de deploy

Antes do QA visual:

- [ ] GitHub mostra check verde no commit final.
- [ ] Vercel mostra deployment `Ready` em Production.
- [ ] O commit ativo em produção é o mais recente da sequência validada.
- [ ] Safari foi recarregado após o deployment.
- [ ] Se o comportamento parecer antigo, limpar cache/abrir aba privada.
- [ ] Comparar contra a branch `baseline/mapas-mobile-padrao-2026-06-20` quando houver suspeita de regressão.

---

## 5. `/mapa-familiar` — carregamento

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

## 6. `/mapa-familiar` — grade 3x3

Validar as 9 telas:

| Tela | Esperado |
|---|---|
| `paternal-ancestors` | bisavós/tataravós paternos visíveis quando houver dados |
| `ancestors` | apenas avós paternos e maternos visíveis |
| `maternal-ancestors` | bisavós/tataravós maternos visíveis quando houver dados |
| `paternal-uncles` | título, grupo e cards de tios paternos visíveis quando houver dados; estado vazio controlado quando não houver |
| `core` | pai, mãe e pessoa central; sem grupos descendentes visíveis |
| `maternal-uncles` | título, grupo e cards de tios maternos visíveis |
| `paternal-cousins` | primos paternos quando houver dados |
| `descendants` | irmãos, cônjuge, sobrinhos, pets, filhos e netos conforme dados |
| `maternal-cousins` | primos maternos quando houver dados |

---

## 7. `/mapa-familiar` — matriz de navegação

Regra de registro de bug: informar sempre tela atual, movimento físico do dedo, direção funcional esperada, destino esperado e destino real.

| Tela atual | Gestos funcionais permitidos | Gestos funcionais bloqueados |
|---|---|---|
| `paternal-ancestors` | direita → `ancestors` | cima, baixo, esquerda |
| `ancestors` | esquerda → `paternal-ancestors`; direita → `maternal-ancestors`; baixo → `core` | cima |
| `maternal-ancestors` | esquerda → `ancestors` | cima, baixo, direita |
| `paternal-uncles` | direita → `core`; baixo → `paternal-cousins` | cima, esquerda |
| `core` | cima → `ancestors`; baixo → `descendants`; esquerda → `paternal-uncles`; direita → `maternal-uncles` | nenhuma, se houver destino |
| `maternal-uncles` | esquerda → `core`; baixo → `maternal-cousins` | cima, direita |
| `paternal-cousins` | cima → `paternal-uncles` | baixo, esquerda, direita |
| `descendants` | cima → `core`, respeitando scroll interno | baixo, esquerda, direita |
| `maternal-cousins` | cima → `maternal-uncles` | baixo, esquerda, direita |

Checklist:

- [ ] nenhum gesto bloqueado muda de tela;
- [ ] nenhum gesto permitido fica sem resposta quando há destino;
- [ ] gestos em telas com scroll interno priorizam rolagem antes de navegação;
- [ ] `paternal-uncles` bloqueia esquerda e desce para `paternal-cousins`;
- [ ] `descendants` bloqueia esquerda, direita e baixo;
- [ ] Zoom da rota vertical leva para a mesma tela que o gesto levaria.

---

## 8. `/mapa-familiar` — `core`

Checklist:

- [ ] pai, mãe e pessoa central aparecem;
- [ ] grupos `Irmãos`, `Sobrinhos`, `Cônjuge`, `Pets`, `Filhos` e `Netos` não aparecem visualmente no `core`;
- [ ] conectores superiores entre pai/mãe e pessoa central permanecem;
- [ ] linha vertical central abaixo da pessoa principal não aparece;
- [ ] bottom nav não cobre permanentemente a estrutura;
- [ ] navegar para baixo a partir de `core` abre `descendants`.

---

## 9. `/mapa-familiar` — `descendants`

Checklist:

- [ ] tela aparece ao navegar para baixo a partir de `core`;
- [ ] contém `Irmãos`, `Sobrinhos`, `Cônjuge`, `Pets`, `Filhos` e `Netos` conforme dados;
- [ ] há scroll interno quando conteúdo ultrapassa a altura útil;
- [ ] o último grupo é alcançável sem ficar escondido pelo bottom nav;
- [ ] swipe vertical não bloqueia a rolagem interna enquanto há conteúdo para rolar;
- [ ] volta para `core` somente pela direção funcional para cima;
- [ ] direções baixo, esquerda e direita são bloqueadas;
- [ ] não há tremor subindo/descendo rapidamente;
- [ ] não aparecem linhas antigas transparentes ou duplicadas.

---

## 10. `/mapa-familiar` — ancestrais

Checklist:

- [ ] `ancestors` mostra apenas `Avós Paternos` e `Avós Maternos`;
- [ ] não há linhas verticais acima dos grupos de avós;
- [ ] `paternal-ancestors` conecta visualmente para a direita;
- [ ] `maternal-ancestors` conecta visualmente para a esquerda;
- [ ] não existe navegação vertical em ancestrais profundos.

---

## 11. `/mapa-familiar` — tios

### `paternal-uncles`

- [ ] título `Tios Paternos` aparece;
- [ ] grupo aparece em posição alta/compacta;
- [ ] cards aparecem e são legíveis quando houver dados;
- [ ] estado vazio controlado aparece quando não houver dado real;
- [ ] não há linha vertical acima do grupo;
- [ ] se houver mais cards do que a área útil, a tela permite rolagem interna;
- [ ] swipe para direita leva para `core`;
- [ ] swipe para baixo leva para `paternal-cousins`;
- [ ] swipe para cima não muda de tela;
- [ ] swipe para esquerda não muda de tela.

### `maternal-uncles`

- [ ] título `Tios Maternos` aparece;
- [ ] grupo aparece em posição alta/compacta;
- [ ] grupo não fica grande demais;
- [ ] cards são legíveis;
- [ ] não há linha vertical acima do grupo;
- [ ] se houver mais cards do que a área útil, a tela permite rolagem interna;
- [ ] swipe para esquerda leva para `core`;
- [ ] swipe para baixo leva para `maternal-cousins`;
- [ ] swipe para cima não muda de tela;
- [ ] swipe para direita não muda de tela.

---

## 12. `/mapa-familiar` — primos

Checklist:

- [ ] `paternal-cousins` mostra cards quando houver dados;
- [ ] `maternal-cousins` mostra cards quando houver dados;
- [ ] linha vertical conecta ao topo do grupo;
- [ ] grupo não fica excessivamente baixo;
- [ ] há scroll interno se houver muitos cards;
- [ ] `paternal-cousins` só navega para cima;
- [ ] `maternal-cousins` só navega para cima;
- [ ] direções baixo, esquerda e direita são bloqueadas.

---

## 13. Zoom em `/mapa-familiar`

Checklist:

- [ ] botão **Zoom** da toolbar superior abre overview 3x3;
- [ ] overview exibe 9 cards;
- [ ] cada card leva à tela correta;
- [ ] card atual aparece destacado;
- [ ] `descendants` aparece como destino válido;
- [ ] abrir Zoom a partir de `descendants` não causa tremor;
- [ ] overview não entra na exportação;
- [ ] botão **Exibir mapa completo** aparece quando aplicável;
- [ ] **Exibir mapa completo** abre mosaico único em overlay;
- [ ] pinça, arraste e reenquadramento do mosaico funcionam;
- [ ] fechar overview/mosaico destrava `body`.

## 14. `/mapa-familiar-horizontal`

Checklist:

- [ ] página carrega sem travar;
- [ ] mobile renderiza `MobileFamilyHorizontalMapView`;
- [ ] botões `Ger X` funcionam;
- [ ] swipe lateral troca geração;
- [ ] scroll vertical da geração ativa funciona;
- [ ] conectores horizontais permanecem visíveis;
- [ ] botão `+` abre painel completo com overlay escuro e painel branco/opaco.

---

## 15. Zoom em `/mapa-familiar-horizontal`

Checklist:

- [ ] botão **Zoom** abre overview por gerações;
- [ ] não abre grade 3x3;
- [ ] cards/botões representam gerações disponíveis;
- [ ] selecionar uma geração navega para a geração correta;
- [ ] o overview fecha após seleção;
- [ ] botões `Ger X` continuam funcionando;
- [ ] swipe lateral continua funcionando;
- [ ] scroll vertical da geração ativa continua funcionando;
- [ ] overview não entra na exportação.

## 16. Painéis superiores e botão `+`

### Toolbar superior

Checklist:

- [ ] toolbar mostra `Formato`, `Cor`, `Filtros` e `Zoom`;
- [ ] toolbar não mostra `Exportar` como item fixo;
- [ ] `Formato` alterna entre rotas oficiais e preserva `?pessoa=`;
- [ ] `Cor` aplica paleta;
- [ ] `Filtros` altera cônjuges estendidos;
- [ ] `Zoom` abre overview adequado à rota ativa.

### Botão `+`

Checklist:

- [ ] botão `+` abre painel completo de **Visualização**;
- [ ] overlay escurece o fundo;
- [ ] painel principal é branco/opaco;
- [ ] painel tem rolagem interna;
- [ ] seletor de visualizador/família funciona e preserva/altera `?pessoa=`;
- [ ] alternância de formato preserva query string;
- [ ] resumo/estatísticas são exibidos sem quebrar layout;
- [ ] ação de salvar/exportar funciona conforme código vigente;
- [ ] painel não entra na exportação;
- [ ] fechar painel destrava `body`.

## 17. Critérios de aprovação

A frente mobile só deve ser considerada validada quando:

- [ ] `/mapa-familiar` e `/mapa-familiar-horizontal` carregarem em Safari/iOS;
- [ ] `core` não duplicar descendentes;
- [ ] `descendants` concentrar os descendentes e rolar internamente;
- [ ] as 9 telas da grade forem acessíveis de acordo com a matriz;
- [ ] gestos bloqueados não navegarem;
- [ ] tios exibirem cards quando houver dados e respeitarem a matriz de gestos;
- [ ] linhas verticais acima dos tios estiverem ausentes;
- [ ] Zoom 3x3 abrir em `/mapa-familiar`;
- [ ] Zoom por gerações abrir em `/mapa-familiar-horizontal`;
- [ ] painéis `Cor` e `Filtros` estiverem compactos;
- [ ] painel `+` não tiver fundo transparente;
- [ ] não houver travamento perceptível após abrir a página.

---

## 18. Regra operacional

Se a navegação, Zoom ou duplicação de cards voltar a falhar, não adicionar outro script global antes de auditar:

```txt
src/mobileFamilyHorizontalZoomOverview.ts
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
src/mobileFamilyMapCoreConnectorFix.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeSwipeHints.ts
```

A correção preferencial é centralizar destino, bloqueio, disponibilidade de tela e overview em uma única camada ou migrar para React/hooks.
