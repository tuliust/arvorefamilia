> Status atual: fase 7.10 concluída no escopo MVP. Este documento fica preservado como referência histórica, checklist de regressão e guia para ajustes futuros de responsividade.

# Responsividade mobile/tablet — Árvore Família

## Objetivo

Este documento orienta a fase **7.10 Responsividade mobile/tablet**, última etapa do MVP antes do lançamento.

Ele deve ser usado para:

- organizar a execução por blocos;
- evitar ajustes dispersos em muitas telas ao mesmo tempo;
- listar arquivos prováveis por frente;
- padronizar testes em larguras obrigatórias;
- definir critérios mínimos de aceite;
- registrar comandos úteis de validação;
- separar ajustes de MVP de melhorias pós-MVP.

A responsividade deve começar somente depois de:

- funcionalidades MVP estabilizadas;
- QA funcional manual aprovado;
- `npm run build` aprovado;
- `npm test` aprovado;
- `npm run test:e2e` aprovado;
- `git diff --check` sem erros;
- `supabase migration list` sem divergências local/remoto.

---

## 1. Estado de entrada da fase

Antes de iniciar os ajustes responsivos, o projeto deve estar neste estado:

| Validação | Status esperado |
|---|---|
| Build de produção | aprovado |
| Testes unitários | aprovados |
| Testes e2e | aprovados |
| `git diff --check` | sem erros |
| Migrations Supabase | local/remoto alinhados |
| QA manual funcional | aprovado |
| Escopo MVP | congelado |
| Pós-MVP | documentado |

Se algum item acima falhar, corrigir antes de iniciar a responsividade.

---

## 2. Regra principal

A responsividade é a **última etapa antes do lançamento**.

Durante esta fase:

- não expandir funcionalidades;
- não criar novas migrations, salvo correção crítica;
- não alterar regras de negócio sem necessidade;
- não mexer em Edge Functions;
- não alterar RLS;
- não implementar backlog pós-MVP;
- não iniciar redesign amplo;
- priorizar usabilidade, legibilidade, toque e ausência de quebras visuais.

O foco é deixar o produto **operável, legível e confiável** em mobile, tablet e desktop.

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

## 4. Larguras obrigatórias de teste

Testar no DevTools ou em dispositivos reais:

| Largura | Uso esperado |
|---:|---|
| 320px | menor mobile suportado |
| 375px | iPhone padrão/pequeno |
| 390px | mobile intermediário |
| 430px | mobile grande |
| 768px | tablet vertical |
| desktop | referência final |

Sempre validar também altura reduzida quando houver modais, overlays ou formulários longos.

---

## 5. Critérios globais de aceite

Uma tela só deve ser considerada aprovada quando:

- não houver overflow horizontal indevido;
- o header estiver utilizável;
- menus e botões forem acessíveis por toque;
- botões não ficarem fora da tela;
- cards não estourarem o container;
- tabelas tiverem scroll controlado;
- modais couberem na viewport ou tenham scroll interno;
- formulários longos forem usáveis;
- textos principais permanecerem legíveis;
- CTAs principais continuarem visíveis;
- estados vazios continuarem compreensíveis;
- loading/error states não quebrarem layout;
- ações destrutivas permanecerem protegidas;
- a árvore continuar utilizável com pan/zoom;
- build continuar passando após os ajustes.

---

## 6. Ordem recomendada de trabalho

Executar em blocos, com commit ao final de cada bloco validado:

1. base global;
2. árvore e ReactFlow;
3. perfil da pessoa;
4. área do usuário;
5. fórum/favoritos/notificações;
6. admin;
7. QA final de lançamento.

Não avançar para o próximo bloco se o anterior introduzir quebra visual evidente ou build quebrado.

---

## 7. Diagnóstico inicial recomendado

Antes de alterar código, fazer uma leitura visual rápida em 320px, 390px e 768px para identificar os pontos mais críticos.

### Itens com maior risco de quebra

| Área | Risco provável | Ação esperada |
|---|---|---|
| Árvore/ReactFlow | controles, overlays, pan/zoom e largura do canvas | revisar wrappers, z-index, botões flutuantes e interação touch |
| Admin Pessoa Form | formulário longo, muitos blocos e botões internos | garantir grids responsivos, scroll natural e botões acessíveis |
| Tabelas admin | overflow horizontal | adicionar wrappers `overflow-x-auto` |
| Modais | altura maior que viewport | aplicar `max-h-[90vh]` e `overflow-y-auto` |
| Favoritos/fórum/notificações | filtros e cards em linha | empilhar em mobile e permitir quebra |
| Timeline/perfil | textos longos e cards | usar `min-w-0`, `break-words` e grids responsivos |

