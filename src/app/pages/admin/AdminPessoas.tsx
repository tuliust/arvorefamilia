import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { obterTodasPessoas, deletarPessoa, resetarPerfilPessoa } from '../../services/dataService';
import { adminListAllUserPersonLinks } from '../../services/memberProfileService';
import { Pessoa } from '../../types';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Dog,
  User,
  UserCheck,
  Settings,
  SlidersHorizontal,
  Copy,
  RotateCcw
} from 'lucide-react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { includesNormalizedText } from '../../utils/searchText';
import { isPersonDeceased } from '../../utils/personFields';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';

type PeopleFilter = 'todos' | 'cadastrados' | 'pet';

type AdvancedFilters = {
  status: Array<'vivos' | 'falecidos'>;
  foto: Array<'com_foto' | 'sem_foto'>;
  geracao: Array<'1' | '2' | '3' | '4' | '5' | '6' | '7' | 'sem_manual'>;
  dadosIncompletos: Array<'sem_data_nascimento' | 'sem_local_nascimento' | 'sem_local_atual'>;
  contato: Array<'com_telefone' | 'sem_telefone' | 'com_rede_social' | 'sem_rede_social'>;
};

type AdvancedFilterKey = keyof AdvancedFilters;
type AdvancedFilterValue<TKey extends AdvancedFilterKey> = AdvancedFilters[TKey][number];

const CADASTRADOS_ROUTE = '/admin/pessoas/novas';

const EMPTY_ADVANCED_FILTERS: AdvancedFilters = {
  status: [],
  foto: [],
  geracao: [],
  dadosIncompletos: [],
  contato: [],
};

const ADVANCED_FILTER_GROUPS: Array<{
  key: AdvancedFilterKey;
  title: string;
  options: Array<{ value: AdvancedFilters[AdvancedFilterKey][number]; label: string }>;
}> = [
  {
    key: 'status',
    title: 'Status',
    options: [
      { value: 'vivos', label: 'Vivos' },
      { value: 'falecidos', label: 'Falecidos' },
    ],
  },
  {
    key: 'foto',
    title: 'Foto',
    options: [
      { value: 'com_foto', label: 'Com foto' },
      { value: 'sem_foto', label: 'Sem foto' },
    ],
  },
  {
    key: 'geracao',
    title: 'Geração',
    options: [
      { value: '1', label: 'Geração 1' },
      { value: '2', label: 'Geração 2' },
      { value: '3', label: 'Geração 3' },
      { value: '4', label: 'Geração 4' },
      { value: '5', label: 'Geração 5' },
      { value: '6', label: 'Geração 6' },
      { value: '7', label: 'Geração 7' },
      { value: 'sem_manual', label: 'Sem geração manual' },
    ],
  },
  {
    key: 'dadosIncompletos',
    title: 'Dados incompletos',
    options: [
      { value: 'sem_data_nascimento', label: 'Sem data de nascimento' },
      { value: 'sem_local_nascimento', label: 'Sem local de nascimento' },
      { value: 'sem_local_atual', label: 'Sem local atual' },
    ],
  },
  {
    key: 'contato',
    title: 'Contato',
    options: [
      { value: 'com_telefone', label: 'Com telefone' },
      { value: 'sem_telefone', label: 'Sem telefone' },
      { value: 'com_rede_social', label: 'Com rede social/site' },
      { value: 'sem_rede_social', label: 'Sem rede social/site' },
    ],
  },
];

function countAdvancedFilters(filters: AdvancedFilters) {
  return Object.values(filters).reduce((total, values) => total + values.length, 0);
}

function cloneAdvancedFilters(filters: AdvancedFilters): AdvancedFilters {
  return {
    status: [...filters.status],
    foto: [...filters.foto],
    geracao: [...filters.geracao],
    dadosIncompletos: [...filters.dadosIncompletos],
    contato: [...filters.contato],
  };
}

function hasValue(value?: string | number | null) {
  return String(value ?? '').trim().length > 0;
}

function matchesAny<T extends string>(selected: T[], predicate: (value: T) => boolean) {
  return selected.length === 0 || selected.some(predicate);
}

