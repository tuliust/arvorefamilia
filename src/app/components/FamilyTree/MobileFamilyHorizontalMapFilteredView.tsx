import React from 'react';

import type { Pessoa, Relacionamento } from '../../types';
import type { FamilyTreeActions } from './FamilyTree';
import { MobileFamilyHorizontalMapView } from './MobileFamilyHorizontalMapView';
import { buildTreeGraph } from './buildTreeGraph';
import { collectDirectFamilyScopePersonIds } from './layouts/directFamilyDistributedLayout';
import {
  DEFAULT_EDGE_FILTERS,
  type DirectRelativeFilters,
  type DirectRelativeGroup,
} from './types';

interface MobileFamilyHorizontalMapFilteredViewProps {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  centralPersonId: string;
  visiblePersonIds?: Set<string>;
  directRelativeFilters: DirectRelativeFilters;
  onPersonClick: (pessoa: Pessoa) => void;
  layoutRevision: number;
  onDirectRelationRenderedCounts?: (counts: Record<DirectRelativeGroup, number>) => void;
}

type RelationshipMaps = {
  parentsByChild: Map<string, Set<string>>;
  childrenByParent: Map<string, Set<string>>;
  spousesByPerson: Map<string, Set<string>>;
};

const FILTERABLE_HORIZONTAL_SPOUSE_GENERATIONS = new Set([4, 5, 6]);

function isNonEmptyString(value: string | null | undefined): value is string {
  return Boolean(value);
}

function addToMap(map: Map<string, Set<string>>, key: string, value: string) {
  if (!key || !value) return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key)!.add(value);
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

function buildRelationshipMaps(relacionamentos: Relacionamento[]): RelationshipMaps {
  const parentsByChild = new Map<string, Set<string>>();
  const childrenByParent = new Map<string, Set<string>>();
  const spousesByPerson = new Map<string, Set<string>>();

  relacionamentos.forEach((relationship) => {
    if (!relationship.pessoa_origem_id || !relationship.pessoa_destino_id) return;

    if (isParentChildRelationship(relationship)) {
      const { parentId, childId } = getParentChildIds(relationship);
      addToMap(parentsByChild, childId, parentId);
      addToMap(childrenByParent, parentId, childId);
      return;
    }

    if (relationship.tipo_relacionamento === 'conjuge') {
      addToMap(spousesByPerson, relationship.pessoa_origem_id, relationship.pessoa_destino_id);
      addToMap(spousesByPerson, relationship.pessoa_destino_id, relationship.pessoa_origem_id);
    }
  });

  return { parentsByChild, childrenByParent, spousesByPerson };
}

function getManualGeneration(person: Pessoa) {
  const manualGeneration = Number(person.manual_generation);
  if (!Number.isFinite(manualGeneration)) return undefined;

  return Math.min(6, Math.max(1, Math.trunc(manualGeneration)));
}