### Sinais de problema

- barra horizontal no navegador;
- botão fora da tela;
- card cortado;
- modal sem botão de fechar visível;
- tabela empurrando todo o layout;
- ReactFlow impedindo rolagem da página;
- legenda cobrindo controles essenciais;
- menu de pessoa abrindo fora da viewport;
- formulário com botão de salvar inacessível.

---

## 8. Bloco 1 — Base global

### Objetivo

Criar uma base responsiva consistente para evitar correções repetidas em cada tela.

### Itens a verificar

- header;
- menu principal;
- menu do usuário;
- containers;
- grids;
- cards;
- botões;
- inputs;
- selects;
- textareas;
- badges;
- tabelas;
- modais;
- dialogs;
- toasts;
- espaçamentos;
- tipografia;
- overflow horizontal.

### Arquivos prováveis

```txt
src/app/pages/Home.tsx
src/app/components
src/app/components/ui
src/index.css
src/app/index.css
src/app/routes.tsx
```

### Correções frequentes

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

#### Botões em linha

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

Garantir altura máxima e rolagem:

```tsx
className="max-h-[90vh] overflow-y-auto"
```

### Validação do bloco

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

## 9. Bloco 2 — Árvore e ReactFlow

### Objetivo

Garantir que a árvore funcione em mobile/tablet sem perder uso básico.

### Rotas e áreas

- `/`
- `/minha-arvore`
- Genealogia;
- Visão Completa;
- Minha Árvore;
- painel de informações;
- filtros;
- controles de zoom;
- legenda;
- menu de pessoa;
- modal conjugal;
- seleção de área;
- exportação PNG/PDF/impressão.

### Arquivos prováveis

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

### Testes obrigatórios

- árvore carrega em 320px;
- árvore carrega em 375px;
- árvore carrega em 390px;
- árvore carrega em 430px;
- árvore carrega em 768px;
- pan por toque funciona;
- zoom não impede uso;
- controles não cobrem conteúdo crítico;
- botão **Legenda** é acessível;
- painel da legenda tem scroll se necessário;
- menu da pessoa abre e fecha;
- modal conjugal cabe na tela;
- seleção de área abre e cancela;
- exportação não quebra a tela;
- filtros não deixam anéis/conectores soltos.

### Critérios específicos

- a árvore não precisa mostrar tudo confortavelmente em 320px, mas precisa ser navegável;
- não deve haver scroll horizontal da página causado pela árvore;
- o ReactFlow pode ocupar viewport ampla, desde que contido em seu wrapper;
- overlays devem respeitar a viewport;
- botões flutuantes devem ter área mínima de toque;
- legenda e seleção de área não devem aparecer em exportações.

### Validação do bloco

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

## 10. Bloco 3 — Perfil da pessoa

### Objetivo

Garantir leitura, navegação e ações principais no perfil individual.

### Rotas

- `/pessoa/:id`
- `/pessoas/:id`

### Componentes a validar

- cabeçalho do perfil;
- foto/avatar;
- dados pessoais;
- botões de ação;
- WhatsApp;
- favorito;
- grau de parentesco;
- relações familiares;
- timeline;
- eventos pessoais;
- arquivos históricos;
- tópicos/discussões relacionadas;
- estados vazios.

### Arquivos prováveis

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

### Testes obrigatórios

- perfil com muitos dados;
- perfil com poucos dados;
- perfil com pessoa falecida;
- perfil com arquivos históricos;
- perfil com timeline longa;
- perfil com WhatsApp habilitado;
- perfil sem permissão de telefone;
- perfil com favorito ativo;
- perfil sem relação encontrada;
- botões empilham corretamente no mobile.

### Critérios específicos

- cards devem empilhar;
- timeline não deve estourar largura;
- textos longos devem quebrar linha;
- arquivos devem ter ações acessíveis por toque;
- botões principais não devem ficar escondidos;
- dados sensíveis continuam respeitando permissões.

### Validação do bloco

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

## 11. Bloco 4 — Área do usuário

### Objetivo

Garantir que usuários comuns consigam revisar dados, vínculos, notificações e favoritos no mobile.

### Rotas

- `/meus-dados`
- `/meus-vinculos`
- `/notificacoes`
- `/meus-favoritos`
- `/vincular-perfil`

### Arquivos prováveis

```txt
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/VincularPerfil.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/components/favorites/FavoriteButton.tsx
```

### Testes obrigatórios

#### Meus Dados

