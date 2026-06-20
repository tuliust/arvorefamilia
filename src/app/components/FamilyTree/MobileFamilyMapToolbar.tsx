import React from 'react';

export type MobileFamilyMapToolbarAction =
  | 'visualizacao'
  | 'formato'
  | 'cor'
  | 'grupos'
  | 'exportar'
  | 'zoom';

const TOOLBAR_ITEMS: Array<{
  action: Exclude<MobileFamilyMapToolbarAction, 'visualizacao' | 'exportar'>;
  label: string;
}> = [
  { action: 'formato', label: 'Formato' },
  { action: 'cor', label: 'Cor' },
  { action: 'grupos', label: 'Filtros' },
  { action: 'zoom', label: 'Zoom' },
];

interface MobileFamilyMapToolbarProps {
  activeAction?: MobileFamilyMapToolbarAction | null;
  className?: string;
  onAction?: (action: MobileFamilyMapToolbarAction) => void;
  onAddClick?: () => void;
}

function goToTreeView(path: '/mapa-familiar' | '/mapa-familiar-horizontal') {
  if (typeof window === 'undefined') return;
  const query = window.location.search || '';
  window.location.assign(`${path}${query}`);
}

function setTreePalette(value: 'white' | 'visual' | 'orange' | 'brown') {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('arvorefamilia.treeColorPalette', value);
  window.location.reload();
}

function setFamilyFilter(value: 'extended' | 'direct') {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.mobileFamilySpouseScope = value;
}

function restoreTreeView() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('arvorefamilia:tree-action', { detail: 'restore-view' }));
}

export function MobileFamilyMapToolbar({
  className = '',
  onAddClick,
}: MobileFamilyMapToolbarProps) {
  const [openAction, setOpenAction] = React.useState<MobileFamilyMapToolbarAction | null>(null);

  const toggleAction = React.useCallback((action: MobileFamilyMapToolbarAction) => {
    setOpenAction((current) => (current === action ? null : action));
  }, []);

  const closePanel = React.useCallback(() => setOpenAction(null), []);

  return (
    <nav
      aria-label="Controles do mapa familiar"
      className={[
        'border-b border-slate-200 bg-white/95 px-0 py-2 shadow-sm backdrop-blur md:hidden',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        top: 'calc(env(safe-area-inset-top,0px)+4.5rem)',
        pointerEvents: 'auto',
      }}
      data-mobile-family-map-toolbar="true"
      data-mobile-family-map-toolbar-active={openAction ? 'true' : undefined}
      data-tree-export-ignore="true"
    >
      <div className="mx-auto flex w-full max-w-md min-w-0 items-center justify-center gap-2.5 px-2">
        <div
          className="grid min-w-0 flex-1 grid-cols-4 items-center gap-1.5 rounded-full bg-slate-100 p-1"
          data-tour-target="mobile-tree-action-bar"
        >
          {TOOLBAR_ITEMS.map((item) => {
            const active = openAction === item.action;

            return (
              <button
                key={item.action}
                type="button"
                onClick={() => toggleAction(item.action)}
                aria-pressed={active || undefined}
                data-mobile-family-map-toolbar-action={item.action}
                className={[
                  'min-w-0 whitespace-nowrap rounded-full px-1 py-2 text-center text-[9px] font-extrabold leading-none tracking-[-0.025em] transition min-[360px]:text-[10px] min-[390px]:px-2',
                  active
                    ? 'bg-cyan-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white active:bg-white',
                ].join(' ')}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            closePanel();
            if (onAddClick) onAddClick();
          }}
          aria-label="Abrir painel completo de visualização"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl font-semibold leading-none text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 active:scale-95"
        >
          <span className="-mt-1" aria-hidden="true">+</span>
        </button>
      </div>

      {openAction && (
        <div className="mx-auto mt-2 w-[calc(100%-1rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-2 shadow-lg" data-tree-export-ignore="true">
          {openAction === 'formato' && (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => goToTreeView('/mapa-familiar')} className="min-h-14 rounded-xl border border-slate-200 bg-blue-50 px-2 text-xs font-extrabold text-blue-950">
                Linha Geracional
              </button>
              <button type="button" onClick={() => goToTreeView('/mapa-familiar-horizontal')} className="min-h-14 rounded-xl border border-slate-200 bg-white px-2 text-xs font-extrabold text-slate-900">
                Árvore Familiar
              </button>
            </div>
          )}

          {openAction === 'cor' && (
            <div className="grid grid-cols-4 gap-2">
              <button type="button" onClick={() => setTreePalette('white')} className="min-h-12 rounded-xl border border-slate-200 bg-white px-2 text-[10px] font-extrabold text-slate-900">Padrão</button>
              <button type="button" onClick={() => setTreePalette('visual')} className="min-h-12 rounded-xl border border-cyan-600 bg-cyan-50 px-2 text-[10px] font-extrabold text-cyan-900">Visual</button>
              <button type="button" onClick={() => setTreePalette('orange')} className="min-h-12 rounded-xl border border-orange-300 bg-orange-50 px-2 text-[10px] font-extrabold text-orange-900">Laranja</button>
              <button type="button" onClick={() => setTreePalette('brown')} className="min-h-12 rounded-xl border border-amber-700 bg-amber-50 px-2 text-[10px] font-extrabold text-amber-950">Marrom</button>
            </div>
          )}

          {openAction === 'grupos' && (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setFamilyFilter('extended'); closePanel(); }} className="min-h-12 rounded-xl border border-slate-200 bg-white px-2 text-[10px] font-extrabold text-slate-900">
                Exibir cônjuges
              </button>
              <button type="button" onClick={() => { setFamilyFilter('direct'); closePanel(); }} className="min-h-12 rounded-xl border border-slate-200 bg-white px-2 text-[10px] font-extrabold text-slate-900">
                Apenas familiares
              </button>
            </div>
          )}

          {openAction === 'zoom' && (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { restoreTreeView(); closePanel(); }} className="min-h-12 rounded-xl border border-slate-200 bg-white px-2 text-[10px] font-extrabold text-slate-900">
                Restaurar visão
              </button>
              <button type="button" onClick={closePanel} className="min-h-12 rounded-xl border border-slate-200 bg-white px-2 text-[10px] font-extrabold text-slate-900">
                Fechar
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}