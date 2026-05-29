> Status atual: fase 7.10 concluida no escopo MVP. Este documento fica preservado como referencia historica, checklist de regressao e guia para ajustes futuros de responsividade.

# Responsividade mobile/tablet  Arvore Familia

## Objetivo

Este documento orienta a fase **7.10 Responsividade mobile/tablet**, ultima etapa do MVP antes do lancamento.

Ele deve ser usado para:

- organizar a execucao por blocos;
- evitar ajustes dispersos em muitas telas ao mesmo tempo;
- listar arquivos provaveis por frente;
- padronizar testes em larguras obrigatorias;
- definir criterios minimos de aceite;
- registrar comandos uteis de validacao;
- separar ajustes de MVP de melhorias pos-MVP.

A responsividade deve comecar somente depois de:

- funcionalidades MVP estabilizadas;
- QA funcional manual aprovado;
- `npm run build` aprovado;
- `npm test` aprovado;
- `npm run test:e2e` aprovado;
- `git diff --check` sem erros;
- `supabase migration list` sem divergencias local/remoto.

---

## 1. Estado de entrada da fase

Antes de iniciar os ajustes responsivos, o projeto deve estar neste estado:

| Validacao | Status esperado |
|---|---|
| Build de producao | aprovado |
| Testes unitarios | aprovados |
| Testes e2e | aprovados |
| `git diff --check` | sem erros |
| Migrations Supabase | local/remoto alinhados |
| QA manual funcional | aprovado |
| Escopo MVP | congelado |
| Pos-MVP | documentado |

Se algum item acima falhar, corrigir antes de iniciar a responsividade.

---

## 2. Regra principal

A responsividade e a **ultima etapa antes do lancamento**.

Durante esta fase:

- nao expandir funcionalidades;
- nao criar novas migrations, salvo correcao critica;
- nao alterar regras de negocio sem necessidade;
- nao mexer em Edge Functions;
- nao alterar RLS;
- nao implementar backlog pos-MVP;
- nao iniciar redesign amplo;
- priorizar usabilidade, legibilidade, toque e ausencia de quebras visuais.

O foco e deixar o produto **operavel, legivel e confiavel** em mobile, tablet e desktop.

---

## 3. Branch recomendada

Criar uma branch exclusiva:

```bash
git checkout main
git pull origin main
git checkout -b feat/responsividade-mobile-tablet
```

Confirmar:

```bash
git branch --show-current
```

Esperado:

```txt
feat/responsividade-mobile-tablet
```

---

## 4. Larguras obrigatorias de teste

Testar no DevTools ou em dispositivos reais:

| Largura | Uso esperado |
|---:|---|
| 320px | menor mobile suportado |
| 375px | iPhone padrao/pequeno |
| 390px | mobile intermediario |
| 430px | mobile grande |
| 768px | tablet vertical |
| desktop | referencia final |

Sempre validar tambem altura reduzida quando houver modais, overlays ou formularios longos.

---

## 5. Criterios globais de aceite

Uma tela so deve ser considerada aprovada quando:

- nao houver overflow horizontal indevido;
- o header estiver utilizavel;
- menus e botoes forem acessiveis por toque;
- botoes nao ficarem fora da tela;
- cards nao estourarem o container;
- tabelas tiverem scroll controlado;
- modais couberem na viewport ou tenham scroll interno;
- formularios longos forem usaveis;
- textos principais permanecerem legiveis;
- CTAs principais continuarem visiveis;
- estados vazios continuarem compreensiveis;
- loading/error states nao quebrarem layout;
- acoes destrutivas permanecerem protegidas;
- a arvore continuar utilizavel com pan/zoom;
- build continuar passando apos os ajustes.

---

## 6. Ordem recomendada de trabalho

Executar em blocos, com commit ao final de cada bloco validado:

1. base global;
2. arvore e ReactFlow;
3. perfil da pessoa;
4. area do usuario;
5. forum/favoritos/notificacoes;
6. admin;
7. QA final de lancamento.

Nao avancar para o proximo bloco se o anterior introduzir quebra visual evidente ou build quebrado.

---

## 7. Diagnostico inicial recomendado

Antes de alterar codigo, fazer uma leitura visual rapida em 320px, 390px e 768px para identificar os pontos mais criticos.

### Itens com maior risco de quebra

| Area | Risco provavel | Acao esperada |
|---|---|---|
| Arvore/ReactFlow | controles, overlays, pan/zoom e largura do canvas | revisar wrappers, z-index, botoes flutuantes e interacao touch |
| Admin Pessoa Form | formulario longo, muitos blocos e botoes internos | garantir grids responsivos, scroll natural e botoes acessiveis |
| Tabelas admin | overflow horizontal | adicionar wrappers `overflow-x-auto` |
| Modais | altura maior que viewport | aplicar `max-h-[90vh]` e `overflow-y-auto` |
| Favoritos/forum/notificacoes | filtros e cards em linha | empilhar em mobile e permitir quebra |
| Timeline/perfil | textos longos e cards | usar `min-w-0`, `break-words` e grids responsivos |

### Sinais de problema

- barra horizontal no navegador;
- botao fora da tela;
- card cortado;
- modal sem botao de fechar visivel;
- tabela empurrando todo o layout;
- ReactFlow impedindo rolagem da pagina;
- legenda cobrindo controles essenciais;
- menu de pessoa abrindo fora da viewport;
- formulario com botao de salvar inacessivel.

---

## 8. Bloco 1  Base global

### Objetivo

Criar uma base responsiva consistente para evitar correcoes repetidas em cada tela.

### Itens a verificar

- header;
- menu principal;
- menu do usuario;
- containers;
- grids;
- cards;
- botoes;
- inputs;
- selects;
- textareas;
- badges;
- tabelas;
- modais;
- dialogs;
- toasts;
- espacamentos;
- tipografia;
- overflow horizontal.

### Arquivos provaveis

```txt
src/app/pages/Home.tsx
src/app/components
src/app/components/ui
src/index.css
src/app/index.css
src/app/routes.tsx
```

### Correcoes frequentes

#### Containers

Evitar larguras fixas sem limite responsivo:

```tsx
className="w-full max-w-7xl px-4 sm:px-6 lg:px-8"
```

#### Grids

Preferir grids que empilham no mobile:

```tsx
className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
```

#### Botoes em linha

Permitir quebra no mobile:

```tsx
className="flex flex-col gap-2 sm:flex-row sm:items-center"
```

#### Tabelas

Usar wrapper com scroll horizontal controlado:

```tsx
<div className="w-full overflow-x-auto">
  <table className="min-w-full">
    ...
  </table>
</div>
```

#### Modais

Garantir altura maxima e rolagem:

```tsx
className="max-h-[90vh] overflow-y-auto"
```

### Validacao do bloco

```bash
npm run build
git diff --check
git status
```

### Commit sugerido

```bash
git add .
git commit -m "style: ajustar base responsiva global"
```

---

## 9. Bloco 2  Arvore e ReactFlow

### Objetivo

Garantir que a arvore funcione em mobile/tablet sem perder uso basico.

### Rotas e areas

- `/`
- `/minha-arvore`
- Genealogia;
- Visao Completa;
- Minha Arvore;
- painel de informacoes;
- filtros;
- controles de zoom;
- legenda;
- menu de pessoa;
- modal conjugal;
- selecao de area;
- exportacao PNG/PDF/impressao.

### Arquivos provaveis

```txt
src/app/pages/Home.tsx
src/app/pages/MinhaArvore.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/layouts
```

### Testes obrigatorios

