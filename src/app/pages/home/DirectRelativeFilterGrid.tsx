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
  { key: 'pais', label: 'Pais', colorKey: 'pais' },
  { key: 'tios', label: 'Tios', colorKey: 'tios' },
  { key: 'primos', label: 'Primos', colorKey: 'primos' },
  { key: 'irmaos', label: 'Irmãos', colorKey: 'irmaos' },
  { key: 'filhos', label: 'Filhos', colorKey: 'filhos' },
  { key: 'netos', label: 'Netos', colorKey: 'netos' },
  { key: 'conjuge', label: 'Cônjuges', colorKey: 'conjuge' },
  { key: 'sobrinhos', label: 'Sobrinhos', colorKey: 'sobrinhos' },
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
          ? 'grid w-full min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-[clamp(0.28rem,0.7vh,0.4rem)]'
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
              compact
                ? 'min-h-[clamp(34px,4.7vh,42px)] w-full min-w-0 overflow-hidden rounded-lg border px-2 py-[clamp(0.28rem,0.65vh,0.38rem)] text-left shadow-sm transition'
                : 'min-h-[clamp(46px,6.4vh,58px)] w-full min-w-0 overflow-hidden rounded-xl border px-2.5 py-[clamp(0.45rem,1.05vh,0.65rem)] text-left shadow-sm transition',
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
            <span className={[
              'block truncate font-semibold leading-tight',
              compact ? 'text-[clamp(10px,1.25vh,11px)]' : 'text-[clamp(11px,1.65vh,13px)]',
            ].join(' ')}>{option.label}</span>
            <span className={[
              'block truncate font-bold leading-none',
              compact
                ? 'mt-[clamp(0.12rem,0.35vh,0.2rem)] text-[clamp(14px,1.9vh,17px)]'
                : 'mt-[clamp(0.25rem,0.65vh,0.4rem)] text-[clamp(18px,2.55vh,22px)]',
            ].join(' ')}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
