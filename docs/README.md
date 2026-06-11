# Documentação - Árvore Família

> Última revisão: 2026-06-11  
> Local canônico: `docs/README.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: índice canônico revisado após a criação de `/mapa-familiar-horizontal`, limpeza das rotas experimentais, atualização do painel desktop/mobile e consolidação das regras de filtros, conectores e exportação das views da árvore.

Este diretório concentra a documentação técnica, funcional, operacional e histórica do projeto **Árvore Família**.

Use este arquivo como ponto de entrada antes de consultar guias específicos. A documentação deve registrar apenas o comportamento implementado ou pendências explicitamente classificadas como backlog/QA. Conteúdo histórico não substitui os guias canônicos atuais.

---

## 1. Estado atual consolidado

A revisão mais recente registra:

- `/entrar` continua funcionando como home pública, login, primeiro acesso e aceite legal;
- enquanto a autorização OAuth do Google não for concedida, a integração com Google Agenda deve operar em modo **Testing**, com usuários liberados manualmente como test users no Google Cloud;
- a rota raiz `/` redireciona para `/mapa-familiar`, preservando search params;
- as views principais da árvore são:
  - **Minha Árvore** — `/minha-arvore`;
  - **Mapa Familiar Vertical** — `/mapa-familiar`;
  - **Mapa Familiar Horizontal** — `/mapa-familiar-horizontal`;
  - **Genealogia** — `/genealogia`;
  - **Visão Completa** — `/visao-completa`;
- as rotas experimentais `/mapa-horizontal` e `/visao-completa-teste` foram removidas;
- `/mapa-familiar` usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile;
- `/mapa-familiar-horizontal` usa `DesktopFamilyHorizontalMapView`, inclusive em mobile, com superfície HTML/CSS/SVG própria;
- o painel desktop exibe botões **Vertical** e **Horizontal**:
  - **Vertical** → `/mapa-familiar`;
  - **Horizontal** → `/mapa-familiar-horizontal`;
- o painel de `/mapa-familiar-horizontal` usa os mesmos filtros de grupos, filtros de vida, paletas e ações do painel de `/mapa-familiar`;
- o filtro **Cônjuges** foi incluído no painel;
- cônjuges da pessoa central e cônjuges de avós, bisavós e tataravós permanecem visíveis quando existirem;
- cônjuges de tios, primos, sobrinhos e filhos dependem do filtro **Cônjuges**;
- o filtro **Pets** ainda exige revisão em `Home.tsx`, pois `directRelativeFilters.pets` é forçado como `true` em uma etapa da composição;
- `/mapa-familiar-horizontal` organiza cards por `pessoas.manual_generation`, limitado de 1 a 6, com fallback por inferência;
- colunas vazias em `/mapa-familiar-horizontal` são ocultadas e as demais colunas são compactadas;
- filhos de um casal em `/mapa-familiar-horizontal` são ordenados do mais velho para o mais novo;
- conectores de `/mapa-familiar-horizontal` são SVG próprios:
  - linha vertical entre cônjuges;
  - linha horizontal do meio do casal até o gap;
  - tronco vertical no gap;
  - ramais horizontais até os filhos;
  - distribuição de troncos no eixo X para evitar sobreposição;
- `/visao-completa` continua como view própria baseada em ReactFlow/genealogy layout;
- os cabeçalhos `GERAÇÃO N` em Genealogia/Visão Completa usam pílula escura, sem caixa branca;
- `Ctrl/Cmd + +`, `Ctrl/Cmd + -`, `Ctrl/Cmd + 0` e `Ctrl/Cmd + scroll` devem afetar somente o zoom interno da árvore, não o zoom do navegador, quando houver árvore renderizada;
- mobile:
  - `/mapa-familiar` mantém a toggle nativa **Paterno | Central | Materno** do `MobileFamilyTreeView`;
  - `/mapa-familiar-horizontal` exibe barra visual **Paterno | Central | Materno**, com **Central** ativo por padrão e comportamento funcional ainda pendente;
  - o botão de controle mobile fica na mesma faixa da toggle;
  - o botão abre o painel mobile baseado no mesmo conteúdo do painel desktop;
  - `MobileTreeControlsPortal` não renderiza seu painel antigo em `/mapa-familiar` e `/mapa-familiar-horizontal`.

---

## 2. Regras de uso da documentação

Regras gerais:

- arquivos na raiz de `docs/` são guias canônicos gerais;
- arquivos em `docs/funcionalidades/` são guias canônicos de comportamento funcional específico;
- arquivos em `docs/arquitetura/` são guias canônicos de rotas, guards, arquitetura e modelo de usuários/dados;
- arquivos em `docs/operacao/` são procedimentos operacionais e de manutenção;
- arquivos em `docs/comandos/` são checklists/comandos auxiliares;
- `docs/historico/README.md` é o único resumo histórico consolidado;
- pendências reais, bugs prováveis e decisões futuras devem ficar em `PLANO_PROXIMOS_PASSOS.md`;
- scripts SQL soltos, diagnósticos antigos e documentação removida não substituem `supabase/migrations` nem os guias canônicos;
- quando houver divergência entre documentação e código atual, revisar o código e atualizar o guia canônico antes de fazer novas alterações.

Quando houver divergência entre um guia atual e conteúdo histórico, prevalece o guia atual.

---

## 3. Guias oficiais na raiz de `docs/`

| Arquivo | Uso |
|---|---|
| `README.md` | Índice canônico da documentação. |
| `GUIA_IMPLEMENTACOES.md` | Inventário consolidado do que já foi implementado. Deve ser revisado para incluir `/mapa-familiar-horizontal` se ainda não estiver atualizado. |
| `GUIA_COMPONENTES.md` | Componentes, responsabilidades, padrões de uso e anti-regressões. Deve cobrir `DesktopFamilyMapView`, `DesktopFamilyHorizontalMapView`, `MobileFamilyTreeView`, `FamilyTreeVisualCards`, `HomeMobileNav` e `MobileTreeControlsPortal`. |
| `GUIA_UX_LAYOUT.md` | UX, layout, responsividade, headers, árvore, menus, painéis, paletas, Mapa Familiar Vertical/Horizontal e microcopy. |
| `GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma, causa provável e correção. Pode receber complemento específico sobre `/mapa-familiar-horizontal`. |
| `PLANO_PROXIMOS_PASSOS.md` | Pendências reais, bloqueios, QA futuro e backlog pós-MVP. Deve incluir QA da horizontal, filtro Pets e comportamento futuro da barra mobile. |
| `ATTRIBUTIONS.md` | Licenças, atribuições e cuidados com assets externos. |

