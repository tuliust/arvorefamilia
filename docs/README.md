# Documentação — Árvore Família

> Última revisão: 2026-06-22  
> Local canônico: `docs/README.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: índice canônico atualizado para separar estado implementado, pendências de IA/privacidade, debug viewer e riscos mobile antes do Prompt 6.

Este diretório concentra a documentação técnica, funcional, operacional e histórica do projeto **Árvore Família**.

Use este arquivo como ponto de entrada. A documentação canônica deve registrar comportamento implementado, contratos vigentes ou pendências explicitamente classificadas.

---

## 1. Estado atual consolidado

A baseline funcional atual registra:

- `/entrar` funciona como home pública, login, cadastro, primeiro acesso e aceite legal;
- `/` redireciona para `/mapa-familiar`, preservando `location.search`;
- as views oficiais da árvore são:
  - **Árvore Familiar** — `/mapa-familiar`;
  - **Mapa Genealógico** — `/mapa-familiar-horizontal`;
- as views antigas foram removidas do roteamento ativo:
  - `/minha-arvore`;
  - `/genealogia`;
  - `/visao-completa`;
- o histórico preventivo dessas rotas fica em `docs/historico/ROTAS_REMOVIDAS.md`;
- `/minha-arvore/editar` continua vigente como rota protegida de edição completa do membro;
- o cadastro inicial do membro usa fluxo protegido por `MemberRoute`:
  1. `/meus-dados`;
  2. `/meus-vinculos`;
  3. `/arquivos-historicos`;
  4. `/preferencias`, apenas para pessoa viva;
  5. `/revisao-dados`;
- pessoa falecida pula `/preferencias`, tem notificações desativadas e permissões de visualização ativadas por padrão;
- `/meus-dados` possui assistente de IA para Mini Bio e Curiosidades, com modo padrão e modo nostálgico/memorial;
- `/meus-vinculos` funciona como revisão guiada de vínculos familiares, com busca de pessoa existente, criação manual, estados de análise e solicitação de controle de perfil;
- Arquivos Históricos pertencem à Etapa 3 em `/arquivos-historicos`; a evolução para **Fatos e Arquivos Históricos** sem arquivo é pendência enquanto o código/migration não forem aplicados;
- Preferências de notificação e Permissões de exibição pertencem à Etapa 4 em `/preferencias`, somente para pessoa viva;
- `/revisao-dados` é revisão final em layout de perfil, com edição inline e finalização;
- `MemberOnboardingSteps` é o indicador visual reutilizável do fluxo e pode ocultar Preferências;
- o modal de vínculos filtra pessoas automaticamente enquanto o usuário digita e não usa botão **Buscar**;
- a revisão final usa badges por gênero/status: `Vivo`, `Viva`, `Falecido`, `Falecida` e `Em análise`;
- `TreeViewMode` possui apenas:
  - `mapa-familiar`;
  - `mapa-familiar-horizontal`;
- `/mapa-familiar` usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile;
- `/mapa-familiar-horizontal` usa `DesktopFamilyHorizontalMapFilteredView` no desktop/tablet e `MobileFamilyHorizontalMapFilteredView` no mobile;
- `/mapa-familiar` mobile usa grade 3x3 com telas de ancestrais, tios, núcleo, primos e descendentes;
- o Zoom mobile de `/mapa-familiar` possui overview 3x3 e botão **Exibir mapa completo**;
- o mapa completo mobile abre mosaico único com conectores, pinça, arraste e reenquadramento;
- filtros mobile separam **Exibir cônjuges de tios, primos etc** de **Apenas meus familiares**;
- cônjuges estendidos em grupos mobile suportados podem ser exibidos/ocultados por toggle e usam cor tonal diferente;
- tios paternos/maternos mobile possuem conectores laterais para pai/mãe e conectores verticais para primos;
- o painel desktop não possui mais a barra `Filtros | Legendas | Ações`;
- o modal mobile `Controles` é reduzido e não exibe Restaurar visualização ou Exportar; a toolbar fixa mobile mantém `Zoom` como ação separada;
- a horizontal mobile opera com uma geração por tela, botões `Ger X`, swipe lateral e scroll vertical interno;
- exportação cobre Área, Imagem/PNG, PDF e Imprimir nas views oficiais;
- a referência visual de paletas é o desktop, com adaptação mobile por tokens/overrides escopados;
- as paletas oficiais são `white`, `visual`, `orange` e `brown`;
- cards mobile não devem exibir visualmente `Nascimento não informado` ou `Falecimento não informado`;
- a vertical suporta núcleos conjugais adicionais quando há dados reais;
- `/calendario-familiar` possui filtros mobile compactos por categoria;
- `/duvidas` é página pública de FAQ/Ajuda, com conteúdo persistido no Supabase;
- `/admin/duvidas` é área protegida de gestão administrativa de categorias, perguntas e respostas do FAQ;
- `supabase/migrations/` é a fonte da verdade do schema;
- SQLs soltos ou antigos ficam classificados em `docs/historico/SQLS_LEGADOS.md` quando não forem migrations oficiais;
- ReactFlow/Dagre permanecem como legado ativo/dependência técnica e não devem ser removidos sem frente própria.

---

## 2. Como usar a documentação

| Necessidade | Documento principal |
|---|---|
| Entender o estado funcional vigente | `BASELINE_PRODUTO_ATUAL.md` |
| Ver mapa técnico de arquivos, services, CSS e legado | `INVENTARIO_TECNICO.md` |
| Ver o que está implementado por frente | `GUIA_IMPLEMENTACOES.md` |
| Entender responsabilidades de componentes | `GUIA_COMPONENTES.md` |
| Revisar UX, layout, responsividade e paletas | `GUIA_UX_LAYOUT.md` |
| Entender arquitetura dos mapas familiares mobile | `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md` |
| Validar manualmente rotas, árvore, mobile, exportação e deploy | `QA_MANUAL.md` |
| Validar a rodada mobile de 2026-06-21 | `docs/operacao/QA_MAPAS_MOBILE_2026_06_21.md` |
| Conferir regras que não podem regredir | `REGRAS_DE_NAO_REGRESSAO.md` |
| Ver pendências, riscos e decisões futuras | `PLANO_PROXIMOS_PASSOS.md` |
| Ver decisões estruturais | `DECISOES_ARQUITETURAIS.md` |
| Investigar erro por sintoma | `GUIA_CORRECAO_ERROS.md` |
| Entender rotas antigas removidas | `docs/historico/ROTAS_REMOVIDAS.md` |
| Classificar SQL solto ou documento antigo de banco | `docs/historico/SQLS_LEGADOS.md` |
| Resgatar a rodada mobile de 2026-06-21 | `docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_21.md` |

Regra:

```txt
Contrato vigente fica nos guias canônicos.
QA manual fica em QA_MANUAL.md ou docs/operacao/.
Pendência fica em PLANO_PROXIMOS_PASSOS.md.
Operação fica em docs/operacao/.
Histórico fica em docs/historico/.
supabase/migrations/ é a fonte da verdade do schema.
```

---

## 3. Guias oficiais na raiz de `docs/`

| Arquivo | Uso | Status |
|---|---|---|
| `README.md` | Índice canônico da documentação. | Atualizado. |
| `BASELINE_PRODUTO_ATUAL.md` | Estado funcional observado na `main`. | Manter sincronizado. |
| `INVENTARIO_TECNICO.md` | Rotas, componentes, services, tipos, CSS, testes e documentação. | Manter sincronizado. |
| `GUIA_IMPLEMENTACOES.md` | Inventário consolidado do que está implementado. | Manter sincronizado. |
| `GUIA_COMPONENTES.md` | Componentes, responsabilidades, padrões e anti-regressões. | Manter sincronizado. |
| `GUIA_UX_LAYOUT.md` | UX, layout, responsividade, árvore, menus, painéis, paletas, onboarding e microcopy. | Manter sincronizado. |
| `QA_MANUAL.md` | Guia central de QA manual, onboarding e pós-deploy. | Manter sincronizado. |
| `REGRAS_DE_NAO_REGRESSAO.md` | Regras e contratos mínimos para mudanças futuras. | Manter sincronizado. |
| `PLANO_PROXIMOS_PASSOS.md` | Pendências reais, QA aberto, riscos e decisões futuras. | Manter sincronizado. |
| `DECISOES_ARQUITETURAIS.md` | Decisões estruturais e justificativas. | Preservar. |
| `GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma, causa provável e correção. | Preservar. |
| `ATTRIBUTIONS.md` | Licenças, atribuições e cuidados com assets externos. | Preservar. |
| `ATUALIZACAO_DOCUMENTAL_2026_06_21.md` | Manifesto da consolidação documental da rodada mobile. | Histórico/apoio. |

