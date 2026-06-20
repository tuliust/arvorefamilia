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

function addToSetMap(map: Map<string, Set<string>>, key: string, value: string) {
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

function buildIndex(relacionamentos: Relacionamento[]) {
  const index: RelationshipIndex = {
    parentsByChild: new Map(),
    childrenByParent: new Map(),
    siblingsByPerson: new Map(),
    spousesByPerson: new Map(),
  };

  relacionamentos.forEach((relationship) => {
    const originId = relationship.pessoa_origem_id;
    const destinationId = relationship.pessoa_destino_id;

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

function buildBranch(
  parentId: string | undefined,
  otherParentId: string | undefined,
  index: RelationshipIndex,
  peopleById: Map<string, Pessoa>,
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
  const uncles = parentId
    ? findSiblings(parentId, index, peopleById).filter((personId) => personId !== otherParentId)
    : [];
  const cousins = sortIds(
    uncles.flatMap((personId) => findChildren(personId, index, peopleById)),
    peopleById,
  );

  return {
    parent: toPeople(parentId ? [parentId] : [], peopleById),
    grandparents: toPeople(grandparents, peopleById),
    greatGrandparents: toPeople(greatGrandparents, peopleById),
    greatGreatGrandparents: toPeople(greatGreatGrandparents, peopleById),
    uncles: toPeople(uncles, peopleById),
    cousins: toPeople(cousins, peopleById),
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
    paternal: buildBranch(fatherId, motherId, index, peopleById),
    maternal: buildBranch(motherId, fatherId, index, peopleById),
  };
}
