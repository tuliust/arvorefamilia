import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, ChevronDown, ChevronUp, FileText, GitPullRequest, HelpCircle, Link2, MessageCircle, Palette, PlusCircle, Send, Settings, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../../components/layout/MemberPageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../../services/dataService';
import { getActivitySummary, listRecentActivityLogs } from '../../services/activityLogService';
import { listPendingRelationshipChangeRequests } from '../../services/relationshipChangeRequestService';
import { adminListProfilesForLinking, getPrimaryLinkedPerson, type AdminLinkableProfile } from '../../services/memberProfileService';
import { ActivityLog } from '../../types';

type Pessoa = {
  id: string;
  nome_completo: string;
  local_nascimento?: string | null;
  humano_ou_pet?: 'Humano' | 'Pet' | string;
  telefone?: string | null;
};

type Relacionamento = {
  id: string;
  tipo_relacionamento?: string;
};

type AdminLinkableProfileWithCreatedAt = AdminLinkableProfile & {
  created_at?: string | null;
};

const dashboardCardButtonClass =
  'group min-w-0 rounded-lg border border-blue-100 bg-blue-50/80 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

const dashboardCardIconClass =
  'h-6 w-6 shrink-0 text-blue-500 transition-colors group-hover:text-blue-700 sm:h-7 sm:w-7';

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function getLocalPhoneDigits(value?: string | null) {
  let digits = digitsOnly(value ?? '');
  if (digits.startsWith('55') && digits.length > 11) digits = digits.slice(2);
  return digits.slice(0, 11);
}

