# Guia de implementações - Árvore Família

> Última revisão: 2026-06-09  
> Local canônico: `docs/GUIA_IMPLEMENTACOES.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia canônico revisado para refletir o estado implementado do MVP após ajustes de fórum, relacionamento conjugal, cache/deploy, reset de perfil e views da árvore.

## Objetivo

Este documento registra **o que já está implementado** no projeto **Árvore Família**, quais comportamentos estão consolidados e quais arquivos devem ser consultados para manutenção.

Este guia deve responder:

- o que existe hoje;
- qual é o comportamento esperado;
- quais decisões técnicas não devem ser reabertas sem motivo;
- onde está a documentação detalhada de cada tema.

Este guia **não** deve funcionar como:

- checklist de execução;
- roadmap;
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
| Estrutura de usuários, pessoas e banco | `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| Supabase, migrations e SQL legado | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Deploy e cache | `docs/operacao/DEPLOYMENT.md` |
| Funcionalidades específicas | `docs/funcionalidades/*.md` |

---

## 1. Estado consolidado do MVP

As frentes principais do MVP estão implementadas no escopo atual. Pendências visuais e funcionais antigas foram removidas deste guia por já terem sido finalizadas/validadas. Novas divergências encontradas durante revisão ou QA devem ser registradas em `docs/PLANO_PROXIMOS_PASSOS.md`.

| Frente | Estado atual | Observação de manutenção |
|---|---|---|
| Árvore familiar | Implementada | `/minha-arvore`, `/genealogia` e `/visao-completa` usam o shell autenticado da Home com ReactFlow. |
| Minha Árvore | Implementada | Layout próprio em torno da pessoa central, filtros diretos, pets, conectores, botão conjugal e controles mobile dedicados. Cards e grupos centrais possuem largura ampliada controlada. |
| Genealogia | Implementada | Layout por gerações, chips mobile, inferência em memória de gerações quando necessário e reset mobile de geração ativa por view. Não deve herdar largura da Minha Árvore. |
| Visão Completa | Implementada | Layout por gerações/blocos, navegação mobile por chips e reset de geração ao alternar views. Mantém padrão de cards das views por geração. |
| Perfil de pessoa | Implementado | Perfil público autenticado, dados pessoais, privacidade, arquivos, eventos, favoritos e sugestões. |
| Admin de pessoas | Implementado | Criação/edição, copiar ID e reset de perfil por RPC sem apagar relacionamentos. Existe migration de reforço para garantir a RPC no Supabase remoto. |
| Relacionamentos | Implementados | Admin altera dados reais; usuário comum envia solicitação/sugestão conforme permissão. |
| Relacionamento conjugal | Implementado | Modal público com texto humano, tempo verbal ativo/inativo, formulário de informações e arquivos históricos vinculados ao relacionamento. |
| Arquivos históricos | Implementados | Storage para novos arquivos, compatibilidade com base64 legado, categoria histórica e categorias específicas por contexto. |
| Eventos da vida / timeline | Implementados no escopo atual | Eventos derivados e manuais existem; título redundante embutido é ocultado em `/minha-arvore/editar`; upload por evento, privacidade por evento e PDF ficam como evolução futura. |
| Astrologia/acontecimentos | Implementados no escopo atual | Perfil lê insights persistidos; geração/regeneração é ação admin/server-side. |
| WhatsApp no perfil | Implementado no frontend | Botão depende de telefone válido e permissão; não há WhatsApp Business API no MVP. |
| Grau de parentesco/vínculo | Implementado | Utilitário puro, testes unitários e integração em Home/perfil. Narrativas refinadas para pai/mãe e tutor de pet. |
| Favoritos | Primeira camada implementada | Serviço suporta `entity_type`; UI real consolidada inclui favoritos de pessoa e tópicos de fórum. Expansão para outras entidades deve ser estudada. |
| Página de favoritos | Implementada | Lista, busca, filtros, abertura e remoção de favoritos. |
| Fórum | Implementado | Categorias, tópicos, respostas, comentários, menções, vínculos automáticos com pessoas mencionadas, avatares, badges e reações. Campo manual de Pessoas Relacionadas foi removido da criação/edição. |
| Reações do fórum | Implementadas | Uma reação por usuário/alvo, troca/remoção e constraint de unicidade em migration. |
| Notificações | Implementadas no escopo atual | Central, preferências, logs, dispatch interno/e-mail configurável e gatilhos de fórum/arquivos/vínculos. Cron externo fica operacional. |
| Calendário familiar | Implementado | Datas familiares, sidebar de categorias, filtros e ajustes de mobile. |
| Home pública/legal | Implementada | `/entrar`, aceite legal no primeiro acesso, páginas legais e `noindex/nofollow`. |
| Headers e menu | Implementados | Páginas internas usam `MemberPageHeader`; views da árvore usam `HomeHeader` com `UserProfileMenu`; menu mobile recebeu paleta por portal. |
| Paletas da árvore | Implementadas | `white`, `orange` e `brown` por CSS variables e `localStorage`, incluindo exibição no menu mobile. |
| Exportação da árvore | Implementada no escopo atual | Seleção/exportação de área visível em PNG/PDF/impressão e painel mobile rápido; exportação integral fica pós-MVP. |
| Deploy/cache | Implementado no escopo atual | `vercel.json` define fallback SPA e cache correto; `src/main.tsx` possui recuperação para erro de chunk dinâmico. |
| Responsividade | Implementada no escopo MVP | Ajustes mobile/tablet consolidados em layout, headers, árvore, fórum, calendário, perfil, modais e `/minha-arvore/editar`. |

