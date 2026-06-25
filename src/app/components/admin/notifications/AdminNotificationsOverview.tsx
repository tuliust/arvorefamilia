import { BellRing, Mail, MessageSquareMore, Send, Smartphone } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

interface OverviewMetric {
  id: string;
  label: string;
  value: string | number;
  helper: string;
}

interface ChannelStatus {
  channel: string;
  status: string;
  detail: string;
}

function SummaryList({ title, items }: { title: string; items: Record<string, number> }) {
  const entries = Object.entries(items).sort((left, right) => right[1] - left[1]).slice(0, 8);

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

const CHANNEL_ICONS: Record<string, typeof BellRing> = {
  interna: BellRing,
  email: Mail,
  push: Smartphone,
  whatsapp: MessageSquareMore,
};

function statusVariant(status: string): 'outline' | 'secondary' | 'destructive' {
  if (status === 'ativo' || status === 'verificado') return 'outline';
  if (status === 'não configurado') return 'destructive';
  return 'secondary';
}

export function AdminNotificationsOverview(props: {
  metrics: OverviewMetric[];
  channelStatuses: ChannelStatus[];
  byType: Record<string, number>;
  byChannel: Record<string, number>;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {props.metrics.map((metric) => (
          <Card key={metric.id} className="min-w-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
              <p className="mt-1 text-xs text-gray-500">{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4" />
            Canais disponíveis
          </CardTitle>
          <Badge variant="secondary">{props.channelStatuses.length} canais monitorados</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {props.channelStatuses.map((channelStatus) => {
              const Icon = CHANNEL_ICONS[channelStatus.channel] || BellRing;
              return (
                <div
                  key={channelStatus.channel}
                  className="flex min-w-0 items-start justify-between gap-3 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="rounded-md border border-gray-200 bg-gray-50 p-2">
                      <Icon className="h-4 w-4 text-gray-700" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{channelStatus.channel}</p>
                      <p className="text-sm text-gray-600">{channelStatus.detail}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant(channelStatus.status)}>{channelStatus.status}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SummaryList title="Resumo por tipo" items={props.byType} />
        <SummaryList title="Resumo por canal" items={props.byChannel} />
      </div>
    </div>
  );
}
