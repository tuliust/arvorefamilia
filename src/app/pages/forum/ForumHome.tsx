import React, { useEffect, useMemo, useState } from 'react';
import { AppLink as Link } from '../../components/AppLink';
import { HEADER_ACTION_ICONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../../components/layout/MemberPageHeader';
import { BookOpen, CalendarDays, Check, FileText, Filter, HelpCircle, MessageCircle, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  listarCategoriasForum,
  listarTopicosForum,
  ForumTopicoFiltros,
} from '../../services/forumService';
import { ForumEmptyState } from '../../components/forum/ForumEmptyState';
import { ForumTopicFavoriteButton } from '../../components/favorites/ForumTopicFavoriteButton';
import { ForumCategoria, ForumTopico } from '../../types';

type ForumCategoryGroupKey = 'duvidas' | 'memorias' | 'documentos' | 'eventos';
type ForumCategoryFilterValue = 'todas' | ForumCategoryGroupKey;

type ForumCategoryGroupDefinition = {
  key: ForumCategoryGroupKey;
  label: string;
  description: string;
  icon: typeof HelpCircle;
  matches: string[];
};

type ForumCategoryGroup = ForumCategoryGroupDefinition & {
  ids: string[];
};

const FORUM_CATEGORY_GROUPS: ForumCategoryGroupDefinition[] = [
  {
    key: 'duvidas',
    label: 'Dúvidas',
    description: 'Perguntas, ajuda com a árvore e pedidos de orientação familiar.',
    icon: HelpCircle,
    matches: ['duvida', 'ajuda'],
  },
  {
    key: 'memorias',
    label: 'Histórias',
    description: 'Histórias, lembranças, relatos e registros afetivos da família.',
    icon: BookOpen,
    matches: ['memoria', 'historia'],
  },
  {
    key: 'documentos',
    label: 'Documentos',
    description: 'Fotos, certidões, achados e pedidos sobre registros familiares.',
    icon: FileText,
    matches: ['document', 'foto'],
  },
  {
    key: 'eventos',
    label: 'Eventos',
    description: 'Aniversários, encontros, viagens e eventos familiares.',
    icon: CalendarDays,
    matches: ['evento', 'encontro'],
  },
];

const TOPIC_BADGE_CLASS = 'inline-flex max-w-full items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold leading-none text-blue-800';

function normalizeForumCategoryText(value?: string | null) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getForumCategoryGroupKey(categoria?: ForumCategoria | null): ForumCategoryGroupKey | undefined {
  if (!categoria) return undefined;

  const normalizedText = normalizeForumCategoryText(`${categoria.nome} ${categoria.slug} ${categoria.descricao || ''}`);
  return FORUM_CATEGORY_GROUPS.find((group) => group.matches.some((match) => normalizedText.includes(match)))?.key;
}

function buildForumCategoryGroups(categorias: ForumCategoria[]): ForumCategoryGroup[] {
  return FORUM_CATEGORY_GROUPS.map((group) => ({
    ...group,
    ids: categorias
      .filter((categoria) => getForumCategoryGroupKey(categoria) === group.key)
      .map((categoria) => categoria.id),
  }));
}

function sortForumTopics(topicos: ForumTopico[]) {
  return [...topicos].sort((a, b) => {
    const fixadoDiff = Number(Boolean(b.fixado)) - Number(Boolean(a.fixado));
    if (fixadoDiff !== 0) return fixadoDiff;

    const destacadoDiff = Number(Boolean(b.destacado)) - Number(Boolean(a.destacado));
    if (destacadoDiff !== 0) return destacadoDiff;

    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
}

function isSameCalendarDay(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();
}

function formatarHora(valor: Date) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(valor);
}

function formatarDataTopico(valor?: string) {
  if (!valor) return '';

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';

  const agora = new Date();
  const diffMs = agora.getTime() - data.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin >= 0 && diffMin < 60) {
    return `Há ${Math.max(1, diffMin)} min`;
  }

  if (isSameCalendarDay(data, agora)) {
    return `Hoje, às ${formatarHora(data)}`;
  }

  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);
  if (isSameCalendarDay(data, ontem)) {
    return `Ontem, às ${formatarHora(data)}`;
  }

  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(data);
}

