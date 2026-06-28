import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import {
  atualizarRelacionamento,
  obterTodosRelacionamentos,
  obterTodasPessoas,
  excluirRelacionamentoComInverso,
} from '../../services/dataService';
import { Relacionamento, Pessoa, SubtipoRelacionamento } from '../../types';
import { isPersonDeceased } from '../../utils/personFields';
import { Edit3, Plus, Save, Search, Settings, Trash2, Heart, Users as UsersIcon, X } from 'lucide-react';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';

type MarriageEditForm = {
  subtipo_relacionamento: SubtipoRelacionamento;
  ativo: boolean;
  data_separacao: string;
  local_separacao: string;
  observacoes: string;
};

type RelationshipFilter = 'all' | 'marriages' | 'filiations';

function getMarriageStatus(rel: Relacionamento, pessoa1?: Pessoa, pessoa2?: Pessoa) {
  if (rel.subtipo_relacionamento === 'separado' || rel.data_separacao) return 'Separado';
  if (rel.ativo === false) return 'Inativo';
  if (isPersonDeceased(pessoa1) || isPersonDeceased(pessoa2)) return 'Viuvez';
  return 'Ativo';
}

function formatDateLabel(value?: string | null) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function normalizeSearch(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getPersonName(pessoasMap: Map<string, Pessoa>, id: string) {
  return pessoasMap.get(id)?.nome_completo || 'Pessoa não encontrada';
}

function relationshipMatchesSearch(rel: Relacionamento, pessoasMap: Map<string, Pessoa>, query: string) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return true;

  return [rel.pessoa_origem_id, rel.pessoa_destino_id].some((personId) =>
    normalizeSearch(getPersonName(pessoasMap, personId)).includes(normalizedQuery)
  );
}

function formatRelationshipType(value?: string | null) {
  const labels: Record<string, string> = {
    conjuge: 'Casamento',
    casamento: 'Casamento',
    uniao: 'União',
    separado: 'Separado',
    pai: 'Pai',
    mae: 'Mãe',
    filho: 'Filho',
    irmao: 'Irmão',
  };

  const rawValue = String(value ?? '').trim();
  if (!rawValue) return 'Não informado';
  return labels[rawValue] ?? rawValue.replace(/_/g, ' ').replace(/^./, (char) => char.toLocaleUpperCase('pt-BR'));
}

