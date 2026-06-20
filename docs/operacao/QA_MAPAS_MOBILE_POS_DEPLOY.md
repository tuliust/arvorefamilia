# QA pós-deploy — mapas familiares mobile

> Última revisão: 2026-06-20  
> Local: `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md`  
> Escopo: validação operacional pós-deploy das rotas `/mapa-familiar` e `/mapa-familiar-horizontal` em mobile.

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
- ordem de scripts em `index.html`.

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
- confirmar se o deployment testado é o deployment `Ready` correto.

> Atenção: parte dos ajustes recentes foi revertida ou recuperada por rollback. Não validar comportamento em branch/deployment antigo sem confirmar origem do commit e branch publicados.

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
- [ ] abrir/fechar Zoom não deixa a navegação presa.

---

## 5. `/mapa-familiar` — grade 3x3

Validar as 9 telas:

| Tela | Esperado |
|---|---|
| `paternal-ancestors` | ancestrais paternos visíveis quando houver dados |
| `ancestors` | avós paternos e maternos visíveis |
| `maternal-ancestors` | ancestrais maternos visíveis quando houver dados |
| `paternal-uncles` | título, grupo e cards de tios paternos visíveis quando houver dados |
| `core` | pai, mãe e pessoa central visíveis |
| `maternal-uncles` | título, grupo e cards de tios maternos visíveis |
| `paternal-cousins` | primos paternos quando houver dados |
| `descendants` | irmãos, cônjuge, sobrinhos, pets, filhos e netos conforme dados |
| `maternal-cousins` | primos maternos quando houver dados |

Navegação obrigatória:

- [ ] `core` → cima abre `ancestors`;
- [ ] `core` → esquerda abre `paternal-uncles`;
- [ ] `core` → direita abre `maternal-uncles`;
- [ ] `core` → baixo abre `descendants`;
- [ ] direções não permitidas nas telas laterais são bloqueadas;
- [ ] retorno das telas laterais para `core` funciona conforme contrato.

---

## 6. `/mapa-familiar` — tela `ancestors`

Checklist específico dos conectores de avós:

- [ ] `Avós paternos` aparece com cards visíveis;
- [ ] `Avós maternos` aparece com cards visíveis;
- [ ] linha horizontal sai da lateral esquerda de `Avós paternos`;
- [ ] linha horizontal sai da lateral direita de `Avós maternos`;
- [ ] linha vertical sai do centro inferior de `Avós paternos` em direção ao pai na tela `core`;
- [ ] linha vertical sai do centro inferior de `Avós maternos` em direção à mãe na tela `core`;
- [ ] conectores seguem a paleta ativa e a espessura das demais linhas;
- [ ] conectores não cobrem títulos ou cards;
- [ ] ao navegar para `paternal-ancestors` ou `maternal-ancestors`, não aparecem linhas verticais indevidas abaixo de bisavós/tataravós.

Arquivo relacionado:

```txt
src/mobileFamilyTreeAncestorConnectorsFix.ts
```

---

## 7. `/mapa-familiar` — `descendants`

Checklist:

- [ ] tela aparece ao deslizar para baixo a partir de `core`;
- [ ] há scroll interno quando conteúdo ultrapassa a altura útil;
- [ ] o último grupo é alcançável sem ficar escondido pelo bottom nav;
- [ ] swipe para cima/baixo não bloqueia a rolagem interna enquanto há conteúdo para rolar;
- [ ] linha entra no topo da tela e ramifica para `Irmãos` e `Cônjuge` quando ambos existirem;
- [ ] ramificação encosta visualmente no topo dos grupos, sem espaçamento excessivo;
- [ ] `Irmãos` conecta a `Sobrinhos` quando houver sobrinhos;
- [ ] `Cônjuge` conecta a `Pets` e `Filhos` quando houver ambos;
- [ ] se só houver `Pets`, o grupo ocupa sozinho a área abaixo de `Cônjuge`;
- [ ] se só houver `Filhos`, o grupo ocupa sozinho a área abaixo de `Cônjuge`;
- [ ] não aparecem linhas antigas transparentes ou duplicadas;
- [ ] linhas têm espessura e cor compatíveis com os demais conectores da árvore.

