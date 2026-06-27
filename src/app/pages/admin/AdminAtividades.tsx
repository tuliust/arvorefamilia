import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Filter, RefreshCcw, Settings, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { supabase } from '../../lib/supabaseClient';
import {
  ACTIVITY_ACTION_LABELS,
  ACTIVITY_ENTITY_LABELS,
  getActivityActionLabel,
  getActivitySummary,
  listActivityLogs,
} from '../../services/activityLogService';
import { ActivityLog, ActivityLogAction, ActivityLogEntityType, ActivityLogFilters } from '../../types';

type ActivityFilters = {
  action: ActivityLogAction | 'all';
  entityType: ActivityLogEntityType | 'all';
  actorQuery: string;
  entityQuery: string;
  createdFrom: string;
  createdTo: string;
};

const INITIAL_FILTERS: ActivityFilters = {
  action: 'all',
  entityType: 'all',
  actorQuery: '',
  entityQuery: '',
  createdFrom: '',
  createdTo: '',
};

function formatActivityDate(value?: string) {
  if (!value) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getFirstTwoNames(value?: string | null) {
  const parts = String(value ?? '').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).join(' ') || 'Autor não identificado';
}

function normalizeRelationshipWords(value: string) {
  return value
    .replace(/\bmae\b/gi, 'mãe')
    .replace(/\birmao\b/gi, 'irmão')
    .replace(/\birmaos\b/gi, 'irmãos')
    .replace(/\bconjuge\b/gi, 'cônjuge')
    .replace(/\bconjuges\b/gi, 'cônjuges');
}

function buildServiceFilters(filters: ActivityFilters): ActivityLogFilters {
  return {
    limit: 100,
    action: filters.action === 'all' ? undefined : filters.action,
    entity_type: filters.entityType === 'all' ? undefined : filters.entityType,
    actor_query: filters.actorQuery.trim() || undefined,
    entity_query: filters.entityQuery.trim() || undefined,
    created_from: filters.createdFrom ? new Date(`${filters.createdFrom}T00:00:00`).toISOString() : undefined,
    created_to: filters.createdTo ? new Date(`${filters.createdTo}T23:59:59`).toISOString() : undefined,
  };
}

function applyDeleteFilters(query: any, filters: ActivityFilters) {
  if (filters.action !== 'all') query = query.eq('action', filters.action);
  if (filters.entityType !== 'all') query = query.eq('entity_type', filters.entityType);
  if (filters.actorQuery.trim()) query = query.ilike('actor_display_name', `%${filters.actorQuery.trim()}%`);
  if (filters.entityQuery.trim()) query = query.ilike('entity_label', `%${filters.entityQuery.trim()}%`);
  if (filters.createdFrom) query = query.gte('created_at', new Date(`${filters.createdFrom}T00:00:00`).toISOString());
  if (filters.createdTo) query = query.lte('created_at', new Date(`${filters.createdTo}T23:59:59`).toISOString());
  return query;
}

function ActivityRow({ activity }: { activity: ActivityLog }) {
  const summary = normalizeRelationshipWords(getActivitySummary(activity));

  return (
    <div className="grid min-w-0 gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(8rem,0.8fr)_minmax(10rem,1fr)_minmax(12rem,1fr)_minmax(18rem,2fr)] lg:items-start">
      <div className="break-words text-sm text-gray-600">{formatActivityDate(activity.created_at)}</div>
      <div className="min-w-0">
        <p className="break-words text-sm font-medium text-gray-900">
          {getFirstTwoNames(activity.actor_display_name)}
        </p>
      </div>
      <div className="min-w-0">
        <p className="break-words text-sm font-medium text-gray-900">
          {getActivityActionLabel(activity.action)}
        </p>
      </div>
      <div className="min-w-0">
        <p className="break-words text-sm text-gray-900">{summary}</p>
      </div>
    </div>
  );
}

