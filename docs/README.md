# DocumentaÃ§Ã£o â€” Ãrvore FamÃ­lia

> Ãndice canÃ´nico da documentaÃ§Ã£o do projeto `tuliust/arvorefamilia`.

Este diretÃ³rio concentra a documentaÃ§Ã£o tÃ©cnica e funcional do projeto **Ãrvore FamÃ­lia**.

Use este arquivo como ponto de entrada antes de consultar documentos antigos, histÃ³ricos ou arquivos soltos na raiz do repositÃ³rio.

---

## 1. Guias oficiais

Os guias oficiais ficam na raiz de `docs/` e devem ser tratados como documentaÃ§Ã£o canÃ´nica.

| Arquivo | Quando usar |
|---|---|
| `GUIA_IMPLEMENTACOES.md` | Consultar o estado consolidado do que jÃ¡ foi implementado, decisÃµes tÃ©cnicas e frentes concluÃ­das. |
| `GUIA_COMPONENTES.md` | Localizar componentes reutilizÃ¡veis, responsabilidades, props, padrÃµes de uso e cuidados contra regressÃµes. |
| `GUIA_UX_LAYOUT.md` | Orientar decisÃµes visuais, responsividade, headers, containers, Ã¡rvore, painel lateral e microcopy. |
| `GUIA_CORRECAO_ERROS.md` | Investigar falhas por sintoma, build quebrado, permissÃµes, RLS, Storage, formulÃ¡rios, Ã¡rvore e regressÃµes. |
| `PLANO_PROXIMOS_PASSOS.md` | Acompanhar fechamento de MVP, critÃ©rios de bloqueio, QA final e backlog pÃ³s-MVP. |

---

## 2. Arquitetura

Documentos de arquitetura ficam em `docs/arquitetura/`.

| Arquivo | Quando usar |
|---|---|
| `arquitetura/ROTAS_E_GUARDS.md` | Consultar rotas pÃºblicas, rotas de membro, rotas administrativas, guards de acesso e regras de navegaÃ§Ã£o. |

Arquivos complementares ainda podem existir na raiz do repositÃ³rio:

| Arquivo | Uso |
|---|---|
| `ARCHITECTURE.md` | VisÃ£o sintÃ©tica da arquitetura atual do projeto. |
| `DEPLOYMENT.md` | Deploy, variÃ¡veis de ambiente, Supabase e observaÃ§Ãµes operacionais. |

Se houver divergÃªncia entre um documento antigo e os guias em `docs/`, prevalece a documentaÃ§Ã£o canÃ´nica em `docs/`.

---

## 3. Funcionalidades especÃ­ficas

Documentos de funcionalidades ficam em `docs/funcionalidades/`.

