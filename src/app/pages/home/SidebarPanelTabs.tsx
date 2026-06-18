import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
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
} from 'lucide-react';

import {
  TREE_COLOR_PALETTE_CSS_VARIABLES,
  TREE_COLOR_PALETTE_STORAGE_KEY,
  TREE_COLOR_PALETTES,
  isTreeColorPalette,
  type TreeColorPalette,
} from '../../components/FamilyTree/treeColorPalettes';
import { getPathForTreeViewMode, type TreeViewMode } from '../../components/FamilyTree/treeViewMode';
import { obterTodasPessoas } from '../../services/dataService';
import type { Pessoa } from '../../types';

export type SidebarTreeAction =
  | 'zoom-in'
  | 'zoom-out'
  | 'restore-view'
  | 'select-area'
  | 'save-image'
  | 'save-pdf'
  | 'print';

export const SIDEBAR_TREE_ACTION_EVENT = 'arvore-family-tree-action';

type ViewAsPersonOption = { id: string; label: string };

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
  subtitle: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: 'mapa-familiar',
    label: 'Linha Geracional',
    subtitle: 'visualização cronológica por gerações',
    ariaLabel: 'Alternar para Linha Geracional',
    icon: Map,
  },
  {
    key: 'mapa-familiar-horizontal',
    label: 'Árvore Familiar',
    subtitle: 'visão de parentesco',
    ariaLabel: 'Alternar para Árvore Familiar',
    icon: Layers,
  },
];

type ControlFlyout = 'colors' | 'export' | null;

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

export function getStoredPalette(): TreeColorPalette {
  if (typeof window === 'undefined') return 'white';

  const stored = window.localStorage.getItem(TREE_COLOR_PALETTE_STORAGE_KEY);
  return isTreeColorPalette(stored) ? stored : 'white';
}

export function applyTreePalette(value: TreeColorPalette) {
  if (typeof document === 'undefined') return;

  const palette = TREE_COLOR_PALETTES[value];
  const root = document.documentElement;

  root.dataset.treeColorPalette = value;

  TREE_COLOR_PALETTE_CSS_VARIABLES.forEach((variableName) => {
    root.style.setProperty(variableName, palette.cssVariables[variableName]);
  });
}

function getCurrentTreeViewMode(pathname: string): TreeViewMode {
  if (pathname.startsWith('/mapa-familiar-horizontal')) return 'mapa-familiar-horizontal';
  return 'mapa-familiar';
}

export function dispatchTreeAction(action: SidebarTreeAction) {
  window.dispatchEvent(new CustomEvent<SidebarTreeAction>(SIDEBAR_TREE_ACTION_EVENT, { detail: action }));
}

function getShortPersonName(pessoa: Pessoa) {
  const source = String(pessoa.nome_completo || pessoa.id || '').trim();
  const parts = source.split(/\s+/).filter(Boolean);

  return parts.slice(0, 2).join(' ') || pessoa.id;
}

