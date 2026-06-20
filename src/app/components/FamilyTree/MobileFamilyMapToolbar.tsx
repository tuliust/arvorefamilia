import React from 'react';

export type MobileFamilyMapToolbarAction =
  | 'visualizacao'
  | 'formato'
  | 'cor'
  | 'grupos'
  | 'exportar'
  | 'zoom';

const TOOLBAR_ITEMS: Array<{
  action: MobileFamilyMapToolbarAction;
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

export function MobileFamilyMapToolbar({
  activeAction,
  className = '',
  onAction,
  onAddClick,
}: MobileFamilyMapToolbarProps) {
  return (
    <nav
      aria-label="Controles do mapa familiar"
      className={[
        'border-b border-slate-200 bg-white/95 px-0 py-2 shadow-sm backdrop-blur transition-[padding-bottom] duration-200 md:hidden',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        top: 'calc(env(safe-area-inset-top,0px)+4.5rem)',
        paddingBottom: activeAction ? '7.25rem' : undefined,
        pointerEvents: 'auto',
      }}
      data-mobile-family-map-toolbar="true"
      data-mobile-family-map-toolbar-active={activeAction ? 'true' : undefined}
      data-tree-export-ignore="true"
    >
      <div className="mx-auto flex w-full max-w-md min-w-0 items-center justify-center gap-2.5 px-2">
        <div
          className="grid min-w-0 flex-1 grid-cols-4 items-center gap-1.5 rounded-full bg-slate-100 p-1"
          data-tour-target="mobile-tree-action-bar"
        >
          {TOOLBAR_ITEMS.map((item) => {
            const active = activeAction === item.action;

            return (
              <button
                key={item.action}
                type="button"
                onClick={() => onAction?.(item.action)}
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
            if (onAddClick) {
              onAddClick();
              return;
            }

            onAction?.('visualizacao');
          }}
          aria-label="Abrir painel completo de visualização"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl font-semibold leading-none text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 active:scale-95"
        >
          <span className="-mt-1" aria-hidden="true">+</span>
        </button>
      </div>
    </nav>
  );
}
