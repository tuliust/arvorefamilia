import {
  AdminNotificationFrequencyId,
  AdminNotificationTypeDefinition,
  ADMIN_NOTIFICATION_FREQUENCY_OPTIONS,
} from '../../../constants/adminNotificationCatalog';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { formatAdminNotificationLabel } from './adminNotificationFormatters';

export function AdminNotificationTypesCatalog(props: {
  items: AdminNotificationTypeDefinition[];
  frequencyOverrides: Record<string, AdminNotificationFrequencyId>;
  activeOverrides: Record<string, boolean>;
  onFrequencyChange: (typeId: string, frequency: AdminNotificationFrequencyId) => void;
  onActiveChange: (typeId: string, active: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Catálogo de tipos de notificações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Canais</TableHead>
                <TableHead>Destinatário padrão</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Modo</TableHead>
                <TableHead>Ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.items.map((item) => {
                const frequency = props.frequencyOverrides[item.id] ?? item.defaultFrequency;
                const active = props.activeOverrides[item.id] ?? item.active;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-[220px]">
                      <p className="font-medium text-gray-900">{item.administrativeName}</p>
                      <p className="text-xs text-gray-500">{item.shortName}</p>
                    </TableCell>
                    <TableCell className="max-w-[340px] whitespace-normal text-sm text-gray-600">{item.description}</TableCell>
                    <TableCell>
                      <Badge variant={item.priority === 'alta' ? 'destructive' : item.priority === 'media' ? 'secondary' : 'outline'}>
                        {formatAdminNotificationLabel(item.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.allowedChannels.map((channel) => (
                          <Badge key={channel} variant="outline">
                            {formatAdminNotificationLabel(channel)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{item.defaultAudience}</TableCell>
                    <TableCell className="w-[220px]">
                      <Select value={frequency} onValueChange={(value) => props.onFrequencyChange(item.id, value as AdminNotificationFrequencyId)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ADMIN_NOTIFICATION_FREQUENCY_OPTIONS.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatAdminNotificationLabel(item.automationMode)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={active} onCheckedChange={(checked) => props.onActiveChange(item.id, checked)} />
                        <span className="text-sm text-gray-600">{active ? 'Ativo' : 'Inativo'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
