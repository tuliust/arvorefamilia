import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppLink as Link } from '../../components/AppLink';
import {
  CheckCircle2,
  Edit,
  Flower2,
  Handshake,
  HeartHandshake,
  MessageCircle,
  MessageSquare,
  PartyPopper,
  Send,
  Trash2,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { HEADER_ACTION_ICONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { ForumTopicFavoriteButton } from '../../components/favorites/ForumTopicFavoriteButton';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  criarComentarioForum,
  criarRespostaForum,
  atualizarComentarioForum,
  atualizarRespostaForum,
  deletarComentarioForum,
  deletarRespostaForum,
  deletarTopicoForum,
  incrementarVisualizacaoTopico,
  listarComentariosDaResposta,
  listarPessoasDoTopico,
  listarRespostasDoTopico,
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
  ForumTopicoStatus,
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

const TOPICO_TIPO_LABELS: Record<string, string> = {
  pergunta: 'Pergunta',
  discussao: 'Discussão',
  aviso: 'Aviso',
  memoria: 'Memória',
  ajuda: 'Ajuda',
};

const TOPICO_STATUS_LABELS: Record<ForumTopicoStatus, string> = {
  aberto: 'Aberto',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
  oculto: 'Oculto',
};

const RESUMO_VAZIO: ResumoReacoesForum = { curtir: 0, apoiar: 0, lembrar: 0, celebrar: 0 };

type AuthorProfile = {
  id: string;
  nome_exibicao?: string | null;
  avatar_url?: string | null;
};

function formatarData(valor?: string) {
  if (!valor) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(valor));
}

function nomeAutor(autorId: string, userId?: string, profile?: AuthorProfile) {
  if (autorId === userId) return 'Você';
  if (profile?.nome_exibicao) return profile.nome_exibicao;
  return `Familiar ${autorId.slice(0, 8)}`;
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? '';
  const segunda = partes.length > 1 ? partes[partes.length - 1]?.[0] : '';
  return `${primeira}${segunda}`.toUpperCase() || 'F';
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function MentionedContent({ content, pessoas }: { content: string; pessoas: Pessoa[] }) {
  const matches = pessoas
    .filter((pessoa) => pessoa.nome_completo)
    .sort((a, b) => b.nome_completo.length - a.nome_completo.length);

  if (matches.length === 0 || !content.includes('@')) {
    return <>{content}</>;
  }

  const pattern = new RegExp(`@(${matches.map((pessoa) => escapeRegExp(pessoa.nome_completo)).join('|')})`, 'g');
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const pessoa = matches.find((item) => item.nome_completo === match?.[1]);
    if (!pessoa) continue;

    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    parts.push(
      <Link
        key={`${pessoa.id}-${match.index}`}
        to={`/pessoa/${pessoa.id}`}
        className="font-semibold text-blue-700 underline-offset-2 hover:underline"
      >
        @{pessoa.nome_completo}
      </Link>
    );
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <>{parts}</>;
}

function AuthorAvatar({ name, src }: { name: string; src?: string | null }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-xs font-semibold text-gray-600">
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{iniciais(name)}</span>
      )}
    </span>
  );
}

function PersonAvatar({ pessoa }: { pessoa: Pessoa }) {
  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-blue-700">
      {pessoa.foto_principal_url ? (
        <img src={pessoa.foto_principal_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <UserRound className="h-5 w-5" />
      )}
    </span>
  );
}

function TopicBadge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'blue' | 'emerald' | 'amber' | 'gray' | 'purple' }) {
  const tones = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    gray: 'border-gray-200 bg-gray-50 text-gray-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
  };

  return (
    <span className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      <span className="truncate">{children}</span>
    </span>
  );
}

function statusTone(status: ForumTopicoStatus): 'blue' | 'emerald' | 'amber' | 'gray' | 'purple' {
  if (status === 'resolvido') return 'emerald';
  if (status === 'fechado') return 'amber';
  if (status === 'oculto') return 'gray';
  return 'blue';
}

