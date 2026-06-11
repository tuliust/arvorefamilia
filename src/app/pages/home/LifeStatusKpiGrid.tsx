import React from 'react';

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
  pets,
  filters,
  onToggle,
}: LifeStatusKpiGridProps) {
  const directStatusFilterCardColors = {
    vivos: {
      background: '#F8FAFC',
      color: '#334155',
      border: '#CBD5E1',
    },
    falecidos: {
      background: '#F8FAFC',
      color: '#334155',
      border: '#CBD5E1',
    },
    pets: {
      background: '#F8FAFC',
      color: '#334155',
      border: '#CBD5E1',
    },
  } as const;

  const items = [
    {
      key: 'vivos' as const,
      label: 'Vivas',
      value: vivos,
      ...directStatusFilterCardColors.vivos,
    },
    {
      key: 'falecidos' as const,
      label: 'Falecidas',
      value: falecidos,
      ...directStatusFilterCardColors.falecidos,
    },
    {
      key: 'pets' as const,
      label: 'Pets',
      value: pets,
      ...directStatusFilterCardColors.pets,
    },
  ];

  return (
    <section className="min-w-0">
      <div className="mb-[clamp(0.3rem,0.75vh,0.45rem)] flex items-center justify-between gap-2">
        <h2 className="truncate text-[clamp(11px,1.35vh,12px)] font-bold uppercase tracking-[0.12em] text-slate-500">
          Exibir
        </h2>
      </div>
      <div className="grid w-full min-w-0 grid-cols-[repeat(3,minmax(0,1fr))] gap-[clamp(0.28rem,0.7vh,0.4rem)]">
        {items.map((item) => {
          const active = filters[item.key];

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(item.key)}
              className={[
                'min-h-[clamp(34px,4.7vh,42px)] w-full min-w-0 overflow-hidden rounded-lg border px-2 py-[clamp(0.28rem,0.65vh,0.38rem)] text-left shadow-sm transition',
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
              <span className="block truncate text-[clamp(10px,1.25vh,11px)] font-semibold leading-tight">{item.label}</span>
              <span className="mt-[clamp(0.12rem,0.35vh,0.2rem)] block truncate text-[clamp(14px,1.9vh,17px)] font-bold leading-none">{item.value}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
