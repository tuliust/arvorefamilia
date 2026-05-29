# QA Final MVP

> Local recomendado: `docs/historico/QA_FINAL_MVP.md`
> Tipo: checklist histÃ³rico e operacional de validaÃ§Ã£o final do MVP.

---

## 1. Objetivo

Este documento consolida o checklist de QA final do MVP do projeto **Ãrvore FamÃ­lia**.

Use para:

- validar fechamento de MVP;
- repetir o roteiro antes de deploy;
- documentar critÃ©rios de bloqueio;
- registrar validaÃ§Ã£o tÃ©cnica e visual;
- evitar que o `PLANO_PROXIMOS_PASSOS.md` acumule histÃ³rico granular de QA.

---

## 2. Escopo do MVP validado

O MVP considera como escopo:

- Ã¡rvore familiar funcional;
- perfis de pessoa;
- administraÃ§Ã£o de pessoas;
- administraÃ§Ã£o de relacionamentos;
- solicitaÃ§Ãµes de vÃ­nculos;
- arquivos histÃ³ricos;
- fÃ³rum bÃ¡sico;
- notificaÃ§Ãµes internas/e-mail;
- timeline bÃ¡sica;
- insights persistidos;
- botÃ£o WhatsApp no frontend;
- grau de parentesco no escopo atual;
- favoritos de pessoa;
- pÃ¡gina `/meus-favoritos`;
- exportaÃ§Ã£o de Ã¡rea visÃ­vel da Ã¡rvore;
- legenda visual da Ã¡rvore;
- categoria histÃ³rica em arquivos histÃ³ricos;
- `/minha-arvore` com dados conjugais salvos pelo botÃ£o geral;
- rotas dedicadas `/minha-arvore`, `/genealogia` e `/visao-completa`;
- headers internos padronizados;
- responsividade mobile/tablet.

---

## 3. CritÃ©rios de bloqueio

### P0 â€” bloqueia lanÃ§amento

- build quebrado;
- login quebrado;
- usuÃ¡rio comum acessa admin;
- admin nÃ£o acessa admin;
- Ã¡rvore nÃ£o carrega;
- dados de pessoas nÃ£o salvam;
- relacionamento real Ã© alterado indevidamente por usuÃ¡rio comum;
- arquivos histÃ³ricos nÃ£o salvam apÃ³s migration necessÃ¡ria;
- erro de RLS expondo dado sensÃ­vel;
- deploy exige secret versionado;
- migration obrigatÃ³ria ausente no remoto.

### P1 â€” avaliar bloqueio

- exportaÃ§Ã£o PNG/PDF falha em fluxo principal;
- notificaÃ§Ãµes principais quebram;
- favoritos nÃ£o funcionam;
- perfil pÃºblico mostra dado privado;
- mobile tem overflow horizontal global em rota principal;
- admin essencial fica inutilizÃ¡vel em desktop;
- calendÃ¡rio familiar quebra ao abrir;
- fÃ³rum bÃ¡sico nÃ£o abre.

### P2 â€” nÃ£o bloqueia se documentado

- refinamento visual menor;
- texto/microcopy nÃ£o crÃ­tico;
- melhoria pÃ³s-MVP;
- exportaÃ§Ã£o da Ã¡rvore completa;
- push real;
- WhatsApp real por provider;
- timeline avanÃ§ada;
- favoritos expandidos;
- mapa familiar;
- home dinÃ¢mica.

---

## 4. ValidaÃ§Ã£o tÃ©cnica obrigatÃ³ria

Antes de fechar MVP:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

CritÃ©rios:

- build aprovado;
- testes unitÃ¡rios aprovados;
- testes e2e aprovados;
- `git diff --check` sem erros;
- migrations locais/remotas alinhadas;
- worktree limpo ou com alteraÃ§Ãµes esperadas;
- nenhum secret versionado;
- nenhum dump versionado;
- nenhum backup temporÃ¡rio versionado.

---

## 5. QA visual obrigatÃ³rio

