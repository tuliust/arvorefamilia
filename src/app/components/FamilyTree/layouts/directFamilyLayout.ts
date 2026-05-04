import { Edge, Node } from 'reactflow';
import { Relacionamento } from '../../../types';
import {
  DEFAULT_DIRECT_RELATIVE_FILTERS,
  DirectRelationVariant,
  DirectRelativeFilters,
  TreeLayoutParams,
  TreeLayoutResult,
  getSortableBirthValue,
} from '../types';
import { FAMILY_TREE_COLORS } from '../visualTokens';

interface DirectFamilyLayoutOptions {
  centralPersonId?: string;
  filters?: DirectRelativeFilters;
}

type ParentKind = 'pai' | 'mae' | 'parent';
type Side = 'paternal' | 'maternal';

interface ParentLink {
  parentId: string;
  childId: string;
  kind: ParentKind;
}

interface RelationshipIndex {
  parentsByChild: Map<string, ParentLink[]>;
  childrenByParent: Map<string, Set<string>>;
  siblingsByPerson: Map<string, Set<string>>;
  spousesByPerson: Map<string, Set<string>>;
}

const CENTER_X = 1600;
const CENTER_Y = 820;
const NODE_WIDTH = 220;
const NODE_HEIGHT = 78;
const CENTRAL_WIDTH = 190;
const CENTRAL_HEIGHT = 220;
const ROW_GAP = 94;
const COLUMN_GAP = 36;
const SIDE_X_GAP = 470;
const OUTER_SIDE_X_GAP = 1030;

const CENTRAL_X = CENTER_X - CENTRAL_WIDTH / 2;
const CENTRAL_Y = CENTER_Y - CENTRAL_HEIGHT / 2;
const FATHER_CENTER_X = CENTER_X - SIDE_X_GAP;
const MOTHER_CENTER_X = CENTER_X + SIDE_X_GAP;
const PATERNAL_OUTER_CENTER_X = CENTER_X - OUTER_SIDE_X_GAP;
const MATERNAL_OUTER_CENTER_X = CENTER_X + OUTER_SIDE_X_GAP;

const TATARAVOS_Y = CENTRAL_Y - 510;
const BISAVOS_Y = CENTRAL_Y - 365;
const AVOS_Y = CENTRAL_Y - 220;
const PAIS_Y = CENTRAL_Y + 50;
const TIOS_Y = PAIS_Y;
const PRIMOS_Y = PAIS_Y + 150;
const IRMAOS_Y = CENTRAL_Y + CENTRAL_HEIGHT + 92;
const SOBRINHOS_Y = IRMAOS_Y + 118;

function unique(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

function sortPersonIds(ids: string[], pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>) {
  return unique(ids).sort((aId, bId) => {
    const pessoaA = pessoasById.get(aId);
    const pessoaB = pessoasById.get(bId);
    const birthA = getSortableBirthValue(pessoaA?.data_nascimento);
    const birthB = getSortableBirthValue(pessoaB?.data_nascimento);

    if (birthA !== birthB) return birthA - birthB;
    return (pessoaA?.nome_completo || '').localeCompare(pessoaB?.nome_completo || '');
  });
}

function addToSetMap(map: Map<string, Set<string>>, key: string, value: string) {
  if (!key || !value || key === value) return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key)!.add(value);
}

function addParentLink(index: RelationshipIndex, link: ParentLink) {
  if (!link.parentId || !link.childId || link.parentId === link.childId) return;

  const current = index.parentsByChild.get(link.childId) || [];
  const hasLink = current.some(
    (item) => item.parentId === link.parentId && item.childId === link.childId
  );

  if (!hasLink) {
    current.push(link);
    index.parentsByChild.set(link.childId, current);
  }

  addToSetMap(index.childrenByParent, link.parentId, link.childId);
}