function ReactionBar({
  alvoTipo,
  alvoId,
  resumo,
  selectedReaction,
  onChange,
  onSelectedChange,
}: {
  alvoTipo: ForumAlvoTipo;
  alvoId: string;
  resumo: ResumoReacoesForum;
  selectedReaction: ForumReacaoTipo | null;
  onChange: (resumo: ResumoReacoesForum) => void;
  onSelectedChange: (tipo: ForumReacaoTipo | null) => void;
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
              'min-w-0 gap-1 rounded-full px-2 transition',
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

export function ForumTopico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topico, setTopico] = useState<ForumTopicoType | null>(null);
  const [respostas, setRespostas] = useState<ForumResposta[]>([]);
  const [comentarios, setComentarios] = useState<Record<string, ForumComentario[]>>({});
  const [pessoasRelacionadas, setPessoasRelacionadas] = useState<Pessoa[]>([]);
  const [authorProfiles, setAuthorProfiles] = useState<Record<string, AuthorProfile>>({});
  const [resumoTopico, setResumoTopico] = useState<ResumoReacoesForum>(RESUMO_VAZIO);
  const [resumosRespostas, setResumosRespostas] = useState<Record<string, ResumoReacoesForum>>({});
  const [minhaReacaoTopico, setMinhaReacaoTopico] = useState<ForumReacaoTipo | null>(null);
  const [minhasReacoesRespostas, setMinhasReacoesRespostas] = useState<Record<string, ForumReacaoTipo | null>>({});
  const [respostaTexto, setRespostaTexto] = useState('');
  const [comentarioTexto, setComentarioTexto] = useState<Record<string, string>>({});
  const [editandoRespostaId, setEditandoRespostaId] = useState<string | null>(null);
  const [respostaEditada, setRespostaEditada] = useState('');
  const [editandoComentarioId, setEditandoComentarioId] = useState<string | null>(null);
  const [comentarioEditado, setComentarioEditado] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [erro, setErro] = useState('');
  const [admin, setAdmin] = useState(false);
  const [excluindoTopico, setExcluindoTopico] = useState(false);
  const podeEditarTopico = useMemo(
    () => Boolean(user && topico && (topico.autor_id === user.id || admin)),
    [user, topico, admin]
  );

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

    const { data, error } = await supabase
      .from('profiles')
      .select('id,nome_exibicao,avatar_url')
      .in('id', authorIds);

    if (error) {
      console.warn('[Supabase] Não foi possível carregar avatares do fórum:', error.message);
      setAuthorProfiles({});
      return;
    }

    setAuthorProfiles(
      Object.fromEntries(((data || []) as AuthorProfile[]).map((profile) => [profile.id, profile]))
    );
  }

  async function carregar() {
    if (!id) return;
    setLoading(true);
    setErro('');
    const topicoData = await obterTopicoForumPorId(id);
    if (!topicoData) {
      setTopico(null);
      setRespostas([]);
      setPessoasRelacionadas([]);
      setMinhaReacaoTopico(null);
      setMinhasReacoesRespostas({});
      setErro('Não foi possível carregar este tópico. Ele pode ter sido removido ou ocultado.');
      setLoading(false);
      return;
    }
    const respostasData = await listarRespostasDoTopico(id);
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
    const resposta = await criarRespostaForum({
      topico_id: id,
      autor_id: user.id,
      conteudo: respostaTexto.trim(),
    });
    setEnviandoResposta(false);

    if (!resposta) {
      toast.error('Não foi possível publicar a resposta.');
      return;
    }

    setRespostaTexto('');
    toast.success('Resposta publicada.');
    await carregar();
  }

  async function comentar(respostaId: string) {
    if (!user) {
      toast.error('Entre para comentar.');
      return;
    }

    const conteudo = comentarioTexto[respostaId]?.trim();
    if (!conteudo) {
      toast.error('Escreva um comentário.');
      return;
    }

    const comentario = await criarComentarioForum({
      resposta_id: respostaId,
      autor_id: user.id,
      conteudo,
    });

    if (!comentario) {
      toast.error('Não foi possível publicar o comentário.');
      return;
    }

    setComentarioTexto((prev) => ({ ...prev, [respostaId]: '' }));
    setComentarios((prev) => ({
      ...prev,
      [respostaId]: [...(prev[respostaId] ?? []), comentario],
    }));
    setAuthorProfiles((prev) => ({
      ...prev,
      [comentario.autor_id]: prev[comentario.autor_id] ?? { id: comentario.autor_id },
    }));
    toast.success('Comentário publicado.');
  }

  async function removerTopico() {
    if (!topico || excluindoTopico) return;

    if (!user || (topico.autor_id !== user.id && !admin)) {
      toast.error('Você não tem permissão para excluir este tópico.');
      return;
    }

    if (!window.confirm('Deseja excluir este tópico? Esta ação não pode ser desfeita.')) return;

    setExcluindoTopico(true);
    const ok = await deletarTopicoForum(topico.id);
    setExcluindoTopico(false);

    if (!ok) {
      toast.error('Não foi possível excluir o tópico.');
      return;
    }

    toast.success('Tópico excluído.');
    navigate('/forum');
  }

  async function removerResposta(respostaId: string) {
    if (!window.confirm('Deseja excluir esta resposta?')) return;
    const ok = await deletarRespostaForum(respostaId);
    if (!ok) {
      toast.error('Não foi possível excluir a resposta.');
      return;
    }
    toast.success('Resposta excluída.');
    await carregar();
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

  async function removerComentario(respostaId: string, comentarioId: string) {
    if (!window.confirm('Deseja excluir este comentário?')) return;
    const ok = await deletarComentarioForum(comentarioId);
    if (!ok) {
      toast.error('Não foi possível excluir o comentário.');
      return;
    }
    setComentarios((prev) => ({
      ...prev,
      [respostaId]: (prev[respostaId] ?? []).filter((comentario) => comentario.id !== comentarioId),
    }));
    toast.success('Comentário excluído.');
  }

  function iniciarEdicaoComentario(comentario: ForumComentario) {
    setEditandoComentarioId(comentario.id);
    setComentarioEditado(comentario.conteudo);
  }

  async function salvarComentarioEditado(respostaId: string, comentarioId: string) {
    if (!comentarioEditado.trim()) {
      toast.error('O comentário não pode ficar vazio.');
      return;
    }

    const atualizado = await atualizarComentarioForum(comentarioId, { conteudo: comentarioEditado.trim() });
    if (!atualizado) {
      toast.error('Não foi possível atualizar o comentário.');
      return;
    }

    setComentarios((prev) => ({
      ...prev,
      [respostaId]: (prev[respostaId] ?? []).map((comentario) =>
        comentario.id === comentarioId ? atualizado : comentario
      ),
    }));
    setEditandoComentarioId(null);
    setComentarioEditado('');
    toast.success('Comentário atualizado.');
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">Carregando tópico...</div>;
  }

  if (!topico) {
    return <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">{erro || 'Tópico não encontrado.'}</div>;
  }

  const topicoAuthorProfile = authorProfiles[topico.autor_id];
  const topicoAuthorName = nomeAutor(topico.autor_id, user?.id, topicoAuthorProfile);
  const pessoasParaMencoes = pessoasRelacionadas.length > 0
    ? pessoasRelacionadas
    : topico.pessoa_relacionada
      ? [topico.pessoa_relacionada]
      : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Tópico do fórum"
        subtitle={topico.titulo}
        icon={MessageCircle}
        actions={[
          { label: 'Voltar ao fórum', to: '/forum', icon: HEADER_ACTION_ICONS.ArrowLeft },
          ...(podeEditarTopico
            ? [
                { label: 'Editar', to: `/forum/topico/${topico.id}/editar`, icon: Edit },
                { label: excluindoTopico ? 'Excluindo...' : 'Excluir', onClick: removerTopico, icon: Trash2, variant: 'danger' as const, disabled: excluindoTopico },
              ]
            : []),
        ]}
      />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <Card className="min-w-0">
          <CardContent className="space-y-5 p-4 sm:p-5 md:p-6">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-wrap gap-2">
                {topico.categoria?.nome && <TopicBadge tone="purple">{topico.categoria.nome}</TopicBadge>}
                <TopicBadge tone="gray">{TOPICO_TIPO_LABELS[topico.tipo]}</TopicBadge>
                <TopicBadge tone={statusTone(topico.status)}>{TOPICO_STATUS_LABELS[topico.status]}</TopicBadge>
              </div>

              <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto sm:justify-end">
                <ForumTopicFavoriteButton topico={topico} className="h-9 w-9 border-gray-200" />
                {podeEditarTopico && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="min-w-0 flex-1 sm:flex-none"
                    onClick={removerTopico}
                    disabled={excluindoTopico}
                  >
                    <Trash2 className="h-4 w-4" />
                    {excluindoTopico ? 'Excluindo...' : 'Excluir'}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-3">
              <AuthorAvatar name={topicoAuthorName} src={topicoAuthorProfile?.avatar_url} />
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-bold text-gray-900 md:text-3xl">{topico.titulo}</h1>
                <p className="mt-2 break-words text-sm text-gray-500">
                  Por {topicoAuthorName} em {formatarData(topico.created_at)}
                </p>
              </div>
            </div>

            {topico.pessoa_relacionada && (
              <Card className="border-blue-100 bg-blue-50 shadow-none">
                <CardContent className="p-4">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <PersonAvatar pessoa={topico.pessoa_relacionada} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase text-blue-700">Pessoa relacionada</p>
                        <h2 className="break-words font-semibold text-gray-900">{topico.pessoa_relacionada.nome_completo}</h2>
                      </div>
                    </div>
                    <Link
                      to={`/pessoa/${topico.pessoa_relacionada.id}`}
                      className="inline-flex w-full items-center justify-center rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100 sm:w-auto"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <p className="whitespace-pre-wrap break-words leading-relaxed text-gray-700">
              <MentionedContent content={topico.conteudo} pessoas={pessoasParaMencoes} />
            </p>

            <ReactionBar
              alvoTipo="topico"
              alvoId={topico.id}
              resumo={resumoTopico}
              selectedReaction={minhaReacaoTopico}
              onChange={setResumoTopico}
              onSelectedChange={setMinhaReacaoTopico}
            />
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <h2 className="break-words text-xl font-bold text-gray-900">Respostas</h2>
            <span className="shrink-0 text-sm text-gray-500">{respostas.length} resposta(s)</span>
          </div>

          {respostas.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">Nenhuma resposta publicada ainda.</CardContent>
            </Card>
          ) : (
            respostas.map((resposta) => {
              const podeAlterarResposta = Boolean(user && (resposta.autor_id === user.id || admin));
              const respostaAuthorProfile = authorProfiles[resposta.autor_id];
              const respostaAuthorName = nomeAutor(resposta.autor_id, user?.id, respostaAuthorProfile);
              return (
                <Card
                  key={resposta.id}
                  className={`min-w-0 ${resposta.aceita_como_solucao ? 'border-emerald-300 bg-emerald-50/30' : ''}`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <AuthorAvatar name={respostaAuthorName} src={respostaAuthorProfile?.avatar_url} />
                        <div className="min-w-0">
                          <CardTitle className="break-words text-base">
                            {respostaAuthorName}
                            {resposta.aceita_como_solucao && (
                              <span className="ml-2 inline-flex items-center gap-1 text-sm text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                                Solução
                              </span>
                            )}
                          </CardTitle>
                          <p className="text-xs text-gray-500">{formatarData(resposta.created_at)}</p>
                        </div>
                      </div>

                      {podeAlterarResposta && (
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
                          <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => iniciarEdicaoResposta(resposta)}>
                            <Edit className="mr-1 h-4 w-4 shrink-0" />
                            Editar
                          </Button>
                          <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => removerResposta(resposta.id)}>
                            <Trash2 className="mr-1 h-4 w-4 shrink-0" />
                            Excluir
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 p-4 pt-2">
                    {editandoRespostaId === resposta.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={respostaEditada}
                          onChange={(event) => setRespostaEditada(event.target.value)}
                          className="min-h-28"
                        />
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          <Button type="button" size="sm" className="w-full sm:w-auto" onClick={() => salvarRespostaEditada(resposta.id)}>
                            Salvar resposta
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setEditandoRespostaId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-gray-700">{resposta.conteudo}</p>
                    )}

                    <ReactionBar
                      alvoTipo="resposta"
                      alvoId={resposta.id}
                      resumo={resumosRespostas[resposta.id] ?? RESUMO_VAZIO}
                      selectedReaction={minhasReacoesRespostas[resposta.id] ?? null}
                      onChange={(resumo) => setResumosRespostas((prev) => ({ ...prev, [resposta.id]: resumo }))}
                      onSelectedChange={(tipo) => setMinhasReacoesRespostas((prev) => ({ ...prev, [resposta.id]: tipo }))}
                    />

                    <div className="space-y-3 border-t border-gray-100 pt-4">
                      <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <MessageSquare className="h-4 w-4" />
                        Comentários
                      </h3>

                      {(comentarios[resposta.id] ?? []).map((comentario) => {
                        const podeAlterarComentario = Boolean(user && (comentario.autor_id === user.id || admin));
                        const comentarioAuthorProfile = authorProfiles[comentario.autor_id];
                        const comentarioAuthorName = nomeAutor(comentario.autor_id, user?.id, comentarioAuthorProfile);
                        return (
                          <div key={comentario.id} className="min-w-0 rounded-md bg-gray-50 p-3">
                            <div className="flex min-w-0 items-start justify-between gap-2">
                              <div className="flex min-w-0 items-start gap-3">
                                <AuthorAvatar name={comentarioAuthorName} src={comentarioAuthorProfile?.avatar_url} />
                                <div className="min-w-0">
                                  <p className="break-words text-xs font-semibold text-gray-700">
                                    {comentarioAuthorName}
                                  </p>
                                  {editandoComentarioId === comentario.id ? (
                                    <div className="mt-2 space-y-2">
                                      <Textarea
                                        value={comentarioEditado}
                                        onChange={(event) => setComentarioEditado(event.target.value)}
                                        className="min-h-16"
                                      />
                                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                        <Button
                                          type="button"
                                          size="sm"
                                          className="w-full sm:w-auto"
                                          onClick={() => salvarComentarioEditado(resposta.id, comentario.id)}
                                        >
                                          Salvar
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="w-full sm:w-auto"
                                          onClick={() => setEditandoComentarioId(null)}
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-700">{comentario.conteudo}</p>
                                  )}
                                </div>
                              </div>
                              {podeAlterarComentario && (
                                <div className="flex shrink-0 gap-1">
                                  <button
                                    type="button"
                                    onClick={() => iniciarEdicaoComentario(comentario)}
                                    className="text-gray-400 hover:text-blue-600"
                                    aria-label="Editar comentário"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removerComentario(resposta.id, comentario.id)}
                                    className="text-gray-400 hover:text-red-600"
                                    aria-label="Excluir comentário"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Textarea
                          value={comentarioTexto[resposta.id] ?? ''}
                          onChange={(event) =>
                            setComentarioTexto((prev) => ({ ...prev, [resposta.id]: event.target.value }))
                          }
                          placeholder="Escrever comentário"
                          className="min-h-16"
                        />
                        <Button type="button" onClick={() => comentar(resposta.id)} className="w-full sm:w-auto sm:self-start">
                          Comentar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </section>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Responder</CardTitle>
          </CardHeader>
          <CardContent>
            {topico.status === 'fechado' ? (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                Este tópico está fechado e não aceita novas respostas.
              </p>
            ) : (
              <form onSubmit={responder} className="space-y-3">
                <Textarea
                  value={respostaTexto}
                  onChange={(event) => setRespostaTexto(event.target.value)}
                  placeholder="Escreva sua resposta"
                  className="min-h-32"
                />
                <div className="flex flex-col sm:flex-row sm:justify-end">
                  <Button type="submit" disabled={enviandoResposta} className="w-full sm:w-auto">
                    <Send className="mr-2 h-4 w-4 shrink-0" />
                    {enviandoResposta ? 'Enviando...' : 'Publicar resposta'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
