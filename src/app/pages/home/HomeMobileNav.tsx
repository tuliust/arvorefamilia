import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  FileDown,
  Heart,
  Home,
  ImageDown,
  Layers,
  Map,
  MessageCircle,
  Printer,
  Scan,
  Star,
  UsersRound,
} from 'lucide-react';
import {
  MobileFamilyMapToolbar,
  type MobileFamilyMapToolbarAction,
} from '../../components/FamilyTree/MobileFamilyMapToolbar';
import {
  TREE_COLOR_PALETTE_CSS_VARIABLES,
  TREE_COLOR_PALETTE_STORAGE_KEY,
  TREE_COLOR_PALETTES,
  isTreeColorPalette,
  type TreeColorPalette,
} from '../../components/FamilyTree/treeColorPalettes';
import { useAuth } from '../../contexts/AuthContext';
import { obterTodasPessoas } from '../../services/dataService';
import { getPrimaryLinkedPersonWithPessoa } from '../../services/memberProfileService';
import { contarNotificacoesNaoLidasSupabase } from '../../services/userEngagementService';
import type { Pessoa } from '../../types';
import { dispatchTreeAction, type SidebarTreeAction } from './SidebarPanelTabs';

interface HomeMobileNavProps {
  legendOpen: boolean;
  onToggleLegend: () => void;
  navigateFromHome: (path: string) => void;
}

type ViewAsPersonOption = { id: string; label: string };

