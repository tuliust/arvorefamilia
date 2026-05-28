import React from 'react';

import type { GenealogyFilterKey, GenealogyFilters } from '../../components/FamilyTree/types';
import {
  DIRECT_FAMILY_CARD_TEXT_COLORS,
  DIRECT_FAMILY_RELATION_COLORS,
} from '../../components/FamilyTree/directFamilyColors';

type GenealogyFilterCounts = Record<GenealogyFilterKey, number>;

const GENEALOGY_FILTER_OPTIONS: Array<{
  key: GenealogyFilterKey;
  title: string;
  subtitle?: string;
  colorKey: keyof typeof DIRECT_FAMILY_RELATION_COLORS;
}> = [
  { key: 'generation1', title: 'Geração 1', colorKey: 'tataravos' },
  { key: 'generation2', title: 'Geração 2', colorKey: 'bisavos' },
  { key: 'generation3Family', title: 'Geração 3', subtitle: 'Familiares', colorKey: 'avos' },
  { key: 'generation3Spouses', title: 'Geração 3', subtitle: 'Cônjuges', colorKey: 'tios' },
  { key: 'generation4Family', title: 'Geração 4', subtitle: 'Familiares', colorKey: 'primos' },
  { key: 'generation4Spouses', title: 'Geração 4', subtitle: 'Cônjuges', colorKey: 'conjuge' },
  { key: 'generation5Family', title: 'Geração 5', subtitle: 'Familiares', colorKey: 'irmaos' },
  { key: 'generation5Spouses', title: 'Geração 5', subtitle: 'Cônjuges', colorKey: 'sobrinhos' },
  { key: 'generation6', title: 'Geração 6', colorKey: 'filhos' },
];

interface GenealogyFilterGridProps {
  filters: GenealogyFilters;
  counts: GenealogyFilterCounts;
  onToggle: (key: GenealogyFilterKey) => void;
}

export function GenealogyFilterGrid({
  filters,
  counts,
  onToggle,
}: GenealogyFilterGridProps) {
  return (
    <section>
      <h2 className="mb-[clamp(0.15rem,0.45vh,0.25rem)] text-[clamp(12px,1.9vh,14px)] font-semibold leading-tight text-gray-900">Filtros</h2>
      <p className="mb-[clamp(0.3rem,0.8vh,0.5rem)] text-[clamp(10px,1.45vh,12px)] leading-snug text-gray-500">
        Clique nos cards abaixo para exibir ou ocultar gerações na genealogia.
      </p>
      <div className="grid grid-cols-2 gap-[clamp(0.25rem,0.75vh,0.5rem)]">
        {GENEALOGY_FILTER_OPTIONS.map((option) => {
          const active = filters[option.key];
          const count = counts[option.key];
          const color = DIRECT_FAMILY_RELATION_COLORS[option.colorKey];
          const label = option.subtitle ? `${option.title} - ${option.subtitle}` : option.title;

          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option.key)}
              className={[
                'min-h-[clamp(34px,5.1vh,44px)] rounded-lg border px-1.5 py-[clamp(0.25rem,0.65vh,0.375rem)] text-left shadow-sm transition',
                active ? 'opacity-100' : 'grayscale opacity-45',
                'hover:-translate-y-0.5 hover:shadow-md',
              ].join(' ')}
              style={{
                background: color.background,
                borderColor: color.solid,
                color: DIRECT_FAMILY_CARD_TEXT_COLORS.primary,
              }}
              title={active ? `Ocultar ${label}` : `Mostrar ${label}`}
            >
              <span className="block truncate text-[clamp(10px,1.55vh,12px)] font-semibold leading-tight">{option.title}</span>
              {option.subtitle && (
                <span className="mt-0.5 block truncate text-[clamp(9px,1.35vh,11px)] font-medium italic leading-tight">
                  {option.subtitle}
                </span>
              )}
              <span className="mt-[clamp(0.15rem,0.45vh,0.25rem)] block text-[clamp(15px,2.25vh,18px)] font-bold leading-none">{count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
