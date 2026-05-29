> Status atual: fase 7.10 concluÃ­da no escopo MVP. Este documento fica preservado como referÃªncia histÃ³rica, checklist de regressÃ£o e guia para ajustes futuros de responsividade.

# Responsividade mobile/tablet â€” Ãrvore FamÃ­lia

## Objetivo

Este documento orienta a fase **7.10 Responsividade mobile/tablet**, Ãºltima etapa do MVP antes do lanÃ§amento.

Ele deve ser usado para:

- organizar a execuÃ§Ã£o por blocos;
- evitar ajustes dispersos em muitas telas ao mesmo tempo;
- listar arquivos provÃ¡veis por frente;
- padronizar testes em larguras obrigatÃ³rias;
- definir critÃ©rios mÃ­nimos de aceite;
- registrar comandos Ãºteis de validaÃ§Ã£o;
- separar ajustes de MVP de melhorias pÃ³s-MVP.

A responsividade deve comeÃ§ar somente depois de:

- funcionalidades MVP estabilizadas;
- QA funcional manual aprovado;
- `npm run build` aprovado;
- `npm test` aprovado;
- `npm run test:e2e` aprovado;
- `git diff --check` sem erros;
- `supabase migration list` sem divergÃªncias local/remoto.

---

## 1. Estado de entrada da fase

Antes de iniciar os ajustes responsivos, o projeto deve estar neste estado:

| ValidaÃ§Ã£o | Status esperado |
|---|---|
| Build de produÃ§Ã£o | aprovado |
| Testes unitÃ¡rios | aprovados |
| Testes e2e | aprovados |
| `git diff --check` | sem erros |
| Migrations Supabase | local/remoto alinhados |
| QA manual funcional | aprovado |
| Escopo MVP | congelado |
| PÃ³s-MVP | documentado |

Se algum item acima falhar, corrigir antes de iniciar a responsividade.

---

## 2. Regra principal

A responsividade Ã© a **Ãºltima etapa antes do lanÃ§amento**.

Durante esta fase:

- nÃ£o expandir funcionalidades;
- nÃ£o criar novas migrations, salvo correÃ§Ã£o crÃ­tica;
- nÃ£o alterar regras de negÃ³cio sem necessidade;
- nÃ£o mexer em Edge Functions;
- nÃ£o alterar RLS;
- nÃ£o implementar backlog pÃ³s-MVP;
- nÃ£o iniciar redesign amplo;
- priorizar usabilidade, legibilidade, toque e ausÃªncia de quebras visuais.

O foco Ã© deixar o produto **operÃ¡vel, legÃ­vel e confiÃ¡vel** em mobile, tablet e desktop.

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

## 4. Larguras obrigatÃ³rias de teste

Testar no DevTools ou em dispositivos reais:

| Largura | Uso esperado |
|---:|---|
| 320px | menor mobile suportado |
| 375px | iPhone padrÃ£o/pequeno |
| 390px | mobile intermediÃ¡rio |
| 430px | mobile grande |
| 768px | tablet vertical |
| desktop | referÃªncia final |

Sempre validar tambÃ©m altura reduzida quando houver modais, overlays ou formulÃ¡rios longos.

---

## 5. CritÃ©rios globais de aceite

Uma tela sÃ³ deve ser considerada aprovada quando:

- nÃ£o houver overflow horizontal indevido;
- o header estiver utilizÃ¡vel;
- menus e botÃµes forem acessÃ­veis por toque;
- botÃµes nÃ£o ficarem fora da tela;
- cards nÃ£o estourarem o container;
- tabelas tiverem scroll controlado;
- modais couberem na viewport ou tenham scroll interno;
- formulÃ¡rios longos forem usÃ¡veis;
- textos principais permanecerem legÃ­veis;
- CTAs principais continuarem visÃ­veis;
- estados vazios continuarem compreensÃ­veis;
- loading/error states nÃ£o quebrarem layout;
- aÃ§Ãµes destrutivas permanecerem protegidas;
- a Ã¡rvore continuar utilizÃ¡vel com pan/zoom;
- build continuar passando apÃ³s os ajustes.

---

## 6. Ordem recomendada de trabalho

Executar em blocos, com commit ao final de cada bloco validado:

1. base global;
2. Ã¡rvore e ReactFlow;
3. perfil da pessoa;
4. Ã¡rea do usuÃ¡rio;
5. fÃ³rum/favoritos/notificaÃ§Ãµes;
6. admin;
7. QA final de lanÃ§amento.

NÃ£o avanÃ§ar para o prÃ³ximo bloco se o anterior introduzir quebra visual evidente ou build quebrado.

---