function matchesAdvancedFilters(pessoa: Pessoa, filters: AdvancedFilters) {
  const isFalecido = isPersonDeceased(pessoa);
  const hasPhoto = hasValue(pessoa.foto_principal_url);
  const generation = typeof pessoa.manual_generation === 'number' ? String(pessoa.manual_generation) : '';
  const hasTelefone = hasValue(pessoa.telefone);
  const hasRedeSocial = hasValue(pessoa.rede_social) || hasValue(pessoa.instagram_usuario) || hasValue(pessoa.instagram_url);

  return (
    matchesAny(filters.status, (status) => status === 'falecidos' ? isFalecido : !isFalecido) &&
    matchesAny(filters.foto, (foto) => foto === 'com_foto' ? hasPhoto : !hasPhoto) &&
    matchesAny(filters.geracao, (selectedGeneration) => (
      selectedGeneration === 'sem_manual'
        ? !hasValue(pessoa.manual_generation)
        : generation === selectedGeneration
    )) &&
    matchesAny(filters.dadosIncompletos, (field) => {
      if (field === 'sem_data_nascimento') return !hasValue(pessoa.data_nascimento);
      if (field === 'sem_local_nascimento') return !hasValue(pessoa.local_nascimento);
      return !hasValue(pessoa.local_atual);
    }) &&
    matchesAny(filters.contato, (contactFilter) => {
      if (contactFilter === 'com_telefone') return hasTelefone;
      if (contactFilter === 'sem_telefone') return !hasTelefone;
      if (contactFilter === 'com_rede_social') return hasRedeSocial;
      return !hasRedeSocial;
    })
  );
}

