import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { formatAdminNotificationLabel } from './adminNotificationFormatters';

export interface AdminRecipientGroupRow {
  id: string;
  title: string;
  description: string;
  kind: string;
  availability: string;
  countLabel: string;
}

export function AdminNotificationRecipients(props: {
  loading: boolean;
  rows: AdminRecipientGroupRow[];
  peopleOptions: Array<{ id: string; name: string }>;
  selectedPersonId: string;
  onSelectedPersonIdChange: (value: string) => void;
  selectedPersonCountLabel: string;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Destinatários e grupos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-700">
                Nesta etapa a gestão usa grupos automáticos, grupos resolvidos por gatilho e placeholders para grupos
                manuais futuros. Não há disparo em massa sem confirmação explícita.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="mb-2 text-xs text-gray-500">Usuários vinculados a uma pessoa específica</p>
              <Select value={props.selectedPersonId} onValueChange={props.onSelectedPersonIdChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma pessoa" />
                </SelectTrigger>
                <SelectContent>
                  {props.peopleOptions.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 text-sm text-gray-600">{props.selectedPersonCountLabel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catálogo de grupos e destinatários</CardTitle>
        </CardHeader>
        <CardContent>
          {props.loading ? (
            <p className="text-sm text-gray-500">Carregando grupos...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Disponibilidade</TableHead>
                    <TableHead>Volume atual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {props.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium text-gray-900">{row.title}</TableCell>
                      <TableCell className="max-w-[320px] whitespace-normal text-sm text-gray-600">{row.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{formatAdminNotificationLabel(row.kind)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.availability === 'available' ? 'outline' : 'secondary'}>
                          {formatAdminNotificationLabel(row.availability)}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.countLabel}</TableCell>
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
