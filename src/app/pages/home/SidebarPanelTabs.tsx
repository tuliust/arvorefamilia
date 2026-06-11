import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Brush,
  FileDown,
  ImageDown,
  Layers,
  Map,
  Minus,
  Palette,
  PanelTop,
  Plus,
  Printer,
  Scan,
  Sparkles,
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

const paletteOptions: TreeColorPalette[] = ['white', 'visual', 'orange', 'brown'];

const paletteLabels: Record<TreeColorPalette, string> = {
  white: 'Branca',
  visual: 'Azul',
  orange: 'Laranja',
  brown: 'Marrom',
};

const viewOptions: Array<{
  key: TreeViewMode;
  label: string;
  shortLabel: string;
  mobileOnly?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'minha-arvore', label: 'Minha Árvore', shortLabel: 'Minha', mobileOnly: true, icon: Layers },
  { key: 'mapa-familiar', label: 'Mapa Familiar', shortLabel: 'Mapa', icon: Map },
  { key: 'genealogia', label: 'Genealogia', shortLabel: 'Genealogia', mobileOnly: true, icon: PanelTop },
  { key: 'visao-completa', label: 'Visão Completa', shortLabel: 'Completa', icon: Layers },
];

type HighlightKey = 'lines' | 'cards' | 'groups';

const highlightOptions: Array<{
  key: HighlightKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'lines', label: 'Linhas', icon: Minus },
  { key: 'cards', label: 'Cards', icon: Layers },
  { key: 'groups', label: 'Grupos', icon: PanelTop },
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
  const [activeHighlights, setActiveHighlights] = React.useState<Record<HighlightKey, boolean>>({
    lines: false,
    cards: false,
    groups: false,
  });

  React.useEffect(() => {
    applyTreePalette(treeColorPalette);
    window.localStorage.setItem(TREE_COLOR_PALETTE_STORAGE_KEY, treeColorPalette);
  }, [treeColorPalette]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.dataset.treeHighlightLines = activeHighlights.lines ? 'true' : 'false';
    root.dataset.treeHighlightCards = activeHighlights.cards ? 'true' : 'false';
    root.dataset.treeHighlightGroups = activeHighlights.groups ? 'true' : 'false';
  }, [activeHighlights]);

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

  const toggleHighlight = React.useCallback((key: HighlightKey) => {
    setActiveHighlights((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }, []);

  return (
    <section className="tree-control-panel flex min-w-0 flex-col gap-[clamp(0.28rem,0.68vh,0.4rem)] rounded-lg border border-gray-200 bg-white p-[clamp(0.36rem,0.78vh,0.48rem)] shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[clamp(10px,1.22vh,11px)] font-bold uppercase tracking-[0.14em] text-slate-500">
          Controles
        </p>
        <Palette className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      </div>

      <ControlSection title="Visualizações" icon={Map} defaultOpen>
        <div className="grid min-w-0 grid-cols-2 gap-1">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <IconToggleButton
                key={option.key}
                icon={Icon}
                label={option.shortLabel}
                active={currentViewMode === option.key}
                mobileOnly={option.mobileOnly}
                title={option.label}
                onClick={() => handleViewChange(option.key)}
              />
            );
          })}
        </div>
      </ControlSection>

      <ControlSection title="Cores" icon={Brush} defaultOpen>
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
                title={paletteLabels[paletteKey]}
                className={[
                  'tree-icon-chip flex min-h-7 min-w-0 items-center justify-center gap-1 rounded-md border px-1 transition',
                  isActive
                    ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800'
                    : 'border-gray-200 bg-gray-50 hover:border-slate-300 hover:bg-white',
                ].join(' ')}
                onClick={() => setTreeColorPalette(paletteKey)}
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full border"
                  style={{
                    backgroundColor: palette.swatch,
                    borderColor: palette.swatchBorder,
                  }}
                />
                <span className="truncate text-[10px] font-semibold text-slate-700">
                  {paletteLabels[paletteKey]}
                </span>
              </button>
            );
          })}
        </div>
      </ControlSection>

      <ControlSection title="Zoom" icon={Plus} defaultOpen>
        <div className="grid min-w-0 grid-cols-2 gap-1">
          <CompactControlButton icon={ArrowUpToLine} label="Aumentar" onClick={() => dispatchTreeAction('zoom-in')} />
          <CompactControlButton icon={ArrowDownToLine} label="Diminuir" onClick={() => dispatchTreeAction('zoom-out')} />
        </div>
      </ControlSection>

      <ControlSection title="Exportar" icon={Printer} defaultOpen>
        <div className="grid min-w-0 grid-cols-2 gap-1">
          <CompactControlButton icon={Scan} label="Área" onClick={() => dispatchTreeAction('select-area')} />
          <CompactControlButton icon={ImageDown} label="Imagem" onClick={() => dispatchTreeAction('save-image')} />
          <CompactControlButton icon={FileDown} label="PDF" onClick={() => dispatchTreeAction('save-pdf')} />
          <CompactControlButton icon={Printer} label="Imprimir" onClick={() => dispatchTreeAction('print')} />
        </div>
      </ControlSection>

      <ControlSection title="Destacar" icon={Sparkles} defaultOpen>
        <div className="grid min-w-0 grid-cols-3 gap-1">
          {highlightOptions.map((option) => {
            const Icon = option.icon;
            return (
              <IconToggleButton
                key={option.key}
                icon={Icon}
                label={option.label}
                active={activeHighlights[option.key]}
                onClick={() => toggleHighlight(option.key)}
              />
            );
          })}
        </div>
      </ControlSection>
    </section>
  );
}

function ControlSection({
  title,
  icon: Icon,
  defaultOpen,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="tree-control-section min-w-0 rounded-md border border-gray-100 bg-gray-50/75" open={defaultOpen}>
      <summary className="flex min-h-6 cursor-pointer list-none items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 [&::-webkit-details-marker]:hidden">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{title}</span>
      </summary>
      <div className="min-w-0 px-1.5 pb-1.5">
        {children}
      </div>
    </details>
  );
}

function IconToggleButton({
  icon: Icon,
  label,
  active,
  mobileOnly,
  title,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  mobileOnly?: boolean;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      title={title ?? label}
      className={[
        'tree-icon-chip flex min-h-7 min-w-0 items-center justify-center gap-1 rounded-md border px-1.5 text-[10px] font-semibold leading-tight transition',
        mobileOnly ? 'lg:hidden' : '',
        active
          ? 'border-blue-300 bg-blue-50 text-blue-900 shadow-sm'
          : 'border-gray-200 bg-white text-gray-600 hover:bg-slate-50 hover:text-gray-900',
      ].join(' ')}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
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
      className="tree-icon-chip flex min-h-7 min-w-0 items-center justify-center gap-1 rounded-md border border-gray-200 bg-white px-1.5 text-[10px] font-semibold leading-tight text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
