# QA manual — Árvore Família

> Última revisão: 2026-06-22  
> Local canônico: `docs/QA_MANUAL.md`  
> Projeto: `tuliust/arvorefamilia`  
> Tipo: guia central de QA manual  
> Status: revisado contra o código atual para incluir toolbar mobile, modal legado, mapa completo, riscos de exportação, onboarding com pets e fatos históricos.

---

## 1. Objetivo

---

## Atualização crítica — 2026-06-22

Antes de executar qualquer Prompt 6 ou ajuste de mapa mobile, usar este guia junto com:

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/operacao/QA_MAPAS_MOBILE_2026_06_21.md
docs/operacao/NAO_REGRESSAO_MAPAS_MOBILE.md
```

Pontos observados no código atual:

- a toolbar fixa mobile tem `Formato`, `Cor`, `Filtros`, `Zoom` e `+`;
- a horizontal atual é renderizada por componentes `*HorizontalMapFilteredView`;
- o `index.html` carrega scripts recentes de Zoom visual, lock de descendentes, cônjuges estendidos, filtros mobile, mapa completo e mosaico;
- o modal legacy `Controles` ainda usa `SidebarPanelTabs mobileControls` e pode expor `Exportar`;
- o painel completo do `+` possui ação `Salvar`;
- `Home.tsx` ainda mantém `Visualizar como...`.

Regra de QA: se a documentação disser que uma ação não existe, mas o código/visual ainda mostrar a ação, registrar como divergência documental ou pendência de código, não como teste aprovado.


Este guia centraliza os procedimentos de QA manual do projeto **Árvore Família**.

Use este arquivo para validar:

- rotas oficiais e rotas removidas;
- guards e navegação;
- Árvore Familiar vertical;
- Mapa Genealógico horizontal;
- mobile e breakpoints;
- toolbar, zoom, overview e painel `+`;
- paletas;
- cards, avatares e conectores;
- exportação;
- calendário familiar;
- perfil e retorno;
- fórum;
- notificações;
- admin;
- deploy e pós-deploy.

Documentos complementares:

| Documento | Papel |
|---|---|
| `docs/REGRAS_DE_NAO_REGRESSAO.md` | contratos técnicos e regras que não devem ser violadas |
| `docs/PLANO_PROXIMOS_PASSOS.md` | pendências, riscos e decisões futuras |
| `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` | contrato funcional das duas views da árvore |
| `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md` | contrato mobile detalhado dos mapas familiares |
| `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md` | checklist pós-deploy específico dos mapas mobile |
| `docs/funcionalidades/EXPORTACAO_ARVORE.md` | contrato técnico da exportação |
| `docs/operacao/DEPLOYMENT.md` | procedimento completo de deploy e operação |

---

## 2. Comandos mínimos

### Mudança documental

```bash
git diff --check
npm run build
```

### Mudança de código não visual

```bash
git diff --check
npm run build
npm test
```

### Mudança em rotas, guards, árvore, navegação, exportação ou mobile

```bash
git diff --check
npm run build
npm test
npm run test:e2e
```

### Mudança visual/CSS

```bash
git diff --check
npm run build
npm run test:e2e
```

---

## 3. Breakpoints e ambientes mínimos

### Mobile

Validar, no mínimo:

```txt
320px
375px
390px
430px
```

### Tablet e desktop

Validar, quando a mudança envolver árvore, painel, exportação ou layout:

```txt
tablet
1366px
1440px
1536px
1920px
```

### Navegadores

Quando houver mudança mobile ou deploy:

```txt
Chrome desktop
Chrome Android, quando possível
Safari/iOS, quando possível
janela anônima/privada no pós-deploy
```

---

## 4. QA de documentação

Checklist:

- [ ] `docs/README.md` aponta para documentos existentes.
- [ ] `docs/QA_MANUAL.md` é referenciado quando o assunto for QA manual.
- [ ] `docs/REGRAS_DE_NAO_REGRESSAO.md` mantém regras, não checklists longos duplicados.
- [ ] `docs/PLANO_PROXIMOS_PASSOS.md` contém apenas pendências, riscos e decisões abertas.
- [ ] documentos funcionais descrevem comportamento implementado, não backlog.
- [ ] documentos operacionais concentram deploy, migrations, OAuth, Storage e secrets.
- [ ] documentos históricos não parecem fonte vigente.
- [ ] rotas antigas aparecem apenas como histórico, keyword ou anti-regressão.
- [ ] não há links quebrados óbvios para documentos movidos/removidos.
- [ ] `git diff --check` não retorna trailing whitespace.

---

## 5. QA de rotas e guards

Rotas oficiais da árvore:

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
```

