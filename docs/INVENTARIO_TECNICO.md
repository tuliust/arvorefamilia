# Inventário técnico

> Última revisão: 2026-06-23  
> Escopo: branch `feature/questionario-ia-vinculos-pets` após ciclo 6A–7D e ajustes pós-ciclo de `/curiosidades`, `/mapa-familiar`, notificações, fórum e favoritos.

## Stack

- React + TypeScript.
- Vite 6.4.x.
- Supabase como backend de dados, auth, RLS e storage.
- OpenAI via endpoint `api/ai.ts` para geração de textos.
- Tailwind/utility classes no frontend.
- `lucide-react` para ícones.

## Principais rotas de membro

| Rota | Função |
|---|---|
| `/meus-dados` | Dados pessoais, privacidade básica, avatar, redes sociais e questionário de IA. |
| `/meus-vinculos` | Revisão e solicitação de vínculos familiares, pets e cônjuges. |
| `/arquivos-historicos` | Fatos e arquivos históricos, com upload opcional. |
| `/preferencias` | Preferências de privacidade/notificações para pessoa viva. |
| `/revisao-dados` | Revisão final antes do mapa. |
| `/mapa-familiar` | Mapa familiar vertical/desktop e mobile. |
| `/mapa-familiar-horizontal` | Mapa familiar horizontal. |
| `/pessoa/:id` | Perfil individual com contato, badges e timeline. |
| `/curiosidades` | Cards, rankings, gráficos, quiz, bodas, IA e comparações familiares. |
| `/forum` | Fórum familiar. |
| `/meus-favoritos` | Favoritos do usuário. |
| `/notificacoes` | Lista completa de notificações. |
| `/ajustar-notificacoes` | Preferências de notificações. |
| `/duvidas` | Central de dúvidas. |

## Principais componentes

| Componente | Responsabilidade |
|---|---|
| `MemberPageHeader` | Header padronizado; suporta ocultar ações no onboarding. |
| `UserProfileMenu` | Menu do avatar, com `Dúvidas?`, `Sair` e navegação de membro. |
| `HeaderNotificationsDropdown` | Dropdown do sino, lista notificações e links para notificações/preferências. |
| `MemberOnboardingSteps` | Indicador de etapas do onboarding. |
| `MeusDados` | Formulário de dados, redes sociais, avatar e questionário IA. |
| `MeusVinculosWithProfileBio` | Wrapper de Mini Bio/Curiosidades em `/meus-vinculos`. |
| `MeusVinculos` | Fluxo de vínculos e solicitações. |
| `RelationshipOverview` | Resumo visual de familiares fora do container principal. |
| `RelationshipGroupPanel` | Grupos de vínculos, com botão superior de adicionar. |
| `RelativeCard` | Card individual de parente/pet/cônjuge. |
| `ArquivosHistoricos` | Lista e formulário de fatos/arquivos. |
| `RevisaoDados` | Revisão final do onboarding. |
| `PersonDataView` | Perfil individual, contato, redes sociais e badges. |
| `PersonTimeline` | Timeline lateral no perfil da pessoa. |
| `CuriosidadesStats` | Cards numéricos de `/curiosidades`. |
| `CuriosidadesRankings` | Rankings de nomes, meses, badges e cidades. |
| `CuriosidadesCharts` | Gráficos de faixa etária e ocupações. |
| `CuriosidadesCouples` | Bodas e vínculos conjugais. |
| `CuriosidadesInterestsSection` | Comparação de interesses/badges. |
| `CuriosidadesAstrology` | Comparação astrológica. |
| `CuriosidadesConnectionSection` | Cálculo de conexão entre pessoas. |
| `CuriosidadesQuizSection` | Quiz familiar. |
| `DesktopFamilyMapView` | Mapa familiar vertical desktop. |
| `DesktopTreeVisualizationPanel` | Painel lateral do mapa desktop. |
| `directFamilyDistributedLayout` | Algoritmo de distribuição direta de cards da árvore. |
| `FirstLoginTutorial` | Tour guiado do mapa familiar. |
| `ForumHome` | Listagem/busca do fórum. |
| `MeusFavoritos` | Listagem/busca/filtros de favoritos. |

## Principais services

| Service | Responsabilidade |
|---|---|
| `memberProfileService.ts` | Vínculo usuário-pessoa, atualização do próprio perfil, permissões do membro. |
| `profileQuestionnaireService.ts` | Persistência, hash e leitura controlada do questionário IA. |
| `relationshipChangeRequestService.ts` | Solicitações pendentes de alterações de vínculos. |
| `arquivosHistoricosService.ts` | CRUD/substituição/listagem de fatos e arquivos históricos. |
| `storageService.ts` | Upload de avatar, arquivos históricos e mídias do site. |
| `dataService.ts` | CRUD base de pessoas e relacionamentos; reset administrativo via RPC. |
| `treeDataCache.ts` | Invalidação/cache da árvore. |
| `pessoaSocialProfilesService.ts` | Redes sociais versionadas. |
| `personInsightsService.ts` | Insights/textos de perfil quando aplicável. |
| `favoritesService.ts` | Favoritos. |
| `notificationPreferencesService` / equivalentes | Preferências e listagem de notificações, conforme estrutura atual do projeto. |

