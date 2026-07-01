import React, { useEffect, useMemo, useState } from 'react';
import { Bell, RefreshCcw, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent } from '../../components/ui/card';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { AdminNotificationsOverview } from '../../components/admin/notifications/AdminNotificationsOverview';
import {
  AdminNotificationAutomations,
  AdminNotificationAutomationRow,
} from '../../components/admin/notifications/AdminNotificationAutomations';
import { AdminNotificationDiagnostics } from '../../components/admin/notifications/AdminNotificationDiagnostics';
import {
  AdminNotificationPreferenceFilters,
  AdminNotificationPreferenceRow,
  AdminNotificationPreferencesTable,
} from '../../components/admin/notifications/AdminNotificationPreferencesTable';
import {
  AdminNotificationRecipients,
  AdminRecipientGroupRow,
} from '../../components/admin/notifications/AdminNotificationRecipients';
import { AdminNotificationFrequenciesAndThemes } from '../../components/admin/notifications/AdminNotificationFrequenciesAndThemes';
import { AdminNotificationTemplates } from '../../components/admin/notifications/AdminNotificationTemplates';
import { AdminNotificationTypesCatalog } from '../../components/admin/notifications/AdminNotificationTypesCatalog';
import {
  AdminNotificationConfiguration,
  AdminNotificationContentOverride,
} from '../../components/admin/notifications/AdminNotificationConfiguration';
import { AdminNotificationMetrics } from '../../components/admin/notifications/AdminNotificationMetrics';
import { useAuth } from '../../contexts/AuthContext';
import {
  ADMIN_NOTIFICATION_AUTOMATIONS,
  ADMIN_NOTIFICATION_FREQUENCY_OPTIONS,
  ADMIN_NOTIFICATION_RECIPIENT_GROUPS,
  ADMIN_NOTIFICATION_SUGGESTIONS,
  ADMIN_NOTIFICATION_TEMPLATES,
  ADMIN_NOTIFICATION_TYPES,
  AdminNotificationFrequencyId,
  AdminNotificationThemeId,
} from '../../constants/adminNotificationCatalog';
import { obterTodasPessoas } from '../../services/dataService';
import { adminListProfilesForLinking, AdminLinkableProfile } from '../../services/memberProfileService';
import { dispatchNotification } from '../../services/notificationDispatchService';
import { DailyNotificationRunSummary, runDailyNotificationChecks } from '../../services/notificationScheduledService';
import {
  checkNotificationEmailConfiguration,
  DailyNotificationsAutomationInfo,
  getDailyNotificationsAutomationInfo,
  getNotificationAdminSummary,
  listRecentNotificationDispatchLogs,
  listRecentNotificationPreferencesAdmin,
  listRecentNotificationsAdmin,
  NotificationEmailConfiguration,
} from '../../services/notificationAdminService';
import { listAdminUserIds, listLinkedUserIdsForPessoa } from '../../services/notificationRecipientsService';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../services/userEngagementService';
import { NotificationAdminSummary, NotificationDispatchLog, NotificationDispatchResult, NotificacaoUsuario, Pessoa, PreferenciaNotificacao, TipoCanalNotificacao } from '../../types';
import { isPersonDeceased } from '../../utils/personFields';

const ADMIN_NOTIFICATION_STORAGE_KEY = 'arvorefamilia:admin-notifications-console-config';

const PREFERENCE_CATEGORY_OPTIONS = [
  { value: 'all', label: 'Todas as categorias' },
  { value: 'aniversarios', label: 'Aniversários' },
  { value: 'datas_memoria', label: 'Datas de memória' },
  { value: 'eventos_familiares', label: 'Eventos familiares' },
  { value: 'avisos_gerais', label: 'Avisos gerais' },
  { value: 'novo_usuario', label: 'Novo usuário' },
  { value: 'forum', label: 'Mensagens do fórum' },
  { value: 'registros_historicos', label: 'Registros históricos' },
  { value: 'evento_historico_familia', label: 'Evento histórico familiar' },
] as const;

const CHANNEL_OPTIONS = [
  { value: 'all', label: 'Todos os canais' },
  { value: 'interna', label: 'Interna' },
  { value: 'email', label: 'E-mail' },
  { value: 'push', label: 'Push' },
  { value: 'whatsapp', label: 'WhatsApp' },
] as const;

type NotificationConfirmAction =
  | { type: 'email_test' }
  | { type: 'manual_routine' }
  | { type: 'automation_test'; automationId: string; automationTitle: string };

