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
      <h2 className="mb-1 text-sm font-semibold text-gray-900">Filtros</h2>
      <p className="mb-3 text-xs leading-snug text-gray-500">
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