## 7. DiagnÃ³stico inicial recomendado

Antes de alterar cÃ³digo, fazer uma leitura visual rÃ¡pida em 320px, 390px e 768px para identificar os pontos mais crÃ­ticos.

### Itens com maior risco de quebra

| Ãrea | Risco provÃ¡vel | AÃ§Ã£o esperada |
|---|---|---|
| Ãrvore/ReactFlow | controles, overlays, pan/zoom e largura do canvas | revisar wrappers, z-index, botÃµes flutuantes e interaÃ§Ã£o touch |
| Admin Pessoa Form | formulÃ¡rio longo, muitos blocos e botÃµes internos | garantir grids responsivos, scroll natural e botÃµes acessÃ­veis |
| Tabelas admin | overflow horizontal | adicionar wrappers `overflow-x-auto` |
| Modais | altura maior que viewport | aplicar `max-h-[90vh]` e `overflow-y-auto` |
| Favoritos/fÃ³rum/notificaÃ§Ãµes | filtros e cards em linha | empilhar em mobile e permitir quebra |
| Timeline/perfil | textos longos e cards | usar `min-w-0`, `break-words` e grids responsivos |

### Sinais de problema

- barra horizontal no navegador;
- botÃ£o fora da tela;
- card cortado;
- modal sem botÃ£o de fechar visÃ­vel;
- tabela empurrando todo o layout;
- ReactFlow impedindo rolagem da pÃ¡gina;
- legenda cobrindo controles essenciais;
- menu de pessoa abrindo fora da viewport;
- formulÃ¡rio com botÃ£o de salvar inacessÃ­vel.

---

## 8. Bloco 1 â€” Base global

### Objetivo

Criar uma base responsiva consistente para evitar correÃ§Ãµes repetidas em cada tela.

### Itens a verificar

- header;
- menu principal;
- menu do usuÃ¡rio;
- containers;
- grids;
- cards;
- botÃµes;
- inputs;
- selects;
- textareas;
- badges;
- tabelas;
- modais;
- dialogs;
- toasts;
- espaÃ§amentos;
- tipografia;
- overflow horizontal.

### Arquivos provÃ¡veis

```txt
src/app/pages/Home.tsx
src/app/components
src/app/components/ui
src/index.css
src/app/index.css
src/app/routes.tsx
```

### CorreÃ§Ãµes frequentes

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

#### BotÃµes em linha

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

Garantir altura mÃ¡xima e rolagem:

```tsx
className="max-h-[90vh] overflow-y-auto"
```

### ValidaÃ§Ã£o do bloco

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

## 9. Bloco 2 â€” Ãrvore e ReactFlow

### Objetivo

Garantir que a Ã¡rvore funcione em mobile/tablet sem perder uso bÃ¡sico.

### Rotas e Ã¡reas

- `/`
- `/minha-arvore`
- Genealogia;
- VisÃ£o Completa;
- Minha Ãrvore;
- painel de informaÃ§Ãµes;
- filtros;
- controles de zoom;
- legenda;
- menu de pessoa;
- modal conjugal;
- seleÃ§Ã£o de Ã¡rea;
- exportaÃ§Ã£o PNG/PDF/impressÃ£o.

### Arquivos provÃ¡veis

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

### Testes obrigatÃ³rios

- Ã¡rvore carrega em 320px;
- Ã¡rvore carrega em 375px;
- Ã¡rvore carrega em 390px;
- Ã¡rvore carrega em 430px;
- Ã¡rvore carrega em 768px;
- pan por toque funciona;
- zoom nÃ£o impede uso;
- controles nÃ£o cobrem conteÃºdo crÃ­tico;
- botÃ£o **Legenda** Ã© acessÃ­vel;
- painel da legenda tem scroll se necessÃ¡rio;
- menu da pessoa abre e fecha;
- modal conjugal cabe na tela;
- seleÃ§Ã£o de Ã¡rea abre e cancela;
- exportaÃ§Ã£o nÃ£o quebra a tela;
- filtros nÃ£o deixam anÃ©is/conectores soltos.

### CritÃ©rios especÃ­ficos

- a Ã¡rvore nÃ£o precisa mostrar tudo confortavelmente em 320px, mas precisa ser navegÃ¡vel;
- nÃ£o deve haver scroll horizontal da pÃ¡gina causado pela Ã¡rvore;
- o ReactFlow pode ocupar viewport ampla, desde que contido em seu wrapper;
- overlays devem respeitar a viewport;
- botÃµes flutuantes devem ter Ã¡rea mÃ­nima de toque;
- legenda e seleÃ§Ã£o de Ã¡rea nÃ£o devem aparecer em exportaÃ§Ãµes.