Exceção vigente:

```txt
/minha-arvore/editar
```

Rotas antigas que não devem voltar como views ativas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Checklist:

- [ ] `/` redireciona para `/mapa-familiar` ou para `/entrar` conforme sessão/guard.
- [ ] `/?pessoa=abc` preserva `?pessoa=abc` ao redirecionar.
- [ ] `/mapa-familiar` exige acesso de árvore.
- [ ] `/mapa-familiar-horizontal` exige acesso de árvore.
- [ ] `/busca` exige acesso de árvore.
- [ ] `/minha-arvore/editar` permanece protegida como rota de membro.
- [ ] `/minha-arvore`, `/genealogia` e `/visao-completa` não renderizam views da árvore.
- [ ] usuário comum não acessa `/admin/*`.

---

## 6. QA de `TreeViewMode`

Contrato:

```txt
mapa-familiar
mapa-familiar-horizontal
```

Checklist:

- [ ] `VIEW_MODE_TO_PATH` contém só as duas views oficiais.
- [ ] `PATH_TO_VIEW_MODE` reconhece `/`, `/mapa-familiar` e `/mapa-familiar-horizontal`.
- [ ] fallback desconhecido retorna `mapa-familiar`.
- [ ] alternância Vertical/Horizontal preserva `location.search`.
- [ ] `?pessoa=...` não é perdido.
- [ ] rotas removidas não são reintroduzidas no tipo.

---

## 7. QA da Árvore Familiar vertical — `/mapa-familiar`

Componentes esperados:

| Ambiente | Componente |
|---|---|
| Desktop/tablet | `DesktopFamilyMapView` |
| Mobile | `MobileFamilyTreeView` |

### Desktop/tablet

Checklist:

- [ ] canvas vertical/panorâmico renderiza sem erro.
- [ ] pessoa central aparece.
- [ ] grupos familiares aparecem conforme dados e filtros.
- [ ] cônjuge principal aparece quando existe.
- [ ] múltiplos núcleos conjugais aparecem apenas quando há dados reais.
- [ ] pets aparecem com filtro próprio quando existentes.
- [ ] conectores não invadem cards.
- [ ] zoom aproxima e afasta.
- [ ] restaurar visualização funciona.
- [ ] painel não quebra bounds, conectores ou exportação.

### Mobile — grade 3x3

Checklist:

- [ ] renderiza `MobileFamilyTreeView`.
- [ ] a tela `core` aparece como centro da grade.
- [ ] a grade possui as telas `paternal-ancestors`, `ancestors`, `maternal-ancestors`, `paternal-uncles`, `core`, `maternal-uncles`, `paternal-cousins`, `descendants` e `maternal-cousins`.
- [ ] cards preservam contraste.
- [ ] grupos e bordas seguem paleta ativa.
- [ ] conectores HTML/CSS respeitam hierarquia visual.
- [ ] não há scroll horizontal global indevido.
- [ ] bottom nav não cobre permanentemente cards ou títulos.

### Mobile — `descendants`

Checklist:

- [ ] tela aparece ao deslizar para baixo a partir de `core`.
- [ ] há scroll interno quando conteúdo ultrapassa a altura útil.
- [ ] o último grupo é alcançável sem ficar escondido pelo bottom nav.
- [ ] swipe para cima/baixo não bloqueia a rolagem interna enquanto há conteúdo para rolar.
- [ ] linha entra na tela e ramifica para `Irmãos` e `Cônjuge`.
- [ ] `Irmãos` conecta a `Sobrinhos` quando houver sobrinhos.
- [ ] `Cônjuge` conecta a `Pets` e `Filhos` quando houver ambos.
- [ ] se só houver `Pets`, o grupo ocupa sozinho a área abaixo de `Cônjuge`.
- [ ] se só houver `Filhos`, o grupo ocupa sozinho a área abaixo de `Cônjuge`.
- [ ] não aparecem linhas antigas transparentes ou duplicadas.

### Mobile — tios

Checklist para `paternal-uncles`:

