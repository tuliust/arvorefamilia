import {
  AdminNotificationTemplateDefinition,
  AdminNotificationThemeId,
  ADMIN_NOTIFICATION_THEME_OPTIONS,
} from '../../../constants/adminNotificationCatalog';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

export function AdminNotificationTemplates(props: {
  items: AdminNotificationTemplateDefinition[];
  themeOverrides: Record<string, AdminNotificationThemeId>;
  onThemeChange: (templateId: string, themeId: AdminNotificationThemeId) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Templates de mensagens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Variáveis ausentes devem degradar visualmente para fallback simples no frontend ou no provider. A estrutura já
          fica preparada para templates internos, e-mail, push e WhatsApp futuro.
        </p>
        <div className="overflow-x-auto">
          <Table className="min-w-[1320px]">
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Texto curto</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Texto longo</TableHead>
                <TableHead>CTA</TableHead>
                <TableHead>Variáveis</TableHead>
                <TableHead>Canais</TableHead>
                <TableHead>Tema</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.items.map((item) => {
                const theme = props.themeOverrides[item.id] ?? item.themeId;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-[220px]">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.typeId}</p>
                    </TableCell>
                    <TableCell className="max-w-[220px] whitespace-normal text-sm text-gray-700">{item.shortMessage}</TableCell>
                    <TableCell className="max-w-[180px] whitespace-normal text-sm text-gray-700">{item.emailSubject || 'Não aplicável'}</TableCell>
                    <TableCell className="max-w-[320px] whitespace-normal text-sm text-gray-600">{item.longMessage}</TableCell>
                    <TableCell>{item.cta}</TableCell>
                    <TableCell>
                      <div className="flex max-w-[240px] flex-wrap gap-1">
                        {item.variables.map((variable) => (
                          <Badge key={variable} variant="outline">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.allowedChannels.map((channel) => (
                          <Badge key={channel} variant="secondary">
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="w-[220px]">
                      <Select value={theme} onValueChange={(value) => props.onThemeChange(item.id, value as AdminNotificationThemeId)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ADMIN_NOTIFICATION_THEME_OPTIONS.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.active ? 'outline' : 'secondary'}>{item.active ? 'Ativo' : 'Inativo'}</Badge>
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