function inferHorizontalGenerations(
  pessoas: Pessoa[],
  maps: RelationshipMaps,
  centralPersonId: string,
) {
  const peopleById = new Map(pessoas.map((person) => [person.id, person]));
  const generationByPersonId = new Map<string, number>();

  pessoas.forEach((person) => {
    const manualGeneration = getManualGeneration(person);
    if (manualGeneration !== undefined) generationByPersonId.set(person.id, manualGeneration);
  });

  const visited = new Set<string>();
  const queue: Array<{ personId: string; generation: number }> = [
    { personId: centralPersonId, generation: generationByPersonId.get(centralPersonId) ?? 5 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || !peopleById.has(current.personId) || visited.has(current.personId)) continue;
    visited.add(current.personId);

    const generation = generationByPersonId.get(current.personId)
      ?? Math.min(6, Math.max(1, current.generation));

    if (!generationByPersonId.has(current.personId)) generationByPersonId.set(current.personId, generation);

    maps.parentsByChild.get(current.personId)?.forEach((parentId) => {
      queue.push({ personId: parentId, generation: generation - 1 });
    });
    maps.childrenByParent.get(current.personId)?.forEach((childId) => {
      queue.push({ personId: childId, generation: generation + 1 });
    });
    maps.spousesByPerson.get(current.personId)?.forEach((spouseId) => {
      queue.push({ personId: spouseId, generation });
    });
  }

  return generationByPersonId;
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

function isExternallyVisible(
  personId: string,
  visiblePersonIds: Set<string> | undefined,
  centralPersonId: string
) {
  return personId === centralPersonId || !visiblePersonIds || visiblePersonIds.has(personId);
}

function expandHorizontalSpousesForFilter(
  directScopeIds: Set<string>,
  spouseAnchorScopeIds: Set<string>,
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[],
  centralPersonId: string,
  visiblePersonIds: Set<string> | undefined,
  directRelativeFilters: DirectRelativeFilters
) {
  if (!directRelativeFilters.conjuge) return directScopeIds;

  const nextScopeIds = new Set(directScopeIds);
  const peopleById = new Map(pessoas.map((person) => [person.id, person]));
  const maps = buildRelationshipMaps(relacionamentos);
  const generationByPersonId = inferHorizontalGenerations(pessoas, maps, centralPersonId);

  spouseAnchorScopeIds.forEach((anchorId) => {
    const anchor = peopleById.get(anchorId);
    if (!anchor) return;

    const generation = getManualGeneration(anchor) ?? generationByPersonId.get(anchorId);
    if (!generation || !FILTERABLE_HORIZONTAL_SPOUSE_GENERATIONS.has(generation)) return;

    maps.spousesByPerson.get(anchorId)?.forEach((spouseId) => {
      if (!peopleById.has(spouseId)) return;
      if (!isExternallyVisible(spouseId, visiblePersonIds, centralPersonId)) return;
      nextScopeIds.add(spouseId);
    });
  });

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

function MobileFamilyHorizontalMapFilteredViewComponent({
  pessoas,
  relacionamentos,
  centralPersonId,
  visiblePersonIds,
  directRelativeFilters,
  onPersonClick,
  layoutRevision,
  onDirectRelationRenderedCounts,
}: MobileFamilyHorizontalMapFilteredViewProps, ref: React.ForwardedRef<FamilyTreeActions>) {
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
    const spouseAnchorScopeIds = collectDirectFamilyScopePersonIds(graph, {
      centralPersonId,
      filters: {
        ...directRelativeFilters,
        conjuge: false,
      },
    });
    const adjustedDirectScopeIds = applyHorizontalDirectFilterExceptions(
      directScopeIds,
      directRelativeFilters,
      centralPersonId,
      relacionamentos
    );
    const adjustedSpouseAnchorScopeIds = applyHorizontalDirectFilterExceptions(
      spouseAnchorScopeIds,
      directRelativeFilters,
      centralPersonId,
      relacionamentos
    );
    const expandedDirectScopeIds = expandHorizontalSpousesForFilter(
      adjustedDirectScopeIds,
      adjustedSpouseAnchorScopeIds,
      pessoas,
      relacionamentos,
      centralPersonId,
      visiblePersonIds,
      directRelativeFilters
    );

    if (expandedDirectScopeIds.size === 0) return visiblePersonIds;
    return intersectVisiblePersonIds(expandedDirectScopeIds, visiblePersonIds, centralPersonId);
  }, [centralPersonId, directRelativeFilters, onPersonClick, pessoas, relacionamentos, visiblePersonIds]);

  return (
    <MobileFamilyHorizontalMapView
      ref={ref}
      pessoas={pessoas}
      visiblePersonIds={filteredVisiblePersonIds}
      relacionamentos={relacionamentos}
      centralPersonId={centralPersonId}
      directRelativeFilters={directRelativeFilters}
      onPersonClick={onPersonClick}
      layoutRevision={layoutRevision}
      onDirectRelationRenderedCounts={onDirectRelationRenderedCounts}
    />
  );
}

export const MobileFamilyHorizontalMapFilteredView = React.forwardRef<
  FamilyTreeActions,
  MobileFamilyHorizontalMapFilteredViewProps
>(MobileFamilyHorizontalMapFilteredViewComponent);