Larguras obrigatÃ³rias:

```txt
320px
375px
390px
430px
768px
desktop
```

CritÃ©rio global:

```js
document.documentElement.scrollWidth > window.innerWidth
```

Resultado esperado:

```txt
false
```

Rotas principais para verificaÃ§Ã£o visual:

```txt
/
/minha-arvore
/genealogia
/visao-completa
/meus-dados
/meus-vinculos
/meus-favoritos
/notificacoes
/ajustar-notificacoes
/forum
/forum/novo
/calendario-familiar
/admin/dashboard
/admin/pessoas
/admin/pessoas/nova
/admin/relacionamentos
/admin/relacionamentos/novo
/admin/solicitacoes-vinculos
/admin/notificacoes
/admin/integridade
/admin/atividades
/admin/diagnostico
/admin/importacao
/admin/migrar-dados
```

---

## 6. QA de rotas e acesso

Validar:

- usuÃ¡rio deslogado acessa `/entrar`;
- usuÃ¡rio deslogado nÃ£o acessa `/minha-arvore`;
- usuÃ¡rio deslogado nÃ£o acessa `/admin`;
- usuÃ¡rio comum acessa `/meus-dados`;
- usuÃ¡rio comum acessa `/notificacoes`;
- usuÃ¡rio comum acessa `/forum`;
- usuÃ¡rio comum nÃ£o acessa `/admin`;
- admin acessa `/admin`;
- admin acessa `/admin/pessoas`;
- `/` redireciona para `/minha-arvore`;
- `/?pessoa=ID` redireciona para `/minha-arvore?pessoa=ID`;
- troca entre `/minha-arvore`, `/genealogia` e `/visao-completa` preserva `?pessoa=ID`.

---

## 7. QA da Ã¡rvore

Validar em:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Checklist:

- Ã¡rvore carrega;
- pessoa central aparece;
- zoom `+` funciona;
- zoom `-` funciona;
- pan/arraste funciona;
- clique em pessoa abre detalhe/perfil conforme esperado;
- anel conjugal abre modal;
- tÃ­tulo fixo aparece uma Ãºnica vez;
- nÃ£o hÃ¡ tÃ­tulo duplicado dentro do layout;
- Minha Ãrvore nÃ£o abre minÃºscula;
- Genealogia usa zoom por largura;
- VisÃ£o Completa usa zoom por largura;
- Genealogia/VisÃ£o Completa permitem pan vertical;
- painel lateral abre e recolhe;
- nÃ£o hÃ¡ botÃ£o duplicado de recolher painel.

---

## 8. QA de legendas, filtros e conectores

Validar aba **Legendas**.

### Linhas

- Conjugal oculta/exibe linhas conjugais;
- Pais/filhos oculta/exibe linhas parentais;
- IrmÃ£os oculta/exibe linhas/trechos de irmÃ£os quando suportado;
- Todas liga/desliga linhas controlÃ¡veis.

### Destacar

- CÃ´njuges destaca apenas linhas conjugais visÃ­veis;
- Pais/Filhos destaca apenas linhas parentais visÃ­veis;
- IrmÃ£os destaca trechos de irmÃ£os visÃ­veis;
- Todas destaca linhas visÃ­veis.

Regra crÃ­tica:

```txt
Destaque nÃ£o recria linha oculta.
```

### Filtros

- Vivos funciona;
- Falecidos funciona;
- Pets funciona;
- filtros de grupos funcionam;
- contadores nÃ£o mudam por destaque;
- cards nÃ£o somem por aÃ§Ã£o de linha.

---

## 9. QA de exportaÃ§Ã£o da Ã¡rvore

Validar:

- abrir AÃ§Ãµes;
- iniciar seleÃ§Ã£o de Ã¡rea;
- cancelar por botÃ£o;
- iniciar novamente;
- cancelar por `Esc`;
- selecionar Ã¡rea vÃ¡lida;
- exportar PNG;
- exportar PDF;
- imprimir;
- seleÃ§Ã£o pequena demais mostra erro/impede aÃ§Ã£o;
- pan/zoom bloqueiam durante seleÃ§Ã£o;
- pan/zoom voltam apÃ³s cancelar/concluir;
- controles, legenda, menus e overlay nÃ£o aparecem na exportaÃ§Ã£o.

Views:

```txt
/minha-arvore
/genealogia
/visao-completa
```

---

## 10. QA de pessoas e perfil

Validar:

- criar pessoa;
- editar pessoa;
- salvar nome;
- salvar nascimento;
- salvar local de nascimento;
- salvar falecimento;
- salvar local de falecimento;
- salvar pessoa falecida;
- salvar local no exterior;
- salvar minibio;
- salvar curiosidades;
- salvar telefone;
- salvar endereÃ§o;
- salvar privacidade de telefone;
- salvar privacidade de data de nascimento;
- salvar redes sociais;
- ver perfil pÃºblico/interno;
- cards vazios de insights nÃ£o aparecem publicamente;
- texto `ConteÃºdo ainda nÃ£o gerado.` nÃ£o aparece publicamente.

---

## 11. QA de vÃ­nculos e permissÃµes de pessoa

Validar:

- primeiro acesso;
- vÃ­nculo usuÃ¡rio-pessoa;
- usuÃ¡rio edita prÃ³prios dados se permitido;
- usuÃ¡rio sem permissÃ£o nÃ£o edita pessoa indevida;
- admin abre `/admin/pessoas/:id/editar`;
- card de usuÃ¡rios vinculÃ¡veis carrega;
- usuÃ¡rios jÃ¡ vinculados nÃ£o aparecem;
- botÃ£o Recarregar funciona;
- erro de schema cache da RPC nÃ£o aparece;
- usuÃ¡rio comum nÃ£o cria relacionamento real diretamente;
- solicitaÃ§Ã£o de vÃ­nculo aparece no admin;
- aprovaÃ§Ã£o aplica alteraÃ§Ã£o real;
- rejeiÃ§Ã£o nÃ£o altera dado real.

---

## 12. QA de arquivos histÃ³ricos e Storage

Validar:

- upload de imagem;
- upload de PDF;
- preview de imagem;
- card/Ã­cone de PDF;
- mensagem verde `âœ“ Arquivo carregado`;
- input nativo oculto apÃ³s upload;
- campos e botÃµes Cancelar/Adicionar ocultos apÃ³s upload;
- botÃ£o Adicionar Arquivo reabre campos;
- tÃ­tulo salva;
- descriÃ§Ã£o salva;
- ano salva;
- categoria histÃ³rica salva;
- download funciona;
- remover arquivo funciona conforme permissÃ£o;
- arquivo de relacionamento usa `relacionamento_id`;
- base64 legado continua compatÃ­vel.

PrÃ©-requisito:

```txt
20260522121000_add_historical_file_event_category.sql
```

---

## 13. QA de notificaÃ§Ãµes

Validar:

- `/notificacoes` abre;
- lista em cards aparece;
- estado vazio aparece quando aplicÃ¡vel;
- marcar como lida;
- marcar todas como lidas;
- remover notificaÃ§Ã£o;
- `/ajustar-notificacoes` abre;
- toggles de preferÃªncia salvam;
- `/admin/notificacoes` abre;
- rotina manual funciona em ambiente apropriado;
- e-mail real sÃ³ funciona se provider/secrets estiverem configurados.

Regra:

```txt
Cron automÃ¡tico depende de configuraÃ§Ã£o segura externa.
```

---

## 14. QA de calendÃ¡rio familiar

Validar:

- abrir `/calendario-familiar`;
- trocar mÃªs;
- voltar mÃªs;
- clicar em categorias da sidebar;
- contadores mostram `1 evento` e `N eventos`;
- aniversÃ¡rio no grid usa primeiro nome;
- lista de aniversariantes pode mostrar nome completo;
- descriÃ§Ã£o usa `Faz X anos`;
- nÃ£o aparece `item(ns)`;
- desktop e mobile sem overflow global.