---

## 4. Arquitetura

Pasta:

```txt
docs/arquitetura/
```

| Arquivo | Uso |
|---|---|
| `ARCHITECTURE.md` | Visão sintética da arquitetura atual, stack, camadas, shell da Home, duas views da árvore, exportação client-side, paletas e integrações. |
| `ROTAS_E_GUARDS.md` | Rotas públicas, rotas de árvore, rotas de membro, onboarding em 5 etapas, rotas administrativas, guards, redirecionamentos e navegação. |
| `ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Modelo de usuários, pessoas, vínculos, permissões, favoritos, fórum, notificações, relacionamentos e objetos legados. |
| `MAPA_FAMILIAR_MOBILE_ARQUITETURA.md` | Arquitetura técnica dos mapas familiares mobile, scripts auxiliares, Zoom, filtros de cônjuges e mapa completo. |

---

## 5. Funcionalidades

Pasta:

```txt
docs/funcionalidades/
```

| Arquivo | Escopo | Status |
|---|---|---|
| `MAPA_FAMILIAR_VIEW.md` | Documento canônico de `/mapa-familiar` e `/mapa-familiar-horizontal`. | Referência principal. |
| `ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Painel, filtros, controles, destaques e conectores. | Preservar. |
| `EXPORTACAO_ARVORE.md` | Exportação por Área, Imagem, PDF e Impressão. | Preservar. |
| `FAVORITOS.md` | Favoritos de páginas, pessoas, fórum e integrações. | Revisão futura recomendada. |
| `PESSOAS_PERFIL_ADMIN.md` | Perfil, reset, sugestões, privacidade, arquivos, eventos e relacionamento conjugal. | Revisão futura recomendada. |
| `MINHA_ARVORE_EDITAR.md` | Edição completa da própria árvore; diferente do onboarding inicial. | Atualizado. |
| `FORUM.md` | Fórum, tópicos, menções, respostas, reações, favoritos e notificações. | Preservar. |
| `NOTIFICACOES.md` | Notificações internas/e-mail, preferências, logs, Edge Functions e cron futuro. | Atualizado para `/preferencias`. |
| `CALENDARIO_FAMILIAR.md` | Calendário familiar, categorias, filtros mobile e Google Agenda. | Preservar. |
| `TIMELINE.md` | Timeline de pessoa, eventos derivados, arquivos históricos, relacionamentos e pós-MVP. | Preservar. |
| `CURIOSIDADES_E_IA.md` | Curiosidades, conexão familiar e perguntas à IA na Home. | Atualizado. |
| `MINI_BIO_CURIOSIDADES_IA.md` | Geração assistida de Mini Bio e Curiosidades em `/meus-dados`. | Atualizado. |
| `MEUS_VINCULOS.md` | Revisão guiada de vínculos familiares em `/meus-vinculos`. | Manter como documento canônico da Etapa 2. |
| `DUVIDAS.md` | Página pública `/duvidas`, conteúdo QA no Supabase e gestão administrativa em `/admin/duvidas`. | Atualizado. |

