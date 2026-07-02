import React from 'react';

import type { Pessoa, Relacionamento } from '../../types';
import type { FamilyTreeActions } from './FamilyTree';
import { DesktopFamilyHorizontalMapView } from './DesktopFamilyHorizontalMapView';
import { buildTreeGraph } from './buildTreeGraph';
import { collectDirectFamilyScopePersonIds } from './layouts/directFamilyDistributedLayout';
import {
  DEFAULT_EDGE_FILTERS,
  type DirectRelativeFilters,
  type DirectRelativeGroup,
} from './types';

interface DesktopFamilyHorizontalMapFilteredViewProps {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  centralPersonId: string;
  visiblePersonIds?: Set<string>;
  directRelativeFilters: DirectRelativeFilters;
  onPersonClick: (pessoa: Pessoa) => void;
  layoutRevision: number;
  onScrollStateChange?: (hasScrolled: boolean) => void;
  onDirectRelationRenderedCounts?: (counts: Record<DirectRelativeGroup, number>) => void;
}

function intersectVisiblePersonIds(
  directScopeIds: Set<string>,
  visiblePersonIds: Set<string> | undefined,
  centralPersonId: string
) {
  if (!visiblePersonIds) return directScopeIds;

  const nextVisibleIds = new Set<string>();
  directScopeIds.forEach((personId) => {
    if (personId === centralPersonId || visiblePersonIds.has(personId)) {
      nextVisibleIds.add(personId);
    }
  });

  return nextVisibleIds;
}

function DesktopFamilyHorizontalMapFilteredViewComponent({
  pessoas,
  relacionamentos,
  centralPersonId,
  visiblePersonIds,
  directRelativeFilters,
  onPersonClick,
  layoutRevision,
  onScrollStateChange,
  onDirectRelationRenderedCounts,
}: DesktopFamilyHorizontalMapFilteredViewProps, ref: React.ForwardedRef<FamilyTreeActions>) {
  const filteredVisiblePersonIds = React.useMemo(() => {
    const graph = buildTreeGraph({
      pessoas,
      relacionamentos,
      selectedPersonId: centralPersonId,
      onPersonClick,
      edgeFilters: DEFAULT_EDGE_FILTERS,
    });

    const directScopeIds = collectDirectFamilyScopePersonIds(graph, {
      centralPersonId,
      filters: directRelativeFilters,
    });

    if (directScopeIds.size === 0) return visiblePersonIds;
    return intersectVisiblePersonIds(directScopeIds, visiblePersonIds, centralPersonId);
  }, [centralPersonId, directRelativeFilters, onPersonClick, pessoas, relacionamentos, visiblePersonIds]);

  return (
    <DesktopFamilyHorizontalMapView
      ref={ref}
      pessoas={pessoas}
      visiblePersonIds={filteredVisiblePersonIds}
      relacionamentos={relacionamentos}
      centralPersonId={centralPersonId}
      directRelativeFilters={directRelativeFilters}
      onPersonClick={onPersonClick}
      layoutRevision={layoutRevision}
      onScrollStateChange={onScrollStateChange}
      onDirectRelationRenderedCounts={onDirectRelationRenderedCounts}
    />
  );
}

export const DesktopFamilyHorizontalMapFilteredView = React.forwardRef<
  FamilyTreeActions,
  DesktopFamilyHorizontalMapFilteredViewProps
>(DesktopFamilyHorizontalMapFilteredViewComponent);
