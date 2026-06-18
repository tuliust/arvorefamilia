import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, GitPullRequest, HelpCircle, Link2, MessageCircle, Palette, PlusCircle, Send, Settings, ShieldCheck, Users } from 'lucide-react';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../../components/layout/MemberPageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../../services/dataService';
import { listPendingRelationshipChangeRequests } from '../../services/relationshipChangeRequestService';
import { adminListProfilesForLinking } from '../../services/memberProfileService';

type Pessoa = {
  id: string;
  nome_completo: string;
  humano_ou_pet?: 'Humano' | 'Pet' | string;
  telefone?: string | null;
};

type Relacionamento = {
  id: string;
  tipo_relacionamento?: string;
};

const dashboardCardButtonClass =
  'group min-w-0 rounded-lg border border-gray-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

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

function firstName(fullName?: string | null) {
  return (fullName ?? '').trim().split(/\s+/)[0] || 'familiar';
}

function buildInviteMessage(pessoa?: Pessoa | null) {
  const nome = firstName(pessoa?.nome_completo);
  const codigo = pessoa?.id ?? '[inserir ID do usuário selecionado]';
  return `Oi, ${nome}. Tudo bem? Você recebeu um convite especial para estrear a plataforma *Genealogia da Família Souza Baros*, que organiza a árvore genealógica, perfis, documentos, memórias e datas importantes da família. Acesse familiasouzabarros.com.br e insira seu código para criar o acesso: ${codigo}. Faça seu cadastro e navegue para conhecer a estrutura e funcionalidades. No computador, a experiência é bem melhor. Como estamos iniciando, contamos com suas sugestões para aperfeiçoar o sistema e corrigir erros. Obrigado!`;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([]);
  const [pendingRelationshipRequests, setPendingRelationshipRequests] = useState(0);
  const [totalCadastros, setTotalCadastros] = useState(0);
  const [selectedPessoaId, setSelectedPessoaId] = useState('');
  const [whatsappLocal, setWhatsappLocal] = useState('');
  const [message, setMessage] = useState(buildInviteMessage(null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [pessoasData, relacionamentosData, pendingRequestsData, profilesData] = await Promise.all([
          obterTodasPessoas(),
          obterTodosRelacionamentos(),
          listPendingRelationshipChangeRequests({ limit: 1000 }),
          adminListProfilesForLinking(),
        ]);
        setPessoas(Array.isArray(pessoasData) ? pessoasData : []);
        setRelacionamentos(Array.isArray(relacionamentosData) ? relacionamentosData : []);
        setPendingRelationshipRequests(Array.isArray(pendingRequestsData) ? pendingRequestsData.length : 0);
        setTotalCadastros(profilesData.error ? 0 : profilesData.data.length);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        setPessoas([]);
        setRelacionamentos([]);
        setPendingRelationshipRequests(0);
        setTotalCadastros(0);
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
    totalPets: pessoas.filter((p) => p.humano_ou_pet === 'Pet').length,
    totalRelacionamentos: relacionamentos.length,
    pendingRelationshipRequests,
    totalCadastros,
    totalCasamentos: Math.floor(relacionamentos.filter((r) => r.tipo_relacionamento === 'conjuge').length / 2),
  };

  const quickActions = [
    { title: 'Adicionar Pessoa', description: 'Cadastrar novo membro', icon: PlusCircle, onClick: () => navigate('/admin/pessoas/nova'), color: 'bg-blue-500' },
    { title: 'Ver Pessoas', description: 'Listar todos os membros', icon: Users, onClick: () => navigate('/admin/pessoas'), color: 'bg-emerald-500' },
    { title: 'Relacionamentos', description: 'Gerenciar vínculos', icon: Link2, onClick: () => navigate('/admin/relacionamentos'), color: 'bg-purple-500' },
    { title: 'Solicitações de vínculos', description: `${stats.pendingRelationshipRequests} pendente(s)`, icon: GitPullRequest, onClick: () => navigate('/admin/solicitacoes-vinculos'), color: 'bg-amber-600' },
    { title: 'Dúvidas', description: 'Gerenciar perguntas, respostas e categorias', icon: HelpCircle, onClick: () => navigate('/admin/duvidas'), color: 'bg-indigo-600' },
    { title: 'Notificações', description: 'Diagnóstico e envios', icon: Bell, onClick: () => navigate('/admin/notificacoes'), color: 'bg-blue-700' },
    { title: 'Aparência da home', description: 'Logo, fundo e cores', icon: Palette, onClick: () => navigate('/admin/home'), color: 'bg-teal-700' },
    { title: 'Integridade dos dados', description: 'Diagnóstico da base', icon: ShieldCheck, onClick: () => navigate('/admin/integridade'), color: 'bg-cyan-700' },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Painel Administrativo"
        subtitle="Gestão da Árvore Genealógica"
        icon={Settings}
        actions={[...DEFAULT_MEMBER_HEADER_ACTIONS, { label: 'Sair', onClick: handleSignOut, variant: 'ghost' }]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} py-6 sm:py-8`}>
        <div className="mb-6 grid grid-cols-4 gap-2 sm:mb-8 sm:gap-4 lg:grid-cols-4">
          <button type="button" onClick={() => navigate('/admin/pessoas')} className={dashboardCardButtonClass} aria-label="Abrir página de pessoas">
            <span className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 pb-1 pt-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:pb-2 sm:pt-6">
              <span className="truncate text-[10px] font-semibold text-gray-600 sm:text-sm">Membros</span>
              <Users className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
            </span>
            <span className="block px-1 pb-3 text-center sm:px-6 sm:pb-6">
              <span className="block text-xl font-bold leading-none text-gray-900 sm:text-3xl">{stats.totalPessoas}</span>
              <span className="mt-1 hidden break-words text-xs text-gray-500 sm:block">{stats.totalHumanos} humanos, {stats.totalPets} pets</span>
            </span>
          </button>

          <button type="button" onClick={() => navigate('/admin/relacionamentos')} className={dashboardCardButtonClass} aria-label="Abrir página de relacionamentos">
            <span className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 pb-1 pt-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:pb-2 sm:pt-6">
              <span className="truncate text-[10px] font-semibold text-gray-600 sm:text-sm">Relações</span>
              <Link2 className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
            </span>
            <span className="block px-1 pb-3 text-center sm:px-6 sm:pb-6">
              <span className="block text-xl font-bold leading-none text-gray-900 sm:text-3xl">{stats.totalRelacionamentos}</span>
              <span className="mt-1 hidden break-words text-xs text-gray-500 sm:block">{stats.totalCasamentos} casamentos</span>
            </span>
          </button>

          <button type="button" onClick={() => navigate('/admin/solicitacoes-vinculos')} className={dashboardCardButtonClass} aria-label="Abrir página de solicitações de vínculos">
            <span className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 pb-1 pt-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:pb-2 sm:pt-6">
              <span className="truncate text-[10px] font-semibold text-gray-600 sm:text-sm">Pendentes</span>
              <GitPullRequest className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
            </span>
            <span className="block px-1 pb-3 text-center sm:px-6 sm:pb-6">
              <span className="block text-xl font-bold leading-none text-gray-900 sm:text-3xl">{stats.pendingRelationshipRequests}</span>
              <span className="mt-1 hidden break-words text-xs text-gray-500 sm:block">Vínculos aguardando revisão</span>
            </span>
          </button>

          <Card className="min-w-0">
            <CardHeader className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 pb-1 pt-3 text-center sm:flex-row sm:justify-between sm:px-6 sm:pb-2 sm:pt-6">
              <CardTitle className="truncate text-[10px] font-semibold text-gray-600 sm:text-sm">Cadastros</CardTitle>
              <Users className="h-4 w-4 shrink-0 text-gray-400" />
            </CardHeader>
            <CardContent className="px-1 pb-3 text-center sm:px-6 sm:pb-6">
              <div className="text-xl font-bold leading-none text-gray-900 sm:text-3xl">{stats.totalCadastros}</div>
              <p className="mt-1 hidden break-words text-xs text-gray-500 sm:block">Usuários cadastrados na plataforma</p>
            </CardContent>
          </Card>
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
              {selectedPessoa && <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">Código: {selectedPessoa.id}</span>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
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

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">O código enviado é o ID da pessoa selecionada para o fluxo de primeiro acesso.</p>
              <Button type="button" onClick={handleOpenInvite} disabled={!selectedPessoa || !whatsappLocal.trim()} className="w-full sm:w-auto">
                <Send className="mr-2 h-4 w-4" />
                Enviar pelo WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="mb-4 break-words text-lg font-semibold text-gray-900">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
      </main>
    </div>
  );
}
