import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppLink as Link } from '../../components/AppLink';
import {
  CheckCircle2,
  Edit,
  EyeOff,
  Heart,
  MessageCircle,
  MessageSquare,
  UserRound,
  Send,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { HEADER_ACTION_ICONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { useAuth } from '../../contexts/AuthContext';
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
  listarRespostasDoTopico,
  marcarRespostaComoSolucao,
  ocultarComentarioForum,
  ocultarRespostaForum,
  ocultarTopicoForum,
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
} from '../../types';

const REACAO_LABELS: Record<ForumReacaoTipo, string> = {
  curtir: 'Curtir',
  apoiar: 'Apoiar',
  lembrar: 'Lembrar',
  celebrar: 'Celebrar',
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

function nomeAutor(autorId: string, userId?: string) {
  if (autorId === userId) return 'Você';
  return `Familiar ${autorId.slice(0, 8)}`;
}

function ReactionBar({
  alvoTipo,
  alvoId,
  resumo,
  onChange,
}: {
  alvoTipo: ForumAlvoTipo;
  alvoId: string;
  resumo: ResumoReacoesForum;
  onChange: (resumo: ResumoReacoesForum) => void;
}) {
  async function reagir(tipo: ForumReacaoTipo) {
    const reacao = await reagirAoConteudo(alvoTipo, alvoId, tipo);
    if (!reacao) {
      toast.error('Não foi possível registrar a reação.');
      return;
    }

    const atualizado = await obterResumoReacoes(alvoTipo, alvoId);
    onChange(atualizado);
  }

  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      {(Object.keys(REACAO_LABELS) as ForumReacaoTipo[]).map((tipo) => (
        <Button key={tipo} type="button" variant="outline" size="sm" className="min-w-0" onClick={() => reagir(tipo)}>
          <Heart className="mr-1 h-3 w-3 shrink-0" />
          {REACAO_LABELS[tipo]} {resumo[tipo] ? `(${resumo[tipo]})` : ''}
        </Button>
      ))}
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
  const [resumoTopico, setResumoTopico] = useState<ResumoReacoesForum>(RESUMO_VAZIO);
  const [resumosRespostas, setResumosRespostas] = useState<Record<string, ResumoReacoesForum>>({});
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

  const podeEditarTopico = useMemo(
    () => Boolean(user && topico && (topico.autor_id === user.id || admin)),
    [user, topico, admin]
  );
  const podeMarcarSolucao = useMemo(
    () => Boolean(user && topico && (topico.autor_id === user.id || admin)),
    [user, topico, admin]
  );

  async function carregar() {
    if (!id) return;
    setLoading(true);
    setErro('');
    const topicoData = await obterTopicoForumPorId(id);
    if (!topicoData) {
      setTopico(null);
      setRespostas([]);
      setErro('Não foi possível carregar este tópico. Ele pode ter sido removido ou ocultado.');
      setLoading(false);
      return;
    }
    const respostasData = await listarRespostasDoTopico(id);
    const [comentariosData, resumoTopicoData, resumosData] = await Promise.all([
      Promise.all(respostasData.map(async (resposta) => [resposta.id, await listarComentariosDaResposta(resposta.id)] as const)),
      obterResumoReacoes('topico', id),
      Promise.all(respostasData.map(async (resposta) => [resposta.id, await obterResumoReacoes('resposta', resposta.id)] as const)),
    ]);

    setTopico(topicoData);
    setRespostas(respostasData);
    setComentarios(Object.fromEntries(comentariosData));
    setResumoTopico(resumoTopicoData);
    setResumosRespostas(Object.fromEntries(resumosData));
    setLoading(false);
  }

  useEffect(() => {
    carregar();
    if (id) incrementarVisualizacaoTopico(id);
  }, [id]);

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
    toast.success('Comentário publicado.');
  }

  async function removerTopico() {
    if (!topico || !window.confirm('Deseja excluir este tópico?')) return;
    const ok = await deletarTopicoForum(topico.id);
    if (!ok) {
      toast.error('Não foi possível excluir o tópico.');
      return;
    }
    toast.success('Tópico excluído.');
    navigate('/forum');
  }

  async function ocultarTopico() {
    if (!topico || !window.confirm('Deseja ocultar este tópico para os membros?')) return;
    const atualizado = await ocultarTopicoForum(topico.id);
    if (!atualizado) {
      toast.error('Não foi possível ocultar o tópico.');
      return;
    }
    toast.success('Tópico ocultado.');
    setTopico(atualizado);
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

  async function ocultarResposta(respostaId: string) {
    if (!window.confirm('Deseja ocultar esta resposta para os membros?')) return;
    const ok = await ocultarRespostaForum(respostaId);
    if (!ok) {
      toast.error('Não foi possível ocultar a resposta.');
      return;
    }
    toast.success('Resposta ocultada.');
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

  async function ocultarComentario(respostaId: string, comentarioId: string) {
    if (!window.confirm('Deseja ocultar este comentário para os membros?')) return;
    const ok = await ocultarComentarioForum(comentarioId);
    if (!ok) {
      toast.error('Não foi possível ocultar o comentário.');
      return;
    }
    setComentarios((prev) => ({
      ...prev,
      [respostaId]: (prev[respostaId] ?? []).filter((comentario) => comentario.id !== comentarioId),
    }));
    toast.success('Comentário ocultado.');
  }

  async function marcarSolucao(respostaId: string) {
    if (!topico) return;
    const ok = await marcarRespostaComoSolucao(topico.id, respostaId);
    if (!ok) {
      toast.error('Não foi possível marcar a solução.');
      return;
    }
    toast.success('Resposta marcada como solução.');
    await carregar();
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">Carregando tópico...</div>;
  }

  if (!topico) {
    return <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">{erro || 'Tópico não encontrado.'}</div>;
  }

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
                { label: 'Excluir', onClick: removerTopico, icon: Trash2, variant: 'danger' as const },
                ...(admin && topico.status !== 'oculto'
                  ? [{ label: 'Ocultar', onClick: ocultarTopico, icon: EyeOff }]
                  : []),
              ]
            : []),
        ]}
      />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <Card className="min-w-0">
          <CardContent className="space-y-5 p-4 sm:p-5 md:p-6">
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              {topico.categoria?.nome && <span className="break-words">{topico.categoria.nome}</span>}
              <span>{TOPICO_TIPO_LABELS[topico.tipo]}</span>
              <span>{TOPICO_STATUS_LABELS[topico.status]}</span>
            </div>

            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold text-gray-900 md:text-3xl">{topico.titulo}</h1>
              <p className="mt-2 break-words text-sm text-gray-500">
                Por {nomeAutor(topico.autor_id, user?.id)} em {formatarData(topico.created_at)}
              </p>
            </div>

            {topico.pessoa_relacionada && (
              <Card className="border-blue-100 bg-blue-50 shadow-none">
                <CardContent className="p-4">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
                        <UserRound className="h-5 w-5" />
                      </span>
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

            <p className="whitespace-pre-wrap break-words leading-relaxed text-gray-700">{topico.conteudo}</p>

            <ReactionBar
              alvoTipo="topico"
              alvoId={topico.id}
              resumo={resumoTopico}
              onChange={setResumoTopico}
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
              return (
                <Card
                  key={resposta.id}
                  className={`min-w-0 ${resposta.aceita_como_solucao ? 'border-emerald-300 bg-emerald-50/30' : ''}`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <CardTitle className="text-base">
                          {nomeAutor(resposta.autor_id, user?.id)}
                          {resposta.aceita_como_solucao && (
                            <span className="ml-2 inline-flex items-center gap-1 text-sm text-emerald-700">
                              <CheckCircle2 className="w-4 h-4" />
                              Solução
                            </span>
                          )}
                        </CardTitle>
                        <p className="text-xs text-gray-500">{formatarData(resposta.created_at)}</p>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
                        {podeMarcarSolucao && !resposta.aceita_como_solucao && (
                          <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => marcarSolucao(resposta.id)}>
                            Marcar solução
                          </Button>
                        )}
                        {podeAlterarResposta && (
                          <>
                            <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => iniciarEdicaoResposta(resposta)}>
                              <Edit className="mr-1 h-4 w-4 shrink-0" />
                              Editar
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => removerResposta(resposta.id)}>
                              <Trash2 className="mr-1 h-4 w-4 shrink-0" />
                              Excluir
                            </Button>
                          </>
                        )}
                        {admin && resposta.status !== 'oculto' && (
                          <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => ocultarResposta(resposta.id)}>
                            <EyeOff className="mr-1 h-4 w-4 shrink-0" />
                            Ocultar
                          </Button>
                        )}
                      </div>
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
                      onChange={(resumo) => setResumosRespostas((prev) => ({ ...prev, [resposta.id]: resumo }))}
                    />

                    <div className="space-y-3 border-t border-gray-100 pt-4">
                      <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <MessageSquare className="w-4 h-4" />
                        Comentários
                      </h3>

                      {(comentarios[resposta.id] ?? []).map((comentario) => {
                        const podeAlterarComentario = Boolean(user && (comentario.autor_id === user.id || admin));
                        return (
                          <div key={comentario.id} className="min-w-0 rounded-md bg-gray-50 p-3">
                            <div className="flex min-w-0 items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-700">
                                  {nomeAutor(comentario.autor_id, user?.id)}
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
                              {podeAlterarComentario && (
                                <div className="flex shrink-0 gap-1">
                                  <button
                                    type="button"
                                    onClick={() => iniciarEdicaoComentario(comentario)}
                                    className="text-gray-400 hover:text-blue-600"
                                    aria-label="Editar comentário"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removerComentario(resposta.id, comentario.id)}
                                    className="text-gray-400 hover:text-red-600"
                                    aria-label="Excluir comentário"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  {admin && comentario.status !== 'oculto' && (
                                    <button
                                      type="button"
                                      onClick={() => ocultarComentario(resposta.id, comentario.id)}
                                      className="text-gray-400 hover:text-amber-700"
                                      aria-label="Ocultar comentário"
                                    >
                                      <EyeOff className="w-4 h-4" />
                                    </button>
                                  )}
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