- arvore carrega em 320px;
- arvore carrega em 375px;
- arvore carrega em 390px;
- arvore carrega em 430px;
- arvore carrega em 768px;
- pan por toque funciona;
- zoom nao impede uso;
- controles nao cobrem conteudo critico;
- botao **Legenda** e acessivel;
- painel da legenda tem scroll se necessario;
- menu da pessoa abre e fecha;
- modal conjugal cabe na tela;
- selecao de area abre e cancela;
- exportacao nao quebra a tela;
- filtros nao deixam aneis/conectores soltos.

### Criterios especificos

- a arvore nao precisa mostrar tudo confortavelmente em 320px, mas precisa ser navegavel;
- nao deve haver scroll horizontal da pagina causado pela arvore;
- o ReactFlow pode ocupar viewport ampla, desde que contido em seu wrapper;
- overlays devem respeitar a viewport;
- botoes flutuantes devem ter area minima de toque;
- legenda e selecao de area nao devem aparecer em exportacoes.

### Validacao do bloco

```bash
npm run build
git diff --check
git status
```

### Commit sugerido

```bash
git add .
git commit -m "style: ajustar arvore para mobile e tablet"
```

---

## 10. Bloco 3  Perfil da pessoa

### Objetivo

Garantir leitura, navegacao e acoes principais no perfil individual.

### Rotas

- `/pessoa/:id`
- `/pessoas/:id`

### Componentes a validar

- cabecalho do perfil;
- foto/avatar;
- dados pessoais;
- botoes de acao;
- WhatsApp;
- favorito;
- grau de parentesco;
- relacoes familiares;
- timeline;
- eventos pessoais;
- arquivos historicos;
- topicos/discussoes relacionadas;
- estados vazios.

### Arquivos provaveis

```txt
src/app/pages/PersonProfile.tsx
src/app/components/person/PersonDataView.tsx
src/app/components/person/PersonRelationshipsView.tsx
src/app/components/person/RelationshipFinder.tsx
src/app/components/person/PersonEventsList.tsx
src/app/components/Timeline/PersonTimeline.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/components/favorites/FavoriteButton.tsx
```

### Testes obrigatorios

- perfil com muitos dados;
- perfil com poucos dados;
- perfil com pessoa falecida;
- perfil com arquivos historicos;
- perfil com timeline longa;
- perfil com WhatsApp habilitado;
- perfil sem permissao de telefone;
- perfil com favorito ativo;
- perfil sem relacao encontrada;
- botoes empilham corretamente no mobile.

### Criterios especificos

- cards devem empilhar;
- timeline nao deve estourar largura;
- textos longos devem quebrar linha;
- arquivos devem ter acoes acessiveis por toque;
- botoes principais nao devem ficar escondidos;
- dados sensiveis continuam respeitando permissoes.

### Validacao do bloco

```bash
npm run build
git diff --check
git status
```

### Commit sugerido

```bash
git add .
git commit -m "style: ajustar perfil de pessoa para mobile"
```

---

## 11. Bloco 4  Area do usuario

### Objetivo

Garantir que usuarios comuns consigam revisar dados, vinculos, notificacoes e favoritos no mobile.

### Rotas

- `/meus-dados`
- `/meus-vinculos`
- `/notificacoes`
- `/meus-favoritos`
- `/vincular-perfil`

### Arquivos provaveis

```txt
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/VincularPerfil.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/components/favorites/FavoriteButton.tsx
```

### Testes obrigatorios

#### Meus Dados

- formulario longo;
- dados pessoais;
- privacidade;
- redes sociais;
- eventos pessoais;
- arquivos historicos;
- botoes salvar/cancelar.

#### Meus Vinculos

- lista de vinculos;
- solicitacao de vinculo;
- status de solicitacao;
- acoes em mobile.

#### Notificacoes

- lista vazia;
- lista com notificacoes;
- marcar uma como lida;
- marcar todas como lidas;
- remover notificacao;
- preferencias.

#### Meus Favoritos

