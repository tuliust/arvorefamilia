# Guia de implementações - Árvore Família

> Última revisão: 2026-06-13  
> Local canônico: `docs/GUIA_IMPLEMENTACOES.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia canônico revisado contra o código atual com `/mapa-familiar` como rota raiz da árvore, `/mapa-familiar-horizontal` consolidada, exportação revisada, painel desktop/mobile, destaques, filtros de cônjuges/pets e documentação cruzada atualizada.

---

## 1. Objetivo

Este documento registra **o que já está implementado** no projeto **Árvore Família**, quais comportamentos estão consolidados e quais arquivos devem ser consultados para manutenção.

Este guia deve responder:

- o que existe hoje;
- qual é o comportamento esperado;
- quais decisões técnicas não devem ser reabertas sem motivo;
- onde está a documentação detalhada de cada tema.

Este guia **não** deve funcionar como:

- checklist de execução;
- roadmap detalhado;
- histórico longo de commits;
- manual de troubleshooting;
- documentação detalhada de cada tela.

Use também:

| Tema | Documento |
|---|---|
| Índice canônico | `docs/README.md` |
| Pendências reais e backlog | `docs/PLANO_PROXIMOS_PASSOS.md` |
| Componentes, props e responsabilidades | `docs/GUIA_COMPONENTES.md` |
| UX, layout, responsividade e microcopy | `docs/GUIA_UX_LAYOUT.md` |
| Sintomas, erros e correções | `docs/GUIA_CORRECAO_ERROS.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Arquitetura | `docs/arquitetura/ARCHITECTURE.md` |
| Supabase, migrations e SQL legado | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Funcionalidades específicas | `docs/funcionalidades/*.md` |

---

## 2. Estado consolidado do MVP

| Frente | Estado atual | Observação de manutenção |
|---|---|---|
| Rotas da árvore | Implementadas | `/` redireciona para `/mapa-familiar`; views oficiais: `/minha-arvore`, `/mapa-familiar`, `/mapa-familiar-horizontal`, `/genealogia`, `/visao-completa`. |
| Guards | Implementados | Árvore usa `TreeAccessRoute`; páginas de membro usam `MemberRoute`; admin usa `ProtectedRoute`. |
| Shell da Home | Implementado | `Home` é o shell das views da árvore; `HomeTreeSection` decide qual view renderizar. |
| Minha Árvore | Implementada | ReactFlow no desktop/tablet; `MobileFamilyTreeView` no mobile. |
| Mapa Familiar Vertical | Implementado | `/mapa-familiar` usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile. |
| Mapa Familiar Horizontal | Implementado | `/mapa-familiar-horizontal` usa `DesktopFamilyHorizontalMapView` em desktop/tablet/mobile, com colunas por geração. |
| Genealogia | Implementada | ReactFlow com `genealogyColumnsLayout`, escopo pessoal e chips/tabs mobile de geração. |
| Visão Completa | Implementada | ReactFlow com base ampliada/completa e `genealogyColumnsLayout`. |
| Painel desktop | Implementado | Zoom, Restaurar visualização, Vertical/Horizontal, Cores, Exportar, Destacar, Filtros, Legendas e Ações. |
| Painel mobile dos mapas | Implementado no escopo atual | `HomeMobileNav` abre painel inferior em `/mapa-familiar` e `/mapa-familiar-horizontal`; `MobileTreeControlsPortal` não duplica nessas rotas. |
| Paletas | Implementadas | `white`, `visual`, `orange`, `brown` por CSS variables e `localStorage`. |
| Exportação | Implementada no escopo atual | Área, Imagem, PDF e Imprimir para ReactFlow e Mapas Familiares HTML/CSS/SVG, com loading, título no canvas e tratamento de SVGs. |
| Favoritos | Primeira camada implementada | Pessoas, tópicos, eventos, arquivos e páginas de `FAVORITE_PAGES`; `/mapa-familiar` está incluso; `/mapa-familiar-horizontal` depende de decisão. |
| Busca global | Implementada | Pessoas e páginas de `GLOBAL_SEARCH_PAGES`; `/mapa-familiar` está incluso; `/mapa-familiar-horizontal` depende de decisão. |
| Perfil de pessoa | Implementado | Perfil público autenticado, dados, privacidade, arquivos, eventos, favoritos e sugestões. |
| Admin de pessoas | Implementado | Criação/edição, copiar ID, reset de perfil por RPC e dados complementares. |
| Relacionamentos | Implementados | Admin altera dados reais; usuário comum envia solicitação/sugestão conforme permissão. |
| Relacionamento conjugal | Implementado | Modal público, dados conjugais, tempo verbal ativo/inativo e arquivos históricos vinculados. |
| Arquivos históricos | Implementados | Storage para novos arquivos, compatibilidade com base64 legado e categorias históricas. |
| Eventos da vida / timeline | Implementados no escopo atual | Eventos derivados e manuais, com timeline combinada. |
| Grau de parentesco | Implementado | Utilitário puro, testes e integração em Home/perfil. |
| Curiosidades, conexão e IA | Implementadas | Modal de Curiosidades, conexão familiar e perguntas à IA com contexto estruturado. |
| Fórum | Implementado no escopo atual | Categorias, tópicos, respostas diretas, menções, favoritos, reações e notificações. |
| Notificações | Implementadas no escopo atual | Central, preferências, logs, dispatch interno/e-mail configurável. |
| Calendário familiar | Implementado | Datas familiares, filtros, ajustes mobile e integração Google Calendar quando configurada. |
| Deploy/cache | Implementado no escopo atual | Fallback SPA e recuperação para erro de chunk dinâmico. |
| Responsividade | Implementada no escopo MVP | Ajustes mobile/tablet consolidados nas principais áreas. |

