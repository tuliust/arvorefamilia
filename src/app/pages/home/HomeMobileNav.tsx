import React from 'react';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Home,
  MessageCircle,
  SlidersHorizontal,
  Star,
} from 'lucide-react';

import type { FamilyTreeActions } from '../../components/FamilyTree/FamilyTree';
import type { TreeViewMode } from '../../components/FamilyTree/treeViewMode';

interface HomeMobileNavProps {
  legendOpen: boolean;
  onToggleLegend: () => void;
  currentTreeViewLabel: string;
  onTreeViewModeChange: (value: TreeViewMode) => void;
  familyTreeRef: React.RefObject<FamilyTreeActions | null>;
  onCuriosities: () => void;
  navigateFromHome: (path: string) => void;
}

function getCurrentPathname() {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

const horizontalTabs = ['Paterno', 'Central', 'Materno'] as const;
const mobileTreeControlsTopClass = 'top-[calc(env(safe-area-inset-top,0px)+4.35rem)]';

export function HomeMobileNav({
  legendOpen,
  onToggleLegend,
  navigateFromHome,
}: HomeMobileNavProps) {
  const pathname = getCurrentPathname();
  const isDirectFamilyMap = pathname === '/mapa-familiar' || pathname === '/mapa-familiar-horizontal';
  const isHorizontalMap = pathname === '/mapa-familiar-horizontal';
  const itemClassName = 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100';
  const activeItemClassName = 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg bg-blue-50 px-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition active:bg-blue-100';

  return (
    <>
      {isHorizontalMap && (
        <nav
          aria-label="Visualizações da árvore horizontal"
          className={`fixed inset-x-0 ${mobileTreeControlsTopClass} z-[9990] border-b border-slate-200 bg-white/95 py-2 pl-2 pr-16 shadow-sm backdrop-blur md:hidden`}
        >
          <div className="grid w-full max-w-[330px] grid-cols-3 gap-0.5 rounded-xl bg-slate-100 p-1">
            {horizontalTabs.map((tab) => {
              const active = tab === 'Central';
              return (
                <button
                  key={tab}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'min-w-0 rounded-lg px-0.5 py-2 text-[10px] font-bold transition min-[375px]:text-[11px]',
                    active ? 'bg-cyan-700 text-white shadow-sm' : 'text-slate-600 hover:bg-white',
                  ].join(' ')}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {isDirectFamilyMap && (
        <button
          type="button"
          className={`fixed right-[0.85rem] ${mobileTreeControlsTopClass} z-[10000] flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.18)] backdrop-blur transition active:scale-95 md:hidden`}
          onClick={onToggleLegend}
          aria-label={legendOpen ? 'Fechar painel da árvore' : 'Abrir painel da árvore'}
          aria-expanded={legendOpen}
        >
          {legendOpen ? <ChevronDown className="h-5 w-5" /> : <SlidersHorizontal className="h-5 w-5" />}
        </button>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.16)] backdrop-blur">
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
            <Bell className="h-5 w-5" />
            <span>Alertas</span>
          </button>
        </div>
      </nav>
    </>
  );
}
