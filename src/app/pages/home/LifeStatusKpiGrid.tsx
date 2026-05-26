import React from 'react';

interface LifeStatusKpiGridProps {
  vivos: number;
  falecidos: number;
  filters: {
    vivos: boolean;
    falecidos: boolean;
  };
  onToggle: (key: 'vivos' | 'falecidos') => void;
}

export function LifeStatusKpiGrid({
  vivos,
  falecidos,
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
  ];

  return (
    <section>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((item) => {
          const active = filters[item.key];

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(item.key)}
              className={[
                'min-h-[40px] rounded-lg border p-1.5 text-left shadow-sm transition',
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
              <span className="block text-xs font-semibold">{item.label}</span>
              <span className="mt-1 block text-lg font-bold leading-none">{item.value}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
