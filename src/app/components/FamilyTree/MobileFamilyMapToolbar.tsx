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
  { action: 'grupos', label: 'Grupos' },
  { action: 'exportar', label: 'Exportar' },
];

interface MobileFamilyMapToolbarProps {
  activeAction?: MobileFamilyMapToolbarAction | null;
  className?: string;
  onAction?: (action: MobileFamilyMapToolbarAction) => void;
}

export function MobileFamilyMapToolbar({
  activeAction,
  className = '',
  onAction,
}: MobileFamilyMapToolbarProps) {
  return (
    <nav
      aria-label="Controles do mapa familiar"
      className={[
        'border-b border-slate-200 bg-white/95 px-2 py-2 shadow-sm backdrop-blur md:hidden',
        className,
      ].filter(Boolean).join(' ')}
      data-tree-export-ignore="true"
    >
      <div className="flex w-full min-w-0 items-center gap-1.5 overflow-x-auto overscroll-x-contain rounded-xl bg-slate-100 p-1 [-webkit-overflow-scrolling:touch]">
        {TOOLBAR_ITEMS.map((item) => {
          const active = activeAction === item.action;

          return (
            <button
              key={item.action}
              type="button"
              onClick={() => onAction?.(item.action)}
              aria-pressed={active || undefined}
              className={[
                'shrink-0 rounded-lg px-3 py-2 text-[10px] font-extrabold leading-none transition min-[375px]:px-3.5 min-[375px]:text-[11px]',
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
    </nav>
  );
}
