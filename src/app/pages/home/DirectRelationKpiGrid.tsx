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
      <h2 className="mb-[clamp(0.15rem,0.45vh,0.25rem)] text-[clamp(12px,1.9vh,14px)] font-semibold leading-tight text-gray-900">Filtros</h2>
      <p className="mb-[clamp(0.35rem,0.9vh,0.75rem)] text-[clamp(10px,1.45vh,12px)] leading-snug text-gray-500">
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