- busca;
- filtros;
- cards;
- link interno;
- remocao;
- estado sem favoritos.

#### Vincular Perfil

- busca de pessoa;
- resultados;
- solicitacao;
- mensagens de erro/sucesso.

### Criterios especificos

- inputs devem ocupar largura total no mobile;
- acoes secundarias podem ir para baixo;
- listas devem ter espacamento de toque;
- filtros nao devem gerar overflow;
- tabelas, se existirem, devem ter scroll controlado.

### Validacao do bloco

```bash
npm run build
git diff --check
git status
```

### Commit sugerido

```bash
git add .
git commit -m "style: ajustar area do usuario para mobile"
```

---

## 12. Bloco 5  Forum, favoritos e notificacoes

### Objetivo

Garantir que areas de interacao e leitura recorrente funcionem em telas pequenas.

### Rotas

- `/forum`
- `/forum/novo`
- `/forum/topico/:id`
- `/forum/topico/:id/editar`
- `/meus-favoritos`
- `/notificacoes`

### Arquivos provaveis

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/components/forum
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
```

### Testes obrigatorios

#### Forum

- lista de topicos;
- filtros/categorias;
- novo topico;
- edicao;
- tela de topico;
- respostas;
- comentarios;
- reacoes, se exibidas;
- denuncia/moderacao, se exibida.

#### Favoritos

- listagem;
- filtros;
- busca;
- remocao;
- link indisponivel.

#### Notificacoes

- preferencias;
- marcar/remover;
- lista com textos longos;
- estado vazio.

### Criterios especificos

- cards de topico devem empilhar;
- filtros devem quebrar linha;
- editores de texto devem caber na tela;
- acoes em topicos devem ser tocaveis;
- texto longo nao deve estourar o card.

### Validacao do bloco

```bash
npm run build
git diff --check
git status
```

### Commit sugerido

```bash
git add .
git commit -m "style: ajustar forum favoritos e notificacoes para mobile"
```

---

## 13. Bloco 6  Admin

### Objetivo

Garantir que o admin continue operavel em mobile/tablet.

O admin nao precisa ter a mesma eficiencia do desktop em telas pequenas, mas nao pode quebrar layout nem impedir acoes essenciais.

### Rotas prioritarias

- `/admin`
- `/admin/pessoas`
- `/admin/pessoas/nova`
- `/admin/pessoas/:id/editar`
- `/admin/relacionamentos`
- `/admin/solicitacoes-vinculos`
- `/admin/integridade`
- `/admin/atividades`
- `/admin/notificacoes`

### Arquivos provaveis

```txt
src/app/pages/admin/AdminDashboard.tsx
src/app/pages/admin/AdminPessoas.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/admin/AdminRelacionamentos.tsx
src/app/pages/admin/AdminRelacionamentoForm.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/pages/admin/AdminIntegridade.tsx
src/app/pages/admin/AdminAtividades.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/components/RelacionamentoManager.tsx
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/ArquivosHistoricos.tsx
```

### Testes obrigatorios

#### Dashboard

- cards;
- atalhos;
- navegacao.

#### Admin Pessoas

- busca;
- filtros;
- tabela/lista;
- acoes de editar/remover.

#### Admin Pessoa Form

- formulario longo;
- blocos reutilizaveis;
- dados basicos;
- datas/locais;
- bio;
- contato;
- privacidade;
- redes sociais;
- eventos;
- arquivos historicos;
- relacionamentos;
- dados conjugais;
- botoes de salvar/cancelar.

#### Solicitacoes

- lista;
- aprovar;
- rejeitar;
- estados vazios.

#### Integridade

- cards;
- alertas;
- tabelas;
- scroll horizontal controlado.

#### Notificacoes admin

- teste interno;
- teste de e-mail;
- rotina manual;
- logs, se exibidos.

### Criterios especificos

- formularios longos devem ter rolagem natural;
- botoes principais devem aparecer ao final e nao sobrepor conteudo;
- tabelas largas devem ficar dentro de `overflow-x-auto`;
- acoes destrutivas continuam com confirmacao;
- admin continua protegido por `ProtectedRoute`;
- nenhum ajuste visual deve liberar acao indevida para usuario comum.

### Validacao do bloco

```bash
npm run build
git diff --check
git status
```

### Commit sugerido

```bash
git add .
git commit -m "style: ajustar admin para mobile"
```

---

## 14. Bloco 7  QA final de lancamento

### Objetivo

Confirmar que a fase de responsividade nao quebrou funcionalidades ja aprovadas.

### Comandos obrigatorios

```bash
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
git status
```

### QA visual final

Validar as larguras:

```txt
320px
375px
390px
430px
768px
desktop
```

### Checklist geral

```md
- [ ] Home aprovada, incluindo botao Acoes com texto no desktop e icone apenas no mobile.
- [ ] Minha Arvore aprovada.
- [ ] Genealogia aprovada.
- [ ] Visao Completa aprovada.
- [ ] Perfil da pessoa aprovado.
- [ ] Meus Dados aprovado.
- [ ] Meus Vinculos aprovado.
- [ ] Notificacoes aprovado.
- [ ] Meus Favoritos aprovado.
- [ ] Forum aprovado.
- [ ] Admin Dashboard aprovado.
- [ ] Admin Pessoas aprovado.
- [ ] Admin Pessoa Form aprovado.
- [ ] Admin Solicitacoes aprovado.
- [ ] Admin Integridade aprovado.
- [ ] Admin Notificacoes aprovado.
- [ ] Modais aprovados.
- [ ] Tabelas aprovadas.
- [ ] Formularios longos aprovados.
- [ ] Arvore touch aprovada.
- [ ] Sem overflow horizontal indevido.
- [ ] Build aprovado.
- [ ] Testes unitarios aprovados.
- [ ] Testes e2e aprovados.
- [ ] Migrations alinhadas.
```

Pontos responsivos recentes:

- botao **Acoes** da Home usa `Printer`, texto no desktop e icone apenas no mobile;
- o botao **Acoes** continua abrindo o painel interno `activeSidebarPanel = 'info'`;
- cards de **Escopo da visualizacao** em `/minha-arvore` exibem avatar circular com foto ou iniciais;
- fluxo de arquivos historicos mantem thumbnail/card PDF e mensagem verde apos upload, sem exibir o input nativo ate o usuario reabrir o formulario.

### Commit de documentacao final

Depois de atualizar `PLANO_PROXIMOS_PASSOS.md` e `GUIA_IMPLEMENTACOES.md` com responsividade aprovada:

```bash
git add docs/PLANO_PROXIMOS_PASSOS.md docs/GUIA_IMPLEMENTACOES.md
git commit -m "docs: registrar responsividade MVP aprovada"
```

---

## 15. Comandos uteis durante a fase

### Servidor local

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testes unitarios

```bash
npm test
```

### Testes e2e

```bash
npm run test:e2e
```

### Checar whitespace

```bash
git diff --check
```

### Ver status

```bash
git status
```

### Ver diff resumido

```bash
git diff --stat
```

### Ver arquivos alterados

```bash
git diff --name-only
```

### Ver migrations

```bash
supabase migration list
```

### Commit por bloco

```bash
git add .
git commit -m "style: ajustar <bloco> para mobile"
```

---

## 16. Boas praticas de implementacao

### Preferir ajustes locais antes de refatoracoes amplas

Corrigir o layout onde o problema ocorre, salvo quando o mesmo padrao quebrar varias telas.

### Evitar alteracao de logica

Responsividade nao deve mudar:

- permissoes;
- RLS;
- services;
- mutations;
- Edge Functions;
- migrations;
- regras de privacidade;
- regras de relacionamento.

### Usar classes responsivas progressivas

```tsx
className="flex flex-col gap-3 sm:flex-row sm:items-center"
```

```tsx
className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
```

```tsx
className="px-4 py-4 sm:px-6 lg:px-8"
```

### Controlar largura de conteudo

```tsx
className="w-full min-w-0"
```

`min-w-0` e importante em flex/grid para evitar estouro com textos longos.

### Quebrar textos longos

```tsx
className="break-words"
```

ou:

```tsx
className="overflow-hidden text-ellipsis"
```

### Evitar botoes pequenos demais

Alvo minimo recomendado:

```tsx
className="min-h-10"
```

### Tratar tabelas largas

```tsx
<div className="w-full overflow-x-auto">
  ...
