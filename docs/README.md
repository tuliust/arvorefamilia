# Documentação - Árvore Família

> Última revisão: 2026-06-11
> Local canônico: `docs/README.md`
> Projeto: `tuliust/arvorefamilia`
> Status: índice canônico revisado após ajustes mobile da árvore, alinhamento do fallback mobile do Mapa Familiar e remoção do texto de Google Agenda da página `/entrar`.

Este diretório concentra a documentação técnica, funcional, operacional e histórica do projeto **Árvore Família**.

Use este arquivo como ponto de entrada antes de consultar guias específicos. A documentação foi consolidada para reduzir duplicidade, separar estado atual de histórico e evitar que arquivos antigos sejam usados como fonte de verdade.

A revisão mais recente registra:

- `/entrar` continua funcionando como home pública do app **Família Souza Barros**, login e primeiro acesso; o parágrafo específico sobre integração com Google Agenda foi removido do conteúdo público da página de entrada;
- as views principais da árvore agora são **Minha Árvore**, **Mapa Familiar**, **Genealogia** e **Visão Completa**;
- `/mapa-familiar` é uma view protegida de árvore, com renderização panorâmica desktop/tablet em `DesktopFamilyMapView` e fallback mobile para `MobileFamilyTreeView`;
- a paleta **Visual** (`visual`) foi adicionada como modo de cores da árvore;
- `MAPA_FAMILIAR_VIEW.md` passa a ser o documento canônico da view panorâmica desktop/tablet;
- o Mapa Familiar foi refatorado com `FAMILY_MAP_LAYOUT`, regras de cônjuges, grupos expansíveis, conectores por âncoras e avatares por `genero`;
- o fallback mobile da árvore usa conectores que acompanham o scroll da tela Central, cards com apenas ano, card central sem badge **Você** e avatares visuais por `genero`;
- pendências antigas da Minha Árvore mobile segmentada foram reclassificadas para não conflitar com a malha 3×3 já implementada/documentada.

---

## 1. Regras de uso da documentação

Regras gerais:

- arquivos na raiz de `docs/` são guias canônicos gerais;
- arquivos em `docs/funcionalidades/` são guias canônicos de comportamento funcional específico;
- arquivos em `docs/arquitetura/` são guias canônicos de rotas, guards, arquitetura e modelo de usuários/dados;
- arquivos em `docs/operacao/` são procedimentos operacionais e de manutenção;
- arquivos em `docs/comandos/` são checklists/comandos auxiliares;
- `docs/historico/README.md` é o único resumo histórico consolidado;
- pendências reais, bugs prováveis e decisões futuras devem ficar em `PLANO_PROXIMOS_PASSOS.md`;
- scripts SQL soltos, diagnósticos antigos e documentação removida não substituem `supabase/migrations` nem os guias canônicos.

Quando houver divergência entre um guia atual e conteúdo histórico, prevalece o guia atual.

---

## 2. Guias oficiais na raiz de `docs/`

| Arquivo | Uso |
|---|---|
| `README.md` | Índice canônico da documentação. |
| `GUIA_IMPLEMENTACOES.md` | Inventário consolidado do que já foi implementado, incluindo **Mapa Familiar** e paleta **Visual**. |
| `GUIA_COMPONENTES.md` | Componentes, responsabilidades, padrões de uso e anti-regressões. Deve cobrir `DesktopFamilyMapView`, `MobileFamilyTreeView` e `FamilyTreeVisualCards`. |
| `GUIA_UX_LAYOUT.md` | UX, layout, responsividade, headers, árvore, menus, portais mobile, **Mapa Familiar**, paletas e microcopy. |
| `GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma, causa provável e correção. Pode receber complemento específico sobre `/mapa-familiar`. |
| `PLANO_PROXIMOS_PASSOS.md` | Pendências reais, bloqueios, QA futuro e backlog pós-MVP. |
| `ATTRIBUTIONS.md` | Licenças, atribuições e cuidados com assets externos. |

---

## 3. Arquitetura

Pasta:

```txt
docs/arquitetura/
```

| Arquivo | Uso |
|---|---|
| `arquitetura/ARCHITECTURE.md` | Visão sintética da arquitetura atual, stack, camadas, quatro views da árvore, `DesktopFamilyMapView`, paleta `visual` e integrações. |
| `arquitetura/ROTAS_E_GUARDS.md` | Rotas públicas, home `/entrar`, rotas de árvore incluindo `/mapa-familiar`, rotas de membro, rotas administrativas, guards, OAuth/compliance e redirecionamentos. |
| `arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Modelo de usuários, pessoas, vínculos, permissões, favoritos, fórum, notificações e objetos legados. |