---

## 2. Stack e arquitetura base

Stack em uso:

- React 18;
- React Router 7;
- Vite 6;
- TypeScript;
- Tailwind CSS 4;
- Supabase Auth;
- Supabase Postgres, RLS, RPCs e Storage;
- Supabase Edge Functions;
- `lucide-react`;
- ReactFlow/Dagre;
- `html2canvas` e `jspdf`;
- `react-easy-crop`;
- Vitest;
- Playwright.

Áreas implementadas no MVP:

- árvore familiar;
- perfil de pessoa;
- admin de pessoas;
- admin de relacionamentos;
- solicitações de vínculo/relacionamento;
- sugestões de informações de perfil e relacionamento conjugal;
- arquivos históricos;
- eventos da vida;
- fórum;
- notificações;
- calendário familiar;
- favoritos;
- insights persistidos;
- grau de parentesco;
- exportação de área da árvore;
- paletas visuais da árvore;
- responsividade mobile/tablet;
- fallback e cache de SPA.

Regras de arquitetura:

- `supabase/migrations` é a fonte da verdade do schema.
- Scripts SQL soltos são históricos, diagnósticos ou operacionais.
- Ajustes visuais não devem criar migration.
- Mudanças de schema devem ser documentadas em `docs/operacao/MIGRATIONS_SUPABASE.md`.
- Detalhes de deploy/cache pertencem a `docs/operacao/DEPLOYMENT.md`.
- Detalhes de rotas/guards pertencem a `docs/arquitetura/ROTAS_E_GUARDS.md`.
- Detalhes funcionais pertencem aos arquivos em `docs/funcionalidades/`.

---

## 3. Rotas, acesso e guards

Documentação detalhada: `docs/arquitetura/ROTAS_E_GUARDS.md`.

Arquivos principais:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/services/permissionService.ts
src/app/contexts/AuthContext.tsx
```

Comportamento consolidado:

- `/` redireciona para `/minha-arvore`, preservando search params;
- `/minha-arvore`, `/genealogia` e `/visao-completa` usam `TreeAccessRoute` e renderizam `Home`;
- rotas de membro usam `MemberRoute`;
- rotas admin usam `ProtectedRoute`;
- `/admin/login` existe, mas não deve ser o caminho principal do menu de usuário;
- usuário comum não deve acessar rotas administrativas;
- o item **Painel administrativo** deve aparecer apenas para administradores;
- o cabeçalho clicável do menu do usuário navega para `/minha-arvore/editar`.

Rotas públicas:

```txt
/entrar
/termos
/privacidade
```

Rotas autenticadas de árvore:

```txt
/
/minha-arvore
/genealogia
/visao-completa
/busca
```

Rotas autenticadas de membro:

```txt
/minha-arvore/editar
/meus-dados
/meus-vinculos
/vincular-perfil
/pessoa/:id
/pessoas/:id
/calendario-familiar
/meus-favoritos
/notificacoes
/ajustar-notificacoes
/forum
/forum/novo
/forum/topico/:id
/forum/topico/:id/editar
```

Rotas administrativas:

```txt
/admin
/admin/login
/admin/dashboard
/admin/home
/admin/pessoas
/admin/pessoas/nova
/admin/pessoas/:id
/admin/pessoas/:id/editar
/admin/relacionamentos
/admin/relacionamentos/novo
/admin/importacao
/admin/migrar-dados
/admin/diagnostico
/admin/integridade
/admin/atividades
/admin/notificacoes
/admin/solicitacoes-vinculos
```

---

## 4. Home, headers, menu, paletas e controles mobile

Documentação detalhada:

- `docs/GUIA_UX_LAYOUT.md`;
- `docs/GUIA_COMPONENTES.md`;
- `docs/funcionalidades/MINHA_ARVORE_VIEW.md`;
- `docs/funcionalidades/GENEALOGIA_VIEW.md`.

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/components/layout/MobileUserMenuPalettePortal.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/app/components/FamilyTree/treeColorPalettes.ts
src/styles/mobile-tree-controls.css
src/styles/mobile-edit-profile.css
src/main.tsx
```

