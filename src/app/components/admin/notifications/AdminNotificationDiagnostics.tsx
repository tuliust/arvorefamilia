import { CalendarClock, Mail, RefreshCcw } from 'lucide-react';
import { DailyNotificationsAutomationInfo, NotificationEmailConfiguration } from '../../../services/notificationAdminService';
import { NotificationStatusBadge } from '../NotificationStatusBadge';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { NotificationDispatchLog, NotificationDispatchResult, NotificacaoUsuario } from '../../../types';
import { DailyNotificationRunSummary } from '../../../services/notificationScheduledService';
import { formatAdminNotificationLabel } from './adminNotificationFormatters';

export function AdminNotificationDiagnostics(props: {
  loading: boolean;
  emailConfig: NotificationEmailConfiguration;
  automationInfo: DailyNotificationsAutomationInfo;
  emailTestResults: NotificationDispatchResult[] | null;
  notifications: NotificacaoUsuario[];
  dispatchLogs: NotificationDispatchLog[];
  manualRoutineSummary: DailyNotificationRunSummary | null;
  manualRoutineError: string | null;
  runningManualRoutine: boolean;
  sendingEmailTest: boolean;
  onSendEmailTest: () => void;
  onRunManualRoutine: () => void;
  formatDate: (value?: string) => string;
  maskUser: (userId?: string | null) => string;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Diagnóstico de e-mail
          </CardTitle>
          <Badge variant={props.emailConfig.status === 'not_configured' ? 'destructive' : 'outline'}>
            {props.emailConfig.status === 'verified'
              ? 'Verificado'
              : props.emailConfig.status === 'not_configured'
                ? 'Não configurado'
                : 'Não verificado'}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{props.emailConfig.message}</p>
          <p className="mt-2 text-xs text-gray-500">
            Função esperada: {props.emailConfig.functionName}. Segredos do provider continuam fora do escopo do
            frontend.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={props.onSendEmailTest} disabled={props.sendingEmailTest || props.loading}>
              <Mail className="h-4 w-4" />
              Enviar e-mail de teste para mim
            </Button>
          </div>
          {props.emailTestResults && (
            <div className="mt-4 space-y-2">
              {props.emailTestResults.map((result) => (
                <div
                  key={`${result.channel}-${result.status}-${result.notificationId || 'sem-id'}`}
                  className="flex flex-col gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium text-gray-800">{formatAdminNotificationLabel(result.channel)}</span>
                  <NotificationStatusBadge status={result.status} />
                  <span className="break-all text-xs text-gray-500">{result.errorMessage || result.provider || 'Sem erro'}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCcw className="h-4 w-4" />
            Rotina manual de datas especiais
          </CardTitle>
          <Button onClick={props.onRunManualRoutine} disabled={props.runningManualRoutine || props.loading}>
            <RefreshCcw className="h-4 w-4" />
            Verificar aniversários e memórias de hoje
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">
            Executa apenas notificações internas para datas completas do dia. Não envia push nem WhatsApp e respeita a
            proteção de confirmação antes de disparo real em massa.
          </p>
          {props.manualRoutineError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {props.manualRoutineError}
            </p>
          )}
          {props.manualRoutineSummary && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['Aniversários', props.manualRoutineSummary.birthdaysFound],
                ['Memórias', props.manualRoutineSummary.memorialsFound],
                ['Criadas', props.manualRoutineSummary.notificationsCreated],
                ['Duplicadas', props.manualRoutineSummary.skippedDuplicates],
                ['Preferências', props.manualRoutineSummary.skippedByPreferences],
                ['Sem destinatário', props.manualRoutineSummary.skippedWithoutRecipients],
                ['Falhas', props.manualRoutineSummary.dispatchFailures],
                ['Destinatários', props.manualRoutineSummary.recipientsResolved],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="h-4 w-4" />
            Diagnóstico da automação agendada
          </CardTitle>
          <Badge variant={props.automationInfo.status === 'configured' ? 'outline' : 'secondary'}>
            {props.automationInfo.status === 'configured' ? 'Configurado' : 'Em validação'}
          </Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Função</p>
            <p className="mt-1 font-medium text-gray-900">{props.automationInfo.functionName}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Agendamento</p>
            <p className="mt-1 font-medium text-gray-900">{props.automationInfo.scheduledTime}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Último dispatch</p>
            <p className="mt-1 font-medium text-gray-900">
              {props.automationInfo.lastDispatchAt ? props.formatDate(props.automationInfo.lastDispatchAt) : 'Sem registro'}
            </p>
          </div>
          <div className="md:col-span-3 rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-700">{props.automationInfo.message}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notificações recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {props.loading ? (
            <p className="text-sm text-gray-500">Carregando notificações...</p>
          ) : props.notifications.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma notificação encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[860px]">
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
                  {props.notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="max-w-[320px] whitespace-normal">
                        <p className="font-medium text-gray-900">{notification.titulo}</p>
                        <p className="line-clamp-2 text-xs text-gray-500">{notification.mensagem}</p>
                      </TableCell>
                      <TableCell>{formatAdminNotificationLabel(notification.tipo)}</TableCell>
                      <TableCell>{formatAdminNotificationLabel(notification.canal)}</TableCell>
                      <TableCell>
                        <Badge variant={notification.lida ? 'outline' : 'secondary'}>
                          {notification.lida ? 'Lida' : 'Não lida'}
                        </Badge>
                      </TableCell>
                      <TableCell>{props.maskUser(notification.user_id)}</TableCell>
                      <TableCell>{props.formatDate(notification.created_at)}</TableCell>
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
          <CardTitle className="text-base">Logs recentes de dispatch</CardTitle>
        </CardHeader>
        <CardContent>
          {props.loading ? (
            <p className="text-sm text-gray-500">Carregando logs...</p>
          ) : props.dispatchLogs.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum log de dispatch encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[860px]">
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
                  {props.dispatchLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <NotificationStatusBadge status={log.status} />
                      </TableCell>
                      <TableCell>{formatAdminNotificationLabel(log.tipo)}</TableCell>
                      <TableCell>{formatAdminNotificationLabel(log.canal)}</TableCell>
                      <TableCell>{log.provider || 'Não informado'}</TableCell>
                      <TableCell className="max-w-[280px] whitespace-normal text-xs text-gray-600">
                        {log.error_message || 'Sem erro registrado'}
                      </TableCell>
                      <TableCell>{props.formatDate(log.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