---

## 4. Funcionalidades

Pasta:

```txt
docs/funcionalidades/
```

| Arquivo | Escopo |
|---|---|
| `funcionalidades/PESSOAS_PERFIL_ADMIN.md` | Perfil público, perfil admin, reset, sugestões, privacidade, arquivos, eventos e relacionamento conjugal. |
| `funcionalidades/MINHA_ARVORE_VIEW.md` | View direta da árvore, ReactFlow desktop/tablet, viewport, layout central, cards compactos, filtros diretos e `MobileFamilyTreeView`, incluindo conectores mobile roláveis, anos nos cards, card central sem badge e avatares por `genero`. |
| `funcionalidades/MAPA_FAMILIAR_VIEW.md` | View panorâmica `/mapa-familiar`, `DesktopFamilyMapView`, `FAMILY_MAP_LAYOUT`, cards visuais, cônjuges, conectores SVG, zoom, avatares por `genero` e fallback mobile compartilhado com `MobileFamilyTreeView`. |
| `funcionalidades/GENEALOGIA_VIEW.md` | Genealogia, Visão Completa, gerações, chips mobile, cabeçalhos de coluna, reset de geração ativa, inferência visual e QA. |
| `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Legendas, linhas, conectores ReactFlow, conectores HTML/CSS do mobile segmentado, conectores SVG do `Mapa Familiar`, filtros, destaques, painel lateral e ações. |
| `funcionalidades/MINHA_ARVORE_EDITAR.md` | Edição da própria árvore, avatar, arquivos, eventos pessoais, dados próprios, CSS mobile escopado e saída sem salvar. |
| `funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` | Filtros da Minha Árvore, separação humanos/pets, contadores, modo foco e impacto no `Mapa Familiar` quando documentado. |
| `funcionalidades/FORUM.md` | Fórum, categorias, tópicos, menções, respostas diretas, reações, favoritos, vínculos técnicos e notificações. |
| `funcionalidades/NOTIFICACOES.md` | Notificações internas/e-mail, preferências, logs, Edge Functions, fórum e cron futuro. |
| `funcionalidades/CALENDARIO_FAMILIAR.md` | Calendário familiar, categorias, filtros mobile, Google Agenda, compliance OAuth, microcopy e QA. |
| `funcionalidades/TIMELINE.md` | Timeline de pessoa, eventos derivados, `person_events`, arquivos históricos, relacionamentos e pós-MVP. |
| `funcionalidades/EXPORTACAO_ARVORE.md` | Exportação da área visível da árvore em PNG, PDF e impressão; deve explicitar se `/mapa-familiar` ainda não participa do fluxo canônico. |
| `funcionalidades/CURIOSIDADES_E_IA.md` | Curiosidades, descoberta de conexão familiar, perguntas à IA, contexto genealógico, privacidade, fallback e QA de respostas. |
| `funcionalidades/FAVORITOS.md` | Favoritos de pessoas/conteúdos/páginas; deve ser atualizado caso `Mapa Familiar` vire página favoritable no catálogo. |

---

## 5. Operação e manutenção

Pasta:

```txt
docs/operacao/
```

| Arquivo | Uso |
|---|---|
| `operacao/README.md` | Índice da pasta operacional. |
| `operacao/DEPLOYMENT.md` | Deploy, variáveis, build, publicação, Supabase, Edge Functions e secrets. |
| `operacao/MIGRATIONS_SUPABASE.md` | Migrations, Supabase, `db push`, SQL legado, RLS, schema cache e operação segura. |
| `operacao/STORAGE_MAINTENANCE.md` | Storage, dry-run, órfãos, base64 legado, scripts administrativos e service role. |

Regras operacionais permanentes:

- `supabase/migrations` é a fonte da verdade do schema;
- SQL legado não deve ser aplicado como schema principal de ambiente novo;
- `supabase db push` só deve ser executado com revisão explícita;
- service role, dumps, tokens e secrets não devem ser versionados;
- ajuste visual não deve gerar migration;
- limpeza de Storage exige dry-run, revisão e flag explícita.

---

## 6. Comandos auxiliares

Pasta:

```txt
docs/comandos/
```

| Arquivo | Uso |
|---|---|
| `comandos/GIT_RESPONSIVIDADE.md` | Checklist operacional/histórico de Git, responsividade e validações antes de commit. |

Esse documento não substitui `GUIA_UX_LAYOUT.md` nem `PLANO_PROXIMOS_PASSOS.md`.

---

## 7. Histórico consolidado

Pasta:

```txt
docs/historico/
```

| Arquivo | Uso |
|---|---|
| `historico/README.md` | Resumo histórico consolidado das auditorias, QA, responsividade, exportação, frente mobile de 2026-06-08 e documentação antiga. |

A pasta histórica foi consolidada. Os arquivos históricos individuais, `docs/historico/documentacao-antiga/*` e `docs/historico/sql-legado/*` foram substituídos pelo resumo consolidado em `docs/historico/README.md` ou pelos guias canônicos correspondentes.

Não recriar documentos históricos individuais salvo necessidade explícita de rastreabilidade futura. Se um novo diagnóstico for criado, ele deve declarar que é histórico e não substitui os guias canônicos.

---

## 8. Onde documentar cada tipo de informação

| Tipo de informação | Destino correto |
|---|---|
| Estado consolidado de implementação | `GUIA_IMPLEMENTACOES.md` |
| Layout, responsividade, visual, menu, header, microcopy, Mapa Familiar e portais mobile | `GUIA_UX_LAYOUT.md` |
| Componentes, props, responsabilidades e anti-regressões | `GUIA_COMPONENTES.md` |
| Sintoma, erro, causa provável e correção | `GUIA_CORRECAO_ERROS.md` |
| Pendência real, bug provável, decisão futura ou pós-MVP | `PLANO_PROXIMOS_PASSOS.md` |
| Rota, guard, permissão ou navegação | `arquitetura/ROTAS_E_GUARDS.md` |
| Usuários, pessoas, vínculos e estrutura de dados | `arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| Arquitetura geral | `arquitetura/ARCHITECTURE.md` |
| Deploy e publicação | `operacao/DEPLOYMENT.md` |
| Migrations, RLS, schema cache e SQL legado | `operacao/MIGRATIONS_SUPABASE.md` |
| Storage, órfãos, base64 legado e scripts administrativos | `operacao/STORAGE_MAINTENANCE.md` |
| Funcionalidade específica | `funcionalidades/<NOME>.md` |
| Curiosidades, conexão familiar e IA | `funcionalidades/CURIOSIDADES_E_IA.md` |
| Licenças e atribuições | `ATTRIBUTIONS.md` |
| Histórico consolidado | `historico/README.md` |

---

## 9. Pendências reais abertas

As pendências abertas da revisão documental ficam apenas em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

No fechamento desta revisão documental, o plano separa itens **implementados**, **obsoletos/substituídos** e **abertos**.

Itens concluídos tecnicamente ou reclassificados:

| ID | Origem | Resultado |
|---|---|---|
| `DOC-001` | `funcionalidades/GENEALOGIA_VIEW.md` | Chips mobile usam a base de gerações inferidas em `HomeTreeSection.tsx`. |
| `DOC-002` | `funcionalidades/MINHA_ARVORE_EDITAR.md` | Encoding corrigido na origem; workaround global removido. |
| `DOC-004` | `/minha-arvore` mobile ReactFlow | Reclassificado como obsoleto para a rota mobile principal, pois `/minha-arvore` mobile usa `MobileFamilyTreeView`. |
| `DOC-005` | `funcionalidades/EXPORTACAO_ARVORE.md` | Exportação mobile rápida alinhada ao fluxo canônico de `treeExport.ts`. |
| `DOC-013` | `/minha-arvore` mobile segmentada | Reclassificado: a malha 3×3, abas `Paterno | Central | Materno`, ancestrais globais, primos sem “Ver todos” e preview de swipe foram implementados/documentados. Manter apenas QA visual manual quando necessário. |

Itens ainda abertos ou parcialmente abertos:

| ID | Origem | Tipo |
|---|---|---|
| `DOC-003` | `funcionalidades/MINHA_ARVORE_EDITAR.md` | decisão pendente apenas sobre persistência de `Complemento`; redes sociais múltiplas já persistem em `pessoa_social_profiles` |
| `DOC-006` | `/forum` | divergência UI/documentação / filtros tipo-status |
| `DOC-007` | `family-tree-visual-polish.css` | dívida técnica / consolidar CSS em componentes/layouts |
| `DOC-008` | `directFamilyDistributedLayout.ts` | melhoria técnica / migrar largura visual de cards para layout estrutural |
| `DOC-009` | Curiosidades/IA | QA funcional de respostas e ausência de IDs |
| `DOC-010` | Google Agenda/OAuth | decisão de produto/compliance sobre onde declarar publicamente a finalidade da integração, sem recolocar automaticamente o texto em `/entrar` |
| `DOC-011` | `api/ai.ts` / deploy | operação / secrets e fallback SPA |
| `DOC-012` | Curiosidades/IA | manutenção de documentação funcional específica |
| `DOC-014` | `/mapa-familiar` | QA visual manual autenticado em desktop/tablet e fallback mobile |
| `DOC-015` | `/mapa-familiar` busca/favoritos | verificar inclusão em `GLOBAL_SEARCH_PAGES` e `FAVORITE_PAGES` |
| `DOC-016` | `/mapa-familiar` exportação | decidir/documentar se a exportação canônica deve capturar a view HTML/SVG panorâmica |
| `DOC-017` | `pessoas.genero` | validar tipagem e migration da coluna usada por avatares do Mapa Familiar |
| `DOC-018` | `/mapa-familiar` laterais | refinar grupos de tios/primos laterais para ocupar espaço lateral sem invadir o núcleo |

Não duplicar essas pendências em outros arquivos. Documentos funcionais podem mencionar o contexto técnico, mas o controle deve permanecer no plano.

---

## 10. Critérios permanentes de bloqueio

Antes de lançamento, commit final ou deploy, bloquear se houver:

- build quebrado;
- login quebrado;
- usuário comum acessando admin;
- usuário comum alterando dado restrito diretamente;
- RLS liberando escrita indevida;
- perda ou corrupção de dados;
- secret, token, dump, backup sensível ou service role no frontend/repositório;
- migration obrigatória ausente no ambiente final;
- documentação canônica orientando ação insegura de Supabase, Storage, Auth ou migrations;
- responsividade impedindo uso em mobile;
- home `/entrar` sem nome público **Família Souza Barros**, ou documentação pública/compliance ausente para a integração Google Agenda quando houver validação OAuth pendente;
- árvore principal, Mapa Familiar, perfil de pessoa, fórum, notificações ou edição da própria árvore inutilizáveis.

---

## 11. Checklist antes de criar nova documentação

Antes de criar um novo `.md`, verificar:

- se o tema já está coberto por guia canônico;
- se o conteúdo é funcional, operacional, arquitetural, legal ou histórico;
- se o documento evita duplicidade;
- se pendências foram registradas no plano;
- se há referência cruzada para o documento canônico correto;
- se uma frente grande, como Curiosidades/IA, já exige arquivo próprio;
- se há dado sensível, secret, dump, token ou conteúdo privado que não deve ser versionado;
- se o arquivo precisa mesmo existir ou se o conteúdo pode ser incorporado a um documento existente.

---

## 12. Validação final da documentação

Antes do commit final:

```bash
git status --short
git diff --check
npm run build
```

Se algum documento operacional, migration, Edge Function ou script for alterado futuramente, validar também o comando específico documentado no guia correspondente.

---

## 13. Commit documental final

Usar `git add` explícito, não `git add .`.

Sugestão para esta atualização específica:

```bash
git add docs/arquitetura/ROTAS_E_GUARDS.md

git add docs/arquitetura/ARCHITECTURE.md

git add docs/README.md

git add docs/PLANO_PROXIMOS_PASSOS.md

git commit -m "docs: atualiza arquitetura e plano do mapa familiar"

git pull --rebase origin main

git push origin main
```

Para uma revisão documental ampla envolvendo todos os guias, continuar usando `git add` explícito por arquivo ou pasta, nunca `git add .`.
