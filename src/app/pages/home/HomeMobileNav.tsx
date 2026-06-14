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

interface HomeMobileNavProps {
  legendOpen: boolean;
  onToggleLegend: () => void;
  navigateFromHome: (path: string) => void;
}

function getCurrentPathname() {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

const mobileTreeControlsTopClass = 'top-[calc(env(safe-area-inset-top,0px)+5.05rem)]';

export function HomeMobileNav({
  legendOpen,
  onToggleLegend,
  navigateFromHome,
}: HomeMobileNavProps) {
  const pathname = getCurrentPathname();
  const isDirectFamilyMap = pathname === '/mapa-familiar' || pathname === '/mapa-familiar-horizontal';
  const itemClassName = 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100';
  const activeItemClassName = 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg bg-blue-50 px-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition active:bg-blue-100';

  return (
    <>
      {isDirectFamilyMap && (
        <button
          type="button"
          className={`fixed right-[0.85rem] ${mobileTreeControlsTopClass} z-[10000] flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.18)] backdrop-blur transition active:scale-95 md:hidden`}
          onClick={onToggleLegend}
          aria-label={legendOpen ? 'Fechar painel da árvore' : 'Abrir painel da árvore'}
          aria-expanded={legendOpen}
          data-tree-export-ignore="true"
        >
          {legendOpen ? <ChevronDown className="h-5 w-5" /> : <SlidersHorizontal className="h-4.5 w-4.5" />}
        </button>
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
            <Bell className="h-5 w-5" />
            <span>Alertas</span>
          </button>
        </div>
      </nav>
    </>
  );
}
