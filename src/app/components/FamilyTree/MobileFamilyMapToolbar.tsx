import React from 'react';

export type MobileFamilyMapToolbarAction =
  | 'visualizacao'
  | 'formato'
  | 'cor'
  | 'grupos'
  | 'exportar';

const TOOLBAR_ITEMS: Array<{
  action: MobileFamilyMapToolbarAction;
  label: string;
}> = [
  { action: 'visualizacao', label: 'Visualização' },
  { action: 'formato', label: 'Formato' },
  { action: 'cor', label: 'Cor' },
  { action: 'grupos', label: 'Filtros' },
  { action: 'exportar', label: 'Exportar' },
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
        'border-b border-slate-200 bg-white/95 px-1 py-2 shadow-sm backdrop-blur md:hidden',
        className,
      ].filter(Boolean).join(' ')}
      data-tree-export-ignore="true"
    >
      <div className="mx-auto flex w-full max-w-md min-w-0 items-center justify-center gap-1 px-1">
        <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded-xl bg-slate-100 p-0.5">
          {TOOLBAR_ITEMS.map((item) => {
            const active = activeAction === item.action;

            return (
              <button
                key={item.action}
                type="button"
                onClick={() => onAction?.(item.action)}
                aria-pressed={active || undefined}
                className={[
                  'min-w-0 flex-1 whitespace-nowrap rounded-lg px-1 py-2 text-[8.5px] font-extrabold leading-none tracking-[-0.035em] transition min-[360px]:px-1.5 min-[375px]:text-[9.5px]',
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

            onAction?.('mais' as MobileFamilyMapToolbarAction);
          }}
          aria-label="Abrir painel completo de visualização"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-semibold leading-none text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 active:scale-95"
        >
          <span className="-mt-0.5" aria-hidden="true">+</span>
        </button>
      </div>
    </nav>
  );
}
