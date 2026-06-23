import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Baby,
  ClipboardList,
  Cross,
  Eye,
  FileDown,
  HeartHandshake,
  ImageDown,
  Network,
  Printer,
  Scan,
  Tally1,
  Tally2,
  Tally3,
  UserRound,
  UsersRound,
} from 'lucide-react';

import {
  TREE_COLOR_PALETTES,
  TREE_COLOR_PALETTE_STORAGE_KEY,
  type TreeColorPalette,
} from '../../components/FamilyTree/treeColorPalettes';
import type { DirectRelativeFilters, DirectRelativeGroup } from '../../components/FamilyTree/types';
import { getPathForTreeViewMode, type TreeViewMode } from '../../components/FamilyTree/treeViewMode';
import {
  applyTreePalette,
  dispatchTreeAction,
  getStoredPalette,
  type SidebarTreeAction,
} from './SidebarPanelTabs';

type ViewAsPersonOption = { id: string; label: string };
type LifeStatusFilterKey = 'vivos' | 'falecidos' | 'pets';
type DirectRelationCounts = Record<DirectRelativeGroup, number>;

const paletteOptions: TreeColorPalette[] = ['white', 'visual', 'orange', 'brown'];

const viewOptions: Array<{
  key: TreeViewMode;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: 'mapa-familiar',
    label: 'Ãrvore Familiar',
    subtitle: 'VisÃ£o de parentes por grupos',
    icon: Tally3,
  },
  {
    key: 'mapa-familiar-horizontal',
    label: 'Linha Geracional',
    subtitle: 'VisualizaÃ§Ã£o cronolÃ³gica por geraÃ§Ãµes',
    icon: Network,
  },
];

const exportOptions: Array<{
  action: SidebarTreeAction;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { action: 'select-area', label: 'Ãrea', icon: Scan },
  { action: 'save-image', label: 'Imagem', icon: ImageDown },
  { action: 'save-pdf', label: 'PDF', icon: FileDown },
  { action: 'print', label: 'Imprimir', icon: Printer },
];

