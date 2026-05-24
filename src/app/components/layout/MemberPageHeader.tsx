import React from 'react';
import { AppLink as Link } from '../AppLink';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Home,
  LogOut,
  Network,
  Plus,
  Settings,
  Star,
} from 'lucide-react';

export type HeaderAction = {
  label: string;
  to?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
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

function HeaderActionButton({ action }: { action: HeaderAction }) {
  const Icon = action.icon;
  const variantClassName = getActionClass(action.variant);
  const className = Icon
    ? `${variantClassName} w-10 px-0 xl:w-auto xl:px-4`
    : `${variantClassName} px-4`;

  const content = (
    <>
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className={Icon ? 'sr-only xl:not-sr-only xl:whitespace-nowrap' : 'whitespace-nowrap'}>
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

export const DEFAULT_MEMBER_HEADER_ACTIONS: HeaderAction[] = [
  { label: 'Árvore geral', to: '/', icon: Home },
  { label: 'Minha Árvore', to: '/minha-arvore', icon: Network },
  { label: 'Favoritos', to: '/meus-favoritos', icon: Star },
  { label: 'Notificações', to: '/notificacoes', icon: Bell },
];

export function MemberPageHeader({
  title,
  subtitle,
  icon: Icon,
  actions = [],
  customActions,
  className = '',
}: MemberPageHeaderProps) {
  return (
    <header className={`border-b border-gray-200 bg-white shadow-sm ${className}`}>
      <div className={`${PAGE_CONTAINER_CLASS} py-4`}>
        <div className="flex min-w-0 flex-row items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
              <p className="truncate text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>

          {(actions.length > 0 || customActions) && (
            <div className="flex min-w-fit shrink-0 flex-row flex-nowrap justify-end gap-2">
              {actions.map((action) => (
                <HeaderActionButton key={`${action.label}-${action.to ?? 'button'}`} action={action} />
              ))}
              {customActions}
            </div>
          )}
        </div>
      </div>
    </header>
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
