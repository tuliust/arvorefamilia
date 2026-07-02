# Plano de próximos passos

> Última revisão: 2026-07-02
> Escopo: pendências reais após auditoria documental da branch `main` e rodadas recentes de implementação.
> Status: canônico.

## Pendências operacionais pós-merge

- Conferir deploy gerado a partir da `main`.
- Validar manualmente `/mapa-familiar`, `/mapa-familiar-horizontal`, `/curiosidades`, `/forum`, `/calendario-familiar`, `/meus-dados`, `/admin/duvidas`, `/admin/atividades`, `/admin/notificacoes` e `/admin/gestao-conteudo-pessoas` no ambiente publicado.
- Confirmar que o ambiente remoto do Supabase recebeu as migrations necessárias.
- Confirmar que variáveis de ambiente de IA e demais chaves operacionais estão disponíveis quando exigidas.

- Validar no ambiente publicado o bloqueio de rotas internas para usuário com `dados_confirmados = false`.
- Validar que usuário com onboarding incompleto retorna para `/meus-dados` e mantém dados salvos nas etapas já preenchidas.
- Validar que usuário com onboarding finalizado acessa `/mapa-familiar` e rotas internas normalmente.
- Em `/admin/notificacoes`, abrir a aba `Configuração`, clicar em `Salvar` e confirmar registros em `admin_notification_configurations`, `admin_notification_catalogs` e a coluna `variable_settings`.

## Pendências de produto e QA visual

- Validar em navegador real o overlay de exportação de imagem, PDF e impressão em `/mapa-familiar` e `/mapa-familiar-horizontal`, especialmente duração do feedback visual até o diálogo do sistema ou janela dedicada assumir o fluxo.
- Validar visualmente `/curiosidades` após deploy, incluindo sticky da barra superior, menu do avatar acima da navegação sticky, mural, quiz, gerações, comparação de interesses e ilustração da rota no desktop.
- Revisar eventual texto com caracteres corrompidos fora de `docs/`, especialmente em componentes de mapa/exportação, se for detectado em QA visual ou validação de código.
- Implementar, quando aprovado, os ajustes de `/calendario-familiar` para nomes curtos dentro dos dias, texto curto de falecimento/casamento e card lateral `Datas de Casamento`.
- Implementar, quando aprovado, a renomeação dos botões em `/meus-dados`: `Ajustar Meus Vínculos` para `Meus Vínculos` e `Ajustar Fatos e Arquivos Históricos` para `Fatos e Arquivos Históricos`.
- Validar o modal atual de pet em `/meus-vinculos` com layout em coluna única e decidir se o runtime defensivo deve ser absorvido pelo componente React de origem.

## Pendências de produto administrativo

- Adicionar botão nativo no dashboard `/admin` para `/admin/gestao-conteudo-pessoas`.
- Corrigir acentuação nativa dos textos em `/admin/gestao-conteudo-pessoas`, sem depender de fallback visual.
- Criar/aplicar migration real de `person_visibility_settings` no Supabase remoto; o código atual apenas evita quebra da tela quando a tabela ainda não existe.
- Planejar a reutilização administrativa dos fluxos `/meus-dados`, `/meus-vinculos` e `/arquivos-historicos` em `/admin/pessoas/:id/editar`, com abas e modo admin sem quebrar os fluxos de usuário.
- Planejar aba de administração de vínculos de usuários em `/admin/relacionamentos`, separando permissões de edição/legado das relações familiares.
- Concluir a migração visual de `/admin/notificacoes` para consumir `loadAdminNotificationCatalog()` em todas as abas, removendo usos diretos de `ADMIN_NOTIFICATION_TYPES`, `ADMIN_NOTIFICATION_TEMPLATES`, `ADMIN_NOTIFICATION_RECIPIENT_GROUPS`, `ADMIN_NOTIFICATION_FREQUENCY_OPTIONS`, `ADMIN_NOTIFICATION_AUTOMATIONS` e `ADMIN_NOTIFICATION_SUGGESTIONS` onde ainda forem usados como fonte primária.
- Validar em produção a preservação de aba ativa e rascunho local da aba `Configuração`.
- Validar em produção que novos tipos customizados deixam de aparecer como `Nova notificação N` após preenchimento de título e salvamento.
- Mapear o gatilho de boas-vindas do primeiro acesso a um tipo customizado dedicado quando o tipo for criado no catálogo administrativo.
- Conectar o evento `trigger_event:first_map_access` ao tipo customizado de boas-vindas quando a escolha administrativa estiver definida.
- Implementar conexões reais para eventos preparados: `trigger_event:first_login`, `trigger_event:onboarding_completed` e `trigger_event:profile_updated`.
- Conectar `trigger_user`, `specific_users` e `close_family` ao dispatch layer dos gatilhos reais que ainda usam destinatários fixos.
- Fazer o renderer/dispatch consumir `variable_settings`, especialmente `{{link}}`, formatos de data e fallbacks definidos pelo admin.

## Pendências técnicas permanentes

- Confirmar políticas RLS para pessoas, relacionamentos, vínculos, fatos históricos, notificações, favoritos, fórum e visibilidade por pessoa.
- Confirmar políticas RLS de `admin_notification_configurations`, `admin_notification_catalogs` e `user_first_map_accesses` em ambiente remoto.
- Confirmar que `admin_notification_configurations.variable_settings` existe e aceita objeto JSONB no ambiente remoto.
- Criar documentação administrativa mais detalhada apenas quando novas rotas/abas administrativas forem implementadas no código.


## Pendências pós-revisão de 2026-07-02

- Validar em ambiente publicado se os badges `Cadastrado` e `Pré-cadastrado` de `/meus-vinculos` refletem vínculos reais depois da migration `20260701090000_allow_member_link_status_lookup.sql`.
- Revisar a policy de `user_person_links` e planejar RPC restrita que retorne apenas `pessoa_id` para status de badge, reduzindo exposição de colunas não necessárias.
- Conectar os disparos reais de `first_access_welcome` e `admin_new_link_confirmed` aos templates persistidos em `admin_notification_catalogs`/`admin_notification_configurations`.
- Validar que a reconciliação do catálogo administrativo adiciona modelos novos sem sobrescrever customizações existentes do admin.
- Migrar, quando estável, `src/memberInteractionLayoutRuntimeFixes.ts` para componentes React/serviços tipados e remover manipulações diretas de DOM.
- Testar perspectiva memorial em `/forum` e `/curiosidades` com usuário responsável por perfil falecido.
- Testar retomada do tutorial de primeiro acesso no meio do fluxo e fallback quando alvo visual não existir.

## Regra de manutenção

- Não recriar documentos datados, temporários, de baseline, rollback ou QA paralelo.
- Não recriar arquivos removidos na limpeza documental final.
- Atualizar `docs/README.md` e `docs/INVENTARIO_TECNICO.md` apenas quando houver criação, remoção, renomeação de documento canônico ou mudança de rota/área.