type StoredAdminNotificationConfig = {
  frequencyOverrides?: Record<string, AdminNotificationFrequencyId>;
  themeOverrides?: Record<string, AdminNotificationThemeId>;
  activeOverrides?: Record<string, boolean>;
  contentOverrides?: Record<string, AdminNotificationContentOverride>;
  channelOverrides?: Record<string, TipoCanalNotificacao[]>;
  recipientOverrides?: Record<string, string[]>;
};

function formatDate(value?: string) {
  if (!value) return 'Sem registro';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function maskUserId(userId?: string | null) {
  if (!userId) return 'Usuário não informado';
  return `${userId.slice(0, 8)}...${userId.slice(-4)}`;
}

function profileDisplayName(profile: AdminLinkableProfile | undefined, userId: string) {
  return String(profile?.nome_exibicao || maskUserId(profile?.id || userId)).trim();
}

function getPreferenceCategories(preference: PreferenciaNotificacao) {
  const categories: string[] = [];
  if (preference.receber_aniversarios) categories.push('Aniversários');
  if (preference.receber_datas_memoria) categories.push('Datas de memória');
  if (preference.receber_eventos) categories.push('Eventos familiares');
  if (preference.receber_avisos_gerais) categories.push('Avisos gerais');
  if (preference.receber_email_novo_usuario) categories.push('Novo usuário');
  if (preference.receber_email_novas_mensagens_forum) categories.push('Mensagens do fórum');
  if (preference.receber_email_novos_registros_historicos) categories.push('Registros históricos');
  if (preference.receber_email_evento_historico_familia) categories.push('Evento histórico familiar');
  return categories;
}

function getPreferenceChannels(preference: PreferenciaNotificacao) {
  const channels = ['interna'];
  if (preference.receber_email) channels.push('email');
  if (preference.receber_push) channels.push('push');
  if (preference.receber_whatsapp) channels.push('whatsapp');
  return channels;
}

function matchesDefaultPreferences(preference: PreferenciaNotificacao) {
  return Object.entries(DEFAULT_NOTIFICATION_PREFERENCES).every(([key, value]) => {
    const typedKey = key as keyof typeof DEFAULT_NOTIFICATION_PREFERENCES;
    return preference[typedKey] === value;
  });
}

function currentMonthBirthdayCount(people: Pessoa[]) {
  const month = new Date().getMonth() + 1;
  return people.filter((person) => {
    const value = String(person.data_nascimento ?? '').trim();
    if (!value) return false;
    const parts = value.split('-');
    if (parts.length < 2) return false;
    return Number(parts[1]) === month;
  }).length;
}

function isIncompletePerson(person: Pessoa) {
  return !String(person.data_nascimento ?? '').trim() || !String(person.local_nascimento ?? '').trim() || !String(person.local_atual ?? '').trim();
}

function getStoredAdminConfig(): StoredAdminNotificationConfig {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ADMIN_NOTIFICATION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAdminNotificationConfig) : {};
  } catch {
    return {};
  }
}

function saveStoredAdminConfig(config: StoredAdminNotificationConfig) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADMIN_NOTIFICATION_STORAGE_KEY, JSON.stringify(config));
}