Comportamento consolidado:

- Home pós-login é o shell das três views da árvore;
- `treeViewMode` é derivado da rota;
- troca de view preserva search params;
- header da árvore usa `HomeHeader`;
- páginas internas usam `MemberPageHeader`;
- menu do usuário usa `UserProfileMenu`;
- no header da árvore, `UserProfileMenu` usa variante `home-header` em desktop/tablet e padrão compacto no mobile;
- busca do header pesquisa pessoas e páginas;
- busca possui sugestões e rota completa `/busca`;
- seletor de view permite alternar entre **Minha Árvore**, **Genealogia** e **Visão Completa**;
- seletor de paleta fica no dropdown de views em desktop/tablet;
- no mobile, paletas também aparecem no menu do usuário por `MobileUserMenuPalettePortal`;
- paletas `white`, `orange` e `brown` são aplicadas por CSS variables no `document.documentElement`;
- paleta ativa é persistida em `localStorage`;
- paletas não alteram dados, permissões, Supabase, filtros ou grafo;
- `MobileTreeControlsPortal` concentra controles mobile da árvore nas rotas `/minha-arvore`, `/genealogia` e `/visao-completa`;
- o painel mobile permite zoom, reajuste, ocultar/exibir setas, exportação PDF/imagem e impressão;
- `/genealogia` e `/visao-completa` resetam a geração ativa ao alternar view, pessoa central ou conjunto de gerações disponíveis.

Regras anti-regressão:

- não reintroduzir menu local antigo da Home;
- não usar `translate` ou deslocamento manual da camada `.react-flow__viewport` para corrigir espaçamento;
- não mover estado principal da Home para componentes de apresentação sem necessidade clara;
- não persistir preferência visual de paleta no banco sem decisão de produto;
- não deixar controles mobile aparecerem fora das rotas da árvore;
- não duplicar controles `+`/`-` antigos com painel mobile.

---

## 5. Pessoas, perfis, admin e privacidade

Documentação detalhada:

- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`;
- `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`.

Arquivos principais:

```txt
src/app/pages/PersonProfile.tsx
src/app/pages/admin/AdminPessoas.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/components/person/PersonDataView.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/person/AddressAutocompleteInput.tsx
src/app/services/dataService.ts
src/app/services/memberProfileService.ts
src/app/services/personProfileSuggestionService.ts
src/app/services/permissionService.ts
src/app/utils/personFields.ts
src/app/utils/googleAddress.ts
```

Comportamento consolidado:

- admin cria e edita pessoas;
- usuário edita os próprios dados conforme permissão;
- usuário sem permissão direta envia sugestão para revisão admin;
- `/admin/solicitacoes-vinculos` concentra solicitações de vínculo e sugestões de perfil;
- `/admin/pessoas` permite copiar o ID da pessoa;
- admin pode resetar perfil por RPC;
- reset remove foto de perfil, insights gerados e favoritos de pessoa;
- reset retorna flags de privacidade/contato e preferências de notificação para `true`;
- reset **não** remove relacionamentos familiares;
- dados de contato respeitam permissões de exibição;
- autocomplete de endereço usa Google Places quando houver chave configurada;
- sem chave ou em caso de falha do Google, o campo permanece como input normal.

Migrations/RPCs relacionadas:

```txt
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
20260609193000_ensure_admin_reset_person_profile.sql
admin_reset_person_profile(target_pessoa_id uuid)
20260608143000_create_person_profile_suggestions.sql
```

Regras anti-regressão:

- usuário comum não deve alterar dado restrito diretamente;
- reset administrativo não deve apagar relacionamentos;
- dados sensíveis não devem ser expostos no perfil público;
- geração de IA/insights não deve ocorrer automaticamente no frontend;
- erro `PGRST202` em RPC indica ambiente remoto/schema cache desalinhado, não deve ser mascarado no frontend.

---

## 6. Pessoa falecida, locais e busca

Arquivos principais:

```txt
src/app/utils/personFields.ts
src/app/utils/search.ts
src/app/pages/admin/AdminPessoaForm.tsx
src/app/components/person/PersonDataView.tsx
```

Comportamento consolidado:

- pessoa pode ser marcada como falecida por `falecido`;
- `data_falecimento` ou `local_falecimento` também indicam falecimento;
- locais no Brasil usam padrão `Cidade/UF`;
- locais no exterior usam `Cidade (País)`;
- busca deve ignorar caixa e acentos;
- em relacionamento conjugal, falecimento de uma das pessoas força texto no passado.

Migrations relacionadas:

```txt
20260514130000_add_falecido_to_pessoas.sql
20260514133000_add_exterior_location_flags_to_pessoas.sql
```

---

## 7. Redes sociais e contato

Arquivos principais:

```txt
src/app/components/person/SocialProfilesEditor.tsx
src/app/services/pessoaSocialProfilesService.ts
src/app/components/person/WhatsAppContactButton.tsx
src/app/utils/whatsapp.ts
```

Comportamento consolidado:

- UI de redes sociais usa `SocialProfilesEditor`;
- campos legados em `pessoas` continuam por compatibilidade;
- primeiro perfil social pode ser sincronizado com campos legados;
- exibição no perfil respeita privacidade;
- botão de WhatsApp aparece apenas com telefone válido e permissão;
- número textual só aparece se `permitir_exibir_telefone = true`;
- WhatsApp Business API não faz parte do MVP.

Futuro:

- múltiplas redes sociais com persistência/UX mais avançada somente se o uso real exigir;
- log seguro de clique e privacidade forte em banco/API ficam pós-MVP.

---

## 8. Eventos da vida e timeline

Documentação detalhada: `docs/funcionalidades/TIMELINE.md`.

Arquivos principais:

```txt
src/app/services/personEventsService.ts
src/app/components/person/PersonEventsEditor.tsx
src/app/components/person/PersonEventsList.tsx
src/app/utils/buildPersonTimeline.ts
src/app/components/Timeline/PersonTimeline.tsx
src/app/pages/PersonProfile.tsx
src/app/pages/MinhaArvore.tsx
```

Tabela principal:

```txt
public.person_events
```

Tipos suportados:

```txt
imigracao
chegada_brasil
mudanca
batismo
formatura
profissao
militar
religioso
memoria
outro
```

Comportamento consolidado:

- eventos pessoais podem ser criados/editados no escopo implementado;
- `/minha-arvore/editar` possui área **Eventos da Vida**;
- timeline combina fatos derivados e eventos manuais;
- em contexto embutido da edição, título redundante **Eventos automáticos e manuais** fica oculto;
- fontes derivadas incluem nascimento, falecimento, relacionamentos, filhos, arquivos históricos e eventos pessoais.

Migration relacionada:

```txt
20260514165000_create_person_events.sql
```

Fora do MVP:

- upload por evento;
- privacidade por evento;
- edição diretamente na timeline pública;
- exportação PDF da timeline/eventos.

---

## 9. Arquivos históricos e Storage

Documentação detalhada:

- `docs/operacao/STORAGE_MAINTENANCE.md`;
- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`;
- `docs/GUIA_COMPONENTES.md`.

Arquivos principais:

```txt
src/app/components/ArquivosHistoricos.tsx
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
src/app/components/FotoUpload.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
```

Comportamento consolidado:

- novas fotos principais usam bucket `person-avatars`;
- novos arquivos históricos usam bucket `historical-files`;
- novos arquivos não devem ser salvos como base64;
- base64/data URL legado permanece compatível;
- arquivos de pessoa usam `pessoa_id`;
- arquivos de relacionamento/casamento usam `relacionamento_id` e `pessoa_id` nulo;
- preview de imagem e PDF funciona quando possível;
- áreas compactas podem usar botão `+` com `aria-label`;
- arquivos existentes permitem editar título, ano, descrição e categoria histórica;
- usuário comum visualiza arquivos conforme permissões;
- admin gerencia arquivos via formulário/perfil;
- `ArquivosHistoricos` aceita `eventCategoryOptions` para restringir categorias por contexto.

Categoria histórica:

```txt
HistoricalFileEventCategory
ArquivoHistorico.categoria_evento
public.arquivos_historicos.categoria_evento
20260522121000_add_historical_file_event_category.sql
```

Valores aceitos:

```txt
certidao_nascimento
certidao_casamento
alistamento_militar
imigracao
divorcio
carreira_profissional
mudanca_cidade
certidao_obito
outro
```

No modal conjugal, categorias exibidas:

```txt
certidao_casamento
divorcio
outro
```

Regras operacionais:

- `20260522121000_add_historical_file_event_category.sql` é pré-requisito para ambientes que recebem `categoria_evento`;
- não remover `categoria_evento` do payload para mascarar ambiente remoto desatualizado;
- não apagar base64 legado automaticamente;
- evitar uploads órfãos como evolução técnica de Storage.

---

## 10. Relacionamentos, vínculos e relacionamento conjugal

Documentação detalhada:

- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`;
- `docs/funcionalidades/MINHA_ARVORE_EDITAR.md`;
- `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`.

Arquivos principais:

```txt
src/app/services/dataService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/RelacionamentoManager.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/pages/admin/AdminRelacionamentos.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/pages/MeusVinculos.tsx
```

Comportamento consolidado:

- admin cria, edita e remove relacionamentos reais;
- usuário comum solicita criação, remoção ou correção;
- solicitação usa `relationship_change_requests`;
- aprovação aplica alteração real;
- rejeição não altera relacionamento real;
- dados conjugais incluem data/local de casamento, separação, status ativo e observações;
- observações internas aparecem apenas para admin;
- relacionamento conjugal pode ter arquivos históricos próprios;
- modal conjugal oculta IDs técnicos para usuário final;
- texto público usa linguagem humana;
- o título do modal conjugal usa:
  - “são casados” quando não há encerramento/separação, `ativo !== false`, subtipo não separado e ambos estão vivos;
  - “foram casados” quando há separação/fim, `ativo === false`, subtipo separado ou pelo menos uma pessoa falecida;
- botão **Inserir Informações** abre formulário textual com Informações, Data, Local e Outros;
- botão **+** em Arquivos Históricos abre área de upload com Arquivo, Título, Descrição, Ano e Categoria;
- categorias de arquivo histórico no contexto conjugal são Certidão de Casamento, Divórcio e Outro.

Migration relacionada:

```txt
20260513173000_create_relationship_change_requests.sql
```

Regra anti-regressão:

- usuário não-admin não deve alterar relacionamento real diretamente;
- modal conjugal não deve salvar antes da ação principal do fluxo;
- local inválido de casamento não deve impedir salvamento de dados pessoais;
- o botão **+** de Arquivos Históricos não deve abrir o modal de Inserir Informações.

---

## 11. Árvore, layouts, conectores, paletas e controles mobile

Documentação detalhada:

- `docs/funcionalidades/MINHA_ARVORE_VIEW.md`;
- `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`;
- `docs/funcionalidades/GENEALOGIA_VIEW.md`;
- `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

