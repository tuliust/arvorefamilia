import type {
  AdminNotificationRecipientGroupDefinition,
  AdminNotificationTemplateDefinition,
  AdminNotificationTypeDefinition,
} from './adminNotificationCatalog';

export const RUNTIME_NOTIFICATION_RECIPIENT_GROUPS: AdminNotificationRecipientGroupDefinition[] = [
  {
    id: 'trigger_user',
    title: 'Usuário do gatilho',
    description: 'Usuário que realizou a ação que originou a notificação, como primeiro acesso ou vínculo confirmado.',
    kind: 'gatilho',
    availability: 'available',
  },
  {
    id: 'specific_users',
    title: 'Usuários específicos',
    description: 'Permite selecionar um ou mais usuários manualmente para receber a notificação.',
    kind: 'manual_futuro',
    availability: 'available',
  },
  {
    id: 'close_family',
    title: 'Familiares próximos',
    description: 'Pai, mãe, irmãos, cônjuge ativo, filhos, netos e sobrinhos do usuário ou pessoa do gatilho.',
    kind: 'gatilho',
    availability: 'available',
  },
];

export const RUNTIME_NOTIFICATION_TYPES: AdminNotificationTypeDefinition[] = [
  {
    id: 'admin_new_link_confirmed',
    group: 'essencial',
    administrativeName: 'Novo vínculo confirmado',
    shortName: 'Vínculo confirmado',
    description: 'Avisa administradores quando um usuário confirma vínculo com uma pessoa da árvore.',
    priority: 'alta',
    allowedChannels: ['interna', 'email'],
    defaultFrequency: 'imediata',
    defaultAudience: 'admins',
    shortTemplate: 'Novo vínculo confirmado na árvore.',
    longTemplate: 'Um usuário confirmou vínculo com o perfil de {{nome_completo}} na árvore familiar.',
    defaultLink: '/admin/atividades',
    active: true,
    automationMode: 'automatico',
  },
  {
    id: 'first_access_welcome',
    group: 'essencial',
    administrativeName: 'Boas-vindas de primeiro acesso',
    shortName: 'Boas-vindas',
    description: 'Mensagem enviada ao usuário quando seu acesso à árvore familiar é confirmado.',
    priority: 'alta',
    allowedChannels: ['interna'],
    defaultFrequency: 'imediata',
    defaultAudience: 'trigger_user',
    shortTemplate: 'Bem-vindo à Árvore Família.',
    longTemplate: 'Seu acesso foi confirmado. Comece explorando sua árvore familiar, memórias e vínculos.',
    defaultLink: '/mapa-familiar',
    active: true,
    automationMode: 'automatico',
  },
];

export const RUNTIME_NOTIFICATION_TEMPLATES: AdminNotificationTemplateDefinition[] = [
  {
    id: 'admin_new_link_confirmed_template',
    typeId: 'admin_new_link_confirmed',
    themeId: 'administrativo',
    title: 'Novo vínculo confirmado',
    shortMessage: 'Novo vínculo confirmado na árvore.',
    emailSubject: 'Novo vínculo confirmado na árvore familiar',
    longMessage: 'Um usuário confirmou vínculo com o perfil de {{nome_completo}} na árvore familiar.',
    cta: 'Ver atividade',
    defaultLink: '/admin/atividades',
    variables: ['{{nome}}', '{{nome_completo}}', '{{link}}'],
    allowedChannels: ['interna', 'email'],
    active: true,
  },
  {
    id: 'first_access_welcome_template',
    typeId: 'first_access_welcome',
    themeId: 'convite',
    title: 'Bem-vindo à Árvore Família',
    shortMessage: 'Bem-vindo à Árvore Família.',
    emailSubject: 'Bem-vindo à Árvore Família',
    longMessage: 'Seu acesso foi confirmado. Comece explorando sua árvore familiar, memórias e vínculos.',
    cta: 'Explorar minha árvore',
    defaultLink: '/mapa-familiar',
    variables: ['{{nome}}', '{{nome_completo}}', '{{link}}'],
    allowedChannels: ['interna'],
    active: true,
  },
];

export const RUNTIME_NOTIFICATION_SUGGESTIONS = [
  'Boas-vindas de primeiro acesso',
  'Novo vínculo confirmado',
];