---

## 3. Rotas, acesso e guards

Documentação detalhada: `docs/arquitetura/ROTAS_E_GUARDS.md`.

Arquivos principais:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/services/permissionService.ts
src/app/contexts/AuthContext.tsx
```

Comportamento consolidado:

- `/` redireciona para `/mapa-familiar`, preservando search params;
- `/minha-arvore`, `/mapa-familiar`, `/mapa-familiar-horizontal`, `/genealogia` e `/visao-completa` usam `TreeAccessRoute` e renderizam o shell `Home`;
- rotas de membro usam `MemberRoute`;
- rotas admin usam `ProtectedRoute`;
- `/admin/login` existe, mas não é caminho principal do menu de usuário;
- usuário comum não deve acessar rotas administrativas;
- item **Painel Admin** deve aparecer apenas para administradores.

Rotas autenticadas de árvore:

```txt
/
/minha-arvore
/mapa-familiar
/mapa-familiar-horizontal
/genealogia
/visao-completa
/busca
```

Rotas experimentais removidas:

```txt
/mapa-horizontal
/visao-completa-teste
```

---

## 4. Home, header, menu e painéis

Documentação detalhada:

```txt
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
```

Comportamento consolidado:

- Home pós-login é shell das views da árvore;
- `treeViewMode` é derivado da rota;
- troca de view preserva search params;
- header da árvore usa `HomeHeader`;
- páginas internas usam `MemberPageHeader`;
- menu do usuário usa `UserProfileMenu`;
- o painel desktop concentra zoom, restaurar visualização, alternância Vertical/Horizontal, cores, exportação e destaques;
- o painel mobile dos mapas é aberto por `HomeMobileNav`;
- `MobileTreeControlsPortal` retorna `null` em `/mapa-familiar` e `/mapa-familiar-horizontal`.

Títulos desktop atuais:

| View | Título |
|---|---|
| `minha-arvore` | `Árvore de {primeiroNome}` |
| `mapa-familiar` | `Mapa Familiar de {primeiroNome}` |
| `mapa-familiar-horizontal` | `Genealogia de {primeiroNome}` |
| `genealogia` | `Família de {primeiroNome}` |
| `visao-completa` | `Linha Genealógica de {primeiroNome}` |

---

## 5. Minha Árvore

Documentação detalhada: `docs/funcionalidades/MINHA_ARVORE_VIEW.md`.

Estado implementado:

- desktop/tablet usam `FamilyTree`/ReactFlow;
- layout direto usa `directFamilyDistributedLayout.ts`;
- filtros diretos controlam grupos;
- filtros de linhas controlam edges ReactFlow;
- destaques não recriam linhas ocultas;
- mobile usa `MobileFamilyTreeView`;
- `MobileFamilyTreeView` usa abas **Paterno | Central | Materno**;
- cards mobile exibem anos;
- card central mobile não exibe badge **Você**;
- conectores mobile são HTML/CSS, não ReactFlow.

Anti-regressões:

- não mover Mapa Familiar para dentro de `FamilyTree`;
- não fazer filtros de destaque alterarem dados;
- não usar CSS global que quebre ReactFlow ou Mapas Familiares.

---

## 6. Mapa Familiar Vertical

Documentação detalhada: `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`.

Estado implementado:

- rota autenticada `/mapa-familiar`;
- `treeViewMode` técnico `mapa-familiar`;
- desktop/tablet renderizam `DesktopFamilyMapView.tsx`;
- mobile usa `MobileFamilyTreeView.tsx`;
- dados vêm de `buildMobileFamilyTreeModel`;
- cards e grupos vêm de `FamilyTreeVisualCards.tsx`;
- layout usa configuração explícita de canvas, métricas, áreas, grupos e conectores;
- conectores principais são SVG por âncoras;
- conectores internos de cônjuges aparecem somente quando há relacionamento explícito;
- grupos são expansíveis;
- grupos com uma pessoa usam largura reduzida;
- modo wide é usado quando painel lateral está colapsado;
- título pode ocultar ao rolar a superfície do mapa;
- zoom e scroll são controlados pela view;
- exportação captura HTML/CSS/SVG.

Regras de cônjuges:

- cônjuge principal aparece quando existir;
- cônjuges de tataravós, bisavós e avós aparecem por padrão;
- cônjuges de tios, primos, sobrinhos, filhos e netos aparecem apenas quando filtro **Cônjuges** está ativo;
- contagem efetiva de **Cônjuges** considera o que a view renderiza como cônjuges filtráveis.

Destaques:

- `Destacar > Linhas` oculta conectores;
- `Destacar > Grupos` oculta molduras, fundos e títulos dos grupos;
- quando `Grupos` está ativo, labels `PAI`, `MÃE` e `CÔNJUGE` também são ocultados;
- grupos entram em modo `hideChrome`;
- conectores são recalculados para ficarem coerentes com os cards.

---

## 7. Mapa Familiar Horizontal

Documentação detalhada: `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`.

Estado implementado:

- rota autenticada `/mapa-familiar-horizontal`;
- `treeViewMode` técnico `mapa-familiar-horizontal`;
- renderização por `DesktopFamilyHorizontalMapView.tsx`;
- composição HTML/CSS/SVG própria;
- usa `pessoas.manual_generation` como fonte primária da coluna;
- gerações válidas de 1 a 6;
- fallback por inferência de relacionamentos quando necessário;
- colunas vazias são ocultadas;
- colunas restantes são compactadas;
- ordenação usa referência de `genealogyColumnsLayout`;
- filhos do mesmo casal são ordenados por nascimento;
- cônjuges da mesma geração ficam adjacentes;
- cônjuge central e cônjuges ancestrais são reincluídos quando passam nos filtros de vida;
- cônjuges de tios, primos, sobrinhos, filhos e netos dependem do filtro **Cônjuges**;
- cards usam `VisualPersonCard`;
- conectores SVG próprios conectam cônjuges e casal → filhos;
- exportação captura HTML/CSS/SVG;
- mobile usa a própria horizontal e uma barra visual **Paterno | Central | Materno**.

Destaques:

- `Destacar > Grupos` oculta cabeçalhos `Geração X`;
- cards sobem para ocupar a área dos cabeçalhos;
- conectores são recalculados;
- desativar o destaque restaura o layout.

---

## 8. Genealogia e Visão Completa

Documentação detalhada: `docs/funcionalidades/GENEALOGIA_VIEW.md`.

Estado implementado:

- ambas usam `FamilyTree`/ReactFlow;
- layout base: `genealogyColumnsLayout`;
- Genealogia usa escopo pessoal;
- Visão Completa usa base completa/ampliada;
- cabeçalhos `GERAÇÃO N` usam pílula escura;
- no mobile, chips/tabs de geração usam a mesma base inferida repassada para o canvas;
- ao alternar pessoa/view/conjunto de gerações, a geração ativa é resetada.

Anti-regressões:

- não usar `/visao-completa` como destino do botão **Horizontal**;
- não misturar rota horizontal com Genealogia;
- não persistir inferência visual em Supabase sem decisão.

---

## 9. Exportação da árvore

Documentação detalhada: `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