const groupSections: Array<{
  title: string;
  rows: Array<{
    keys: DirectRelativeGroup[];
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}> = [
  {
    title: 'NÃºcleo',
    rows: [
      { keys: ['pais'], label: 'Pais', icon: UsersRound },
      { keys: ['filhos'], label: 'Filhos', icon: Baby },
      { keys: ['netos'], label: 'Netos', icon: Baby },
      { keys: ['irmaos'], label: 'IrmÃ£os', icon: UsersRound },
    ],
  },
  {
    title: 'Ascendentes',
    rows: [
      { keys: ['avos'], label: 'AvÃ³s', icon: Tally3 },
      { keys: ['bisavos'], label: 'BisavÃ³s', icon: Tally2 },
      { keys: ['tataravos'], label: 'TataravÃ³s', icon: Tally1 },
    ],
  },
  {
    title: 'Colaterais',
    rows: [
      { keys: ['tios'], label: 'Tios', icon: Network },
      { keys: ['primos'], label: 'Primos', icon: UsersRound },
      { keys: ['sobrinhos'], label: 'Sobrinhos', icon: UsersRound },
    ],
  },
];

function getCurrentTreeViewMode(pathname: string): TreeViewMode {
  if (pathname.startsWith('/mapa-familiar-horizontal')) return 'mapa-familiar-horizontal';
  return 'mapa-familiar';
}

function getGroupActive(filters: DirectRelativeFilters, keys: DirectRelativeGroup[]) {
  return keys.every((key) => filters[key]);
}

function getGroupCount(counts: DirectRelationCounts, keys: DirectRelativeGroup[]) {
  return keys.reduce((total, key) => total + (counts[key] ?? 0), 0);
}

export function DesktopTreeVisualizationPanel({
  showViewAsSelector = true,
  viewAsPersonValue = '',
  defaultViewAsPersonLabel = 'Sua view padrÃ£o',
  viewAsPersonOptions,
  onViewAsPersonChange,
  totalPeople,
  aliveCount,
  deceasedCount,
  registeredCount,
  personFilters,
  onTogglePersonFilter,
  directRelativeFilters,
  directRelationCounts,
  onToggleDirectRelative,
}: {
  showViewAsSelector?: boolean;
  viewAsPersonValue?: string;
  defaultViewAsPersonLabel?: string;
  viewAsPersonOptions: ViewAsPersonOption[];
  onViewAsPersonChange: (value: string) => void;
  totalPeople: number;
  aliveCount: number;
  deceasedCount: number;
  registeredCount: number;
  personFilters: Record<LifeStatusFilterKey, boolean>;
  onTogglePersonFilter: (key: LifeStatusFilterKey) => void;
  directRelativeFilters: DirectRelativeFilters;
  directRelationCounts: DirectRelationCounts;
  onToggleDirectRelative: (key: DirectRelativeGroup) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentViewMode = getCurrentTreeViewMode(location.pathname);
  const [treeColorPalette, setTreeColorPalette] = React.useState<TreeColorPalette>(getStoredPalette);
  React.useEffect(() => {
    applyTreePalette(treeColorPalette);
    window.localStorage.setItem(TREE_COLOR_PALETTE_STORAGE_KEY, treeColorPalette);
  }, [treeColorPalette]);

  const handleViewChange = React.useCallback((viewMode: TreeViewMode) => {
    const nextPath = getPathForTreeViewMode(viewMode);
    if (location.pathname === nextPath) return;
    navigate(`${nextPath}${location.search}`, { replace: false });
  }, [location.pathname, location.search, navigate]);

  const handleExportAction = React.useCallback((action: SidebarTreeAction) => {
    dispatchTreeAction(action);
  }, []);

  const handleViewAsChange = React.useCallback((nextValue: string) => {
    if (nextValue === '__view_as_placeholder__') return;
    if (nextValue.trim() && !directRelativeFilters.conjuge) {
      onToggleDirectRelative('conjuge');
    }

    onViewAsPersonChange(nextValue);
  }, [directRelativeFilters.conjuge, onToggleDirectRelative, onViewAsPersonChange]);

  const handleGroupToggle = React.useCallback((keys: DirectRelativeGroup[]) => {
    const allActive = getGroupActive(directRelativeFilters, keys);

    keys
      .filter((key) => directRelativeFilters[key] === allActive)
      .forEach((key) => onToggleDirectRelative(key));
  }, [directRelativeFilters, onToggleDirectRelative]);

  return (
    <div className="desktop-tree-visualization-panel-shell" data-tree-export-ignore="true">
      <section
        className="desktop-tree-visualization-panel"
        aria-label="VisualizaÃ§Ã£o da Ã¡rvore"
        data-tree-export-ignore="true"
      >
        <div className="desktop-tree-panel-header">
          <div className="desktop-tree-panel-title-group">
            <span className="desktop-tree-panel-eye" aria-hidden="true">
              <Eye />
            </span>
            <h2 className="desktop-tree-panel-title">VisualizaÃ§Ã£o</h2>
          </div>
        </div>

        {showViewAsSelector && (
          <select
            value={viewAsPersonValue}
            onChange={(event) => handleViewAsChange(event.target.value)}
            className="desktop-tree-view-select"
            aria-label="Visualizar Ã¡rvore como outra pessoa"
          >
            <option value="" hidden>{defaultViewAsPersonLabel}</option>
            <option value="__view_as_placeholder__" disabled>Visualize a árvore como...</option>
            {viewAsPersonOptions.map((pessoa) => (
              <option key={pessoa.id} value={pessoa.id}>
                {pessoa.label}
              </option>
            ))}
          </select>
        )}

        <div className="desktop-tree-palette-row" aria-label="Tema da Ã¡rvore">
          {paletteOptions.map((paletteKey) => {
            const palette = TREE_COLOR_PALETTES[paletteKey];
            const active = treeColorPalette === paletteKey;

            return (
              <button
                key={paletteKey}
                type="button"
                className="desktop-tree-palette-button"
                data-active={active ? 'true' : 'false'}
                aria-label={palette.ariaLabel}
                aria-pressed={active}
                title={palette.label}
                onClick={() => setTreeColorPalette(paletteKey)}
              >
                <span style={{ backgroundColor: palette.swatch, borderColor: palette.swatchBorder }} />
              </button>
            );
          })}
        </div>

        <div className="desktop-tree-view-mode-grid">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            const active = currentViewMode === option.key;

            return (
              <button
                key={option.key}
                type="button"
                className="desktop-tree-view-mode-card"
                data-active={active ? 'true' : 'false'}
                aria-pressed={active}
                onClick={() => handleViewChange(option.key)}
              >
                <Icon />
                <span className="desktop-tree-view-mode-title">{option.label}</span>
                <span className="desktop-tree-view-mode-subtitle">{option.subtitle}</span>
              </button>
            );
          })}
        </div>

        <div className="desktop-tree-panel-divider" />

        <h3 className="desktop-tree-section-title">Resumo</h3>

        <div className="desktop-tree-summary-grid">
          <SummaryCard tone="blue" icon={UsersRound} label="Pessoas" value={totalPeople} />
          <SummaryCard
            tone="green"
            icon={UserRound}
            label="Vivos"
            value={aliveCount}
            active={personFilters.vivos}
            onToggle={() => onTogglePersonFilter('vivos')}
          />
          <SummaryCard
            tone="purple"
            icon={Cross}
            label="Falecidos"
            value={deceasedCount}
            active={personFilters.falecidos}
            onToggle={() => onTogglePersonFilter('falecidos')}
          />
          <SummaryCard tone="orange" icon={ClipboardList} label="Cadastrados" value={registeredCount} />
        </div>

        <div className="desktop-tree-panel-divider desktop-tree-groups-divider" />

        <div className="desktop-tree-family-groups">
          {groupSections.map((section) => (
            <section key={section.title} className="desktop-tree-family-group-card" aria-label={section.title}>
              <h4>{section.title}</h4>

              <div className="desktop-tree-family-group-row-list">
                {section.rows.map((row) => {
                  const active = getGroupActive(directRelativeFilters, row.keys);

                  return (
                    <button
                      key={row.label}
                      type="button"
                      className="desktop-tree-family-group-row"
                      data-active={active ? 'true' : 'false'}
                      aria-pressed={active}
                      onClick={() => handleGroupToggle(row.keys)}
                      title={active ? `Ocultar ${row.label}` : `Mostrar ${row.label}`}
                    >
                      <span>{row.label}</span>
                      <strong>{getGroupCount(directRelationCounts, row.keys)}</strong>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="desktop-tree-export-panel" aria-label="Exportar Ã¡rvore" data-tree-export-ignore="true">
          <h3 className="desktop-tree-export-title">Exportar</h3>
          <div className="desktop-tree-export-actions">
            {exportOptions.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  key={option.action}
                  type="button"
                  className="desktop-tree-export-action-button"
                  onClick={() => handleExportAction(option.action)}
                >
                  <Icon />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="desktop-tree-final-filters">
          <button
            type="button"
            className="desktop-tree-final-filter-button"
            aria-pressed={directRelativeFilters.conjuge}
            data-active={directRelativeFilters.conjuge ? 'true' : 'false'}
            onClick={() => onToggleDirectRelative('conjuge')}
          >
            <HeartHandshake />
            <span>Exibir cÃ´njuges de tios, primos etc</span>
          </button>

          <button
            type="button"
            className="desktop-tree-final-filter-button"
            disabled
            aria-label="Apenas meus familiares. Funcionalidade serÃ¡ definida posteriormente."
            title="Funcionalidade serÃ¡ definida posteriormente."
          >
            <UsersRound />
            <span>Apenas meus familiares</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  tone,
  icon: Icon,
  label,
  value,
  active,
  onToggle,
}: {
  tone: 'blue' | 'green' | 'purple' | 'orange';
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  active?: boolean;
  onToggle?: () => void;
}) {
  const content = (
    <>
      <Icon />
      <strong>{value}</strong>
      <span>{label}</span>
    </>
  );

  if (!onToggle) {
    return (
      <div className="desktop-tree-summary-card" data-tone={tone}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="desktop-tree-summary-card"
      data-tone={tone}
      data-active={active ? 'true' : 'false'}
      aria-pressed={Boolean(active)}
      onClick={onToggle}
    >
      {content}
    </button>
  );
}