Documentos sobre antigas views da árvore devem permanecer apenas em `docs/historico/` ou marcados como legado.

---

## 6. Operação

Pasta:

```txt
docs/operacao/
```

| Arquivo | Uso |
|---|---|
| `README.md` | Índice operacional e regras gerais. |
| `DEPLOY.md` | Atalho curto de deploy. |
| `DEPLOYMENT.md` | Guia completo de deploy, cache, fallback SPA, Supabase, Edge Functions, `/api/*`, OAuth e troubleshooting. |
| `MIGRATIONS_SUPABASE.md` | Fluxo seguro de migrations, schema, RLS, RPCs e schema cache. |
| `OAUTH_GOOGLE.md` | Operação Google OAuth/Agenda, consent screen, test users, redirects e secrets. |
| `STORAGE_MAINTENANCE.md` | Buckets, objetos órfãos, base64 legado e scripts administrativos. |
| `QA_MAPAS_MOBILE_2026_06_21.md` | Checklist pós-deploy específico da rodada mobile de Zoom, tios, cônjuges e mapa completo. |

Regra operacional:

```txt
Ajuste visual, layout, paleta, modal, exportação client-side ou documentação não exige migration.
Mudança de schema, RLS, RPC, trigger, bucket/policy, Edge Function ou secret exige revisão operacional.
supabase/migrations/ é a fonte da verdade do schema.
```

