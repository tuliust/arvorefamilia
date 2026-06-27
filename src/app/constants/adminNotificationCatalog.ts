import { TipoCanalNotificacao } from '../types';

export type AdminNotificationPriority = 'alta' | 'media' | 'baixa';
export type AdminNotificationFrequencyId =
  | 'imediata'
  | 'diaria'
  | 'semanal'
  | 'mensal'
  | 'data_especifica'
  | 'manual'
  | 'desativada';
export type AdminNotificationThemeId =
  | 'institucional'
  | 'familiar'
  | 'afetuoso'
  | 'memorial'
  | 'convite'
  | 'urgente'
  | 'administrativo'
  | 'resumo_semanal'
  | 'engajamento';
export type AdminNotificationAudienceKind = 'automatico' | 'manual_futuro' | 'gatilho';
export type AdminNotificationAvailability = 'available' | 'partial' | 'planned';

export interface AdminNotificationTypeDefinition {
  id: string;
  group: 'essencial' | 'engajamento';
  administrativeName: string;
  shortName: string;
  description: string;
  priority: AdminNotificationPriority;
  allowedChannels: TipoCanalNotificacao[];
  defaultFrequency: AdminNotificationFrequencyId;
  defaultAudience: string;
  shortTemplate: string;
  longTemplate: string;
  defaultLink: string;
  active: boolean;
  automationMode: 'automatico' | 'manual';
}

export interface AdminNotificationTemplateDefinition {
  id: string;
  typeId: string;
  themeId: AdminNotificationThemeId;
  title: string;
  shortMessage: string;
  emailSubject?: string;
  longMessage: string;
  cta: string;
  defaultLink: string;
  variables: string[];
  allowedChannels: TipoCanalNotificacao[];
  active: boolean;
}

export interface AdminNotificationRecipientGroupDefinition {
  id: string;
  title: string;
  description: string;
  kind: AdminNotificationAudienceKind;
  availability: AdminNotificationAvailability;
}

export interface AdminNotificationAutomationDefinition {
  id: string;
  title: string;
  description: string;
  frequency: AdminNotificationFrequencyId;
  channels: TipoCanalNotificacao[];
  recipientGroupId: string;
  typeIds: string[];
  supportsManualRun: boolean;
  supportsTestRun: boolean;
}

export const ADMIN_NOTIFICATION_FREQUENCY_OPTIONS: Array<{
  id: AdminNotificationFrequencyId;
  label: string;
  description: string;
}> = [
  { id: 'imediata', label: 'Imediata', description: 'Dispara assim que o gatilho for confirmado.' },
  { id: 'diaria', label: 'Diária', description: 'Agrupa ou executa uma vez por dia.' },
  { id: 'semanal', label: 'Semanal', description: 'Usada para resumos e engajamento leve.' },
  { id: 'mensal', label: 'Mensal', description: 'Indicada para campanhas pouco frequentes.' },
  { id: 'data_especifica', label: 'Datas específicas', description: 'Depende de calendário ou marco definido.' },
  { id: 'manual', label: 'Manual', description: 'Executada apenas sob ação administrativa.' },
  { id: 'desativada', label: 'Desativada', description: 'Mantida no catálogo, sem disparo.' },
];

export const ADMIN_NOTIFICATION_THEME_OPTIONS: Array<{
  id: AdminNotificationThemeId;
  label: string;
  description: string;
}> = [
  { id: 'institucional', label: 'Institucional', description: 'Tom neutro e oficial para avisos gerais.' },
  { id: 'familiar', label: 'Familiar', description: 'Tom acolhedor para eventos e vínculos da família.' },
  { id: 'afetuoso', label: 'Afetuoso', description: 'Mensagem calorosa para celebrações e lembranças.' },
  { id: 'memorial', label: 'Memorial/sensível', description: 'Tom respeitoso para datas de memória e falecimento.' },
  { id: 'convite', label: 'Convite', description: 'Estimula participação e complemento de dados.' },
  { id: 'urgente', label: 'Urgente', description: 'Usado para falhas ou pendências críticas.' },
  { id: 'administrativo', label: 'Administrativo', description: 'Direto e funcional para filas internas.' },
  { id: 'resumo_semanal', label: 'Resumo semanal', description: 'Consolida novidades e ações recentes.' },
  { id: 'engajamento', label: 'Engajamento leve', description: 'Incentiva retorno sem excesso de urgência.' },
];