---

## 4. Arquitetura

Pasta:

```txt
docs/arquitetura/
```

| Arquivo | Uso |
|---|---|
| `arquitetura/ARCHITECTURE.md` | Visão sintética da arquitetura atual, stack, camadas, views da árvore, `DesktopFamilyMapView`, `DesktopFamilyHorizontalMapView`, paletas e integrações. |
| `arquitetura/ROTAS_E_GUARDS.md` | Rotas públicas, home `/entrar`, rotas de árvore incluindo `/mapa-familiar-horizontal`, rotas de membro, rotas administrativas, guards, OAuth/compliance e redirecionamentos. |
| `arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Modelo de usuários, pessoas, vínculos, permissões, favoritos, fórum, notificações e objetos legados. |

---

## 5. Funcionalidades

Pasta:

```txt
docs/funcionalidades/
```

| Arquivo | Escopo |
|---|---|
| `funcionalidades/PESSOAS_PERFIL_ADMIN.md` | Perfil público, perfil admin, reset, sugestões, privacidade, arquivos, eventos e relacionamento conjugal. |
| `funcionalidades/MINHA_ARVORE_VIEW.md` | View direta da árvore, ReactFlow desktop/tablet, viewport, layout central, filtros diretos e `MobileFamilyTreeView`. |
| `funcionalidades/MAPA_FAMILIAR_VIEW.md` | Documento canônico de `/mapa-familiar` e `/mapa-familiar-horizontal`: Vertical, Horizontal, cards, grupos, conectores, filtros, paletas, exportação, mobile e anti-regressões. |
| `funcionalidades/GENEALOGIA_VIEW.md` | Genealogia, Visão Completa, gerações, chips mobile, cabeçalhos de coluna, reset de geração ativa, inferência visual e QA. Deve refletir pílulas escuras dos cabeçalhos. |
| `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Legendas, linhas, conectores ReactFlow, conectores HTML/CSS mobile, conectores SVG do Mapa Familiar Vertical/Horizontal, filtros, destaques, painel lateral e ações. |
| `funcionalidades/MINHA_ARVORE_EDITAR.md` | Edição da própria árvore, avatar, arquivos, eventos pessoais, dados próprios, CSS mobile escopado e saída sem salvar. |
| `funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` | Filtros da Minha Árvore, separação humanos/pets, contadores, modo foco e impacto no Mapa Familiar. Deve registrar a pendência atual do filtro de grupo **Pets**. |
| `funcionalidades/FORUM.md` | Fórum, categorias, tópicos, menções, respostas diretas, reações, favoritos, vínculos técnicos e notificações. |
| `funcionalidades/NOTIFICACOES.md` | Notificações internas/e-mail, preferências, logs, Edge Functions, fórum e cron futuro. |
| `funcionalidades/CALENDARIO_FAMILIAR.md` | Calendário familiar, categorias, filtros mobile, Google Agenda, compliance OAuth, microcopy e QA. |
| `funcionalidades/TIMELINE.md` | Timeline de pessoa, eventos derivados, `person_events`, arquivos históricos, relacionamentos e pós-MVP. |
| `funcionalidades/EXPORTACAO_ARVORE.md` | Exportação da área visível/capturável em PNG, PDF e impressão, incluindo captura HTML/CSS/SVG de `/mapa-familiar` e `/mapa-familiar-horizontal`. |
| `funcionalidades/FAVORITOS.md` | Favoritos de pessoas/páginas. Revisar se `/mapa-familiar-horizontal` deve entrar em `FAVORITE_PAGES` como página própria. |

