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
      <h2 className="mb-[clamp(0.25rem,0.75vh,0.45rem)] text-[clamp(14px,2.1vh,16px)] font-semibold leading-tight text-gray-900">Filtros</h2>
      <p className="mb-[clamp(0.7rem,1.55vh,1rem)] text-[clamp(11px,1.6vh,13px)] leading-snug text-gray-500">
        Clique nos cards abaixo para exibir ou ocultar grupos de parentes.
      </p>
      <DirectRelativeFilterGrid
        filters={filters}
        counts={counts}
        onToggle={onToggle}
        excludedKeys={['pais']}
      />
    </section>
  );
}