function getCurrentPathname() {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

function getCurrentSearchParams() {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function getFirstName(value?: string | null) {
  const source = String(value ?? '').trim();
  if (!source) return '';

  const beforeEmail = source.includes('@') ? source.split('@')[0] : source;
  return beforeEmail.split(/\s+/)[0] || '';
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

function formatFamilyViewLabel(value: string) {
  const clean = value.trim();
  if (!clean) return 'Família principal';
  if (clean.toLocaleLowerCase('pt-BR').startsWith('família de ')) return clean;
  return `Família de ${clean}`;
}

const mobileTreeToolbarTopClass = 'top-[calc(env(safe-area-inset-top,0px)+5.05rem)]';
const mobileTreeViewPopoverTopClass = 'top-[calc(env(safe-area-inset-top,0px)+8.15rem)]';
const paletteOptions: TreeColorPalette[] = ['white', 'visual', 'orange', 'brown'];

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

const EXPORT_OPTIONS: Array<{
  action: SidebarTreeAction;
  label: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { action: 'select-area', label: 'Área', ariaLabel: 'Selecionar área para exportação', icon: Scan },
  { action: 'save-image', label: 'Imagem', ariaLabel: 'Exportar como imagem', icon: ImageDown },
  { action: 'save-pdf', label: 'PDF', ariaLabel: 'Exportar como PDF', icon: FileDown },
  { action: 'print', label: 'Imprimir', ariaLabel: 'Imprimir árvore', icon: Printer },
];

const FILTER_OPTIONS: Array<{
  value: boolean;
  label: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: true,
    label: 'Exibir cônjuges de tios, primos etc',
    ariaLabel: 'Exibir cônjuges de tios, primos e outros parentes',
    icon: Heart,
  },
  {
    value: false,
    label: 'Apenas meus familiares',
    ariaLabel: 'Exibir apenas meus familiares',
    icon: UsersRound,
  },
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
  const [treeColorPalette, setTreeColorPalette] = useState<TreeColorPalette>(getStoredPalette);
  const [viewAsPersonOptions, setViewAsPersonOptions] = useState<ViewAsPersonOption[]>([]);
  const [defaultViewAsLabel, setDefaultViewAsLabel] = useState('Família principal');
  const [showExtendedSpouseFilters, setShowExtendedSpouseFilters] = useState(true);

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
    applyTreePalette(treeColorPalette);
    window.localStorage.setItem(TREE_COLOR_PALETTE_STORAGE_KEY, treeColorPalette);
  }, [treeColorPalette]);

  useEffect(() => {
    document.documentElement.dataset.mobileFamilySpouseScope = showExtendedSpouseFilters ? 'extended' : 'direct';
  }, [showExtendedSpouseFilters]);

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
  const currentViewAsPersonValue = getCurrentSearchParams().get('pessoa')?.trim() || '';
  const isDirectFamilyMap = pathname === '/mapa-familiar' || pathname === '/mapa-familiar-horizontal';
  const selectedViewAsPersonOption = useMemo(
    () => viewAsPersonOptions.find((option) => option.id === currentViewAsPersonValue),
    [currentViewAsPersonValue, viewAsPersonOptions]
  );

  useEffect(() => {
    if (!isDirectFamilyMap) {
      setActiveToolbarAction(null);
    }
  }, [isDirectFamilyMap, pathname]);

  useEffect(() => {
    const metadataName = String(
      user?.user_metadata?.nome_exibicao ||
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      ''
    );
    const fallbackLabel = formatFamilyViewLabel(getFirstName(metadataName));
    setDefaultViewAsLabel(fallbackLabel);

    if (!user?.id) return;

    let cancelled = false;

    async function loadDefaultViewerLabel() {
      try {
        const linkedPersonResult = await getPrimaryLinkedPersonWithPessoa(user.id);
        if (cancelled) return;

        const linkedPersonName = linkedPersonResult.data?.pessoa?.nome_completo;
        setDefaultViewAsLabel(formatFamilyViewLabel(getFirstName(linkedPersonName) || getFirstName(metadataName)));
      } catch {
        if (!cancelled) {
          setDefaultViewAsLabel(fallbackLabel);
        }
      }
    }

    void loadDefaultViewerLabel();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!isDirectFamilyMap) return;

    let cancelled = false;

    async function loadViewAsOptions() {
      try {
        const pessoas = await obterTodasPessoas();
        if (cancelled) return;

        setViewAsPersonOptions(Array.isArray(pessoas) ? buildViewAsPersonOptions(pessoas) : []);
      } catch (error) {
        if (!cancelled) {
          console.error('Erro ao carregar pessoas para Visualização mobile:', error);
          setViewAsPersonOptions([]);
        }
      }
    }

    void loadViewAsOptions();

    return () => {
      cancelled = true;
    };
  }, [isDirectFamilyMap]);

  useEffect(() => {
    if (
      !legendOpen &&
      activeToolbarAction &&
      activeToolbarAction !== 'visualizacao' &&
      activeToolbarAction !== 'formato' &&
      activeToolbarAction !== 'cor' &&
      activeToolbarAction !== 'grupos' &&
      activeToolbarAction !== 'exportar'
    ) {
      setActiveToolbarAction(null);
    }
  }, [activeToolbarAction, legendOpen]);

  const openMobileControlsPanel = useCallback((action: MobileFamilyMapToolbarAction) => {
    if (action === 'visualizacao' || action === 'formato' || action === 'cor' || action === 'grupos' || action === 'exportar') {
      setActiveToolbarAction((current) => (current === action ? null : action));

      if (legendOpen) onToggleLegend();
      return;
    }

    setActiveToolbarAction(action);

    if (!legendOpen) onToggleLegend();
  }, [legendOpen, onToggleLegend]);

  const handleViewAsPersonChange = useCallback((nextValue: string) => {
    const params = getCurrentSearchParams();

    if (nextValue) {
      params.set('pessoa', nextValue);
    } else {
      params.delete('pessoa');
    }

    setActiveToolbarAction(null);

    const query = params.toString();
    navigateFromHome(`${pathname}${query ? `?${query}` : ''}`);
  }, [navigateFromHome, pathname]);

  const handleViewOptionClick = useCallback((path: '/mapa-familiar' | '/mapa-familiar-horizontal') => {
    setActiveToolbarAction(null);

    if (pathname === path) return;

    const query = typeof window === 'undefined' ? '' : window.location.search;
    navigateFromHome(`${path}${query}`);
  }, [navigateFromHome, pathname]);

  const handleExportOptionClick = useCallback((action: SidebarTreeAction) => {
    setActiveToolbarAction(null);
    dispatchTreeAction(action);
  }, []);

  const handleFilterOptionClick = useCallback((nextValue: boolean) => {
    setShowExtendedSpouseFilters(nextValue);
    setActiveToolbarAction(null);
  }, []);

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
              <label className="mx-auto block max-w-md">
                <span className="sr-only">Selecionar visualizador</span>
                <span className="relative block">
                  <select
                    value={currentViewAsPersonValue}
                    onChange={(event) => handleViewAsPersonChange(event.target.value)}
                    className="h-9 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-[11px] font-extrabold text-blue-950 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    aria-label="Selecionar visualizador da árvore"
                  >
                    <option value="">{defaultViewAsLabel}</option>
                    {currentViewAsPersonValue && !selectedViewAsPersonOption && (
                      <option value={currentViewAsPersonValue}>Visualizador selecionado</option>
                    )}
                    {viewAsPersonOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {formatFamilyViewLabel(option.label)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />
                </span>
              </label>
            </div>
          )}

          {activeToolbarAction === 'formato' && (
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

          {activeToolbarAction === 'cor' && (
            <div
              className={`fixed inset-x-3 ${mobileTreeViewPopoverTopClass} z-[10001] md:hidden`}
              data-tree-export-ignore="true"
            >
              <div
                className="mx-auto flex max-w-sm items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur"
                aria-label="Paletas de cores da árvore"
              >
                {paletteOptions.map((paletteKey) => {
                  const palette = TREE_COLOR_PALETTES[paletteKey];
                  const active = paletteKey === treeColorPalette;

                  return (
                    <button
                      key={paletteKey}
                      type="button"
                      aria-label={palette.ariaLabel}
                      aria-pressed={active}
                      title={palette.label}
                      onClick={() => setTreeColorPalette(paletteKey)}
                      className="flex h-8 min-w-0 flex-1 items-center justify-center rounded-lg transition active:scale-95"
                    >
                      <span
                        className={[
                          'h-4 w-4 shrink-0 rounded-full border transition',
                          active ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-white' : '',
                        ].join(' ')}
                        style={{ backgroundColor: palette.swatch, borderColor: palette.swatchBorder }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeToolbarAction === 'grupos' && (
            <div
              className={`fixed inset-x-2 ${mobileTreeViewPopoverTopClass} z-[10001] md:hidden`}
              data-tree-export-ignore="true"
            >
              <div
                className="mx-auto grid max-w-md grid-cols-2 gap-1.5"
                role="dialog"
                aria-label="Filtros do mapa familiar"
              >
                {FILTER_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = showExtendedSpouseFilters === option.value;

                  return (
                    <button
                      key={String(option.value)}
                      type="button"
                      aria-label={option.ariaLabel}
                      aria-pressed={active}
                      onClick={() => handleFilterOptionClick(option.value)}
                      className={[
                        'flex min-h-[42px] min-w-0 items-center justify-center gap-1.5 rounded-xl border bg-white px-1.5 py-1.5 text-center shadow-sm transition active:scale-[0.99]',
                        active
                          ? 'border-blue-500 bg-blue-50 text-blue-950 ring-1 ring-blue-500'
                          : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-950',
                      ].join(' ')}
                    >
                      <Icon className={['h-4 w-4 shrink-0', active ? 'text-blue-700' : 'text-slate-400'].join(' ')} />
                      <span className="min-w-0 text-[9px] font-extrabold leading-[1.05] tracking-[-0.02em]">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeToolbarAction === 'exportar' && (
            <div
              className={`fixed inset-x-2 ${mobileTreeViewPopoverTopClass} z-[10001] md:hidden`}
              data-tree-export-ignore="true"
            >
              <div
                className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-sm backdrop-blur"
                role="dialog"
                aria-label="Exportar mapa familiar"
              >
                <div className="px-1 pb-1 text-[11px] font-extrabold leading-tight text-blue-950">
                  Exportar
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {EXPORT_OPTIONS.map((option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.action}
                        type="button"
                        aria-label={option.ariaLabel}
                        onClick={() => handleExportOptionClick(option.action)}
                        className="flex h-7 min-w-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-extrabold leading-none text-blue-950 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 active:scale-[0.99]"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
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