Se Google Agenda foi afetado:

- conectar;
- sincronizar;
- desconectar;
- validar erros de token/permissÃ£o.

---

## 15. QA de fÃ³rum

Validar:

- abrir `/forum`;
- criar tÃ³pico;
- abrir tÃ³pico;
- editar tÃ³pico;
- responder/comentar se aplicÃ¡vel;
- texto longo quebra linha;
- mobile nÃ£o quebra layout;
- aÃ§Ãµes de moderaÃ§Ã£o respeitam permissÃ£o.

---

## 16. QA de favoritos

Validar:

- favoritar pessoa;
- remover favorito;
- abrir `/meus-favoritos`;
- buscar favorito;
- filtrar favorito;
- abrir pessoa favorita;
- isolamento por usuÃ¡rio.

---

## 17. QA de timeline e insights

Timeline:

- eventos aparecem no perfil;
- nascimento/falecimento aparecem quando hÃ¡ dados;
- relacionamentos/filhos/arquivos aparecem quando aplicÃ¡vel;
- eventos pessoais aparecem;
- estado vazio Ã© adequado.

Insights:

- perfil lÃª conteÃºdo persistido;
- admin gera/regenera;
- erro aparece no admin quando aplicÃ¡vel;
- perfil pÃºblico nÃ£o mostra cards vazios;
- secrets de IA ficam server-side.

---

## 18. QA admin

Validar:

- dashboard;
- pessoas;
- nova pessoa;
- editar pessoa;
- relacionamentos;
- novo relacionamento;
- solicitaÃ§Ãµes de vÃ­nculos;
- notificaÃ§Ãµes admin;
- integridade;
- atividades;
- diagnÃ³stico;
- importaÃ§Ã£o;
- migrar dados.

Regra:

```txt
/admin/migrar-dados Ã© destrutiva e deve permanecer bloqueada em produÃ§Ã£o salvo variÃ¡vel explÃ­cita e confirmaÃ§Ã£o textual.
```

---

## 19. QA pÃ³s-migration

ApÃ³s aplicar migration:

```bash
supabase migration list
npm run build
npm test
npm run test:e2e
git diff --check
```

Validar manualmente a tela afetada.

Exemplos:

- `categoria_evento` em arquivos histÃ³ricos;
- RPC `admin_list_profiles_for_linking`;
- `site_visual_settings`;
- tabelas de notificaÃ§Ãµes;
- tabelas de eventos pessoais.

---

## 20. Resultado esperado para fechamento

Para considerar MVP pronto:

- nenhum P0 aberto;
- P1 resolvido ou explicitamente aceito;
- build/test/e2e aprovados;
- QA visual principal aprovado;
- migrations alinhadas;
- documentaÃ§Ã£o canÃ´nica atualizada;
- pÃ³s-MVP separado do escopo de lanÃ§amento;
- deploy preparado.

---

## 21. PÃ³s-MVP nÃ£o bloqueante

NÃ£o bloqueia MVP:

- exportar Ã¡rvore completa;
- push real;
- WhatsApp real por provider;
- fila/retry avanÃ§ado;
- upload por evento;
- privacidade por evento;
- PDF da timeline;
- IA consultiva;
- comparador de perfis;
- mapa familiar;
- home dinÃ¢mica;
- legenda configurÃ¡vel;
- favoritos para outras entidades;
- Google Agenda com QA operacional ampliado.

---

## 22. HistÃ³rico documental

Este arquivo deve receber checklists e resultados de QA final. O plano de prÃ³ximos passos deve continuar focado em decisÃµes e pendÃªncias, nÃ£o em logs longos de validaÃ§Ã£o.

Se este documento ficar muito grande, separar por data:

```txt
docs/historico/QA_FINAL_MVP_2026-05-29.md
docs/historico/QA_FINAL_MVP_YYYY-MM-DD.md
```