Arquivo relacionado:

```txt
src/mobileFamilyTreeDescendantConnectorsFix.ts
```

---

## 8. `/mapa-familiar` — tios

### `paternal-uncles`

Checklist:

- [ ] título `Tios Paternos` aparece;
- [ ] grupo aparece centralizado;
- [ ] cards aparecem e são legíveis;
- [ ] se houver mais cards do que a área útil, a tela permite rolagem interna;
- [ ] swipe vertical não navega para outra tela antes de esgotar o scroll interno;
- [ ] largura do grupo não deixa excesso de área vazia quando há poucos cards.

### `maternal-uncles`

Checklist:

- [ ] título `Tios Maternos` aparece;
- [ ] grupo aparece centralizado;
- [ ] grupo não fica grande demais;
- [ ] cards são legíveis;
- [ ] se houver mais cards do que a área útil, a tela permite rolagem interna.

---

## 9. Títulos de grupos

Validar que os títulos abaixo aparecem escuros, legíveis e com fonte compacta:

```txt
Avós paternos
Avós maternos
Tios Paternos
Tios Maternos
Irmãos
Sobrinhos
Cônjuge
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

## 10. Zoom/overview em `/mapa-familiar`

Checklist:

- [ ] botão `Zoom` abre overview com 9 cards;
- [ ] botão de fechar fecha o overview;
- [ ] tocar em cada card fecha o overview;
- [ ] cada card navega para a tela correta da grade 3x3;
- [ ] card atual é identificado visualmente;
- [ ] contagem aparece como `pessoa`/`pessoas`, não `card`/`cards`;
- [ ] não aparece texto `Toque para abrir`;
- [ ] não aparecem textos auxiliares removidos como `ancestrais profundos`, `tela inicial da árvore`, `área lateral esquerda` ou `área lateral direita`;
- [ ] ao navegar, a tela de destino não aparece deslocada ou vazia;
- [ ] o overview não entra na exportação;
- [ ] após fechar o overview, swipe e bottom nav continuam funcionando.

Arquivo relacionado:

```txt
src/mobileFamilyTreeZoomOverviewFix.ts
```

---

## 11. `/mapa-familiar-horizontal`

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

## 12. Painel do botão `+`

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

## 13. Critérios de aprovação

A frente mobile só deve ser considerada validada quando:

- [ ] `/mapa-familiar` e `/mapa-familiar-horizontal` carregarem em Safari/iOS;
- [ ] overview abrir nas duas rotas;
- [ ] cards do overview navegarem corretamente;
- [ ] conectores da tela `ancestors` estiverem corretos e sem vazamento para bisavós;
- [ ] conectores da tela `descendants` estiverem alinhados e sem linhas duplicadas;
- [ ] `descendants` rolar internamente;
- [ ] `paternal-uncles` exibir cards quando houver dados;
- [ ] painel `+` não tiver fundo transparente;
- [ ] não houver travamento perceptível após abrir a página.

---

## 14. Pendências a registrar se falharem

| Sintoma | Registrar em |
|---|---|
| `descendants` não rola | `docs/PLANO_PROXIMOS_PASSOS.md` como `MOB-001` ou item específico de descendentes |
| `paternal-uncles` não exibe cards | `docs/PLANO_PROXIMOS_PASSOS.md` como item de tios |
| scripts mobile causam lentidão | `docs/PLANO_PROXIMOS_PASSOS.md` como risco de consolidação dos scripts no React |
| overview horizontal não navega corretamente | `docs/PLANO_PROXIMOS_PASSOS.md` como item do overview horizontal |
| painel `+` aparece transparente | `docs/PLANO_PROXIMOS_PASSOS.md` como item do painel mobile |
| conectores de `ancestors` não aparecem ou vazam para bisavós | `docs/PLANO_PROXIMOS_PASSOS.md` como item de conectores mobile |
| conectores de `descendants` ficam finos, duplicados ou desalinhados | `docs/PLANO_PROXIMOS_PASSOS.md` como item de conectores mobile |
