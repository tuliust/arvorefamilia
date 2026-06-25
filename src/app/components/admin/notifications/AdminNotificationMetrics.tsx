import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

export function AdminNotificationMetrics(props: {
  metrics: Array<{ label: string; value: string | number; helper: string }>;
  channelPerformance: Array<{ channel: string; sent: number; failures: number; helper: string }>;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {props.metrics.map((metric) => (
          <Card key={metric.label}>
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
        <CardHeader>
          <CardTitle className="text-base">Desempenho por canal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {props.channelPerformance.map((channel) => (
            <div key={channel.channel} className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">{channel.channel}</p>
                <p className="text-sm text-gray-600">{channel.helper}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{channel.sent} envios</Badge>
                <Badge variant={channel.failures > 0 ? 'destructive' : 'secondary'}>{channel.failures} falhas</Badge>
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-600">
            Aberturas de e-mail, cliques e tracking detalhado por template ainda não possuem tabela dedicada nesta
            base. O layout já está preparado para conectar eventos futuros sem quebrar o painel atual.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