function buildRelationshipIndex(relacionamentos: Relacionamento[]): RelationshipIndex {
  const index: RelationshipIndex = {
    parentsByChild: new Map(),
    childrenByParent: new Map(),
    siblingsByPerson: new Map(),
    spousesByPerson: new Map(),
  };

  relacionamentos.forEach((rel) => {
    if (rel.tipo_relacionamento === 'conjuge') {
      addToSetMap(index.spousesByPerson, rel.pessoa_origem_id, rel.pessoa_destino_id);
      addToSetMap(index.spousesByPerson, rel.pessoa_destino_id, rel.pessoa_origem_id);
      return;
    }

    if (rel.tipo_relacionamento === 'irmao') {
      addToSetMap(index.siblingsByPerson, rel.pessoa_origem_id, rel.pessoa_destino_id);
      addToSetMap(index.siblingsByPerson, rel.pessoa_destino_id, rel.pessoa_origem_id);
      return;
    }

    if (rel.tipo_relacionamento === 'filho') {
      addParentLink(index, {
        parentId: rel.pessoa_origem_id,
        childId: rel.pessoa_destino_id,
        kind: 'parent',
      });
      return;
    }

    if (rel.tipo_relacionamento === 'pai' || rel.tipo_relacionamento === 'mae') {
      addParentLink(index, {
        parentId: rel.pessoa_destino_id,
        childId: rel.pessoa_origem_id,
        kind: rel.tipo_relacionamento,
      });
    }
  });

  return index;
}

function findParents(
  personId: string,
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  const links = index.parentsByChild.get(personId) || [];
  return sortPersonIds(links.map((link) => link.parentId), pessoasById);
}

function findParentByKind(
  personId: string,
  kind: 'pai' | 'mae',
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  const links = index.parentsByChild.get(personId) || [];
  const explicit = links.find((link) => link.kind === kind)?.parentId;
  if (explicit) return explicit;

  return findParents(personId, index, pessoasById).find((id) => {
    const pessoa = pessoasById.get(id);
    const name = pessoa?.nome_completo.toLocaleLowerCase('pt-BR') || '';
    return kind === 'pai' ? !name.includes('mãe') && !name.includes('mae') : false;
  });
}

function findChildren(
  personId: string,
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  return sortPersonIds(Array.from(index.childrenByParent.get(personId) || []), pessoasById);
}

function findSiblings(
  personId: string,
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  const parentIds = findParents(personId, index, pessoasById);
  const sharedParentSiblings = parentIds.flatMap((parentId) => findChildren(parentId, index, pessoasById));
  const explicitSiblings = Array.from(index.siblingsByPerson.get(personId) || []);

  return sortPersonIds(
    unique([...sharedParentSiblings, ...explicitSiblings]).filter((id) => id !== personId),
    pessoasById
  );
}

function findGrandparents(
  parentId: string | undefined,
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  if (!parentId) return [];
  return findParents(parentId, index, pessoasById);
}

function findGreatGrandparents(
  ancestorIds: string[],
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  return sortPersonIds(ancestorIds.flatMap((ancestorId) => findParents(ancestorId, index, pessoasById)), pessoasById);
}

function findUnclesAndAunts(
  parentId: string | undefined,
  otherParentId: string | undefined,
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  if (!parentId) return [];
  return findSiblings(parentId, index, pessoasById).filter((id) => id !== otherParentId);
}

function findCousins(
  uncleAndAuntIds: string[],
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  return sortPersonIds(uncleAndAuntIds.flatMap((id) => findChildren(id, index, pessoasById)), pessoasById);
}

function groupByPaternalMaternalSide(
  centralPersonId: string,
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  const parents = findParents(centralPersonId, index, pessoasById);
  const pai = findParentByKind(centralPersonId, 'pai', index, pessoasById) || parents[0];
  const mae = findParentByKind(centralPersonId, 'mae', index, pessoasById) || parents.find((id) => id !== pai);

  const paternalGrandparents = findGrandparents(pai, index, pessoasById);
  const maternalGrandparents = findGrandparents(mae, index, pessoasById);
  const paternalGreatGrandparents = findGreatGrandparents(paternalGrandparents, index, pessoasById);
  const maternalGreatGrandparents = findGreatGrandparents(maternalGrandparents, index, pessoasById);
  const paternalGreatGreatGrandparents = findGreatGrandparents(paternalGreatGrandparents, index, pessoasById);
  const maternalGreatGreatGrandparents = findGreatGrandparents(maternalGreatGrandparents, index, pessoasById);
  const paternalUncles = findUnclesAndAunts(pai, mae, index, pessoasById);
  const maternalUncles = findUnclesAndAunts(mae, pai, index, pessoasById);

  return {
    paternal: {
      parentId: pai,
      grandparents: paternalGrandparents,
      greatGrandparents: paternalGreatGrandparents,
      greatGreatGrandparents: paternalGreatGreatGrandparents,
      uncles: paternalUncles,
      cousins: findCousins(paternalUncles, index, pessoasById),
    },
    maternal: {
      parentId: mae,
      grandparents: maternalGrandparents,
      greatGrandparents: maternalGreatGrandparents,
      greatGreatGrandparents: maternalGreatGreatGrandparents,
      uncles: maternalUncles,
      cousins: findCousins(maternalUncles, index, pessoasById),
    },
    parents: sortPersonIds([pai, mae].filter(Boolean) as string[], pessoasById),
  };
}

