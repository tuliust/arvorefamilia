import React from 'react';
import { AppLink as Link } from '../AppLink';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Home,
  LogOut,
  MessageCircle,
  Network,
  Plus,
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
};

interface MemberPageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: HeaderAction[];
  customActions?: React.ReactNode;
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
      <Link to={action.to} className={className} title={action.label} aria-label={action.label}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      className={className}
      title={action.label}
      aria-label={action.label}
    >
      {content}
    </button>
  );
}

const MOBILE_BOTTOM_NAV_ITEMS = [
  { label: 'Curiosidades', to: '/minha-arvore?curiosidades=1', icon: Sparkles },
  { label: 'Calendário', to: '/calendario-familiar', icon: CalendarDays },
  { label: 'Fórum', to: '/forum', icon: MessageCircle },
  { label: 'Favoritos', to: '/meus-favoritos', icon: Star },
  { label: 'Notificações', to: '/notificacoes', icon: Bell },
];

function MemberMobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.16)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1.5">
        {MOBILE_BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100"
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export const DEFAULT_MEMBER_HEADER_ACTIONS: HeaderAction[] = [
  { label: 'Árvore geral', to: '/', icon: Home, responsiveLabel: 'lg' },
  { label: 'Minha Árvore', to: '/minha-arvore', icon: Network, responsiveLabel: 'lg' },
  { label: 'Favoritos', to: '/meus-favoritos', icon: Star, responsiveLabel: 'xl' },
  { label: 'Notificações', to: '/notificacoes', icon: Bell, responsiveLabel: 'xl' },
];

export function MemberPageHeader({
  title,
  subtitle,
  icon: Icon = Network,
  actions = [],
  customActions,
  className = '',
}: MemberPageHeaderProps) {
  return (
    <>
      <header className={['shrink-0 border-b border-gray-200 bg-white py-2 shadow-sm', className].filter(Boolean).join(' ')}>
        <div className="flex min-h-14 w-full min-w-0 flex-nowrap items-center justify-between gap-1.5 overflow-visible px-4 sm:gap-2 sm:px-6 lg:h-14 lg:gap-4 lg:overflow-hidden lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-visible lg:overflow-hidden">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}

            <div className="min-w-0 flex-1 overflow-visible lg:overflow-hidden">
              <h1 className="whitespace-normal text-lg font-bold leading-tight text-gray-900 sm:text-lg lg:truncate lg:whitespace-nowrap lg:text-xl">
                {title}
              </h1>
              <p className="whitespace-normal text-xs leading-tight text-gray-500 lg:truncate lg:whitespace-nowrap lg:text-sm">
                {subtitle}
              </p>
            </div>
          </div>

          {(actions.length > 0 || customActions) && (
            <div className="hidden min-w-0 shrink-0 flex-row flex-nowrap items-center justify-end gap-1.5 sm:gap-2 md:flex">
              {actions.map((action) => (
                <HeaderActionButton key={`${action.label}-${action.to ?? 'button'}`} action={action} />
              ))}
              {customActions}
            </div>
          )}
        </div>
      </header>
      <MemberMobileBottomNav />
    </>
  );
}
export const HEADER_ACTION_ICONS = {
  ArrowLeft,
  Bell,
  CalendarDays,
  Home,
  LogOut,
  Network,
  Plus,
  Settings,
  Star,
};
