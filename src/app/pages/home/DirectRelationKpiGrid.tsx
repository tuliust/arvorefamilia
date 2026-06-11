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
    <section className="min-w-0">
      <h2 className="mb-[clamp(0.3rem,0.75vh,0.45rem)] truncate text-[clamp(11px,1.35vh,12px)] font-bold uppercase tracking-[0.12em] text-slate-500">
        Pessoas e grupos
      </h2>
      <DirectRelativeFilterGrid
        filters={filters}
        counts={counts}
        onToggle={onToggle}
        excludedKeys={['sobrinhos']}
        compact
      />
    </section>
  );
}
