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

const defaultActionClass =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const primaryActionClass =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const dangerActionClass =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const ghostActionClass =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-transparent bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

function getActionClass(variant: HeaderAction['variant']) {
  if (variant === 'primary') return primaryActionClass;
  if (variant === 'danger') return dangerActionClass;
  if (variant === 'ghost') return ghostActionClass;
  return defaultActionClass;
}

function HeaderActionButton({ action }: { action: HeaderAction }) {
  const Icon = action.icon;
  const className = getActionClass(action.variant);

  const content = (
    <>
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="whitespace-nowrap">{action.label}</span>
    </>
  );

  if (action.to) {
    return (
      <Link to={action.to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} disabled={action.disabled} className={className}>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
              <p className="truncate text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>

          {(actions.length > 0 || customActions) && (
            <div className="flex w-full min-w-0 flex-row flex-nowrap gap-2 overflow-x-auto pb-1 sm:w-auto sm:max-w-[60vw] sm:justify-end sm:pb-0 lg:max-w-none">
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