Estado implementado:

- botões:
  - Área;
  - Imagem;
  - PDF;
  - Imprimir;
- seleção retangular em `TreeAreaSelectionOverlay`;
- captura via `captureElementToCanvas`;
- corte via `cropCanvas`;
- download PNG;
- PDF com `jspdf`;
- impressão via janela própria;
- loading contextual de exportação;
- bloqueio de clique repetido durante processamento;
- exclusão de UI por `data-tree-export-ignore`, `data-tree-selection-overlay` e `data-tree-export-loading`;
- exportação com título no canvas;
- `printCanvas` assíncrono;
- tratamento de SVGs inline no clone do `html2canvas`;
- suporte a `captureVisibleAreaOnly` em seleção por área;
- limite preventivo de pixels.

Views cobertas:

| View | Estratégia |
|---|---|
| `/minha-arvore` | ReactFlow/root da árvore |
| `/genealogia` | ReactFlow/root da árvore |
| `/visao-completa` | ReactFlow/root da árvore |
| `/mapa-familiar` | HTML/CSS/SVG próprio |
| `/mapa-familiar-horizontal` | HTML/CSS/SVG próprio |

---

## 10. Cards visuais, avatares e paletas

Arquivos principais:

```txt
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/components/FamilyTree/directFamilyColors.ts
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/home-sidebar-unified.css
```

Estado implementado:

- `VisualPersonCard`;
- `VisualGroup`;
- `VisualPersonAvatar`;
- `VisualVitalLines`;
- avatar prioriza foto real;
- fallback visual usa `genero` e valores legados;
- pet usa ícone próprio;
- estrela e cruz usam classes semânticas;
- SVGs de avatar/status possuem classes para exportação:
  - `family-map-avatar-icon`;
  - `family-map-person-silhouette`;
  - `family-map-pet-icon`;
  - `family-map-status-icon`;
- paletas `white`, `visual`, `orange`, `brown` são aplicadas por CSS variables.

---

## 11. Filtros e contadores

Estados principais em `Home.tsx`:

```txt
edgeFilters
visualLineFilters
personFilters
directRelativeFilters
genealogyFilters
renderedDirectRelationCounts
```

Estado implementado:

- `directRelativeFilters` controla grupos diretos em Minha Árvore e Mapas Familiares;
- `personFilters` controla vivos/falecidos/pets;
- `edgeFilters` controla linhas ReactFlow;
- `visualLineFilters` controla destaques/ocultação visual;
- as views do Mapa Familiar podem enviar contagens renderizadas para o painel;
- para Mapas Familiares, `conjuge` no painel usa contagem efetiva quando disponível.

Observação atual:

- em mobile, `minha-arvore` usa `DEFAULT_DIRECT_RELATIVE_FILTERS`;
- em outras views, usa o estado persistido dos filtros diretos;
- revisar comportamento de `Pets` em documentação específica de filtros quando o próximo lote for atualizado.

---

## 12. Busca global e favoritos

Estado atual:

- `GLOBAL_SEARCH_PAGES` inclui `/mapa-familiar`;
- `FAVORITE_PAGES` inclui `/mapa-familiar`;
- `/mapa-familiar-horizontal` não está cadastrado como página independente nesses arrays.

Pendência de decisão:

```txt
Definir se a horizontal deve ser buscável/favoritável como página própria.
```

Se sim, atualizar:

```txt
src/app/services/globalSearchService.ts
src/app/constants/favoritePages.ts
docs/funcionalidades/FAVORITOS.md
docs/README.md
```

---

## 13. Demais módulos implementados

### 13.1 Pessoas, perfis e admin

- admin cria/edita pessoas;
- usuário edita os próprios dados conforme permissão;
- usuário sem permissão envia sugestão;
- reset administrativo via RPC não apaga relacionamentos;
- dados sensíveis respeitam permissões;
- endereço pode usar Google Places quando configurado.

### 13.2 Arquivos históricos e Storage

- novos arquivos usam Storage;
- base64 legado permanece compatível;
- arquivos podem estar ligados a pessoa ou relacionamento;
- preview de imagem/PDF é suportado quando possível;
- categorias históricas são tipadas.

### 13.3 Eventos da vida e timeline

- eventos pessoais podem ser criados/editados;
- timeline combina fatos derivados e eventos manuais;
- eventos manuais vêm de `person_events`.

### 13.4 Fórum, notificações e calendário

- fórum possui categorias, tópicos, respostas, menções, favoritos e reações;
- notificações possuem central, preferências e logs;
- calendário familiar usa datas familiares e integração Google Calendar quando configurada.

### 13.5 Curiosidades, conexão e IA

- modal de Curiosidades reúne abas informativas;
- descoberta de conexão familiar usa contexto da árvore;
- IA usa `/api/ai` quando configurada;
- respostas devem respeitar privacidade e fallback controlado.

---

## 14. Anti-regressões gerais

Não fazer sem revisão:

- trocar `/` para `/minha-arvore`;
- recriar rotas experimentais;
- usar `/visao-completa` como horizontal;
- capturar `.react-flow` para exportar Mapas Familiares;
- remover marcadores de ignore de exportação;
- reativar `MobileTreeControlsPortal` em `/mapa-familiar` ou `/mapa-familiar-horizontal`;
- fazer CSS de conectores afetar SVGs de avatar/status;
- usar `allowTaint: true` em exportação sem revisão;
- persistir inferência visual de geração no banco;
- criar migration para ajuste puramente visual;
- esconder permissão apenas por UI.

---

## 15. Pendências que devem ficar no plano

Registrar/acompanhar em `docs/PLANO_PROXIMOS_PASSOS.md`:

- QA visual da exportação em navegador autenticado real;
- QA de avatares SVG exportados;
- QA do modo wide do Mapa Familiar Vertical;
- QA da horizontal em famílias grandes;
- decidir busca/favorito para `/mapa-familiar-horizontal`;
- definir comportamento funcional da barra mobile `Paterno | Central | Materno` da horizontal;
- revisar documentação de Genealogia, Minha Árvore e filtros/pets no próximo lote;
- revisar histórico consolidado após fechar todos os lotes documentais.
