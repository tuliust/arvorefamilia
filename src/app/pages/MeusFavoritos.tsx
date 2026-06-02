import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppLink as Link } from '../components/AppLink';
import { HEADER_ACTION_ICONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../components/layout/MemberPageHeader';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Link as LinkIcon,
  MessageCircle,
  Search,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { FavoriteEntityType, UserFavorite } from '../types';
import { listFavorites, removeFavoriteById } from '../services/favoritesService';

const FAVORITE_TYPE_LABELS: Record<FavoriteEntityType, string> = {
  person: 'Pessoa',
  historical_file: 'Arquivo histórico',
  relationship: 'Relacionamento',
  forum_topic: 'Tópico do fórum',
  family_event: 'Evento familiar',
  person_event: 'Evento pessoal',
  page: 'Página',
  timeline_item: 'Item da timeline',
  story: 'História',
};

const FILTERS: Array<{ value: 'all' | FavoriteEntityType; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'person', label: 'Pessoas' },
  { value: 'historical_file', label: 'Arquivos históricos' },
  { value: 'relationship', label: 'Relacionamentos' },
  { value: 'forum_topic', label: 'Fórum' },
  { value: 'family_event', label: 'Eventos familiares' },
  { value: 'person_event', label: 'Eventos pessoais' },
  { value: 'page', label: 'Páginas' },
  { value: 'timeline_item', label: 'Timeline' },
  { value: 'story', label: 'Histórias' },
];

function getFavoriteIcon(entityType: FavoriteEntityType) {
  if (entityType === 'person') return <User className="h-4 w-4 shrink-0 text-gray-400" />;
  if (entityType === 'historical_file') return <FileText className="h-4 w-4 shrink-0 text-gray-400" />;
  if (entityType === 'relationship') return <Users className="h-4 w-4 shrink-0 text-gray-400" />;
  if (entityType === 'forum_topic') return <MessageCircle className="h-4 w-4 shrink-0 text-gray-400" />;
  if (entityType === 'family_event' || entityType === 'person_event') {
    return <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" />;
  }

  return <LinkIcon className="h-4 w-4 shrink-0 text-gray-400" />;
}

function formatDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function isInternalHref(href?: string | null) {
  return Boolean(href && href.startsWith('/'));
}

export function MeusFavoritos() {
  const [favoritos, setFavoritos] = useState<UserFavorite[]>([]);
  const [filtro, setFiltro] = useState<'all' | FavoriteEntityType>('all');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const filtersScrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollFilters = (direction: 'left' | 'right') => {
    filtersScrollerRef.current?.scrollBy({
      left: direction === 'left' ? -220 : 220,
      behavior: 'smooth',
    });
  };

  const recarregar = async () => {
    setLoading(true);
    setErro(null);

    try {
      const dados = await listFavorites();
      setFavoritos(dados);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setErro('Não foi possível carregar seus favoritos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    recarregar();
  }, []);

  const favoritosFiltrados = useMemo(() => {
    const search = busca.trim().toLowerCase();

    return favoritos.filter((item) => {
      const matchesType = filtro === 'all' || item.entity_type === filtro;
      const matchesSearch =
        !search ||
        [item.label, item.description ?? '', FAVORITE_TYPE_LABELS[item.entity_type]]
          .join(' ')
          .toLowerCase()
          .includes(search);

      return matchesType && matchesSearch;
    });
  }, [busca, favoritos, filtro]);

  const handleRemove = async (favorito: UserFavorite) => {
    setRemovingId(favorito.id);

    try {
      await removeFavoriteById(favorito.id);
      setFavoritos((current) => current.filter((item) => item.id !== favorito.id));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      setErro('Não foi possível remover o favorito.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Meus Favoritos"
        subtitle="Conteúdos salvos para consultar depois"
        actions={[
          { label: 'Árvore geral', to: '/', icon: HEADER_ACTION_ICONS.ArrowLeft },
          { label: 'Minha Árvore', to: '/minha-arvore', icon: HEADER_ACTION_ICONS.Home },
          { label: 'Calendário', to: '/calendario-familiar', icon: HEADER_ACTION_ICONS.CalendarDays },
          { label: 'Notificações', to: '/notificacoes', icon: HEADER_ACTION_ICONS.Bell },
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} space-y-6 py-6`}>
        <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar favoritos..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollFilters('left')}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm sm:hidden"
                aria-label="Ver filtros anteriores"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div
                ref={filtersScrollerRef}
                className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible sm:pb-0"
              >
                {FILTERS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFiltro(item.value)}
                    className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                      filtro === item.value
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollFilters('right')}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm sm:hidden"
                aria-label="Ver próximos filtros"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {erro && (
          <div className="break-words rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        {loading ? (
          <div className="break-words rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
            Carregando favoritos...
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {favoritosFiltrados.length === 0 ? (
              <div className="break-words rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm md:col-span-2 xl:col-span-3">
                Nenhum favorito encontrado.
              </div>
            ) : (
              favoritosFiltrados.map((favorito) => {
                const createdAt = formatDate(favorito.created_at);

                return (
                  <div
                    key={favorito.id}
                    className="flex min-w-0 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="mb-3 inline-flex max-w-full items-center gap-1 rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
                          <Heart className="h-3 w-3 shrink-0 fill-current" />
                          <span className="truncate">{FAVORITE_TYPE_LABELS[favorito.entity_type]}</span>
                        </span>

                        <h2 className="break-words text-lg font-bold text-gray-900">{favorito.label}</h2>

                        {favorito.description && (
                          <p className="mt-1 line-clamp-3 break-words text-sm text-gray-500">{favorito.description}</p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(favorito)}
                        disabled={removingId === favorito.id}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Remover dos favoritos"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="min-w-0 space-y-2 text-sm text-gray-600">
                      <div className="flex min-w-0 items-center gap-2">
                        {getFavoriteIcon(favorito.entity_type)}
                        <span className="min-w-0 break-words">{FAVORITE_TYPE_LABELS[favorito.entity_type]}</span>
                      </div>

                      {createdAt && <p className="break-words text-xs text-gray-400">Salvo em {createdAt}</p>}
                    </div>

                    <div className="mt-auto min-w-0">
                      {isInternalHref(favorito.href) ? (
                        <Link
                          to={favorito.href ?? '/'}
                          className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Abrir conteúdo
                        </Link>
                      ) : favorito.href ? (
                        <a
                          href={favorito.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Abrir conteúdo
                        </a>
                      ) : (
                        <span className="inline-flex w-full items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-500">
                          Link indisponível
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        )}
      </main>
    </div>
  );
}
