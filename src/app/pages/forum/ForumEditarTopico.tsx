import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppLink as Link } from '../../components/AppLink';
import {
  BookOpen,
  HelpCircle,
  LifeBuoy,
  Megaphone,
  MessageCircle,
  Pencil,
  Save,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { HEADER_ACTION_ICONS, MemberPageHeader } from '../../components/layout/MemberPageHeader';
import { useAuth } from '../../contexts/AuthContext';
import {
  atualizarTopicoForum,
  listarCategoriasForum,
  obterTopicoForumPorId,
} from '../../services/forumService';
import { isAdminUser } from '../../services/permissionService';
import { ForumCategoria, ForumTopico, ForumTopicoTipo } from '../../types';

function criarSlug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getCategoryIcon(categoria: ForumCategoria): LucideIcon {
  const key = normalizeSearch(`${categoria.slug} ${categoria.nome} ${categoria.icone || ''}`);

  if (key.includes('duvida') || key.includes('pergunta') || key.includes('question')) {
    return HelpCircle;
  }

  if (key.includes('memoria') || key.includes('historia') || key.includes('documento')) {
    return BookOpen;
  }

  if (key.includes('aviso') || key.includes('comunicado') || key.includes('anuncio')) {
    return Megaphone;
  }

  if (key.includes('ajuda') || key.includes('apoio') || key.includes('suporte')) {
    return LifeBuoy;
  }

  if (key.includes('familia') || key.includes('pessoa')) {
    return UsersRound;
  }

  return MessageCircle;
}

export function ForumEditarTopico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topico, setTopico] = useState<ForumTopico | null>(null);
  const [categorias, setCategorias] = useState<ForumCategoria[]>([]);
  const [titulo, setTitulo] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [tipo, setTipo] = useState<ForumTopicoTipo>('discussao');
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [admin, setAdmin] = useState(false);

  const podeEditar = useMemo(
    () => Boolean(user && topico && (topico.autor_id === user.id || admin)),
    [user, topico, admin]
  );

  useEffect(() => {
    let mounted = true;

    async function carregarPermissaoAdmin() {
      if (!user) {
        setAdmin(false);
        return;
      }

      const result = await isAdminUser(user);
      if (mounted) setAdmin(result.isAdmin);
    }

    carregarPermissaoAdmin();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    let mounted = true;

    async function carregar() {
      if (!id) return;
      setLoading(true);
      const [topicoData, categoriasData] = await Promise.all([
        obterTopicoForumPorId(id),
        listarCategoriasForum(),
      ]);

      if (!mounted) return;
      setCategorias(categoriasData);
      setTopico(topicoData ?? null);

      if (topicoData) {
        setTitulo(topicoData.titulo);
        setCategoriaId(topicoData.categoria_id ?? '');
        setTipo(topicoData.tipo);
        setConteudo(topicoData.conteudo);
      }

      setLoading(false);
    }

    carregar();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id || !podeEditar) {
      toast.error('Você não tem permissão para editar este tópico.');
      return;
    }

    if (!titulo.trim() || !conteudo.trim()) {
      toast.error('Informe título e conteúdo.');
      return;
    }

    setSalvando(true);
    const atualizado = await atualizarTopicoForum(id, {
      categoria_id: categoriaId || null,
      titulo: titulo.trim(),
      slug: criarSlug(titulo) || topico?.slug,
      conteudo: conteudo.trim(),
      tipo,
      pessoa_relacionada_id: topico?.pessoa_relacionada_id ?? null,
    });
    setSalvando(false);

    if (!atualizado) {
      toast.error('Não foi possível salvar o tópico.');
      return;
    }

    toast.success('Tópico atualizado.');
    navigate(`/forum/topico/${id}`);
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">Carregando tópico...</div>;
  }

  if (!topico) {
    return <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">Tópico não encontrado.</div>;
  }

  if (!podeEditar) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <Card className="mx-auto max-w-xl">
          <CardContent className="p-8 text-center">
            <p className="break-words text-gray-600">Você não tem permissão para editar este tópico.</p>
            <Link to={`/forum/topico/${topico.id}`} className="mt-4 inline-flex text-sm font-medium text-blue-600 hover:underline">
              Voltar ao tópico
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Editar tópico"
        subtitle="Atualize as informações do tópico."
        icon={Pencil}
        actions={[
          { label: 'Voltar', to: `/forum/topico/${topico.id}`, icon: HEADER_ACTION_ICONS.ArrowLeft },
        ]}
      />

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="break-words">Dados do tópico</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={salvar} className="space-y-5">
              <div className="min-w-0 space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="titulo">Título</label>
                <Input id="titulo" value={titulo} onChange={(event) => setTitulo(event.target.value)} />
              </div>

              <div className="min-w-0 space-y-3">
                <span className="block text-sm font-medium text-gray-700" id="categoria-label">
                  Categoria
                </span>
                <div
                  aria-labelledby="categoria-label"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                  role="group"
                >
                  {categorias.map((categoria) => {
                    const selected = categoriaId === categoria.id;
                    const Icon = getCategoryIcon(categoria);

                    return (
                      <button
                        key={categoria.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setCategoriaId(categoria.id)}
                        className={[
                          'flex min-h-28 min-w-0 flex-col items-center justify-between rounded-2xl border px-3 py-4 text-center text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                          selected
                            ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-md'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-gray-50',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'flex h-10 w-10 items-center justify-center rounded-full',
                            selected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600',
                          ].join(' ')}
                          aria-hidden="true"
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="mt-3 line-clamp-2 min-w-0 break-words font-medium leading-snug">
                          {categoria.nome}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="conteudo">Conteúdo</label>
                <Textarea
                  id="conteudo"
                  value={conteudo}
                  onChange={(event) => setConteudo(event.target.value)}
                  className="min-h-48"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end">
                <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4 shrink-0" />
                  {salvando ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