Arquivos principais:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/app/components/FamilyTree/buildTreeGraph.ts
src/app/components/FamilyTree/nodeTypes.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/filterPersonalTreeScope.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/styles/mobile-tree-controls.css
```

Modos de visualização:

| View | Escopo |
|---|---|
| `minha-arvore` | Layout próprio em torno da pessoa central. |
| `genealogia` | Escopo pessoal por gerações. |
| `visao-completa` | Base completa por gerações/blocos. |

Comportamento consolidado:

- conectores pais-filhos são ortogonais nas views por geração;
- cônjuges dos filhos não são tratados como filhos reais;
- conectores/aneis são filtrados conforme pessoas visíveis;
- anel/botão conjugal aparece entre cônjuges e abre modal;
- status visual do anel considera união ativa, separação/divórcio, viuvez ou indefinido;
- `/minha-arvore` aplica ajustes visuais próprios sem contaminar Genealogia/Visão Completa;
- cards centrais de pai, mãe, irmãos, sobrinhos, cônjuge, filhos, netos e pets possuem largura ampliada na Minha Árvore;
- grupos, labels e anchors da área central acompanham a largura ampliada;
- título da árvore é overlay único em `FamilyTree.tsx`;
- Genealogia e Visão Completa não devem renderizar título duplicado;
- pan/zoom interno do ReactFlow deve ser preservado;
- scroll externo da página deve ser bloqueado quando a árvore ocupa a viewport;
- em mobile, `/genealogia` e `/visao-completa` usam chips de navegação por gerações/blocos;
- chips focam/enquadram a geração ativa, mas não removem estruturalmente as demais colunas;
- botões de pan/zoom antigos podem ser ocultados em mobile quando os chips ou o painel mobile assumem a navegação principal;
- `MobileTreeControlsPortal` fornece painel compacto de ações em mobile nas rotas da árvore;
- paletas `white`, `orange` e `brown` alteram apenas tokens visuais.

Regras anti-regressão:

- não usar deslocamento manual em `.react-flow__viewport`;
- não salvar filtros visuais como regra de negócio;
- não alterar nodes, edges, handles ou dimensões do botão conjugal sem QA visual;
- manter diferenças intencionais entre `/minha-arvore` e views por gerações;
- não permitir que largura ampliada da Minha Árvore afete `/genealogia` ou `/visao-completa`;
- não duplicar controles mobile;
- não permitir que `/visao-completa` herde geração ativa obsoleta de `/genealogia`.

---

## 12. Painel lateral e legendas visuais

Documentação detalhada: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`.

Arquivos principais:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/types.ts
src/app/components/FamilyTree/utils/treeExport.ts
src/app/pages/Home.tsx
```

Comportamento consolidado:

- legenda aparece no painel lateral, aba **Legendas**;
- `TreeLegend` pode ser informativa e também controlar filtros/camadas visuais;
- camadas visuais incluem destaque de pais/filhos e irmãos;
- estado padrão desligado mantém visual original;
- botões de destaque respeitam filtros de linhas correspondentes;
- conteúdo da legenda deve permanecer objetivo;
- elementos da legenda devem ser ignorados na exportação quando marcados com `data-tree-legend`;
- versão administrativa/configurável da legenda não faz parte do MVP.

---

## 13. Favoritos

Arquivos principais:

```txt
src/app/services/favoritesService.ts
src/app/components/favorites/FavoriteButton.tsx
src/app/components/favorites/ForumTopicFavoriteButton.tsx
src/app/components/favorites/HistoricalFileFavoriteButton.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/PersonProfile.tsx
src/app/pages/forum/ForumTopico.tsx
```

Tipos previstos no código:

```txt
person
historical_file
relationship
forum_topic
family_event
person_event
page
timeline_item
story
```

Estado consolidado:

- serviço suporta favoritos por `entity_type`/`entity_id`;
- metadados passam por sanitização para evitar dados sensíveis;
- UI de favorito de pessoa está implementada;
- tópico de fórum pode ser favoritado;
- arquivo histórico pode ser favoritado quando componente exibe a ação;
- `/meus-favoritos` possui listagem, busca, filtros e remoção;
- expansão para outras entidades deve ser estudada antes de alterar UI ou schema.

Regra anti-regressão:

- não gravar telefone, endereço, URL sensível, token, base64 ou dados longos em `metadata`.

---

## 14. Notificações

Documentação detalhada: `docs/funcionalidades/NOTIFICACOES.md`.

Arquivos principais:

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/services/notificationDispatchService.ts
src/app/services/notificationTriggersService.ts
src/app/services/notificationRecipientsService.ts
supabase/functions/send-notification-email/index.ts
supabase/functions/run-daily-notifications/index.ts
```

Comportamento consolidado:

- `/notificacoes` é a central/lista de notificações;
- `/ajustar-notificacoes` é a página dedicada de preferências;
- botão **Personalizar Notificações** na central navega para `/ajustar-notificacoes`;
- notificações internas são disparadas via services;
- preferências são respeitadas pelo dispatch;
- falha de notificação não deve impedir a ação principal;
- fórum dispara notificações internas para pessoas mencionadas, pessoas relacionadas e participantes conforme o evento;
- arquivos históricos e vínculos também possuem gatilhos de notificação;
- e-mail real depende de provider/secrets configurados;
- cron automático deve ser configurado fora do frontend e com segurança operacional.

Fora do MVP:

- push real;
- WhatsApp real;
- fila/retry avançado;
- painel operacional avançado de cron/retry.

---

## 15. Fórum

Documentação detalhada: `docs/funcionalidades/FORUM.md`.

Arquivos principais:

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/services/forumService.ts
src/app/services/notificationTriggersService.ts
src/app/types/index.ts
```

Comportamento consolidado:

- fórum possui categorias, tópicos, respostas, comentários, reações e denúncias;
- `/forum` lista tópicos com busca, categoria e botão de limpar filtros;
- filtros visuais de tipo e status foram removidos da home do fórum;
- `/forum/novo` usa categoria por botões/cards de seleção única;
- em desktop, as 5 categorias aparecem em uma linha;
- campo manual **Pessoas Relacionadas** foi removido de `/forum/novo`;
- `/forum/topico/:id/editar` usa o mesmo padrão visual de cards de categoria;
- campo manual **Pessoa relacionada** foi removido da edição;
- conteúdo orienta uso de `@` para marcar pessoa;
- pessoas mencionadas por `@` são vinculadas automaticamente e podem receber notificação interna;
- dados legados de pessoa relacionada continuam preservados internamente quando existentes;
- `/forum/topico/:id` usa badges pequenas/coloridas para categoria, tipo e status;
- autores exibem avatar ou fallback por iniciais;
- menções `@Nome Completo` são clicáveis para `/pessoa/:id`;
- respostas não exibem ações antigas **Marcar solução** e **Ocultar**;
- reações usam ícones e labels finais:
  - **Amei** (`curtir`, `HeartHandshake`);
  - **Apoiar** (`apoiar`, `Handshake`);
  - **Orações** (`lembrar`, `Flower2`);
  - **Parabéns** (`celebrar`, `PartyPopper`);
- apenas uma reação por usuário/alvo é mantida;
- clicar na mesma reação remove;
- clicar em outra reação substitui.

Migration relacionada:

```txt
20260608180000_enforce_single_forum_reaction.sql
```

Regras anti-regressão:

- não reintroduzir dropdown manual de Pessoas Relacionadas em criação/edição sem decisão de produto;
- não trocar `Flower2` por ícone inexistente;
- não remover constraint de unicidade de `forum_reacoes`;
- não interromper criação de tópico/resposta/comentário por falha de notificação.

---

## 16. Calendário familiar e Google Calendar

Documentação detalhada: `docs/funcionalidades/CALENDARIO_FAMILIAR.md`.

Arquivos principais:

```txt
src/app/pages/CalendarioFamiliar.tsx
src/app/utils/familyDates.ts
```

Comportamento consolidado:

- calendário reúne datas familiares e eventos;
- categorias ficam na sidebar quando aplicável;
- categorias funcionam como filtros;
- contadores usam singular/plural;
- aniversário mostra primeiro nome no grid e nome completo na lista;
- idade aparece como **Faz X anos** em texto secundário;
- layout mobile possui filtros superiores compactos;
- card lateral de categorias pode ser ocultado no mobile quando prejudicar espaço.

Google Calendar:

- integração está versionada em migration;
- tokens devem ficar restritos a Edge Functions/service role;
- OAuth, sincronização e proteção de tokens exigem validação operacional quando a frente for priorizada.

---

## 17. Exportação da árvore

Documentação detalhada: `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

