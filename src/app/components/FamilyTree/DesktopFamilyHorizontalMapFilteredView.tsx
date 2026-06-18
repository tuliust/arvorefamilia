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

function isNonEmptyString(value: string | null | undefined): value is string {
  return Boolean(value);
}

function isParentChildRelationship(relationship: Relacionamento) {
  const type = relationship.tipo_relacionamento as string;
  return type === 'pai'
    || type === 'mae'
    || type === 'filho'
    || type === 'filiacao_sangue'
    || type === 'filiacao_adotiva';
}

function getParentChildIds(relationship: Relacionamento) {
  if (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae') {
    return {
      parentId: relationship.pessoa_destino_id,
      childId: relationship.pessoa_origem_id,
    };
  }

  return {
    parentId: relationship.pessoa_origem_id,
    childId: relationship.pessoa_destino_id,
  };
}

function getParentIdsForPerson(centralPersonId: string, relacionamentos: Relacionamento[]) {
  return new Set(
    relacionamentos
      .filter(isParentChildRelationship)
      .map(getParentChildIds)
      .filter(({ childId }) => childId === centralPersonId)
      .map(({ parentId }) => parentId)
      .filter(isNonEmptyString)
  );
}

function applyHorizontalDirectFilterExceptions(
  directScopeIds: Set<string>,
  directRelativeFilters: DirectRelativeFilters,
  centralPersonId: string,
  relacionamentos: Relacionamento[]
) {
  const nextScopeIds = new Set(directScopeIds);

  if (!directRelativeFilters.pais) {
    getParentIdsForPerson(centralPersonId, relacionamentos).forEach((parentId) => {
      nextScopeIds.delete(parentId);
    });
  }

  nextScopeIds.add(centralPersonId);
  return nextScopeIds;
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
      filters: {
        ...directRelativeFilters,
        conjuge: true,
      },
    });
    const adjustedDirectScopeIds = applyHorizontalDirectFilterExceptions(
      directScopeIds,
      directRelativeFilters,
      centralPersonId,
      relacionamentos
    );

    if (adjustedDirectScopeIds.size === 0) return visiblePersonIds;
    return intersectVisiblePersonIds(adjustedDirectScopeIds, visiblePersonIds, centralPersonId);
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