function formatLocalPhone(value?: string | null) {
  const digits = getLocalPhoneDigits(value);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function getCadastroDisplayName(profile: AdminLinkableProfile) {
  return String(profile.nome_exibicao || profile.email || profile.id || 'Usuário cadastrado').trim();
}

function getCadastroSubtitle(profile: AdminLinkableProfile) {
  return String(profile.email || profile.id || 'Auth user id vinculado').trim();
}

function getProfileCreatedAtTime(profile: AdminLinkableProfile) {
  const value = (profile as AdminLinkableProfileWithCreatedAt).created_at;
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
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

function getActivityTitle(activity: ActivityLog) {
  return normalizeRelationshipWords(getActivitySummary(activity)).replace(/[.!?]+$/u, '');
}

function firstName(fullName?: string | null) {
  return (fullName ?? '').trim().split(/\s+/)[0] || 'familiar';
}

function buildInviteMessage(pessoa?: Pessoa | null) {
  const nome = firstName(pessoa?.nome_completo);
  const codigo = pessoa?.id ?? '[inserir ID do usuário selecionado]';
  return `Oi, ${nome}. Tudo bem? Você recebeu um convite especial para estrear a plataforma *Genealogia da Família Souza Barros*, que organiza a árvore genealógica, perfis, documentos, memórias e datas importantes da família.\n\nAcesse *familiasouzabarros.com.br* e insira seu código para criar o acesso:\n\n*${codigo}*\n\nComo estamos iniciando, contamos com suas sugestões para aperfeiçoar o sistema e corrigir erros. Obrigado!`;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([]);
  const [atividadesRecentes, setAtividadesRecentes] = useState<ActivityLog[]>([]);
  const [pendingRelationshipRequests, setPendingRelationshipRequests] = useState(0);
  const [totalCadastros, setTotalCadastros] = useState(0);
  const [cadastrosRecentes, setCadastrosRecentes] = useState<AdminLinkableProfile[]>([]);
  const [selectedPessoaId, setSelectedPessoaId] = useState('');
  const [whatsappLocal, setWhatsappLocal] = useState('');
  const [message, setMessage] = useState(buildInviteMessage(null));
  const [inviteExpanded, setInviteExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [pessoasData, relacionamentosData, atividadesData, pendingRequestsData, profilesData] = await Promise.all([
          obterTodasPessoas(),
          obterTodosRelacionamentos(),
          listRecentActivityLogs(10),
          listPendingRelationshipChangeRequests({ limit: 1000 }),
          adminListProfilesForLinking(),
        ]);
        setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
        setRelacionamentos(Array.isArray(relacionamentosData) ? relacionamentosData : []);
        setAtividadesRecentes(Array.isArray(atividadesData) ? atividadesData.slice(0, 10) : []);
        setPendingRelationshipRequests(Array.isArray(pendingRequestsData) ? pendingRequestsData.length : 0);
        const profiles = profilesData.error ? [] : profilesData.data.filter((profile) => Boolean(profile.id));
        const orderedProfiles = [...profiles].sort((left, right) => {
          const rightCreatedAt = getProfileCreatedAtTime(right);
          const leftCreatedAt = getProfileCreatedAtTime(left);
          if (rightCreatedAt !== leftCreatedAt) return rightCreatedAt - leftCreatedAt;
          return getCadastroDisplayName(left).localeCompare(getCadastroDisplayName(right), 'pt-BR');
        });
        setCadastrosRecentes(orderedProfiles.slice(0, 10));
        setTotalCadastros(profiles.length);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        setPessoas([]);
        setRelacionamentos([]);
        setAtividadesRecentes([]);
        setPendingRelationshipRequests(0);
        setTotalCadastros(0);
        setCadastrosRecentes([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!selectedPessoaId && pessoas[0]?.id) setSelectedPessoaId(pessoas[0].id);
  }, [pessoas, selectedPessoaId]);

  const selectedPessoa = useMemo(
    () => pessoas.find((pessoa) => pessoa.id === selectedPessoaId) ?? null,
    [pessoas, selectedPessoaId]
  );

  useEffect(() => {
    setWhatsappLocal(formatLocalPhone(selectedPessoa?.telefone ?? ''));
    setMessage(buildInviteMessage(selectedPessoa));
  }, [selectedPessoa]);

  const stats = {
    totalPessoas: pessoas.length,
    totalHumanos: pessoas.filter((p) => p.humano_ou_pet === 'Humano').length,
    totalRelacionamentos: relacionamentos.length,
    pendingRelationshipRequests,
    totalCadastros,
    totalCasamentos: Math.floor(relacionamentos.filter((r) => r.tipo_relacionamento === 'conjuge').length / 2),
  };

  const quickActions = [
    { title: 'Adicionar Pessoa', description: 'Cadastrar novo membro', icon: PlusCircle, onClick: () => navigate('/admin/pessoas/nova'), color: 'bg-blue-500' },
    { title: 'Dúvidas', description: 'Gerenciar perguntas e respostas', icon: HelpCircle, onClick: () => navigate('/admin/duvidas'), color: 'bg-indigo-600' },
    { title: 'Conteúdo de Pessoas', description: 'Gerenciar conteúdo dos perfis', icon: FileText, onClick: () => navigate('/admin/gestao-conteudo-pessoas'), color: 'bg-slate-800' },
    { title: 'Notificações', description: 'Configuração de alertas e resultados', icon: Bell, onClick: () => navigate('/admin/notificacoes'), color: 'bg-blue-700' },
    { title: 'Design', description: 'Logo, fundo e cores', icon: Palette, onClick: () => navigate('/admin/home'), color: 'bg-teal-700' },
    { title: 'Diagnóstico', description: 'Diagnóstico da base', icon: ShieldCheck, onClick: () => navigate('/admin/integridade'), color: 'bg-cyan-700' },
  ];

  const novosCadastros = cadastrosRecentes.slice(0, 10);

  const formatActivityDate = (value?: string) => {
    if (!value) return 'Data não informada';
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleOpenInvite = () => {
    if (!selectedPessoa) {
      window.alert('Selecione um usuário antes de enviar o convite.');
      return;
    }

    const localDigits = getLocalPhoneDigits(whatsappLocal);
    if (localDigits.length < 10) {
      window.alert('Informe um WhatsApp válido com DDD.');
      return;
    }

    const base = ['https://', 'wa', '.', 'me', '/'].join('');
    window.open(`${base}55${localDigits}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleOpenCadastroProfile = async (profile: AdminLinkableProfile) => {
    if (!profile.id) return;

    const linkedPerson = await getPrimaryLinkedPerson(profile.id);

    if (linkedPerson.error) {
      console.error('Erro ao localizar pessoa vinculada ao cadastro:', linkedPerson.error);
      window.alert('Não foi possível localizar o perfil vinculado a este cadastro.');
      return;
    }

    if (!linkedPerson.data?.pessoa_id) {
      window.alert('Este cadastro ainda não tem uma pessoa vinculada na árvore.');
      return;
    }

    navigate(`/pessoa/${linkedPerson.data.pessoa_id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-admin-dashboard-page="true">
      <MemberPageHeader
        title="Painel Administrativo"
        subtitle="Gestão da Árvore Genealógica"
        icon={Settings}
        actions={[...DEFAULT_MEMBER_HEADER_ACTIONS, { label: 'Sair', onClick: handleSignOut, variant: 'ghost' }]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} pb-32 pt-6 sm:py-8`}>
        <div className="mb-6 grid grid-cols-4 gap-2 sm:mb-8 sm:gap-4 lg:grid-cols-4">
          <button type="button" onClick={() => navigate('/admin/pessoas')} className={dashboardCardButtonClass} aria-label="Abrir página de pessoas">
            <span className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 pb-1 pt-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:pb-2 sm:pt-6">
              <span className="truncate text-[10px] font-semibold text-gray-700 sm:text-sm">Membros</span>
              <Users className={dashboardCardIconClass} />
            </span>
            <span className="block px-1 pb-3 text-center sm:px-6 sm:pb-6">
              <span className="block text-xl font-bold leading-none text-gray-900 sm:text-3xl">{stats.totalHumanos}</span>
            </span>
          </button>

          <button type="button" onClick={() => navigate('/admin/relacionamentos')} className={dashboardCardButtonClass} aria-label="Abrir página de relacionamentos">
            <span className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 pb-1 pt-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:pb-2 sm:pt-6">
              <span className="truncate text-[10px] font-semibold text-gray-700 sm:text-sm">Relações</span>
              <Link2 className={dashboardCardIconClass} />
            </span>
            <span className="block px-1 pb-3 text-center sm:px-6 sm:pb-6">
              <span className="block text-xl font-bold leading-none text-gray-900 sm:text-3xl">{stats.totalRelacionamentos}</span>
              <span className="mt-1 hidden break-words text-xs text-gray-500 sm:block">{stats.totalCasamentos} casamentos</span>
            </span>
          </button>

          <button type="button" onClick={() => navigate('/admin/responsaveis')} className={dashboardCardButtonClass} aria-label="Abrir página de solicitações de aprovações">
            <span className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 pb-1 pt-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:pb-2 sm:pt-6">
              <span className="truncate text-[10px] font-semibold text-gray-700 sm:text-sm">Solicitações de Aprovações</span>
              <GitPullRequest className={dashboardCardIconClass} />
            </span>
            <span className="block px-1 pb-3 text-center sm:px-6 sm:pb-6">
              <span className="block text-xl font-bold leading-none text-gray-900 sm:text-3xl">{stats.pendingRelationshipRequests}</span>
              <span className="mt-1 hidden break-words text-xs text-gray-500 sm:block">Vínculos aguardando revisão</span>
            </span>
          </button>

          <button type="button" onClick={() => navigate('/admin/responsaveis')} className={dashboardCardButtonClass} aria-label="Abrir página de responsáveis por usuários">
            <span className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 pb-1 pt-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:pb-2 sm:pt-6">
              <span className="truncate text-[10px] font-semibold text-gray-700 sm:text-sm">Responsáveis por Usuários</span>
              <UserCheck className={dashboardCardIconClass} />
            </span>
            <span className="block px-1 pb-3 text-center sm:px-6 sm:pb-6">
              <span className="block text-xl font-bold leading-none text-gray-900 sm:text-3xl">{stats.totalCadastros}</span>
              <span className="mt-1 hidden break-words text-xs text-gray-500 sm:block">Usuários cadastrados na plataforma</span>
            </span>
          </button>
        </div>

        <Card className="mb-8 overflow-hidden border-blue-100 bg-white shadow-sm">
          <CardHeader className="border-b border-blue-50 bg-blue-50/70">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Convite por WhatsApp
                </CardTitle>
                <p className="mt-1 text-sm text-gray-600">Selecione a pessoa, confirme o WhatsApp e envie a mensagem de primeiro acesso.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInviteExpanded((current) => !current)}
                aria-expanded={inviteExpanded}
                aria-controls="admin-whatsapp-invite-content"
                className="w-full bg-white sm:w-auto"
              >
                {inviteExpanded ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Recolher
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Expandir
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {inviteExpanded && (
            <CardContent id="admin-whatsapp-invite-content" className="space-y-4 p-4 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Usuário</span>
                  <select
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={selectedPessoaId}
                    onChange={(event) => setSelectedPessoaId(event.target.value)}
                    disabled={loading || pessoas.length === 0}
                  >
                    <option value="">Selecione um usuário</option>
                    {pessoas.map((pessoa) => <option key={pessoa.id} value={pessoa.id}>{pessoa.nome_completo}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</span>
                  <div className="flex rounded-xl border border-gray-300 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <span className="inline-flex items-center rounded-l-xl border-r border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700">+55</span>
                    <input
                      className="min-w-0 flex-1 rounded-r-xl border-0 px-3 py-2.5 text-sm text-gray-900 outline-none"
                      inputMode="tel"
                      placeholder="(XX) XXXXX-XXXX"
                      value={whatsappLocal}
                      onChange={(event) => setWhatsappLocal(formatLocalPhone(event.target.value))}
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Mensagem</span>
                <textarea
                  className="min-h-[170px] w-full rounded-xl border border-gray-300 px-3 py-3 text-sm leading-6 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-7">
                  {selectedPessoa && (
                    <span className="inline-flex max-w-full items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                      <span className="truncate">Código: {selectedPessoa.id}</span>
                    </span>
                  )}
                </div>
                <Button type="button" onClick={handleOpenInvite} disabled={!selectedPessoa || !whatsappLocal.trim()} className="w-full sm:w-auto">
                  <Send className="mr-2 h-4 w-4" />
                  Enviar pelo WhatsApp
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="mb-8">
          <h2 className="mb-4 break-words text-lg font-semibold text-gray-900">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {quickActions.map((action) => (
              <button key={action.title} onClick={action.onClick} className="min-w-0 rounded-lg border border-gray-200 bg-white p-3 text-left transition-shadow hover:shadow-md sm:p-6" type="button">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg sm:h-12 sm:w-12 ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <h3 className="break-words text-sm font-semibold leading-tight text-gray-900 sm:mb-1 sm:text-base">{action.title}</h3>
                <p className="hidden line-clamp-3 break-words text-sm text-gray-600 sm:block">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <Card className="flex min-h-[32rem] min-w-0 flex-col">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="break-words">Novos Cadastros</CardTitle>
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate('/admin/pessoas/novas')}>
                Ver Todos
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              {loading ? (
                <p className="text-sm text-gray-500">Carregando...</p>
              ) : novosCadastros.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum cadastro encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {novosCadastros.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => void handleOpenCadastroProfile(profile)}
                      className="w-full rounded-lg border border-gray-100 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      aria-label={`Abrir perfil de ${getCadastroDisplayName(profile)}`}
                    >
                      <p className="break-words text-sm font-medium text-gray-900">{getCadastroDisplayName(profile)}</p>
                      <p className="mt-1 break-words text-xs text-gray-500">{getCadastroSubtitle(profile)}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex min-h-[32rem] min-w-0 flex-col">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="break-words">Histórico de Atividades</CardTitle>
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate('/admin/atividades')}>
                Ver Histórico Completo
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              {loading ? (
                <p className="text-sm text-gray-500">Carregando...</p>
              ) : atividadesRecentes.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma atividade registrada.</p>
              ) : (
                <div className="space-y-3">
                  {atividadesRecentes.slice(0, 10).map((atividade) => (
                    <div key={atividade.id} className="rounded-lg border border-gray-100 p-3">
                      <p className="break-words text-sm font-medium text-gray-900">{getActivityTitle(atividade)}</p>
                      <p className="mt-1 break-words text-xs text-gray-500">
                        {getFirstTwoNames(atividade.actor_display_name)} · {formatActivityDate(atividade.created_at)}
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
