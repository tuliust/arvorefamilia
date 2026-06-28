import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { formatAdminNotificationLabel } from './adminNotificationFormatters';

export interface AdminNotificationPreferenceRow {
  id: string;
  userId: string;
  displayName: string;
  updatedAt?: string;
  channels: string[];
  categories: string[];
  hasDefaultPreferences: boolean;
  acceptsEmail: boolean;
  acceptsPush: boolean;
  acceptsWhatsapp: boolean;
}

export interface AdminNotificationPreferenceFilters {
  query: string;
  category: string;
  channel: string;
  status: string;
}

function StatCard({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{helper}</p>
    </div>
  );
}

export function AdminNotificationPreferencesTable(props: {
  loading: boolean;
  rows: AdminNotificationPreferenceRow[];
  filters: AdminNotificationPreferenceFilters;
  onFiltersChange: (next: AdminNotificationPreferenceFilters) => void;
  categoryOptions: Array<{ value: string; label: string }>;
  channelOptions: Array<{ value: string; label: string }>;
  stats: Array<{ label: string; value: string | number; helper: string }>;
}) {
  const { filters, onFiltersChange } = props;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferências selecionadas pelos usuários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              value={filters.query}
              onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
              placeholder="Buscar por usuário"
            />
            <Select value={filters.category} onValueChange={(value) => onFiltersChange({ ...filters, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {props.categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.channel} onValueChange={(value) => onFiltersChange({ ...filters, channel: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                {props.channelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="default">Preferência padrão</SelectItem>
                <SelectItem value="custom">Preferência customizada</SelectItem>
                <SelectItem value="optout">Com recusas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {props.stats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} helper={stat.helper} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usuários com preferências carregadas</CardTitle>
        </CardHeader>
        <CardContent>
          {props.loading ? (
            <p className="text-sm text-gray-500">Carregando preferências...</p>
          ) : props.rows.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma preferência encontrada para os filtros atuais.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Categorias aceitas</TableHead>
                    <TableHead>Canais</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Atualizada em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {props.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium text-gray-900">{row.displayName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {row.categories.map((category) => (
                            <Badge key={category} variant="outline">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {row.channels.map((channel) => (
                            <Badge key={channel} variant="secondary">
                              {formatAdminNotificationLabel(channel)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.hasDefaultPreferences ? 'secondary' : 'outline'}>
                          {row.hasDefaultPreferences ? 'Padrão' : 'Customizada'}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.updatedAt || 'Sem data'}</TableCell>
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
