import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../../components/layout/MemberPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../../services/dataService';
import { getActivityActionLabel, getActivitySummary, listRecentActivityLogs } from '../../services/activityLogService';
import { listPendingRelationshipChangeRequests } from '../../services/relationshipChangeRequestService';
import { ActivityLog } from '../../types';
import { isPersonDeceased } from '../../utils/personFields';
import {
  Users,
  Link2,
  Settings,
  PlusCircle,
  BarChart3,
  Clock,
  GitPullRequest,
  ShieldCheck,
  Bell,
  Palette,
} from 'lucide-react';

type Pessoa = {
  id: string;
  nome_completo: string;
  local_nascimento?: string | null;
  humano_ou_pet?: 'Humano' | 'Pet' | string;
  data_falecimento?: string | null;
  local_falecimento?: string | null;
  falecido?: boolean | null;
};

type Relacionamento = {
  id: string;
  tipo_relacionamento?: string;
};

const dashboardCardButtonClass =
  'group min-w-0 rounded-lg border border-gray-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([]);
  const [atividadesRecentes, setAtividadesRecentes] = useState<ActivityLog[]>([]);
  const [pendingRelationshipRequests, setPendingRelationshipRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [pessoasData, relacionamentosData, atividadesData, pendingRequestsData] = await Promise.all([
          obterTodasPessoas(),
          obterTodosRelacionamentos(),
          listRecentActivityLogs(5),
          listPendingRelationshipChangeRequests({ limit: 1000 }),
        ]);

        setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
        setRelacionamentos(Array.isArray(relacionamentosData) ? relacionamentosData : []);
        setAtividadesRecentes(Array.isArray(atividadesData) ? atividadesData : []);
        setPendingRelationshipRequests(Array.isArray(pendingRequestsData) ? pendingRequestsData.length : 0);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        setPessoas([]);
        setRelacionamentos([]);
        setAtividadesRecentes([]);
        setPendingRelationshipRequests(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const stats = {
    totalPessoas: pessoas.length,
    totalHumanos: pessoas.filter((p) => p.humano_ou_pet === 'Humano').length,
    totalPets: pessoas.filter((p) => p.humano_ou_pet === 'Pet').length,
    totalFalecidos: pessoas.filter((p) => isPersonDeceased(p)).length,
    totalRelacionamentos: relacionamentos.length,
    pendingRelationshipRequests,
    totalCasamentos: Math.floor(
      relacionamentos.filter((r) => r.tipo_relacionamento === 'conjuge').length / 2
    ),
  };

  const quickActions = [
    {
      title: 'Adicionar Pessoa',
      description: 'Cadastrar novo membro',
      icon: PlusCircle,
      onClick: () => navigate('/admin/pessoas/nova'),
      color: 'bg-blue-500',
    },
    {
      title: 'Ver Pessoas',
      description: 'Listar todos os membros',
      icon: Users,
      onClick: () => navigate('/admin/pessoas'),
      color: 'bg-emerald-500',
    },
    {
      title: 'Relacionamentos',
      description: 'Gerenciar vínculos',
      icon: Link2,
      onClick: () => navigate('/admin/relacionamentos'),
      color: 'bg-purple-500',
    },
    {
      title: 'Solicitações de vínculos',
      description: `${stats.pendingRelationshipRequests} pendente(s)`,
      icon: GitPullRequest,
      onClick: () => navigate('/admin/solicitacoes-vinculos'),
      color: 'bg-amber-600',
    },
    {
      title: 'Histórico',
      description: 'Ver atividades recentes',
      icon: Clock,
      onClick: () => navigate('/admin/atividades'),
      color: 'bg-slate-800',
    },
    {
      title: 'Notificações',
      description: 'Diagnóstico e envios',
      icon: Bell,
      onClick: () => navigate('/admin/notificacoes'),
      color: 'bg-blue-700',
    },
    {
      title: 'Aparência da home',
      description: 'Logo, fundo e cores',
      icon: Palette,
      onClick: () => navigate('/admin/home'),
      color: 'bg-teal-700',
    },
    {
      title: 'Integridade dos dados',
      description: 'Diagnóstico da base',
      icon: ShieldCheck,
      onClick: () => navigate('/admin/integridade'),
      color: 'bg-cyan-700',
    },
  ];

  const pessoasRecentes = pessoas.slice(0, 5);

  const formatActivityDate = (value?: string) => {
    if (!value) return 'Data não informada';
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Painel Administrativo"
        subtitle="Gestão da Árvore Genealógica"
        icon={Settings}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Sair', onClick: handleSignOut, variant: 'ghost' },
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} py-6 sm:py-8`}>
        <div className="mb-6 grid grid-cols-4 gap-2 sm:mb-8 sm:gap-4 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => navigate('/admin/pessoas')}
            className={dashboardCardButtonClass}
            aria-label="Abrir página de pessoas"
          >
            <CardHeader className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 pb-1 pt-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:pb-2 sm:pt-6">
              <CardTitle className="truncate text-[10px] font-semibold text-gray-600 sm:text-sm">Membros</CardTitle>
              <Users className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
            </CardHeader>
            <CardContent className="px-1 pb-3 text-center sm:px-6 sm:pb-6">
              <div className="text-xl font-bold leading-none text-gray-900 sm:text-3xl">{stats.totalPessoas}</div>
              <p className="mt-1 hidden break-words text-xs text-gray-500 sm:block">
                {stats.totalHumanos} humanos, {stats.totalPets} pets
              </p>
            </CardContent>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/relacionamentos')}
            className={dashboardCardButtonClass}
            aria-label="Abrir página de relacionamentos"
          >
            <CardHeader className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 pb-1 pt-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:pb-2 sm:pt-6">
              <CardTitle className="truncate text-[10px] font-semibold text-gray-600 sm:text-sm">Relações</CardTitle>
              <Link2 className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
            </CardHeader>
            <CardContent className="px-1 pb-3 text-center sm:px-6 sm:pb-6">
              <div className="text-xl font-bold leading-none text-gray-900 sm:text-3xl">
                {stats.totalRelacionamentos}
              </div>
              <p className="mt-1 hidden break-words text-xs text-gray-500 sm:block">
                {stats.totalCasamentos} casamentos
              </p>
            </CardContent>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/solicitacoes-vinculos')}
            className={dashboardCardButtonClass}
            aria-label="Abrir página de solicitações de vínculos"
          >
            <CardHeader className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 pb-1 pt-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:pb-2 sm:pt-6">
              <CardTitle className="truncate text-[10px] font-semibold text-gray-600 sm:text-sm">Pendentes</CardTitle>
              <GitPullRequest className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
            </CardHeader>
            <CardContent className="px-1 pb-3 text-center sm:px-6 sm:pb-6">
              <div className="text-xl font-bold leading-none text-gray-900 sm:text-3xl">{stats.pendingRelationshipRequests}</div>
              <p className="mt-1 hidden break-words text-xs text-gray-500 sm:block">Vínculos aguardando revisão</p>
            </CardContent>
          </button>

          <Card className="min-w-0">
            <CardHeader className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 pb-1 pt-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:pb-2 sm:pt-6">
              <CardTitle className="truncate text-[10px] font-semibold text-gray-600 sm:text-sm">Memória</CardTitle>
              <BarChart3 className="h-4 w-4 shrink-0 text-gray-400" />
            </CardHeader>
            <CardContent className="px-1 pb-3 text-center sm:px-6 sm:pb-6">
              <div className="text-xl font-bold leading-none text-gray-900 sm:text-3xl">{stats.totalFalecidos}</div>
              <p className="mt-1 hidden break-words text-xs text-gray-500 sm:block">Pessoas falecidas</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 break-words text-lg font-semibold text-gray-900">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={action.onClick}
                className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 text-left transition-shadow hover:shadow-md sm:p-6"
                type="button"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg sm:h-12 sm:w-12 ${action.color}`}
                >
                  <action.icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <h3 className="break-words text-sm font-semibold leading-tight text-gray-900 sm:mb-1 sm:text-base">{action.title}</h3>
                <p className="hidden line-clamp-3 break-words text-sm text-gray-600 sm:block">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <Card className="h-fit min-w-0 self-start">
            <CardHeader>
              <CardTitle className="break-words">Pessoas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-500">Carregando...</p>
              ) : pessoasRecentes.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma pessoa cadastrada.</p>
              ) : (
                <div className="space-y-3">
                  {pessoasRecentes.map((pessoa) => (
                    <div
                      key={pessoa.id}
                      className="flex min-w-0 flex-col gap-2 rounded-lg p-3 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                      onClick={() => navigate(`/pessoa/${pessoa.id}`)}
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium text-gray-900">
                          {pessoa.nome_completo}
                        </p>
                        <p className="break-words text-xs text-gray-500">
                          {pessoa.local_nascimento || 'Local não informado'}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-full rounded-xl border-gray-200 bg-white px-4 text-sm font-medium shadow-sm hover:bg-gray-50 sm:w-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/pessoas/${pessoa.id}/editar`);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="break-words">Histórico de Atividades</CardTitle>
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate('/admin/atividades')}>
                Ver histórico completo
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-500">Carregando...</p>
              ) : atividadesRecentes.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma atividade registrada.</p>
              ) : (
                <div className="space-y-3">
                  {atividadesRecentes.map((atividade) => (
                    <div key={atividade.id} className="rounded-lg border border-gray-100 p-3">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-medium text-gray-900">
                            {getActivityActionLabel(atividade.action)}
                          </p>
                          <p className="break-words text-xs text-gray-500">
                            {atividade.actor_display_name || 'Ator não identificado'} · {formatActivityDate(atividade.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 break-words text-xs text-gray-600">
                        {getActivitySummary(atividade)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
