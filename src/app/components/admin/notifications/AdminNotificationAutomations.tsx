import { Play, SendHorizontal } from 'lucide-react';
import { AdminNotificationAutomationDefinition } from '../../../constants/adminNotificationCatalog';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { formatAdminNotificationLabel } from './adminNotificationFormatters';

export interface AdminNotificationAutomationRow extends AdminNotificationAutomationDefinition {
  statusLabel: string;
  nextRunLabel: string;
  lastRunLabel: string;
  estimatedRecipientsLabel: string;
}

export function AdminNotificationAutomations(props: {
  rows: AdminNotificationAutomationRow[];
  runningManualRoutine: boolean;
  onRunManual: (automationId: string) => void;
  onRunTest: (automationId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {props.rows.map((row) => (
        <Card key={row.id}>
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-base">{row.title}</CardTitle>
              <p className="mt-2 text-sm text-gray-600">{row.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={row.supportsManualRun ? 'outline' : 'secondary'}>{row.statusLabel}</Badge>
              {row.channels.map((channel) => (
                <Badge key={channel} variant="secondary">
                  {formatAdminNotificationLabel(channel)}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Frequência</p>
                <p className="mt-1 font-medium text-gray-900">{formatAdminNotificationLabel(row.frequency)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Próxima execução</p>
                <p className="mt-1 font-medium text-gray-900">{row.nextRunLabel}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Última execução</p>
                <p className="mt-1 font-medium text-gray-900">{row.lastRunLabel}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Destinatários estimados</p>
                <p className="mt-1 font-medium text-gray-900">{row.estimatedRecipientsLabel}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => props.onRunManual(row.id)}
                disabled={!row.supportsManualRun || props.runningManualRoutine}
              >
                <Play className="h-4 w-4" />
                Executar manualmente
              </Button>
              <Button variant="outline" onClick={() => props.onRunTest(row.id)} disabled={!row.supportsTestRun}>
                <SendHorizontal className="h-4 w-4" />
                Enviar teste para mim
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
