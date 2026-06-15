# Documentação — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/README.md`  
> Tipo: índice canônico da documentação.  
> Status: revisado contra `main` após auditoria de rotas, componentes, services, migrations, scripts, estilos e configuração.

Este diretório concentra a documentação técnica, funcional, operacional e histórica do projeto `tuliust/arvorefamilia`.

Use este arquivo como ponto de entrada. Quando houver conflito entre documento e implementação, o código da `main` prevalece e a documentação deve ser corrigida. Conteúdo histórico não é fonte de verdade para comportamento vigente.

---

## 1. Baseline atual confirmada no código

### Rotas oficiais da árvore

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
```

- `/` redireciona para `/mapa-familiar`, preservando a query string.
- `/mapa-familiar` é a view vertical principal.
- `/mapa-familiar-horizontal` é a view horizontal/genealógica.
- `TreeViewMode` possui apenas `mapa-familiar` e `mapa-familiar-horizontal`.

### Rotas antigas removidas como views ativas

```txt
/minha-arvore
/genealogia
/visao-completa
```

Essas rotas só podem aparecer como histórico, teste de não regressão ou keyword que aponta para rota atual.

### Exceção nominal vigente

```txt
/minha-arvore/editar
```

Essa página continua ativa como edição de dados/vínculos do membro e não reativa a antiga view `/minha-arvore`.

### Renderização das duas views

| Rota | Desktop/tablet | Mobile |
|---|---|---|
| `/mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `MobileFamilyHorizontalMapView` |

### Rotas principais de produto

| Área | Rotas vigentes |
|---|---|
| Login/legal | `/entrar`, `/termos`, `/privacidade` |
| Busca | `/busca` |
| Perfil | `/pessoa/:id`, `/pessoas/:id` |
| Membro | `/minha-arvore/editar`, `/meus-dados`, `/meus-vinculos`, `/vincular-perfil` |
| Calendário | `/calendario-familiar` |
| Favoritos | `/meus-favoritos` |
| Notificações | `/notificacoes`, `/ajustar-notificacoes` |
| Fórum | `/forum`, `/forum/novo`, `/forum/topico/:id`, `/forum/topico/:id/editar` |
| Admin | `/admin`, `/admin/login`, `/admin/dashboard`, `/admin/home`, `/admin/pessoas`, `/admin/relacionamentos`, `/admin/importacao`, `/admin/migrar-dados`, `/admin/diagnostico`, `/admin/integridade`, `/admin/atividades`, `/admin/notificacoes`, `/admin/solicitacoes-vinculos` |

---

## 2. Estado implementado x pendência

A documentação deve distinguir comportamento implementado de contrato desejado ainda pendente.

| Tema | Estado na `main` | Documento de acompanhamento |
|---|---|---|
| Duas views oficiais da árvore | Implementado | `BASELINE_PRODUTO_ATUAL.md`, `funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Painel desktop sem `Filtros | Legendas | Ações` | Implementado | `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Modal mobile de controles sem zoom/exportação | Implementado | `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Paletas `white`, `visual`, `orange`, `brown` | Implementado | `GUIA_UX_LAYOUT.md`, `MAPA_FAMILIAR_VIEW.md` |
| Exportação Área/PNG/PDF/Imprimir | Implementado nas views oficiais | `funcionalidades/EXPORTACAO_ARVORE.md` |
| Calendário mobile com 5 categorias em linha | Implementado por CSS específico | `funcionalidades/CALENDARIO_FAMILIAR.md` |
| `Nascimento não informado` oculto no mobile | Resultado visual depende de limpeza DOM em `src/main.tsx`; refatoração pendente | `PLANO_PROXIMOS_PASSOS.md#TREE-004` |
| Cônjuges de `pais`/Geração 4 na horizontal | Pendente: código não inclui `pais` em `FILTERABLE_SPOUSE_ANCHOR_GROUPS` | `PLANO_PROXIMOS_PASSOS.md#TREE-003` |
| Dropdown `Visualizar como...` | Debug temporário em produto | `PLANO_PROXIMOS_PASSOS.md#TREE-005` |

---

## 3. Guias canônicos na raiz de `docs/`