export function ForumHome() {
  const [categorias, setCategorias] = useState<ForumCategoria[]>([]);
  const [topicos, setTopicos] = useState<ForumTopico[]>([]);
  const [busca, setBusca] = useState('');
  const [categoriaId, setCategoriaId] = useState<ForumCategoryFilterValue>('todas');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
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

  const categoriasMap = useMemo(
    () => new Map(categorias.map((categoria) => [categoria.id, categoria])),
    [categorias]
  );

  const gruposCategorias = useMemo(() => buildForumCategoryGroups(categorias), [categorias]);
  const activeCategoryLabel = categoriaId === 'todas'
    ? 'Todas'
    : gruposCategorias.find((grupo) => grupo.key === categoriaId)?.label ?? 'Todas';

  useEffect(() => {
    let mounted = true;
    const timeout = window.setTimeout(async () => {
      const filtrosBase: ForumTopicoFiltros = { limite: 30 };
      if (busca.trim()) filtrosBase.busca = busca.trim();

      if (categoriaId === 'todas') {
        const data = await listarTopicosForum(filtrosBase);
        if (mounted) setTopicos(data);
        return;
      }

      const grupo = gruposCategorias.find((item) => item.key === categoriaId);
      const categoriaIds = grupo?.ids ?? [];

      if (categoriaIds.length === 0) {
        if (mounted) setTopicos([]);
        return;
      }

      const resultados = await Promise.all(
        categoriaIds.map((id) => listarTopicosForum({ ...filtrosBase, categoriaId: id }))
      );
      const topicosUnicos = Array.from(
        new Map(resultados.flat().map((topico) => [topico.id, topico])).values()
      );
      const topicosOrdenados = sortForumTopics(topicosUnicos).slice(0, 30);

      if (mounted) setTopicos(topicosOrdenados);
    }, 250);

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, [busca, categoriaId, gruposCategorias]);

  const renderCategorias = (variant: 'mobile' | 'desktop') => (
    <div
      className={`min-w-0 ${variant === 'mobile' ? 'lg:hidden' : 'hidden space-y-3 lg:block'}`}
      data-forum-mobile-categories={variant === 'mobile' ? 'true' : undefined}
    >
      {variant === 'desktop' && (
        <h2 className="break-words text-lg font-semibold text-gray-900">Categorias</h2>
      )}

      <div className={variant === 'mobile' ? 'grid grid-cols-4 gap-1.5' : 'space-y-3'}>
        {gruposCategorias.map((grupo) => {
          const CategoryIcon = grupo.icon;

          return (
            <button
              key={grupo.key}
              type="button"
              onClick={() => setCategoriaId(grupo.key)}
              className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-1.5 text-center text-[10.5px] font-semibold leading-tight transition-colors sm:text-xs lg:min-h-0 lg:w-full lg:items-start lg:p-4 lg:text-left lg:text-sm ${
                categoriaId === grupo.key
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
              }`}
            >
              <CategoryIcon className="h-3.5 w-3.5 shrink-0 text-blue-600 lg:hidden" />
              <span className="min-w-0 max-w-full truncate lg:whitespace-normal">{grupo.label}</span>
              <p className="mt-1 hidden break-words text-sm font-normal text-gray-500 lg:block">{grupo.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const filterOptions: Array<{ value: ForumCategoryFilterValue; label: string }> = [
    { value: 'todas', label: 'Todas' },
    ...gruposCategorias.map((grupo) => ({ value: grupo.key, label: grupo.label })),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Fórum da Família"
        subtitle="Espaço para dúvidas, memórias, documentos e eventos da família."
        icon={MessageCircle}
        actions={[
          { label: 'Árvore geral', to: '/', icon: HEADER_ACTION_ICONS.ArrowLeft },
          { label: 'Mapa Familiar', to: '/mapa-familiar', icon: HEADER_ACTION_ICONS.Home },
          { label: 'Calendário', to: '/calendario-familiar', icon: HEADER_ACTION_ICONS.CalendarDays },
        ]}
      />

      <main data-forum-page="true" className={`${PAGE_CONTAINER_CLASS} space-y-6 py-6`}>
        <section className="relative flex min-w-0 w-full max-w-none items-center gap-1.5 sm:gap-2 lg:max-w-3xl" aria-label="Busca e filtros do fórum">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400 sm:left-4 sm:h-5 sm:w-5" />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Pesquise aqui..."
              className="h-12 w-full rounded-2xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-14 sm:pl-12 sm:pr-4 sm:text-sm"
            />
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setFilterMenuOpen((current) => !current)}
              className={[
                'inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:h-14 sm:w-14',
                categoriaId !== 'todas' ? 'border-blue-200 text-blue-700 ring-1 ring-blue-100' : 'border-gray-200',
              ].join(' ')}
              aria-expanded={filterMenuOpen}
              aria-haspopup="menu"
              aria-label={`Filtrar tópicos. Filtro atual: ${activeCategoryLabel}`}
              title="Filtrar tópicos"
            >
              <Filter className="h-5 w-5" />
            </button>

            {filterMenuOpen && (
              <div
                className="absolute right-0 z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 bg-white p-2 shadow-lg"
                role="menu"
              >
                {filterOptions.map((option) => {
                  const isActive = categoriaId === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setCategoriaId(option.value);
                        setFilterMenuOpen(false);
                      }}
                      className={[
                        'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition',
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50',
                      ].join(' ')}
                      role="menuitemradio"
                      aria-checked={isActive}
                    >
                      <span>{option.label}</span>
                      {isActive && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            to="/forum/novo"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:h-14 sm:px-4 sm:text-sm"
            aria-label="Criar novo tópico"
          >
            <Plus className="hidden h-4 w-4 shrink-0 sm:block" />
            <span className="whitespace-nowrap">Criar novo</span>
          </Link>
        </section>

        {renderCategorias('mobile')}

        {erro && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="break-words p-4 text-sm text-amber-800">{erro}</CardContent>
          </Card>
        )}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
          {renderCategorias('desktop')}

          <div className="min-w-0 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="hidden break-words text-lg font-semibold text-gray-900 sm:block">Tópicos recentes</h2>
            </div>

            {loading ? (
              <Card>
                <CardContent className="break-words p-6 text-center text-gray-500">Carregando fórum...</CardContent>
              </Card>
            ) : topicos.length === 0 ? (
              <ForumEmptyState
                titulo="Nenhum tópico encontrado"
                descricao="Não encontramos discussões para a combinação atual de termo e categoria."
                actionHref="/forum/novo"
                actionLabel="Criar tópico"
                actionIcon={Plus}
              />
            ) : (
              topicos.map((topico) => {
                const categoria = topico.categoria ?? categoriasMap.get(String(topico.categoria_id ?? ''));
                const categoriaGrupoKey = getForumCategoryGroupKey(categoria);
                const categoriaGrupo = gruposCategorias.find((grupo) => grupo.key === categoriaGrupoKey);

                return (
                  <Card key={topico.id} className="min-w-0 transition hover:border-blue-200 hover:shadow-md">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <Link to={`/forum/topico/${topico.id}`} className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {categoriaGrupo?.label && <span className={TOPIC_BADGE_CLASS}>{categoriaGrupo.label}</span>}
                            {topico.fixado && <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold leading-none text-blue-800">Fixado</span>}
                          </div>
                          <CardTitle className="mt-2 break-words text-lg leading-snug">{topico.titulo}</CardTitle>
                        </Link>

                        <ForumTopicFavoriteButton topico={topico} className="h-8 w-8 border-gray-200" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Link to={`/forum/topico/${topico.id}`} className="block min-w-0">
                        <p className="line-clamp-2 break-words text-sm text-gray-600">{topico.conteudo}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle className="h-3 w-3 shrink-0" />
                            {topico.visualizacoes ?? 0} visualizações
                          </span>
                          <span className="break-words">{formatarDataTopico(topico.created_at)}</span>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
