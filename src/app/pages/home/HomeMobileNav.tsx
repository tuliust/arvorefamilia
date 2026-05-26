import React from 'react';
import {
  Bell,
  CalendarDays,
  MessageCircle,
  Minus,
  MoreHorizontal,
  Network,
  PanelBottom,
  Plus,
  Sparkles,
  Star,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
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

export function HomeMobileNav({
  legendOpen,
  onToggleLegend,
  currentTreeViewLabel,
  onTreeViewModeChange,
  familyTreeRef,
  onCuriosities,
  navigateFromHome,
}: HomeMobileNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.16)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1.5">
        <button
          type="button"
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100"
          onClick={onToggleLegend}
          aria-label={legendOpen ? 'Fechar painel' : 'Abrir painel'}
        >
          <PanelBottom className="h-5 w-5" />
          <span>Painel</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100"
              aria-label={`Visualização atual: ${currentTreeViewLabel}`}
            >
              <Network className="h-5 w-5" />
              <span>Visual</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="mb-2 w-52">
            <DropdownMenuItem onClick={() => onTreeViewModeChange('minha-arvore')}>
              Minha Árvore
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTreeViewModeChange('genealogia')}>
              Genealogia
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTreeViewModeChange('visao-completa')}>
              Visão Completa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100"
          onClick={() => familyTreeRef.current?.zoomOut()}
          aria-label="Diminuir zoom"
        >
          <Minus className="h-5 w-5" />
          <span>Zoom -</span>
        </button>

        <button
          type="button"
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100"
          onClick={() => familyTreeRef.current?.zoomIn()}
          aria-label="Aumentar zoom"
        >
          <Plus className="h-5 w-5" />
          <span>Zoom +</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100"
              aria-label="Abrir mais atalhos"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>Mais</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="mb-2 w-56">
            <DropdownMenuItem onClick={onCuriosities}>
              <Sparkles className="h-4 w-4" />
              Curiosidades
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigateFromHome('/forum')}>
              <MessageCircle className="h-4 w-4" />
              Fórum
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigateFromHome('/calendario-familiar')}>
              <CalendarDays className="h-4 w-4" />
              Calendário
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigateFromHome('/meus-favoritos')}>
              <Star className="h-4 w-4" />
              Favoritos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigateFromHome('/notificacoes')}>
              <Bell className="h-4 w-4" />
              Notificações
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
