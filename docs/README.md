# Documentação - Árvore Família

> Última revisão: 2026-06-13  
> Local canônico: `docs/README.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: índice canônico revisado contra a baseline atual da `main`.

Este diretório concentra a documentação técnica, funcional, operacional e histórica do projeto **Árvore Família**.

Use este arquivo como ponto de entrada antes de consultar guias específicos. A documentação deve registrar apenas comportamento implementado ou pendências explicitamente classificadas como backlog/QA. Conteúdo histórico não substitui os guias canônicos atuais.

---

## 1. Estado atual consolidado

A baseline funcional atual registra:

- `/entrar` funciona como home pública, login, cadastro, primeiro acesso e aceite legal;
- a rota raiz `/` redireciona para `/mapa-familiar`, preservando `location.search`;
- as views principais da árvore são apenas:
  - **Mapa Familiar** — `/mapa-familiar`;
  - **Mapa Familiar Horizontal** — `/mapa-familiar-horizontal`;
- as antigas views de árvore foram removidas do roteamento ativo:
  - `/minha-arvore`;
  - `/genealogia`;
  - `/visao-completa`;
- `/minha-arvore/editar` continua vigente como rota de edição do membro;
- `TreeViewMode` possui exatamente:
  - `mapa-familiar`;
  - `mapa-familiar-horizontal`;
- `/mapa-familiar` usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile;
- `/mapa-familiar-horizontal` usa `DesktopFamilyHorizontalMapView` no desktop/tablet e `MobileFamilyHorizontalMapView` no mobile;
- o painel desktop exibe botões **Vertical** e **Horizontal**:
  - **Vertical** → `/mapa-familiar`;
  - **Horizontal** → `/mapa-familiar-horizontal`;
- a alternância vertical/horizontal preserva `location.search`, incluindo `?pessoa=...`;
- `PersonProfile` aceita retorno seguro para `/`, `/mapa-familiar` e `/mapa-familiar-horizontal`;
- favoritos e busca global incluem as duas views oficiais;
- exportação de `/mapa-familiar` e `/mapa-familiar-horizontal` cobre:
  - **Área**;
  - **Imagem**;
  - **PDF**;
  - **Imprimir**;
- ReactFlow/Dagre continuam presentes como dependência técnica de código legado ativo, tipos, layouts ou utilitários; não devem ser removidos em limpeza superficial;
- o painel ainda contém a barra **Filtros | Legendas | Ações** no estado atual e deve ser revisado em frente própria;
- documentos de views antigas devem ser arquivados como histórico ou marcados como legado.

---

## 2. Regras de uso da documentação

Regras gerais:

- arquivos na raiz de `docs/` são guias canônicos gerais;
- arquivos em `docs/funcionalidades/` são guias canônicos de comportamento funcional específico;
- arquivos em `docs/arquitetura/` são guias canônicos de rotas, guards, arquitetura e modelo de usuários/dados;
- arquivos em `docs/operacao/` são procedimentos operacionais e de manutenção;
- arquivos em `docs/comandos/` são checklists/comandos auxiliares;
- `docs/historico/README.md` é o resumo histórico consolidado;
- pendências reais, bugs prováveis e decisões futuras devem ficar em `PLANO_PROXIMOS_PASSOS.md`;
- scripts SQL soltos, diagnósticos antigos e documentação removida não substituem `supabase/migrations` nem os guias canônicos;
- quando houver divergência entre documentação e código atual, revisar o código e atualizar o guia canônico antes de fazer novas alterações;
- quando houver divergência entre guia atual e conteúdo histórico, prevalece o guia atual;
- conteúdo histórico não deve ser usado para restaurar `/minha-arvore`, `/genealogia` ou `/visao-completa` como views ativas.

---

## 3. Guias oficiais na raiz de `docs/`

| Arquivo | Uso | Status recomendado |
|---|---|---|
| `README.md` | Índice canônico da documentação. | Atualizado contra baseline. |
| `GUIA_IMPLEMENTACOES.md` | Inventário consolidado do que já está implementado. | Revisar para remover rotas antigas. |
| `GUIA_COMPONENTES.md` | Componentes, responsabilidades, padrões de uso e anti-regressões. | Revisar componentes legado/ativos. |
| `GUIA_UX_LAYOUT.md` | UX, layout, responsividade, headers, árvore, menus, painéis, paletas e microcopy. | Revisar com duas views oficiais. |
| `GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma, causa provável e correção. | Remover cenários de rotas antigas. |
| `PLANO_PROXIMOS_PASSOS.md` | Pendências reais, bloqueios, QA futuro e backlog pós-MVP. | Reclassificar backlog vencido. |
| `ATTRIBUTIONS.md` | Licenças, atribuições e cuidados com assets externos. | Preservar. |