export const ADMIN_NOTIFICATION_RECIPIENT_GROUPS: AdminNotificationRecipientGroupDefinition[] = [
  { id: 'all_members', title: 'Todos os membros', description: 'Todos os usuários cadastrados na plataforma.', kind: 'automatico', availability: 'available' },
  { id: 'admins', title: 'Administradores', description: 'Contas com role administrativa.', kind: 'automatico', availability: 'available' },
  { id: 'linked_to_person', title: 'Usuários vinculados a uma pessoa', description: 'Destinatários resolvidos por pessoa selecionada.', kind: 'automatico', availability: 'available' },
  { id: 'linked_to_historical_record', title: 'Relacionados a registro histórico', description: 'Resolve participantes ou pessoas ligadas a um arquivo histórico.', kind: 'gatilho', availability: 'partial' },
  { id: 'forum_participants', title: 'Participantes de tópico do fórum', description: 'Autores, respostas e comentários do tópico.', kind: 'gatilho', availability: 'available' },
  { id: 'mentioned_people', title: 'Pessoas mencionadas em publicação', description: 'Preparado para resolução por menções e referências futuras.', kind: 'gatilho', availability: 'planned' },
  { id: 'related_people_in_post', title: 'Pessoas relacionadas em publicação', description: 'Preparado para relacionamento contextual de posts.', kind: 'gatilho', availability: 'planned' },
  { id: 'birthdays_this_month', title: 'Aniversariantes do mês', description: 'Pessoas com data de nascimento no mês corrente.', kind: 'automatico', availability: 'available' },
  { id: 'living_family', title: 'Familiares vivos', description: 'Perfis humanos não marcados como falecidos.', kind: 'automatico', availability: 'available' },
  { id: 'incomplete_family_data', title: 'Familiares com dados incompletos', description: 'Perfis sem nascimento, local de nascimento ou local atual.', kind: 'automatico', availability: 'available' },
  { id: 'incomplete_onboarding', title: 'Usuários com onboarding incompleto', description: 'Estrutura preparada; depende de regra consolidada no fluxo de primeiro acesso.', kind: 'automatico', availability: 'partial' },
  { id: 'users_accepting_email', title: 'Usuários que aceitam e-mail', description: 'Preferência de canal e-mail habilitada.', kind: 'automatico', availability: 'available' },
  { id: 'users_accepting_push', title: 'Usuários que aceitam push', description: 'Preferência de canal push habilitada.', kind: 'automatico', availability: 'available' },
  { id: 'users_accepting_whatsapp', title: 'Usuários que aceitam WhatsApp futuro', description: 'Canal preparado para integração futura.', kind: 'automatico', availability: 'available' },
  { id: 'manual_groups_future', title: 'Grupos manuais futuros', description: 'Reservado para grupos customizados persistidos.', kind: 'manual_futuro', availability: 'planned' },
];