function nodeXFromCenter(centerX: number) {
  return centerX - NODE_WIDTH / 2;
}

function finitePosition(x: number, y: number) {
  return {
    x: Number.isFinite(x) ? x : CENTER_X,
    y: Number.isFinite(y) ? y : CENTER_Y,
  };
}

function clonePersonNode(
  node: Node,
  x: number,
  y: number,
  variant: DirectRelationVariant,
  isCentral = false
): Node {
  return {
    ...node,
    position: finitePosition(x, y),
    data: {
      ...node.data,
      directRelation: variant,
      isCentralPerson: isCentral,
      isSelected: isCentral || node.data?.isSelected,
    },
  };
}

function placePerson(
  id: string | undefined,
  x: number,
  y: number,
  variant: DirectRelationVariant,
  positionedNodes: Node[],
  positionedIds: Set<string>,
  personNodeById: Map<string, Node>,
  isCentral = false
) {
  if (!id || positionedIds.has(id)) return false;
  const node = personNodeById.get(id);
  if (!node) return false;

  positionedNodes.push(clonePersonNode(node, x, y, variant, isCentral));
  positionedIds.add(id);
  return true;
}

function placeGridCentered(
  ids: string[],
  centerX: number,
  y: number,
  maxPerRow: number,
  variant: DirectRelationVariant,
  positionedNodes: Node[],
  positionedIds: Set<string>,
  personNodeById: Map<string, Node>
) {
  const visibleIds = ids.filter((id) => !positionedIds.has(id) && personNodeById.has(id));
  if (visibleIds.length === 0) return;

  const rows: string[][] = [];
  for (let index = 0; index < visibleIds.length; index += maxPerRow) {
    rows.push(visibleIds.slice(index, index + maxPerRow));
  }

  rows.forEach((row, rowIndex) => {
    const totalWidth = row.length * NODE_WIDTH + Math.max(0, row.length - 1) * COLUMN_GAP;
    const startX = centerX - totalWidth / 2;

    row.forEach((id, index) => {
      placePerson(
        id,
        startX + index * (NODE_WIDTH + COLUMN_GAP),
        y + rowIndex * ROW_GAP,
        variant,
        positionedNodes,
        positionedIds,
        personNodeById
      );
    });
  });
}

function addLabel(
  nodes: Node[],
  id: string,
  label: string,
  x: number,
  y: number,
  visible: boolean
) {
  if (!visible) return;
  nodes.push({
    id,
    type: 'directFamilyLabelNode',
    data: { label },
    position: finitePosition(x, y),
    draggable: false,
    selectable: false,
  });
}

function positionedHasAny(positionedIds: Set<string>, ids: string[]) {
  return ids.some((id) => positionedIds.has(id));
}

function createEdgeBuilder(positionedIds: Set<string>) {
  const edgeIds = new Set<string>();
  const edges: Edge[] = [];

  const addEdge = (edge: Edge) => {
    if (!positionedIds.has(edge.source) || !positionedIds.has(edge.target)) return;
    if (edgeIds.has(edge.id)) return;
    edgeIds.add(edge.id);
    edges.push(edge);
  };

  return { edges, addEdge };
}

