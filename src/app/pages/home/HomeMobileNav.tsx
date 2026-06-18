import React, { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Home,
  Layers,
  Map,
  MessageCircle,
  Star,
} from 'lucide-react';
import {
  MobileFamilyMapToolbar,
  type MobileFamilyMapToolbarAction,
} from '../../components/FamilyTree/MobileFamilyMapToolbar';
import { useAuth } from '../../contexts/AuthContext';
import { contarNotificacoesNaoLidasSupabase } from '../../services/userEngagementService';

interface HomeMobileNavProps {
  legendOpen: boolean;
  onToggleLegend: () => void;
  navigateFromHome: (path: string) => void;
}

function getCurrentPathname() {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

const mobileTreeToolbarTopClass = 'top-[calc(env(safe-area-inset-top,0px)+5.05rem)]';
const mobileTreeViewPopoverTopClass = 'top-[calc(env(safe-area-inset-top,0px)+8.15rem)]';

const TREE_VIEW_OPTIONS: Array<{
  path: '/mapa-familiar' | '/mapa-familiar-horizontal';
  label: string;
  subtitle: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    path: '/mapa-familiar',
    label: 'Linha Geracional',
    subtitle: 'Visualização cronológica por gerações',
    ariaLabel: 'Alternar para Linha Geracional',
    icon: Map,
  },
  {
    path: '/mapa-familiar-horizontal',
    label: 'Árvore Familiar',
    subtitle: 'Visão de parentesco por grupos',
    ariaLabel: 'Alternar para Árvore Familiar',
    icon: Layers,
  },
];

function NotificationCountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-5 text-white ring-2 ring-white"
      aria-label={`${count} notificação${count === 1 ? '' : 'es'} não lida${count === 1 ? '' : 's'}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function HomeMobileNav({
  legendOpen,
  onToggleLegend,
  navigateFromHome,
}: HomeMobileNavProps) {
  const { user } = useAuth();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [activeToolbarAction, setActiveToolbarAction] = useState<MobileFamilyMapToolbarAction | null>(null);

  const refreshUnreadNotificationsCount = useCallback(async () => {
    if (!user) {
      setUnreadNotificationsCount(0);
      return;
    }

    try {
      const count = await contarNotificacoesNaoLidasSupabase(user.id);
      setUnreadNotificationsCount(count);
    } catch {
      setUnreadNotificationsCount(0);
    }
  }, [user]);

  useEffect(() => {
    void refreshUnreadNotificationsCount();

    window.addEventListener('arvorefamilia:notifications-updated', refreshUnreadNotificationsCount);
    window.addEventListener('focus', refreshUnreadNotificationsCount);

    return () => {
      window.removeEventListener('arvorefamilia:notifications-updated', refreshUnreadNotificationsCount);
      window.removeEventListener('focus', refreshUnreadNotificationsCount);
    };
  }, [refreshUnreadNotificationsCount]);

  const pathname = getCurrentPathname();
  const isDirectFamilyMap = pathname === '/mapa-familiar' || pathname === '/mapa-familiar-horizontal';

  useEffect(() => {
    if (!isDirectFamilyMap) {
      setActiveToolbarAction(null);
    }
  }, [isDirectFamilyMap, pathname]);

  useEffect(() => {
    if (!legendOpen && activeToolbarAction && activeToolbarAction !== 'visualizacao') {
      setActiveToolbarAction(null);
    }
  }, [activeToolbarAction, legendOpen]);

  const openMobileControlsPanel = useCallback((action: MobileFamilyMapToolbarAction) => {
    if (action === 'visualizacao') {
      setActiveToolbarAction((current) => (current === 'visualizacao' ? null : 'visualizacao'));

      if (legendOpen) onToggleLegend();
      return;
    }

    setActiveToolbarAction(action);

    if (!legendOpen) onToggleLegend();
  }, [legendOpen, onToggleLegend]);

  const handleViewOptionClick = useCallback((path: '/mapa-familiar' | '/mapa-familiar-horizontal') => {
    setActiveToolbarAction(null);

    if (pathname === path) return;

    const query = typeof window === 'undefined' ? '' : window.location.search;
    navigateFromHome(`${path}${query}`);
  }, [navigateFromHome, pathname]);

  const itemClassName = 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100';
  const activeItemClassName = 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg bg-blue-50 px-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition active:bg-blue-100';

  return (
    <>
      {isDirectFamilyMap && (
        <>
          <style>
            {`
              [data-mobile-family-tree-root="true"] > nav[aria-label="Visualizações da árvore"],
              [data-family-map-horizontal-mobile-root="true"] > nav[aria-label="Gerações do Mapa Genealógico"] {
                display: none !important;
              }
            `}
          </style>
          <MobileFamilyMapToolbar
            activeAction={activeToolbarAction}
            className={`fixed inset-x-0 ${mobileTreeToolbarTopClass} z-[10000]`}
            onAction={openMobileControlsPanel}
          />

          {activeToolbarAction === 'visualizacao' && (
            <div
              className={`fixed inset-x-2 ${mobileTreeViewPopoverTopClass} z-[10001] md:hidden`}
              data-tree-export-ignore="true"
            >
              <div className="mx-auto grid max-w-md grid-cols-2 gap-1.5">
                {TREE_VIEW_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = pathname === option.path;

                  return (
                    <button
                      key={option.path}
                      type="button"
                      aria-pressed={active}
                      aria-label={option.ariaLabel}
                      onClick={() => handleViewOptionClick(option.path)}
                      className={[
                        'flex min-h-[72px] min-w-0 flex-col items-center justify-start gap-1 rounded-xl border bg-white px-2 py-2 text-center shadow-sm transition active:scale-[0.99]',
                        active
                          ? 'border-blue-500 bg-blue-50 text-blue-950 ring-1 ring-blue-500'
                          : 'border-slate-200 text-slate-900 hover:border-blue-200 hover:bg-blue-50/70',
                      ].join(' ')}
                    >
                      <Icon className={['h-4 w-4 shrink-0', active ? 'text-blue-700' : 'text-slate-700'].join(' ')} />
                      <span className="max-w-full text-[11px] font-extrabold leading-tight text-current">
                        {option.label}
                      </span>
                      <span className="max-w-full text-[9px] font-semibold leading-tight text-slate-700">
                        {option.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.16)] backdrop-blur" data-tree-export-ignore="true">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1.5">
          <button
            type="button"
            className={activeItemClassName}
            onClick={() => navigateFromHome('/mapa-familiar')}
            aria-label="Abrir Home"
            aria-current="page"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={itemClassName}
            onClick={() => navigateFromHome('/calendario-familiar')}
            aria-label="Abrir calendário familiar"
          >
            <CalendarDays className="h-5 w-5" />
            <span>Calendário</span>
          </button>

          <button
            type="button"
            className={itemClassName}
            onClick={() => navigateFromHome('/forum')}
            aria-label="Abrir fórum"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Fórum</span>
          </button>

          <button
            type="button"
            className={itemClassName}
            onClick={() => navigateFromHome('/meus-favoritos')}
            aria-label="Abrir favoritos"
          >
            <Star className="h-5 w-5" />
            <span>Favoritos</span>
          </button>

          <button
            type="button"
            className={itemClassName}
            onClick={() => navigateFromHome('/notificacoes')}
            aria-label="Abrir alertas"
          >
            <span className="relative">
              <Bell className="h-5 w-5" />
              <NotificationCountBadge count={unreadNotificationsCount} />
            </span>
            <span>Alertas</span>
          </button>
        </div>
      </nav>
    </>
  );
}
