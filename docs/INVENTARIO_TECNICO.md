# Inventário técnico

> Última revisão: 2026-06-22  
> Escopo: branch `feature/questionario-ia-vinculos-pets` após o ciclo 6A–7D.

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
| `/meus-dados` | Dados pessoais, privacidade básica, avatar e questionário de IA. |
| `/meus-vinculos` | Revisão e solicitação de vínculos familiares, pets e cônjuges. |
| `/arquivos-historicos` | Fatos e arquivos históricos, com upload opcional. |
| `/preferencias` | Preferências de privacidade/notificações para pessoa viva. |
| `/revisao-dados` | Revisão final antes do mapa. |
| `/mapa-familiar` | Mapa familiar vertical/desktop e mobile. |
| `/mapa-familiar-horizontal` | Mapa familiar horizontal. |
| `/pessoa/:id` | Perfil individual com timeline. |

## Principais componentes

| Componente | Responsabilidade |
|---|---|
| `MemberPageHeader` | Header padronizado; suporta ocultar ações no onboarding. |
| `MemberOnboardingSteps` | Indicador de etapas do onboarding. |
| `MeusDados` | Formulário de dados e questionário IA. |
| `MeusVinculosWithProfileBio` | Wrapper de Mini Bio/Curiosidades em `/meus-vinculos`. |
| `MeusVinculos` | Fluxo de vínculos e solicitações. |
| `RelationshipOverview` | Resumo visual de familiares fora do container principal. |
| `RelationshipGroupPanel` | Grupos de vínculos, com botão superior de adicionar. |
| `RelativeCard` | Card individual de parente/pet/cônjuge. |
| `ArquivosHistoricos` | Lista e formulário de fatos/arquivos. |
| `RevisaoDados` | Revisão final do onboarding. |
| `PersonTimeline` | Timeline lateral no perfil da pessoa. |
| `DesktopFamilyMapView` | Mapa familiar vertical desktop. |
| `DesktopTreeVisualizationPanel` | Painel lateral do mapa desktop. |
| `FirstLoginTutorial` | Tour guiado do mapa familiar. |

## Principais services

| Service | Responsabilidade |
|---|---|
| `memberProfileService.ts` | Vínculo usuário-pessoa, atualização do próprio perfil, permissões do membro. |
| `profileQuestionnaireService.ts` | Persistência e hash do questionário IA. |
| `relationshipChangeRequestService.ts` | Solicitações pendentes de alterações de vínculos. |
| `arquivosHistoricosService.ts` | CRUD/substituição/listagem de fatos e arquivos históricos. |
| `storageService.ts` | Upload de avatar, arquivos históricos e mídias do site. |
| `dataService.ts` | CRUD base de pessoas e relacionamentos. |
| `treeDataCache.ts` | Invalidação/cache da árvore. |

## Tabelas principais

| Tabela | Uso |
|---|---|
| `pessoas` | Perfis humanos e pets. |
| `relacionamentos` | Vínculos familiares e conjugais. |
| `user_person_links` | Associação usuário-pessoa e base do status `Cadastrado`. |
| `person_profile_questionnaire_answers` | Respostas do questionário IA e hash de geração. |
| `relationship_change_requests` | Solicitações pendentes de vínculo. |
| `arquivos_historicos` | Fatos e arquivos históricos com ou sem anexo. |
| `pessoa_social_profiles` | Redes sociais versionadas. |
| `person_events` | Eventos pessoais estruturados. |
| `activity_logs` | Histórico de atividades. |
| `favorites` | Favoritos. |

## Migrations recentes do ciclo

| Migration | Função |
|---|---|
| `20260622120000_create_person_profile_questionnaire_answers.sql` | Cria/padroniza respostas do questionário IA. |
| `20260622170000_allow_historical_facts_without_file.sql` | Permite fatos históricos sem arquivo. |

## Contratos técnicos relevantes

- Build com `npm run build` não substitui typecheck completo.
- Referências a ícones precisam estar importadas explicitamente de `lucide-react`.
- `MapPin` em `/meus-dados` é caso de regressão já corrigido por hotfix.
- `user_person_links` é a referência para `Cadastrado`.
- `arquivos_historicos.url` pode ser nulo/vazio após a migration de fatos sem arquivo.
- `tipo` de `ArquivoHistorico` continua `imagem | pdf`; fato sem arquivo é distinguido pela ausência de `url`.
- Dados sensíveis não devem ser incluídos em contexto de IA, logs, metadata da timeline ou payloads desnecessários.
