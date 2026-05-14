import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, Eye, Filter, RefreshCcw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { supabase } from '../../lib/supabaseClient';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../../services/dataService';
import {
  approveRelationshipChangeRequest,
  listAllRelationshipChangeRequests,
  rejectRelationshipChangeRequest,
} from '../../services/relationshipChangeRequestService';
import {
  Pessoa,
  Relacionamento,
  RelationshipChangeRequest,
  RelationshipChangeRequestAction,
  RelationshipChangeRequestStatus,
  TipoRelacionamento,
} from '../../types';

type RequestFilters = {
  status: RelationshipChangeRequestStatus | 'all';
  action: RelationshipChangeRequestAction | 'all';
  relationshipType: TipoRelacionamento | 'all';
  requesterQuery: string;
  relatedQuery: string;
  createdFrom: string;
  createdTo: string;
};

type ProfileSummary = {
  id: string;
  nome_exibicao?: string | null;
};

const INITIAL_FILTERS: RequestFilters = {
  status: 'pending',
  action: 'all',
  relationshipType: 'all',
  requesterQuery: '',
  relatedQuery: '',
  createdFrom: '',
  createdTo: '',
};

const STATUS_LABELS: Record<RelationshipChangeRequestStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  cancelled: 'Cancelada',
};

const ACTION_LABELS: Record<RelationshipChangeRequestAction, string> = {
  create: 'Criar',
  update: 'Editar',
  delete: 'Remover',
};

const RELATIONSHIP_TYPE_LABELS: Record<TipoRelacionamento, string> = {
  conjuge: 'Conjuge',
  pai: 'Pai',
  mae: 'Mae',
  filho: 'Filho(a)',
  irmao: 'Irmao(a)',
};

const SENSITIVE_PAYLOAD_KEYS = new Set([
  'observacoes',
  'admin_note',
  'telefone',
  'endereco',
  'email',
  'url',
  'foto_principal_url',
]);

function formatDateTime(value?: string) {
  if (!value) return 'Data nao informada';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function normalizeSearch(value?: string | null) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function sanitizePayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizePayload);
  if (!value || typeof value !== 'object') return value;

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((safe, [key, item]) => {
    if (SENSITIVE_PAYLOAD_KEYS.has(key.toLowerCase())) {
      safe[key] = '[omitido]';
      return safe;
    }

    safe[key] = sanitizePayload(item);
    return safe;
  }, {});
}

function getStatusBadgeVariant(status: RelationshipChangeRequestStatus) {
  if (status === 'pending') return 'default';
  if (status === 'approved') return 'secondary';
  if (status === 'rejected') return 'destructive';
  return 'outline';
}

function getPessoaName(map: Map<string, Pessoa>, id?: string | null) {
  if (!id) return 'Nao informada';
  return map.get(id)?.nome_completo || id;
}

function getRequesterName(profiles: Map<string, ProfileSummary>, request: RelationshipChangeRequest) {
  return profiles.get(request.requester_user_id)?.nome_exibicao || request.requester_user_id;
}

function getCurrentRelationship(map: Map<string, Relacionamento>, request: RelationshipChangeRequest) {
  return request.relationship_id ? map.get(request.relationship_id) : undefined;
}

function getSafeChangeSummary(request: RelationshipChangeRequest) {
  if (request.action === 'create') {
    const details = (request.payload.details || {}) as Record<string, unknown>;
    return Object.keys(details).filter((key) => !SENSITIVE_PAYLOAD_KEYS.has(key.toLowerCase())).join(', ') || 'Novo vinculo';
  }

  if (request.action === 'update') {
    const changes = (request.payload.changes || {}) as Record<string, unknown>;
    return Object.keys(changes).filter((key) => !SENSITIVE_PAYLOAD_KEYS.has(key.toLowerCase())).join(', ') || 'Alteracao de vinculo';
  }

  return request.payload.reason ? 'Remocao solicitada com justificativa' : 'Remocao de vinculo';
}

function getSafeComparisonRows(request: RelationshipChangeRequest, current?: Relacionamento) {
  if (request.action !== 'update') return [];
  const changes = (request.payload.changes || {}) as Record<string, unknown>;
  const allowedKeys = [
    'subtipo_relacionamento',
    'data_casamento',
    'data_separacao',
    'local_casamento',
    'local_separacao',
    'ativo',
  ];

  return allowedKeys
    .filter((key) => key in changes)
    .map((key) => ({
      field: key,
      before: current ? String((current as unknown as Record<string, unknown>)[key] ?? '') : 'Nao localizado',
      after: String(changes[key] ?? ''),
    }));
}

