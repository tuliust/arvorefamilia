# QA Final MVP

> Local recomendado: `docs/historico/QA_FINAL_MVP.md`
> Tipo: checklist historico e operacional de validacao final do MVP.

---

## 1. Objetivo

Este documento consolida o checklist de QA final do MVP do projeto **Arvore Familia**.

Use para:

- validar fechamento de MVP;
- repetir o roteiro antes de deploy;
- documentar criterios de bloqueio;
- registrar validacao tecnica e visual;
- evitar que o `PLANO_PROXIMOS_PASSOS.md` acumule historico granular de QA.

---

## 2. Escopo do MVP validado

O MVP considera como escopo:

- arvore familiar funcional;
- perfis de pessoa;
- administracao de pessoas;
- administracao de relacionamentos;
- solicitacoes de vinculos;
- arquivos historicos;
- forum basico;
- notificacoes internas/e-mail;
- timeline basica;
- insights persistidos;
- botao WhatsApp no frontend;
- grau de parentesco no escopo atual;
- favoritos de pessoa;
- pagina `/meus-favoritos`;
- exportacao de area visivel da arvore;
- legenda visual da arvore;
- categoria historica em arquivos historicos;
- `/minha-arvore` com dados conjugais salvos pelo botao geral;
- rotas dedicadas `/minha-arvore`, `/genealogia` e `/visao-completa`;
- headers internos padronizados;
- responsividade mobile/tablet.

---

## 3. Criterios de bloqueio

### P0 - bloqueia lancamento

- build quebrado;
- login quebrado;
- usuario comum acessa admin;
- admin nao acessa admin;
- arvore nao carrega;
- dados de pessoas nao salvam;
- relacionamento real e alterado indevidamente por usuario comum;
- arquivos historicos nao salvam apos migration necessaria;
- erro de RLS expondo dado sensivel;
- deploy exige secret versionado;
- migration obrigatoria ausente no remoto.

### P1 - avaliar bloqueio

- exportacao PNG/PDF falha em fluxo principal;
- notificacoes principais quebram;
- favoritos nao funcionam;
- perfil publico mostra dado privado;
- mobile tem overflow horizontal global em rota principal;
- admin essencial fica inutilizavel em desktop;
- calendario familiar quebra ao abrir;
- forum basico nao abre.

### P2 - nao bloqueia se documentado

- refinamento visual menor;
- texto/microcopy nao critico;
- melhoria pos-MVP;
- exportacao da arvore completa;
- push real;
- WhatsApp real por provider;
- timeline avancada;
- favoritos expandidos;
- mapa familiar;
- home dinamica.

---

## 4. Validacao tecnica obrigatoria

Antes de fechar MVP:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Criterios:

- build aprovado;
- testes unitarios aprovados;
- testes e2e aprovados;
- `git diff --check` sem erros;
- migrations locais/remotas alinhadas;
- worktree limpo ou com alteracoes esperadas;
- nenhum secret versionado;
- nenhum dump versionado;
- nenhum backup temporario versionado.

---

## 5. QA visual obrigatorio

Larguras obrigatorias:

```txt
320px
375px
390px
430px
768px
desktop
```

Criterio global:

```js
document.documentElement.scrollWidth > window.innerWidth
```

Resultado esperado:

```txt
false
```

Rotas principais para verificacao visual:

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

Documento de referencia:

```txt
docs/arquitetura/ROTAS_E_GUARDS.md
```

Validar:

- usuario deslogado acessa `/entrar`;
- usuario deslogado nao acessa `/minha-arvore`;
- usuario deslogado nao acessa `/admin`;
- usuario comum acessa `/meus-dados`;
- usuario comum acessa `/notificacoes`;
- usuario comum acessa `/forum`;
- usuario comum nao acessa `/admin`;
- admin acessa `/admin`;
- admin acessa `/admin/pessoas`;
- `/` redireciona para `/minha-arvore`;
- `/??pessoa=ID` redireciona para `/minha-arvore??pessoa=ID`;
- troca entre `/minha-arvore`, `/genealogia` e `/visao-completa` preserva `??pessoa=ID`.

