# Plano de próximos passos - Árvore Família

> Última revisão: 2026-06-08  
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`  
> Projeto: `tuliust/arvorefamilia`

## Objetivo

Este documento define **o que falta fazer até o lançamento** e organiza o backlog pós-MVP do projeto **Árvore Família**.

Ele deve registrar pendências, critérios de bloqueio, QA final e próximos blocos. O estado consolidado do que já foi implementado fica em `docs/GUIA_IMPLEMENTACOES.md`.

Use também:

- `docs/README.md`: índice canônico da documentação;
- `docs/GUIA_IMPLEMENTACOES.md`: inventário do que já foi implementado;
- `docs/GUIA_COMPONENTES.md`: componentes e cuidados técnicos;
- `docs/GUIA_UX_LAYOUT.md`: decisões visuais e responsividade;
- `docs/GUIA_CORRECAO_ERROS.md`: troubleshooting por sintoma;
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas e guards;
- `docs/operacao/MIGRATIONS_SUPABASE.md`: banco, migrations e operação Supabase;
- `docs/funcionalidades/*.md`: documentação funcional específica.

---

## 1. Situação atual do MVP

As frentes funcionais principais do MVP estão implementadas. O foco atual é documentação, aplicação de migrations, QA visual/funcional e fechamento de pendências reais antes do deploy final.

| Frente | Status atual | Observação |
|---|---|---|
| Notificações | Concluída tecnicamente | Central em `/notificacoes`, preferências em `/ajustar-notificacoes`, notificações de fórum por menção/pessoa relacionada e e-mail via provider configurável. Cron automático depende de configuração segura externa. |
| Astrologia/acontecimentos | Concluída no escopo atual | Perfil apenas lê dados persistidos; geração/regeneração é ação admin. |
| Timeline | Implementada funcionalmente | `/minha-arvore/editar` agora tem área de Eventos da Vida; upload por evento, privacidade por evento e PDF ficam pós-MVP. |
| WhatsApp | Concluído no frontend | Privacidade forte/API/log seguro ficam pós-MVP. |
| Grau de parentesco | Consolidado funcionalmente | Integrações visuais avançadas ficam pós-MVP. |
| Exportação de área da árvore | Concluída | Exportação da árvore completa fica pós-MVP. |
| Legendas visuais | Concluída | Mantém filtros/camadas visuais; QA visual de regressão quando tokens mudarem. |
| Favoritos | Primeira camada aprovada | Reset admin remove favoritos da pessoa; expansão para outras entidades fica pós-MVP. |
| Responsividade mobile/tablet | Concluída no MVP | Revalidar rotas alteradas no fórum e árvore. |
| Headers e menu | Consolidado com QA visual recomendado | `UserProfileMenu` compartilhado com variante compacta no header da árvore. |
| Paletas da árvore | Concluídas | `white`, `orange` e `brown`, via CSS variables e `localStorage`. |
| `/minha-arvore` | Ajustada | Scroll externo bloqueado, título/cards reposicionados, borda extra removida, aliança na cor dos conectores. |
| `/minha-arvore/editar` | Atualizada | Foto pelo avatar superior, card `PETS`, filhos humanos, arquivos históricos com `+`, eventos da vida e modal de saída atualizado. |
| `/pessoa/:id` | Atualizada | Botão editar ao lado do favorito; `Inserir Informações` gera edição direta ou sugestão admin conforme permissão. |
| Admin de pessoas | Atualizado | Reset de perfil e botão de copiar ID implementados. |
| Relacionamento conjugal | Atualizado | Modal centralizado, texto de casamento refinado e fluxo de sugestão/admin. |
| Fórum | Atualizado | Criação com categorias em botões, pessoas relacionadas com busca, menções, notificações, badges, avatares e reações por ícone. |
| Reações do fórum | Atualizadas | Uma reação por pessoa por alvo, troca/remove, labels novos e migration de unicidade. |

---

## 2. Escopo congelado do MVP

O MVP deve ser fechado com:

- árvore familiar funcional;
- perfis de pessoa;
- administração de pessoas e relacionamentos;
- reset admin de perfil sem apagar parentescos;
- solicitações/sugestões moderadas pelo admin;
- arquivos históricos;
- fórum com categorias, menções, pessoas relacionadas, respostas, comentários e reações;
- notificações internas/e-mail;
- timeline básica e eventos da vida;
- insights persistidos;
- botão WhatsApp no frontend;
- grau de parentesco no escopo atual;
- favoritos de pessoa;
- página `/meus-favoritos`;
- exportação de área visível da árvore;
- legenda visual da árvore;
- categoria histórica em arquivos históricos;
- rotas dedicadas `/minha-arvore`, `/genealogia` e `/visao-completa`;
- Genealogia e Visão Completa mobile navegáveis por gerações/blocos;
- paletas visuais da árvore;
- headers internos padronizados;
- menu compartilhado do usuário;
- botão **Trocar Senha** na edição do próprio perfil;
- atalho **Personalizar Notificações**;
- responsividade mobile/tablet;
- QA final de lançamento.

Não incluir antes do lançamento:

- favoritos para novas entidades;
- push real;
- WhatsApp real por provider;
- fila/retry avançado;
- exportação da árvore completa;
- upload por evento da timeline;
- privacidade por evento;
- PDF da timeline;
- IA consultiva;
- comparador de perfis;
- mapa familiar;
- home dinâmica;
- versão administrativa/configurável da legenda.

---

## 3. Checklist técnico antes de qualquer etapa final

Executar antes de qualquer alteração de fechamento, documentação ou hotfix:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Regras:

- não iniciar ajustes amplos com build quebrado;
- não rodar `supabase db push` se não houver migration nova aprovada;
- não criar migration para ajuste puramente visual;
- não commitar secrets, dumps, tokens, backups ou arquivos temporários;
- não misturar pós-MVP com correções de lançamento;
- não expandir escopo funcional sem registrar neste plano;
- não deixar `test-results/`, `dist/` ou relatórios temporários entrarem no commit;
- não usar `git add .` para commits documentais ou hotfixes localizados.

---

## 4. Migrations a conferir antes do deploy

Conferir no Supabase remoto:

```txt
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
20260608143000_create_person_profile_suggestions.sql
20260608180000_enforce_single_forum_reaction.sql
```

Critérios:

- defaults booleanos de privacidade/contato em `pessoas` aplicados como `true`;
- RPC `admin_reset_person_profile` existe e não apaga relacionamentos;
- tabela/fluxo de sugestões de perfil existe;
- `forum_reacoes` possui unicidade por `user_id, alvo_tipo, alvo_id`;
- duplicidades antigas de reações foram tratadas pela migration;
- `supabase migration list` não indica divergência inesperada.

---

## 5. QA visual e funcional obrigatório

### 5.1 Rotas prioritárias

```txt
/
/minha-arvore
/genealogia
/visao-completa
/minha-arvore/editar
/pessoa/:id
/admin/pessoas
/admin/pessoas/:id/editar
/admin/solicitacoes-vinculos
/forum
/forum/novo
/forum/topico/:id
/notificacoes
/ajustar-notificacoes
/calendario-familiar
/meus-favoritos
/admin/notificacoes
/admin/integridade
```

### 5.2 Larguras obrigatórias

```txt
320px
375px
390px
430px
768px
desktop
```

### 5.3 Checklist da árvore

Verificar:

- `/minha-arvore` sem scroll externo da página;
- pan/zoom interno do ReactFlow preservado;
- título e cards confortáveis, sem corte superior;
- borda extra do card principal ausente;
- aliança visível e na cor dos conectores;
- paletas `white`, `orange` e `brown`;
- `/genealogia` e `/visao-completa` mobile com chips;
- pan vertical/horizontal nas views por geração;
- botão conjugal abre modal;
- legendas e destaques de linhas sem regressão.

### 5.4 Checklist de `/minha-arvore/editar`

Verificar:

- botão **Sair** ausente do header;
- botões internos **Alterar** e **Remover** foto ausentes;
- edição de foto pelo avatar superior;
- card **FILHOS** conta apenas humanos;
- card **PETS** aparece corretamente;
- modal de saída sem salvar mostra **Deseja sair sem salvar os ajustes?**;
- arquivos históricos sem título duplicado;
- botão `+` acima de **Nenhum arquivo histórico adicionado.**;
- seção **Eventos da Vida** com eventos derivados e manuais;
- **Trocar Senha** funcionando.

### 5.5 Checklist de pessoa/admin

Verificar:

- `/admin/pessoas` com botão de copiar ID;
- ID copiado é `pessoas.id`;
- reset de perfil exige confirmação e não apaga relações familiares;
- reset remove foto/astrologia/favoritos e retorna preferências para `true`;
- `/pessoa/:id` mostra editar ao lado do favorito apenas para admin/responsável/próprio usuário;
- **Inserir Informações** abre edição direta quando permitido;
- usuário sem permissão gera sugestão;
- sugestão aparece em `/admin/solicitacoes-vinculos`.

### 5.6 Checklist do relacionamento conjugal

Verificar:

- título do modal centralizado;
- botão `X` alinhado;
- texto **foram casados** quando aplicável;
- subtítulo com data/local quando houver dados;
- botão **Inserir Informações**;
- arquivos históricos do relacionamento por `+`;
- usuário sem permissão gera sugestão/admin;
- admin/responsável edita conforme regra.

### 5.7 Checklist do fórum

Verificar `/forum/novo`:

- dropdown **Tipo** removido;
- categoria em botões quadrados;
- categoria selecionada com background distinto;
- dropdown de pessoas relacionadas com busca;
- clique fora fecha dropdown;
- aviso **Digite @ para marcar alguém na publicação**;
- pessoa mencionada/relacionada recebe notificação quando permitido.

Verificar `/forum/topico/:id`:

- botão **Ocultar** removido do header;
- categoria/tipo/status como badges pequenas;
- avatares no tópico, respostas e comentários;
- respostas sem **Marcar solução** e **Ocultar**;
- menções `@` em negrito e link para `/pessoa/:id`;
- reações por ícone;
- labels: **Amei**, **Apoiar**, **Orações**, **Parabéns**;
- apenas uma reação por pessoa por alvo;
- clicar na mesma reação remove;
- clicar em outra reação substitui;
- `Flower2` aparece em **Orações**.

### 5.8 Checklist de notificações

Verificar:

- menção `@` gera notificação interna;
- pessoa relacionada gera notificação interna;
- autor não recebe notificação da própria publicação;
- duplicidade entre menção e relação é deduplicada;
- preferência `receber_avisos_gerais` controla avisos gerais/publicações;
- falha de notificação não impede criação do tópico;
- `/notificacoes` lista as notificações;
- `/ajustar-notificacoes` salva preferências.

---

## 6. Critérios de bloqueio para lançamento

Bloqueiam lançamento:

- build quebrado;
- testes essenciais quebrados;
- login quebrado;
- usuário comum acessa admin;
- usuário comum altera dado restrito diretamente;
- reset de perfil apaga relações familiares;
- perda/corrupção de dados;
- secret no frontend ou no repositório;
- árvore principal não carrega;
- formulário principal não salva;
- upload falha em fluxo essencial;
- notificações duplicam de forma massiva;
- RLS libera escrita indevida;
- responsividade impede uso em mobile;
- Genealogia/Visão Completa exibem título duplicado;
- painel lateral impede uso da árvore;
- viewport inicial torna a árvore inutilizável;
- migration obrigatória ausente em ambiente final;
- reações do fórum duplicam por ausência de constraint;
- fórum quebra build por ícone inexistente.

Não bloqueiam lançamento, se documentados:

- refinamentos visuais pequenos;
- expansão de favoritos;
- árvore completa em PDF;
- push real;
- WhatsApp real;
- timeline avançada;
- IA consultiva;
- filtros avançados do admin integridade;
- limpeza auditada de legado/base64;
- revisão de scripts legados.

---

## 7. Pendências P1 antes do fechamento final

### P1.1 Documentação

Atualizar/substituir os documentos revisados em `docs/`:

```txt
README.md
GUIA_IMPLEMENTACOES.md
GUIA_COMPONENTES.md
GUIA_UX_LAYOUT.md
GUIA_CORRECAO_ERROS.md
PLANO_PROXIMOS_PASSOS.md
funcionalidades/MINHA_ARVORE_VIEW.md
funcionalidades/MINHA_ARVORE_EDITAR.md
funcionalidades/PESSOAS_PERFIL_ADMIN.md
funcionalidades/NOTIFICACOES.md
funcionalidades/FORUM.md
arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
operacao/MIGRATIONS_SUPABASE.md
```

### P1.2 QA das migrations

- aplicar migrations pendentes no ambiente final;
- confirmar `supabase migration list`;
- testar reset de perfil;
- testar sugestão de perfil;
- testar reação única do fórum.

### P1.3 QA visual final

- validar árvore nas três paletas;
- validar fórum em mobile;
- validar `/minha-arvore/editar`;
- validar modal conjugal;
- validar notificações.

---

## 8. Pós-MVP imediato

| Frente | Implementação |
|---|---|
| Favoritos expandidos | Arquivos históricos, fórum, relacionamentos, eventos pessoais/timeline. |
| WhatsApp avançado | Privacidade forte em banco/API e log seguro de clique. |
| Notificações avançadas | Push real, WhatsApp real, fila/retry avançado. |
| Timeline avançada | Upload por evento, privacidade por evento, PDF. |
| Exportação avançada | Exportar árvore completa, não só viewport visível. |
| Parentesco avançado | Integração direta na árvore, Genealogia e Visão Completa. |
| Insights avançados | Backlog editorial, privacidade refinada e novos tipos de conteúdo. |
| Fórum avançado | Moderação ampliada, busca refinada, anexos e filtros mais completos. |
| Home dinâmica | Aniversários, memórias do dia, novidades e destaques. |

---

## 9. Pós-MVP técnico

| Frente | Implementação |
|---|---|
| Refatoração da Home | Continuar extração incremental apenas em blocos seguros. |
| Página MinhaArvore | Refatorar progressivamente `src/app/pages/MinhaArvore.tsx`. |
| AdminPessoaForm | Dividir formulário admin em blocos menores. |
| FamilyTree | Refatorações conservadoras, sempre com QA visual. |
| ForumTopico | Extrair `ReactionBar`, `AuthorAvatar`, badges e menções para componentes dedicados se o arquivo crescer. |
| ForumNovoTopico | Extrair seletor de categorias e dropdown de pessoas relacionadas. |
| Storage | Verificar e prevenir uploads órfãos. |
| Base legada | Dry-run de Storage/base64 e possível limpeza auditada. |
| Admin Integridade | Filtros por severidade, paginação e ações assistidas futuras. |
| Logs | Remover ruídos técnicos de metadata se confirmados. |
| Migrations | Manter `docs/operacao/MIGRATIONS_SUPABASE.md` atualizado. |

---

## 10. Manutenção documental

Para evitar repetição:

- este plano deve manter apenas pendências, critérios e backlog;
- histórico detalhado de QA antigo deve ir para `docs/historico/`;
- decisões de UX ficam em `docs/GUIA_UX_LAYOUT.md`;
- estado implementado fica em `docs/GUIA_IMPLEMENTACOES.md`;
- troubleshooting fica em `docs/GUIA_CORRECAO_ERROS.md`;
- migrations ficam em `docs/operacao/MIGRATIONS_SUPABASE.md`;
- rotas/guards ficam em `docs/arquitetura/ROTAS_E_GUARDS.md`;
- comportamento detalhado do fórum deve ficar em `docs/funcionalidades/FORUM.md`.

---

## 11. Comandos para commit documental final

Quando todos os arquivos revisados forem substituídos:

```bash
git status --short
git diff --check
npm run build
```

Commit sugerido:

```bash
git add docs/README.md docs/GUIA_IMPLEMENTACOES.md docs/GUIA_COMPONENTES.md docs/GUIA_UX_LAYOUT.md docs/GUIA_CORRECAO_ERROS.md docs/PLANO_PROXIMOS_PASSOS.md
git add docs/funcionalidades/MINHA_ARVORE_VIEW.md docs/funcionalidades/MINHA_ARVORE_EDITAR.md docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md docs/funcionalidades/NOTIFICACOES.md docs/funcionalidades/FORUM.md
git add docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md docs/operacao/MIGRATIONS_SUPABASE.md
git commit -m "docs: update profile tree and forum documentation"
git pull --rebase origin main
git push origin main
```

Não usar `git add .`.
