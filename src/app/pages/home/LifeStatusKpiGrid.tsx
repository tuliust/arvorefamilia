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
      label: 'Vivos',
      value: vivos,
      ...directStatusFilterCardColors.vivos,
    },
    {
      key: 'falecidos' as const,
      label: 'Falecidos',
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
      <div className="grid w-full min-w-0 grid-cols-[repeat(3,minmax(0,1fr))] gap-[clamp(0.25rem,0.75vh,0.5rem)]">
        {items.map((item) => {
          const active = filters[item.key];

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(item.key)}
              className={[
                'min-h-[clamp(34px,5.1vh,44px)] w-full min-w-0 overflow-hidden rounded-lg border px-1.5 py-[clamp(0.25rem,0.65vh,0.375rem)] text-left shadow-sm transition',
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
              <span className="block truncate text-[clamp(10px,1.55vh,12px)] font-semibold leading-tight">{item.label}</span>
              <span className="mt-[clamp(0.15rem,0.45vh,0.25rem)] block truncate text-[clamp(15px,2.25vh,18px)] font-bold leading-none">{item.value}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
