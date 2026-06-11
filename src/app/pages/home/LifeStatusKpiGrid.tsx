import React from 'react';
import { HeartPulse, Skull } from 'lucide-react';

type LifeStatusFilterKey = 'vivos' | 'falecidos' | 'pets';

interface LifeStatusKpiGridProps {
  vivos: number;
  falecidos: number;
  pets: number;
  filters: Record<LifeStatusFilterKey, boolean>;
  onToggle: (key: LifeStatusFilterKey) => void;
}

export function LifeStatusKpiGrid({
  vivos,
  falecidos,
  filters,
  onToggle,
}: LifeStatusKpiGridProps) {
  const items = [
    {
      key: 'vivos' as const,
      label: 'Vivos',
      value: vivos,
      icon: HeartPulse,
      background: 'var(--tree-palette-status-alive-bg, #F8FAFC)',
      color: 'var(--tree-palette-text-primary, #334155)',
      border: 'var(--tree-palette-status-alive, #CBD5E1)',
    },
    {
      key: 'falecidos' as const,
      label: 'Falecidos',
      value: falecidos,
      icon: Skull,
      background: 'var(--tree-palette-status-deceased-bg, #F8FAFC)',
      color: 'var(--tree-palette-text-primary, #334155)',
      border: 'var(--tree-palette-status-deceased, #CBD5E1)',
    },
  ];

  return (
    <details className="tree-control-section min-w-0 rounded-lg border border-gray-200 bg-white/95 shadow-sm" open>
      <summary className="flex min-h-7 cursor-pointer list-none items-center justify-between gap-2 px-2 py-1.5 text-[clamp(10px,1.2vh,11px)] font-bold uppercase tracking-[0.12em] text-slate-500 [&::-webkit-details-marker]:hidden">
        <span className="truncate">Filtros</span>
        <span className="text-[9px] font-semibold normal-case tracking-normal text-slate-400">vivos/falecidos</span>
      </summary>
      <div className="grid w-full min-w-0 grid-cols-2 gap-[clamp(0.22rem,0.52vh,0.32rem)] px-1.5 pb-1.5">
        {items.map((item) => {
          const active = filters[item.key];
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(item.key)}
              className={[
                'family-filter-chip min-h-[clamp(36px,4.9vh,43px)] w-full min-w-0 overflow-hidden rounded-lg border px-1.5 py-1 text-left shadow-sm transition',
                active ? 'opacity-100' : 'grayscale opacity-45',
                'hover:-translate-y-0.5 hover:shadow-md',
              ].join(' ')}
              style={{
                backgroundColor: item.background,
                borderColor: item.border,
                color: item.color,
              }}
              title={active ? `Ocultar ${item.label}` : `Mostrar ${item.label}`}
            >
              <span className="flex min-w-0 items-center gap-1">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-[clamp(9px,1.1vh,10px)] font-semibold leading-tight">
                  {item.label}
                </span>
              </span>
              <span className="mt-[clamp(0.1rem,0.28vh,0.16rem)] block truncate text-[clamp(13px,1.7vh,16px)] font-bold leading-none">
                {item.value}
              </span>
            </button>
          );
        })}
      </div>
    </details>
  );
}
