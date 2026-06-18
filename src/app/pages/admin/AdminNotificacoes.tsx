import React, { useEffect, useState } from 'react';
import { Bell, CalendarClock, Mail, RefreshCcw, Settings } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { NotificationStatusBadge } from '../../components/admin/NotificationStatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { dispatchNotification } from '../../services/notificationDispatchService';
import { DailyNotificationRunSummary, runDailyNotificationChecks } from '../../services/notificationScheduledService';
import {
  checkNotificationEmailConfiguration,
  DailyNotificationsAutomationInfo,
  getNotificationAdminSummary,
  getDailyNotificationsAutomationInfo,
  listRecentNotificationDispatchLogs,
  listRecentNotificationPreferencesAdmin,
  listRecentNotificationsAdmin,
  NotificationEmailConfiguration,
} from '../../services/notificationAdminService';
import {
  NotificationAdminSummary,
  NotificationDispatchLog,
  NotificationDispatchResult,
  NotificacaoUsuario,
  PreferenciaNotificacao,
} from '../../types';

function formatDate(value?: string) {
  if (!value) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function maskUserId(userId?: string | null) {
  if (!userId) return 'Usuário não informado';
  return `${userId.slice(0, 8)}...${userId.slice(-4)}`;
}

function booleanLabel(value: boolean) {
  return value ? 'Ligado' : 'Desligado';
}

function SummaryList({ title, items }: { title: string; items: Record<string, number> }) {
  const entries = Object.entries(items).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">Sem dados para exibir.</p>
        ) : (
          <div className="space-y-2">
            {entries.map(([label, count]) => (
              <div key={label} className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate text-gray-700">{label}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminNotificacoes() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificacaoUsuario[]>([]);
  const [preferences, setPreferences] = useState<PreferenciaNotificacao[]>([]);
  const [dispatchLogs, setDispatchLogs] = useState<NotificationDispatchLog[]>([]);
  const [summary, setSummary] = useState<NotificationAdminSummary>({
    totalNotifications: 0,
    unreadNotifications: 0,
    channelsUsed: 0,
    recentDispatchErrors: 0,
    byType: {},
    byChannel: {},
  });
  const [emailConfig, setEmailConfig] = useState<NotificationEmailConfiguration>(() =>
    checkNotificationEmailConfiguration()
  );
  const [automationInfo, setAutomationInfo] = useState<DailyNotificationsAutomationInfo>({
    status: 'not_verified',
    functionName: 'run-daily-notifications',
    scheduledTime: '08:00 America/Sao_Paulo',
    message: 'Verificação ainda não executada.',
  });
  const [loading, setLoading] = useState(true);
  const [creatingTest, setCreatingTest] = useState(false);
  const [sendingEmailTest, setSendingEmailTest] = useState(false);
  const [emailTestResults, setEmailTestResults] = useState<NotificationDispatchResult[] | null>(null);
  const [runningManualRoutine, setRunningManualRoutine] = useState(false);
  const [manualRoutineSummary, setManualRoutineSummary] = useState<DailyNotificationRunSummary | null>(null);
  const [manualRoutineError, setManualRoutineError] = useState<string | null>(null);

  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      const [nextNotifications, nextPreferences, nextDispatchLogs, nextSummary, nextAutomationInfo] = await Promise.all([
        listRecentNotificationsAdmin(50),
        listRecentNotificationPreferencesAdmin(50),
        listRecentNotificationDispatchLogs(50),
        getNotificationAdminSummary(),
        getDailyNotificationsAutomationInfo(),
      ]);

      setNotifications(nextNotifications);
      setPreferences(nextPreferences);
      setDispatchLogs(nextDispatchLogs);
      setSummary(nextSummary);
      setEmailConfig(checkNotificationEmailConfiguration());
      setAutomationInfo(nextAutomationInfo);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

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
        metadata: {
          source: 'admin-notificacoes',
          test: true,
        },
        channels: ['interna'],
      });
      await loadDiagnostics();
    } finally {
      setCreatingTest(false);
    }
  };

  const handleSendEmailTest = async () => {
    if (!user?.id) return;
    const confirmed = window.confirm(
      'Enviar um e-mail real de teste apenas para o seu usuário admin? A notificação interna também será criada.'
    );
    if (!confirmed) return;

    try {
      setSendingEmailTest(true);
      const results = await dispatchNotification({
        userId: user.id,
        type: 'notificacao',
        titulo: 'Teste de e-mail de notificação',
        mensagem: 'E-mail de teste enviado pelo painel admin para validar provider, preferências e logs.',
        link: '/notificacoes',
        metadata: {
          source: 'admin-email-test',
          test: true,
        },
        channels: ['interna', 'email'],
        respectPreferences: true,
      });
      setEmailTestResults(results);
      await loadDiagnostics();
    } finally {
      setSendingEmailTest(false);
    }
  };

  const handleRunManualRoutine = async () => {
    try {
      setRunningManualRoutine(true);
      setManualRoutineError(null);
      const result = await runDailyNotificationChecks();
      setManualRoutineSummary(result);
      await loadDiagnostics();
    } catch (error) {
      setManualRoutineError(
        error instanceof Error ? error.message : 'Não foi possível executar a rotina manual de notificações.'
      );
    } finally {
      setRunningManualRoutine(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Notificações"
        subtitle="Diagnóstico administrativo de preferências e disparos"
        icon={Bell}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
          { label: 'Atualizar diagnóstico', onClick: loadDiagnostics, icon: RefreshCcw, variant: 'primary', disabled: loading },
          { label: 'Teste interno', onClick: handleCreateInternalTest, icon: Bell, disabled: creatingTest || loading },
        ]}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="min-w-0">
            <CardHeader className="pb-2">
              <CardTitle className="break-words text-sm font-medium text-gray-600">Total de notificações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{summary.totalNotifications}</div>
              <p className="mt-1 break-words text-xs text-gray-500">Registros recentes acessíveis ao admin</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="pb-2">
              <CardTitle className="break-words text-sm font-medium text-gray-600">Não lidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{summary.unreadNotifications}</div>
              <p className="mt-1 text-xs text-gray-500">Pendentes na área interna</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="pb-2">
              <CardTitle className="break-words text-sm font-medium text-gray-600">Canais usados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{summary.channelsUsed}</div>
              <p className="mt-1 break-words text-xs text-gray-500">Canais presentes nas notificações</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="pb-2">
              <CardTitle className="break-words text-sm font-medium text-gray-600">Últimos erros de envio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{summary.recentDispatchErrors}</div>
              <p className="mt-1 break-words text-xs text-gray-500">Falhas nos logs recentes de dispatch</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SummaryList title="Resumo por tipo" items={summary.byType} />
          <SummaryList title="Resumo por canal" items={summary.byChannel} />
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex min-w-0 items-center gap-2 break-words text-base">
              <Mail className="h-4 w-4 shrink-0" />
              Diagnóstico de e-mail
            </CardTitle>
            <Badge variant={emailConfig.status === 'not_configured' ? 'destructive' : 'outline'}>
              {emailConfig.status === 'verified'
                ? 'Verificado'
                : emailConfig.status === 'not_configured'
                  ? 'Não configurado'
                  : 'Não verificado'}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="break-words text-sm text-gray-700">{emailConfig.message}</p>
            <p className="mt-2 break-words text-xs text-gray-500">
              Função esperada: {emailConfig.functionName}. Secrets não são verificáveis pelo frontend; valide com teste controlado.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Button variant="outline" className="w-full sm:w-auto" onClick={handleSendEmailTest} disabled={sendingEmailTest || loading}>
                <Mail className="mr-2 h-4 w-4 shrink-0" />
                Enviar e-mail de teste para mim
              </Button>
              {sendingEmailTest && <span className="text-sm text-gray-500">Enviando teste...</span>}
            </div>
            {emailTestResults && (
              <div className="mt-4 space-y-2">
                {emailTestResults.map((result) => (
                  <div
                    key={`${result.channel}-${result.status}-${result.notificationId || 'sem-id'}`}
                    className="flex min-w-0 flex-col gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                  >
                    <span className="break-words font-medium text-gray-800">{result.channel}</span>
                    <NotificationStatusBadge status={result.status} />
                    <span className="break-all text-xs text-gray-500">{result.errorMessage || result.provider || 'Sem erro'}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="break-words text-base">Rotinas manuais</CardTitle>
            <Button className="w-full sm:w-auto" onClick={handleRunManualRoutine} disabled={runningManualRoutine || loading}>
              <RefreshCcw className="mr-2 h-4 w-4 shrink-0" />
              Verificar aniversários e memórias de hoje
            </Button>
          </CardHeader>
          <CardContent>
            <p className="break-words text-sm text-gray-700">
              Executa apenas notificações internas para datas completas do dia. Não envia e-mail, push ou WhatsApp.
            </p>

            {runningManualRoutine && (
              <p className="mt-3 text-sm text-gray-500">Verificando datas especiais...</p>
            )}

            {manualRoutineError && (
              <p className="mt-3 break-words rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {manualRoutineError}
              </p>
            )}

            {manualRoutineSummary && (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
                <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">Aniversários</p>
                  <p className="text-xl font-semibold text-gray-900">{manualRoutineSummary.birthdaysFound}</p>
                </div>
                <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">Memórias</p>
                  <p className="text-xl font-semibold text-gray-900">{manualRoutineSummary.memorialsFound}</p>
                </div>
                <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">Criadas</p>
                  <p className="text-xl font-semibold text-gray-900">{manualRoutineSummary.notificationsCreated}</p>
                </div>
                <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">Duplicadas</p>
                  <p className="text-xl font-semibold text-gray-900">{manualRoutineSummary.skippedDuplicates}</p>
                </div>
                <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">Preferências</p>
                  <p className="text-xl font-semibold text-gray-900">{manualRoutineSummary.skippedByPreferences}</p>
                </div>
                <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">Sem destinatário</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {manualRoutineSummary.skippedWithoutRecipients}
                  </p>
                </div>
                <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">Falhas</p>
                  <p className="text-xl font-semibold text-gray-900">{manualRoutineSummary.dispatchFailures}</p>
                </div>
                <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">Destinatários</p>
                  <p className="text-xl font-semibold text-gray-900">{manualRoutineSummary.recipientsResolved}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex min-w-0 items-center gap-2 break-words text-base">
              <CalendarClock className="h-4 w-4 shrink-0" />
              Agendamento automático
            </CardTitle>
            <Badge
              variant={
                automationInfo.status === 'configured'
                  ? 'outline'
                  : automationInfo.status === 'not_configured'
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {automationInfo.status === 'configured'
                ? 'Configurado'
                : automationInfo.status === 'not_configured'
                  ? 'Não configurado'
                  : 'Não verificado'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Function</p>
	                <p className="break-all font-medium text-gray-900">{automationInfo.functionName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Horário planejado</p>
	                <p className="break-words font-medium text-gray-900">{automationInfo.scheduledTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Última ocorrência</p>
	                <p className="break-words font-medium text-gray-900">
                  {automationInfo.lastOccurrenceAt
                    ? `${formatDate(automationInfo.lastOccurrenceAt)} (${automationInfo.lastOccurrenceDate})`
                    : 'Sem registro'}
                </p>
              </div>
            </div>
	            <p className="mt-3 break-words text-sm text-gray-600">{automationInfo.message}</p>
            {automationInfo.lastDispatchAt && (
	              <p className="mt-1 break-words text-xs text-gray-500">Último dispatch: {formatDate(automationInfo.lastDispatchAt)}</p>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="break-words text-base">Notificações recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Carregando notificações...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma notificação encontrada.</p>
            ) : (
              <div className="overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Criada em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="max-w-[320px] whitespace-normal">
	                        <p className="break-words font-medium text-gray-900">{notification.titulo}</p>
	                        <p className="line-clamp-2 break-words text-xs text-gray-500">{notification.mensagem}</p>
                      </TableCell>
	                      <TableCell className="break-words">{notification.tipo}</TableCell>
	                      <TableCell className="break-words">{notification.canal}</TableCell>
                      <TableCell>
                        <Badge variant={notification.lida ? 'outline' : 'secondary'}>
                          {notification.lida ? 'Lida' : 'Não lida'}
                        </Badge>
                      </TableCell>
	                      <TableCell className="break-all">{maskUserId(notification.user_id)}</TableCell>
                      <TableCell>{formatDate(notification.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
	              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="break-words text-base">Preferências de usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Carregando preferências...</p>
            ) : preferences.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma preferência encontrada.</p>
            ) : (
              <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Push</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Atualizada em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preferences.map((preference) => (
                    <TableRow key={preference.id}>
	                      <TableCell className="break-all">{maskUserId(preference.user_id)}</TableCell>
                      <TableCell>{booleanLabel(preference.receber_email)}</TableCell>
                      <TableCell>{booleanLabel(preference.receber_push)}</TableCell>
                      <TableCell>{booleanLabel(preference.receber_whatsapp)}</TableCell>
                      <TableCell>{formatDate(preference.updated_at || preference.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
	              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="break-words text-base">Logs de dispatch</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Carregando logs...</p>
            ) : dispatchLogs.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum log de dispatch encontrado.</p>
            ) : (
              <div className="overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Erro</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispatchLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <NotificationStatusBadge status={log.status} />
                      </TableCell>
	                      <TableCell className="break-words">{log.tipo}</TableCell>
	                      <TableCell className="break-words">{log.canal}</TableCell>
	                      <TableCell className="break-all">{log.provider || 'Não informado'}</TableCell>
	                      <TableCell className="max-w-[280px] whitespace-normal break-words text-xs text-gray-600">
                        {log.error_message || 'Sem erro registrado'}
                      </TableCell>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
	              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