## Tabelas principais

| Tabela | Uso |
|---|---|
| `pessoas` | Perfis humanos e pets. |
| `relacionamentos` | Vínculos familiares e conjugais. |
| `user_person_links` | Associação usuário-pessoa e base do status `Cadastrado`. |
| `person_profile_questionnaire_answers` | Respostas do questionário IA, `selected_badges` e hash de geração. |
| `relationship_change_requests` | Solicitações pendentes de vínculo. |
| `arquivos_historicos` | Fatos e arquivos históricos com ou sem anexo. |
| `pessoa_social_profiles` | Redes sociais versionadas. |
| `person_events` | Eventos pessoais estruturados. |
| `activity_logs` | Histórico de atividades. |
| `favorites` | Favoritos. |
| `notification_preferences` | Preferências de notificação, quando disponível. |

## RPCs/funções relevantes

| Função | Uso |
|---|---|
| `get_person_profile_selected_badges(target_pessoa_id uuid)` | Leitura controlada de badges do questionário para `/curiosidades` e perfil. |
| `admin_reset_person_profile(target_pessoa_id uuid)` | Reset profundo de dados editáveis, vínculos de usuário, questionário, arquivos, eventos, redes e logs. |

## Migrations recentes do ciclo

| Migration | Função |
|---|---|
| `20260622120000_create_person_profile_questionnaire_answers.sql` | Cria/padroniza respostas do questionário IA. |
| `20260622170000_allow_historical_facts_without_file.sql` | Permite fatos históricos sem arquivo. |
| Migration de badges/RPC | Adiciona `get_person_profile_selected_badges`. |
| Migration de reset administrativo | Redefine `admin_reset_person_profile` para reset profundo. |

## Arquivos e áreas alteradas no pós-ciclo

| Área | Arquivos principais |
|---|---|
| `/curiosidades` | `src/app/pages/Curiosidades.tsx`, `src/app/pages/curiosidades/*`, `curiosidadesUtils.ts`, `curiosidadesRequestedUtils.ts`. |
| Mapa familiar painel | `src/app/pages/Home.tsx`, `src/app/pages/home/DesktopTreeVisualizationPanel.tsx`, `src/styles/prompt1-desktop-ui-overrides.css`, `src/styles/index.css`. |
| Mapa familiar layout | `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts`. |
| Notificações | `src/app/components/layout/HeaderNotificationsDropdown.tsx`. |
| Favoritos | `src/app/pages/MeusFavoritos.tsx`. |
| Fórum | `src/app/pages/forum/ForumHome.tsx` e/ou override CSS em `prompt1-desktop-ui-overrides.css`. |
| Perfil individual | `src/app/components/person/PersonDataView.tsx` ou equivalente. |
| Reset/admin | `src/app/services/dataService.ts` e migrations SQL. |

## Commits recentes relevantes

| Commit | Tema |
|---|---|
| `bf8f57a` | Ajustes amplos de cards/interações de `/curiosidades`. |
| `ce80a00` | Integração de badges em `/curiosidades`. |
| `62a6254` | Correção de tipagem de badges e bodas. |
| `e70f8a7` | Overrides/ajustes desktop do Prompt 1 via conector. |
| `dbcc09c` | Seletor de visualização e botão de cônjuges no painel. |
| `5b69baf` | Distribuição de irmãos, cônjuge e pets no mapa. |
| `3d228fa` | Correção de UTF-8/encoding em `directFamilyDistributedLayout.ts`. |

## Contratos técnicos relevantes

- Build com `npm run build` não substitui typecheck completo.
- Rodar `npm run typecheck` antes de commit.
- Referências a ícones precisam estar importadas explicitamente de `lucide-react`.
- `MapPin` em `/meus-dados` é caso de regressão já corrigido por hotfix.
- `user_person_links` é a referência para `Cadastrado`.
- `arquivos_historicos.url` pode ser nulo/vazio após a migration de fatos sem arquivo.
- `tipo` de `ArquivoHistorico` continua `imagem | pdf`; fato sem arquivo é distinguido pela ausência de `url`.
- Dados sensíveis não devem ser incluídos em contexto de IA, logs, metadata da timeline ou payloads desnecessários.
- Arquivos alterados devem permanecer em UTF-8.
- Ajustes desktop devem ser condicionados para não degradar mobile.