- [ ] título `Tios Paternos` aparece.
- [ ] grupo aparece centralizado.
- [ ] cards aparecem e são legíveis quando houver dados.
- [ ] se houver mais cards do que área útil, a tela permite rolagem interna.
- [ ] swipe vertical não navega para outra tela antes de esgotar o scroll interno.
- [ ] largura do grupo não deixa excesso de área vazia quando há poucos cards.

Checklist para `maternal-uncles`:

- [ ] título `Tios Maternos` aparece.
- [ ] grupo aparece centralizado.
- [ ] grupo não fica grande demais.
- [ ] cards são legíveis.
- [ ] se houver mais cards do que área útil, a tela permite rolagem interna.

### Mobile — títulos de grupos

Validar títulos:

```txt
Tios Paternos
Tios Maternos
Irmãos
Sobrinhos
Pets
Filhos
Netos
```

Checklist:

- [ ] nenhum título aparece branco sobre fundo branco.
- [ ] nenhum título fica transparente.
- [ ] nenhum título é encoberto por conector.
- [ ] títulos não quebram layout em 320px.

---

## 8. QA do Mapa Genealógico horizontal — `/mapa-familiar-horizontal`

Componentes esperados:

| Ambiente | Componente |
|---|---|
| Desktop/tablet | `DesktopFamilyHorizontalMapFilteredView` |
| Mobile | `MobileFamilyHorizontalMapFilteredView` |

### Desktop/tablet

Checklist:

- [ ] pessoas aparecem por geração/coluna.
- [ ] `manual_generation` é respeitado quando disponível.
- [ ] colunas vazias são ocultadas.
- [ ] cônjuges adjacentes aparecem conforme regra implementada.
- [ ] conectores casal → filhos estão alinhados.
- [ ] filtros afetam a visualização sem alterar dados.
- [ ] paleta ativa altera cards, conectores e canvas.
- [ ] exportação usa título `Mapa Genealógico`.

### Mobile

Checklist:

- [ ] renderiza `MobileFamilyHorizontalMapFilteredView`.
- [ ] uma geração aparece por tela.
- [ ] botões `Ger 1`, `Ger 2`, `Ger 3` etc. funcionam.
- [ ] swipe lateral troca geração.
- [ ] scroll vertical permite ver último card e conectores.
- [ ] não há barra Paterno/Central/Materno.
- [ ] não há scroll horizontal manual como navegação principal.
- [ ] botão de controles fica alinhado à linha de `Ger`.
- [ ] primeira tela corresponde à menor geração visível.
- [ ] paletas não azuis não caem em fallback azul/teal.

---

## 9. QA do Zoom/overview mobile

### `/mapa-familiar`

Checklist:

- [ ] botão `Zoom` abre overview com 9 cards.
- [ ] botão de fechar fecha o overview.
- [ ] tocar em cada card fecha o overview.
- [ ] cada card navega para a tela correta da grade 3x3.
- [ ] card atual é identificado visualmente.
- [ ] ao navegar, a tela de destino não aparece deslocada ou vazia.
- [ ] overview não entra na exportação.

### `/mapa-familiar-horizontal`

Checklist:

- [ ] botão `Zoom` abre overview com 9 cards.
- [ ] tocar em um card navega para a geração correspondente.
- [ ] overview fecha após escolha.
- [ ] o mapa horizontal não perde scroll vertical da geração ativa.

---

## 10. QA do painel mobile aberto pelo botão `+`

Checklist:

- [ ] botão `+` abre painel.
- [ ] overlay escurece o fundo.
- [ ] painel principal é branco/opaco.
- [ ] conteúdo interno tem scroll.
- [ ] fechar pelo overlay funciona.
- [ ] fechar por ação interna funciona.
- [ ] body destrava ao fechar.
- [ ] painel não aparece na exportação.

---

## 11. QA de paletas

Paletas oficiais:

```txt
white
visual
orange
brown
```

Checklist por paleta:

- [ ] cards mudam corretamente.
- [ ] bordas mudam corretamente.
- [ ] grupos mudam corretamente.
- [ ] conectores mudam corretamente.
- [ ] labels e títulos preservam contraste.
- [ ] painel acompanha vocabulário visual.
- [ ] exportação preserva a paleta.
- [ ] paletas `white`, `orange` e `brown` não caem em fallback azul/teal.

---

## 12. QA de cards e avatares

Contrato:

| Caso | Esperado |
|---|---|
| Pessoa com foto | foto real |
| Pessoa sem foto | ícone `User` |
| Pet sem foto | ícone `PawPrint` |

Checklist:

- [ ] pessoa sem foto não usa fallback por gênero.
- [ ] pet não usa ícone de pessoa.
- [ ] ícones preservam contraste.
- [ ] exportação preserva ícones.
- [ ] nascimento aparece apenas quando há ano/data real.
- [ ] falecimento aparece apenas quando há ano/data real.
- [ ] `Nascimento não informado` não aparece no resultado visual.
- [ ] `Falecimento não informado` não aparece no resultado visual.

---

## 13. QA de cônjuges, núcleos e conectores

Checklist:

- [ ] cônjuge da pessoa central aparece quando há relação.
- [ ] cônjuges de avós/bisavós/tataravós aparecem como ancestrais quando aplicável.
- [ ] filtro `Cônjuges` afeta grupos filtráveis implementados.
- [ ] `pais`/Geração 4 não é tratado como implementado até correção documentada.
- [ ] nenhum cônjuge é inferido apenas por proximidade visual.
- [ ] pessoa central com mais de um relacionamento explícito não perde cônjuges adicionais.
- [ ] filhos são agrupados pelo outro pai/mãe quando relação existir.
- [ ] conectores representam relações explícitas.
- [ ] conectores não invadem cards.
- [ ] conectores não são cortados no fim da superfície.
- [ ] conectores seguem paleta ativa.

---

## 14. QA de exportação

## QA complementar — onboarding, pets e fatos históricos

### `/meus-vinculos`

- [ ] grupo `Pets` aparece separado de `Filhos`;
- [ ] pets não aparecem na contagem de filhos humanos;
- [ ] criação manual de pet grava/usa `humano_ou_pet: 'Pet'`;
- [ ] card de pet usa linguagem de tutela;
- [ ] badge de pessoa com usuário vinculado é `Cadastrado`;
- [ ] pessoa sem usuário vinculado é `Pré-cadastrado`;
- [ ] cônjuge ativo é único;
- [ ] cônjuge falecido ou pessoa central falecida não permite relação ativa;
- [ ] rascunho antigo de `sessionStorage` sem `pets` não quebra a tela.

### `/arquivos-historicos`

Validar esta seção somente depois de confirmar o commit/migration de fatos sem arquivo:

- [ ] página usa título `Fatos e Arquivos Históricos`;
- [ ] é possível salvar fato/memória sem arquivo;
- [ ] título ou descrição é obrigatório como conteúdo mínimo;
- [ ] upload opcional de imagem/PDF continua funcionando;
- [ ] registros antigos com arquivo continuam abrindo;
- [ ] `participante_ids` funciona quando existir e não bloqueia ambientes sem a coluna.


Ações:

```txt
Área
Imagem/PNG
PDF
Imprimir
```

Validar em:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Checklist:

- [ ] Área abre seleção.
- [ ] segundo clique em Área fecha seleção.
- [ ] seleção mínima é respeitada.
- [ ] PNG gera arquivo.
- [ ] PDF gera arquivo.
- [ ] Imprimir abre fluxo de impressão.
- [ ] loading aparece durante ação real.
- [ ] erro libera loading.
- [ ] título correto é adicionado.
- [ ] painel não aparece.
- [ ] header não aparece.
- [ ] bottom nav não aparece.
- [ ] modal mobile não aparece.
- [ ] overview não aparece.
- [ ] overlay de seleção não aparece.
- [ ] paleta ativa é preservada.
- [ ] conectores são preservados.
- [ ] ícones SVG são preservados.

---

## 15. QA do calendário familiar

Checklist mobile:

- [ ] cinco botões de categorias aparecem em uma linha quando possível.
- [ ] bolinha colorida aparece acima do título.
- [ ] título permanece em uma linha.
- [ ] ellipsis funciona em telas extremas.
- [ ] não há overflow horizontal global.
- [ ] filtros alteram eventos visíveis.
- [ ] estado visual reflete categoria ativa/inativa.
- [ ] Google Agenda não quebra quando OAuth não está configurado.

---

## 16. QA de perfil, retorno e pessoas

Checklist:

- [ ] perfil aberto a partir de `/mapa-familiar` retorna para `/mapa-familiar`.
- [ ] perfil aberto a partir de `/mapa-familiar-horizontal` retorna para `/mapa-familiar-horizontal`.
- [ ] retorno com `?pessoa=...` é preservado quando codificado em `voltar`.
- [ ] URL externa em `voltar` é rejeitada.
- [ ] retorno inválido cai em `/mapa-familiar`.
- [ ] usuário comum não edita pessoa sem permissão.
- [ ] admin mantém acesso esperado.

---

## 17. QA de fórum, notificações e admin

### Fórum

- [ ] fórum lista tópicos.
- [ ] usuário autenticado cria tópico.
- [ ] usuário autorizado edita tópico.
- [ ] respostas funcionam.
- [ ] favoritos funcionam.
- [ ] notificações associadas não quebram.

### Notificações

- [ ] central lista notificações.
- [ ] marcação de leitura funciona.
- [ ] preferências carregam.
- [ ] preferências salvam.
- [ ] e-mails/secrets não aparecem no frontend.

### Admin

- [ ] usuário admin acessa `/admin`.
- [ ] usuário comum é bloqueado.
- [ ] áreas administrativas não expõem dados para usuário comum.

---

## 18. Critérios de aprovação pós-deploy mobile

A frente de mapas mobile só deve ser considerada validada quando:

- [ ] `/mapa-familiar` e `/mapa-familiar-horizontal` carregarem em Safari/iOS.
- [ ] overview abrir nas duas rotas.
- [ ] cards do overview navegarem corretamente.
- [ ] `descendants` rolar internamente.
- [ ] `paternal-uncles` exibir cards quando houver dados.
- [ ] painel `+` não tiver fundo transparente.
- [ ] não houver travamento perceptível após abrir a página.

Checklist operacional detalhado:

```txt
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
```


## 8.1 QA da toolbar fixa mobile dos mapas

Validar nas rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Checklist:

- [ ] a toolbar fixa aparece abaixo do header;
- [ ] itens visíveis: `Formato`, `Cor`, `Filtros`, `Zoom` e botão `+`;
- [ ] `Formato` preserva `?pessoa=...` ao alternar a view;
- [ ] `Cor` altera paleta sem quebrar cards/conectores;
- [ ] `Filtros` alterna cônjuges estendidos sem alterar dados;
- [ ] `Zoom` abre overview correto da rota atual;
- [ ] `+` abre painel completo de visualização;
- [ ] popovers ficam acima da árvore e abaixo de overlays críticos;
- [ ] nenhum popover entra na exportação;
- [ ] fechar/trocar popover não trava scroll, swipe ou body.

### Divergência conhecida a validar

O modal legacy `Controles`, quando aberto por `legendOpen`, ainda renderiza `SidebarPanelTabs mobileControls`.

Checklist específico:

- [ ] verificar se o modal `Controles` ainda mostra `Exportar`;
- [ ] se mostrar, registrar como comportamento atual do código;
- [ ] se a decisão de produto for remover, abrir frente de código específica;
- [ ] não aprovar documentação dizendo “sem Exportar” se a UI continuar exibindo Exportar.

## Atualização 2026-06-22 — Roteiro de QA pós-7D

### Onboarding

1. `/meus-dados`: validar pergunta `Qual é o seu estilo?`.
2. `/meus-dados`: validar que `Nostálgico` não força modo memorial.
3. `/meus-dados`: marcar toggle de pessoa falecida e validar geração em passado com qualquer tom.
4. `/meus-dados`: confirmar que existem 8 etapas e que a última não tem `Avançar`.
5. `/meus-dados`: validar limite visual e funcional de 500 caracteres.
6. `/meus-vinculos`: validar ausência de `Salvar textos` e salvamento ao avançar.
7. `/meus-vinculos`: validar títulos fora dos cards.
8. `/meus-vinculos`: validar grupos vazios sem botão inferior duplicado.
9. `/meus-vinculos`: validar `Irmã` para pessoa feminina.
10. Todas as páginas de onboarding: validar header sem ações à direita.

### Mapa familiar

1. Validar dropdown `Família de [Nome]`.
2. Validar contagem de `Cadastrados`.
3. Validar tour por `?tutorial=1`.
4. Validar layout compacto para árvore pequena.

### Fatos e arquivos

1. Salvar fato sem arquivo.
2. Salvar imagem histórica.
3. Salvar PDF histórico.
4. Confirmar exibição correta em `/revisao-dados`.
5. Confirmar integração à timeline do perfil.
