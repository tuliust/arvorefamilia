import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  CheckCircle2,
  Edit,
  Flower2,
  Handshake,
  HeartHandshake,
  MessageCircle,
  PartyPopper,
  Send,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AppLink as Link } from '../../components/AppLink';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { HEADER_ACTION_ICONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../../components/layout/MemberPageHeader';
import { ForumTopicFavoriteButton } from '../../components/favorites/ForumTopicFavoriteButton';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  criarRespostaForum,
  atualizarRespostaForum,
  deletarRespostaForum,
  deletarTopicoForum,
  incrementarVisualizacaoTopico,
  listarComentariosDaResposta,
  listarPessoasDoTopico,
  listarRespostasDoTopico,
  listarTopicosForum,
  obterMinhaReacaoForum,
  obterResumoReacoes,
  obterTopicoForumPorId,
  reagirAoConteudo,
  ResumoReacoesForum,
} from '../../services/forumService';
import { isAdminUser } from '../../services/permissionService';
import {
  ForumAlvoTipo,
  ForumComentario,
  ForumReacaoTipo,
  ForumResposta,
  ForumTopico as ForumTopicoType,
  Pessoa,
} from '../../types';

const REACAO_OPTIONS: Record<ForumReacaoTipo, { label: string; Icon: LucideIcon; classes: string; selectedClasses: string }> = {
  curtir: {
    label: 'Amei',
    Icon: HeartHandshake,
    classes: 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700',
    selectedClasses: 'border-red-300 bg-red-50 text-red-700',
  },
  apoiar: {
    label: 'Apoiar',
    Icon: Handshake,
    classes: 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700',
    selectedClasses: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  },
  lembrar: {
    label: 'Orações',
    Icon: Flower2,
    classes: 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700',
    selectedClasses: 'border-blue-300 bg-blue-50 text-blue-700',
  },
  celebrar: {
    label: 'Parabéns',
    Icon: PartyPopper,
    classes: 'border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700',
    selectedClasses: 'border-orange-300 bg-orange-50 text-orange-700',
  },
};

const RESUMO_VAZIO: ResumoReacoesForum = { curtir: 0, apoiar: 0, lembrar: 0, celebrar: 0 };

type AuthorProfile = {
  id: string;
  nome_exibicao?: string | null;
  avatar_url?: string | null;
};

function isSameCalendarDay(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate();
}

function formatarHora(valor: Date) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(valor);
}

function formatarData(valor?: string) {
  if (!valor) return '';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';

  const agora = new Date();
  const diffMin = Math.floor((agora.getTime() - data.getTime()) / 60000);

  if (diffMin >= 0 && diffMin < 60) return `Há ${Math.max(1, diffMin)} min`;
  if (isSameCalendarDay(data, agora)) return `Hoje, às ${formatarHora(data)}`;
  if (diffMin >= 0 && diffMin < 24 * 60) {
    const diffHoras = Math.max(1, Math.floor(diffMin / 60));
    return `Há ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
  }

  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);
  if (isSameCalendarDay(data, ontem)) return `Ontem, às ${formatarHora(data)}`;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data);
}

function isEdited(createdAt?: string, updatedAt?: string) {
  if (!createdAt || !updatedAt) return false;

  const created = new Date(createdAt).getTime();
  const updated = new Date(updatedAt).getTime();

  if (Number.isNaN(created) || Number.isNaN(updated)) return false;
  return updated - created > 5000;
}

function EditedBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
      Editado
    </span>
  );
}

function normalizeText(value?: string | null) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatarCategoriaForum(nome?: string | null) {
  const normalized = normalizeText(nome);
  if (normalized.includes('duvida')) return 'Dúvidas';
  if (normalized.includes('memoria')) return 'Memórias';
  if (normalized.includes('document')) return 'Documentos';
  if (normalized.includes('evento')) return 'Eventos';
  return nome || '';
}

function nomeAutor(autorId: string, userId?: string, profile?: AuthorProfile) {
  if (autorId === userId) return 'Você';
  if (profile?.nome_exibicao) return profile.nome_exibicao;
  return `Familiar ${autorId.slice(0, 8)}`;
}

function formatarNomeCurto(nome: string) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  return partes.slice(0, 2).join(' ') || nome;
}

function formatarContadorRespostas(total: number) {
  return `${total} ${total === 1 ? 'resposta' : 'respostas'}`;
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? '';
  const segunda = partes.length > 1 ? partes[partes.length - 1]?.[0] : '';
  return `${primeira}${segunda}`.toUpperCase() || 'F';
}

function MentionedContent({ content }: { content: string; pessoas: Pessoa[] }) {
  return <>{content}</>;
}

function AuthorAvatar({ name, src, size = 'md' }: { name: string; src?: string | null; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-10 w-10 text-xs';

  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 font-semibold text-gray-600 ${sizeClass}`}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <span aria-hidden="true">{iniciais(name)}</span>}
    </span>
  );
}

function TopicBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
      <span className="truncate">{children}</span>
    </span>
  );
}

function ReactionBar({
  alvoTipo,
  alvoId,
  resumo,
  selectedReaction,
  onChange,
  onSelectedChange,
  compact = false,
}: {
  alvoTipo: ForumAlvoTipo;
  alvoId: string;
  resumo: ResumoReacoesForum;
  selectedReaction: ForumReacaoTipo | null;
  onChange: (resumo: ResumoReacoesForum) => void;
  onSelectedChange: (tipo: ForumReacaoTipo | null) => void;
  compact?: boolean;
}) {
  async function reagir(tipo: ForumReacaoTipo) {
    const reacao = await reagirAoConteudo(alvoTipo, alvoId, tipo);
    if (reacao === undefined) {
      toast.error('Não foi possível registrar a reação.');
      return;
    }

    onSelectedChange(reacao?.tipo ?? null);
    const atualizado = await obterResumoReacoes(alvoTipo, alvoId);
    onChange(atualizado);
  }

  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      {(Object.keys(REACAO_OPTIONS) as ForumReacaoTipo[]).map((tipo) => {
        const option = REACAO_OPTIONS[tipo];
        const Icon = option.Icon;
        const selected = selectedReaction === tipo;
        const count = resumo[tipo] || 0;
        const label = `${option.label}${count ? ` (${count})` : ''}`;

        return (
          <Button
            key={tipo}
            type="button"
            variant="outline"
            size="sm"
            className={[
              compact ? 'h-8 min-w-8 rounded-full px-2' : 'min-w-0 gap-1 rounded-full px-2',
              'transition',
              selected ? option.selectedClasses : option.classes,
            ].join(' ')}
            title={`Reagir com ${option.label}`}
            aria-label={`Reagir com ${option.label}`}
            aria-pressed={selected}
            onClick={() => reagir(tipo)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {selected ? <span className="text-xs font-medium">{label}</span> : count > 0 ? <span className="text-xs font-medium">{count}</span> : null}
          </Button>
        );
      })}
    </div>
  );
}