| Arquivo | Escopo |
|---|---|
| `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Legenda visual, conectores, painel lateral, filtros de linhas e camadas visuais da Ã¡rvore. |
| `funcionalidades/CALENDARIO_FAMILIAR.md` | CalendÃ¡rio familiar, datas familiares, categorias, sidebar, filtros e ajustes de exibiÃ§Ã£o. |
| `funcionalidades/EXPORTACAO_ARVORE.md` | ExportaÃ§Ã£o de Ã¡rea visÃ­vel da Ã¡rvore em PNG/PDF/impressÃ£o e seleÃ§Ã£o retangular. |
| `funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` | Regras especÃ­ficas da Minha Ãrvore, filtros diretos, pets e regras de exibiÃ§Ã£o. |
| `funcionalidades/MINHA_ARVORE_VIEW.md` | Layout, viewport, ReactFlow e comportamento da view Minha Ãrvore. |
| `funcionalidades/NOTIFICACOES.md` | NotificaÃ§Ãµes internas/e-mail, preferÃªncias, logs, Edge Functions, rotina diÃ¡ria e cron seguro. |
| `funcionalidades/PESSOAS_PERFIL_ADMIN.md` | Perfil pÃºblico, admin de pessoa, dados pessoais, privacidade, vÃ­nculos e ediÃ§Ã£o. |
| `funcionalidades/TIMELINE.md` | Linha do tempo, eventos derivados, eventos pessoais e evoluÃ§Ã£o pÃ³s-MVP. |

---

## 4. OperaÃ§Ã£o e manutenÃ§Ã£o

Documentos operacionais ficam em `docs/operacao/`.

| Arquivo | Quando usar |
|---|---|
| `operacao/README.md` | Ãndice da pasta de operaÃ§Ã£o e manutenÃ§Ã£o. |
| `operacao/STORAGE_MAINTENANCE.md` | ManutenÃ§Ã£o controlada de Storage, dry-run, Ã³rfÃ£os e auditoria. |
| `operacao/MIGRATIONS_SUPABASE.md` | Fluxo de migrations, Supabase, `db push`, scripts SQL legados e seguranÃ§a operacional. |

Regras operacionais de banco:

- `supabase/migrations` Ã© a fonte da verdade do schema.
- Scripts SQL soltos sÃ£o histÃ³ricos ou operacionais.
- NÃ£o aplicar SQL legado como schema principal de ambiente novo.
- NÃ£o rodar `supabase db push` sem revisar `supabase migration list`.
- NÃ£o versionar secrets, dumps, tokens ou service role.

---

## 5. Comandos e checklists tÃ©cnicos

Documentos de comandos ficam em `docs/comandos/`.

| Arquivo | Uso |
|---|---|
| `comandos/GIT_RESPONSIVIDADE.md` | Comandos, checkpoints e histÃ³rico tÃ©cnico da frente de responsividade. |

---

## 6. HistÃ³rico, diagnÃ³sticos e QA

Documentos histÃ³ricos ficam em `docs/historico/`.

Esses arquivos sÃ£o referÃªncia histÃ³rica, diagnÃ³stico pontual ou checklist de uma fase especÃ­fica. Eles **nÃ£o substituem os guias oficiais**.

| Arquivo/pasta | Uso |
|---|---|
| `historico/README.md` | Ãndice da pasta histÃ³rica. |
| `historico/DIAGNOSTICO_DOCUMENTACAO_ATUAL.md` | DiagnÃ³stico de documentaÃ§Ã£o em uma fase especÃ­fica. |
| `historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` | DiagnÃ³stico histÃ³rico da frente de exportaÃ§Ã£o da Ã¡rvore. |
| `historico/QA_7_6_EXPORTACAO_ARVORE.md` | QA histÃ³rico da frente de exportaÃ§Ã£o da Ã¡rvore. |
| `historico/RESPONSIVIDADE_MOBILE_TABLET.md` | Checklist/histÃ³rico da frente de responsividade. |
| `historico/documentacao-antiga/` | Documentos antigos movidos da raiz do repositÃ³rio. |

---

## 7. Como decidir onde documentar

| Tipo de informaÃ§Ã£o | Destino correto |
|---|---|
| Estado consolidado de uma frente implementada | `GUIA_IMPLEMENTACOES.md` |
| PadrÃ£o visual, comportamento responsivo ou microcopy | `GUIA_UX_LAYOUT.md` |
| Componente, props, cuidados de uso e anti-regressÃ£o | `GUIA_COMPONENTES.md` |
| Erro, sintoma, causa provÃ¡vel e correÃ§Ã£o | `GUIA_CORRECAO_ERROS.md` |
| PendÃªncia, bloqueio, QA final ou pÃ³s-MVP | `PLANO_PROXIMOS_PASSOS.md` |
| Rota, guard, permissÃ£o de acesso ou navegaÃ§Ã£o | `arquitetura/ROTAS_E_GUARDS.md` |
| Migration, Supabase, schema, SQL legado ou `db push` | `operacao/MIGRATIONS_SUPABASE.md` |
| Comportamento detalhado de funcionalidade especÃ­fica | `funcionalidades/<NOME_DA_FUNCIONALIDADE>.md` |
| DiagnÃ³stico antigo, relatÃ³rio pontual ou QA de fase | `historico/` |

---

## 8. Regras de organizaÃ§Ã£o

1. Guias oficiais ficam na raiz de `docs/`.
2. Funcionalidades especÃ­ficas ficam em `docs/funcionalidades/`.
3. Procedimentos operacionais ficam em `docs/operacao/`.
4. Arquitetura fica em `docs/arquitetura/`.
5. Comandos auxiliares e checklists pontuais ficam em `docs/comandos/`.
6. DiagnÃ³sticos, relatÃ³rios antigos, QA e documentos de fase ficam em `docs/historico/`.
7. Documentos antigos da raiz do repositÃ³rio devem ficar em `docs/historico/documentacao-antiga/`.
8. Scripts SQL soltos sÃ£o histÃ³ricos ou operacionais; a fonte da verdade do banco deve continuar sendo `supabase/migrations`.
9. Documentos histÃ³ricos devem ser identificados como histÃ³ricos para evitar uso como fonte canÃ´nica.
10. Quando uma informaÃ§Ã£o couber em mais de um arquivo, mantenha o detalhe tÃ©cnico em apenas um lugar e use links cruzados nos demais.

---

## 9. Checklist antes de criar nova documentaÃ§Ã£o

Antes de criar um novo `.md`, verificar:

- se o tema jÃ¡ estÃ¡ coberto por um guia oficial;
- se o conteÃºdo Ã© funcional, operacional, arquitetural ou histÃ³rico;
- se o novo documento evita duplicidade;
- se hÃ¡ links cruzados para os guias relacionados;
- se o documento deixa claro o que Ã© canÃ´nico, histÃ³rico ou pÃ³s-MVP.
