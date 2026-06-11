import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  FileDown,
  ImageDown,
  Minus,
  Palette,
  Plus,
  Printer,
  Scan,
} from 'lucide-react';

import {
  TREE_COLOR_PALETTE_CSS_VARIABLES,
  TREE_COLOR_PALETTE_STORAGE_KEY,
  TREE_COLOR_PALETTES,
  isTreeColorPalette,
  type TreeColorPalette,
} from '../../components/FamilyTree/treeColorPalettes';
import { getPathForTreeViewMode, type TreeViewMode } from '../../components/FamilyTree/treeViewMode';

export type SidebarPanel = 'filters' | 'legend' | 'info';

export type SidebarTreeAction =
  | 'zoom-in'
  | 'zoom-out'
  | 'select-area'
  | 'save-image'
  | 'save-pdf'
  | 'print';

export const SIDEBAR_TREE_ACTION_EVENT = 'arvore-family-tree-action';

const paletteOptions: TreeColorPalette[] = ['white', 'orange', 'brown', 'visual'];

const viewOptions: Array<{ key: TreeViewMode; label: string; mobileOnly?: boolean }> = [
  { key: 'minha-arvore', label: 'Minha', mobileOnly: true },
  { key: 'mapa-familiar', label: 'Mapa' },
  { key: 'genealogia', label: 'Genealogia', mobileOnly: true },
  { key: 'visao-completa', label: 'Completa' },
];

function getStoredPalette(): TreeColorPalette {
  if (typeof window === 'undefined') return 'white';

  const stored = window.localStorage.getItem(TREE_COLOR_PALETTE_STORAGE_KEY);
  return isTreeColorPalette(stored) ? stored : 'white';
}

function applyTreePalette(value: TreeColorPalette) {
  if (typeof document === 'undefined') return;

  const palette = TREE_COLOR_PALETTES[value];
  const root = document.documentElement;

  root.dataset.treeColorPalette = value;

  TREE_COLOR_PALETTE_CSS_VARIABLES.forEach((variableName) => {
    root.style.setProperty(variableName, palette.cssVariables[variableName]);
  });
}

function getCurrentTreeViewMode(pathname: string): TreeViewMode {
  if (pathname.startsWith('/visao-completa')) return 'visao-completa';
  if (pathname.startsWith('/genealogia')) return 'genealogia';
  if (pathname.startsWith('/minha-arvore')) return 'minha-arvore';
  return 'mapa-familiar';
}

function dispatchTreeAction(action: SidebarTreeAction) {
  window.dispatchEvent(new CustomEvent<SidebarTreeAction>(SIDEBAR_TREE_ACTION_EVENT, { detail: action }));
}

interface SidebarPanelTabsProps {
  activePanel: SidebarPanel;
  onChange: (panel: SidebarPanel) => void;
}

export function SidebarPanelTabs({
  activePanel,
  onChange,
}: SidebarPanelTabsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentViewMode = getCurrentTreeViewMode(location.pathname);
  const [treeColorPalette, setTreeColorPalette] = React.useState<TreeColorPalette>(getStoredPalette);

  React.useEffect(() => {
    applyTreePalette(treeColorPalette);
    window.localStorage.setItem(TREE_COLOR_PALETTE_STORAGE_KEY, treeColorPalette);
  }, [treeColorPalette]);

  React.useEffect(() => {
    if (activePanel !== 'filters') {
      window.setTimeout(() => onChange('filters'), 0);
    }
  }, [activePanel, onChange]);

  const handleViewChange = React.useCallback((viewMode: TreeViewMode) => {
    const nextPath = getPathForTreeViewMode(viewMode);
    if (location.pathname === nextPath) return;
    navigate(`${nextPath}${location.search}`, { replace: false });
  }, [location.pathname, location.search, navigate]);

  return (
    <section className="flex min-w-0 flex-col gap-[clamp(0.32rem,0.75vh,0.45rem)] rounded-lg border border-gray-200 bg-white p-[clamp(0.38rem,0.85vh,0.5rem)] shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[clamp(11px,1.35vh,12px)] font-bold uppercase tracking-[0.12em] text-slate-500">
          Controles
        </p>
        <Palette className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-1">
        {viewOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            aria-pressed={currentViewMode === option.key}
            onClick={() => handleViewChange(option.key)}
            className={[
              'min-h-7 rounded-md border px-1.5 text-[11px] font-semibold leading-tight transition',
              option.mobileOnly ? 'lg:hidden' : '',
              currentViewMode === option.key
                ? 'border-blue-300 bg-blue-50 text-blue-900 shadow-sm'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-white hover:text-gray-900',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-4 gap-1" aria-label="Paletas de cores da árvore">
        {paletteOptions.map((paletteKey) => {
          const palette = TREE_COLOR_PALETTES[paletteKey];
          const isActive = paletteKey === treeColorPalette;

          return (
            <button
              key={paletteKey}
              type="button"
              aria-label={palette.ariaLabel}
              aria-pressed={isActive}
              title={palette.label}
              className={[
                'flex h-7 items-center justify-center rounded-md border bg-white transition',
                isActive
                  ? 'border-slate-800 ring-1 ring-slate-800'
                  : 'border-gray-200 hover:border-slate-300',
              ].join(' ')}
              onClick={() => setTreeColorPalette(paletteKey)}
            >
              <span
                className="h-4 w-4 rounded-full border"
                style={{
                  backgroundColor: palette.swatch,
                  borderColor: palette.swatchBorder,
                }}
              />
            </button>
          );
        })}
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-1">
        <CompactControlButton icon={Plus} label="Zoom +" onClick={() => dispatchTreeAction('zoom-in')} />
        <CompactControlButton icon={Minus} label="Zoom -" onClick={() => dispatchTreeAction('zoom-out')} />
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-1">
        <CompactControlButton icon={Scan} label="Área" onClick={() => dispatchTreeAction('select-area')} />
        <CompactControlButton icon={ImageDown} label="Imagem" onClick={() => dispatchTreeAction('save-image')} />
        <CompactControlButton icon={FileDown} label="PDF" onClick={() => dispatchTreeAction('save-pdf')} />
        <CompactControlButton icon={Printer} label="Imprimir" onClick={() => dispatchTreeAction('print')} />
      </div>
    </section>
  );
}

function CompactControlButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-7 min-w-0 items-center justify-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 text-[11px] font-semibold leading-tight text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