export function AdminSolicitacoesVinculos() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RelationshipChangeRequest[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([]);
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [filters, setFilters] = useState<RequestFilters>(INITIAL_FILTERS);
  const [selectedRequest, setSelectedRequest] = useState<RelationshipChangeRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  const pessoasMap = useMemo(() => new Map(pessoas.map((pessoa) => [pessoa.id, pessoa])), [pessoas]);
  const relacionamentosMap = useMemo(
    () => new Map(relacionamentos.map((relacionamento) => [relacionamento.id, relacionamento])),
    [relacionamentos]
  );
  const profilesMap = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, pessoasData, relacionamentosData, profilesResult] = await Promise.all([
        listAllRelationshipChangeRequests({ limit: 300 }),
        obterTodasPessoas(),
        obterTodosRelacionamentos(),
        supabase.from('profiles').select('id,nome_exibicao'),
      ]);

      setRequests(requestsData);
      setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
      setRelacionamentos(Array.isArray(relacionamentosData) ? relacionamentosData : []);
      setProfiles((profilesResult.data || []) as ProfileSummary[]);

      if (profilesResult.error) {
        console.error('[Supabase] Erro ao carregar perfis para solicitacoes:', profilesResult.error.message);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitacoes de vinculos:', error);
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel carregar as solicitacoes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (filters.status !== 'all' && request.status !== filters.status) return false;
      if (filters.action !== 'all' && request.action !== filters.action) return false;
      if (filters.relationshipType !== 'all' && request.relationship_type !== filters.relationshipType) return false;

      if (filters.createdFrom) {
        const from = new Date(`${filters.createdFrom}T00:00:00`).getTime();
        if (!request.created_at || new Date(request.created_at).getTime() < from) return false;
      }

      if (filters.createdTo) {
        const to = new Date(`${filters.createdTo}T23:59:59`).getTime();
        if (!request.created_at || new Date(request.created_at).getTime() > to) return false;
      }

      const requesterQuery = normalizeSearch(filters.requesterQuery);
      if (requesterQuery) {
        const requesterText = normalizeSearch([
          getRequesterName(profilesMap, request),
          getPessoaName(pessoasMap, request.requester_pessoa_id),
          request.requester_user_id,
        ].join(' '));
        if (!requesterText.includes(requesterQuery)) return false;
      }

      const relatedQuery = normalizeSearch(filters.relatedQuery);
      if (relatedQuery) {
        const relatedText = normalizeSearch([
          getPessoaName(pessoasMap, request.target_pessoa_id),
          getPessoaName(pessoasMap, request.related_pessoa_id),
          request.relationship_id || '',
        ].join(' '));
        if (!relatedText.includes(relatedQuery)) return false;
      }

      return true;
    });
  }, [filters, pessoasMap, profilesMap, requests]);

  const activeFiltersCount = useMemo(() => {
    return [
      filters.status !== 'all',
      filters.action !== 'all',
      filters.relationshipType !== 'all',
      Boolean(filters.requesterQuery.trim()),
      Boolean(filters.relatedQuery.trim()),
      Boolean(filters.createdFrom),
      Boolean(filters.createdTo),
    ].filter(Boolean).length;
  }, [filters]);

  const openDetails = (request: RelationshipChangeRequest) => {
    setSelectedRequest(request);
    setAdminNote(request.admin_note || '');
  };

  const closeDetails = () => {
    if (reviewing) return;
    setSelectedRequest(null);
    setAdminNote('');
  };

  const handleApprove = async (request = selectedRequest) => {
    if (!request) return;
    setReviewing(true);
    try {
      const note = selectedRequest?.id === request.id ? adminNote.trim() || undefined : undefined;
      await approveRelationshipChangeRequest(request.id, note);
      toast.success('Solicitacao aprovada.');
      setSelectedRequest(null);
      setAdminNote('');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel aprovar a solicitacao.');
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async (request = selectedRequest) => {
    if (!request) return;
    setReviewing(true);
    try {
      const note = selectedRequest?.id === request.id ? adminNote.trim() || undefined : undefined;
      await rejectRelationshipChangeRequest(request.id, note);
      toast.success('Solicitacao rejeitada.');
      setSelectedRequest(null);
      setAdminNote('');
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nao foi possivel rejeitar a solicitacao.');
    } finally {
      setReviewing(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({ ...INITIAL_FILTERS, status: 'all' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-700">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Solicitacoes de vinculos</h1>
              <p className="text-sm text-gray-500">Revisao administrativa de ajustes familiares</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao painel
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
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
              <label className="space-y-1 text-sm font-medium text-gray-700">
                Status
                <select
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, status: event.target.value as RequestFilters['status'] }))
                  }
                >
                  <option value="all">Todos</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm font-medium text-gray-700">
                Acao
                <select
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  value={filters.action}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, action: event.target.value as RequestFilters['action'] }))
                  }
                >
                  <option value="all">Todas</option>
                  {Object.entries(ACTION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm font-medium text-gray-700">
                Tipo
                <select
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  value={filters.relationshipType}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      relationshipType: event.target.value as RequestFilters['relationshipType'],
                    }))
                  }
                >
                  <option value="all">Todos</option>
                  {Object.entries(RELATIONSHIP_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm font-medium text-gray-700">
                Solicitante
                <Input
                  value={filters.requesterQuery}
                  onChange={(event) => setFilters((current) => ({ ...current, requesterQuery: event.target.value }))}
                  placeholder="Nome ou ID"
                />
              </label>

              <label className="space-y-1 text-sm font-medium text-gray-700">
                Pessoa relacionada
                <Input
                  value={filters.relatedQuery}
                  onChange={(event) => setFilters((current) => ({ ...current, relatedQuery: event.target.value }))}
                  placeholder="Nome da pessoa"
                />
              </label>

              <label className="space-y-1 text-sm font-medium text-gray-700">
                De
                <Input
                  type="date"
                  value={filters.createdFrom}
                  onChange={(event) => setFilters((current) => ({ ...current, createdFrom: event.target.value }))}
                />
              </label>

              <label className="space-y-1 text-sm font-medium text-gray-700">
                Ate
                <Input
                  type="date"
                  value={filters.createdTo}
                  onChange={(event) => setFilters((current) => ({ ...current, createdTo: event.target.value }))}
                />
              </label>

              <div className="flex items-end">
                <Button type="button" variant="outline" onClick={handleClearFilters} className="w-full">
                  Limpar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitacoes ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">Carregando solicitacoes...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">Nenhuma solicitacao encontrada.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="grid gap-3 px-4 py-4 lg:grid-cols-[120px_120px_1.1fr_1.1fr_1fr_140px]"
                  >
                    <div>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {STATUS_LABELS[request.status]}
                      </Badge>
                      <p className="mt-2 text-xs text-gray-500">{formatDateTime(request.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ACTION_LABELS[request.action]}</p>
                      <p className="text-xs text-gray-500">{RELATIONSHIP_TYPE_LABELS[request.relationship_type]}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getRequesterName(profilesMap, request)}</p>
                      <p className="text-xs text-gray-500">{getPessoaName(pessoasMap, request.requester_pessoa_id)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{getPessoaName(pessoasMap, request.target_pessoa_id)}</p>
                      <p className="text-xs text-gray-500">{getPessoaName(pessoasMap, request.related_pessoa_id)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{getSafeChangeSummary(request)}</p>
                      <p className="text-xs text-gray-500">{request.relationship_subtype || 'Sem subtipo'}</p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openDetails(request)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Detalhes
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button type="button" size="sm" onClick={() => void handleApprove(request)} disabled={reviewing}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Aprovar
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => void handleReject(request)}
                            disabled={reviewing}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={Boolean(selectedRequest)} onOpenChange={(open) => (!open ? closeDetails() : undefined)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalhes da solicitacao</DialogTitle>
            <DialogDescription>
              Revise o pedido antes de aprovar ou rejeitar.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-5">
              <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                  <p className="text-sm text-gray-900">{STATUS_LABELS[selectedRequest.status]}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Acao</p>
                  <p className="text-sm text-gray-900">{ACTION_LABELS[selectedRequest.action]}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Solicitante</p>
                  <p className="text-sm text-gray-900">{getRequesterName(profilesMap, selectedRequest)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Pessoa solicitante</p>
                  <p className="text-sm text-gray-900">{getPessoaName(pessoasMap, selectedRequest.requester_pessoa_id)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Pessoas envolvidas</p>
                  <p className="text-sm text-gray-900">
                    {getPessoaName(pessoasMap, selectedRequest.target_pessoa_id)} / {getPessoaName(pessoasMap, selectedRequest.related_pessoa_id)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Vinculo</p>
                  <p className="text-sm text-gray-900">
                    {RELATIONSHIP_TYPE_LABELS[selectedRequest.relationship_type]} · {selectedRequest.relationship_subtype || 'sem subtipo'}
                  </p>
                </div>
              </div>

              {selectedRequest.action === 'update' && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">Comparacao antes/depois</h3>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    {getSafeComparisonRows(selectedRequest, getCurrentRelationship(relacionamentosMap, selectedRequest)).length === 0 ? (
                      <p className="p-3 text-sm text-gray-500">Nenhuma alteracao comparavel informada.</p>
                    ) : (
                      getSafeComparisonRows(selectedRequest, getCurrentRelationship(relacionamentosMap, selectedRequest)).map((row) => (
                        <div key={row.field} className="grid grid-cols-3 gap-3 border-b border-gray-100 p-3 text-sm last:border-b-0">
                          <span className="font-medium text-gray-700">{row.field}</span>
                          <span className="text-gray-600">{row.before || '-'}</span>
                          <span className="text-gray-900">{row.after || '-'}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">Payload sanitizado</h3>
                <pre className="max-h-72 overflow-auto rounded-lg bg-gray-950 p-4 text-xs text-gray-100">
                  {JSON.stringify(sanitizePayload(selectedRequest.payload), null, 2)}
                </pre>
              </div>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                Nota admin
                <Textarea
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  placeholder="Opcional"
                  disabled={reviewing || selectedRequest.status !== 'pending'}
                />
              </label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDetails} disabled={reviewing}>
              Fechar
            </Button>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button type="button" variant="destructive" onClick={() => void handleReject()} disabled={reviewing}>
                  Rejeitar
                </Button>
                <Button type="button" onClick={() => void handleApprove()} disabled={reviewing}>
                  Aprovar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
