const LABELS: Record<string, string> = {
  nova_notificacao: 'Nova notificação',
  notificacao: 'Notificação',
  novo_usuario: 'Novo usuário',
  novos_registros_historicos: 'Novos registros históricos',
  registros_historicos: 'Registros históricos',
  evento_historico_familia: 'Evento histórico familiar',
  aniversarios: 'Aniversários',
  datas_memoria: 'Datas de memória',
  eventos_familiares: 'Eventos familiares',
  avisos_gerais: 'Avisos gerais',
  interna: 'Interna',
  email: 'E-mail',
  push: 'Push',
  whatsapp: 'WhatsApp',
  automatico: 'Automático',
  manual_futuro: 'Manual futuro',
  gatilho: 'Por gatilho',
  available: 'Disponível',
  partial: 'Parcial',
  planned: 'Planejado',
  imediata: 'Imediata',
  diaria: 'Diária',
  semanal: 'Semanal',
  mensal: 'Mensal',
  data_especifica: 'Data específica',
  manual: 'Manual',
  desativada: 'Desativada',
  sent: 'Enviado',
  failed: 'Falha',
  skipped: 'Ignorado',
  pending: 'Pendente',
  not_verified: 'Não verificado',
  configured: 'Configurado',
  verified: 'Verificado',
  not_configured: 'Não configurado',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
  title: 'Título',
  shortmessage: 'Texto curto',
  longmessage: 'Texto',
  cta: 'CTA',
  nome_curto: 'Nome curto',
  nome_autor_curto: 'Nome do autor curto',
  ativo: 'Ativo',
  verificado: 'Verificado',
  'não configurado': 'Não configurado',
  'em validação': 'Em validação',
  'em preparação': 'Em preparação',
};

export function formatAdminNotificationLabel(value?: string | null) {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) return 'Não informado';

  const normalized = rawValue.toLowerCase();
  const direct = LABELS[rawValue] ?? LABELS[normalized];
  if (direct) return direct;

  return rawValue
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toLocaleUpperCase('pt-BR'));
}

export function formatAdminNotificationVariable(value: string) {
  return value.replace(/[{}]/g, '').replace(/_/g, ' ');
}
