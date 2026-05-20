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
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="break-words text-sm font-medium text-gray-600">
                Total de Membros
              </CardTitle>
              <Users className="h-4 w-4 shrink-0 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalPessoas}</div>
              <p className="mt-1 break-words text-xs text-gray-500">
                {stats.totalHumanos} humanos, {stats.totalPets} pets
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="break-words text-sm font-medium text-gray-600">
                Relacionamentos
              </CardTitle>
              <Link2 className="h-4 w-4 shrink-0 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalRelacionamentos}
              </div>
              <p className="mt-1 break-words text-xs text-gray-500">
                {stats.totalCasamentos} casamentos
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="break-words text-sm font-medium text-gray-600">
                Solicitações pendentes
              </CardTitle>
              <GitPullRequest className="h-4 w-4 shrink-0 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.pendingRelationshipRequests}</div>
              <p className="mt-1 break-words text-xs text-gray-500">Vínculos aguardando revisão</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="break-words text-sm font-medium text-gray-600">
                In Memoriam
              </CardTitle>
              <BarChart3 className="h-4 w-4 shrink-0 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalFalecidos}</div>
              <p className="mt-1 break-words text-xs text-gray-500">Pessoas falecidas</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 break-words text-lg font-semibold text-gray-900">Ações Rápidas</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={action.onClick}
	                className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md sm:p-6"
                type="button"
              >
                <div
	                  className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg ${action.color}`}
                >
	                  <action.icon className="h-6 w-6 text-white" />
                </div>
	                <h3 className="mb-1 break-words font-semibold text-gray-900">{action.title}</h3>
	                <p className="line-clamp-3 break-words text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
	          <Card className="min-w-0">
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
	                        variant="ghost"
	                        size="sm"
	                        className="w-full sm:w-auto"
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
