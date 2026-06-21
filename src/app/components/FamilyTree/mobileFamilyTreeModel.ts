import type { Pessoa, Relacionamento } from '../../types';
import { isHumanFamilyMember, isPetFamilyMember } from '../../utils/personEntity';

type ParentKind = 'pai' | 'mae' | 'parent';

type ParentLink = {
  parentId: string;
  kind: ParentKind;
};

type RelationshipIndex = {
  parentsByChild: Map<string, ParentLink[]>;
  childrenByParent: Map<string, Set<string>>;
  siblingsByPerson: Map<string, Set<string>>;
  spousesByPerson: Map<string, Set<string>>;
  paternalUnclesByPerson: Map<string, Set<string>>;
  maternalUnclesByPerson: Map<string, Set<string>>;
  genericUnclesByPerson: Map<string, Set<string>>;
};

export interface MobileFamilyBranch {
  parent: Pessoa[];
  grandparents: Pessoa[];
  greatGrandparents: Pessoa[];
  greatGreatGrandparents: Pessoa[];
  uncles: Pessoa[];
  cousins: Pessoa[];
}

export interface MobileFamilyTreeModel {
  central?: Pessoa;
  father?: Pessoa;
  mother?: Pessoa;
  spouses: Pessoa[];
  siblings: Pessoa[];
  nephews: Pessoa[];
  children: Pessoa[];
  pets: Pessoa[];
  grandchildren: Pessoa[];
  paternal: MobileFamilyBranch;
  maternal: MobileFamilyBranch;
}

export type MobileFamilyExtendedSpousePerson = Pessoa & {
  __mobileFamilyExtendedSpouse?: true;
  __mobileFamilySpouseAnchorId?: string;
};

export function isMobileFamilyExtendedSpouse(person: Pessoa | undefined): person is MobileFamilyExtendedSpousePerson {
  return Boolean((person as MobileFamilyExtendedSpousePerson | undefined)?.__mobileFamilyExtendedSpouse);
}

function addToSetMap(map: Map<string, Set<string>>, key: string | undefined | null, value: string | undefined | null) {
  if (!key || !value || key === value) return;
  const values = map.get(key) ?? new Set<string>();
  values.add(value);
  map.set(key, values);
}

function addParentLink(index: RelationshipIndex, childId: string, parentId: string, kind: ParentKind) {
  const links = index.parentsByChild.get(childId) ?? [];
  if (!links.some((link) => link.parentId === parentId)) {
    links.push({ parentId, kind });
    index.parentsByChild.set(childId, links);
  }
  addToSetMap(index.childrenByParent, parentId, childId);
}

