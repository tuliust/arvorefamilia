import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  ArrowUpToLine,
  Brush,
  FileDown,
  ImageDown,
  Layers,
  Map,
  Minus,
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
  { key: 'mapa-familiar', label: 'Mapa Familiar', shortLabel: 'Vertical', icon: Map },
  { key: 'genealogia', label: 'Genealogia', shortLabel: 'Genealogia', mobileOnly: true, icon: PanelTop },
  { key: 'visao-completa', label: 'Mapa Horizontal', shortLabel: 'Horizontal', icon: Layers },
];

type HighlightKey = 'lines' | 'cards' | 'groups';
type ControlFlyout = 'colors' | 'export' | 'highlight' | null;

const highlightOptions: Array<{
  key: HighlightKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'lines', label: 'Linhas', icon: Minus },
  { key: 'cards', label: 'Cards', icon: Layers },
  { key: 'groups', label: 'Grupos', icon: PanelTop },
];

const exportOptions: Array<{
  action: SidebarTreeAction;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { action: 'select-area', label: 'Área', icon: Scan },
  { action: 'save-image', label: 'Imagem', icon: ImageDown },
  { action: 'save-pdf', label: 'PDF', icon: FileDown },
  { action: 'print', label: 'Imprimir', icon: Printer },
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
  if (pathname.startsWith('/mapa-horizontal')) return 'visao-completa';
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
  const [activeFlyout, setActiveFlyout] = React.useState<ControlFlyout>(null);
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

  const toggleFlyout = React.useCallback((flyout: Exclude<ControlFlyout, null>) => {
    setActiveFlyout((current) => (current === flyout ? null : flyout));
  }, []);

  return (
    <div className="tree-panel-control-stack flex min-w-0 flex-col gap-[clamp(0.32rem,0.75vh,0.5rem)]">
      <div className="tree-external-zoom-actions flex min-w-0 items-center gap-1">
        <TopIconButton icon={Plus} label="Aumentar zoom" onClick={() => dispatchTreeAction('zoom-in')} />
        <TopIconButton icon={Minus} label="Diminuir zoom" onClick={() => dispatchTreeAction('zoom-out')} />
        <TopIconButton icon={ArrowUpToLine} label="Restaurar visualização" onClick={() => dispatchTreeAction('zoom-out')} />
      </div>

      <section className="tree-control-panel flex min-w-0 flex-col gap-[clamp(0.26rem,0.62vh,0.38rem)] rounded-lg border border-gray-200 bg-white p-[clamp(0.36rem,0.78vh,0.48rem)] shadow-sm">
        <div className="tree-view-toggle grid min-w-0 grid-cols-2 gap-1 rounded-lg bg-slate-50 p-1">
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

        <div className="tree-primary-actions grid min-w-0 grid-cols-3 gap-1">
          <PrimaryControlButton icon={Brush} label="Cores" active={activeFlyout === 'colors'} onClick={() => toggleFlyout('colors')} />
          <PrimaryControlButton icon={Printer} label="Exportar" active={activeFlyout === 'export'} onClick={() => toggleFlyout('export')} />
          <PrimaryControlButton icon={Sparkles} label="Destacar" active={activeFlyout === 'highlight'} onClick={() => toggleFlyout('highlight')} />
        </div>

        {activeFlyout === 'colors' && (
          <div className="tree-control-flyout grid min-w-0 grid-cols-4 gap-1" aria-label="Paletas de cores da árvore">
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
                    'tree-palette-dot-button flex min-h-8 min-w-0 items-center justify-center rounded-lg border bg-white transition',
                    isActive ? 'border-slate-800 ring-1 ring-slate-800' : 'border-gray-200 hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                  onClick={() => setTreeColorPalette(paletteKey)}
                >
                  <span className="h-4 w-4 shrink-0 rounded-full border" style={{ backgroundColor: palette.swatch, borderColor: palette.swatchBorder }} />
                </button>
              );
            })}
          </div>
        )}

        {activeFlyout === 'export' && (
          <div className="tree-control-flyout grid min-w-0 grid-cols-2 gap-1">
            {exportOptions.map((option) => (
              <CompactControlButton key={option.action} icon={option.icon} label={option.label} onClick={() => dispatchTreeAction(option.action)} />
            ))}
          </div>
        )}

        {activeFlyout === 'highlight' && (
          <div className="tree-control-flyout grid min-w-0 grid-cols-3 gap-1">
            {highlightOptions.map((option) => {
              const Icon = option.icon;
              return (
                <IconToggleButton key={option.key} icon={Icon} label={option.label} active={activeHighlights[option.key]} onClick={() => toggleHighlight(option.key)} />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function TopIconButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className="tree-top-icon-button flex h-[clamp(32px,4.5vh,36px)] w-[clamp(32px,4.5vh,36px)] shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
      <Icon className="h-4 w-4" />
    </button>
  );
}

function PrimaryControlButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={[
      'tree-primary-control-button flex min-h-10 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-1 text-[10px] font-bold leading-tight transition',
      active ? 'border-blue-300 bg-blue-50 text-blue-900 shadow-sm' : 'border-gray-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900',
    ].join(' ')}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
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
    <button type="button" aria-pressed={active} onClick={onClick} title={title ?? label} className={[
      'tree-icon-chip flex min-h-7 min-w-0 items-center justify-center gap-1 rounded-md border px-1.5 text-[10px] font-semibold leading-tight transition',
      mobileOnly ? 'lg:hidden' : '',
      active ? 'border-blue-300 bg-blue-50 text-blue-900 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:bg-slate-50 hover:text-gray-900',
    ].join(' ')}>
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
    <button type="button" onClick={onClick} className="tree-icon-chip flex min-h-8 min-w-0 items-center justify-center gap-1 rounded-md border border-gray-200 bg-white px-1.5 text-[10px] font-semibold leading-tight text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
