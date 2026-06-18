import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AppLink as Link } from '../AppLink';
import { UserProfileMenu } from './UserProfileMenu';
import { useAuth } from '../../contexts/AuthContext';
import {
  contarNotificacoesNaoLidasSupabase,
  listarNotificacoesSupabase,
  marcarNotificacaoSupabaseComoLida,
  removerNotificacaoSupabase,
} from '../../services/userEngagementService';
import { NotificacaoUsuario } from '../../types';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  Home,
  LogOut,
  MessageCircle,
  Network,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';

export type HeaderAction = {
  label: string;
  to?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  /**
   * Controla quando o texto do botão aparece em ações com ícone.
   *
   * - always: texto sempre visível.
   * - lg: texto visível a partir de lg.
   * - xl: texto visível a partir de xl.
   * - never: sempre icon-only visualmente, mantendo label para leitores de tela.
   *
   * Padrão:
   * - primary: lg.
   * - demais variantes: xl.
   */
  responsiveLabel?: 'always' | 'lg' | 'xl' | 'never';
  disabled?: boolean;
  badgeCount?: number;
};

interface MemberPageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: HeaderAction[];
  customActions?: React.ReactNode;
  mobileCustomActions?: React.ReactNode;
  hideFavoriteButton?: boolean;
  hideMobileHeaderActions?: boolean;
  className?: string;
}

interface HeaderNotificationsMenuProps {
  userId?: string;
  unreadNotificationsCount: number;
  onNotificationsUpdated: () => void | Promise<void>;
}

export const PAGE_CONTAINER_CLASS = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

const baseActionClass =
  'inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const defaultActionClass =
  `${baseActionClass} border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50`;

const primaryActionClass =
  `${baseActionClass} border border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700`;

const dangerActionClass =
  `${baseActionClass} border border-red-200 bg-white text-red-600 shadow-sm hover:bg-red-50 focus-visible:ring-red-500`;

const ghostActionClass =
  `${baseActionClass} border border-transparent bg-white text-gray-700 hover:bg-gray-50`;

const memberToolbarButtonClassName = 'hidden h-9 shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';
const memberIconButtonClassName = 'h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';
const memberHeaderActionTextClassName = 'text-sm font-semibold leading-none';

const STANDARD_MEMBER_NAV_PATHS = new Set([
  '/',
  '/mapa-familiar',
  '/mapa-familiar-horizontal',
  '/calendario-familiar',
  '/meus-favoritos',
  '/notificacoes',
  '/ajustar-notificacoes',
  '/forum',
]);

function getActionClass(variant: HeaderAction['variant']) {
  if (variant === 'primary') return primaryActionClass;
  if (variant === 'danger') return dangerActionClass;
  if (variant === 'ghost') return ghostActionClass;
  return defaultActionClass;
}

function getResponsiveLabelMode(action: HeaderAction) {
  if (action.responsiveLabel) return action.responsiveLabel;
  return action.variant === 'primary' ? 'lg' : 'xl';
}

function getIconActionClassName(variantClassName: string, mode: HeaderAction['responsiveLabel']) {
  if (mode === 'always') return `${variantClassName} w-auto px-4`;
  if (mode === 'lg') return `${variantClassName} w-10 px-0 lg:w-auto lg:px-4`;
  if (mode === 'never') return `${variantClassName} w-10 px-0`;
  return `${variantClassName} w-10 px-0 xl:w-auto xl:px-4`;
}

function getLabelClassName(mode: HeaderAction['responsiveLabel']) {
  if (mode === 'always') return 'whitespace-nowrap';
  if (mode === 'lg') return 'sr-only lg:not-sr-only lg:whitespace-nowrap';
  if (mode === 'never') return 'sr-only';
  return 'sr-only xl:not-sr-only xl:whitespace-nowrap';
}

function isNotificationsAction(action: Pick<HeaderAction, 'to' | 'label'>) {
  return action.to === '/notificacoes' || action.label.toLocaleLowerCase('pt-BR').includes('notifica');
}

function isStandardNavigationAction(action: HeaderAction) {
  if (!action.to) return false;
  return STANDARD_MEMBER_NAV_PATHS.has(action.to) || action.to.startsWith('/forum');
}

function getCurrentHeaderSection(pathname: string) {
  if (pathname === '/meus-favoritos') return 'favorites';
  if (pathname === '/notificacoes' || pathname.startsWith('/ajustar-notificacoes')) return 'notifications';
  if (pathname === '/calendario-familiar') return 'calendar';
  if (pathname === '/curiosidades') return 'curiosities';
  if (pathname === '/forum' || pathname.startsWith('/forum/')) return 'forum';
  if (pathname === '/mapa-familiar' || pathname === '/mapa-familiar-horizontal' || pathname === '/') return 'tree';
  return 'other';
}

