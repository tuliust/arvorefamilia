import React from 'react';
import {
  Baby,
  Dog,
  Heart,
  Home,
  PersonStanding,
  SquareUser,
  Tally1,
  Tally2,
  Tally3,
  TrainFrontTunnel,
  UsersRound,
} from 'lucide-react';

import type { DirectRelativeFilters, DirectRelativeGroup } from '../../components/FamilyTree/types';
import {
  DIRECT_FAMILY_CARD_TEXT_COLORS,
  DIRECT_FAMILY_RELATION_COLORS,
} from '../../components/FamilyTree/directFamilyColors';

type DirectRelationCounts = Record<DirectRelativeGroup, number>;

type RelationColorKey = keyof typeof DIRECT_FAMILY_RELATION_COLORS;

const DIRECT_RELATIVE_FILTER_OPTIONS: Array<{
  key: DirectRelativeGroup;
  label: string;
  colorKey: RelationColorKey;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'tataravos', label: 'Tataravós', colorKey: 'tataravos', icon: Tally1 },
  { key: 'bisavos', label: 'Bisavós', colorKey: 'bisavos', icon: Tally2 },
  { key: 'avos', label: 'Avós', colorKey: 'avos', icon: Tally3 },
  { key: 'pais', label: 'Pais', colorKey: 'pais', icon: SquareUser },
  { key: 'tios', label: 'Tios', colorKey: 'tios', icon: UsersRound },
  { key: 'primos', label: 'Primos', colorKey: 'primos', icon: PersonStanding },
  { key: 'sobrinhos', label: 'Sobrinhos', colorKey: 'sobrinhos', icon: TrainFrontTunnel },
  { key: 'irmaos', label: 'Irmãos', colorKey: 'irmaos', icon: UsersRound },
  { key: 'filhos', label: 'Filhos', colorKey: 'filhos', icon: Baby },
  { key: 'netos', label: 'Netos', colorKey: 'netos', icon: Baby },
  { key: 'conjuge', label: 'Cônjuges', colorKey: 'conjuge', icon: Heart },
  { key: 'pets', label: 'Pets', colorKey: 'pets', icon: Dog },
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
          ? 'grid w-full min-w-0 grid-cols-3 gap-[clamp(0.3rem,0.68vh,0.44rem)]'
          : 'grid w-full min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-[clamp(0.4rem,1.15vh,0.7rem)]'
      }
    >
      {DIRECT_RELATIVE_FILTER_OPTIONS.filter((option) => !excludedKeySet.has(option.key)).map((option) => {
        const active = filters[option.key];
        const count = counts[option.key] ?? 0;
        const color = DIRECT_FAMILY_RELATION_COLORS[option.colorKey];
        const Icon = option.icon;

        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option.key)}
            className={[
              compact
                ? 'family-filter-chip min-h-[clamp(46px,5.8vh,56px)] w-full min-w-0 overflow-hidden rounded-lg border px-2 py-1.5 text-left shadow-sm transition'
                : 'family-filter-chip min-h-[clamp(46px,6.4vh,58px)] w-full min-w-0 overflow-hidden rounded-xl border px-2.5 py-[clamp(0.45rem,1.05vh,0.65rem)] text-left shadow-sm transition',
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
            <span className="flex min-w-0 items-center gap-1.5">
              <Icon className={compact ? 'h-4 w-4 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
              <span className={[
                'min-w-0 flex-1 truncate font-semibold leading-tight',
                compact ? 'text-[clamp(10px,1.22vh,11px)]' : 'text-[clamp(11px,1.65vh,13px)]',
              ].join(' ')}>{option.label}</span>
            </span>
            <span className={[
              'block truncate font-bold leading-none',
              compact
                ? 'mt-[clamp(0.22rem,0.48vh,0.32rem)] text-[clamp(16px,2vh,19px)]'
                : 'mt-[clamp(0.25rem,0.65vh,0.4rem)] text-[clamp(18px,2.55vh,22px)]',
            ].join(' ')}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