Arquivos principais:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/app/pages/Home.tsx
```

Comportamento consolidado:

- usuário pode selecionar área visível da árvore em fluxo padrão;
- exportação suporta PNG;
- exportação suporta PDF;
- impressão é suportada;
- mobile possui painel rápido de ações;
- exportação não usa Storage;
- exportação não cria migration;
- legenda/overlays auxiliares não devem aparecer no artefato exportado quando marcados para exclusão.

Fora do MVP:

- exportação da árvore completa fora da viewport;
- persistência/log de exportações.

Ponto técnico:

- manter alinhamento entre o fluxo padrão `treeExport.ts` e qualquer captura direta usada pelo portal mobile.

---

## 18. Deploy, cache e recuperação de chunks

Documentação detalhada: `docs/operacao/DEPLOYMENT.md` e `docs/GUIA_CORRECAO_ERROS.md`.

Arquivos principais:

```txt
src/main.tsx
vercel.json
vite.config.ts
```

Comportamento consolidado:

- SPA estática usa fallback para `index.html`;
- `index.html` deve ser servido sem cache forte;
- `/assets/*` pode usar cache longo por conter hash;
- `src/main.tsx` captura erros de dynamic import e faz reload controlado;
- erro de MIME `text/html` para `.js` geralmente indica HTML antigo apontando para chunk removido.

Regra anti-regressão:

- não cachear `index.html` como immutable;
- não remover recuperação de chunk sem validar deploy real;
- após alterações em lazy routes, testar `/forum`, `/minha-arvore`, `/genealogia` e `/visao-completa` em janela anônima.

---

## 19. Banco, migrations e objetos legados

Documentação detalhada: `docs/operacao/MIGRATIONS_SUPABASE.md`.

Regras permanentes:

- revisar `supabase migration list` antes de `supabase db push`;
- não aplicar SQL legado como schema principal de ambiente novo;
- usar `migration repair` apenas quando o schema remoto já refletir comprovadamente a migration;
- não criar migration para objeto legado sem consumidor runtime;
- não remover coluna/view legada sem dump recente, SQL de auditoria e QA;
- não commitar secrets, dumps, tokens, backups ou service role.

Migrations recentes relevantes:

```txt
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
20260608143000_create_person_profile_suggestions.sql
20260608180000_enforce_single_forum_reaction.sql
20260609193000_ensure_admin_reset_person_profile.sql
```

Objetos legados/compatibilidade:

- `public.pessoas.arquivos_historicos`: compatibilidade até auditoria futura;
- `public.imagens_pessoa`: legado/migrations-only;
- `public.pessoas_com_estatisticas`: view remota legada sem uso runtime confirmado;
- SQLs antigos de fórum/Google Calendar devem ser tratados como legado quando já houver migration oficial.

---

## 20. Regras de segurança permanentes

Não deve acontecer:

- usuário comum acessar admin;
- usuário comum alterar relacionamento real diretamente;
- usuário comum alterar dado restrito sem permissão;
- perfil gerar IA automaticamente no frontend;
- e-mail real ser enviado sem provider, secrets e teste controlado;
- push/WhatsApp simularem envio real;
- dados novos serem salvos como base64;
- metadados de favoritos/notificações/logs salvarem dados sensíveis;
- `/admin/integridade` alterar dados sem decisão explícita;
- `supabase db push` ser usado sem revisar migrations;
- secrets entrarem no frontend ou no repositório;
- RLS liberar escrita indevida;
- título/subtítulo interno voltar a duplicar em Genealogia/Visão Completa;
- legenda, overlays ou controles auxiliares aparecerem indevidamente na exportação;
- filtros visuais serem persistidos como regra de negócio;
- cache de HTML antigo quebrar rotas lazy-loaded após deploy.

---

## 21. Manutenção documental

Este guia deve permanecer como inventário consolidado.

Onde documentar:

| Informação | Destino correto |
|---|---|
| Estado implementado resumido | `docs/GUIA_IMPLEMENTACOES.md` |
| Pendência, divergência, QA futuro ou backlog | `docs/PLANO_PROXIMOS_PASSOS.md` |
| Comportamento detalhado de uma tela/funcionalidade | `docs/funcionalidades/*.md` |
| Componentes, props e responsabilidades | `docs/GUIA_COMPONENTES.md` |
| UX, responsividade e layout | `docs/GUIA_UX_LAYOUT.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Schema, migrations e SQL legado | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Deploy/cache | `docs/operacao/DEPLOYMENT.md` |
| Erro, sintoma e correção | `docs/GUIA_CORRECAO_ERROS.md` |
| Histórico de fase, diagnóstico ou QA antigo | `docs/historico/` |

Regras:

- não adicionar histórico longo de commits neste arquivo;
- não duplicar documentação funcional extensa;
- não manter pendências antigas já validadas;
- usar links cruzados para documentos específicos;
- atualizar este guia apenas quando o estado consolidado do produto mudar.