### ValidaÃ§Ã£o do bloco

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

## 10. Bloco 3 â€” Perfil da pessoa

### Objetivo

Garantir leitura, navegaÃ§Ã£o e aÃ§Ãµes principais no perfil individual.

### Rotas

- `/pessoa/:id`
- `/pessoas/:id`

### Componentes a validar

- cabeÃ§alho do perfil;
- foto/avatar;
- dados pessoais;
- botÃµes de aÃ§Ã£o;
- WhatsApp;
- favorito;
- grau de parentesco;
- relaÃ§Ãµes familiares;
- timeline;
- eventos pessoais;
- arquivos histÃ³ricos;
- tÃ³picos/discussÃµes relacionadas;
- estados vazios.

### Arquivos provÃ¡veis

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

### Testes obrigatÃ³rios

- perfil com muitos dados;
- perfil com poucos dados;
- perfil com pessoa falecida;
- perfil com arquivos histÃ³ricos;
- perfil com timeline longa;
- perfil com WhatsApp habilitado;
- perfil sem permissÃ£o de telefone;
- perfil com favorito ativo;
- perfil sem relaÃ§Ã£o encontrada;
- botÃµes empilham corretamente no mobile.

### CritÃ©rios especÃ­ficos

- cards devem empilhar;
- timeline nÃ£o deve estourar largura;
- textos longos devem quebrar linha;
- arquivos devem ter aÃ§Ãµes acessÃ­veis por toque;
- botÃµes principais nÃ£o devem ficar escondidos;
- dados sensÃ­veis continuam respeitando permissÃµes.

### ValidaÃ§Ã£o do bloco

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

## 11. Bloco 4 â€” Ãrea do usuÃ¡rio

### Objetivo

Garantir que usuÃ¡rios comuns consigam revisar dados, vÃ­nculos, notificaÃ§Ãµes e favoritos no mobile.

### Rotas

- `/meus-dados`
- `/meus-vinculos`
- `/notificacoes`
- `/meus-favoritos`
- `/vincular-perfil`

### Arquivos provÃ¡veis

```txt
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/VincularPerfil.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/components/favorites/FavoriteButton.tsx
```

### Testes obrigatÃ³rios

#### Meus Dados

- formulÃ¡rio longo;
- dados pessoais;
- privacidade;
- redes sociais;
- eventos pessoais;
- arquivos histÃ³ricos;
- botÃµes salvar/cancelar.

#### Meus VÃ­nculos

- lista de vÃ­nculos;
- solicitaÃ§Ã£o de vÃ­nculo;
- status de solicitaÃ§Ã£o;
- aÃ§Ãµes em mobile.

#### NotificaÃ§Ãµes

- lista vazia;
- lista com notificaÃ§Ãµes;
- marcar uma como lida;
- marcar todas como lidas;
- remover notificaÃ§Ã£o;
- preferÃªncias.

#### Meus Favoritos

- busca;
- filtros;
- cards;
- link interno;
- remoÃ§Ã£o;
- estado sem favoritos.

#### Vincular Perfil

- busca de pessoa;
- resultados;
- solicitaÃ§Ã£o;
- mensagens de erro/sucesso.

### CritÃ©rios especÃ­ficos

- inputs devem ocupar largura total no mobile;
- aÃ§Ãµes secundÃ¡rias podem ir para baixo;
- listas devem ter espaÃ§amento de toque;
- filtros nÃ£o devem gerar overflow;
- tabelas, se existirem, devem ter scroll controlado.

### ValidaÃ§Ã£o do bloco

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

## 12. Bloco 5 â€” FÃ³rum, favoritos e notificaÃ§Ãµes

### Objetivo

Garantir que Ã¡reas de interaÃ§Ã£o e leitura recorrente funcionem em telas pequenas.

### Rotas

- `/forum`
- `/forum/novo`
- `/forum/topico/:id`
- `/forum/topico/:id/editar`
- `/meus-favoritos`
- `/notificacoes`

