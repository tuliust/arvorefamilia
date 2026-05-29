# Documentação — Árvore Família

> Índice canônico da documentação do projeto `tuliust/arvorefamilia`.

Este diretório concentra a documentação técnica e funcional do projeto **Árvore Família**.

Use este arquivo como ponto de entrada antes de consultar documentos antigos, históricos ou arquivos soltos na raiz do repositório.

---

## 1. Guias oficiais

Os guias oficiais ficam na raiz de `docs/` e devem ser tratados como documentação canônica.

| Arquivo | Quando usar |
|---|---|
| `GUIA_IMPLEMENTACOES.md` | Consultar o estado consolidado do que já foi implementado, decisões técnicas e frentes concluídas. |
| `GUIA_COMPONENTES.md` | Localizar componentes reutilizáveis, responsabilidades, props, padrões de uso e cuidados contra regressões. |
| `GUIA_UX_LAYOUT.md` | Orientar decisões visuais, responsividade, headers, containers, árvore, painel lateral e microcopy. |
| `GUIA_CORRECAO_ERROS.md` | Investigar falhas por sintoma, build quebrado, permissões, RLS, Storage, formulários, árvore e regressões. |
| `PLANO_PROXIMOS_PASSOS.md` | Acompanhar fechamento de MVP, critérios de bloqueio, QA final e backlog pós-MVP. |

---

## 2. Arquitetura

Documentos de arquitetura ficam em `docs/arquitetura/`.

| Arquivo | Quando usar |
|---|---|
| `arquitetura/ROTAS_E_GUARDS.md` | Consultar rotas públicas, rotas de membro, rotas administrativas, guards de acesso e regras de navegação. |

Arquivos complementares ainda podem existir na raiz do repositório:

| Arquivo | Uso |
|---|---|
| `ARCHITECTURE.md` | Visão sintética da arquitetura atual do projeto. |
| `DEPLOYMENT.md` | Deploy, variáveis de ambiente, Supabase e observações operacionais. |

Se houver divergência entre um documento antigo e os guias em `docs/`, prevalece a documentação canônica em `docs/`.

---

## 3. Funcionalidades específicas

Documentos de funcionalidades ficam em `docs/funcionalidades/`.

