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
        'border-b border-slate-200 bg-white/95 px-1.5 py-2 shadow-sm backdrop-blur md:hidden',
        className,
      ].filter(Boolean).join(' ')}
      data-tree-export-ignore="true"
    >
      <div className="flex w-full min-w-0 items-center gap-0.5 rounded-xl bg-slate-100 p-0.5">
        {TOOLBAR_ITEMS.map((item) => {
          const active = activeAction === item.action;

          return (
            <button
              key={item.action}
              type="button"
              onClick={() => onAction?.(item.action)}
              aria-pressed={active || undefined}
              className={[
                'min-w-0 flex-1 whitespace-nowrap rounded-lg px-1 py-2 text-[9px] font-extrabold leading-none tracking-[-0.025em] transition min-[375px]:px-1.5 min-[375px]:text-[10px]',
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
