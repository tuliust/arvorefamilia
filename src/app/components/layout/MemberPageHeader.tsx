import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { AppLink as Link } from '../AppLink';
import { UserProfileMenu } from './UserProfileMenu';
import { HeaderNotificationsDropdown } from './HeaderNotificationsDropdown';
import { HeaderGlobalSearch } from './HeaderGlobalSearch';
import { useAuth } from '../../contexts/AuthContext';
import { contarNotificacoesNaoLidasSupabase } from '../../services/userEngagementService';
import {
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
} from 'lucide-react';

export type HeaderAction = {
  label: string;
  to?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
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
  hideHeaderActions?: boolean;
  hideMobileBottomNav?: boolean;
  className?: string;
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
  '/curiosidades',
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

function isStandardNavigationAction(action: HeaderAction) {
  if (!action.to) return false;

  const targetPath = action.to.split('?')[0].split('#')[0];
  return STANDARD_MEMBER_NAV_PATHS.has(targetPath) || targetPath.startsWith('/forum');
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

function StandardToolbarLink({
  to,
  title,
  ariaLabel,
  icon: Icon,
  children,
  visibleFrom = 'lg',
  tourTarget,
  badgeCount,
}: {
  to: string;
  title: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  visibleFrom?: 'md' | 'lg';
  tourTarget?: string;
  badgeCount?: number;
}) {
  return (
    <Link
      to={to}
      className={`relative ${memberToolbarButtonClassName} ${visibleFrom}:inline-flex`}
      title={title}
      aria-label={ariaLabel}
      data-tour-target={tourTarget}
    >
      <Icon className="h-4 w-4" />
      <span className={memberHeaderActionTextClassName}>{children}</span>
      <NotificationCountBadge count={badgeCount} />
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

const ADMIN_HEADER_ACTIONS: HeaderAction[] = [
  { label: 'Painel Administrativo', to: '/admin', icon: ArrowLeft, responsiveLabel: 'always' },
  { label: 'Principal', to: '/mapa-familiar', responsiveLabel: 'always' },
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
  hideHeaderActions = false,
  hideMobileBottomNav = false,
  className = '',
}: MemberPageHeaderProps) {
  const location = useLocation();
  const { user } = useAuth();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const currentHeaderSection = getCurrentHeaderSection(location.pathname);
  const isAdminSection = location.pathname.startsWith('/admin');
  void hideFavoriteButton;

  const refreshUnreadNotificationsCount = useCallback(async () => {
    if (!user) {
      setUnreadNotificationsCount(0);
      return;
    }

    try {
      const count = await contarNotificacoesNaoLidasSupabase(user.id);
      setUnreadNotificationsCount(count);
    } catch (error) {
      console.error('[Supabase] Erro ao contar notificações não lidas:', error);
      setUnreadNotificationsCount(0);
    }
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

  const extraActions = actions
    .filter((action) => !isStandardNavigationAction(action))
    .map((action) =>
      action.to === '/notificacoes'
        ? { ...action, badgeCount: unreadNotificationsCount }
        : action
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
        {currentHeaderSection !== 'notifications' && (
          <HeaderNotificationsDropdown
            wrapperClassName="relative hidden lg:inline-flex"
            buttonClassName={memberIconButtonClassName}
            iconClassName="h-4 w-4"
          />
        )}
      </div>

      <div className={[searchExpanded ? 'hidden md:flex' : 'flex', 'min-w-0 shrink-0 items-center justify-end gap-2 overflow-visible'].join(' ')}>
        <HeaderGlobalSearch
          searchExpanded={searchExpanded}
          onSearchExpandedChange={setSearchExpanded}
          buttonClassName={memberIconButtonClassName}
          inputRef={searchInputRef}
        />
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
            {!hideHeaderActions && mobileCustomActions}
            {!hideHeaderActions && (
              <HeaderNotificationsDropdown
                wrapperClassName="relative z-[502] inline-flex"
                buttonClassName={memberIconButtonClassName}
                iconClassName="h-4 w-4"
                title="Alertas"
                ariaLabel="Abrir menu de alertas"
              />
            )}
            {!hideHeaderActions && !hideMobileHeaderActions && <UserProfileMenu />}
          </div>

          {!hideHeaderActions && (isAdminSection ? (
            <div className="hidden min-w-0 shrink-0 flex-row flex-nowrap items-center justify-end gap-1.5 overflow-visible sm:gap-2 md:flex">
              {ADMIN_HEADER_ACTIONS.map((action) => (
                <HeaderActionButton key={`${action.label}-${action.to ?? 'button'}`} action={action} />
              ))}
              {customActions}
              <UserProfileMenu />
            </div>
          ) : (
            <div className="hidden min-w-0 shrink-0 flex-row flex-nowrap items-center justify-end gap-2 overflow-visible md:flex">
              {standardHeaderActions}
              {extraActions.map((action) => (
                <HeaderActionButton key={`${action.label}-${action.to ?? 'button'}`} action={action} />
              ))}
              {customActions}
              <UserProfileMenu />
            </div>
          ))}
        </div>
      </header>
      {!hideMobileBottomNav && <MemberMobileBottomNav unreadNotificationsCount={unreadNotificationsCount} />}
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
