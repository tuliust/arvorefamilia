# QA manual — Árvore Família

> Última revisão: 2026-06-16
> Local canônico: `docs/QA_MANUAL.md`
> Projeto: `tuliust/arvorefamilia`
> Tipo: guia central de QA manual
> Status: complementado com checklist específico para onboarding de membro, Mini Bio/Curiosidades com IA, vínculos familiares, pessoa falecida, arquivos históricos e revisão final.

---

## 1. Objetivo

Este guia centraliza os procedimentos de QA manual do projeto **Árvore Família**.

Use este arquivo para validar:

- rotas oficiais e rotas removidas;
- guards e navegação;
- Árvore Familiar vertical;
- Mapa Genealógico horizontal;
- mobile e breakpoints;
- painel desktop;
- modal mobile de controles;
- paletas;
- cards, avatares e conectores;
- exportação;
- calendário familiar;
- perfil e retorno;
- fórum;
- notificações;
- admin;
- deploy e pós-deploy.

Este documento não substitui:

| Documento | Papel |
|---|---|
| `docs/REGRAS_DE_NAO_REGRESSAO.md` | Contratos técnicos e regras que não devem ser violadas. |
| `docs/PLANO_PROXIMOS_PASSOS.md` | Pendências, riscos e decisões futuras. |
| `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` | Contrato funcional das duas views da árvore. |
| `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Contrato do painel, filtros, conectores e destaques. |
| `docs/funcionalidades/EXPORTACAO_ARVORE.md` | Contrato técnico da exportação. |
| `docs/operacao/DEPLOYMENT.md` | Procedimento completo de deploy e operação. |

Regra de escopo:

```txt
REGRAS_DE_NAO_REGRESSAO.md diz o que não pode quebrar.
QA_MANUAL.md diz como validar manualmente.
PLANO_PROXIMOS_PASSOS.md registra o que ainda está aberto.
```

---

## 2. Quando usar

Use este guia:

- antes de concluir mudança visual;
- antes de publicar deploy;
- depois de alterar rotas, guards, árvore, painel, exportação ou calendário;
- depois de reorganizar documentação que afete contratos;
- antes de fechar pendências de QA em `PLANO_PROXIMOS_PASSOS.md`.

Mudanças somente documentais podem exigir apenas conferência documental e build, desde que não alterem contratos de produto.

---

## 3. Comandos mínimos

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

### Antes de commit

```bash
git status --short
git diff --stat
git diff --check
```

---

## 4. Breakpoints e ambientes mínimos

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

## 5. QA de documentação

Use quando a mudança alterar arquivos em `docs/`.

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

Busca útil:

```bash
rg "QA_MANUAL|REGRAS_DE_NAO_REGRESSAO|PLANO_PROXIMOS_PASSOS" docs
rg "/minha-arvore|/genealogia|/visao-completa" docs src tests
```

---

## 6. QA de rotas e guards

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
- [ ] erro de guard não expõe dados administrativos.

---

## 7. QA de `TreeViewMode`

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

## 8. QA da Árvore Familiar vertical

Rota:

```txt
/mapa-familiar
```

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
- [ ] filhos de relacionamento adicional são agrupados pelo outro pai/mãe quando houver relação explícita.
- [ ] pets aparecem com filtro próprio quando existentes.
- [ ] conectores não invadem cards.
- [ ] zoom aproxima e afasta.
- [ ] restaurar visualização não equivale a apenas reduzir zoom.
- [ ] painel colapsado não quebra bounds, conectores ou exportação.

### Mobile

Checklist:

- [ ] renderiza `MobileFamilyTreeView`.
- [ ] navegação interna usa Paterno/Central/Materno.
- [ ] não usa botões `Ger X`.
- [ ] cards preservam contraste.
- [ ] grupos e bordas seguem paleta ativa.
- [ ] conectores HTML/CSS respeitam hierarquia visual.
- [ ] modal de controles abre pelo botão esperado.
- [ ] body destrava ao fechar modal.
- [ ] não há scroll horizontal indevido.

---

## 9. QA do Mapa Genealógico horizontal

Rota:

```txt
/mapa-familiar-horizontal
```

Componentes esperados:

| Ambiente | Componente |
|---|---|
| Desktop/tablet | `DesktopFamilyHorizontalMapView` |
| Mobile | `MobileFamilyHorizontalMapView` |

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

- [ ] renderiza `MobileFamilyHorizontalMapView`.
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

## 10. QA de painel desktop

Checklist:

- [ ] Zoom + funciona.
- [ ] Zoom - funciona.
- [ ] Restaurar visualização funciona.
- [ ] Vertical navega para `/mapa-familiar`.
- [ ] Horizontal navega para `/mapa-familiar-horizontal`.
- [ ] `location.search` é preservado.
- [ ] Cores abre seleção de paleta.
- [ ] Exportar abre Área, Imagem, PDF e Imprimir.
- [ ] Destacar abre Linhas, Cards e Grupos.
- [ ] filtros de grupos ficam acessíveis sem aba.
- [ ] filtros de status ficam acessíveis sem aba.
- [ ] não existe barra `Filtros | Legendas | Ações`.
- [ ] painel não aparece na exportação.
- [ ] cards do painel seguem paleta ativa.
- [ ] estado inativo continua legível.

---

## 11. QA do modal mobile de controles

Checklist:

- [ ] modal abre em `/mapa-familiar`.
- [ ] modal abre em `/mapa-familiar-horizontal`.
- [ ] título é `Controles`.
- [ ] não há subtítulo.
- [ ] botão superior direito usa `X`.
- [ ] overlay fecha modal.
- [ ] `Escape` fecha quando aplicável.
- [ ] body trava com modal aberto.
- [ ] body destrava ao fechar.
- [ ] conteúdo interno tem rolagem própria.
- [ ] modal fica acima do header, bottom nav e botões.
- [ ] modal não entra na exportação.
- [ ] contém Vertical, Horizontal, Cores, Grupos, Destacar e Filtros.
- [ ] não contém Zoom +, Zoom -, Restaurar visualização ou Exportar.
- [ ] Grupos abre/fecha cards de grupos.
- [ ] grupos não aparecem por padrão.
- [ ] filtros permanecem visíveis com grupos fechados.
- [ ] filtros cabem em 4 colunas quando houver espaço.

---

## 12. QA de paletas

Paletas oficiais:

```txt
white
visual
orange
brown
```

Validar em desktop e mobile:

- [ ] Branca/`white`.
- [ ] Visual/Azul/`visual`.
- [ ] Laranja/`orange`.
- [ ] Marrom/`brown`.

Checklist por paleta:

- [ ] cards mudam corretamente.
- [ ] bordas mudam corretamente.
- [ ] grupos mudam corretamente.
- [ ] conectores mudam corretamente.
- [ ] labels e títulos preservam contraste.
- [ ] painel acompanha vocabulário visual.
- [ ] exportação preserva a paleta.
- [ ] paletas `white`, `orange` e `brown` não caem em fallback azul/teal.
- [ ] Visual/Azul preserva gradientes quando aplicável.

---

## 13. QA de cards e avatares

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
- [ ] SVGs internos não viram blocos escuros.
- [ ] foto externa com CORS inválido falha de modo controlado.

### Cards mobile de pessoas

Checklist:

- [ ] nome aparece em destaque.
- [ ] nascimento aparece apenas quando há ano/data real.
- [ ] falecimento aparece apenas quando há ano/data real.
- [ ] `Nascimento não informado` não aparece no resultado visual.
- [ ] `Falecimento não informado` não aparece no resultado visual.
- [ ] dívida `TREE-004` permanece aberta até remoção estrutural do fallback no componente.

---

## 14. QA de cônjuges, núcleos e conectores

### Cônjuges

Checklist:

- [ ] cônjuge da pessoa central aparece quando há relação.
- [ ] cônjuges de avós/bisavós/tataravós aparecem como ancestrais quando aplicável.
- [ ] filtro `Cônjuges` afeta grupos filtráveis implementados.
- [ ] `pais`/Geração 4 não é tratado como implementado até correção de `TREE-003`.
- [ ] contagem de cônjuges filtráveis não é inflada por cônjuges sempre visíveis.
- [ ] nenhum cônjuge é inferido apenas por proximidade visual.

### Núcleos conjugais adicionais

Checklist:

- [ ] pessoa central com mais de um relacionamento explícito não perde cônjuges adicionais.
- [ ] filhos são agrupados pelo outro pai/mãe quando relação existir.
- [ ] filhos sem outro pai/mãe identificado permanecem no grupo principal.
- [ ] segundo relacionamento não sobrepõe irmãos, filhos, netos, sobrinhos ou pets.
- [ ] ajuste visual não cria dados.

### Conectores

Checklist:

- [ ] conectores representam relações explícitas.
- [ ] conectores não invadem cards.
- [ ] conectores não são cortados no fim da superfície.
- [ ] conectores seguem paleta ativa.
- [ ] conectores aparecem na exportação.
- [ ] conectores não usam seletor global que afete ícones.

---

## 15. QA de exportação

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
- [ ] captura grande demais mostra erro claro.
- [ ] título correto é adicionado.
- [ ] painel não aparece.
- [ ] header não aparece.
- [ ] bottom nav não aparece.
- [ ] modal mobile não aparece.
- [ ] debug não aparece.
- [ ] overlay de seleção não aparece.
- [ ] paleta ativa é preservada.
- [ ] conectores são preservados.
- [ ] ícones SVG são preservados.
- [ ] pessoas com foto, sem foto e pets exportam corretamente.

---

## 16. QA do calendário familiar

Rota:

```txt
/calendario-familiar
```

Checklist mobile:

- [ ] cinco botões de categorias aparecem em uma linha quando possível.
- [ ] bolinha colorida aparece acima do título.
- [ ] título permanece em uma linha.
- [ ] ellipsis funciona em telas extremas.
- [ ] não há overflow horizontal global.
- [ ] filtros alteram eventos visíveis.
- [ ] estado visual reflete categoria ativa/inativa.
- [ ] `aria-pressed` é preservado.
- [ ] Google Agenda não quebra quando OAuth não está configurado.
- [ ] erro de OAuth é controlado.

Categorias esperadas:

```txt
Aniversário
Casamento
Falecimento
Outros
Reunião
```

---

## 17. QA de perfil, retorno e pessoas

Checklist:

- [ ] perfil aberto a partir de `/mapa-familiar` retorna para `/mapa-familiar`.
- [ ] perfil aberto a partir de `/mapa-familiar-horizontal` retorna para `/mapa-familiar-horizontal`.
- [ ] retorno com `?pessoa=...` é preservado quando codificado em `voltar`.
- [ ] URL externa em `voltar` é rejeitada.
- [ ] retorno inválido cai em `/mapa-familiar`.
- [ ] usuário comum não edita pessoa sem permissão.
- [ ] pessoa vinculada edita apenas o que for permitido.
- [ ] admin mantém acesso esperado.
- [ ] sugestões de alteração respeitam permissões.
- [ ] arquivos históricos não quebram perfil.

---

## 18. QA de fórum

Rotas principais:

```txt
/forum
/forum/novo
/forum/topico/:id
/forum/topico/:id/editar
```

Checklist:

- [ ] fórum lista tópicos.
- [ ] usuário autenticado cria tópico.
- [ ] usuário autorizado edita tópico.
- [ ] usuário sem permissão não edita tópico indevido.
- [ ] respostas funcionam.
- [ ] favoritos funcionam.
- [ ] reações funcionam quando aplicável.
- [ ] notificações associadas não quebram.
- [ ] rota inexistente ou tópico inválido tem erro controlado.

---

## 19. QA de notificações

Rotas:

```txt
/notificacoes
/ajustar-notificacoes
/admin/notificacoes
```

Checklist:

- [ ] central lista notificações.
- [ ] marcação de leitura funciona.
- [ ] preferências carregam.
- [ ] preferências salvam.
- [ ] admin acessa área administrativa de notificações.
- [ ] usuário comum não acessa admin.
- [ ] Edge Function ausente/falha externa não quebra UI de forma não controlada.
- [ ] e-mails/secrets não aparecem no frontend.

---

## 20. QA de admin

Checklist:

- [ ] usuário admin acessa `/admin`.
- [ ] usuário comum é bloqueado.
- [ ] dashboard carrega.
- [ ] pessoas listam.
- [ ] pessoa abre em detalhe.
- [ ] criação/edição respeita validações.
- [ ] relacionamentos funcionam.
- [ ] importação não é executada sem confirmação.
- [ ] ações destrutivas exigem confirmação.
- [ ] RPCs admin falham de forma segura quando ausentes.
- [ ] nenhuma tela admin depende apenas de botão escondido no frontend.

---


## 20.1 QA do onboarding do membro

Rotas:

```txt
/meus-dados
/meus-vinculos
/arquivos-historicos
/preferencias
/revisao-dados
```

### Fluxo para pessoa viva

Checklist:

- [ ] `/meus-dados` exibe **Cidade de residência**.
- [ ] `/meus-dados` exibe container **Contato, endereço e redes sociais**.
- [ ] campos de falecimento não aparecem para pessoa viva.
- [ ] `/meus-vinculos` aparece como Etapa 2.
- [ ] `/arquivos-historicos` aparece como Etapa 3.
- [ ] **Salvar e Continuar** em arquivos históricos navega para `/preferencias`.
- [ ] `/preferencias` aparece como Etapa 4.
- [ ] `/preferencias` exibe apenas **Continuar para a revisão** como ação principal.
- [ ] `/revisao-dados` aparece como Etapa 5.
- [ ] revisão final exibe boxes de Contatos e Notificações/permissões quando houver dados aplicáveis.

### Fluxo para pessoa falecida

Checklist:

- [ ] `/meus-dados` não exibe **Cidade de residência**.
- [ ] `/meus-dados` exibe **Dia ou Ano de Falecimento**.
- [ ] `/meus-dados` exibe **Local de falecimento**.
- [ ] `/meus-dados` oculta container **Contato, endereço e redes sociais**.
- [ ] notificações são desativadas automaticamente.
- [ ] mensagens/WhatsApp são desativados automaticamente.
- [ ] permissões de visualização ficam ativadas por padrão.
- [ ] stepper não exibe Preferências.
- [ ] **Salvar e Continuar** em arquivos históricos navega direto para `/revisao-dados`.
- [ ] acesso manual a `/preferencias` redireciona para `/revisao-dados`.
- [ ] revisão final não exibe box **Notificações e permissões**.
- [ ] revisão final não exibe box **Contatos** quando o produto assim exigir para falecidos.

### Etapa 1 — Meus dados

Checklist visual:

- [ ] toggle **Estrangeiro** fica alinhado ao input **Local de nascimento**.
- [ ] toggle **Exterior** fica alinhado ao input **Cidade de residência**.
- [ ] info icons aparecem somente onde definidos.
- [ ] troca entre pessoa viva/falecida atualiza campos sem manter campos incompatíveis visíveis.
- [ ] validação não exige contato/redes para pessoa falecida.
- [ ] botão de IA aparece na seção **Sobre Mim**.
- [ ] gerar Mini Bio e Curiosidades em modo padrão.
- [ ] confirmar que campos gerados têm até 300 caracteres.
- [ ] confirmar que modo padrão gera texto em primeira pessoa.
- [ ] selecionar tom **Nostálgico** e confirmar modo memorial.
- [ ] confirmar que modo memorial gera em terceira pessoa e no passado.
- [ ] etapas 2 a 8 do modal usam cards compactos sem ícones internos.
- [ ] modal fecha após sucesso e mantém campos editáveis.
- [ ] erro da IA não altera campos existentes.

### Etapa 2 — Vínculos

Checklist de layout:

- [ ] botão **Voltar para meus dados** não aparece.
- [ ] card superior exibe `Familiares de [Primeiro Nome]`.
- [ ] rótulo **Pessoa em revisão** não aparece.
- [ ] frase `Você está revisando os vínculos familiares de:` não aparece.
- [ ] nascimento/local não aparecem no card superior.
- [ ] painel lateral **Resumo da revisão** não aparece.
- [ ] área principal ocupa a largura total disponível.
- [ ] botão final fica no rodapé da revisão.

Checklist de cards-resumo:

- [ ] cards **Pais**, **Filhos**, **Cônjuges** e **Irmãos** funcionam como âncoras.
- [ ] pluralização mostra `Nenhum vínculo`, `1 vínculo` e `N vínculos`.
- [ ] rolagem por âncora respeita header/stepper e não corta título da seção.

Checklist de familiares:

- [ ] cards não exibem chips de nascimento/local.
- [ ] badge `Pré-cadastrado` aparece para pessoa sem usuário vinculado.
- [ ] badge `Ativo` aparece para pessoa com usuário/auth user vinculado.
- [ ] vínculo novo ou alterado exibe `Em análise`.
- [ ] remoção solicitada exibe `Remoção em análise` e mantém card visível.
- [ ] solicitação de controle exibe `Controle em análise`.
- [ ] remoção usa botão compacto apenas com ícone no topo do card.
- [ ] ação de desfazer remoção funciona quando disponível.
- [ ] `Solicitar controle do perfil` abre modal de justificativa.
- [ ] justificativa vazia/curta não envia solicitação.
- [ ] solicitação duplicada para o mesmo perfil não é criada.

Checklist de busca e criação:

- [ ] ao adicionar familiar, usuário consegue buscar pessoa já cadastrada.
- [ ] resultados da busca são legíveis e ajudam a diferenciar homônimos.
- [ ] a própria pessoa em revisão não pode ser selecionada.
- [ ] pessoa já vinculada no mesmo grupo não pode ser duplicada.
- [ ] usuário ainda consegue criar nova pessoa quando a busca não encontra a correta.
- [ ] pessoa existente selecionada entra como vínculo `Em análise`.

Checklist de filhos:

- [ ] filho masculino com gênero disponível aparece como `Filho`.
- [ ] filha feminina com gênero disponível aparece como `Filha`.
- [ ] sem gênero disponível, fallback é `Filho(a)`.
- [ ] gênero não é inferido pelo nome.
- [ ] dropdown `Outro pai/mãe` pré-seleciona responsável conhecido quando existe nos relacionamentos.
- [ ] não há hard-code de nomes específicos para outro pai/mãe.

### Etapa 3 — Arquivos históricos

Checklist:

- [ ] botão **Voltar para vínculos** não aparece.
- [ ] botão **Salvar arquivos** não aparece.
- [ ] botão principal exibe **Salvar e Continuar**.
- [ ] clicar em **Certidão de Nascimento** preenche título/descrição da área de upload.
- [ ] clicar em **Alistamento Militar** atualiza título/descrição para esse card.
- [ ] arquivo adicionado aparece como thumbnail + título + dados resumidos.
- [ ] campos editáveis não ficam abertos por padrão após adicionar arquivo.
- [ ] botões **Editar** e **Remover** aparecem no item adicionado.
- [ ] rascunho persiste ao minimizar, trocar de aba ou recarregar antes de salvar.
- [ ] após salvar, rascunho local é limpo ou deixa de sobrescrever dados persistidos.

### Etapa 4 — Preferências

Checklist:

- [ ] box **Receber notificações por email** não aparece.
- [ ] botão **Salvar permissões** não aparece.
- [ ] botão **Voltar para arquivos históricos** não aparece.
- [ ] ação principal é **Continuar para a revisão**.
- [ ] pessoa falecida não permanece nesta etapa.

### Etapa 5 — Revisão final

Checklist:

- [ ] topo exibe avatar/iniciais, nome, badge de status e ações.
- [ ] mini bio não aparece ao lado do nome no topo.
- [ ] **Finalizar e acessar árvore** aparece no topo, ao lado de **Editar perfil**.
- [ ] rodapé antigo com **Voltar para preferências** não aparece.
- [ ] rodapé antigo com **Finalizar e acessar a árvore** não aparece.
- [ ] boxes têm botões compactos com ícone de lápis quando editáveis.
- [ ] edição inline salva dados pessoais.
- [ ] edição inline salva Mini Bio/Curiosidades.
- [ ] edição inline salva contatos/permissões quando aplicável.
- [ ] box **Informações pessoais** não exibe **Pessoa falecida**.
- [ ] box **Informações pessoais** não exibe **Nascimento no exterior**.
- [ ] box **Informações pessoais** não exibe **Falecimento no exterior**.
- [ ] badge superior usa **Falecido** para homem falecido e **Falecida** para mulher falecida.
- [ ] área Familiares usa **Vivo/Viva/Falecido/Falecida** conforme dados.
- [ ] card pendente, como Otávio no cenário de QA, exibe **Em análise**.

---

## 21. QA operacional pós-deploy

Usar junto com `docs/operacao/DEPLOYMENT.md`.

Checklist:

- [ ] domínio final abre.
- [ ] `/entrar` abre sem login.
- [ ] `/privacidade` abre sem login.
- [ ] `/termos` abre sem login.
- [ ] login funciona.
- [ ] `/mapa-familiar` abre.
- [ ] `/mapa-familiar-horizontal` abre.
- [ ] `/forum` abre.
- [ ] `/calendario-familiar` abre.
- [ ] `/admin` bloqueia usuário comum.
- [ ] rotas antigas não voltam como views ativas.
- [ ] console não mostra erro de chunk dinâmico.
- [ ] janela anônima usa chunks atuais.
- [ ] Safari/iOS não fica preso em HTML antigo.
- [ ] `/api/*`, quando existir, não cai no fallback SPA.
- [ ] Edge Functions necessárias estão publicadas.
- [ ] Google OAuth funciona para test user quando em modo Testing.

---

## 22. Registro de evidência

Para fechar QA visual ou funcional, registrar no PR, issue ou comentário interno:

```txt
Data:
Commit:
Ambiente:
Navegador:
Breakpoints testados:
Rotas testadas:
Resultado:
Pendências abertas:
Screenshots, se houver:
```

Se um teste manual não foi executado, registrar explicitamente como não executado. Não marcar pendência como fechada sem validação real.

---

## 23. Checklist final antes de fechar frente

- [ ] `git diff --check` sem saída.
- [ ] `npm run build` passou.
- [ ] `npm test` passou ou foi justificado como não executado.
- [ ] `npm run test:e2e` passou ou foi justificado como não executado.
- [ ] QA manual aplicável foi executado.
- [ ] documentação afetada foi atualizada.
- [ ] pendências novas foram registradas em `PLANO_PROXIMOS_PASSOS.md`.
- [ ] nenhuma rota antiga voltou como view ativa.
- [ ] nenhuma mudança visual criou migration.
- [ ] nenhuma secret foi exposta.

<!-- ajuste-irmaos-conjuges-mapa-familiar-2026-06 -->

## Mapa familiar ? irm?os e c?njuges

Na p?gina `/mapa-familiar`:

- O grupo `Irm?os` exibe at? 4 cards antes de apresentar controle de expandir/recolher.
- Em grade dupla, quando houver quantidade ?mpar de cards vis?veis, o ?ltimo card isolado fica centralizado na segunda linha.
- C?njuges de irm?os s?o exibidos no grupo `Irm?os` quando o filtro `C?njuges` est? ativo e existe relacionamento expl?cito `tipo_relacionamento === 'conjuge'`.
- Esse comportamento n?o cria nem infere dados; depende exclusivamente dos relacionamentos persistidos.
- A regra acima se aplica ? p?gina `/mapa-familiar`. N?o assumir o mesmo comportamento para `/mapa-familiar-horizontal` sem valida??o espec?fica.
<!-- ajuste-mapa-horizontal-conjuges-filhos-2026-06 -->

## Mapa familiar horizontal ? c?njuges e filhos de casais vis?veis

Na rota `/mapa-familiar-horizontal`:

- O filtro `C?njuges` tamb?m considera c?njuges de pessoas do grupo `Irm?os`/n?cleo.
- C?njuges exibidos no mesmo grupo geracional devem ficar adjacentes e conectados verticalmente.
- Layana deve aparecer abaixo de Tassius Marcius quando `C?njuges` estiver ativo.
- Suze Souza, segundo relacionamento de M?rcio Ailton, deve aparecer apenas quando `C?njuges` estiver ativo e posicionada acima de M?rcio Ailton.
- Quando ambos os pais de um casal vis?vel estiverem exibidos, filhos comuns da 6? gera??o devem aparecer na coluna da direita e receber conex?o a partir da uni?o do casal.
- Casos cobertos: Heitor, filho de Tassius e Layana; In?cio Leal, filho de Camilla e Gilvan; Lorendo, filho de M?rcio Ailton e Suze Souza.
- A regra n?o cria nem infere v?nculos inexistentes; depende de relacionamentos expl?citos de `conjuge` e filia??o j? persistidos.

<!-- QA-CONSOLIDADO-2026-06-18 -->
## QA consolidado para ajustes recentes

### Breakpoints obrigatÃ³rios

Validar rotas principais em:

- 320px
- 375px
- 390px
- 430px
- desktop

### Onboarding â€” pessoa viva

Rotas:

- `/meus-dados`
- `/meus-vinculos`
- `/arquivos-historicos`
- `/preferencias`
- `/revisao-dados`

Checklist:

- as 5 etapas aparecem;
- cidade de residÃªncia aparece;
- contato/endereÃ§o/redes aparecem;
- preferÃªncias aparecem;
- revisÃ£o final exibe contatos e notificaÃ§Ãµes;
- tooltips funcionam por toque no mobile;
- inputs nÃ£o disparam auto-zoom;
- botÃµes nÃ£o ficam cobertos pelo menu inferior.

### Onboarding â€” pessoa falecida

Checklist:

- cidade de residÃªncia Ã© ocultada no onboarding;
- campos de falecimento aparecem;
- contato/endereÃ§o/redes sÃ£o ocultados no fluxo do membro;
- `/preferencias` nÃ£o aparece no stepper;
- acesso direto a `/preferencias` redireciona para revisÃ£o;
- revisÃ£o final nÃ£o mostra contatos/notificaÃ§Ãµes;
- badge respeita gÃªnero quando houver dado suficiente.

### Arquivos histÃ³ricos

Checklist:

- categoria preenche tÃ­tulo e descriÃ§Ã£o;
- trocar categoria atualiza o preenchimento;
- rascunho local preserva dados antes de salvar;
- arquivo adicionado vira card com thumbnail/resumo;
- participantes podem ser selecionados/removidos visualmente;
- ausÃªncia de schema para participantes nÃ£o quebra o fluxo.

### FormulÃ¡rios de pessoa

Rotas:

- `/minha-arvore/editar`
- `/admin/pessoas/:id/editar`
- `/admin/pessoas/nova`

Checklist:

- labels alinhados ao onboarding;
- formulÃ¡rio nÃ£o vira onboarding;
- `MemberOnboardingSteps` nÃ£o aparece fora do fluxo;
- campos de admin preservam comportamento administrativo vigente;
- redes sociais incompletas nÃ£o bloqueiam salvamento indevidamente.

### Rotas adicionais a verificar quando houver commit confirmado

- `/admin`
- `/mapa-familiar`
- `/mapa-familiar-horizontal`
- `/meus-favoritos`
- `/notificacoes`
- `/calendario-familiar`
- `/pessoa/:id`