---

## 6. Operação

Pasta:

```txt
docs/operacao/
```

| Arquivo | Uso |
|---|---|
| `operacao/MIGRATIONS_SUPABASE.md` | Migrations versionadas, ordem de aplicação, validação e rollback. |
| `operacao/DEPLOY.md` | Deploy, build, Vercel/hosting, variáveis e checagens. |
| `operacao/OAUTH_GOOGLE.md` | Operação Google OAuth, test users e compliance. |

---

## 7. Rotas da árvore

Rotas protegidas por `TreeAccessRoute`:

```txt
/
/minha-arvore
/mapa-familiar
/mapa-familiar-horizontal
/genealogia
/visao-completa
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

Contrato atual de view:

```ts
export type TreeViewMode =
  | 'minha-arvore'
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal'
  | 'genealogia'
  | 'visao-completa';
```

Rotas experimentais removidas:

```txt
/mapa-horizontal
/visao-completa-teste
```

---

## 8. Mapa rápido de arquivos de código por documentação

| Escopo | Arquivos principais |
|---|---|
| Rotas | `src/app/routes.tsx`, `src/app/components/FamilyTree/treeViewMode.ts` |
| Shell da Home | `src/app/pages/Home.tsx`, `src/app/pages/home/HomeTreeSection.tsx`, `src/app/pages/home/HomeHeader.tsx`, `src/app/pages/home/HomeMobileNav.tsx` |
| Painel desktop/mobile | `src/app/pages/home/SidebarPanelTabs.tsx`, `DirectRelationKpiGrid.tsx`, `DirectRelativeFilterGrid.tsx`, `LifeStatusKpiGrid.tsx`, `SidebarInfoPanel.tsx` |
| Minha Árvore ReactFlow | `src/app/components/FamilyTree/FamilyTree.tsx`, `directFamilyDistributedLayout.ts` |
| Mapa Familiar Vertical | `src/app/components/FamilyTree/DesktopFamilyMapView.tsx` |
| Mapa Familiar Horizontal | `src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx` |
| Mobile segmentado | `src/app/components/FamilyTree/MobileFamilyTreeView.tsx` |
| Cards visuais | `src/app/components/FamilyTree/FamilyTreeVisualCards.tsx` |
| Paletas | `src/app/components/FamilyTree/treeColorPalettes.ts`, `src/styles/family-map-*.css` |
| Exportação | `src/app/components/FamilyTree/utils/treeExport.ts` |
| Controles mobile antigos | `src/app/components/FamilyTree/MobileTreeControlsPortal.tsx` |

---

## 9. Pendências documentais e de QA

Pendências atuais:

1. Corrigir ou decidir a regra final de `directRelativeFilters.pets` em `Home.tsx`.
2. Definir a função da barra **Paterno | Central | Materno** em `/mapa-familiar-horizontal`.
3. Validar mobile em iOS/Safari e Android:
   - 320px;
   - 375px;
   - 390px;
   - 430px.
4. Validar conectores de `/mapa-familiar-horizontal` com filtros ligados/desligados:
   - Cônjuges;
   - Tios;
   - Primos;
   - Sobrinhos;
   - Filhos;
   - Pets.
5. Revisar se `/mapa-familiar-horizontal` deve entrar em:
   - busca global;
   - favoritos de página;
   - atalhos do menu do usuário.
6. Rodar build e diff check após alterações:
   ```bash
   npm run build
   git diff --check
   ```

---

## 10. Regra anti-regressão documental

Antes de atualizar qualquer guia:

1. conferir código atual;
2. separar comportamento implementado de intenção futura;
3. registrar pendência explicitamente quando ainda não estiver implementada;
4. evitar duplicar documentação técnica em muitos arquivos;
5. manter `README.md` como índice e não como documentação detalhada da feature.