function addParentChildEdge(
  addEdge: (edge: Edge) => void,
  parentId: string,
  childId: string,
  options: {
    sourceHandle?: string;
    targetHandle?: string;
    idSuffix?: string;
    strokeWidth?: number;
  } = {}
) {
  addEdge({
    id: `direct-child-${parentId}-${childId}${options.idSuffix || ''}`,
    source: parentId,
    sourceHandle: options.sourceHandle || 'bottom',
    target: childId,
    targetHandle: options.targetHandle || 'top',
    type: 'childEdge',
    style: {
      stroke: FAMILY_TREE_COLORS.EDGE_CHILD,
      strokeWidth: options.strokeWidth || 2.25,
    },
  });
}

function addSpouseEdge(addEdge: (edge: Edge) => void, leftId: string | undefined, rightId: string | undefined) {
  if (!leftId || !rightId || leftId === rightId) return;

  addEdge({
    id: `direct-spouse-${[leftId, rightId].sort().join('-')}`,
    source: leftId,
    sourceHandle: 'spouse-right',
    target: rightId,
    targetHandle: 'spouse-left',
    type: 'spouseEdge',
    style: { stroke: FAMILY_TREE_COLORS.EDGE_SPOUSE, strokeWidth: 2.5 },
  });
}

function addSideAncestorEdges(
  addEdge: (edge: Edge) => void,
  side: Side,
  parentId: string | undefined,
  grandparents: string[],
  greatGrandparents: string[],
  greatGreatGrandparents: string[],
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  const targetHandle = side === 'paternal' ? 'top' : 'top';
  grandparents.forEach((grandparentId) => {
    if (parentId) {
      addParentChildEdge(addEdge, grandparentId, parentId, { targetHandle });
    }
  });

  greatGrandparents.forEach((greatGrandparentId) => {
    findChildren(greatGrandparentId, index, pessoasById)
      .filter((childId) => grandparents.includes(childId))
      .forEach((childId) => addParentChildEdge(addEdge, greatGrandparentId, childId));
  });

  greatGreatGrandparents.forEach((greatGreatGrandparentId) => {
    findChildren(greatGreatGrandparentId, index, pessoasById)
      .filter((childId) => greatGrandparents.includes(childId))
      .forEach((childId) => addParentChildEdge(addEdge, greatGreatGrandparentId, childId));
  });
}