---

## 7. Histórico

Pasta:

```txt
docs/historico/
```

Uso:

- preservar contexto de decisões passadas;
- manter documentação antiga sem confundi-la com contrato vigente;
- guardar material sobre rotas removidas, SQLs legados, refatorações e auditorias já encerradas.

| Arquivo | Uso |
|---|---|
| `README.md` | Índice histórico consolidado da pasta. |
| `ROTAS_REMOVIDAS.md` | Histórico preventivo de `/minha-arvore`, `/genealogia` e `/visao-completa`. |
| `SQLS_LEGADOS.md` | Inventário preventivo de SQLs soltos, dumps, diagnósticos e documentos antigos de banco. |
| `AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_21.md` | Histórico da rodada mobile de tios, Zoom, cônjuges e mapa completo. |

Regras:

- conteúdo histórico não prevalece sobre documentação canônica;
- histórico não deve reabrir `/minha-arvore`, `/genealogia` ou `/visao-completa`;
- SQL histórico não substitui migration oficial;
- material histórico útil deve apontar para o documento canônico atual;
- dúvidas sobre ocorrências dessas rotas antigas devem ser conferidas em `docs/historico/ROTAS_REMOVIDAS.md`;
- dúvidas sobre SQL solto devem ser conferidas em `docs/historico/SQLS_LEGADOS.md`.

---

## 8. Onde registrar cada tipo de mudança