| Arquivo | Papel | Status após auditoria |
|---|---|---|
| `README.md` | Índice da documentação. | Atualizado. |
| `BASELINE_PRODUTO_ATUAL.md` | Fonte de verdade funcional da `main`. | Atualizado para separar implementado de pendências. |
| `INVENTARIO_TECNICO.md` | Inventário de rotas, arquivos, CSS, scripts, migrations e funções. | Atualizado. |
| `GUIA_IMPLEMENTACOES.md` | O que está implementado e o que é dívida/backlog. | Atualizado. |
| `GUIA_COMPONENTES.md` | Componentes, responsabilidades e riscos de regressão. | Atualizado. |
| `GUIA_UX_LAYOUT.md` | UX, layout, responsividade, paletas e microcopy. | Atualizado. |
| `REGRAS_DE_NAO_REGRESSAO.md` | Checklist técnico/funcional para mudanças futuras. | Atualizado. |
| `DECISOES_ARQUITETURAIS.md` | ADRs e decisões estruturais vigentes. | Atualizado. |
| `PLANO_PROXIMOS_PASSOS.md` | Pendências, riscos, QA e decisões futuras. | Atualizado. |
| `GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma. | Preservado. |
| `ATTRIBUTIONS.md` | Licenças e atribuições. | Preservado. |

---

## 4. Arquitetura

| Arquivo | Papel |
|---|---|
| `docs/arquitetura/ARCHITECTURE.md` | Visão sintética da arquitetura atual, stack, camadas, árvore, API local/serverless, Supabase, Storage e Edge Functions. |
| `docs/arquitetura/ROTAS_E_GUARDS.md` | Rotas, guards, redirects, lazy loading, fallback SPA e rotas removidas. |
| `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Modelo de usuários, perfis, pessoas, vínculos e permissões. |

---

## 5. Funcionalidades

| Arquivo | Escopo |
|---|---|
| `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` | Documento principal das duas views da árvore. |
| `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Painel, filtros, controles, conectores e destaques. |
| `docs/funcionalidades/EXPORTACAO_ARVORE.md` | Exportação por área, imagem, PDF e impressão. |
| `docs/funcionalidades/CALENDARIO_FAMILIAR.md` | Calendário, categorias, filtros mobile e Google Agenda. |
| `docs/funcionalidades/FAVORITOS.md` | Favoritos de páginas, pessoas e conteúdos. |
| `docs/funcionalidades/FORUM.md` | Fórum, tópicos, respostas, reações, favoritos e notificações. |
| `docs/funcionalidades/NOTIFICACOES.md` | Notificações internas/e-mail, preferências, logs e Edge Functions. |
| `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md` | Perfil, admin de pessoas, privacidade, arquivos, eventos e sugestões. |
| `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | Edição da própria árvore/perfil do membro. |
| `docs/funcionalidades/TIMELINE.md` | Timeline de eventos da pessoa. |
| `docs/funcionalidades/CURIOSIDADES_E_IA.md` | Curiosidades, IA e insights gerados. |

---

## 6. Operação

| Arquivo | Uso |
|---|---|
| `docs/operacao/README.md` | Índice operacional. |
| `docs/operacao/DEPLOY.md` | Checklist rápido de deploy. |
| `docs/operacao/DEPLOYMENT.md` | Guia completo de build, cache, deploy, serverless, Supabase, OAuth e QA. |
| `docs/operacao/MIGRATIONS_SUPABASE.md` | Procedimento para migrations. |
| `docs/operacao/OAUTH_GOOGLE.md` | OAuth Google/Agenda e modo Testing. |
| `docs/operacao/STORAGE_MAINTENANCE.md` | Storage, buckets, upload e manutenção. |

`DEPLOY.md` e `DEPLOYMENT.md` não são duplicados: o primeiro é atalho, o segundo é o guia completo.

---

## 7. Histórico

Documentos em `docs/historico/` preservam contexto, mas não definem comportamento ativo.

| Arquivo | Status |
|---|---|
| `historico/README.md` | Índice histórico. |
| `historico/MINHA_ARVORE_VIEW.md` | Legado da antiga view `/minha-arvore`. |
| `historico/MINHA_ARVORE_FILTROS_E_PETS.md` | Legado de filtros/pets da antiga view. |
| `historico/GENEALOGIA_VIEW.md` | Legado da antiga view `/genealogia`. |

---

## 8. Validações mínimas

Para alterações documentais:

```bash
git diff --check -- docs/
npm run build
```

Para alterações que mencionem rotas, guards, árvore, navegação ou fluxo crítico:

```bash
npm test
npm run test:e2e
```

Para revisão antes de commit:

```bash
git status --short
git diff --check
git diff --cached --stat
git diff --cached --check
```

Não usar `git add .` quando a frente for documental.