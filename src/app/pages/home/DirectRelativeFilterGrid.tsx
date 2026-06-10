import React from 'react';

import type { DirectRelativeFilters, DirectRelativeGroup } from '../../components/FamilyTree/types';
import {
  DIRECT_FAMILY_CARD_TEXT_COLORS,
  DIRECT_FAMILY_RELATION_COLORS,
} from '../../components/FamilyTree/directFamilyColors';

type DirectRelationCounts = Record<DirectRelativeGroup, number>;

const DIRECT_RELATIVE_FILTER_OPTIONS: Array<{
  key: DirectRelativeGroup;
  label: string;
  colorKey: keyof typeof DIRECT_FAMILY_RELATION_COLORS;
}> = [
  { key: 'tataravos', label: 'Tataravós', colorKey: 'tataravos' },
  { key: 'bisavos', label: 'Bisavós', colorKey: 'bisavos' },
  { key: 'avos', label: 'Avós', colorKey: 'avos' },
  { key: 'tios', label: 'Tios', colorKey: 'tios' },
  { key: 'pais', label: 'Pai e Mãe', colorKey: 'pais' },
  { key: 'primos', label: 'Primos', colorKey: 'primos' },
  { key: 'conjuge', label: 'Cônjuges', colorKey: 'conjuge' },
  { key: 'irmaos', label: 'Irmãos', colorKey: 'irmaos' },
  { key: 'filhos', label: 'Filhos', colorKey: 'filhos' },
  { key: 'sobrinhos', label: 'Sobrinhos', colorKey: 'sobrinhos' },
  { key: 'netos', label: 'Netos', colorKey: 'netos' },
];

interface DirectRelativeFilterGridProps {
  filters: DirectRelativeFilters;
  counts: DirectRelationCounts;
  onToggle: (key: DirectRelativeGroup) => void;
  excludedKeys?: DirectRelativeGroup[];
  compact?: boolean;
}

export function DirectRelativeFilterGrid({
  filters,
  counts,
  onToggle,
  excludedKeys = [],
  compact = false,
}: DirectRelativeFilterGridProps) {
  const excludedKeySet = new Set(excludedKeys);

  return (
    <div
      className={
        compact
          ? 'grid w-full min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-[clamp(0.4rem,1.15vh,0.7rem)] sm:grid-cols-5'
          : 'grid w-full min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-[clamp(0.4rem,1.15vh,0.7rem)]'
      }
    >
      {DIRECT_RELATIVE_FILTER_OPTIONS.filter((option) => !excludedKeySet.has(option.key)).map((option) => {
        const active = filters[option.key];
        const count = counts[option.key] ?? 0;
        const color = DIRECT_FAMILY_RELATION_COLORS[option.colorKey];

        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option.key)}
            className={[
              'min-h-[clamp(46px,6.4vh,58px)] w-full min-w-0 overflow-hidden rounded-xl border px-2.5 py-[clamp(0.45rem,1.05vh,0.65rem)] text-left shadow-sm transition',
              active ? 'opacity-100' : 'grayscale opacity-45',
              'hover:-translate-y-0.5 hover:shadow-md',
            ].join(' ')}
            style={{
              background: color.background,
              borderColor: color.solid,
              color: DIRECT_FAMILY_CARD_TEXT_COLORS.primary,
            }}
            title={active ? `Ocultar ${option.label}` : `Mostrar ${option.label}`}
          >
            <span className="block truncate text-[clamp(11px,1.65vh,13px)] font-semibold leading-tight">{option.label}</span>
            <span className="mt-[clamp(0.25rem,0.65vh,0.4rem)] block truncate text-[clamp(18px,2.55vh,22px)] font-bold leading-none">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
