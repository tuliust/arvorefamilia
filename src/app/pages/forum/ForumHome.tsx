import React, { useEffect, useMemo, useState } from 'react';
import { AppLink as Link } from '../../components/AppLink';
import { HEADER_ACTION_ICONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../../components/layout/MemberPageHeader';
import { BookOpen, CalendarDays, FileText, HelpCircle, ListFilter, MessageCircle, Plus, Search, SlidersHorizontal, Tags } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
  listarCategoriasForum,
  listarTopicosForum,
  ForumTopicoFiltros,
} from '../../services/forumService';
import { ForumEmptyState } from '../../components/forum/ForumEmptyState';
import { ForumCategoria, ForumTopico, ForumTopicoStatus, ForumTopicoTipo } from '../../types';

const TIPO_LABELS: Record<ForumTopicoTipo, string> = {
  pergunta: 'Pergunta',
  discussao: 'Discussão',
  aviso: 'Aviso',
  memoria: 'Memória',
  ajuda: 'Ajuda',
};

const STATUS_LABELS: Record<ForumTopicoStatus, string> = {
  aberto: 'Aberto',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
  oculto: 'Oculto',
};

function formatarData(valor?: string) {
  if (!valor) return '';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(valor));
}

export function ForumHome() {
  const [categorias, setCategorias] = useState<ForumCategoria[]>([]);
  const [topicos, setTopicos] = useState<ForumTopico[]>([]);
  const [busca, setBusca] = useState('');
  const [categoriaId, setCategoriaId] = useState('todas');
  const [tipo, setTipo] = useState<'todos' | ForumTopicoTipo>('todos');
  const [status, setStatus] = useState<'todos' | ForumTopicoStatus>('todos');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let mounted = true;

    async function carregar() {
      setLoading(true);
      setErro('');
      const [categoriasData, topicosData] = await Promise.all([
        listarCategoriasForum(),
        listarTopicosForum({ limite: 30 }),
      ]);

      if (!mounted) return;
      setCategorias(categoriasData);
      setTopicos(topicosData);
      if (categoriasData.length === 0 && topicosData.length === 0) {
        setErro('Não foi possível carregar dados do fórum ou ainda não há conteúdo disponível.');
      }
      setLoading(false);
    }

    carregar();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const timeout = window.setTimeout(async () => {
      const filtros: ForumTopicoFiltros = { limite: 30 };
      if (busca.trim()) filtros.busca = busca.trim();
      if (categoriaId !== 'todas') filtros.categoriaId = categoriaId;
      if (tipo !== 'todos') filtros.tipo = tipo;
      if (status !== 'todos') filtros.status = status;

      const data = await listarTopicosForum(filtros);
      if (mounted) setTopicos(data);
    }, 250);

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, [busca, categoriaId, tipo, status]);

  const categoriasMap = useMemo(
    () => new Map(categorias.map((categoria) => [categoria.id, categoria])),
    [categorias]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Fórum da Família"
        subtitle="Espaço para perguntas, histórias, documentos, memórias e ajuda com a árvore."
        icon={MessageCircle}
        actions={[
          { label: 'Árvore geral', to: '/', icon: HEADER_ACTION_ICONS.ArrowLeft },
          { label: 'Minha Árvore', to: '/minha-arvore', icon: HEADER_ACTION_ICONS.Home },
          { label: 'Calendário', to: '/calendario-familiar', icon: HEADER_ACTION_ICONS.CalendarDays },
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} space-y-6 py-6`}>
        <Card className="min-w-0">
          <CardContent className="grid grid-cols-3 gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px_180px_160px]">
            <label className="relative col-span-3 block min-w-0 md:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por termo"
                className="pl-9"
              />
            </label>

            <label className="relative block min-w-0">
              <Tags className="pointer-events-none absolute left-1/2 top-3 h-4 w-4 -translate-x-1/2 text-gray-500 md:hidden" />
              <select
                value={categoriaId}
                onChange={(event) => setCategoriaId(event.target.value)}
                className="h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-2 py-2 text-center text-sm text-transparent md:px-3 md:text-left md:text-gray-900"
                aria-label="Filtrar por categoria"
                title="Categorias"
              >
                <option value="todas">Todas as categorias</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="relative block min-w-0">
              <ListFilter className="pointer-events-none absolute left-1/2 top-3 h-4 w-4 -translate-x-1/2 text-gray-500 md:hidden" />
              <select
                value={tipo}
                onChange={(event) => setTipo(event.target.value as 'todos' | ForumTopicoTipo)}
                className="h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-2 py-2 text-center text-sm text-transparent md:px-3 md:text-left md:text-gray-900"
                aria-label="Filtrar por tipo"
                title="Tipos"
              >
                <option value="todos">Todos os tipos</option>
                {Object.entries(TIPO_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="relative block min-w-0">
              <SlidersHorizontal className="pointer-events-none absolute left-1/2 top-3 h-4 w-4 -translate-x-1/2 text-gray-500 md:hidden" />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as 'todos' | ForumTopicoStatus)}
                className="h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-2 py-2 text-center text-sm text-transparent md:px-3 md:text-left md:text-gray-900"
                aria-label="Filtrar por status"
                title="Status"
              >
                <option value="todos">Todos os status</option>
                {Object.entries(STATUS_LABELS)
                  .filter(([value]) => value !== 'oculto')
                  .map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
              </select>
            </label>
          </CardContent>
        </Card>

        {erro && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="break-words p-4 text-sm text-amber-800">{erro}</CardContent>
          </Card>
        )}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-3">
            <h2 className="break-words text-lg font-semibold text-gray-900">Categorias</h2>
            <div className="grid grid-cols-2 gap-3 lg:block lg:space-y-3">
              {categorias.map((categoria) => {
                const mobileMeta = getForumCategoryMobileMeta(categoria);
                const MobileIcon = mobileMeta.icon;

                return (
                  <button
                    key={categoria.id}
                    type="button"
                    onClick={() => setCategoriaId(categoria.id)}
                    className={`min-h-24 w-full rounded-lg border p-3 text-center transition-colors lg:min-h-0 lg:p-4 lg:text-left ${
                      categoriaId === categoria.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2 lg:block">
                      <MobileIcon className="h-5 w-5 text-blue-600 lg:hidden" />
                      <div className="break-words font-semibold text-gray-900">
                        <span className="lg:hidden">{mobileMeta.label}</span>
                        <span className="hidden lg:inline">{categoria.nome}</span>
                      </div>
                      {categoria.descricao && <p className="mt-1 hidden break-words text-sm text-gray-500 lg:block">{categoria.descricao}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="break-words text-lg font-semibold text-gray-900">Tópicos recentes</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => {
                  setBusca('');
                  setCategoriaId('todas');
                  setTipo('todos');
                  setStatus('todos');
                }}
              >
                Limpar filtros
              </Button>
            </div>

            {loading ? (
              <Card>
                <CardContent className="break-words p-6 text-center text-gray-500">Carregando fórum...</CardContent>
              </Card>
            ) : topicos.length === 0 ? (
              <ForumEmptyState
                titulo="Nenhum tópico encontrado"
                descricao="Não encontramos discussões para a combinação atual de termo, categoria, tipo e status."
                actionHref="/forum/novo"
                actionLabel="Criar tópico"
                actionIcon={Plus}
              />
            ) : (
              topicos.map((topico) => {
                const categoria = topico.categoria ?? categoriasMap.get(String(topico.categoria_id ?? ''));
                return (
                  <Link key={topico.id} to={`/forum/topico/${topico.id}`} className="block min-w-0">
                    <Card className="min-w-0 transition hover:border-blue-200 hover:shadow-md">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {categoria?.nome && <span className="break-words">{categoria.nome}</span>}
                          <span>{TIPO_LABELS[topico.tipo]}</span>
                          <span>{STATUS_LABELS[topico.status]}</span>
                          {topico.status === 'resolvido' && <span className="text-emerald-700">Resolvido</span>}
                          {topico.status === 'fechado' && <span className="text-gray-700">Fechado</span>}
                          {topico.fixado && <span className="text-blue-700">Fixado</span>}
                        </div>
                        <CardTitle className="break-words text-lg leading-snug">{topico.titulo}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="line-clamp-2 break-words text-sm text-gray-600">{topico.conteudo}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle className="h-3 w-3 shrink-0" />
                            {topico.visualizacoes ?? 0} visualizações
                          </span>
                          <span className="break-words">{formatarData(topico.created_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </main>

      <Link
        to="/forum/novo"
        className="fixed bottom-24 right-4 z-40 inline-flex h-12 max-w-[calc(100vw-2rem)] items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-lg transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:bottom-6 md:right-6"
        aria-label="Criar tópico"
      >
        <Plus className="h-5 w-5 shrink-0" />
        <span className="truncate">Criar tópico</span>
      </Link>
    </div>
  );
}