function formatarHora(data: Date) {
  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isSameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatarDataNotificacao(valor?: string) {
  if (!valor) return '';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;

  const agora = new Date();
  const diffMs = Math.max(0, agora.getTime() - data.getTime());
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 30) return 'Agora';
  if (diffMinutes < 2) return 'Agora há pouco';
  if (diffMinutes < 60) return `Há ${diffMinutes} minuto${diffMinutes === 1 ? '' : 's'}`;

  if (isSameCalendarDay(data, agora)) {
    return `Hoje, às ${formatarHora(data)}`;
  }

  if (diffHours < 24) {
    return `Há ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
  }

  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);

  if (isSameCalendarDay(data, ontem)) {
    return `Ontem, às ${formatarHora(data)}`;
  }

  const dataCurta = data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  return `Dia ${dataCurta}, às ${formatarHora(data)}`;
}

function normalizeNotificationText(value?: string | null) {
  return String(value ?? '')
    .replace(/\bData de memoria\b/g, 'Data de memória')
    .replace(/\bHoje e uma data de memoria\b/g, 'Hoje é uma data de memória')
    .replace(/\bAniversario na familia\b/g, 'Aniversário na família')
    .replace(/\bHoje e aniversario\b/g, 'Hoje é aniversário');
}

function NotificationCountBadge({ count }: { count?: number }) {
  if (!count || count <= 0) return null;

  return (
    <span
      className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-5 text-white ring-2 ring-white"
      aria-label={String(count) + ' notificação' + (count === 1 ? '' : 'es') + ' não lida' + (count === 1 ? '' : 's')}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

function HeaderActionButton({ action }: { action: HeaderAction }) {
  const Icon = action.icon;
  const variantClassName = getActionClass(action.variant);
  const responsiveLabelMode = getResponsiveLabelMode(action);
  const className = Icon
    ? getIconActionClassName(variantClassName, responsiveLabelMode)
    : `${variantClassName} px-4`;

  const content = (
    <>
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className={Icon ? getLabelClassName(responsiveLabelMode) : 'whitespace-nowrap'}>
        {action.label}
      </span>
    </>
  );

  if (action.to) {
    return (
      <Link to={action.to} className={['relative', className].join(' ')} title={action.label} aria-label={action.label}>
        {content}
        <NotificationCountBadge count={action.badgeCount} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      className={['relative', className].join(' ')}
      title={action.label}
      aria-label={action.label}
    >
      {content}
      <NotificationCountBadge count={action.badgeCount} />
    </button>
  );
}

function HeaderNotificationsMenu({
  userId,
  unreadNotificationsCount,
  onNotificationsUpdated,
}: HeaderNotificationsMenuProps) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificacoes, setNotificacoes] = useState<NotificacaoUsuario[]>([]);

  const carregarUltimas = useCallback(async () => {
    if (!userId) {
      setNotificacoes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const lista = await listarNotificacoesSupabase(userId);
      setNotificacoes(lista.slice(0, 5));
    } catch (error) {
      console.error('[Supabase] Erro ao carregar últimas notificações:', error);
      setNotificacoes([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    void carregarUltimas();
  }, [carregarUltimas, open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const notificarAtualizacao = useCallback(() => {
    window.dispatchEvent(new Event('arvorefamilia:notifications-updated'));
    void onNotificationsUpdated();
  }, [onNotificationsUpdated]);

  const navegarPara = useCallback(
    (to: string) => {
      setOpen(false);
      navigate(to);
    },
    [navigate]
  );

  const marcarComoLida = useCallback(
    async (notificacaoId: string) => {
      if (!userId) return;

      setNotificacoes((current) =>
        current.map((notificacao) =>
          notificacao.id === notificacaoId ? { ...notificacao, lida: true } : notificacao
        )
      );
      await marcarNotificacaoSupabaseComoLida(notificacaoId, userId);
      notificarAtualizacao();
    },
    [notificarAtualizacao, userId]
  );

  const remover = useCallback(
    async (notificacaoId: string) => {
      if (!userId) return;

      setNotificacoes((current) => current.filter((notificacao) => notificacao.id !== notificacaoId));
      await removerNotificacaoSupabase(notificacaoId, userId);
      notificarAtualizacao();
    },
    [notificarAtualizacao, userId]
  );

  return (
    <div ref={rootRef} className="relative hidden md:inline-flex">
      <button
        type="button"
        className={`relative flex ${memberIconButtonClassName}`}
        title="Alertas"
        aria-label="Abrir menu de alertas"
        aria-haspopup="menu"
        aria-expanded={open}
        data-tour-target="alerts"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="h-4 w-4" />
        <NotificationCountBadge count={unreadNotificationsCount} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-[650] mt-2 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-2xl ring-1 ring-black/5 sm:w-96"
          role="menu"
          aria-label="Últimas notificações"
        >
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">Últimas notificações</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {unreadNotificationsCount > 0
                  ? `${unreadNotificationsCount} não lida${unreadNotificationsCount === 1 ? '' : 's'}`
                  : 'Todas lidas'}
              </p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <Bell className="h-4 w-4" />
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {!userId ? (
              <div className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                Faça login para ver suas notificações.
              </div>
            ) : loading ? (
              <div className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                Carregando notificações...
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
                Nenhuma notificação recente.
              </div>
            ) : (
              <div className="space-y-2">
                {notificacoes.map((item) => {
                  const titulo = normalizeNotificationText(item.titulo);
                  const mensagem = normalizeNotificationText(item.mensagem);
                  const hasLink = Boolean(item.link);

                  return (
                    <article
                      key={item.id}
                      role={hasLink ? 'button' : undefined}
                      tabIndex={hasLink ? 0 : undefined}
                      aria-label={hasLink ? `Abrir notificação: ${titulo}` : undefined}
                      onClick={hasLink ? () => navegarPara(item.link as string) : undefined}
                      onKeyDown={
                        hasLink
                          ? (event: React.KeyboardEvent<HTMLElement>) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                navegarPara(item.link as string);
                              }
                            }
                          : undefined
                      }
                      className={[
                        'rounded-xl border p-3 transition',
                        item.lida ? 'border-gray-100 bg-white' : 'border-blue-100 bg-blue-50/60',
                        hasLink ? 'cursor-pointer hover:border-blue-200 hover:bg-blue-50' : '',
                      ].join(' ')}
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={[
                                'h-2 w-2 shrink-0 rounded-full',
                                item.lida ? 'bg-gray-300' : 'bg-blue-600',
                              ].join(' ')}
                              aria-hidden="true"
                            />
                            <h3 className="truncate text-sm font-bold text-gray-900">{titulo}</h3>
                          </div>
                          <p className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-gray-600">
                            {mensagem}
                          </p>
                          <p className="mt-2 text-[11px] font-medium text-gray-400">
                            {formatarDataNotificacao(item.created_at)}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          {!item.lida && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void marcarComoLida(item.id);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              title="Marcar como lida"
                              aria-label="Marcar como lida"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void remover(item.id);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                            title="Excluir notificação"
                            aria-label="Excluir notificação"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 border-t border-gray-100 bg-gray-50 px-3 py-3 sm:grid-cols-2">
            <Link
              to="/notificacoes"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Ver todas as notificações
            </Link>
            <Link
              to="/ajustar-notificacoes"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Personalizar preferências
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StandardToolbarLink({
  to,
  title,
  ariaLabel,
  icon: Icon,
  children,
  visibleFrom = 'lg',
  tourTarget,
}: {
  to: string;
  title: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  visibleFrom?: 'md' | 'lg';
  tourTarget?: string;
}) {
  return (
    <Link
      to={to}
      className={`${memberToolbarButtonClassName} ${visibleFrom}:inline-flex`}
      title={title}
      aria-label={ariaLabel}
      data-tour-target={tourTarget}
    >
      <Icon className="h-4 w-4" />
      <span className={memberHeaderActionTextClassName}>{children}</span>
    </Link>
  );
}

const MOBILE_BOTTOM_NAV_ITEMS = [
  { label: 'Home', to: '/mapa-familiar', icon: Home },
  { label: 'Calendário', to: '/calendario-familiar', icon: CalendarDays },
  { label: 'Fórum', to: '/forum', icon: MessageCircle },
  { label: 'Favoritos', to: '/meus-favoritos', icon: Star },
  { label: 'Alertas', to: '/notificacoes', icon: Bell },
];

function MemberMobileBottomNav({ unreadNotificationsCount }: { unreadNotificationsCount: number }) {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.16)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-0.5">
        {MOBILE_BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.to === '/mapa-familiar'
            ? ['/', '/mapa-familiar', '/mapa-familiar-horizontal'].includes(location.pathname)
            : location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.label}
              to={item.to}
              className={[
                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-0.5 text-[11px] font-semibold transition active:bg-gray-100 min-[390px]:text-xs',
                active
                  ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                  : 'text-gray-700 hover:bg-gray-50',
              ].join(' ')}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {item.to === '/notificacoes' && <NotificationCountBadge count={unreadNotificationsCount} />}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export const DEFAULT_MEMBER_HEADER_ACTIONS: HeaderAction[] = [
  { label: 'Árvore Familiar', to: '/mapa-familiar', icon: ArrowLeft, responsiveLabel: 'always' },
  { label: 'Calendário', to: '/calendario-familiar', icon: CalendarDays, responsiveLabel: 'always' },
  { label: 'Favoritos', to: '/meus-favoritos', icon: Star, responsiveLabel: 'always' },
  { label: 'Fórum', to: '/forum', icon: MessageCircle, responsiveLabel: 'always' },
  { label: 'Alertas', to: '/notificacoes', icon: Bell, responsiveLabel: 'never' },
];

export function MemberPageHeader({
  title,
  subtitle,
  icon: Icon = Network,
  actions = [],
  customActions,
  mobileCustomActions,
  hideFavoriteButton,
  hideMobileHeaderActions = false,
  className = '',
}: MemberPageHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchRootRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const currentHeaderSection = getCurrentHeaderSection(location.pathname);
  const isAdminSection = location.pathname.startsWith('/admin');
  void hideFavoriteButton;

  const refreshUnreadNotificationsCount = useCallback(async () => {
    if (!user) {
      setUnreadNotificationsCount(0);
      return;
    }

    const count = await contarNotificacoesNaoLidasSupabase(user.id);
    setUnreadNotificationsCount(count);
  }, [user]);

  useEffect(() => {
    refreshUnreadNotificationsCount();

    window.addEventListener('arvorefamilia:notifications-updated', refreshUnreadNotificationsCount);
    window.addEventListener('focus', refreshUnreadNotificationsCount);

    return () => {
      window.removeEventListener('arvorefamilia:notifications-updated', refreshUnreadNotificationsCount);
      window.removeEventListener('focus', refreshUnreadNotificationsCount);
    };
  }, [refreshUnreadNotificationsCount]);

  useEffect(() => {
    if (!searchExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchExpanded(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => searchInputRef.current?.focus());

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchExpanded]);

  const submitSearch = useCallback(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchExpanded(false);
      return;
    }

    setSearchExpanded(false);
    navigate('/busca?q=' + encodeURIComponent(trimmed));
  }, [navigate, searchTerm]);

  const adminActionsWithNotificationBadge = actions.map((action) =>
    isNotificationsAction(action)
      ? { ...action, badgeCount: unreadNotificationsCount }
      : action
  );
  const extraActions = actions
    .filter((action) => !isStandardNavigationAction(action))
    .map((action) =>
      isNotificationsAction(action)
        ? { ...action, badgeCount: unreadNotificationsCount }
        : action
    );

  const notificationsMenu = (
    <HeaderNotificationsMenu
      userId={user?.id}
      unreadNotificationsCount={unreadNotificationsCount}
      onNotificationsUpdated={refreshUnreadNotificationsCount}
    />
  );

  const standardHeaderActions = (
    <>
      <div className={['min-w-0 shrink-0 flex-nowrap items-center justify-center gap-2 overflow-visible', searchExpanded ? 'hidden lg:flex' : 'hidden md:flex'].join(' ')}>
        {currentHeaderSection !== 'tree' && (
          <StandardToolbarLink to="/mapa-familiar" title="Voltar para Árvore Familiar" ariaLabel="Voltar para Árvore Familiar" icon={ArrowLeft} visibleFrom="md">
            Árvore Familiar
          </StandardToolbarLink>
        )}
        {currentHeaderSection !== 'curiosities' && (
          <StandardToolbarLink to="/curiosidades" title="Curiosidades" ariaLabel="Abrir Curiosidades" icon={Sparkles} visibleFrom="md" tourTarget="curiosities">
            Curiosidades
          </StandardToolbarLink>
        )}
        {currentHeaderSection !== 'calendar' && (
          <StandardToolbarLink to="/calendario-familiar" title="Calendário familiar" ariaLabel="Abrir Calendário familiar" icon={CalendarDays} tourTarget="calendar">
            Calendário
          </StandardToolbarLink>
        )}
        {currentHeaderSection !== 'favorites' && (
          <StandardToolbarLink to="/meus-favoritos" title="Meus favoritos" ariaLabel="Abrir Favoritos" icon={Star} tourTarget="favorites">
            Favoritos
          </StandardToolbarLink>
        )}
        {currentHeaderSection !== 'forum' && (
          <StandardToolbarLink to="/forum" title="Fórum de Discussões" ariaLabel="Abrir Fórum de Discussões" icon={MessageCircle} tourTarget="forum">
            Fórum
          </StandardToolbarLink>
        )}
        {currentHeaderSection !== 'notifications' && notificationsMenu}
      </div>

      <div className={[searchExpanded ? 'hidden md:flex' : 'flex', 'min-w-0 shrink-0 items-center justify-end gap-2 overflow-visible'].join(' ')}>
        <div ref={searchRootRef} className="relative z-[502] flex min-w-0 flex-row-reverse items-center overflow-visible">
          <button
            type="button"
            className={`relative z-[504] flex ${memberIconButtonClassName}`}
            title="Buscar por pessoa ou página"
            aria-label={searchExpanded ? 'Fechar busca' : 'Abrir busca'}
            data-tour-target="search"
            onClick={() => setSearchExpanded((current) => !current)}
          >
            <Search className="pointer-events-none h-4 w-4" />
          </button>

          <div className={['relative z-[503] min-w-0 overflow-visible transition-all duration-300 ease-out', searchExpanded ? 'pointer-events-auto w-[min(50vw,380px)] opacity-100' : 'pointer-events-none w-0 opacity-0'].join(' ')}>
            <div className="pr-2">
              <form onSubmit={(event) => { event.preventDefault(); submitSearch(); }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar pessoa ou página..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  tabIndex={searchExpanded ? 0 : -1}
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <header className={['relative z-[500] shrink-0 overflow-visible border-b border-gray-200 bg-white py-2 shadow-sm', className].filter(Boolean).join(' ')}>
        <div className="flex min-h-14 w-full min-w-0 flex-nowrap items-center justify-between gap-1.5 overflow-visible px-4 sm:gap-2 sm:px-6 lg:h-14 lg:gap-4 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-visible">
            {Icon && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 md:h-10 md:w-10">
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}

            <div className="flex min-h-11 min-w-0 flex-1 items-center overflow-visible md:block md:min-h-0">
              <h1 className="whitespace-normal text-xl font-bold leading-tight text-gray-900 md:text-lg lg:truncate lg:whitespace-nowrap lg:text-xl">
                {title}
              </h1>
              <p className="hidden whitespace-normal text-xs leading-tight text-gray-500 md:block lg:truncate lg:whitespace-nowrap lg:text-sm">
                {subtitle}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2 md:hidden">
            {mobileCustomActions}
            {!hideMobileHeaderActions && <UserProfileMenu />}
          </div>

          {isAdminSection ? (
            (actions.length > 0 || customActions) && (
              <div className="hidden min-w-0 shrink-0 flex-row flex-nowrap items-center justify-end gap-1.5 overflow-visible sm:gap-2 md:flex">
                {adminActionsWithNotificationBadge.map((action) => (
                  isNotificationsAction(action) ? (
                    <HeaderNotificationsMenu
                      key={`${action.label}-${action.to ?? 'button'}`}
                      userId={user?.id}
                      unreadNotificationsCount={unreadNotificationsCount}
                      onNotificationsUpdated={refreshUnreadNotificationsCount}
                    />
                  ) : (
                    <HeaderActionButton key={`${action.label}-${action.to ?? 'button'}`} action={action} />
                  )
                ))}
                {customActions}
                <UserProfileMenu />
              </div>
            )
          ) : (
            <div className="hidden min-w-0 shrink-0 flex-row flex-nowrap items-center justify-end gap-2 overflow-visible md:flex">
              {standardHeaderActions}
              {extraActions.map((action) => (
                isNotificationsAction(action) ? (
                  <HeaderNotificationsMenu
                    key={`${action.label}-${action.to ?? 'button'}`}
                    userId={user?.id}
                    unreadNotificationsCount={unreadNotificationsCount}
                    onNotificationsUpdated={refreshUnreadNotificationsCount}
                  />
                ) : (
                  <HeaderActionButton key={`${action.label}-${action.to ?? 'button'}`} action={action} />
                )
              ))}
              {customActions}
              <UserProfileMenu />
            </div>
          )}
        </div>
      </header>
      <MemberMobileBottomNav unreadNotificationsCount={unreadNotificationsCount} />
    </>
  );
}
export const HEADER_ACTION_ICONS = {
  ArrowLeft,
  Bell,
  CalendarDays,
  Home,
  LogOut,
  MessageCircle,
  Network,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
};