</div>
```

### Tratar modais

```tsx
className="max-h-[90vh] overflow-y-auto"
```

### Evitar `w-screen` dentro de containers

`w-screen` pode causar overflow por causa da scrollbar. Preferir:

```tsx
className="w-full"
```

---

## 17. Problemas comuns e correcoes rapidas

### Scroll horizontal na pagina

Verificar:

- `w-screen`;
- `min-w-*`;
- tabela sem wrapper;
- botoes em `flex-row` sem quebra;
- cards com largura fixa;
- ReactFlow fora do container.

Correcoes tipicas:

```tsx
className="w-full min-w-0 overflow-hidden"
```

ou:

```tsx
className="overflow-x-auto"
```

### Card estoura no mobile

Verificar textos longos e grids.

Correcao:

```tsx
className="min-w-0 break-words"
```

### Botoes ficam espremidos

Correcao:

```tsx
className="flex flex-col gap-2 sm:flex-row"
```

### Modal nao cabe

Correcao:

```tsx
className="max-h-[90vh] overflow-y-auto"
```

### Tabela quebra layout

Correcao:

```tsx
<div className="overflow-x-auto">
  <table className="min-w-[720px]">
    ...
  </table>
</div>
```

### ReactFlow captura toque indevidamente

Verificar:

- overlays;
- paineis flutuantes;
- `stopPropagation`;
- z-index;
- `panOnDrag`;
- `zoomOnPinch`;
- estado de selecao de area.

### Legenda atrapalha arvore

Verificar:

- painel com `data-tree-legend="true"`;
- eventos com `stopPropagation`;
- altura maxima;
- scroll interno;
- posicionamento em mobile.

---

## 18. O que nao fazer nesta fase

- nao implementar favoritos expandidos;
- nao implementar WhatsApp API real;
- nao implementar push real;
- nao implementar fila/retry avancado;
- nao implementar exportacao da arvore completa;
- nao criar nova arquitetura de timeline;
- nao alterar regras de parentesco;
- nao refatorar banco;
- nao limpar base64 legado;
- nao alterar secrets;
- nao mexer no cron, salvo correcao critica;
- nao criar nova frente visual que atrase o lancamento.

---

## 19. Criterio para encerrar a fase 7.10

A responsividade pode ser considerada concluida quando:

- todos os blocos foram ajustados;
- todas as larguras obrigatorias foram testadas;
- QA visual final foi aprovado;
- `npm run build` passou;
- `npm test` passou;
- `npm run test:e2e` passou;
- `git diff --check` passou;
- `supabase migration list` esta alinhado;
- documentacao foi atualizada;
- branch foi mergeada na `main`;
- push final foi feito.

---

## 20. Pos-responsividade

Apos concluir e fazer merge:

```bash
git checkout main
git pull origin main
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
git push origin main
```

Depois atualizar:

- `docs/PLANO_PROXIMOS_PASSOS.md`;
- `docs/GUIA_IMPLEMENTACOES.md`.

Registrar que:

- 7.10 foi concluida no escopo MVP;
- QA mobile/tablet/desktop foi aprovado;
- refinamentos finos ficam para pos-MVP, desde que nao bloqueiem uso.