function normalizeRelationshipType(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function relationshipIncludesAny(type: string, terms: string[]) {
  return terms.some((term) => type.includes(term));
}

function addDirectUncleRelationship(index: RelationshipIndex, relationship: Relacionamento, normalizedType: string) {
  const originId = relationship.pessoa_origem_id;
  const destinationId = relationship.pessoa_destino_id;
  if (!originId || !destinationId || originId === destinationId) return;

  const isNephewRelationship = relationshipIncludesAny(normalizedType, [
    'sobrinho',
    'sobrinha',
    'nephew',
    'niece',
  ]);
  const isUncleRelationship = relationshipIncludesAny(normalizedType, [
    'tio',
    'tia',
    'uncle',
    'aunt',
  ]);

  if (!isNephewRelationship && !isUncleRelationship) return;

  const childId = isNephewRelationship && !isUncleRelationship ? destinationId : originId;
  const uncleId = isNephewRelationship && !isUncleRelationship ? originId : destinationId;

  if (relationshipIncludesAny(normalizedType, ['paterno', 'paterna', 'father', 'dad'])) {
    addToSetMap(index.paternalUnclesByPerson, childId, uncleId);
    return;
  }

  if (relationshipIncludesAny(normalizedType, ['materno', 'materna', 'mother', 'mom', 'mae'])) {
    addToSetMap(index.maternalUnclesByPerson, childId, uncleId);
    return;
  }

  addToSetMap(index.genericUnclesByPerson, childId, uncleId);
}

function buildIndex(relacionamentos: Relacionamento[]) {
  const index: RelationshipIndex = {
    parentsByChild: new Map(),
    childrenByParent: new Map(),
    siblingsByPerson: new Map(),
    spousesByPerson: new Map(),
    paternalUnclesByPerson: new Map(),
    maternalUnclesByPerson: new Map(),
    genericUnclesByPerson: new Map(),
  };

  relacionamentos.forEach((relationship) => {
    const originId = relationship.pessoa_origem_id;
    const destinationId = relationship.pessoa_destino_id;
    const normalizedType = normalizeRelationshipType(relationship.tipo_relacionamento as string | undefined | null);

    addDirectUncleRelationship(index, relationship, normalizedType);

    if (!originId || !destinationId) return;

    if (relationship.tipo_relacionamento === 'conjuge') {
      addToSetMap(index.spousesByPerson, originId, destinationId);
      addToSetMap(index.spousesByPerson, destinationId, originId);
      return;
    }

    if (relationship.tipo_relacionamento === 'irmao') {
      addToSetMap(index.siblingsByPerson, originId, destinationId);
      addToSetMap(index.siblingsByPerson, destinationId, originId);
      return;
    }

    if (relationship.tipo_relacionamento === 'filho') {
      addParentLink(index, destinationId, originId, 'parent');
      return;
    }

    if (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae') {
      addParentLink(index, originId, destinationId, relationship.tipo_relacionamento);
    }
  });

  return index;
}

function unique(ids: string[]) {
  return Array.from(new Set(ids));
}

function getBirthSortValue(person?: Pessoa) {
  if (!person?.data_nascimento) return Number.POSITIVE_INFINITY;
  if (typeof person.data_nascimento === 'number') return person.data_nascimento;
  const parsed = Date.parse(person.data_nascimento);
  if (!Number.isNaN(parsed)) return parsed;
  const year = person.data_nascimento.match(/\d{4}/)?.[0];
  return year ? Number(year) : Number.POSITIVE_INFINITY;
}

function sortIds(ids: string[], peopleById: Map<string, Pessoa>) {
  return unique(ids)
    .filter((id) => peopleById.has(id))
    .sort((leftId, rightId) => {
      const left = peopleById.get(leftId);
      const right = peopleById.get(rightId);
      return getBirthSortValue(left) - getBirthSortValue(right)
        || (left?.nome_completo ?? '').localeCompare(right?.nome_completo ?? '', 'pt-BR');
    });
}

function normalizeText(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function isLikelyParentKind(person: Pessoa | undefined, kind: 'pai' | 'mae') {
  if (!person) return false;

  const gender = normalizeText(person.genero);
  if (kind === 'pai' && (gender === 'homem' || gender === 'masculino' || gender === 'male')) return true;
  if (kind === 'mae' && (gender === 'mulher' || gender === 'feminino' || gender === 'female')) return true;

  const name = normalizeText(person.nome_completo);
  if (kind === 'pai') return name.includes('pai') || name.includes('paterno');
  return name.includes('mae') || name.includes('materna');
}

function findParents(personId: string | undefined, index: RelationshipIndex, peopleById: Map<string, Pessoa>) {
  if (!personId) return [];
  return sortIds((index.parentsByChild.get(personId) ?? []).map((link) => link.parentId), peopleById);
}

function findParentByKind(
  personId: string,
  kind: 'pai' | 'mae',
  index: RelationshipIndex,
  peopleById: Map<string, Pessoa>,
) {
  const links = index.parentsByChild.get(personId) ?? [];
  const explicit = links.find((link) => link.kind === kind)?.parentId;
  if (explicit) return explicit;

  const parents = findParents(personId, index, peopleById);
  const inferred = parents.find((parentId) => isLikelyParentKind(peopleById.get(parentId), kind));
  if (inferred) return inferred;

  const opposite = kind === 'pai' ? 'mae' : 'pai';
  const oppositeInferred = parents.find((parentId) => isLikelyParentKind(peopleById.get(parentId), opposite));
  const remaining = parents.find((parentId) => parentId !== oppositeInferred);
  if (remaining) return remaining;

  return parents[kind === 'pai' ? 0 : 1];
}

function findChildren(personId: string | undefined, index: RelationshipIndex, peopleById: Map<string, Pessoa>) {
  if (!personId) return [];
  return sortIds(Array.from(index.childrenByParent.get(personId) ?? []), peopleById);
}

function findSiblings(personId: string, index: RelationshipIndex, peopleById: Map<string, Pessoa>) {
  const sharedParentSiblings = findParents(personId, index, peopleById)
    .flatMap((parentId) => findChildren(parentId, index, peopleById));
  const explicitSiblings = Array.from(index.siblingsByPerson.get(personId) ?? []);
  return sortIds([...sharedParentSiblings, ...explicitSiblings], peopleById)
    .filter((id) => id !== personId);
}

function toPeople(ids: string[], peopleById: Map<string, Pessoa>) {
  return ids.map((id) => peopleById.get(id)).filter((person): person is Pessoa => Boolean(person));
}

function cloneExtendedSpouse(person: Pessoa, anchorId: string): MobileFamilyExtendedSpousePerson {
  return {
    ...person,
    __mobileFamilyExtendedSpouse: true,
    __mobileFamilySpouseAnchorId: anchorId,
  };
}

function toPeopleWithExtendedSpouses(ids: string[], index: RelationshipIndex, peopleById: Map<string, Pessoa>) {
  const baseIds = new Set(ids);
  const addedIds = new Set<string>();
  const people: Pessoa[] = [];

  ids.forEach((anchorId) => {
    const anchor = peopleById.get(anchorId);
    if (!anchor) return;

    people.push(anchor);

    Array.from(index.spousesByPerson.get(anchorId) ?? []).forEach((spouseId) => {
      if (baseIds.has(spouseId) || addedIds.has(spouseId)) return;
      const spouse = peopleById.get(spouseId);
      if (!spouse) return;

      people.push(cloneExtendedSpouse(spouse, anchorId));
      addedIds.add(spouseId);
    });
  });

  return people;
}

function buildBranch(
  parentId: string | undefined,
  otherParentId: string | undefined,
  index: RelationshipIndex,
  peopleById: Map<string, Pessoa>,
  explicitUncleIds: string[] = [],
): MobileFamilyBranch {
  const grandparents = findParents(parentId, index, peopleById);
  const greatGrandparents = sortIds(
    grandparents.flatMap((personId) => findParents(personId, index, peopleById)),
    peopleById,
  );
  const greatGreatGrandparents = sortIds(
    greatGrandparents.flatMap((personId) => findParents(personId, index, peopleById)),
    peopleById,
  );
  const siblingUncles = parentId
    ? findSiblings(parentId, index, peopleById).filter((personId) => personId !== otherParentId)
    : [];
  const uncles = sortIds([...siblingUncles, ...explicitUncleIds], peopleById)
    .filter((personId) => personId !== parentId && personId !== otherParentId);
  const cousins = sortIds(
    uncles.flatMap((personId) => findChildren(personId, index, peopleById)),
    peopleById,
  );

  return {
    parent: toPeople(parentId ? [parentId] : [], peopleById),
    grandparents: toPeople(grandparents, peopleById),
    greatGrandparents: toPeople(greatGrandparents, peopleById),
    greatGreatGrandparents: toPeople(greatGreatGrandparents, peopleById),
    uncles: toPeopleWithExtendedSpouses(uncles, index, peopleById),
    cousins: toPeopleWithExtendedSpouses(cousins, index, peopleById),
  };
}

export function buildMobileFamilyTreeModel(
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[],
  centralPersonId?: string,
): MobileFamilyTreeModel {
  const peopleById = new Map(pessoas.map((person) => [person.id, person]));
  const index = buildIndex(relacionamentos);
  const central = centralPersonId ? peopleById.get(centralPersonId) : undefined;

  if (!central) {
    return {
      spouses: [],
      siblings: [],
      nephews: [],
      children: [],
      pets: [],
      grandchildren: [],
      paternal: buildBranch(undefined, undefined, index, peopleById),
      maternal: buildBranch(undefined, undefined, index, peopleById),
    };
  }

  const parents = findParents(central.id, index, peopleById);
  const fatherId = findParentByKind(central.id, 'pai', index, peopleById) ?? parents[0];
  const motherId = findParentByKind(central.id, 'mae', index, peopleById)
    ?? parents.find((personId) => personId !== fatherId);
  const siblingIds = findSiblings(central.id, index, peopleById);
  const childIds = findChildren(central.id, index, peopleById);
  const humanChildIds = toPeople(childIds, peopleById)
    .filter(isHumanFamilyMember)
    .map((person) => person.id);
  const grandchildIds = sortIds(
    humanChildIds.flatMap((personId) => findChildren(personId, index, peopleById)),
    peopleById,
  );

  const explicitPaternalUncles = Array.from(index.paternalUnclesByPerson.get(central.id) ?? []);
  const explicitMaternalUncles = Array.from(index.maternalUnclesByPerson.get(central.id) ?? []);
  const explicitGenericUncles = Array.from(index.genericUnclesByPerson.get(central.id) ?? []);
  const inferredPaternalUncleIds = fatherId
    ? findSiblings(fatherId, index, peopleById).filter((personId) => personId !== motherId)
    : [];
  const inferredMaternalUncleIds = motherId
    ? findSiblings(motherId, index, peopleById).filter((personId) => personId !== fatherId)
    : [];
  const genericPaternalFallback = inferredPaternalUncleIds.length === 0 && explicitPaternalUncles.length === 0
    ? explicitGenericUncles.filter((personId) => !inferredMaternalUncleIds.includes(personId))
    : [];
  const genericMaternalFallback = inferredMaternalUncleIds.length === 0 && explicitMaternalUncles.length === 0
    ? explicitGenericUncles.filter((personId) => !inferredPaternalUncleIds.includes(personId))
    : [];

  return {
    central,
    father: fatherId ? peopleById.get(fatherId) : undefined,
    mother: motherId ? peopleById.get(motherId) : undefined,
    spouses: toPeople(sortIds(Array.from(index.spousesByPerson.get(central.id) ?? []), peopleById), peopleById),
    siblings: toPeople(siblingIds, peopleById),
    nephews: toPeople(
      sortIds(siblingIds.flatMap((personId) => findChildren(personId, index, peopleById)), peopleById),
      peopleById,
    ),
    children: toPeople(humanChildIds, peopleById),
    pets: toPeople(childIds, peopleById).filter(isPetFamilyMember),
    grandchildren: toPeople(grandchildIds, peopleById).filter(isHumanFamilyMember),
    paternal: buildBranch(
      fatherId,
      motherId,
      index,
      peopleById,
      [...explicitPaternalUncles, ...genericPaternalFallback],
    ),
    maternal: buildBranch(
      motherId,
      fatherId,
      index,
      peopleById,
      [...explicitMaternalUncles, ...genericMaternalFallback],
    ),
  };
}