| Tipo de informação | Onde registrar |
|---|---|
| Estado implementado | `BASELINE_PRODUTO_ATUAL.md` ou documento funcional específico |
| Responsabilidade técnica | `INVENTARIO_TECNICO.md`, `GUIA_COMPONENTES.md` ou `docs/arquitetura/` |
| UX/layout | `GUIA_UX_LAYOUT.md` |
| QA manual | `QA_MANUAL.md` ou `docs/operacao/*` |
| Regra que não pode regredir | `REGRAS_DE_NAO_REGRESSAO.md` |
| Pendência ou risco | `PLANO_PROXIMOS_PASSOS.md` |
| Deploy/operação | `docs/operacao/*` |
| Banco/schema | `docs/operacao/MIGRATIONS_SUPABASE.md` e `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| SQL legado, dump ou diagnóstico antigo | `docs/historico/SQLS_LEGADOS.md` |
| História/legado | `docs/historico/*` |
| Rodada ampla de ajustes mobile | manifesto em `docs/ATUALIZACAO_DOCUMENTAL_YYYY_MM_DD.md` + histórico em `docs/historico/` |

---

## 9. Validação antes de alterar documentação

Para mudança documental simples:

```bash
git diff --check
npm run build
```

Para reorganização que altera contratos ou guias canônicos:

```bash
git diff --check
npm run build
npm test
```

Para mudança que afeta QA manual, árvore, rotas, deploy ou operação:

```bash
git diff --check
npm run build
npm test
npm run test:e2e
```

Se `npm run test:e2e` não estiver configurado ou não for aplicável, registrar explicitamente essa limitação no PR/commit.

---

## 10. Checklist documental do onboarding de membro

Sempre que alterar `/meus-dados`, `/meus-vinculos`, `/arquivos-historicos`, `/preferencias` ou `/revisao-dados`, revisar:

```txt
docs/README.md
docs/BASELINE_PRODUTO_ATUAL.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/funcionalidades/MINHA_ARVORE_EDITAR.md
docs/funcionalidades/NOTIFICACOES.md
docs/funcionalidades/CURIOSIDADES_E_IA.md
docs/INVENTARIO_TECNICO.md
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/QA_MANUAL.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/PLANO_PROXIMOS_PASSOS.md
```

Critérios mínimos:

- rotas novas ou alteradas registradas como `MemberRoute`;
- etapa ativa coerente no `MemberOnboardingSteps`;
- fluxo de pessoa viva e pessoa falecida descritos separadamente;
- `/preferencias` descrita como etapa exclusiva de pessoa viva;
- pessoa falecida documentada com notificações desativadas e permissões ativadas;
- Arquivos Históricos documentados na Etapa 3;
- rascunho local de arquivos históricos documentado quando mantido no código;
- modal de vínculos documentado sem botão **Buscar** e com filtragem automática;
- Notificações e Permissões documentadas na Etapa 4;
- Revisão final documentada como tela editável inline, não apenas passiva;
- badges `Vivo`, `Viva`, `Falecido`, `Falecida` e `Em análise` documentadas;
- QA manual atualizado para pessoa viva, pessoa falecida, rascunho local, revisão inline e navegação condicional;
- comandos de validação executados ou limitação registrada.

---

## 11. Consolidação documental de ajustes recentes

Esta documentação usa uma regra explícita de separação entre:

| Tipo de informação | Destino documental |
|---|---|
| Estado implementado e confirmado na `main` | `BASELINE_PRODUTO_ATUAL.md` e documento funcional correspondente |
| Padrão técnico ou componente reutilizável | `GUIA_COMPONENTES.md` |
| Padrão visual, responsivo ou mobile | `GUIA_UX_LAYOUT.md` |
| Roteiro de validação | `QA_MANUAL.md` ou `docs/operacao/*` |
| Regra que não pode regredir | `REGRAS_DE_NAO_REGRESSAO.md` |
| Rota, guard ou redirecionamento | `arquitetura/ROTAS_E_GUARDS.md` |
| Pendência, script gerado sem confirmação ou decisão bloqueada | `PLANO_PROXIMOS_PASSOS.md` |
| Tentativa substituída, script falho ou material de auditoria | `historico/` |

Regra de prioridade para resolver conflitos:

```txt
Código atual da main > commits confirmados > docs canônicos existentes > levantamento recente > scripts planejados.
```

Scripts não confirmados, prints sem commit verificável e propostas que envolvam Supabase/RLS/RPC/migration não devem ser registrados como baseline.

---

## 12. Atualização complementar — 2026-06-22

Esta revisão registra pontos que devem ser mantidos claros antes de qualquer Prompt 6 ou alteração em mapas:

### Estado implementado na branch auditada

- `index.html` carrega scripts mobile recentes de grade 3x3, Zoom, mapa completo, mosaico, cônjuges estendidos, filtros e stability lock.
- `HomeTreeSection.tsx` usa os componentes horizontais filtrados.
- A toolbar fixa mobile contém `Formato`, `Cor`, `Filtros`, `Zoom` e `+`.
- O modal mobile `Controles` permanece separado da toolbar e não deve virar lugar para Exportar/Restaurar/Zoom +/-.
- `Home.tsx` ainda contém `Visualizar como...`; o item `TREE-005` continua aberto.

### Pendências que não devem virar baseline por engano

- `/revisao-dados` ainda precisa separar Pets de Filhos.
- `/arquivos-historicos` ainda precisa de frente própria para salvar fatos sem arquivo.
- `homeAiContext.ts` ainda precisa remover inferência por nome/sufixo e filtrar campos sensíveis antes de enviar contexto à IA.
- `participante_ids` em arquivos históricos não deve ser tratado como obrigatório sem migration.

### Regra para Prompt 6

Qualquer Prompt 6 que toque mapa deve começar pela leitura destes documentos:

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md
docs/operacao/NAO_REGRESSAO_MAPAS_MOBILE.md
docs/operacao/QA_MAPAS_MOBILE_2026_06_21.md
```

Se o Prompt 6 não for explicitamente mobile-safe, tratar como risco de regressão.

## Atualização 2026-06-22 — ciclo de fechamento funcional

Este ciclo consolidou o onboarding de perfil, vínculos, fatos históricos e mapa familiar. A documentação atualizada cobre:

- levantamento de commits e frentes em `docs/historico/LEVANTAMENTO_AJUSTES_CHAT_20260622.md`;
- Mini Bio/Curiosidades e IA;
- Meus Vínculos;
- Fatos e Arquivos Históricos;
- Revisão de Dados;
- Mapa Familiar View;
- QA manual e operação/deploy.