- formulário longo;
- dados pessoais;
- privacidade;
- redes sociais;
- eventos pessoais;
- arquivos históricos;
- botões salvar/cancelar.

#### Meus Vínculos

- lista de vínculos;
- solicitação de vínculo;
- status de solicitação;
- ações em mobile.

#### Notificações

- lista vazia;
- lista com notificações;
- marcar uma como lida;
- marcar todas como lidas;
- remover notificação;
- preferências.

#### Meus Favoritos

- busca;
- filtros;
- cards;
- link interno;
- remoção;
- estado sem favoritos.

#### Vincular Perfil

- busca de pessoa;
- resultados;
- solicitação;
- mensagens de erro/sucesso.

### Critérios específicos

- inputs devem ocupar largura total no mobile;
- ações secundárias podem ir para baixo;
- listas devem ter espaçamento de toque;
- filtros não devem gerar overflow;
- tabelas, se existirem, devem ter scroll controlado.

### Validação do bloco

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

## 12. Bloco 5 — Fórum, favoritos e notificações

### Objetivo

Garantir que áreas de interação e leitura recorrente funcionem em telas pequenas.

### Rotas

- `/forum`
- `/forum/novo`
- `/forum/topico/:id`
- `/forum/topico/:id/editar`
- `/meus-favoritos`
- `/notificacoes`

### Arquivos prováveis

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/components/forum
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
```

### Testes obrigatórios

#### Fórum

- lista de tópicos;
- filtros/categorias;
- novo tópico;
- edição;
- tela de tópico;
- respostas;
- comentários;
- reações, se exibidas;
- denúncia/moderação, se exibida.

#### Favoritos

- listagem;
- filtros;
- busca;
- remoção;
- link indisponível.

#### Notificações

- preferências;
- marcar/remover;
- lista com textos longos;
- estado vazio.

### Critérios específicos

- cards de tópico devem empilhar;
- filtros devem quebrar linha;
- editores de texto devem caber na tela;
- ações em tópicos devem ser tocáveis;
- texto longo não deve estourar o card.

### Validação do bloco

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

## 13. Bloco 6 — Admin

### Objetivo

Garantir que o admin continue operável em mobile/tablet.

O admin não precisa ter a mesma eficiência do desktop em telas pequenas, mas não pode quebrar layout nem impedir ações essenciais.

### Rotas prioritárias

- `/admin`
- `/admin/pessoas`
- `/admin/pessoas/nova`
- `/admin/pessoas/:id/editar`
- `/admin/relacionamentos`
- `/admin/solicitacoes-vinculos`
- `/admin/integridade`
- `/admin/atividades`
- `/admin/notificacoes`

### Arquivos prováveis

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

### Testes obrigatórios

#### Dashboard

- cards;
- atalhos;
- navegação.

#### Admin Pessoas

- busca;
- filtros;
- tabela/lista;
- ações de editar/remover.

#### Admin Pessoa Form

- formulário longo;
- blocos reutilizáveis;
- dados básicos;
- datas/locais;
- bio;
- contato;
- privacidade;
- redes sociais;
- eventos;
- arquivos históricos;
- relacionamentos;
- dados conjugais;
- botões de salvar/cancelar.

#### Solicitações

- lista;
- aprovar;
- rejeitar;
- estados vazios.

#### Integridade

- cards;
- alertas;
- tabelas;
- scroll horizontal controlado.

#### Notificações admin

- teste interno;
- teste de e-mail;
- rotina manual;
- logs, se exibidos.

### Critérios específicos

- formulários longos devem ter rolagem natural;
- botões principais devem aparecer ao final e não sobrepor conteúdo;
- tabelas largas devem ficar dentro de `overflow-x-auto`;
- ações destrutivas continuam com confirmação;
- admin continua protegido por `ProtectedRoute`;
- nenhum ajuste visual deve liberar ação indevida para usuário comum.

### Validação do bloco

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

## 14. Bloco 7 — QA final de lançamento

### Objetivo

Confirmar que a fase de responsividade não quebrou funcionalidades já aprovadas.

### Comandos obrigatórios

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
- [ ] Home aprovada, incluindo botão Ações com texto no desktop e ícone apenas no mobile.
- [ ] Minha Árvore aprovada.
- [ ] Genealogia aprovada.
- [ ] Visão Completa aprovada.
- [ ] Perfil da pessoa aprovado.
- [ ] Meus Dados aprovado.
- [ ] Meus Vínculos aprovado.
- [ ] Notificações aprovado.
- [ ] Meus Favoritos aprovado.
- [ ] Fórum aprovado.
- [ ] Admin Dashboard aprovado.
- [ ] Admin Pessoas aprovado.
- [ ] Admin Pessoa Form aprovado.
- [ ] Admin Solicitações aprovado.
- [ ] Admin Integridade aprovado.
- [ ] Admin Notificações aprovado.
- [ ] Modais aprovados.
- [ ] Tabelas aprovadas.
- [ ] Formulários longos aprovados.
- [ ] Árvore touch aprovada.
- [ ] Sem overflow horizontal indevido.
- [ ] Build aprovado.
- [ ] Testes unitários aprovados.
- [ ] Testes e2e aprovados.
- [ ] Migrations alinhadas.
```

