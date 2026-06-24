import React from 'react';

import type { Pessoa, Relacionamento } from '../../types';
import { isPetFamilyMember } from '../../utils/personEntity';
import type { FamilyTreeActions } from './FamilyTree';
import { MobileFamilyHorizontalMapView } from './MobileFamilyHorizontalMapView';
import {
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

function addIds(target: Set<string>, ids?: Set<string>) {
  ids?.forEach((id) => target.add(id));
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

function collectParents(personIds: Set<string>, maps: RelationshipMaps) {
  const result = new Set<string>();

  personIds.forEach((personId) => {
    addIds(result, maps.parentsByChild.get(personId));
  });

  return result;
}

function collectChildren(personIds: Set<string>, maps: RelationshipMaps) {
  const result = new Set<string>();

  personIds.forEach((personId) => {
    addIds(result, maps.childrenByParent.get(personId));
  });

  return result;
}

function collectSiblings(personId: string, maps: RelationshipMaps) {
  const siblings = new Set<string>();

  maps.parentsByChild.get(personId)?.forEach((parentId) => {
    maps.childrenByParent.get(parentId)?.forEach((siblingId) => {
      if (siblingId !== personId) siblings.add(siblingId);
    });
  });

  return siblings;
}

function collectLightweightDirectScopePersonIds(
  pessoas: Pessoa[],
  maps: RelationshipMaps,
  centralPersonId: string,
  filters: DirectRelativeFilters,
) {
  const scopeIds = new Set<string>([centralPersonId]);
  const centralIds = new Set([centralPersonId]);
  const parents = collectParents(centralIds, maps);
  const grandparents = collectParents(parents, maps);
  const greatGrandparents = collectParents(grandparents, maps);
  const greatGreatGrandparents = collectParents(greatGrandparents, maps);
  const children = collectChildren(centralIds, maps);
  const grandchildren = collectChildren(children, maps);
  const siblings = collectSiblings(centralPersonId, maps);
  const siblingsChildren = collectChildren(siblings, maps);
  const unclesAndAunts = new Set<string>();

  parents.forEach((parentId) => {
    collectSiblings(parentId, maps).forEach((relativeId) => unclesAndAunts.add(relativeId));
  });

  const cousins = collectChildren(unclesAndAunts, maps);

  if (filters.pais) addIds(scopeIds, parents);
  if (filters.avos) addIds(scopeIds, grandparents);
  if (filters.bisavos) addIds(scopeIds, greatGrandparents);
  if (filters.tataravos) addIds(scopeIds, greatGreatGrandparents);
  if (filters.filhos) addIds(scopeIds, children);
  if (filters.netos) addIds(scopeIds, grandchildren);
  if (filters.irmaos) addIds(scopeIds, siblings);
  if (filters.sobrinhos) addIds(scopeIds, siblingsChildren);
  if (filters.tios) addIds(scopeIds, unclesAndAunts);
  if (filters.primos) addIds(scopeIds, cousins);
  if (filters.conjuge) addIds(scopeIds, maps.spousesByPerson.get(centralPersonId));

  if (filters.pets) {
    const peopleById = new Map(pessoas.map((person) => [person.id, person]));
    collectChildren(centralIds, maps).forEach((childId) => {
      const child = peopleById.get(childId);
      if (child && isPetFamilyMember(child)) scopeIds.add(child.id);
    });
  }

  return scopeIds;
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
  _pessoas: Pessoa[],
  maps: RelationshipMaps,
  centralPersonId: string,
  visiblePersonIds: Set<string> | undefined,
  directRelativeFilters: DirectRelativeFilters
) {
  if (!directRelativeFilters.conjuge) return directScopeIds;

  const nextScopeIds = new Set(directScopeIds);

  spouseAnchorScopeIds.forEach((anchorId) => {
    maps.spousesByPerson.get(anchorId)?.forEach((spouseId) => {
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
  const [shouldRenderMap, setShouldRenderMap] = React.useState(false);
  const relationshipMaps = React.useMemo(() => buildRelationshipMaps(relacionamentos), [relacionamentos]);

  React.useEffect(() => {
    setShouldRenderMap(false);

    const frameId = window.requestAnimationFrame(() => {
      setShouldRenderMap(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [centralPersonId, layoutRevision]);

  const filteredVisiblePersonIds = React.useMemo(() => {
    const directScopeIds = collectLightweightDirectScopePersonIds(
      pessoas,
      relationshipMaps,
      centralPersonId,
      {
        ...directRelativeFilters,
        conjuge: true,
      }
    );
    const spouseAnchorScopeIds = collectLightweightDirectScopePersonIds(
      pessoas,
      relationshipMaps,
      centralPersonId,
      {
        ...directRelativeFilters,
        conjuge: false,
      }
    );
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
      relationshipMaps,
      centralPersonId,
      visiblePersonIds,
      directRelativeFilters
    );

    if (expandedDirectScopeIds.size === 0) return visiblePersonIds;
    return intersectVisiblePersonIds(expandedDirectScopeIds, visiblePersonIds, centralPersonId);
  }, [centralPersonId, directRelativeFilters, pessoas, relationshipMaps, relacionamentos, visiblePersonIds]);

  const scopedPessoas = React.useMemo(() => {
    if (!filteredVisiblePersonIds) return pessoas;

    return pessoas.filter((person) => (
      person.id === centralPersonId || filteredVisiblePersonIds.has(person.id)
    ));
  }, [centralPersonId, filteredVisiblePersonIds, pessoas]);

  const scopedPersonIds = React.useMemo(
    () => new Set(scopedPessoas.map((person) => person.id)),
    [scopedPessoas],
  );

  const scopedRelacionamentos = React.useMemo(() => {
    if (!filteredVisiblePersonIds) return relacionamentos;

    return relacionamentos.filter((relationship) => {
      const origemId = relationship.pessoa_origem_id;
      const destinoId = relationship.pessoa_destino_id;

      return Boolean(
        origemId
        && destinoId
        && scopedPersonIds.has(origemId)
        && scopedPersonIds.has(destinoId)
      );
    });
  }, [filteredVisiblePersonIds, relacionamentos, scopedPersonIds]);

  if (!shouldRenderMap) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center px-4 text-center text-sm font-semibold text-slate-500">
        Preparando mapa genealógico...
      </div>
    );
  }

  return (
    <MobileFamilyHorizontalMapView
      ref={ref}
      pessoas={scopedPessoas}
      visiblePersonIds={undefined}
      relacionamentos={scopedRelacionamentos}
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