export function AdminAtividades() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filters, setFilters] = useState<ActivityFilters>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);

  const activeFiltersCount = useMemo(() => {
    return [
      filters.action !== 'all',
      filters.entityType !== 'all',
      Boolean(filters.actorQuery.trim()),
      Boolean(filters.entityQuery.trim()),
      Boolean(filters.createdFrom),
      Boolean(filters.createdTo),
    ].filter(Boolean).length;
  }, [filters]);

  const loadActivities = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const data = await listActivityLogs(buildServiceFilters(nextFilters));
      setActivities(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(INITIAL_FILTERS);
  }, []);

  const handleApplyFilters = () => {
    loadActivities(filters);
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    loadActivities(INITIAL_FILTERS);
  };

  const handleClearActivities = async () => {
    const confirmed = window.confirm(
      activeFiltersCount > 0
        ? 'Limpar permanentemente as atividades filtradas? Esta ação não pode ser desfeita.'
        : 'Limpar permanentemente todo o histórico de atividades? Esta ação não pode ser desfeita.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const deleteQuery = applyDeleteFilters(
        supabase
          .from('activity_logs')
          .delete({ count: 'exact' })
          .not('id', 'is', null),
        filters
      );
      const { error } = await deleteQuery;

      if (error) throw error;

      const data = await listActivityLogs(buildServiceFilters(filters));
      setActivities(data);
    } catch (error) {
      console.error('Erro ao limpar histórico de atividades:', error);
      window.alert('Não foi possível limpar o histórico de atividades.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Histórico de Atividades"
        subtitle="Auditoria administrativa das alterações recentes"
        icon={Clock}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
        ]}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Card className="mb-6 min-w-0">
          <CardHeader>
            <CardTitle className="flex min-w-0 items-center gap-2 break-words text-base">
              <Filter className="h-4 w-4 shrink-0" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {activeFiltersCount}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="min-w-0 space-y-1 text-sm font-medium text-gray-700">
                Tipo de ação
                <select
                  className="h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 text-sm"
                  value={filters.action}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      action: event.target.value as ActivityFilters['action'],
                    }))
                  }
                >
                  <option value="all">Todas</option>
                  {Object.entries(ACTIVITY_ACTION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="min-w-0 space-y-1 text-sm font-medium text-gray-700">
                Entidade
                <select
                  className="h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 text-sm"
                  value={filters.entityType}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      entityType: event.target.value as ActivityFilters['entityType'],
                    }))
                  }
                >
                  <option value="all">Todas</option>
                  {Object.entries(ACTIVITY_ENTITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="min-w-0 space-y-1 text-sm font-medium text-gray-700">
                Usuário Autor
                <Input
                  value={filters.actorQuery}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, actorQuery: event.target.value }))
                  }
                  placeholder="Nome"
                />
              </label>

              <label className="min-w-0 space-y-1 text-sm font-medium text-gray-700">
                Usuário
                <Input
                  value={filters.entityQuery}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, entityQuery: event.target.value }))
                  }
                  placeholder="Nome do usuário"
                />
              </label>

              <label className="min-w-0 space-y-1 text-sm font-medium text-gray-700">
                De
                <Input
                  type="date"
                  value={filters.createdFrom}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, createdFrom: event.target.value }))
                  }
                />
              </label>

              <label className="min-w-0 space-y-1 text-sm font-medium text-gray-700">
                Até
                <Input
                  type="date"
                  value={filters.createdTo}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, createdTo: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Button className="w-full sm:w-auto" onClick={handleApplyFilters} disabled={loading}>
                Aplicar filtros
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={handleClearFilters} disabled={loading}>
                Limpar filtros
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => void handleClearActivities()} disabled={loading || activities.length === 0}>
                <Trash2 className="mr-2 h-4 w-4 shrink-0" />
                Limpar
              </Button>
              <Button variant="ghost" className="w-full sm:w-auto" onClick={() => loadActivities(filters)} disabled={loading}>
                <RefreshCcw className="mr-2 h-4 w-4 shrink-0" />
                Atualizar
              </Button>
              <span className="break-words text-sm text-gray-500">
                {loading ? 'Carregando...' : `${activities.length} atividades encontradas`}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="break-words">Atividades</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="px-4 py-6 text-sm text-gray-500">Carregando histórico...</p>
            ) : activities.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500">Nenhuma atividade registrada.</p>
            ) : (
              <div>
                <div className="hidden border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 lg:grid lg:grid-cols-[minmax(8rem,0.8fr)_minmax(10rem,1fr)_minmax(12rem,1fr)_minmax(18rem,2fr)]">
                  <span>Data</span>
                  <span>Autor</span>
                  <span>Atividade</span>
                  <span>Resumo</span>
                </div>
                {activities.map((activity) => (
                  <ActivityRow key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