Pontos responsivos recentes:

- botão **Ações** da Home usa `Printer`, texto no desktop e ícone apenas no mobile;
- o botão **Ações** continua abrindo o painel interno `activeSidebarPanel = 'info'`;
- cards de **Escopo da visualização** em `/minha-arvore` exibem avatar circular com foto ou iniciais;
- fluxo de arquivos históricos mantém thumbnail/card PDF e mensagem verde após upload, sem exibir o input nativo até o usuário reabrir o formulário.

### Commit de documentação final

Depois de atualizar `PLANO_PROXIMOS_PASSOS.md` e `GUIA_IMPLEMENTACOES.md` com responsividade aprovada:

```bash
git add docs/PLANO_PROXIMOS_PASSOS.md docs/GUIA_IMPLEMENTACOES.md
git commit -m "docs: registrar responsividade MVP aprovada"
```

---

## 15. Comandos úteis durante a fase

### Servidor local

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testes unitários

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

## 16. Boas práticas de implementação

### Preferir ajustes locais antes de refatorações amplas

Corrigir o layout onde o problema ocorre, salvo quando o mesmo padrão quebrar várias telas.

### Evitar alteração de lógica

Responsividade não deve mudar:

- permissões;
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

### Controlar largura de conteúdo

```tsx
className="w-full min-w-0"
```

`min-w-0` é importante em flex/grid para evitar estouro com textos longos.

### Quebrar textos longos

```tsx
className="break-words"
```

ou:

```tsx
className="overflow-hidden text-ellipsis"
```

### Evitar botões pequenos demais

Alvo mínimo recomendado:

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

## 17. Problemas comuns e correções rápidas

### Scroll horizontal na página

Verificar:

- `w-screen`;
- `min-w-*`;
- tabela sem wrapper;
- botões em `flex-row` sem quebra;
- cards com largura fixa;
- ReactFlow fora do container.

Correções típicas:

```tsx
className="w-full min-w-0 overflow-hidden"
```

ou:

```tsx
className="overflow-x-auto"
```

### Card estoura no mobile

Verificar textos longos e grids.

Correção:

```tsx
className="min-w-0 break-words"
```

### Botões ficam espremidos

Correção:

```tsx
className="flex flex-col gap-2 sm:flex-row"
```

### Modal não cabe

Correção:

```tsx
className="max-h-[90vh] overflow-y-auto"
```

### Tabela quebra layout

Correção:

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
- painéis flutuantes;
- `stopPropagation`;
- z-index;
- `panOnDrag`;
- `zoomOnPinch`;
- estado de seleção de área.

### Legenda atrapalha árvore

Verificar:

- painel com `data-tree-legend="true"`;
- eventos com `stopPropagation`;
- altura máxima;
- scroll interno;
- posicionamento em mobile.

---

## 18. O que não fazer nesta fase

- não implementar favoritos expandidos;
- não implementar WhatsApp API real;
- não implementar push real;
- não implementar fila/retry avançado;
- não implementar exportação da árvore completa;
- não criar nova arquitetura de timeline;
- não alterar regras de parentesco;
- não refatorar banco;
- não limpar base64 legado;
- não alterar secrets;
- não mexer no cron, salvo correção crítica;
- não criar nova frente visual que atrase o lançamento.

---

## 19. Critério para encerrar a fase 7.10

A responsividade pode ser considerada concluída quando:

- todos os blocos foram ajustados;
- todas as larguras obrigatórias foram testadas;
- QA visual final foi aprovado;
- `npm run build` passou;
- `npm test` passou;
- `npm run test:e2e` passou;
- `git diff --check` passou;
- `supabase migration list` está alinhado;
- documentação foi atualizada;
- branch foi mergeada na `main`;
- push final foi feito.

---

## 20. Pós-responsividade

Após concluir e fazer merge:

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

- 7.10 foi concluída no escopo MVP;
- QA mobile/tablet/desktop foi aprovado;
- refinamentos finos ficam para pós-MVP, desde que não bloqueiem uso.
