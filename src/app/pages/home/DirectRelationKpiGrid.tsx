import React from 'react';

import type { DirectRelativeFilters, DirectRelativeGroup } from '../../components/FamilyTree/types';
import { DirectRelativeFilterGrid } from './DirectRelativeFilterGrid';

type DirectRelationCounts = Record<DirectRelativeGroup, number>;

interface DirectRelationKpiGridProps {
  filters: DirectRelativeFilters;
  counts: DirectRelationCounts;
  onToggle: (key: DirectRelativeGroup) => void;
}

export function DirectRelationKpiGrid({
  filters,
  counts,
  onToggle,
}: DirectRelationKpiGridProps) {
  return (
    <details className="tree-control-section min-w-0 rounded-lg border border-gray-200 bg-white/95 shadow-sm" open>
      <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-2 px-2.5 py-2 text-[clamp(10px,1.2vh,11px)] font-bold uppercase tracking-[0.12em] text-slate-500 [&::-webkit-details-marker]:hidden">
        <span className="truncate">Grupos</span>
      </summary>
      <div className="min-w-0 px-2 pb-2">
        <DirectRelativeFilterGrid
          filters={filters}
          counts={counts}
          onToggle={onToggle}
          compact
        />
      </div>
    </details>
  );
}