export function AdminPessoas() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCadastradosRoute = location.pathname === CADASTRADOS_ROUTE;
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<PeopleFilter>(isCadastradosRoute ? 'cadastrados' : 'todos');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(EMPTY_ADVANCED_FILTERS);
  const [draftAdvancedFilters, setDraftAdvancedFilters] = useState<AdvancedFilters>(EMPTY_ADVANCED_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [pessoasComCadastroIds, setPessoasComCadastroIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetId, setResetId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeAdvancedFilterCount = countAdvancedFilters(advancedFilters);

  useEffect(() => {
    loadPessoas();
  }, []);

  useEffect(() => {
    setFilter((current) => {
      if (isCadastradosRoute) return 'cadastrados';
      return current === 'cadastrados' ? 'todos' : current;
    });
  }, [isCadastradosRoute]);

  const loadPessoas = async () => {
    setLoading(true);
    try {
      const [data, linksResult] = await Promise.all([
        obterTodasPessoas(),
        adminListAllUserPersonLinks(),
      ]);
      setPessoas(Array.isArray(data) ? data : []);
      setPessoasComCadastroIds(new Set(
        linksResult.error
          ? []
          : linksResult.data
            .filter((link) => Boolean(link.user_id) && Boolean(link.pessoa_id))
            .map((link) => link.pessoa_id)
      ));
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
      setPessoas([]);
      setPessoasComCadastroIds(new Set());
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar pessoas.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    const success = await deletarPessoa(deleteId);

    if (success) {
      await loadPessoas();
      setDeleteId(null);
    } else {
      toast.error('Erro ao deletar pessoa. Tente novamente.');
    }
    setIsDeleting(false);
  };

  const handleResetProfile = async () => {
    if (!resetId) return;

    setIsResetting(true);
    try {
      const result = await resetarPerfilPessoa(resetId);
      await loadPessoas();
      setResetId(null);
      toast.success(
        [
          'Perfil resetado.',
          `${result.deleted_insights} conteúdo(s) gerado(s),`,
          `${result.deleted_historical_files} arquivo(s) histórico(s),`,
          `${result.deleted_person_events} evento(s),`,
          `${result.deleted_social_profiles} rede(s) social(is),`,
          `${result.deleted_questionnaire_answers} questionário(s),`,
          `${result.deleted_activity_logs} registro(s) de atividade,`,
          `${result.deleted_user_links} vínculo(s) de usuário,`,
          `${result.deleted_auth_users} auth user(s)`,
          `e ${result.deleted_favorites} favorito(s) removido(s).`,
        ].join(' ')
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao resetar perfil. Tente novamente.');
    } finally {
      setIsResetting(false);
    }
  };

  const copyPersonId = async (id: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(id);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = id;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopiedId(id);
      toast.success('ID copiado.');
      window.setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 1400);
    } catch (error) {
      toast.error('Não foi possível copiar o ID.');
    }
  };

  const openFilters = () => {
    setDraftAdvancedFilters(cloneAdvancedFilters(advancedFilters));
    setFiltersOpen(true);
  };

  const toggleDraftFilter = <TKey extends AdvancedFilterKey>(
    key: TKey,
    value: AdvancedFilterValue<TKey>,
    checked: boolean
  ) => {
    setDraftAdvancedFilters((current) => {
      const currentValues = current[key] as Array<AdvancedFilterValue<TKey>>;
      const nextValues = checked
        ? Array.from(new Set([...currentValues, value]))
        : currentValues.filter((currentValue) => currentValue !== value);

      return {
        ...current,
        [key]: nextValues,
      };
    });
  };

  const clearAdvancedFilters = () => {
    const emptyFilters = cloneAdvancedFilters(EMPTY_ADVANCED_FILTERS);
    setDraftAdvancedFilters(emptyFilters);
    setAdvancedFilters(emptyFilters);
  };

  const applyAdvancedFilters = () => {
    setAdvancedFilters(cloneAdvancedFilters(draftAdvancedFilters));
    setFiltersOpen(false);
  };

  const selectFilter = (nextFilter: PeopleFilter) => {
    setFilter(nextFilter);
    navigate(nextFilter === 'cadastrados' ? CADASTRADOS_ROUTE : '/admin/pessoas');
  };

  const totalCadastrados = pessoasComCadastroIds.size;
  const totalPets = pessoas.filter((p) => p.humano_ou_pet === 'Pet').length;

  const pessoasFiltradas = (Array.isArray(pessoas) ? pessoas : [])
    .filter(p => {
      const matchSearch =
        includesNormalizedText(p.nome_completo, searchTerm) ||
        includesNormalizedText(p.local_nascimento, searchTerm) ||
        includesNormalizedText(p.local_atual, searchTerm) ||
        includesNormalizedText(p.local_falecimento, searchTerm);

      const matchType = filter === 'todos' ||
        (filter === 'cadastrados' && pessoasComCadastroIds.has(p.id)) ||
        (filter === 'pet' && p.humano_ou_pet === 'Pet');

      return matchSearch && matchType && matchesAdvancedFilters(p, advancedFilters);
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Gerenciar Pessoas"
        subtitle="Cadastro, busca e manutenção dos membros da árvore"
        icon={User}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
          { label: 'Adicionar Pessoa', onClick: () => navigate('/admin/pessoas/nova'), icon: Plus, variant: 'primary' },
        ]}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Card className="mb-6 min-w-0">
          <CardContent className="pt-6">
            <div className="flex min-w-0 flex-col gap-4 md:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-row sm:flex-wrap">
                <Button
                  variant={filter === 'todos' ? 'default' : 'outline'}
                  className="h-11 w-full px-1 text-xs sm:h-10 sm:w-auto sm:px-4 sm:text-sm"
                  onClick={() => selectFilter('todos')}
                  aria-label={`Todos: ${pessoas.length}`}
                  title={`Todos: ${pessoas.length}`}
                >
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Todos ({pessoas.length})</span>
                </Button>
                <Button
                  variant={filter === 'cadastrados' ? 'default' : 'outline'}
                  className="h-11 w-full px-1 text-xs sm:h-10 sm:w-auto sm:px-4 sm:text-sm"
                  onClick={() => selectFilter('cadastrados')}
                  aria-label={`Cadastrados: ${totalCadastrados}`}
                  title={`Cadastrados: ${totalCadastrados}`}
                >
                  <UserCheck className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cadastrados ({totalCadastrados})</span>
                </Button>
                <Button
                  variant={filter === 'pet' ? 'default' : 'outline'}
                  className="h-11 w-full px-1 text-xs sm:h-10 sm:w-auto sm:px-4 sm:text-sm"
                  onClick={() => selectFilter('pet')}
                  aria-label={`Pets: ${totalPets}`}
                  title={`Pets: ${totalPets}`}
                >
                  <Dog className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Pets ({totalPets})</span>
                </Button>
                <Button
                  variant="outline"
                  className="relative h-11 w-full px-1 text-xs sm:h-10 sm:w-auto sm:px-4 sm:text-sm"
                  onClick={openFilters}
                  aria-label="Filtros"
                  title="Filtros"
                >
                  <SlidersHorizontal className="h-4 w-4 shrink-0 sm:mr-2" />
                  <span className="hidden sm:inline">Filtros</span>
                  {activeAdvancedFilterCount > 0 && (
                    <span className="absolute right-1 top-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-blue-700 sm:static sm:ml-2 sm:px-2 sm:text-xs">
                      {activeAdvancedFilterCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
            {activeAdvancedFilterCount > 0 && (
              <div className="mt-3 flex flex-col gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800 sm:flex-row sm:items-center sm:justify-between">
                <span className="break-words">{activeAdvancedFilterCount} filtro(s) avançado(s) ativo(s).</span>
                <Button variant="ghost" size="sm" onClick={clearAdvancedFilters} className="h-8 w-full text-blue-800 hover:bg-blue-100 sm:w-auto">
                  Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="break-words">
              {pessoasFiltradas.length} {pessoasFiltradas.length === 1 ? 'Pessoa' : 'Pessoas'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <p className="py-8 text-center text-gray-500">Carregando pessoas...</p>
              ) : pessoasFiltradas.length === 0 ? (
                <p className="py-8 text-center text-gray-500">Nenhuma pessoa encontrada</p>
              ) : (
                pessoasFiltradas.map((pessoa) => (
                  <div
                    key={pessoa.id}
                    className="flex min-w-0 flex-col gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        pessoa.humano_ou_pet === 'Pet' ? 'bg-amber-100' : 'bg-blue-100'
                      }`}>
                        {pessoa.humano_ou_pet === 'Pet' ? (
                          <Dog className="h-5 w-5 text-amber-700" />
                        ) : (
                          <User className="h-5 w-5 text-blue-700" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-medium text-gray-900">{pessoa.nome_completo}</h3>
                        <p className="break-words text-sm text-gray-500">
                          {pessoa.data_nascimento && `Nascimento: ${pessoa.data_nascimento}`}
                          {pessoa.local_nascimento && ` • ${pessoa.local_nascimento}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full flex-row gap-2 sm:w-auto sm:flex-row">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 flex-1 sm:w-auto sm:flex-none"
                        onClick={() => navigate(`/admin/pessoas/${pessoa.id}/editar`)}
                        aria-label={`Editar ${pessoa.nome_completo}`}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 shrink-0 sm:mr-2" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyPersonId(pessoa.id)}
                        className={`h-10 w-10 shrink-0 ${copiedId === pessoa.id ? 'border-green-300 bg-green-50 text-green-700' : ''}`}
                        aria-label="Copiar ID"
                        title="Copiar ID"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setResetId(pessoa.id)}
                        className="h-10 w-10 shrink-0 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                        aria-label={`Resetar perfil de ${pessoa.nome_completo}`}
                        title="Resetar Perfil"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(pessoa.id)}
                        className="h-10 flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto sm:flex-none"
                        aria-label={`Excluir ${pessoa.nome_completo}`}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir pessoa"
        description={`Tem certeza que deseja excluir "${pessoas.find(p => p.id === deleteId)?.nome_completo}"? Esta ação não pode ser desfeita e todos os relacionamentos desta pessoa também serão removidos.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        variant="danger"
        loading={isDeleting}
      />

      <ConfirmDialog
        open={!!resetId}
        onOpenChange={(open) => !open && setResetId(null)}
        title="Resetar perfil"
        description={`Tem certeza que deseja resetar o perfil de "${pessoas.find(p => p.id === resetId)?.nome_completo}"? Esta ação remove login vinculado quando seguro, preferências, fotos, bio, redes sociais, fatos, arquivos, eventos e histórico de atividade, mas mantém os dados genealógicos básicos e os relacionamentos familiares.`}
        confirmText="Resetar Perfil"
        cancelText="Cancelar"
        onConfirm={handleResetProfile}
        variant="warning"
        loading={isResetting}
      />

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="break-words">Filtros</DialogTitle>
            <DialogDescription className="break-words">
              Refine a lista de pessoas sem fazer novas consultas ao banco.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {ADVANCED_FILTER_GROUPS.map((group) => (
              <section key={group.key} className="min-w-0 rounded-lg border border-gray-200 p-4">
                <h3 className="break-words text-sm font-semibold text-gray-900">{group.title}</h3>
                <div className="mt-3 space-y-3">
                  {group.options.map((option) => (
                    <label key={option.value} className="flex min-w-0 items-start gap-3 text-sm text-gray-700">
                      <Checkbox
                        checked={draftAdvancedFilters[group.key].includes(option.value as never)}
                        onCheckedChange={(checked) => {
                          toggleDraftFilter(
                            group.key,
                            option.value as never,
                            checked === true
                          );
                        }}
                      />
                      <span className="min-w-0 break-words">{option.label}</span>
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" className="w-full sm:w-auto" onClick={clearAdvancedFilters}>
              Limpar filtros
            </Button>
            <Button className="w-full sm:w-auto" onClick={applyAdvancedFilters}>
              Aplicar filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