export function AdminNotificacoes() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificacaoUsuario[]>([]);
  const [preferences, setPreferences] = useState<PreferenciaNotificacao[]>([]);
  const [dispatchLogs, setDispatchLogs] = useState<NotificationDispatchLog[]>([]);
  const [profiles, setProfiles] = useState<AdminLinkableProfile[]>([]);
  const [people, setPeople] = useState<Pessoa[]>([]);
  const [adminUserIds, setAdminUserIds] = useState<string[]>([]);
  const [summary, setSummary] = useState<NotificationAdminSummary>({
    totalNotifications: 0,
    unreadNotifications: 0,
    channelsUsed: 0,
    recentDispatchErrors: 0,
    byType: {},
    byChannel: {},
  });
  const [emailConfig, setEmailConfig] = useState<NotificationEmailConfiguration>(() => checkNotificationEmailConfiguration());
  const [automationInfo, setAutomationInfo] = useState<DailyNotificationsAutomationInfo>({
    status: 'not_verified',
    functionName: 'run-daily-notifications',
    scheduledTime: '08:00 America/Sao_Paulo',
    message: 'Verificação ainda não executada.',
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creatingTest, setCreatingTest] = useState(false);
  const [sendingEmailTest, setSendingEmailTest] = useState(false);
  const [sendingAutomationTest, setSendingAutomationTest] = useState(false);
  const [emailTestResults, setEmailTestResults] = useState<NotificationDispatchResult[] | null>(null);
  const [runningManualRoutine, setRunningManualRoutine] = useState(false);
  const [manualRoutineSummary, setManualRoutineSummary] = useState<DailyNotificationRunSummary | null>(null);
  const [manualRoutineError, setManualRoutineError] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [selectedPersonUserIds, setSelectedPersonUserIds] = useState<string[]>([]);
  const [selectedPersonLoading, setSelectedPersonLoading] = useState(false);
  const [preferenceFilters, setPreferenceFilters] = useState<AdminNotificationPreferenceFilters>({
    query: '',
    category: 'all',
    channel: 'all',
    status: 'all',
  });
  const storedConfig = useMemo(() => getStoredAdminConfig(), []);
  const [frequencyOverrides, setFrequencyOverrides] = useState<Record<string, AdminNotificationFrequencyId>>(storedConfig.frequencyOverrides || {});
  const [themeOverrides, setThemeOverrides] = useState<Record<string, AdminNotificationThemeId>>(storedConfig.themeOverrides || {});
  const [activeOverrides, setActiveOverrides] = useState<Record<string, boolean>>(storedConfig.activeOverrides || {});
  const [contentOverrides, setContentOverrides] = useState<Record<string, AdminNotificationContentOverride>>(storedConfig.contentOverrides || {});
  const [channelOverrides, setChannelOverrides] = useState<Record<string, TipoCanalNotificacao[]>>(storedConfig.channelOverrides || {});
  const [recipientOverrides, setRecipientOverrides] = useState<Record<string, string[]>>(storedConfig.recipientOverrides || {});
  const [pendingConfirmAction, setPendingConfirmAction] = useState<NotificationConfirmAction | null>(null);

  useEffect(() => {
    saveStoredAdminConfig({
      frequencyOverrides,
      themeOverrides,
      activeOverrides,
      contentOverrides,
      channelOverrides,
      recipientOverrides,
    });
  }, [activeOverrides, channelOverrides, contentOverrides, frequencyOverrides, recipientOverrides, themeOverrides]);

  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [
        nextNotifications,
        nextPreferences,
        nextDispatchLogs,
        nextSummary,
        nextAutomationInfo,
        profilesResult,
        nextPeople,
        nextAdminUserIds,
      ] = await Promise.all([
        listRecentNotificationsAdmin(80),
        listRecentNotificationPreferencesAdmin(200),
        listRecentNotificationDispatchLogs(200),
        getNotificationAdminSummary(),
        getDailyNotificationsAutomationInfo(),
        adminListProfilesForLinking(),
        obterTodasPessoas(),
        listAdminUserIds(),
      ]);

      setNotifications(nextNotifications);
      setPreferences(nextPreferences);
      setDispatchLogs(nextDispatchLogs);
      setSummary(nextSummary);
      setEmailConfig(checkNotificationEmailConfiguration());
      setAutomationInfo(nextAutomationInfo);
      setProfiles(profilesResult.data);
      setPeople(nextPeople);
      setAdminUserIds(nextAdminUserIds);

      if (profilesResult.error) {
        setLoadError(profilesResult.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível carregar o painel administrativo de notificações.';
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  useEffect(() => {
    if (!selectedPersonId && people[0]?.id) {
      setSelectedPersonId(people[0].id);
    }
  }, [people, selectedPersonId]);

  useEffect(() => {
    if (!selectedPersonId) return;
    let mounted = true;

    const loadLinkedUsers = async () => {
      try {
        setSelectedPersonLoading(true);
        const userIds = await listLinkedUserIdsForPessoa(selectedPersonId);
        if (mounted) setSelectedPersonUserIds(userIds);
      } catch {
        if (mounted) setSelectedPersonUserIds([]);
      } finally {
        if (mounted) setSelectedPersonLoading(false);
      }
    };

    loadLinkedUsers();

    return () => {
      mounted = false;
    };
  }, [selectedPersonId]);

  const handleCreateInternalTest = async () => {
    if (!user?.id) return;
    try {
      setCreatingTest(true);
      await dispatchNotification({
        userId: user.id,
        type: 'notificacao',
        titulo: 'Teste interno de notificação',
        mensagem: 'Notificação criada pelo painel admin para validar o canal interno e os logs de dispatch.',
        link: '/notificacoes',
        metadata: { source: 'admin-notificacoes', test: true },
        channels: ['interna'],
      });
      toast.success('Teste interno criado.');
      await loadDiagnostics();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível criar o teste interno.');
    } finally {
      setCreatingTest(false);
    }
  };


  const handleSendEmailTest = () => {
    if (!user?.id || sendingEmailTest) return;
    setPendingConfirmAction({ type: 'email_test' });
  };

  const confirmSendEmailTest = async () => {
    if (!user?.id) return;

    try {
      setSendingEmailTest(true);
      const results = await dispatchNotification({
        userId: user.id,
        type: 'notificacao',
        titulo: 'Teste de e-mail de notificação',
        mensagem: 'E-mail de teste enviado pelo painel admin para validar provider, prefer?ncias e logs.',
        link: '/notificacoes',
        metadata: { source: 'admin-email-test', test: true },
        channels: ['interna', 'email'],
        respectPreferences: true,
      });
      setEmailTestResults(results);
      setPendingConfirmAction(null);
      toast.success('Teste de e-mail executado.');
      await loadDiagnostics();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível enviar o teste de e-mail.');
    } finally {
      setSendingEmailTest(false);
    }
  };


  const handleRunManualRoutine = () => {
    if (runningManualRoutine) return;
    setPendingConfirmAction({ type: 'manual_routine' });
  };

  const confirmRunManualRoutine = async () => {
    try {
      setRunningManualRoutine(true);
      setManualRoutineError(null);
      const result = await runDailyNotificationChecks();
      setManualRoutineSummary(result);
      setPendingConfirmAction(null);
      toast.success('Rotina manual executada.');
      await loadDiagnostics();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível executar a rotina manual de notificações.';
      setManualRoutineError(message);
      toast.error(message);
    } finally {
      setRunningManualRoutine(false);
    }
  };


  const handleAutomationTest = (automationId: string) => {
    if (!user?.id || sendingAutomationTest) return;
    const automation = ADMIN_NOTIFICATION_AUTOMATIONS.find((item) => item.id === automationId);
    if (!automation) return;
    setPendingConfirmAction({ type: 'automation_test', automationId: automation.id, automationTitle: automation.title });
  };

  const confirmAutomationTest = async (automationId: string) => {
    if (!user?.id || sendingAutomationTest) return;
    const automation = ADMIN_NOTIFICATION_AUTOMATIONS.find((item) => item.id === automationId);
    if (!automation) return;

    try {
      setSendingAutomationTest(true);
      const channels = automation.channels.includes('email') ? ['interna', 'email'] : ['interna'];
      await dispatchNotification({
        userId: user.id,
        type: 'notificacao',
        titulo: `Teste de automação: ${automation.title}`,
        mensagem: automation.description,
        link: '/admin/notificacoes',
        metadata: { source: 'admin-automation-test', automation_id: automation.id, test: true },
        channels: channels as Array<'interna' | 'email'>,
        respectPreferences: true,
      });
      setPendingConfirmAction(null);
      toast.success('Teste de automação enviado para o admin logado.');
      await loadDiagnostics();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível enviar o teste da automação.');
    } finally {
      setSendingAutomationTest(false);
    }
  };

  const handleAutomationRun = async (automationId: string) => {
    if (automationId !== 'daily_special_dates') {
      toast.info('Esta automação está preparada na interface, mas ainda depende de implementação server-side dedicada.');
      return;
    }
    await handleRunManualRoutine();
  };

  const profileMap = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);

  const preferenceRows = useMemo<AdminNotificationPreferenceRow[]>(() => {
    return preferences.map((preference) => ({
      id: preference.id,
      userId: preference.user_id,
      displayName: profileDisplayName(profileMap.get(preference.user_id), preference.user_id),
      updatedAt: formatDate(preference.updated_at || preference.created_at),
      channels: getPreferenceChannels(preference),
      categories: getPreferenceCategories(preference),
      hasDefaultPreferences: matchesDefaultPreferences(preference),
      acceptsEmail: preference.receber_email,
      acceptsPush: preference.receber_push,
      acceptsWhatsapp: preference.receber_whatsapp,
    }));
  }, [preferences, profileMap]);

  const filteredPreferenceRows = useMemo(() => {
    const query = preferenceFilters.query.trim().toLowerCase();
    return preferenceRows.filter((row) => {
      const matchesQuery = !query || row.displayName.toLowerCase().includes(query) || row.userId.toLowerCase().includes(query);
      const matchesCategory =
        preferenceFilters.category === 'all' ||
        (preferenceFilters.category === 'aniversarios' && row.categories.includes('Aniversários')) ||
        (preferenceFilters.category === 'datas_memoria' && row.categories.includes('Datas de memória')) ||
        (preferenceFilters.category === 'eventos_familiares' && row.categories.includes('Eventos familiares')) ||
        (preferenceFilters.category === 'avisos_gerais' && row.categories.includes('Avisos gerais')) ||
        (preferenceFilters.category === 'novo_usuario' && row.categories.includes('Novo usuário')) ||
        (preferenceFilters.category === 'forum' && row.categories.includes('Mensagens do fórum')) ||
        (preferenceFilters.category === 'registros_historicos' && row.categories.includes('Registros históricos')) ||
        (preferenceFilters.category === 'evento_historico_familia' && row.categories.includes('Evento histórico familiar'));
      const matchesChannel = preferenceFilters.channel === 'all' || row.channels.includes(preferenceFilters.channel);
      const matchesStatus =
        preferenceFilters.status === 'all' ||
        (preferenceFilters.status === 'default' && row.hasDefaultPreferences) ||
        (preferenceFilters.status === 'custom' && !row.hasDefaultPreferences) ||
        (preferenceFilters.status === 'optout' && row.categories.length < 8);
      return matchesQuery && matchesCategory && matchesChannel && matchesStatus;
    });
  }, [preferenceFilters, preferenceRows]);

  const preferenceStats = useMemo(() => {
    const rows = filteredPreferenceRows;
    return [
      { label: 'Aceitam e-mail', value: rows.filter((row) => row.acceptsEmail).length, helper: 'Canal e-mail habilitado.' },
      { label: 'Aceitam push', value: rows.filter((row) => row.acceptsPush).length, helper: 'Canal push habilitado, mesmo sem provider ativo.' },
      { label: 'Recusaram algo', value: rows.filter((row) => row.categories.length < 8).length, helper: 'Há pelo menos uma categoria desligada.' },
      { label: 'Preferência padrão', value: rows.filter((row) => row.hasDefaultPreferences).length, helper: 'Sem customização em relação ao padrão atual.' },
    ];
  }, [filteredPreferenceRows]);

  const overviewMetrics = useMemo(() => {
    const totalSent = dispatchLogs.filter((log) => log.status === 'sent').length;
    const emailSent = dispatchLogs.filter((log) => log.canal === 'email' && log.status === 'sent').length;
    const pushSent = dispatchLogs.filter((log) => log.canal === 'push' && log.status === 'sent').length;
    const internalTotal = notifications.filter((notification) => notification.canal === 'interna').length;
    const internalRead = notifications.filter((notification) => notification.canal === 'interna' && notification.lida).length;
    const internalReadRate = internalTotal > 0 ? `${Math.round((internalRead / internalTotal) * 100)}%` : 'Sem dados suficientes';

    return [
      { id: 'created', label: 'Total de notificações criadas', value: summary.totalNotifications, helper: 'Registros acessíveis ao admin.' },
      { id: 'sent', label: 'Total de envios confirmados', value: totalSent, helper: 'Baseado nos logs com status Enviado.' },
      { id: 'internal', label: 'Notificações internas', value: summary.byChannel.interna || 0, helper: 'Canal persistido em notificações do usuário.' },
      { id: 'email', label: 'E-mails enviados', value: emailSent, helper: 'Envios com status Enviado no log.' },
      { id: 'push', label: 'Push enviados', value: pushSent, helper: 'Sem provider ativo se permanecer zero.' },
      { id: 'whatsapp', label: 'WhatsApp', value: 'Em preparação', helper: 'Canal futuro, sem provedor real nesta etapa.' },
      { id: 'unread', label: 'Não lidas', value: summary.unreadNotifications, helper: 'Pendentes na caixa interna.' },
      { id: 'failures', label: 'Falhas recentes', value: summary.recentDispatchErrors, helper: 'Logs recentes com status Falha.' },
      { id: 'open-rate', label: 'Taxa de abertura', value: internalReadRate, helper: 'Proxy atual via leitura interna.' },
      { id: 'click-rate', label: 'Taxa de cliques', value: 'Sem dados suficientes', helper: 'Tracking de clique ainda não persistido.' },
      { id: 'last-run', label: 'Última rotina automática', value: automationInfo.lastDispatchAt ? formatDate(automationInfo.lastDispatchAt) : 'Sem registro', helper: 'Última execução observada.' },
      { id: 'next-run', label: 'Próxima rotina programada', value: automationInfo.scheduledTime, helper: 'Agenda conhecida pela automação diária.' },
    ];
  }, [automationInfo, dispatchLogs, notifications, summary]);

  const channelStatuses = useMemo(() => {
    const pushAttempts = dispatchLogs.filter((log) => log.canal === 'push').length;
    const whatsappAttempts = dispatchLogs.filter((log) => log.canal === 'whatsapp').length;
    const emailStatus =
      emailConfig.status === 'verified' ? 'verificado' : emailConfig.status === 'not_configured' ? 'não configurado' : 'em validação';
    const pushStatus = pushAttempts > 0 ? 'não configurado' : 'em preparação';
    const whatsappStatus = whatsappAttempts > 0 ? 'não configurado' : 'em preparação';

    return [
      { channel: 'interna', status: 'ativo', detail: 'Canal principal já persistido em notificações internas.' },
      { channel: 'email', status: emailStatus, detail: emailConfig.message },
      { channel: 'push', status: pushStatus, detail: 'Há suporte de tipos e preferências, mas ainda não existe provider confirmado.' },
      { channel: 'whatsapp', status: whatsappStatus, detail: 'Canal preparado para integração futura, sem envio real nesta etapa.' },
    ];
  }, [dispatchLogs, emailConfig]);

  const recipientGroupRows = useMemo<AdminRecipientGroupRow[]>(() => {
    const countMap: Record<string, string> = {
      all_members: `${profiles.length} usuários`,
      admins: `${adminUserIds.length} admins`,
      linked_to_person: selectedPersonLoading ? 'Carregando...' : `${selectedPersonUserIds.length} usuários`,
      linked_to_historical_record: 'Resolvido por gatilho e contexto',
      forum_participants: 'Resolvido por tópico/resposta',
      mentioned_people: 'Planejado',
      related_people_in_post: 'Planejado',
      birthdays_this_month: `${currentMonthBirthdayCount(people)} pessoas`,
      living_family: `${people.filter((person) => !isPersonDeceased(person)).length} pessoas`,
      incomplete_family_data: `${people.filter(isIncompletePerson).length} pessoas`,
      incomplete_onboarding: 'Regra parcial',
      users_accepting_email: `${preferenceRows.filter((row) => row.acceptsEmail).length} usuários`,
      users_accepting_push: `${preferenceRows.filter((row) => row.acceptsPush).length} usuários`,
      users_accepting_whatsapp: `${preferenceRows.filter((row) => row.acceptsWhatsapp).length} usuários`,
      manual_groups_future: 'Planejado',
    };

    return ADMIN_NOTIFICATION_RECIPIENT_GROUPS.map((group) => ({
      id: group.id,
      title: group.title,
      description: group.description,
      kind: group.kind,
      availability: group.availability,
      countLabel: countMap[group.id] || 'Sem dados suficientes',
    }));
  }, [adminUserIds.length, people, preferenceRows, profiles.length, selectedPersonLoading, selectedPersonUserIds.length]);

  const typeFrequencyUsage = useMemo(() => {
    return ADMIN_NOTIFICATION_TYPES.reduce<Record<string, number>>((acc, type) => {
      const frequency = frequencyOverrides[type.id] ?? type.defaultFrequency;
      acc[frequency] = (acc[frequency] || 0) + 1;
      return acc;
    }, {});
  }, [frequencyOverrides]);

  const templateThemeUsage = useMemo(() => {
    return ADMIN_NOTIFICATION_TEMPLATES.reduce<Record<AdminNotificationThemeId, number>>((acc, template) => {
      const theme = themeOverrides[template.id] ?? template.themeId;
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<AdminNotificationThemeId, number>);
  }, [themeOverrides]);

  const metricsCards = useMemo(() => {
    const totalSent = dispatchLogs.filter((log) => log.status === 'sent').length;
    const totalFailures = dispatchLogs.filter((log) => log.status === 'failed').length;
    const internalRead = notifications.filter((notification) => notification.canal === 'interna' && notification.lida).length;
    const clickTrackingAvailable = false;
    return [
      { label: 'Envios com sucesso', value: totalSent, helper: 'Dispatch com status Enviado.' },
      { label: 'Falhas', value: totalFailures, helper: 'Logs com status Falha.' },
      { label: 'Leituras internas', value: internalRead, helper: 'Notificações internas marcadas como lidas.' },
      { label: 'Cliques', value: clickTrackingAvailable ? 0 : 'Sem dados suficientes', helper: 'Tracking ainda não persistido.' },
    ];
  }, [dispatchLogs, notifications]);

  const metricsChannelPerformance = useMemo(() => {
    return ['interna', 'email', 'push', 'whatsapp'].map((channel) => ({
      channel,
      sent: dispatchLogs.filter((log) => log.canal === channel && log.status === 'sent').length,
      failures: dispatchLogs.filter((log) => log.canal === channel && log.status === 'failed').length,
      helper:
        channel === 'push'
          ? 'Canal preparado; provider ainda não confirmado.'
          : channel === 'whatsapp'
            ? 'Canal futuro em preparação.'
            : 'Baseado nos logs recentes de dispatch.',
    }));
  }, [dispatchLogs]);

  const automationRows = useMemo<AdminNotificationAutomationRow[]>(() => {
    const frequencyLabel = (id: AdminNotificationFrequencyId) =>
      ADMIN_NOTIFICATION_FREQUENCY_OPTIONS.find((option) => option.id === id)?.label || id;

    const groupLabelMap = recipientGroupRows.reduce<Record<string, string>>((acc, row) => {
      acc[row.id] = row.countLabel;
      return acc;
    }, {});

    return ADMIN_NOTIFICATION_AUTOMATIONS.map((automation) => {
      if (automation.id === 'daily_special_dates') {
        return {
          ...automation,
          statusLabel: automationInfo.status === 'configured' ? 'Ativa' : 'Em validação',
          nextRunLabel: automationInfo.scheduledTime,
          lastRunLabel: automationInfo.lastDispatchAt ? formatDate(automationInfo.lastDispatchAt) : 'Sem registro',
          estimatedRecipientsLabel: `${preferenceRows.filter((row) => row.categories.includes('Aniversários') || row.categories.includes('Datas de memória')).length} usuários`,
        };
      }

      return {
        ...automation,
        statusLabel: 'Preparada',
        nextRunLabel: frequencyLabel(automation.frequency),
        lastRunLabel: 'Sem execução registrada',
        estimatedRecipientsLabel: groupLabelMap[automation.recipientGroupId] || 'Sem estimativa',
      };
    });
  }, [automationInfo, preferenceRows, recipientGroupRows]);

  const peopleOptions = useMemo(() => people.map((person) => ({ id: person.id, name: person.nome_completo })), [people]);

  const confirmDialogContent = useMemo(() => {
    if (!pendingConfirmAction) return null;

    if (pendingConfirmAction.type === 'email_test') {
      return {
        title: 'Enviar e-mail de teste',
        description: 'Enviar um e-mail real de teste apenas para o seu usuário admin? A notificação interna também será criada.',
        confirmText: 'Enviar teste',
        loading: sendingEmailTest,
      };
    }

    if (pendingConfirmAction.type === 'manual_routine') {
      return {
        title: 'Executar rotina manual',
        description: 'Executar a rotina manual de aniversários e memórias agora? Ela pode criar notificações internas reais para os destinatários elegíveis.',
        confirmText: 'Executar rotina',
        loading: runningManualRoutine,
      };
    }

    return {
      title: 'Enviar teste de automação',
      description: `Enviar um teste controlado da automação "${pendingConfirmAction.automationTitle}" apenas para o admin logado?`,
      confirmText: 'Enviar teste',
      loading: sendingAutomationTest,
    };
  }, [pendingConfirmAction, runningManualRoutine, sendingAutomationTest, sendingEmailTest]);

  const confirmPendingAction = async () => {
    if (!pendingConfirmAction) return;

    if (pendingConfirmAction.type === 'email_test') {
      await confirmSendEmailTest();
      return;
    }

    if (pendingConfirmAction.type === 'manual_routine') {
      await confirmRunManualRoutine();
      return;
    }

    await confirmAutomationTest(pendingConfirmAction.automationId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Notificações"
        subtitle="Painel administrativo de gestão, automação e diagnóstico"
        icon={Bell}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
          { label: 'Atualizar painel', onClick: loadDiagnostics, icon: RefreshCcw, variant: 'primary', disabled: loading },
          { label: 'Teste interno', onClick: handleCreateInternalTest, icon: Bell, disabled: creatingTest || loading },
        ]}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {loadError && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6 text-sm text-amber-900">{loadError}</CardContent>
          </Card>
        )}

        <Tabs defaultValue="visao-geral" className="gap-6">
          <div className="overflow-x-auto">
            <TabsList className="h-auto min-w-max flex-wrap justify-start gap-2 rounded-lg bg-transparent p-0">
              <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
              <TabsTrigger value="configuracao">Configuração</TabsTrigger>
              <TabsTrigger value="preferencias">Preferências</TabsTrigger>
              <TabsTrigger value="automacoes">Automações</TabsTrigger>
              <TabsTrigger value="metricas">Métricas</TabsTrigger>
              <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="visao-geral">
            <AdminNotificationsOverview
              metrics={overviewMetrics}
              channelStatuses={channelStatuses}
              byType={summary.byType}
              byChannel={summary.byChannel}
            />
          </TabsContent>

          <TabsContent value="configuracao">
            <AdminNotificationConfiguration
              types={ADMIN_NOTIFICATION_TYPES}
              templates={ADMIN_NOTIFICATION_TEMPLATES}
              recipientGroups={ADMIN_NOTIFICATION_RECIPIENT_GROUPS}
              frequencyOverrides={frequencyOverrides}
              contentOverrides={contentOverrides}
              channelOverrides={channelOverrides}
              recipientOverrides={recipientOverrides}
              onFrequencyChange={(typeId, frequency) => setFrequencyOverrides((current) => ({ ...current, [typeId]: frequency }))}
              onContentChange={(templateId, content) => setContentOverrides((current) => ({ ...current, [templateId]: content }))}
              onChannelsChange={(typeId, channels) => setChannelOverrides((current) => ({ ...current, [typeId]: channels }))}
              onRecipientsChange={(typeId, recipients) => setRecipientOverrides((current) => ({ ...current, [typeId]: recipients }))}
            />
          </TabsContent>

          <TabsContent value="preferencias">
            <AdminNotificationPreferencesTable
              loading={loading}
              rows={filteredPreferenceRows}
              filters={preferenceFilters}
              onFiltersChange={setPreferenceFilters}
              categoryOptions={PREFERENCE_CATEGORY_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              channelOptions={CHANNEL_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              stats={preferenceStats}
            />
          </TabsContent>

          <TabsContent value="destinatarios">
            <AdminNotificationRecipients
              loading={loading}
              rows={recipientGroupRows}
              peopleOptions={peopleOptions}
              selectedPersonId={selectedPersonId}
              onSelectedPersonIdChange={setSelectedPersonId}
              selectedPersonCountLabel={
                selectedPersonId
                  ? selectedPersonLoading
                    ? 'Resolviendo usuários vinculados...'
                    : `${selectedPersonUserIds.length} usuários atualmente vinculados à pessoa selecionada.`
                  : 'Selecione uma pessoa para consultar.'
              }
            />
          </TabsContent>

          <TabsContent value="tipos">
            <AdminNotificationTypesCatalog
              items={ADMIN_NOTIFICATION_TYPES}
              frequencyOverrides={frequencyOverrides}
              activeOverrides={activeOverrides}
              onFrequencyChange={(typeId, frequency) => setFrequencyOverrides((current) => ({ ...current, [typeId]: frequency }))}
              onActiveChange={(typeId, active) => setActiveOverrides((current) => ({ ...current, [typeId]: active }))}
            />
          </TabsContent>

          <TabsContent value="templates">
            <div className="space-y-6">
              <AdminNotificationTemplates
                items={ADMIN_NOTIFICATION_TEMPLATES}
                themeOverrides={themeOverrides}
                onThemeChange={(templateId, themeId) => setThemeOverrides((current) => ({ ...current, [templateId]: themeId }))}
              />
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {ADMIN_NOTIFICATION_SUGGESTIONS.map((suggestion) => (
                      <span key={suggestion} className="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-700">
                        {suggestion}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="frequencia">
            <AdminNotificationFrequenciesAndThemes frequencyUsage={typeFrequencyUsage} themeUsage={templateThemeUsage} />
          </TabsContent>

          <TabsContent value="automacoes">
            <AdminNotificationAutomations
              rows={automationRows}
              runningManualRoutine={runningManualRoutine}
              onRunManual={handleAutomationRun}
              onRunTest={handleAutomationTest}
            />
          </TabsContent>

          <TabsContent value="metricas">
            <AdminNotificationMetrics metrics={metricsCards} channelPerformance={metricsChannelPerformance} />
          </TabsContent>

          <TabsContent value="diagnostico">
            <AdminNotificationDiagnostics
              loading={loading}
              emailConfig={emailConfig}
              automationInfo={automationInfo}
              emailTestResults={emailTestResults}
              notifications={notifications}
              dispatchLogs={dispatchLogs}
              manualRoutineSummary={manualRoutineSummary}
              manualRoutineError={manualRoutineError}
              runningManualRoutine={runningManualRoutine}
              sendingEmailTest={sendingEmailTest}
              onSendEmailTest={handleSendEmailTest}
              onRunManualRoutine={handleRunManualRoutine}
              formatDate={formatDate}
              maskUser={maskUserId}
            />
          </TabsContent>
        </Tabs>
      </main>

      <ConfirmDialog
        open={Boolean(pendingConfirmAction)}
        onOpenChange={(open) => {
          if (!open && !confirmDialogContent?.loading) setPendingConfirmAction(null);
        }}
        title={confirmDialogContent?.title || 'Confirmar ação'}
        description={confirmDialogContent?.description || 'Deseja continuar?'}
        confirmText={confirmDialogContent?.confirmText || 'Confirmar'}
        cancelText="Cancelar"
        onConfirm={confirmPendingAction}
        variant="warning"
        loading={Boolean(confirmDialogContent?.loading)}
      />
    </div>
  );
}