export const ADMIN_NOTIFICATION_TYPES: AdminNotificationTypeDefinition[] = [
  {
    id: 'pending_link_request',
    group: 'essencial',
    administrativeName: 'Novo vínculo pendente',
    shortName: 'Vínculo pendente',
    description: 'Avisa admins sobre novas solicitações de controle ou vínculo.',
    priority: 'alta',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'imediata',
    defaultAudience: 'admins',
    shortTemplate: 'Há uma solicitação de vínculo pendente.',
    longTemplate: 'Uma nova solicitação de vínculo foi aberta e aguarda revisão administrativa.',
    defaultLink: '/admin/responsaveis',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'link_approved',
    group: 'essencial',
    administrativeName: 'Vínculo aprovado',
    shortName: 'Vínculo aprovado',
    description: 'Confirmação enviada ao membro quando um vínculo é aprovado.',
    priority: 'alta',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'imediata',
    defaultAudience: 'linked_to_person',
    shortTemplate: 'Seu vínculo foi aprovado.',
    longTemplate: 'Seu vínculo com o perfil da família foi aprovado e já pode ser acessado.',
    defaultLink: '/meus-vinculos',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'link_rejected',
    group: 'essencial',
    administrativeName: 'Vínculo recusado',
    shortName: 'Vínculo recusado',
    description: 'Confirmação enviada ao membro quando um vínculo é recusado.',
    priority: 'media',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'imediata',
    defaultAudience: 'linked_to_person',
    shortTemplate: 'Seu vínculo foi recusado.',
    longTemplate: 'A solicitação de vínculo foi recusada. Revise os dados e tente novamente se necessário.',
    defaultLink: '/meus-vinculos',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'family_change_pending',
    group: 'essencial',
    administrativeName: 'Alteração familiar aguardando aprovação',
    shortName: 'Alteração aguardando revisão',
    description: 'Fila administrativa de mudanças familiares sensíveis.',
    priority: 'alta',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'imediata',
    defaultAudience: 'admins',
    shortTemplate: 'Há uma alteração familiar aguardando aprovação.',
    longTemplate: 'Uma alteração familiar sensível foi enviada e precisa de revisão administrativa.',
    defaultLink: '/admin/responsaveis',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'birthday_of_day',
    group: 'essencial',
    administrativeName: 'Aniversário do dia',
    shortName: 'Aniversário do dia',
    description: 'Celebra aniversários do dia com notificação interna e canais opcionais.',
    priority: 'media',
    allowedChannels: ['interna', 'email', 'push'],
    defaultFrequency: 'diaria',
    defaultAudience: 'all_members',
    shortTemplate: 'Hoje é aniversário de {{nome}}.',
    longTemplate: 'Hoje é aniversário de {{nome}}. Acesse o perfil para ver fotos, memórias e dados da família.',
    defaultLink: '/notificacoes',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'memory_date',
    group: 'essencial',
    administrativeName: 'Data de memória do dia',
    shortName: 'Data de memória',
    description: 'Lembra datas de falecimento e memórias familiares do dia.',
    priority: 'media',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'diaria',
    defaultAudience: 'all_members',
    shortTemplate: 'Hoje lembramos {{nome}}.',
    longTemplate: 'Hoje lembramos {{nome}} e suas memórias na família.',
    defaultLink: '/notificacoes',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'family_event_created',
    group: 'essencial',
    administrativeName: 'Evento familiar criado',
    shortName: 'Evento criado',
    description: 'Divulga novo evento familiar.',
    priority: 'media',
    allowedChannels: ['interna', 'email', 'push'],
    defaultFrequency: 'imediata',
    defaultAudience: 'all_members',
    shortTemplate: 'Novo evento familiar criado.',
    longTemplate: 'Um novo evento familiar foi criado. Veja os detalhes e confirme sua participação.',
    defaultLink: '/calendario-familiar',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'family_event_updated',
    group: 'essencial',
    administrativeName: 'Evento familiar alterado',
    shortName: 'Evento alterado',
    description: 'Atualiza participantes sobre mudanças em evento familiar.',
    priority: 'media',
    allowedChannels: ['interna', 'email', 'push'],
    defaultFrequency: 'imediata',
    defaultAudience: 'all_members',
    shortTemplate: 'Evento familiar atualizado.',
    longTemplate: 'Um evento familiar foi alterado. Confira a atualização antes da data marcada.',
    defaultLink: '/calendario-familiar',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'family_event_cancelled',
    group: 'essencial',
    administrativeName: 'Evento familiar cancelado',
    shortName: 'Evento cancelado',
    description: 'Informa cancelamento de evento familiar.',
    priority: 'alta',
    allowedChannels: ['interna', 'email', 'push'],
    defaultFrequency: 'imediata',
    defaultAudience: 'all_members',
    shortTemplate: 'Evento familiar cancelado.',
    longTemplate: 'O evento familiar foi cancelado. Veja os detalhes e acompanhe novas definições.',
    defaultLink: '/calendario-familiar',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'new_historical_record',
    group: 'essencial',
    administrativeName: 'Novo registro histórico',
    shortName: 'Registro histórico',
    description: 'Avisa sobre novo registro histórico ou documento relacionado.',
    priority: 'media',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'imediata',
    defaultAudience: 'linked_to_historical_record',
    shortTemplate: 'Novo registro histórico adicionado.',
    longTemplate: 'Um novo registro histórico foi adicionado ao perfil de {{nome}}. Veja o conteúdo e complemente a memória.',
    defaultLink: '/arquivos-historicos',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'new_photo_document',
    group: 'essencial',
    administrativeName: 'Nova foto/documento',
    shortName: 'Nova foto/documento',
    description: 'Complementa avisos sobre mídia e arquivos históricos.',
    priority: 'baixa',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'semanal',
    defaultAudience: 'linked_to_historical_record',
    shortTemplate: 'Nova foto ou documento disponível.',
    longTemplate: 'Há uma nova foto ou documento no acervo da família esperando sua revisão.',
    defaultLink: '/arquivos-historicos',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'forum_mention',
    group: 'essencial',
    administrativeName: 'Menção no fórum',
    shortName: 'Menção no fórum',
    description: 'Avisa quando o usuário é citado em conversa do fórum.',
    priority: 'media',
    allowedChannels: ['interna', 'email', 'push'],
    defaultFrequency: 'imediata',
    defaultAudience: 'forum_participants',
    shortTemplate: 'Você foi mencionado no fórum.',
    longTemplate: 'Você foi mencionado em uma conversa da família. Acesse o tópico para acompanhar a publicação.',
    defaultLink: '/forum',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'forum_reply_following',
    group: 'essencial',
    administrativeName: 'Nova resposta em tópico acompanhado',
    shortName: 'Nova resposta no fórum',
    description: 'Avisa participantes de um tópico acompanhado.',
    priority: 'baixa',
    allowedChannels: ['interna', 'email', 'push'],
    defaultFrequency: 'imediata',
    defaultAudience: 'forum_participants',
    shortTemplate: 'Há nova resposta em tópico acompanhado.',
    longTemplate: 'Uma nova resposta foi publicada em um tópico que você acompanha.',
    defaultLink: '/forum',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'forum_comment_following',
    group: 'essencial',
    administrativeName: 'Novo comentário em conversa acompanhada',
    shortName: 'Novo comentário no fórum',
    description: 'Avisa participantes sobre novos comentários.',
    priority: 'baixa',
    allowedChannels: ['interna', 'email', 'push'],
    defaultFrequency: 'imediata',
    defaultAudience: 'forum_participants',
    shortTemplate: 'Há novo comentário em conversa acompanhada.',
    longTemplate: 'Um novo comentário foi publicado em uma conversa que você acompanha.',
    defaultLink: '/forum',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'privacy_sensitive_change',
    group: 'essencial',
    administrativeName: 'Alteração sensível de privacidade',
    shortName: 'Privacidade alterada',
    description: 'Sinaliza mudanças sensíveis em privacidade ou exposição.',
    priority: 'alta',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'imediata',
    defaultAudience: 'admins',
    shortTemplate: 'Há uma alteração sensível de privacidade.',
    longTemplate: 'Uma alteração sensível de privacidade foi registrada e pede acompanhamento administrativo.',
    defaultLink: '/admin/notificacoes',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'admin_dispatch_error',
    group: 'essencial',
    administrativeName: 'Erro administrativo de envio',
    shortName: 'Falha de envio',
    description: 'Consolida falhas de dispatch para acompanhamento dos admins.',
    priority: 'alta',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'manual',
    defaultAudience: 'admins',
    shortTemplate: 'Falha recente no envio de notificação.',
    longTemplate: 'Foi registrada uma falha no envio de notificações e o painel administrativo requer verificação.',
    defaultLink: '/admin/notificacoes',
    active: true,
    automationMode: 'manual',
  },
  {
    id: 'automatic_routine_failure',
    group: 'essencial',
    administrativeName: 'Falha em rotina automática',
    shortName: 'Falha em rotina',
    description: 'Avisa quando rotina automática esperada não é verificada.',
    priority: 'alta',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'manual',
    defaultAudience: 'admins',
    shortTemplate: 'Há falha ou ausência de rotina automática.',
    longTemplate: 'Uma rotina automática de notificações não foi verificada como esperado e precisa de revisão.',
    defaultLink: '/admin/notificacoes',
    active: true,
    automationMode: 'manual',
  },
  {
    id: 'today_in_family',
    group: 'engajamento',
    administrativeName: 'Hoje na família',
    shortName: 'Hoje na família',
    description: 'Resumo leve com fatos e marcos do dia.',
    priority: 'baixa',
    allowedChannels: ['interna', 'email', 'push'],
    defaultFrequency: 'diaria',
    defaultAudience: 'all_members',
    shortTemplate: 'Hoje na família: veja os destaques do dia.',
    longTemplate: 'Veja aniversários, memórias e eventos do dia na família.',
    defaultLink: '/notificacoes',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'weekly_family_summary',
    group: 'engajamento',
    administrativeName: 'Resumo semanal da família',
    shortName: 'Resumo semanal',
    description: 'Consolida novidades da semana.',
    priority: 'baixa',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'semanal',
    defaultAudience: 'all_members',
    shortTemplate: 'Resumo semanal da família disponível.',
    longTemplate: 'Sua família teve novidades nesta semana. Acesse o resumo completo.',
    defaultLink: '/notificacoes',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'memory_wall',
    group: 'engajamento',
    administrativeName: 'Nova lembrança no mural',
    shortName: 'Nova lembrança',
    description: 'Destaca lembranças recentes compartilhadas.',
    priority: 'baixa',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'semanal',
    defaultAudience: 'all_members',
    shortTemplate: 'Nova lembrança adicionada ao mural.',
    longTemplate: 'Uma nova lembrança da família foi publicada no mural.',
    defaultLink: '/curiosidades',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'family_curiosity',
    group: 'engajamento',
    administrativeName: 'Nova curiosidade familiar',
    shortName: 'Curiosidade familiar',
    description: 'Conteúdo leve para retorno recorrente.',
    priority: 'baixa',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'semanal',
    defaultAudience: 'all_members',
    shortTemplate: 'Nova curiosidade familiar disponível.',
    longTemplate: 'Uma nova curiosidade sobre a família está pronta para leitura.',
    defaultLink: '/curiosidades',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'complete_profile_data',
    group: 'engajamento',
    administrativeName: 'Convite para completar dados',
    shortName: 'Complete seus dados',
    description: 'Lembra membros com perfis incompletos.',
    priority: 'media',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'semanal',
    defaultAudience: 'incomplete_family_data',
    shortTemplate: 'Complete seus dados familiares.',
    longTemplate: 'Seu perfil familiar ainda pode ser enriquecido com mais dados e memórias.',
    defaultLink: '/meus-dados',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'add_photo_document',
    group: 'engajamento',
    administrativeName: 'Convite para adicionar foto/documento',
    shortName: 'Adicione uma memória',
    description: 'Lembra membros de contribuir com o acervo.',
    priority: 'baixa',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'semanal',
    defaultAudience: 'all_members',
    shortTemplate: 'Adicione uma foto ou documento da família.',
    longTemplate: 'Ajude a enriquecer o acervo com novas fotos, documentos e registros históricos.',
    defaultLink: '/arquivos-historicos',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'wedding_milestone',
    group: 'engajamento',
    administrativeName: 'Bodas ou marco de casamento',
    shortName: 'Bodas da família',
    description: 'Celebra marcos conjugais importantes.',
    priority: 'baixa',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'data_especifica',
    defaultAudience: 'all_members',
    shortTemplate: 'Hoje celebramos um marco especial da família.',
    longTemplate: 'Um casal da família celebra hoje um marco especial de casamento.',
    defaultLink: '/calendario-familiar',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'incomplete_onboarding',
    group: 'engajamento',
    administrativeName: 'Usuário com onboarding incompleto',
    shortName: 'Onboarding incompleto',
    description: 'Lembra o membro de concluir primeiro acesso e confirmações.',
    priority: 'media',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'semanal',
    defaultAudience: 'incomplete_onboarding',
    shortTemplate: 'Seu onboarding ainda não foi concluído.',
    longTemplate: 'Conclua o primeiro acesso e as confirmações para aproveitar os recursos da plataforma.',
    defaultLink: '/revisao-dados',
    active: true,
    automationMode: 'automatico',
  },
];