### Arquivos provÃ¡veis

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/components/forum
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
```

### Testes obrigatÃ³rios

#### FÃ³rum

- lista de tÃ³picos;
- filtros/categorias;
- novo tÃ³pico;
- ediÃ§Ã£o;
- tela de tÃ³pico;
- respostas;
- comentÃ¡rios;
- reaÃ§Ãµes, se exibidas;
- denÃºncia/moderaÃ§Ã£o, se exibida.

#### Favoritos

- listagem;
- filtros;
- busca;
- remoÃ§Ã£o;
- link indisponÃ­vel.

#### NotificaÃ§Ãµes

- preferÃªncias;
- marcar/remover;
- lista com textos longos;
- estado vazio.

### CritÃ©rios especÃ­ficos

- cards de tÃ³pico devem empilhar;
- filtros devem quebrar linha;
- editores de texto devem caber na tela;
- aÃ§Ãµes em tÃ³picos devem ser tocÃ¡veis;
- texto longo nÃ£o deve estourar o card.

### ValidaÃ§Ã£o do bloco

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

## 13. Bloco 6 â€” Admin

### Objetivo

Garantir que o admin continue operÃ¡vel em mobile/tablet.

O admin nÃ£o precisa ter a mesma eficiÃªncia do desktop em telas pequenas, mas nÃ£o pode quebrar layout nem impedir aÃ§Ãµes essenciais.

### Rotas prioritÃ¡rias

- `/admin`
- `/admin/pessoas`
- `/admin/pessoas/nova`
- `/admin/pessoas/:id/editar`
- `/admin/relacionamentos`
- `/admin/solicitacoes-vinculos`
- `/admin/integridade`
- `/admin/atividades`
- `/admin/notificacoes`

### Arquivos provÃ¡veis

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

### Testes obrigatÃ³rios

#### Dashboard

- cards;
- atalhos;
- navegaÃ§Ã£o.

#### Admin Pessoas

- busca;
- filtros;
- tabela/lista;
- aÃ§Ãµes de editar/remover.

#### Admin Pessoa Form

- formulÃ¡rio longo;
- blocos reutilizÃ¡veis;
- dados bÃ¡sicos;
- datas/locais;
- bio;
- contato;
- privacidade;
- redes sociais;
- eventos;
- arquivos histÃ³ricos;
- relacionamentos;
- dados conjugais;
- botÃµes de salvar/cancelar.

#### SolicitaÃ§Ãµes

- lista;
- aprovar;
- rejeitar;
- estados vazios.

#### Integridade

- cards;
- alertas;
- tabelas;
- scroll horizontal controlado.

#### NotificaÃ§Ãµes admin

- teste interno;
- teste de e-mail;
- rotina manual;
- logs, se exibidos.

### CritÃ©rios especÃ­ficos

- formulÃ¡rios longos devem ter rolagem natural;
- botÃµes principais devem aparecer ao final e nÃ£o sobrepor conteÃºdo;
- tabelas largas devem ficar dentro de `overflow-x-auto`;
- aÃ§Ãµes destrutivas continuam com confirmaÃ§Ã£o;
- admin continua protegido por `ProtectedRoute`;
- nenhum ajuste visual deve liberar aÃ§Ã£o indevida para usuÃ¡rio comum.

### ValidaÃ§Ã£o do bloco

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

## 14. Bloco 7 â€” QA final de lanÃ§amento

### Objetivo

Confirmar que a fase de responsividade nÃ£o quebrou funcionalidades jÃ¡ aprovadas.

### Comandos obrigatÃ³rios

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
- [ ] Home aprovada, incluindo botÃ£o AÃ§Ãµes com texto no desktop e Ã­cone apenas no mobile.
- [ ] Minha Ãrvore aprovada.
- [ ] Genealogia aprovada.
- [ ] VisÃ£o Completa aprovada.
- [ ] Perfil da pessoa aprovado.
- [ ] Meus Dados aprovado.
- [ ] Meus VÃ­nculos aprovado.
- [ ] NotificaÃ§Ãµes aprovado.
- [ ] Meus Favoritos aprovado.
- [ ] FÃ³rum aprovado.
- [ ] Admin Dashboard aprovado.
- [ ] Admin Pessoas aprovado.
- [ ] Admin Pessoa Form aprovado.
- [ ] Admin SolicitaÃ§Ãµes aprovado.
- [ ] Admin Integridade aprovado.
- [ ] Admin NotificaÃ§Ãµes aprovado.
- [ ] Modais aprovados.
- [ ] Tabelas aprovadas.
- [ ] FormulÃ¡rios longos aprovados.
- [ ] Ãrvore touch aprovada.
- [ ] Sem overflow horizontal indevido.
- [ ] Build aprovado.
- [ ] Testes unitÃ¡rios aprovados.
- [ ] Testes e2e aprovados.
- [ ] Migrations alinhadas.
```

Pontos responsivos recentes:

- botÃ£o **AÃ§Ãµes** da Home usa `Printer`, texto no desktop e Ã­cone apenas no mobile;
- o botÃ£o **AÃ§Ãµes** continua abrindo o painel interno `activeSidebarPanel = 'info'`;
- cards de **Escopo da visualizaÃ§Ã£o** em `/minha-arvore` exibem avatar circular com foto ou iniciais;
- fluxo de arquivos histÃ³ricos mantÃ©m thumbnail/card PDF e mensagem verde apÃ³s upload, sem exibir o input nativo atÃ© o usuÃ¡rio reabrir o formulÃ¡rio.