function FilterCard(props: {
  title: string;
  value: number;
  active: boolean;
  accentClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-pressed={props.active}
      className={`min-w-0 rounded-lg border bg-white text-left shadow-sm transition hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        props.active ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
      }`}
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="break-words text-sm font-medium text-gray-600">
            {props.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${props.accentClass}`}>{props.value}</div>
          {props.active && <p className="mt-1 text-xs font-medium text-blue-700">Filtro ativo</p>}
        </CardContent>
      </Card>
    </button>
  );
}

export function AdminRelacionamentos() {
  const navigate = useNavigate();
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([]);
  const [pessoasMap, setPessoasMap] = useState<Map<string, Pessoa>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<RelationshipFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMarriageId, setEditingMarriageId] = useState<string | null>(null);
  const [savingMarriageId, setSavingMarriageId] = useState<string | null>(null);
  const [relacionamentoParaExcluirId, setRelacionamentoParaExcluirId] = useState<string | null>(null);
  const [deletingRelationshipId, setDeletingRelationshipId] = useState<string | null>(null);
  const [marriageForm, setMarriageForm] = useState<MarriageEditForm>({
    subtipo_relacionamento: 'casamento',
    ativo: true,
    data_separacao: '',
    local_separacao: '',
    observacoes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const relsData = await obterTodosRelacionamentos();
    setRelacionamentos(Array.isArray(relsData) ? relsData : []);

    const pessoas = await obterTodasPessoas();
    const map = new Map<string, Pessoa>();
    if (Array.isArray(pessoas)) {
      pessoas.forEach((p) => map.set(p.id, p));
    }
    setPessoasMap(map);

    setLoading(false);
  };

  const handleDelete = (id: string) => {
    if (deletingRelationshipId) return;
    setRelacionamentoParaExcluirId(id);
  };

  const confirmDeleteRelationship = async () => {
    if (!relacionamentoParaExcluirId || deletingRelationshipId) return;

    const id = relacionamentoParaExcluirId;
    setDeletingRelationshipId(id);

    try {
      const success = await excluirRelacionamentoComInverso(id);
      if (success) {
        setRelacionamentoParaExcluirId(null);
        await loadData();
      } else {
        toast.error('Erro ao excluir relacionamento');
      }
    } finally {
      setDeletingRelationshipId(null);
    }
  };

  const startMarriageEdit = (rel: Relacionamento) => {
    setEditingMarriageId(rel.id);
    setMarriageForm({
      subtipo_relacionamento: rel.subtipo_relacionamento ?? 'casamento',
      ativo: rel.ativo ?? true,
      data_separacao: rel.data_separacao ?? '',
      local_separacao: rel.local_separacao ?? '',
      observacoes: rel.observacoes ?? '',
    });
  };

  const cancelMarriageEdit = () => {
    setEditingMarriageId(null);
    setMarriageForm({
      subtipo_relacionamento: 'casamento',
      ativo: true,
      data_separacao: '',
      local_separacao: '',
      observacoes: '',
    });
  };

  const handleSaveMarriage = async (rel: Relacionamento) => {
    setSavingMarriageId(rel.id);

    try {
      const payload = {
        subtipo_relacionamento: marriageForm.subtipo_relacionamento,
        ativo: marriageForm.ativo,
        data_separacao: marriageForm.data_separacao || null,
        local_separacao: marriageForm.local_separacao.trim() || null,
        observacoes: marriageForm.observacoes.trim() || null,
      };

      const updated = await atualizarRelacionamento(rel.id, payload);
      if (!updated) {
        toast.error('Não foi possível atualizar o relacionamento conjugal.');
        return;
      }

      const inverse = relacionamentos.find((candidate) =>
        candidate.id !== rel.id &&
        candidate.tipo_relacionamento === 'conjuge' &&
        candidate.pessoa_origem_id === rel.pessoa_destino_id &&
        candidate.pessoa_destino_id === rel.pessoa_origem_id
      );

      if (inverse) {
        await atualizarRelacionamento(inverse.id, payload);
      }

      await loadData();
      cancelMarriageEdit();
    } catch (error) {
      console.error('Erro ao atualizar relacionamento conjugal:', error);
      toast.error('Erro ao atualizar relacionamento conjugal.');
    } finally {
      setSavingMarriageId(null);
    }
  };

  const relacionamentosPorTipo = useMemo(() => ({
    conjuge: relacionamentos.filter((r) => r.tipo_relacionamento === 'conjuge'),
    filiacao: relacionamentos.filter(
      (r) =>
        r.tipo_relacionamento === 'pai' ||
        r.tipo_relacionamento === 'mae' ||
        r.tipo_relacionamento === 'filho'
    ),
  }), [relacionamentos]);

  const conjugesUnicos = useMemo(() => relacionamentosPorTipo.conjuge.filter((rel, index, self) =>
    index === self.findIndex((r) =>
      (r.pessoa_origem_id === rel.pessoa_origem_id && r.pessoa_destino_id === rel.pessoa_destino_id) ||
      (r.pessoa_origem_id === rel.pessoa_destino_id && r.pessoa_destino_id === rel.pessoa_origem_id)
    )
  ), [relacionamentosPorTipo.conjuge]);

  const filteredConjuges = useMemo(
    () => conjugesUnicos.filter((rel) => relationshipMatchesSearch(rel, pessoasMap, searchQuery)),
    [conjugesUnicos, pessoasMap, searchQuery]
  );

  const filteredFiliacoes = useMemo(
    () => relacionamentosPorTipo.filiacao.filter((rel) => relationshipMatchesSearch(rel, pessoasMap, searchQuery)),
    [pessoasMap, relacionamentosPorTipo.filiacao, searchQuery]
  );

  const nameSuggestions = useMemo(() => {
    const normalizedQuery = normalizeSearch(searchQuery);
    if (normalizedQuery.length < 2) return [];

    const relatedIds = new Set<string>();
    [...relacionamentosPorTipo.filiacao, ...conjugesUnicos].forEach((rel) => {
      relatedIds.add(rel.pessoa_origem_id);
      relatedIds.add(rel.pessoa_destino_id);
    });

    return Array.from(relatedIds)
      .map((id) => pessoasMap.get(id)?.nome_completo)
      .filter((name): name is string => Boolean(name))
      .filter((name) => normalizeSearch(name).includes(normalizedQuery))
      .sort((left, right) => left.localeCompare(right, 'pt-BR'))
      .slice(0, 8);
  }, [conjugesUnicos, pessoasMap, relacionamentosPorTipo.filiacao, searchQuery]);

  const showMarriages = activeFilter === 'all' || activeFilter === 'marriages';
  const showFiliations = activeFilter === 'all' || activeFilter === 'filiations';
  const hasResults = (showMarriages && filteredConjuges.length > 0) || (showFiliations && filteredFiliacoes.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Gerenciar Relacionamentos"
        subtitle="Cadastro e manutenção dos vínculos familiares"
        icon={UsersIcon}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
          { label: 'Adicionar Relacionamento', onClick: () => navigate('/admin/relacionamentos/novo'), icon: Plus, variant: 'primary' },
        ]}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FilterCard
            title="Total de Relacionamentos"
            value={relacionamentos.length}
            active={activeFilter === 'all'}
            accentClass="text-gray-900"
            onClick={() => setActiveFilter('all')}
          />
          <FilterCard
            title="Casamentos"
            value={conjugesUnicos.length}
            active={activeFilter === 'marriages'}
            accentClass="text-emerald-600"
            onClick={() => setActiveFilter('marriages')}
          />
          <FilterCard
            title="Filiações"
            value={relacionamentosPorTipo.filiacao.length}
            active={activeFilter === 'filiations'}
            accentClass="text-blue-600"
            onClick={() => setActiveFilter('filiations')}
          />
        </div>

        <Card className="min-w-0">
          <CardContent className="space-y-3 pt-6">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Buscar por pessoa</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Digite o nome de origem ou destino"
                  className="pl-9"
                />
              </div>
            </label>

            {nameSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {nameSuggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSearchQuery(name)}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <Card className="min-w-0">
            <CardContent className="py-8 text-center text-sm text-gray-500">
              Carregando relacionamentos...
            </CardContent>
          </Card>
        ) : null}

        {!loading && !hasResults && (
          <Card className="min-w-0 border-dashed">
            <CardContent className="py-8 text-center text-sm text-gray-500">
              Nenhum relacionamento encontrado para o filtro atual.
            </CardContent>
          </Card>
        )}

        {showMarriages && (
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="flex min-w-0 items-center gap-2 break-words">
                <Heart className="h-5 w-5 shrink-0 text-emerald-600" />
                Relacionamentos Conjugais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredConjuges.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    Nenhum casamento encontrado para o filtro atual.
                  </div>
                ) : (
                  filteredConjuges.map((rel) => {
                    const pessoa1 = pessoasMap.get(rel.pessoa_origem_id);
                    const pessoa2 = pessoasMap.get(rel.pessoa_destino_id);
                    const isEditing = editingMarriageId === rel.id;
                    const status = getMarriageStatus(rel, pessoa1, pessoa2);

                    return (
                      <div
                        key={rel.id}
                        className="flex min-w-0 flex-col gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <Heart className="h-5 w-5 shrink-0 text-emerald-500" />
                          <div className="min-w-0 flex-1">
                            <p className="break-words font-medium text-gray-900">
                              {getPersonName(pessoasMap, rel.pessoa_origem_id)} - {getPersonName(pessoasMap, rel.pessoa_destino_id)}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                              <span className="break-words">{formatRelationshipType(rel.subtipo_relacionamento || rel.tipo_relacionamento)}</span>
                              <span className="break-words">Status: {status}</span>
                              {rel.data_separacao && <span className="break-words">Separação: {formatDateLabel(rel.data_separacao)}</span>}
                              {rel.local_separacao && <span className="break-words">Local: {rel.local_separacao}</span>}
                              {rel.observacoes && <span>Com observações</span>}
                            </div>

                            {isEditing && (
                              <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-2">
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-gray-600">Tipo conjugal</label>
                                  <select
                                    value={marriageForm.subtipo_relacionamento}
                                    onChange={(event) =>
                                      setMarriageForm((current) => ({
                                        ...current,
                                        subtipo_relacionamento: event.target.value as SubtipoRelacionamento,
                                      }))
                                    }
                                    className="flex h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                                    disabled={savingMarriageId === rel.id}
                                  >
                                    <option value="casamento">Casamento</option>
                                    <option value="uniao">União</option>
                                    <option value="separado">Separado</option>
                                  </select>
                                </div>

                                <label className="flex items-center gap-3 self-end rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={marriageForm.ativo}
                                    onChange={(event) =>
                                      setMarriageForm((current) => ({ ...current, ativo: event.target.checked }))
                                    }
                                    disabled={savingMarriageId === rel.id}
                                    className="h-4 w-4 shrink-0"
                                  />
                                  Relacionamento ativo
                                </label>

                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-gray-600">Data de separação</label>
                                  <Input
                                    type="date"
                                    value={marriageForm.data_separacao}
                                    onChange={(event) =>
                                      setMarriageForm((current) => ({ ...current, data_separacao: event.target.value }))
                                    }
                                    disabled={savingMarriageId === rel.id}
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-gray-600">Local de separação</label>
                                  <Input
                                    value={marriageForm.local_separacao}
                                    onChange={(event) =>
                                      setMarriageForm((current) => ({ ...current, local_separacao: event.target.value }))
                                    }
                                    disabled={savingMarriageId === rel.id}
                                  />
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-xs font-medium text-gray-600">Observações internas</label>
                                  <Textarea
                                    value={marriageForm.observacoes}
                                    onChange={(event) =>
                                      setMarriageForm((current) => ({ ...current, observacoes: event.target.value }))
                                    }
                                    disabled={savingMarriageId === rel.id}
                                  />
                                </div>

                                <div className="flex flex-col gap-2 md:col-span-2 sm:flex-row sm:justify-end">
                                  <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={cancelMarriageEdit}>
                                    <X className="mr-2 h-4 w-4 shrink-0" />
                                    Cancelar
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    onClick={() => handleSaveMarriage(rel)}
                                    disabled={savingMarriageId === rel.id}
                                  >
                                    <Save className="mr-2 h-4 w-4 shrink-0" />
                                    {savingMarriageId === rel.id ? 'Salvando...' : 'Salvar'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex w-full gap-2 lg:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 lg:flex-none"
                            onClick={() => startMarriageEdit(rel)}
                            disabled={Boolean(editingMarriageId && editingMarriageId !== rel.id)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 lg:flex-none"
                            onClick={() => handleDelete(rel.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {showFiliations && (
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="flex min-w-0 items-center gap-2 break-words">
                <UsersIcon className="h-5 w-5 shrink-0 text-blue-600" />
                Relacionamentos de Filiação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredFiliacoes.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    Nenhuma filiação encontrada para o filtro atual.
                  </div>
                ) : (
                  filteredFiliacoes.map((rel) => (
                    <div
                      key={rel.id}
                      className="flex min-w-0 flex-col gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <UsersIcon className="h-5 w-5 shrink-0 text-blue-500" />
                        <div className="min-w-0">
                          <p className="break-words font-medium text-gray-900">
                            {getPersonName(pessoasMap, rel.pessoa_origem_id)} - {getPersonName(pessoasMap, rel.pessoa_destino_id)}
                          </p>
                          <p className="mt-1 break-words text-xs text-gray-500">
                            {formatRelationshipType(rel.tipo_relacionamento)}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleDelete(rel.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(relacionamentoParaExcluirId)}
        onOpenChange={(open) => {
          if (!open && !deletingRelationshipId) setRelacionamentoParaExcluirId(null);
        }}
        title="Excluir relacionamento"
        description="Tem certeza que deseja excluir este relacionamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteRelationship}
        variant="danger"
        loading={Boolean(deletingRelationshipId)}
      />
    </div>
  );
}
