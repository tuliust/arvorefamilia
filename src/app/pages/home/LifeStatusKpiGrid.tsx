import React from 'react';
import { Cross, Dog, Heart, Star } from 'lucide-react';

import type { DirectRelativeFilters, DirectRelativeGroup } from '../../components/FamilyTree/types';
import {
  DIRECT_FAMILY_CARD_TEXT_COLORS,
  DIRECT_FAMILY_RELATION_COLORS,
} from '../../components/FamilyTree/directFamilyColors';

type LifeStatusFilterKey = 'vivos' | 'falecidos' | 'pets';
type DirectRelationCounts = Record<DirectRelativeGroup, number>;

interface FilterItem {
  key: string;
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  background: string;
  color: string;
  border: string;
  active: boolean;
  onToggle: () => void;
}

interface LifeStatusKpiGridProps {
  vivos: number;
  falecidos: number;
  filters: Record<LifeStatusFilterKey, boolean>;
  onToggle: (key: LifeStatusFilterKey) => void;
  directRelativeFilters: DirectRelativeFilters;
  directRelationCounts: DirectRelationCounts;
  onToggleDirectRelative: (key: DirectRelativeGroup) => void;
}

export function LifeStatusKpiGrid({
  vivos,
  falecidos,
  filters,
  onToggle,
  directRelativeFilters,
  directRelationCounts,
  onToggleDirectRelative,
}: LifeStatusKpiGridProps) {
  const items: FilterItem[] = [
    {
      key: 'vivos',
      label: 'Vivos',
      value: vivos,
      icon: Star,
      background: 'var(--tree-palette-status-alive-bg, #F8FAFC)',
      color: 'var(--tree-palette-text-primary, #334155)',
      border: 'var(--tree-palette-status-alive, #CBD5E1)',
      active: filters.vivos,
      onToggle: () => onToggle('vivos'),
    },
    {
      key: 'falecidos',
      label: 'Falecidos',
      value: falecidos,
      icon: Cross,
      background: 'var(--tree-palette-status-deceased-bg, #F8FAFC)',
      color: 'var(--tree-palette-text-primary, #334155)',
      border: 'var(--tree-palette-status-deceased, #CBD5E1)',
      active: filters.falecidos,
      onToggle: () => onToggle('falecidos'),
    },
    {
      key: 'conjuge',
      label: 'C\u00f4njuges',
      value: directRelationCounts.conjuge,
      icon: Heart,
      background: DIRECT_FAMILY_RELATION_COLORS.conjuge.background,
      color: DIRECT_FAMILY_CARD_TEXT_COLORS.primary,
      border: DIRECT_FAMILY_RELATION_COLORS.conjuge.solid,
      active: directRelativeFilters.conjuge,
      onToggle: () => onToggleDirectRelative('conjuge'),
    },
    {
      key: 'pets',
      label: 'Pets',
      value: directRelationCounts.pets,
      icon: Dog,
      background: DIRECT_FAMILY_RELATION_COLORS.pets.background,
      color: DIRECT_FAMILY_CARD_TEXT_COLORS.primary,
      border: DIRECT_FAMILY_RELATION_COLORS.pets.solid,
      active: directRelativeFilters.pets,
      onToggle: () => onToggleDirectRelative('pets'),
    },
  ];

  return (
    <details className="tree-control-section min-w-0 rounded-lg border border-gray-200 bg-white/95 shadow-sm" open>
      <summary className="flex min-h-7 cursor-pointer list-none items-center justify-between gap-2 px-2 py-1.5 text-[clamp(10px,1.2vh,11px)] font-bold uppercase tracking-[0.12em] text-slate-500 [&::-webkit-details-marker]:hidden">
        <span className="truncate">Filtros</span>
      </summary>
      <div className="grid w-full min-w-0 grid-cols-2 gap-[clamp(0.22rem,0.52vh,0.32rem)] px-1.5 pb-1.5">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={item.active}
              onClick={item.onToggle}
              data-tree-panel-card="true"
              data-tree-panel-card-type="filter"
              data-tree-panel-filter-key={item.key}
              data-family-map-color-key={item.key === 'conjuge' || item.key === 'pets' ? item.key : undefined}
              className={[
                'family-filter-chip min-h-[clamp(36px,4.9vh,43px)] w-full min-w-0 overflow-hidden rounded-lg border px-1.5 py-1 text-left shadow-sm transition',
                item.active ? 'opacity-100' : 'grayscale opacity-45',
                'hover:-translate-y-0.5 hover:shadow-md',
              ].join(' ')}
              style={{
                backgroundColor: item.background,
                borderColor: item.border,
                color: item.color,
              }}
              title={item.active ? `Ocultar ${item.label}` : `Mostrar ${item.label}`}
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