Documentos de baseline recomendados para criação/manutenção:

| Arquivo | Conteúdo esperado |
|---|---|
| `BASELINE_PRODUTO_ATUAL.md` | Estado funcional observado no commit atual. |
| `INVENTARIO_TECNICO.md` | Rotas, componentes, services, tipos, CSS e dependências. |
| `DECISOES_ARQUITETURAIS.md` | Decisões estruturais e justificativas. |
| `REGRAS_DE_NAO_REGRESSAO.md` | Checklist técnico e manual para futuras mudanças. |

---

## 4. Arquitetura

Pasta:

```txt
docs/arquitetura/
```

| Arquivo | Uso |
|---|---|
| `arquitetura/ARCHITECTURE.md` | Visão sintética da arquitetura atual, stack, camadas, shell da Home, duas views da árvore, exportação client-side, paletas e integrações. |
| `arquitetura/ROTAS_E_GUARDS.md` | Rotas públicas, rotas de árvore, rotas de membro, rotas administrativas, guards, redirecionamentos e navegação. |
| `arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Modelo de usuários, pessoas, vínculos, permissões, favoritos, fórum, notificações e objetos legados. |

---

## 5. Funcionalidades

Pasta:

```txt
docs/funcionalidades/
```

| Arquivo | Escopo | Status recomendado |
|---|---|---|
| `PESSOAS_PERFIL_ADMIN.md` | Perfil público, perfil admin, reset, sugestões, privacidade, arquivos, eventos e relacionamento conjugal. | Preservar. |
| `MAPA_FAMILIAR_VIEW.md` | Documento canônico de `/mapa-familiar` e `/mapa-familiar-horizontal`: vertical, horizontal, cards, grupos, conectores, filtros, paletas, seleção, exportação, loading, mobile e anti-regressões. | Referência principal. |
| `ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Legendas, linhas, conectores, filtros, destaques, painel lateral e ações. | Atualizar após frente de painel. |
| `MINHA_ARVORE_EDITAR.md` | Edição da própria árvore, avatar, arquivos, eventos pessoais, dados próprios, CSS mobile escopado e saída sem salvar. | Vigente; não confundir com a view removida `/minha-arvore`. |
| `MINHA_ARVORE_VIEW.md` | Antiga view direta da árvore. | Arquivar ou marcar como legado. |
| `MINHA_ARVORE_FILTROS_E_PETS.md` | Mistura regras antigas e regras vigentes de filtros/pets. | Extrair regras vigentes antes de arquivar. |
| `GENEALOGIA_VIEW.md` | Antigas views `/genealogia` e `/visao-completa`. | Arquivar ou marcar como legado. |
| `FORUM.md` | Fórum, categorias, tópicos, menções, respostas diretas, reações, favoritos, vínculos técnicos e notificações. | Preservar. |
| `NOTIFICACOES.md` | Notificações internas/e-mail, preferências, logs, Edge Functions, fórum e cron futuro. | Preservar. |
| `CALENDARIO_FAMILIAR.md` | Calendário familiar, categorias, filtros mobile, Google Agenda, compliance OAuth, microcopy e QA. | Preservar. |
| `TIMELINE.md` | Timeline de pessoa, eventos derivados, `person_events`, arquivos históricos, relacionamentos e pós-MVP. | Preservar. |
| `EXPORTACAO_ARVORE.md` | Exportação por Área, Imagem, PDF e Impressão nas duas views oficiais. | Atualizado contra baseline. |
| `FAVORITOS.md` | Favoritos de pessoas/páginas; inclui `/mapa-familiar` e `/mapa-familiar-horizontal`. | Atualizado contra baseline. |

---

## 6. Operação

Pasta:

```txt
docs/operacao/
```

| Arquivo | Uso |
|---|---|
| `operacao/MIGRATIONS_SUPABASE.md` | Migrations versionadas, ordem de aplicação, validação e rollback. |
| `operacao/DEPLOY.md` ou `DEPLOYMENT.md` | Deploy, build, Vercel/hosting, variáveis e checagens. |
| `operacao/OAUTH_GOOGLE.md` | Operação Google OAuth, test users e compliance. |