| Arquivo | Escopo |
|---|---|
| `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Legenda visual, conectores, painel lateral, filtros de linhas e camadas visuais da árvore. |
| `funcionalidades/CALENDARIO_FAMILIAR.md` | Calendário familiar, datas familiares, categorias, sidebar, filtros e ajustes de exibição. |
| `funcionalidades/EXPORTACAO_ARVORE.md` | Exportação de área visível da árvore em PNG/PDF/impressão e seleção retangular. |
| `funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` | Regras específicas da Minha Árvore, filtros diretos, pets e regras de exibição. |
| `funcionalidades/MINHA_ARVORE_VIEW.md` | Layout, viewport, ReactFlow e comportamento da view Minha Árvore. |
| `funcionalidades/NOTIFICACOES.md` | Notificações internas/e-mail, preferências, logs, Edge Functions, rotina diária e cron seguro. |
| `funcionalidades/PESSOAS_PERFIL_ADMIN.md` | Perfil público, admin de pessoa, dados pessoais, privacidade, vínculos e edição. |
| `funcionalidades/TIMELINE.md` | Linha do tempo, eventos derivados, eventos pessoais e evolução pós-MVP. |

---

## 4. Operação e manutenção

Documentos operacionais ficam em `docs/operacao/`.

| Arquivo | Quando usar |
|---|---|
| `operacao/README.md` | Índice da pasta de operação e manutenção. |
| `operacao/STORAGE_MAINTENANCE.md` | Manutenção controlada de Storage, dry-run, órfãos e auditoria. |
| `operacao/MIGRATIONS_SUPABASE.md` | Fluxo de migrations, Supabase, `db push`, scripts SQL legados e segurança operacional. |

Regras operacionais de banco:

- `supabase/migrations` é a fonte da verdade do schema.
- Scripts SQL soltos são históricos ou operacionais.
- Não aplicar SQL legado como schema principal de ambiente novo.
- Não rodar `supabase db push` sem revisar `supabase migration list`.
- Não versionar secrets, dumps, tokens ou service role.

---

## 5. Comandos e checklists técnicos

Documentos de comandos ficam em `docs/comandos/`.

| Arquivo | Uso |
|---|---|
| `comandos/GIT_RESPONSIVIDADE.md` | Comandos, checkpoints e histórico técnico da frente de responsividade. |

---

## 6. Histórico, diagnósticos e QA

Documentos históricos ficam em `docs/historico/`.

Esses arquivos são referência histórica, diagnóstico pontual ou checklist de uma fase específica. Eles **não substituem os guias oficiais**.

| Arquivo/pasta | Uso |
|---|---|
| `historico/README.md` | Índice da pasta histórica. |
| `historico/DIAGNOSTICO_DOCUMENTACAO_ATUAL.md` | Diagnóstico de documentação em uma fase específica. |
| `historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` | Diagnóstico histórico da frente de exportação da árvore. |
| `historico/QA_7_6_EXPORTACAO_ARVORE.md` | QA histórico da frente de exportação da árvore. |
| `historico/RESPONSIVIDADE_MOBILE_TABLET.md` | Checklist/histórico da frente de responsividade. |
| `historico/documentacao-antiga/` | Documentos antigos movidos da raiz do repositório. |

---

## 7. Como decidir onde documentar

| Tipo de informação | Destino correto |
|---|---|
| Estado consolidado de uma frente implementada | `GUIA_IMPLEMENTACOES.md` |
| Padrão visual, comportamento responsivo ou microcopy | `GUIA_UX_LAYOUT.md` |
| Componente, props, cuidados de uso e anti-regressão | `GUIA_COMPONENTES.md` |
| Erro, sintoma, causa provável e correção | `GUIA_CORRECAO_ERROS.md` |
| Pendência, bloqueio, QA final ou pós-MVP | `PLANO_PROXIMOS_PASSOS.md` |
| Rota, guard, permissão de acesso ou navegação | `arquitetura/ROTAS_E_GUARDS.md` |
| Migration, Supabase, schema, SQL legado ou `db push` | `operacao/MIGRATIONS_SUPABASE.md` |
| Comportamento detalhado de funcionalidade específica | `funcionalidades/<NOME_DA_FUNCIONALIDADE>.md` |
| Diagnóstico antigo, relatório pontual ou QA de fase | `historico/` |

---

## 8. Regras de organização

1. Guias oficiais ficam na raiz de `docs/`.
2. Funcionalidades específicas ficam em `docs/funcionalidades/`.
3. Procedimentos operacionais ficam em `docs/operacao/`.
4. Arquitetura fica em `docs/arquitetura/`.
5. Comandos auxiliares e checklists pontuais ficam em `docs/comandos/`.
6. Diagnósticos, relatórios antigos, QA e documentos de fase ficam em `docs/historico/`.
7. Documentos antigos da raiz do repositório devem ficar em `docs/historico/documentacao-antiga/`.
8. Scripts SQL soltos são históricos ou operacionais; a fonte da verdade do banco deve continuar sendo `supabase/migrations`.
9. Documentos históricos devem ser identificados como históricos para evitar uso como fonte canônica.
10. Quando uma informação couber em mais de um arquivo, mantenha o detalhe técnico em apenas um lugar e use links cruzados nos demais.

---

## 9. Checklist antes de criar nova documentação

Antes de criar um novo `.md`, verificar:

- se o tema já está coberto por um guia oficial;
- se o conteúdo é funcional, operacional, arquitetural ou histórico;
- se o novo documento evita duplicidade;
- se há links cruzados para os guias relacionados;
- se o documento deixa claro o que é canônico, histórico ou pós-MVP.