function RecentTopicsSidebar({ topicos, currentTopicId }: { topicos: ForumTopicoType[]; currentTopicId: string }) {
  const topicosRecentes = topicos.filter((item) => item.id !== currentTopicId).slice(0, 5);

  return (
    <aside className="min-w-0 space-y-3 lg:sticky lg:top-24 lg:self-start" aria-label="Tópicos recentes">
      <h2 className="break-words text-lg font-semibold text-gray-900">Tópicos recentes</h2>
      <Card className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <CardContent className="p-0">
          {topicosRecentes.length === 0 ? (
            <p className="p-4 text-sm leading-6 text-gray-500">Nenhum outro tópico recente disponível.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {topicosRecentes.map((topicoRecente) => {
                const categoriaRecente = formatarCategoriaForum(topicoRecente.categoria?.nome);

                return (
                  <Link
                    key={topicoRecente.id}
                    to={`/forum/topico/${topicoRecente.id}`}
                    className="block min-w-0 p-4 transition hover:bg-blue-50/60"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        {categoriaRecente && <TopicBadge>{categoriaRecente}</TopicBadge>}
                        <h3 className="mt-2 line-clamp-2 break-words text-sm font-bold leading-snug text-gray-950">
                          {topicoRecente.titulo}
                        </h3>
                      </div>
                      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    </div>
                    {topicoRecente.conteudo && (
                      <p className="mt-2 line-clamp-2 break-words text-xs leading-5 text-gray-600">
                        {topicoRecente.conteudo}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-gray-500">{formatarData(topicoRecente.created_at)}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}

export function ForumTopico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topico, setTopico] = useState<ForumTopicoType | null>(null);
  const [topicosRecentes, setTopicosRecentes] = useState<ForumTopicoType[]>([]);
  const [respostas, setRespostas] = useState<ForumResposta[]>([]);
  const [comentarios, setComentarios] = useState<Record<string, ForumComentario[]>>({});
  const [pessoasRelacionadas, setPessoasRelacionadas] = useState<Pessoa[]>([]);
  const [authorProfiles, setAuthorProfiles] = useState<Record<string, AuthorProfile>>({});
  const [resumoTopico, setResumoTopico] = useState<ResumoReacoesForum>(RESUMO_VAZIO);
  const [resumosRespostas, setResumosRespostas] = useState<Record<string, ResumoReacoesForum>>({});
  const [minhaReacaoTopico, setMinhaReacaoTopico] = useState<ForumReacaoTipo | null>(null);
  const [minhasReacoesRespostas, setMinhasReacoesRespostas] = useState<Record<string, ForumReacaoTipo | null>>({});
  const [respostaTexto, setRespostaTexto] = useState('');
  const [editandoRespostaId, setEditandoRespostaId] = useState<string | null>(null);
  const [respostaEditada, setRespostaEditada] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [erro, setErro] = useState('');
  const [admin, setAdmin] = useState(false);
  const [excluindoTopico, setExcluindoTopico] = useState(false);
  const [confirmarExclusaoTopicoOpen, setConfirmarExclusaoTopicoOpen] = useState(false);
  const [respostaParaExcluirId, setRespostaParaExcluirId] = useState<string | null>(null);
  const [excluindoRespostaId, setExcluindoRespostaId] = useState<string | null>(null);
  const podeEditarTopico = useMemo(() => Boolean(user && topico && (topico.autor_id === user.id || admin)), [user, topico, admin]);

  async function carregarAutores(topicoData: ForumTopicoType, respostasData: ForumResposta[], comentariosData: Record<string, ForumComentario[]>) {
    const authorIds = Array.from(new Set([
      topicoData.autor_id,
      ...respostasData.map((resposta) => resposta.autor_id),
      ...Object.values(comentariosData).flat().map((comentario) => comentario.autor_id),
    ].filter(Boolean)));

    if (authorIds.length === 0) {
      setAuthorProfiles({});
      return;
    }

    const { data, error } = await supabase.from('profiles').select('id,nome_exibicao,avatar_url').in('id', authorIds);

    if (error) {
      console.warn('[Supabase] Não foi possível carregar avatares do fórum:', error.message);
      setAuthorProfiles({});
      return;
    }

    setAuthorProfiles(Object.fromEntries(((data || []) as AuthorProfile[]).map((profile) => [profile.id, profile])));
  }

  async function carregar() {
    if (!id) return;
    setLoading(true);
    setErro('');
    const topicoData = await obterTopicoForumPorId(id);
    if (!topicoData) {
      setTopico(null);
      setTopicosRecentes([]);
      setRespostas([]);
      setPessoasRelacionadas([]);
      setMinhaReacaoTopico(null);
      setMinhasReacoesRespostas({});
      setErro('Não foi possível carregar este tópico. Ele pode ter sido removido ou ocultado.');
      setLoading(false);
      return;
    }
    const [respostasData, topicosRecentesData] = await Promise.all([
      listarRespostasDoTopico(id),
      listarTopicosForum({ limite: 8 }),
    ]);
    const [comentariosData, resumoTopicoData, resumosData, pessoasDoTopico, minhaReacaoTopicoData, minhasReacoesData] = await Promise.all([
      Promise.all(respostasData.map(async (resposta) => [resposta.id, await listarComentariosDaResposta(resposta.id)] as const)),
      obterResumoReacoes('topico', id),
      Promise.all(respostasData.map(async (resposta) => [resposta.id, await obterResumoReacoes('resposta', resposta.id)] as const)),
      listarPessoasDoTopico(id),
      obterMinhaReacaoForum('topico', id),
      Promise.all(respostasData.map(async (resposta) => [resposta.id, await obterMinhaReacaoForum('resposta', resposta.id)] as const)),
    ]);
    const comentariosMap = Object.fromEntries(comentariosData);

    setTopico(topicoData);
    setTopicosRecentes(topicosRecentesData.filter((item) => item.id !== id).slice(0, 5));
    setRespostas(respostasData);
    setComentarios(comentariosMap);
    setPessoasRelacionadas(pessoasDoTopico);
    setResumoTopico(resumoTopicoData);
    setResumosRespostas(Object.fromEntries(resumosData));
    setMinhaReacaoTopico(minhaReacaoTopicoData);
    setMinhasReacoesRespostas(Object.fromEntries(minhasReacoesData));
    await carregarAutores(topicoData, respostasData, comentariosMap);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
    if (id) incrementarVisualizacaoTopico(id);
  }, [id, user?.id]);

  useEffect(() => {
    let mounted = true;

    async function carregarPermissaoAdmin() {
      if (!user) {
        setAdmin(false);
        return;
      }

      const result = await isAdminUser(user);
      if (!mounted) return;
      setAdmin(result.isAdmin);
    }

    carregarPermissaoAdmin();
    return () => {
      mounted = false;
    };
  }, [user]);

  async function responder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !user) {
      toast.error('Entre para responder.');
      return;
    }
    if (topico?.status === 'fechado') {
      toast.error('Este tópico está fechado e não aceita novas respostas.');
      return;
    }
    if (!respostaTexto.trim()) {
      toast.error('Escreva uma resposta.');
      return;
    }

    setEnviandoResposta(true);
    const resposta = await criarRespostaForum({ topico_id: id, autor_id: user.id, conteudo: respostaTexto.trim() });
    setEnviandoResposta(false);

    if (!resposta) {
      toast.error('Não foi possível publicar a resposta.');
      return;
    }

    setRespostaTexto('');
    toast.success('Resposta publicada.');
    await carregar();
  }

  function solicitarRemocaoTopico() {
    if (!topico || excluindoTopico) return;
    if (!user || (topico.autor_id !== user.id && !admin)) {
      toast.error('Você não tem permissão para excluir este tópico.');
      return;
    }

    setConfirmarExclusaoTopicoOpen(true);
  }

  async function confirmarRemocaoTopico() {
    if (!topico || excluindoTopico) return;

    setExcluindoTopico(true);
    try {
      const ok = await deletarTopicoForum(topico.id);
      if (!ok) {
        toast.error('Não foi possível excluir o tópico.');
        return;
      }

      setConfirmarExclusaoTopicoOpen(false);
      toast.success('Tópico excluído.');
      navigate('/forum');
    } finally {
      setExcluindoTopico(false);
    }
  }

  function solicitarRemocaoResposta(respostaId: string) {
    if (excluindoRespostaId) return;
    setRespostaParaExcluirId(respostaId);
  }

  async function confirmarRemocaoResposta() {
    if (!respostaParaExcluirId || excluindoRespostaId) return;

    const respostaId = respostaParaExcluirId;
    setExcluindoRespostaId(respostaId);
    try {
      const ok = await deletarRespostaForum(respostaId);
      if (!ok) {
        toast.error('Não foi possível excluir a resposta.');
        return;
      }

      setRespostaParaExcluirId(null);
      toast.success('Resposta excluída.');
      await carregar();
    } finally {
      setExcluindoRespostaId(null);
    }
  }

  function iniciarEdicaoResposta(resposta: ForumResposta) {
    setEditandoRespostaId(resposta.id);
    setRespostaEditada(resposta.conteudo);
  }

  async function salvarRespostaEditada(respostaId: string) {
    if (!respostaEditada.trim()) {
      toast.error('A resposta não pode ficar vazia.');
      return;
    }
    const atualizada = await atualizarRespostaForum(respostaId, { conteudo: respostaEditada.trim() });
    if (!atualizada) {
      toast.error('Não foi possível atualizar a resposta.');
      return;
    }
    setEditandoRespostaId(null);
    setRespostaEditada('');
    toast.success('Resposta atualizada.');
    await carregar();
  }

  if (loading) return <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">Carregando tópico...</div>;
  if (!topico) return <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">{erro || 'Tópico não encontrado.'}</div>;

  const topicoAuthorProfile = authorProfiles[topico.autor_id];
  const topicoAuthorName = nomeAutor(topico.autor_id, user?.id, topicoAuthorProfile);
  const currentUserName = user?.user_metadata?.nome_exibicao || user?.user_metadata?.name || user?.email || 'você';
  const currentUserShortName = formatarNomeCurto(currentUserName);
  const currentUserAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const pessoasParaMencoes = pessoasRelacionadas.length > 0 ? pessoasRelacionadas : topico.pessoa_relacionada ? [topico.pessoa_relacionada] : [];
  const topicoEditado = isEdited(topico.created_at, topico.updated_at);

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Tópico do fórum"
        subtitle={topico.titulo}
        icon={MessageCircle}
        actions={[
          { label: 'Voltar ao fórum', to: '/forum', icon: HEADER_ACTION_ICONS.ArrowLeft },
          ...(podeEditarTopico ? [{ label: 'Editar', to: `/forum/topico/${topico.id}/editar`, icon: Edit }] : []),
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} py-4 sm:py-6`}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
          <div className="min-w-0">
            <Card className="min-w-0 overflow-hidden rounded-2xl bg-white shadow-sm">
              <CardContent className="p-0">
                <article className="border-b border-gray-100">
                  <header className="flex items-start gap-3 px-4 py-3 sm:px-5">
                    <AuthorAvatar name={topicoAuthorName} src={topicoAuthorProfile?.avatar_url} />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
                        <span className="truncate font-semibold text-gray-900">{topicoAuthorName}</span>
                      </div>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>{formatarData(topico.created_at)}</span>
                        {topicoEditado && <EditedBadge />}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <ForumTopicFavoriteButton topico={topico} className="h-9 w-9 border-gray-200" />
                      {podeEditarTopico && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={solicitarRemocaoTopico}
                          disabled={excluindoTopico}
                          aria-label={excluindoTopico ? 'Excluindo tópico' : 'Excluir tópico'}
                          title={excluindoTopico ? 'Excluindo...' : 'Excluir'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </header>

                  <div className="space-y-3 px-4 pb-4 sm:px-5">
                    <h1 className="break-words text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">{topico.titulo}</h1>
                    <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-gray-800">
                      <MentionedContent content={topico.conteudo} pessoas={pessoasParaMencoes} />
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 sm:px-5">
                    <ReactionBar alvoTipo="topico" alvoId={topico.id} resumo={resumoTopico} selectedReaction={minhaReacaoTopico} onChange={setResumoTopico} onSelectedChange={setMinhaReacaoTopico} compact />
                    <span className="shrink-0 text-xs text-gray-500">{formatarContadorRespostas(respostas.length)}</span>
                  </div>
                </article>

                <section className="space-y-4 bg-gray-50/60 px-4 py-4 sm:px-5" aria-label="Respostas do tópico">
                  {respostas.length === 0 ? (
                    <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 ring-1 ring-gray-100">Nenhuma resposta publicada ainda.</div>
                  ) : (
                    respostas.map((resposta) => {
                      const podeAlterarResposta = Boolean(user && (resposta.autor_id === user.id || admin));
                      const respostaAuthorProfile = authorProfiles[resposta.autor_id];
                      const respostaAuthorName = nomeAutor(resposta.autor_id, user?.id, respostaAuthorProfile);
                      const respostaEditadaBadge = isEdited(resposta.created_at, resposta.updated_at);

                      return (
                        <div key={resposta.id} className="flex min-w-0 items-start gap-3">
                          <AuthorAvatar name={respostaAuthorName} src={respostaAuthorProfile?.avatar_url} size="sm" />
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className={`rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 ${resposta.aceita_como_solucao ? 'ring-emerald-200' : ''}`}>
                              <div className="mb-1 flex min-w-0 items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="break-words text-sm font-semibold text-gray-900">
                                    {respostaAuthorName}
                                    {resposta.aceita_como_solucao && (
                                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-emerald-700">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Solução
                                      </span>
                                    )}
                                  </p>
                                  <p className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    <span>{formatarData(resposta.created_at)}</span>
                                    {respostaEditadaBadge && <EditedBadge />}
                                  </p>
                                </div>

                                {podeAlterarResposta && (
                                  <div className="flex shrink-0 gap-1">
                                    <button type="button" onClick={() => iniciarEdicaoResposta(resposta)} className="text-gray-400 hover:text-blue-600" aria-label="Editar resposta">
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => solicitarRemocaoResposta(resposta.id)}
                                      disabled={excluindoRespostaId === resposta.id}
                                      className="text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                      aria-label={excluindoRespostaId === resposta.id ? 'Excluindo resposta' : 'Excluir resposta'}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {editandoRespostaId === resposta.id ? (
                                <div className="space-y-2">
                                  <Textarea value={respostaEditada} onChange={(event) => setRespostaEditada(event.target.value)} className="min-h-28" />
                                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                    <Button type="button" size="sm" className="w-full sm:w-auto" onClick={() => salvarRespostaEditada(resposta.id)}>Salvar resposta</Button>
                                    <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setEditandoRespostaId(null)}>Cancelar</Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800">{resposta.conteudo}</p>
                              )}
                            </div>

                            <ReactionBar alvoTipo="resposta" alvoId={resposta.id} resumo={resumosRespostas[resposta.id] ?? RESUMO_VAZIO} selectedReaction={minhasReacoesRespostas[resposta.id] ?? null} onChange={(resumo) => setResumosRespostas((prev) => ({ ...prev, [resposta.id]: resumo }))} onSelectedChange={(tipo) => setMinhasReacoesRespostas((prev) => ({ ...prev, [resposta.id]: tipo }))} compact />
                          </div>
                        </div>
                      );
                    })
                  )}
                </section>

                <form onSubmit={responder} className="border-t border-gray-100 bg-white px-4 py-3 sm:px-5">
                  {topico.status === 'fechado' ? (
                    <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">Este tópico está fechado e não aceita novas respostas.</p>
                  ) : (
                    <div className="flex min-w-0 items-center gap-2">
                      <AuthorAvatar name={currentUserName} src={currentUserAvatar} size="sm" />
                      <Textarea
                        value={respostaTexto}
                        onChange={(event) => setRespostaTexto(event.target.value)}
                        placeholder={`Responder como ${currentUserShortName}`}
                        className="min-h-11 flex-1 rounded-2xl bg-gray-50 text-sm"
                      />
                      <Button type="submit" disabled={enviandoResposta} size="icon" className="h-10 w-10 shrink-0 rounded-full" aria-label="Publicar resposta">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          <RecentTopicsSidebar topicos={topicosRecentes} currentTopicId={topico.id} />
        </div>
      </main>

      <ConfirmDialog
        open={confirmarExclusaoTopicoOpen}
        onOpenChange={(open) => {
          if (!excluindoTopico) setConfirmarExclusaoTopicoOpen(open);
        }}
        title="Excluir tópico"
        description="Deseja excluir este tópico? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmarRemocaoTopico}
        variant="danger"
        loading={excluindoTopico}
      />

      <ConfirmDialog
        open={Boolean(respostaParaExcluirId)}
        onOpenChange={(open) => {
          if (!open && !excluindoRespostaId) setRespostaParaExcluirId(null);
        }}
        title="Excluir resposta"
        description="Deseja excluir esta resposta? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmarRemocaoResposta}
        variant="danger"
        loading={Boolean(excluindoRespostaId)}
      />
    </div>
  );
}