export const ADMIN_NOTIFICATION_TEMPLATES: AdminNotificationTemplateDefinition[] = ADMIN_NOTIFICATION_TYPES.map((type) => ({
  id: `${type.id}_template`,
  typeId: type.id,
  themeId:
    type.id === 'memory_date'
      ? 'memorial'
      : type.id.includes('error') || type.id.includes('failure')
        ? 'urgente'
        : type.id.includes('forum')
          ? 'familiar'
          : type.group === 'engajamento'
            ? 'engajamento'
            : 'administrativo',
  title: type.administrativeName,
  shortMessage: type.shortTemplate,
  emailSubject: type.administrativeName,
  longMessage: type.longTemplate,
  cta: 'Abrir detalhe',
  defaultLink: type.defaultLink,
  variables: ['{{nome}}', '{{nome_completo}}', '{{data}}', '{{idade}}', '{{anos_desde_falecimento}}', '{{titulo_topico}}', '{{titulo_registro}}', '{{nome_autor}}', '{{nome_evento}}', '{{link}}'],
  allowedChannels: type.allowedChannels,
  active: type.active,
}));

export const ADMIN_NOTIFICATION_AUTOMATIONS: AdminNotificationAutomationDefinition[] = [
  {
    id: 'daily_special_dates',
    title: 'Verificar aniversários e datas de memória do dia',
    description: 'Rotina já existente para aniversários e memórias, com deduplicação por ocorrência.',
    frequency: 'diaria',
    channels: ['interna'],
    recipientGroupId: 'all_members',
    typeIds: ['birthday_of_day', 'memory_date'],
    supportsManualRun: true,
    supportsTestRun: true,
  },
  {
    id: 'weekly_family_summary',
    title: 'Enviar resumo semanal de novidades',
    description: 'Preparado para consolidar novidades da semana.',
    frequency: 'semanal',
    channels: ['interna', 'email'],
    recipientGroupId: 'all_members',
    typeIds: ['weekly_family_summary', 'new_historical_record', 'family_curiosity'],
    supportsManualRun: false,
    supportsTestRun: true,
  },
  {
    id: 'incomplete_onboarding_reminder',
    title: 'Enviar lembrete de onboarding incompleto',
    description: 'Preparado para lembrar usuários sem conclusão do primeiro acesso.',
    frequency: 'semanal',
    channels: ['interna', 'email'],
    recipientGroupId: 'incomplete_onboarding',
    typeIds: ['incomplete_onboarding'],
    supportsManualRun: false,
    supportsTestRun: true,
  },
  {
    id: 'upcoming_family_event',
    title: 'Enviar aviso de evento familiar próximo',
    description: 'Preparado para alertar sobre eventos que se aproximam.',
    frequency: 'diaria',
    channels: ['interna', 'email', 'push'],
    recipientGroupId: 'all_members',
    typeIds: ['family_event_created', 'family_event_updated'],
    supportsManualRun: false,
    supportsTestRun: true,
  },
  {
    id: 'historical_records_summary',
    title: 'Enviar resumo de novos registros históricos',
    description: 'Preparado para resumir documentos e registros recentes.',
    frequency: 'semanal',
    channels: ['interna', 'email'],
    recipientGroupId: 'linked_to_historical_record',
    typeIds: ['new_historical_record', 'new_photo_document'],
    supportsManualRun: false,
    supportsTestRun: true,
  },
  {
    id: 'admin_pending_links',
    title: 'Avisar admins sobre vínculos pendentes',
    description: 'Alerta admins sobre solicitações pendentes de revisão.',
    frequency: 'imediata',
    channels: ['interna', 'email'],
    recipientGroupId: 'admins',
    typeIds: ['pending_link_request'],
    supportsManualRun: false,
    supportsTestRun: true,
  },
  {
    id: 'admin_dispatch_failures',
    title: 'Avisar admins sobre falhas de dispatch',
    description: 'Preparado para consolidar falhas de envio em acompanhamento interno.',
    frequency: 'manual',
    channels: ['interna', 'email'],
    recipientGroupId: 'admins',
    typeIds: ['admin_dispatch_error', 'automatic_routine_failure'],
    supportsManualRun: false,
    supportsTestRun: true,
  },
];

export const ADMIN_NOTIFICATION_SUGGESTIONS = [
  'Hoje na família',
  'Aniversário do dia',
  'Data de memória',
  'Novo registro histórico',
  'Nova foto adicionada',
  'Você foi mencionado',
  'Nova resposta no fórum',
  'Novo comentário no fórum',
  'Evento familiar próximo',
  'Evento alterado',
  'Solicitação de vínculo pendente',
  'Vínculo aprovado',
  'Vínculo recusado',
  'Complete seus dados',
  'Adicione uma memória',
  'Resumo semanal da família',
  'Nova curiosidade disponível',
  'Bodas da família',
  'Falha no envio de notificação',
  'Configuração de e-mail pendente',
  'Push ainda não configurado',
  'WhatsApp em preparação',
];
