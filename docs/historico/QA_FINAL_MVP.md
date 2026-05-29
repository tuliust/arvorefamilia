# QA Final MVP

> Local recomendado: `docs/historico/QA_FINAL_MVP.md`  
> Tipo: checklist histórico e operacional de validação final do MVP.

---

## 1. Objetivo

Este documento consolida o checklist de QA final do MVP do projeto **Árvore Família**.

Use para:

- validar fechamento de MVP;
- repetir o roteiro antes de deploy;
- documentar critérios de bloqueio;
- registrar validação técnica e visual;
- evitar que o `PLANO_PROXIMOS_PASSOS.md` acumule histórico granular de QA.

---

## 2. Escopo do MVP validado

O MVP considera como escopo:

- árvore familiar funcional;
- perfis de pessoa;
- administração de pessoas;
- administração de relacionamentos;
- solicitações de vínculos;
- arquivos históricos;
- fórum básico;
- notificações internas/e-mail;
- timeline básica;
- insights persistidos;
- botão WhatsApp no frontend;
- grau de parentesco no escopo atual;
- favoritos de pessoa;
- página `/meus-favoritos`;
- exportação de área visível da árvore;
- legenda visual da árvore;
- categoria histórica em arquivos históricos;
- `/minha-arvore` com dados conjugais salvos pelo botão geral;
- rotas dedicadas `/minha-arvore`, `/genealogia` e `/visao-completa`;
- headers internos padronizados;
- responsividade mobile/tablet.

---

## 3. Critérios de bloqueio

### P0 — bloqueia lançamento

- build quebrado;
- login quebrado;
- usuário comum acessa admin;
- admin não acessa admin;
- árvore não carrega;
- dados de pessoas não salvam;
- relacionamento real é alterado indevidamente por usuário comum;
- arquivos históricos não salvam após migration necessária;
- erro de RLS expondo dado sensível;
- deploy exige secret versionado;
- migration obrigatória ausente no remoto.

### P1 — avaliar bloqueio

- exportação PNG/PDF falha em fluxo principal;
- notificações principais quebram;
- favoritos não funcionam;
- perfil público mostra dado privado;
- mobile tem overflow horizontal global em rota principal;
- admin essencial fica inutilizável em desktop;
- calendário familiar quebra ao abrir;
- fórum básico não abre.

### P2 — não bloqueia se documentado

- refinamento visual menor;
- texto/microcopy não crítico;
- melhoria pós-MVP;
- exportação da árvore completa;
- push real;
- WhatsApp real por provider;
- timeline avançada;
- favoritos expandidos;
- mapa familiar;
- home dinâmica.

---

## 4. Validação técnica obrigatória

Antes de fechar MVP:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Critérios:

- build aprovado;
- testes unitários aprovados;
- testes e2e aprovados;
- `git diff --check` sem erros;
- migrations locais/remotas alinhadas;
- worktree limpo ou com alterações esperadas;
- nenhum secret versionado;
- nenhum dump versionado;
- nenhum backup temporário versionado.

---

## 5. QA visual obrigatório

Larguras obrigatórias:

```txt
320px
375px
390px
430px
768px
desktop
```

Critério global:

```js
document.documentElement.scrollWidth > window.innerWidth
```

Resultado esperado:

```txt
false
```

Rotas principais para verificação visual:

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

- usuário deslogado acessa `/entrar`;
- usuário deslogado não acessa `/minha-arvore`;
- usuário deslogado não acessa `/admin`;
- usuário comum acessa `/meus-dados`;
- usuário comum acessa `/notificacoes`;
- usuário comum acessa `/forum`;
- usuário comum não acessa `/admin`;
- admin acessa `/admin`;
- admin acessa `/admin/pessoas`;
- `/` redireciona para `/minha-arvore`;
- `/?pessoa=ID` redireciona para `/minha-arvore?pessoa=ID`;
- troca entre `/minha-arvore`, `/genealogia` e `/visao-completa` preserva `?pessoa=ID`.

---

## 7. QA da árvore

Validar em:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Checklist:

- árvore carrega;
- pessoa central aparece;
- zoom `+` funciona;
- zoom `-` funciona;
- pan/arraste funciona;
- clique em pessoa abre detalhe/perfil conforme esperado;
- anel conjugal abre modal;
- título fixo aparece uma única vez;
- não há título duplicado dentro do layout;
- Minha Árvore não abre minúscula;
- Genealogia usa zoom por largura;
- Visão Completa usa zoom por largura;
- Genealogia/Visão Completa permitem pan vertical;
- painel lateral abre e recolhe;
- não há botão duplicado de recolher painel.

---

## 8. QA de legendas, filtros e conectores

Validar aba **Legendas**.

### Linhas

- Conjugal oculta/exibe linhas conjugais;
- Pais/filhos oculta/exibe linhas parentais;
- Irmãos oculta/exibe linhas/trechos de irmãos quando suportado;
- Todas liga/desliga linhas controláveis.

### Destacar

- Cônjuges destaca apenas linhas conjugais visíveis;
- Pais/Filhos destaca apenas linhas parentais visíveis;
- Irmãos destaca trechos de irmãos visíveis;
- Todas destaca linhas visíveis.

Regra crítica:

```txt
Destaque não recria linha oculta.
```

### Filtros

- Vivos funciona;
- Falecidos funciona;
- Pets funciona;
- filtros de grupos funcionam;
- contadores não mudam por destaque;
- cards não somem por ação de linha.

---

## 9. QA de exportação da árvore

Validar:

- abrir Ações;
- iniciar seleção de área;
- cancelar por botão;
- iniciar novamente;
- cancelar por `Esc`;
- selecionar área válida;
- exportar PNG;
- exportar PDF;
- imprimir;
- seleção pequena demais mostra erro/impede ação;
- pan/zoom bloqueiam durante seleção;
- pan/zoom voltam após cancelar/concluir;
- controles, legenda, menus e overlay não aparecem na exportação.

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
- salvar endereço;
- salvar privacidade de telefone;
- salvar privacidade de data de nascimento;
- salvar redes sociais;
- ver perfil público/interno;
- cards vazios de insights não aparecem publicamente;
- texto `Conteúdo ainda não gerado.` não aparece publicamente.

---

## 11. QA de vínculos e permissões de pessoa

Validar:

- primeiro acesso;
- vínculo usuário-pessoa;
- usuário edita próprios dados se permitido;
- usuário sem permissão não edita pessoa indevida;
- admin abre `/admin/pessoas/:id/editar`;
- card de usuários vinculáveis carrega;
- usuários já vinculados não aparecem;
- botão Recarregar funciona;
- erro de schema cache da RPC não aparece;
- usuário comum não cria relacionamento real diretamente;
- solicitação de vínculo aparece no admin;
- aprovação aplica alteração real;
- rejeição não altera dado real.

---

## 12. QA de arquivos históricos e Storage

Validar:

- upload de imagem;
- upload de PDF;
- preview de imagem;
- card/ícone de PDF;
- mensagem verde `✓ Arquivo carregado`;
- input nativo oculto após upload;
- campos e botões Cancelar/Adicionar ocultos após upload;
- botão Adicionar Arquivo reabre campos;
- título salva;
- descrição salva;
- ano salva;
- categoria histórica salva;
- download funciona;
- remover arquivo funciona conforme permissão;
- arquivo de relacionamento usa `relacionamento_id`;
- base64 legado continua compatível.

Pré-requisito:

```txt
20260522121000_add_historical_file_event_category.sql
```

---

## 13. QA de notificações

Validar:

- `/notificacoes` abre;
- lista em cards aparece;
- estado vazio aparece quando aplicável;
- marcar como lida;
- marcar todas como lidas;
- remover notificação;
- `/ajustar-notificacoes` abre;
- toggles de preferência salvam;
- `/admin/notificacoes` abre;
- rotina manual funciona em ambiente apropriado;
- e-mail real só funciona se provider/secrets estiverem configurados.

Regra:

```txt
Cron automático depende de configuração segura externa.
```

---

## 14. QA de calendário familiar

Validar:

- abrir `/calendario-familiar`;
- trocar mês;
- voltar mês;
- clicar em categorias da sidebar;
- contadores mostram `1 evento` e `N eventos`;
- aniversário no grid usa primeiro nome;
- lista de aniversariantes pode mostrar nome completo;
- descrição usa `Faz X anos`;
- não aparece `item(ns)`;
- desktop e mobile sem overflow global.

Se Google Agenda foi afetado:

- conectar;
- sincronizar;
- desconectar;
- validar erros de token/permissão.

---

## 15. QA de fórum

Validar:

- abrir `/forum`;
- criar tópico;
- abrir tópico;
- editar tópico;
- responder/comentar se aplicável;
- texto longo quebra linha;
- mobile não quebra layout;
- ações de moderação respeitam permissão.

---

## 16. QA de favoritos

Validar:

- favoritar pessoa;
- remover favorito;
- abrir `/meus-favoritos`;
- buscar favorito;
- filtrar favorito;
- abrir pessoa favorita;
- isolamento por usuário.

---

## 17. QA de timeline e insights

Timeline:

- eventos aparecem no perfil;
- nascimento/falecimento aparecem quando há dados;
- relacionamentos/filhos/arquivos aparecem quando aplicável;
- eventos pessoais aparecem;
- estado vazio é adequado.

Insights:

- perfil lê conteúdo persistido;
- admin gera/regenera;
- erro aparece no admin quando aplicável;
- perfil público não mostra cards vazios;
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
- solicitações de vínculos;
- notificações admin;
- integridade;
- atividades;
- diagnóstico;
- importação;
- migrar dados.

Regra:

```txt
/admin/migrar-dados é destrutiva e deve permanecer bloqueada em produção salvo variável explícita e confirmação textual.
```

---

## 19. QA pós-migration

Após aplicar migration:

```bash
supabase migration list
npm run build
npm test
npm run test:e2e
git diff --check
```

Validar manualmente a tela afetada.

Exemplos:

- `categoria_evento` em arquivos históricos;
- RPC `admin_list_profiles_for_linking`;
- `site_visual_settings`;
- tabelas de notificações;
- tabelas de eventos pessoais.

---

## 20. Resultado esperado para fechamento

Para considerar MVP pronto:

- nenhum P0 aberto;
- P1 resolvido ou explicitamente aceito;
- build/test/e2e aprovados;
- QA visual principal aprovado;
- migrations alinhadas;
- documentação canônica atualizada;
- pós-MVP separado do escopo de lançamento;
- deploy preparado.

---

## 21. Pós-MVP não bloqueante

Não bloqueia MVP:

- exportar árvore completa;
- push real;
- WhatsApp real por provider;
- fila/retry avançado;
- upload por evento;
- privacidade por evento;
- PDF da timeline;
- IA consultiva;
- comparador de perfis;
- mapa familiar;
- home dinâmica;
- legenda configurável;
- favoritos para outras entidades;
- Google Agenda com QA operacional ampliado.

---

## 22. Histórico documental

Este arquivo deve receber checklists e resultados de QA final. O plano de próximos passos deve continuar focado em decisões e pendências, não em logs longos de validação.

Se este documento ficar muito grande, separar por data:

```txt
docs/historico/QA_FINAL_MVP_2026-05-29.md
docs/historico/QA_FINAL_MVP_YYYY-MM-DD.md
```