---

## 7. Rotas da árvore

Rotas protegidas por `TreeAccessRoute`:

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
/busca
```

A rota raiz:

```txt
/
```

redireciona para:

```txt
/mapa-familiar
```

preservando `location.search`.

Contrato atual:

```ts
export type TreeViewMode =
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal';
```

Views oficiais:

| Rota | Desktop/tablet | Mobile |
|---|---|---|
| `/mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `MobileFamilyHorizontalMapView` |

Rotas antigas que não devem voltar como views da árvore:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção vigente:

```txt
/minha-arvore/editar
```

Essa rota pertence à edição do membro, não à antiga view da árvore.

---

## 8. Baseline de navegação, busca e favoritos

Arquivos que devem permanecer sincronizados:

```txt
src/app/routes.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/pages/PersonProfile.tsx
```

Regras:

- não há links visíveis para `/minha-arvore`, `/genealogia` ou `/visao-completa`;
- `/mapa-familiar` e `/mapa-familiar-horizontal` estão em favoritos;
- `/mapa-familiar` e `/mapa-familiar-horizontal` estão na busca global;
- retornar de perfil deve aceitar as duas views oficiais;
- favoritos de página apontam para rotas canônicas, não para estado de zoom/filtro.

---

## 9. Exportação

Documento canônico:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Views oficiais cobertas:

| Rota | Exportação |
|---|---|
| `/mapa-familiar` | Área, Imagem, PDF, Imprimir |
| `/mapa-familiar-horizontal` | Área, Imagem, PDF, Imprimir |

Observações:

- utilitários podem manter compatibilidade com raízes ReactFlow/legado;
- a documentação canônica deve descrever o produto ativo;
- se ReactFlow legado for removido futuramente, revisar `treeExport.ts`, CSS e docs no mesmo commit.

---

## 10. Painel, filtros e ações

No estado atual, `SidebarPanelTabs.tsx` ainda concentra:

- Zoom;
- Restaurar visualização;
- Vertical;
- Horizontal;
- Cores;
- Exportar;
- Destacar;
- barra **Filtros | Legendas | Ações**.

Frente futura já prevista:

- remover barra `Filtros | Legendas | Ações`;
- manter filtros/grupos visíveis diretamente;
- ocultar/remover Legendas e Ações;
- preservar Zoom, Restaurar/Fit, Vertical, Horizontal, Cores, Exportar e Destacar;
- atualizar `ARVORE_LEGENDAS_CONECTORES_PAINEL.md` e CSS no mesmo commit.

---

## 11. Histórico

Pasta:

```txt
docs/historico/
```

Uso correto:

- registrar decisões antigas;
- preservar contexto de QA;
- guardar diagnósticos e relatórios;
- evitar perda de histórico.

Uso incorreto:

- orientar implementação atual;
- restaurar rotas removidas;
- contradizer `ROTAS_E_GUARDS.md`;
- substituir migrations ou documentação canônica.

---

## 12. Checklist de não regressão

Antes de atualizar documentação ou código da árvore:

```bash
git status --short
npm run build
npm test
npm run test:e2e
git diff --check
rg "/minha-arvore|/genealogia|/visao-completa"
rg "TreeViewMode"
rg "FAVORITE_PAGES|GLOBAL_SEARCH_PAGES"
```

Revisar manualmente:

- `/` → `/mapa-familiar`;
- `/mapa-familiar` desktop/mobile;
- `/mapa-familiar-horizontal` desktop/mobile;
- alternância vertical/horizontal preservando `?pessoa=...`;
- retorno de perfil via `?voltar=...`;
- favoritos;
- busca global;
- exportação Área/Imagem/PDF/Imprimir;
- 404 para `/minha-arvore`, `/genealogia` e `/visao-completa`;
- `/minha-arvore/editar` continua protegida e funcional.

---

## 13. Regra final

Quando documentação e código divergirem, o fluxo correto é:

1. verificar o código atual;
2. classificar a divergência como doc desatualizada, bug ou decisão pendente;
3. atualizar documentação canônica;
4. preservar histórico em `docs/historico/` apenas quando necessário;
5. criar ou ajustar testes que impeçam regressão.