### Commit de documentaÃ§Ã£o final

Depois de atualizar `PLANO_PROXIMOS_PASSOS.md` e `GUIA_IMPLEMENTACOES.md` com responsividade aprovada:

```bash
git add docs/PLANO_PROXIMOS_PASSOS.md docs/GUIA_IMPLEMENTACOES.md
git commit -m "docs: registrar responsividade MVP aprovada"
```

---

## 15. Comandos Ãºteis durante a fase

### Servidor local

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testes unitÃ¡rios

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

## 16. Boas prÃ¡ticas de implementaÃ§Ã£o

### Preferir ajustes locais antes de refatoraÃ§Ãµes amplas

Corrigir o layout onde o problema ocorre, salvo quando o mesmo padrÃ£o quebrar vÃ¡rias telas.

### Evitar alteraÃ§Ã£o de lÃ³gica

Responsividade nÃ£o deve mudar:

- permissÃµes;
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

### Controlar largura de conteÃºdo

```tsx
className="w-full min-w-0"
```

`min-w-0` Ã© importante em flex/grid para evitar estouro com textos longos.

### Quebrar textos longos

```tsx
className="break-words"
```

ou:

```tsx
className="overflow-hidden text-ellipsis"
```

### Evitar botÃµes pequenos demais

Alvo mÃ­nimo recomendado:

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

## 17. Problemas comuns e correÃ§Ãµes rÃ¡pidas

### Scroll horizontal na pÃ¡gina

Verificar:

- `w-screen`;
- `min-w-*`;
- tabela sem wrapper;
- botÃµes em `flex-row` sem quebra;
- cards com largura fixa;
- ReactFlow fora do container.

CorreÃ§Ãµes tÃ­picas:

```tsx
className="w-full min-w-0 overflow-hidden"
```

ou:

```tsx
className="overflow-x-auto"
```

### Card estoura no mobile

Verificar textos longos e grids.

CorreÃ§Ã£o:

```tsx
className="min-w-0 break-words"
```

### BotÃµes ficam espremidos

CorreÃ§Ã£o:

```tsx
className="flex flex-col gap-2 sm:flex-row"
```

### Modal nÃ£o cabe

CorreÃ§Ã£o:

```tsx
className="max-h-[90vh] overflow-y-auto"
```

### Tabela quebra layout

CorreÃ§Ã£o:

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
- painÃ©is flutuantes;
- `stopPropagation`;
- z-index;
- `panOnDrag`;
- `zoomOnPinch`;
- estado de seleÃ§Ã£o de Ã¡rea.

### Legenda atrapalha Ã¡rvore

Verificar:

- painel com `data-tree-legend="true"`;
- eventos com `stopPropagation`;
- altura mÃ¡xima;
- scroll interno;
- posicionamento em mobile.

---

## 18. O que nÃ£o fazer nesta fase

- nÃ£o implementar favoritos expandidos;
- nÃ£o implementar WhatsApp API real;
- nÃ£o implementar push real;
- nÃ£o implementar fila/retry avanÃ§ado;
- nÃ£o implementar exportaÃ§Ã£o da Ã¡rvore completa;
- nÃ£o criar nova arquitetura de timeline;
- nÃ£o alterar regras de parentesco;
- nÃ£o refatorar banco;
- nÃ£o limpar base64 legado;
- nÃ£o alterar secrets;
- nÃ£o mexer no cron, salvo correÃ§Ã£o crÃ­tica;
- nÃ£o criar nova frente visual que atrase o lanÃ§amento.

---

## 19. CritÃ©rio para encerrar a fase 7.10

A responsividade pode ser considerada concluÃ­da quando:

- todos os blocos foram ajustados;
- todas as larguras obrigatÃ³rias foram testadas;
- QA visual final foi aprovado;
- `npm run build` passou;
- `npm test` passou;
- `npm run test:e2e` passou;
- `git diff --check` passou;
- `supabase migration list` estÃ¡ alinhado;
- documentaÃ§Ã£o foi atualizada;
- branch foi mergeada na `main`;
- push final foi feito.

---

## 20. PÃ³s-responsividade

ApÃ³s concluir e fazer merge:

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

- 7.10 foi concluÃ­da no escopo MVP;
- QA mobile/tablet/desktop foi aprovado;
- refinamentos finos ficam para pÃ³s-MVP, desde que nÃ£o bloqueiem uso.