function buildViewAsPersonOptions(pessoas: Pessoa[]): ViewAsPersonOption[] {
  return [...pessoas]
    .filter((pessoa) => Boolean(pessoa.id))
    .map((pessoa) => ({
      id: pessoa.id,
      label: getShortPersonName(pessoa),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
}

export function SidebarPanelTabs({
  mobileControls = false,
  mobileGroupsActive = false,
  onMobileGroupsOpenChange,
  showViewAsSelector,
  viewAsPersonValue,
  viewAsPersonOptions,
  onViewAsPersonChange,
}: {
  mobileControls?: boolean;
  mobileGroupsActive?: boolean;
  onMobileGroupsOpenChange?: (open: boolean) => void;
  showViewAsSelector?: boolean;
  viewAsPersonValue?: string;
  viewAsPersonOptions?: ViewAsPersonOption[];
  onViewAsPersonChange?: (value: string) => void;
} = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentViewMode = getCurrentTreeViewMode(location.pathname);
  const [treeColorPalette, setTreeColorPalette] = React.useState<TreeColorPalette>(getStoredPalette);
  const [activeFlyout, setActiveFlyout] = React.useState<ControlFlyout>(null);
  const [fallbackViewAsPersonOptions, setFallbackViewAsPersonOptions] = React.useState<ViewAsPersonOption[]>([]);

  const locationViewAsPersonId = React.useMemo(() => {
    return new URLSearchParams(location.search).get('pessoa')?.trim() || '';
  }, [location.search]);
  const effectiveViewAsPersonOptions = viewAsPersonOptions ?? fallbackViewAsPersonOptions;
  const effectiveViewAsPersonValue = viewAsPersonValue ?? locationViewAsPersonId;
  const shouldRenderViewAsSelector = showViewAsSelector ?? true;

  React.useEffect(() => {
    applyTreePalette(treeColorPalette);
    window.localStorage.setItem(TREE_COLOR_PALETTE_STORAGE_KEY, treeColorPalette);
  }, [treeColorPalette]);

  React.useEffect(() => {
    if (viewAsPersonOptions || showViewAsSelector === false) return;

    let cancelled = false;

    async function loadViewAsPeople() {
      try {
        const pessoas = await obterTodasPessoas();
        if (cancelled) return;

        setFallbackViewAsPersonOptions(Array.isArray(pessoas) ? buildViewAsPersonOptions(pessoas) : []);
      } catch (error) {
        if (!cancelled) {
          console.error('Erro ao carregar pessoas para Visualizar como:', error);
          setFallbackViewAsPersonOptions([]);
        }
      }
    }

    void loadViewAsPeople();

    return () => {
      cancelled = true;
    };
  }, [showViewAsSelector, viewAsPersonOptions]);

  React.useEffect(() => {
    setActiveFlyout(null);
  }, [location.pathname]);

  const handleViewAsPersonChange = React.useCallback((nextValue: string) => {
    if (nextValue === '__view_as_label__') return;

    if (onViewAsPersonChange) {
      onViewAsPersonChange(nextValue);
      return;
    }

    const params = new URLSearchParams(location.search);

    if (nextValue) {
      params.set('pessoa', nextValue);
    } else {
      params.delete('pessoa');
    }

    const query = params.toString();
    navigate(`${location.pathname}${query ? `?${query}` : ''}`, { replace: false });
  }, [location.pathname, location.search, navigate, onViewAsPersonChange]);

  const handleViewChange = React.useCallback((viewMode: TreeViewMode) => {
    const nextPath = getPathForTreeViewMode(viewMode);
    if (location.pathname === nextPath) return;
    navigate(`${nextPath}${location.search}`, { replace: false });
  }, [location.pathname, location.search, navigate]);

  const handleRestoreView = React.useCallback(() => {
    dispatchTreeAction('restore-view');
  }, []);

  const toggleFlyout = React.useCallback((flyout: Exclude<ControlFlyout, null>) => {
    setActiveFlyout((current) => (current === flyout ? null : flyout));
  }, []);

  const handleFlyoutToggle = React.useCallback((flyout: Exclude<ControlFlyout, null>) => {
    if (mobileControls) onMobileGroupsOpenChange?.(false);
    toggleFlyout(flyout);
  }, [mobileControls, onMobileGroupsOpenChange, toggleFlyout]);

  const handleMobileGroupsToggle = React.useCallback(() => {
    setActiveFlyout(null);
    onMobileGroupsOpenChange?.(!mobileGroupsActive);
  }, [mobileGroupsActive, onMobileGroupsOpenChange]);

  return (
    <div className="tree-panel-control-stack flex w-full min-w-0 flex-col gap-[clamp(0.55rem,1.22vh,0.78rem)]" data-tour-target="tree-controls" data-tree-export-ignore="true">
      {!mobileControls && (
        <div className="tree-external-zoom-actions flex w-full min-w-0 items-center gap-1.5 pr-[clamp(40px,5vh,44px)]">
          <TopIconButton icon={Plus} label="Aumentar zoom" visibleLabel="Zoom" onClick={() => dispatchTreeAction('zoom-in')} />
          <TopIconButton icon={Minus} label="Diminuir zoom" visibleLabel="Zoom" onClick={() => dispatchTreeAction('zoom-out')} />
          <TopIconButton icon={Scan} label="Restaurar visualização" onClick={handleRestoreView} />
        </div>
      )}

      <section aria-label="Controles principais da árvore" className="tree-control-panel flex w-full min-w-0 self-stretch flex-col gap-[clamp(0.42rem,0.95vh,0.62rem)] rounded-lg border border-gray-200 bg-white p-[clamp(0.42rem,0.9vh,0.56rem)] shadow-sm">
        {shouldRenderViewAsSelector && (
          <label className="flex min-w-0 flex-col gap-1 rounded-lg border border-amber-100 bg-amber-50/60 px-2 py-1.5 shadow-sm" data-tree-export-ignore="true">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-800">Visualizar como</span>
            <select
              value={effectiveViewAsPersonValue}
              onChange={(event) => handleViewAsPersonChange(event.target.value)}
              className="h-8 w-full rounded-md border border-amber-100 bg-white px-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-200"
              aria-label="Visualizar árvore como outra pessoa"
            >
              <option value="__view_as_label__" disabled>
                Visualizar como...
              </option>
              <option value="">Sua view padrão</option>
              {effectiveViewAsPersonOptions.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>
                  {pessoa.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="tree-view-toggle grid min-w-0 grid-cols-1 gap-2 rounded-xl bg-slate-50 p-1.5 sm:grid-cols-2">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <ViewModeCardButton
                key={option.key}
                icon={Icon}
                label={option.label}
                subtitle={option.subtitle}
                active={currentViewMode === option.key}
                ariaLabel={option.ariaLabel}
                onClick={() => handleViewChange(option.key)}
              />
            );
          })}
        </div>

        <div className={["tree-primary-actions grid min-w-0 gap-1", mobileControls ? 'grid-cols-3' : 'grid-cols-2'].join(' ')}>
          <PrimaryControlButton icon={Brush} label={mobileControls ? 'Cor' : 'Cores'} active={activeFlyout === 'colors'} onClick={() => handleFlyoutToggle('colors')} />
          {mobileControls && (
            <PrimaryControlButton icon={PanelTop} label="Grupos" active={mobileGroupsActive} onClick={handleMobileGroupsToggle} />
          )}
          <PrimaryControlButton icon={Printer} label="Exportar" active={activeFlyout === 'export'} onClick={() => handleFlyoutToggle('export')} />
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

      </section>
    </div>
  );
}


function TopIconButton({
  icon: Icon,
  label,
  visibleLabel,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  visibleLabel?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={[
      'tree-top-icon-button flex h-[clamp(34px,4.75vh,38px)] shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      visibleLabel ? 'min-w-[clamp(70px,7.2vw,86px)] gap-1.5 px-2.5 text-[11px] font-semibold leading-none' : 'w-[clamp(34px,4.75vh,38px)]',
    ].join(' ')}>
      <Icon className="h-4 w-4 shrink-0" />
      {visibleLabel && <span className="truncate">{visibleLabel}</span>}
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

function ViewModeCardButton({
  icon: Icon,
  label,
  subtitle,
  active,
  ariaLabel,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subtitle: string;
  active: boolean;
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
      className={[
        'tree-view-mode-card flex min-h-[88px] min-w-0 flex-col items-center justify-start gap-1.5 rounded-xl border px-2.5 py-3 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        active
          ? 'border-blue-400 bg-blue-50 text-blue-950 shadow-sm ring-1 ring-blue-200'
          : 'border-gray-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-950',
      ].join(' ')}
    >
      <Icon className={['h-5 w-5 shrink-0', active ? 'text-blue-700' : 'text-slate-500'].join(' ')} />
      <span className="max-w-full text-[11px] font-extrabold leading-tight text-current">
        {label}
      </span>
      <span className="max-w-full text-[9px] font-semibold leading-tight text-slate-500">
        {subtitle}
      </span>
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