export function directFamilyLayout(
  {
    personNodes,
    pessoas,
    relacionamentos,
  }: TreeLayoutParams,
  options: DirectFamilyLayoutOptions = {}
): TreeLayoutResult {
  const personNodeById = new Map(personNodes.map((node) => [node.id, node]));
  const pessoasById = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const centralPersonId = options.centralPersonId && personNodeById.has(options.centralPersonId)
    ? options.centralPersonId
    : pessoas[0]?.id;

  if (!centralPersonId || !personNodeById.has(centralPersonId)) {
    return { nodes: [], edges: [] };
  }

  const filters = options.filters || DEFAULT_DIRECT_RELATIVE_FILTERS;
  const index = buildRelationshipIndex(relacionamentos);
  const groups = groupByPaternalMaternalSide(centralPersonId, index, pessoasById);
  const siblings = findSiblings(centralPersonId, index, pessoasById);
  const nephewsAndNieces = sortPersonIds(siblings.flatMap((id) => findChildren(id, index, pessoasById)), pessoasById);
  const spouses = sortPersonIds(Array.from(index.spousesByPerson.get(centralPersonId) || []), pessoasById);
  const children = findChildren(centralPersonId, index, pessoasById);
  const grandchildren = sortPersonIds(children.flatMap((id) => findChildren(id, index, pessoasById)), pessoasById);

  const visiblePeople = new Set<string>([centralPersonId]);
  const addVisible = (enabled: boolean, ids: string[]) => {
    if (!enabled) return;
    ids.forEach((id) => {
      if (id !== centralPersonId && personNodeById.has(id)) visiblePeople.add(id);
    });
  };

  addVisible(filters.pais, groups.parents);
  addVisible(filters.avos, [...groups.paternal.grandparents, ...groups.maternal.grandparents]);
  addVisible(filters.bisavos, [...groups.paternal.greatGrandparents, ...groups.maternal.greatGrandparents]);
  addVisible(filters.tataravos, [...groups.paternal.greatGreatGrandparents, ...groups.maternal.greatGreatGrandparents]);
  addVisible(filters.irmaos, siblings);
  addVisible(filters.irmaos, nephewsAndNieces);
  addVisible(filters.tios, [...groups.paternal.uncles, ...groups.maternal.uncles]);
  addVisible(filters.primos, [...groups.paternal.cousins, ...groups.maternal.cousins]);
  addVisible(filters.conjuge, spouses);
  addVisible(filters.filhos, children);
  addVisible(filters.netos, grandchildren);

  const onlyVisible = (ids: string[]) =>
    sortPersonIds(ids.filter((id) => id !== centralPersonId && visiblePeople.has(id)), pessoasById);
  const positionedNodes: Node[] = [];
  const positionedIds = new Set<string>();

  placeGridCentered(onlyVisible(groups.paternal.greatGreatGrandparents), FATHER_CENTER_X, TATARAVOS_Y, 4, 'greatGreatGrandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(groups.maternal.greatGreatGrandparents), MOTHER_CENTER_X, TATARAVOS_Y, 4, 'greatGreatGrandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(groups.paternal.greatGrandparents), FATHER_CENTER_X, BISAVOS_Y, 4, 'greatGrandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(groups.maternal.greatGrandparents), MOTHER_CENTER_X, BISAVOS_Y, 4, 'greatGrandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(groups.paternal.grandparents), FATHER_CENTER_X, AVOS_Y, 2, 'grandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(groups.maternal.grandparents), MOTHER_CENTER_X, AVOS_Y, 2, 'grandparent', positionedNodes, positionedIds, personNodeById);

  placeGridCentered(onlyVisible(groups.paternal.uncles), PATERNAL_OUTER_CENTER_X, TIOS_Y, 3, 'uncleAunt', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(groups.maternal.uncles), MATERNAL_OUTER_CENTER_X, TIOS_Y, 3, 'uncleAunt', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(groups.paternal.cousins), PATERNAL_OUTER_CENTER_X, PRIMOS_Y, 4, 'cousin', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(groups.maternal.cousins), MATERNAL_OUTER_CENTER_X, PRIMOS_Y, 4, 'cousin', positionedNodes, positionedIds, personNodeById);

  placePerson(groups.paternal.parentId, nodeXFromCenter(FATHER_CENTER_X), PAIS_Y, 'parent', positionedNodes, positionedIds, personNodeById);
  placePerson(groups.maternal.parentId, nodeXFromCenter(MOTHER_CENTER_X), PAIS_Y, 'parent', positionedNodes, positionedIds, personNodeById);
  placePerson(centralPersonId, CENTRAL_X, CENTRAL_Y, 'central', positionedNodes, positionedIds, personNodeById, true);

  placeGridCentered(onlyVisible(siblings), CENTER_X, IRMAOS_Y, 4, 'sibling', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(nephewsAndNieces), CENTER_X - 360, SOBRINHOS_Y, 3, 'nephewNiece', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(spouses), CENTER_X + 360, SOBRINHOS_Y, 2, 'spouse', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(children), CENTER_X, SOBRINHOS_Y + ROW_GAP, 4, 'child', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(grandchildren), CENTER_X, SOBRINHOS_Y + ROW_GAP * 2, 4, 'grandchild', positionedNodes, positionedIds, personNodeById);

  addLabel(positionedNodes, 'direct-label-tataravos', 'TATARAVÓS', CENTER_X - 72, TATARAVOS_Y + 20, positionedHasAny(positionedIds, [...groups.paternal.greatGreatGrandparents, ...groups.maternal.greatGreatGrandparents]));
  addLabel(positionedNodes, 'direct-label-bisavos', 'BISAVÓS', CENTER_X - 58, BISAVOS_Y + 20, positionedHasAny(positionedIds, [...groups.paternal.greatGrandparents, ...groups.maternal.greatGrandparents]));
  addLabel(positionedNodes, 'direct-label-avos', 'AVÓS', CENTER_X - 42, AVOS_Y + 20, positionedHasAny(positionedIds, [...groups.paternal.grandparents, ...groups.maternal.grandparents]));
  addLabel(positionedNodes, 'direct-label-tio-paterno', 'TIO', PATERNAL_OUTER_CENTER_X - 28, TIOS_Y - 42, positionedHasAny(positionedIds, groups.paternal.uncles));
  addLabel(positionedNodes, 'direct-label-tio-materno', 'TIO', MATERNAL_OUTER_CENTER_X - 28, TIOS_Y - 42, positionedHasAny(positionedIds, groups.maternal.uncles));
  addLabel(positionedNodes, 'direct-label-primos-paternos', 'PRIMOS', PATERNAL_OUTER_CENTER_X - 54, PRIMOS_Y - 42, positionedHasAny(positionedIds, groups.paternal.cousins));
  addLabel(positionedNodes, 'direct-label-primos-maternos', 'PRIMOS', MATERNAL_OUTER_CENTER_X - 54, PRIMOS_Y - 42, positionedHasAny(positionedIds, groups.maternal.cousins));

  const { edges, addEdge } = createEdgeBuilder(positionedIds);

  if (groups.paternal.parentId) {
    addParentChildEdge(addEdge, groups.paternal.parentId, centralPersonId, {
      sourceHandle: 'child-right',
      targetHandle: 'left-target',
      idSuffix: '-paternal',
      strokeWidth: 2.5,
    });
  }

  if (groups.maternal.parentId) {
    addParentChildEdge(addEdge, groups.maternal.parentId, centralPersonId, {
      sourceHandle: 'child-left',
      targetHandle: 'right-target',
      idSuffix: '-maternal',
      strokeWidth: 2.5,
    });
  }

  addSpouseEdge(addEdge, groups.paternal.parentId, groups.maternal.parentId);
  addSideAncestorEdges(addEdge, 'paternal', groups.paternal.parentId, groups.paternal.grandparents, groups.paternal.greatGrandparents, groups.paternal.greatGreatGrandparents, index, pessoasById);
  addSideAncestorEdges(addEdge, 'maternal', groups.maternal.parentId, groups.maternal.grandparents, groups.maternal.greatGrandparents, groups.maternal.greatGreatGrandparents, index, pessoasById);

  groups.paternal.grandparents.forEach((grandparentId) => {
    findChildren(grandparentId, index, pessoasById)
      .filter((childId) => groups.paternal.uncles.includes(childId))
      .forEach((childId) => addParentChildEdge(addEdge, grandparentId, childId));
  });

  groups.maternal.grandparents.forEach((grandparentId) => {
    findChildren(grandparentId, index, pessoasById)
      .filter((childId) => groups.maternal.uncles.includes(childId))
      .forEach((childId) => addParentChildEdge(addEdge, grandparentId, childId));
  });

  [...groups.paternal.uncles, ...groups.maternal.uncles].forEach((uncleId) => {
    findChildren(uncleId, index, pessoasById)
      .filter((childId) => [...groups.paternal.cousins, ...groups.maternal.cousins].includes(childId))
      .forEach((childId) => addParentChildEdge(addEdge, uncleId, childId));
  });

  siblings.forEach((siblingId) => {
    addParentChildEdge(addEdge, centralPersonId, siblingId, {
      idSuffix: '-sibling',
      strokeWidth: 2,
    });

    findChildren(siblingId, index, pessoasById)
      .filter((childId) => nephewsAndNieces.includes(childId))
      .forEach((childId) => addParentChildEdge(addEdge, siblingId, childId));
  });

  spouses.forEach((spouseId) => {
    const centralNode = positionedNodes.find((node) => node.id === centralPersonId);
    const spouseNode = positionedNodes.find((node) => node.id === spouseId);
    const centralIsLeft = !spouseNode || !centralNode || centralNode.position.x <= spouseNode.position.x;
    addSpouseEdge(addEdge, centralIsLeft ? centralPersonId : spouseId, centralIsLeft ? spouseId : centralPersonId);
  });

  children.forEach((childId) => {
    addParentChildEdge(addEdge, centralPersonId, childId, { idSuffix: '-child' });
  });

  grandchildren.forEach((grandchildId) => {
    const parents = findParents(grandchildId, index, pessoasById).filter((parentId) => children.includes(parentId));
    parents.forEach((parentId) => addParentChildEdge(addEdge, parentId, grandchildId, { idSuffix: '-grandchild' }));
  });

  return {
    nodes: positionedNodes,
    edges,
  };
}