---

## 7. QA da arvore

Validar em:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Checklist:

- arvore carrega;
- pessoa central aparece;
- zoom `+` funciona;
- zoom `-` funciona;
- pan/arraste funciona;
- clique em pessoa abre detalhe/perfil conforme esperado;
- anel conjugal abre modal;
- titulo fixo aparece uma unica vez;
- nao ha titulo duplicado dentro do layout;
- Minha Arvore nao abre minuscula;
- Genealogia usa zoom por largura;
- Visao Completa usa zoom por largura;
- Genealogia/Visao Completa permitem pan vertical;
- painel lateral abre e recolhe;
- nao ha botao duplicado de recolher painel.

---

## 8. QA de legendas, filtros e conectores

Validar aba **Legendas**.

### Linhas

- Conjugal oculta/exibe linhas conjugais;
- Pais/filhos oculta/exibe linhas parentais;
- Irmaos oculta/exibe linhas/trechos de irmaos quando suportado;
- Todas liga/desliga linhas controlaveis.

### Destacar

- Conjuges destaca apenas linhas conjugais visiveis;
- Pais/Filhos destaca apenas linhas parentais visiveis;
- Irmaos destaca trechos de irmaos visiveis;
- Todas destaca linhas visiveis.

Regra critica:

```txt
Destaque nao recria linha oculta.
```

### Filtros

- Vivos funciona;
- Falecidos funciona;
- Pets funciona;
- filtros de grupos funcionam;
- contadores nao mudam por destaque;
- cards nao somem por acao de linha.

---

## 9. QA de exportacao da arvore

Documento de referencia:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Validar:

- abrir Acoes;
- iniciar selecao de area;
- cancelar por botao;
- iniciar novamente;
- cancelar por `Esc`;
- selecionar area valida;
- exportar PNG pelo botao Salvar PNG;
- exportar PDF pelo botao Salvar PDF;
- imprimir;
- selecao pequena demais mostra erro/impede acao;
- pan/zoom bloqueiam durante selecao;
- pan/zoom voltam apos cancelar/concluir;
- controles, legenda, menus e overlay nao aparecem na exportacao.

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
- salvar endereco;
- salvar privacidade de telefone;
- salvar privacidade de data de nascimento;
- salvar redes sociais;
- ver perfil publico/interno;
- cards vazios de insights nao aparecem publicamente;
- texto `Conteudo ainda nao gerado.` nao aparece publicamente.

---

## 11. QA de vinculos e permissoes de pessoa

Validar:

- primeiro acesso;
- vinculo usuario-pessoa;
- usuario edita proprios dados se permitido;
- usuario sem permissao nao edita pessoa indevida;
- admin abre `/admin/pessoas/:id/editar`;
- card de usuarios vinculaveis carrega;
- usuarios ja vinculados nao aparecem;
- botao Recarregar funciona;
- erro de schema cache da RPC nao aparece;
- usuario comum nao cria relacionamento real diretamente;
- solicitacao de vinculo aparece no admin;
- aprovacao aplica alteracao real;
- rejeicao nao altera dado real.

---

## 12. QA de arquivos historicos e Storage

Validar:

- upload de imagem;
- upload de PDF;
- preview de imagem;
- card/icone de PDF;
- mensagem verde `Arquivo carregado`;
- input nativo oculto apos upload;
- campos e botoes Cancelar/Adicionar ocultos apos upload;
- botao Adicionar Arquivo reabre campos;
- titulo salva;
- descricao salva;
- ano salva;
- categoria historica salva;
- download funciona;
- remover arquivo funciona conforme permissao;
- arquivo de relacionamento usa `relacionamento_id`;
- base64 legado continua compativel.

Pre-requisito:

```txt
20260522121000_add_historical_file_event_category.sql
```

---

## 13. QA de notificacoes

Validar:

- `/notificacoes` abre;
- lista em cards aparece;
- estado vazio aparece quando aplicavel;
- marcar como lida;
- marcar todas como lidas;
- remover notificacao;
- `/ajustar-notificacoes` abre;
- toggles de preferencia salvam;
- `/admin/notificacoes` abre;
- rotina manual funciona em ambiente apropriado;
- e-mail real so funciona se provider/secrets estiverem configurados.

Regra:

```txt
Cron automatico depende de configuracao segura externa.
```

---

## 14. QA de calendario familiar

Validar:

- abrir `/calendario-familiar`;
- trocar mes;
- voltar mes;
- clicar em categorias da sidebar;
- contadores mostram `1 evento` e `N eventos`;
- aniversario no grid usa primeiro nome;
- lista de aniversariantes pode mostrar nome completo;
- descricao usa `Faz X anos`;
- nao aparece `item(ns)`;
- desktop e mobile sem overflow global.

Se Google Agenda foi afetado:

- conectar;
- sincronizar;
- desconectar;
- validar erros de token/permissao.

---

## 15. QA de forum

Validar:

- abrir `/forum`;
- criar topico;
- abrir topico;
- editar topico;
- responder/comentar se aplicavel;
- texto longo quebra linha;
- mobile nao quebra layout;
- acoes de moderacao respeitam permissao.

---

## 16. QA de favoritos

Validar:

- favoritar pessoa;
- remover favorito;
- abrir `/meus-favoritos`;
- buscar favorito;
- filtrar favorito;
- abrir pessoa favorita;
- isolamento por usuario.

---

## 17. QA de timeline e insights

Timeline:

- eventos aparecem no perfil;
- nascimento/falecimento aparecem quando ha dados;
- relacionamentos/filhos/arquivos aparecem quando aplicavel;
- eventos pessoais aparecem;
- estado vazio e adequado.

Insights:

- perfil le conteudo persistido;
- admin gera/regenera;
- erro aparece no admin quando aplicavel;
- perfil publico nao mostra cards vazios;
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
- solicitacoes de vinculos;
- notificacoes admin;
- integridade;
- atividades;
- diagnostico;
- importacao;
- migrar dados.

Regra:

```txt
/admin/migrar-dados e destrutiva e deve permanecer bloqueada em producao salvo variavel explicita e confirmacao textual.
```

---

## 19. QA pos-migration

Apos aplicar migration:

```bash
supabase migration list
npm run build
npm test
npm run test:e2e
git diff --check
```

Validar manualmente a tela afetada.

Exemplos:

- `categoria_evento` em arquivos historicos;
- RPC `admin_list_profiles_for_linking`;
- `site_visual_settings`;
- tabelas de notificacoes;
- tabelas de eventos pessoais.

---

## 20. Resultado esperado para fechamento

Para considerar MVP pronto:

- nenhum P0 aberto;
- P1 resolvido ou explicitamente aceito;
- build/test/e2e aprovados;
- QA visual principal aprovado;
- migrations alinhadas;
- documentacao canonica atualizada;
- pos-MVP separado do escopo de lancamento;
- deploy preparado.

---

## 21. Pos-MVP nao bloqueante

Nao bloqueia MVP:

- exportar arvore completa;
- push real;
- WhatsApp real por provider;
- fila/retry avancado;
- upload por evento;
- privacidade por evento;
- PDF da timeline;
- IA consultiva;
- comparador de perfis;
- mapa familiar;
- home dinamica;
- legenda configuravel;
- favoritos para outras entidades;
- Google Agenda com QA operacional ampliado.

---

## 22. Historico documental

Este arquivo deve receber checklists e resultados de QA final. O plano de proximos passos deve continuar focado em decisoes e pendencias, nao em logs longos de validacao.

Se este documento ficar muito grande, separar por data:

```txt
docs/historico/QA_FINAL_MVP_2026-05-29.md
docs/historico/QA_FINAL_MVP_YYYY-MM-DD.md
```
