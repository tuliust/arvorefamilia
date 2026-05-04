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
import { DIRECT_FAMILY_TOKENS } from '../visualTokens';

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

export const DIRECT_CENTER_X = 1600;
export const DIRECT_CENTER_Y = 780;
export const DIRECT_CARD_WIDTH = DIRECT_FAMILY_TOKENS.CARD_WIDTH;
export const DIRECT_CARD_HEIGHT = DIRECT_FAMILY_TOKENS.CARD_HEIGHT;
export const DIRECT_CENTER_CARD_WIDTH = DIRECT_FAMILY_TOKENS.CENTRAL_WIDTH;
export const DIRECT_CENTER_CARD_HEIGHT = DIRECT_FAMILY_TOKENS.CENTRAL_HEIGHT;
export const DIRECT_GROUP_GAP_X = 48;
export const DIRECT_GROUP_GAP_Y = 100;
export const DIRECT_LABEL_GAP = 28;
export const DIRECT_LABEL_GAP_Y = DIRECT_LABEL_GAP;

const CENTER_X = DIRECT_CENTER_X;
const CENTER_Y = DIRECT_CENTER_Y;
const NODE_WIDTH = DIRECT_CARD_WIDTH;
const NODE_HEIGHT = DIRECT_CARD_HEIGHT;
const CENTRAL_WIDTH = DIRECT_CENTER_CARD_WIDTH;
const CENTRAL_HEIGHT = DIRECT_CENTER_CARD_HEIGHT;
const ROW_GAP = 112;
const COLUMN_GAP = 34;
const SIBLING_COLUMN_GAP = DIRECT_GROUP_GAP_X;
const UNCLE_COLUMN_GAP = 34;
const COUSIN_COLUMN_GAP = 38;
const UNCLES_PER_ROW = 3;
const COUSINS_PER_ROW = 4;
export const DIRECT_SIBLINGS_COLUMNS = 2;
const SIDE_X_GAP = 270;
const OUTER_SIDE_X_GAP = 910;
const DIRECT_LABEL_HEIGHT = 24;
const DIRECT_LABEL_TO_CARD_GAP = 12;
const GROUP_ANCHOR_GAP = 18;

const CENTRAL_X = CENTER_X - CENTRAL_WIDTH / 2;
const CENTRAL_Y = CENTER_Y - CENTRAL_HEIGHT / 2;
export const DIRECT_MAIN_AXIS_X = CENTRAL_X + CENTRAL_WIDTH / 2;
const FATHER_CENTER_X = CENTER_X - SIDE_X_GAP;
const MOTHER_CENTER_X = CENTER_X + SIDE_X_GAP;
const PATERNAL_OUTER_CENTER_X = CENTER_X - OUTER_SIDE_X_GAP;
const MATERNAL_OUTER_CENTER_X = CENTER_X + OUTER_SIDE_X_GAP;

const TATARAVOS_Y = CENTRAL_Y - 450;
const BISAVOS_Y = CENTRAL_Y - 306;
const AVOS_Y = CENTRAL_Y - 162;
const PAIS_Y = CENTRAL_Y + 52;
const TIOS_Y = PAIS_Y;
const UNCLE_COUSIN_VERTICAL_GAP = 218;
const PRIMOS_Y = TIOS_Y + UNCLE_COUSIN_VERTICAL_GAP;
const CENTRAL_BOTTOM_Y = CENTRAL_Y + CENTRAL_HEIGHT;
export const DIRECT_BELOW_CENTER_START_Y = CENTRAL_BOTTOM_Y + 84;
export const DIRECT_LEFT_ZONE_CENTER_X = DIRECT_MAIN_AXIS_X - 330;
export const DIRECT_RIGHT_ZONE_CENTER_X = DIRECT_MAIN_AXIS_X + 330;
export const DIRECT_SPOUSE_OFFSET_Y = 0;
export const DIRECT_CHILDREN_OFFSET_Y = NODE_HEIGHT + 84;

const SPOUSE_LABEL_Y = DIRECT_BELOW_CENTER_START_Y + DIRECT_SPOUSE_OFFSET_Y;
const SPOUSE_Y = SPOUSE_LABEL_Y + DIRECT_LABEL_HEIGHT + DIRECT_LABEL_TO_CARD_GAP;
const CHILDREN_LABEL_Y = SPOUSE_Y + DIRECT_CHILDREN_OFFSET_Y;
const CHILDREN_Y = CHILDREN_LABEL_Y + DIRECT_LABEL_HEIGHT + DIRECT_LABEL_TO_CARD_GAP;
const SIBLINGS_CENTER_X = DIRECT_LEFT_ZONE_CENTER_X;
const SPOUSE_CENTER_X = DIRECT_RIGHT_ZONE_CENTER_X;
const CHILDREN_CENTER_X = DIRECT_RIGHT_ZONE_CENTER_X;
const IRMAOS_LABEL_Y = DIRECT_BELOW_CENTER_START_Y;
const IRMAOS_Y = IRMAOS_LABEL_Y + DIRECT_LABEL_HEIGHT + DIRECT_LABEL_TO_CARD_GAP;
const GRANDCHILDREN_Y = CHILDREN_Y + 112;

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

function nodeCenterX(node: Node) {
  const width = node.data?.directRelation === 'central' ? CENTRAL_WIDTH : NODE_WIDTH;
  return node.position.x + width / 2;
}

function nodeHeight(node: Node) {
  return node.data?.directRelation === 'central' ? CENTRAL_HEIGHT : NODE_HEIGHT;
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
    draggable: false,
    selectable: false,
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
  personNodeById: Map<string, Node>,
  columnGap = COLUMN_GAP,
  rowGap = ROW_GAP
) {
  const visibleIds = ids.filter((id) => !positionedIds.has(id) && personNodeById.has(id));
  if (visibleIds.length === 0) return;

  const rows: string[][] = [];
  for (let index = 0; index < visibleIds.length; index += maxPerRow) {
    rows.push(visibleIds.slice(index, index + maxPerRow));
  }

  rows.forEach((row, rowIndex) => {
    const totalWidth = row.length * NODE_WIDTH + Math.max(0, row.length - 1) * columnGap;
    const startX = centerX - totalWidth / 2;

    row.forEach((id, index) => {
      placePerson(
        id,
        startX + index * (NODE_WIDTH + columnGap),
        y + rowIndex * rowGap,
        variant,
        positionedNodes,
        positionedIds,
        personNodeById
      );
    });
  });
}

function gridRowCount(ids: string[], columns: number) {
  if (ids.length === 0) return 0;
  return Math.ceil(ids.length / columns);
}

function findPositionedNode(nodes: Node[], id: string) {
  return nodes.find((node) => node.id === id);
}

function addLabel(
  nodes: Node[],
  id: string,
  label: string,
  x: number,
  y: number,
  visible: boolean,
  width?: number
) {
  if (!visible) return;
  nodes.push({
    id,
    type: 'directFamilyLabelNode',
    data: { label, width },
    position: finitePosition(x, y),
    draggable: false,
    selectable: false,
  });
}

function getGroupBounds(nodes: Node[], ids: string[]) {
  const groupNodes = ids
    .map((id) => nodes.find((node) => node.id === id))
    .filter((node): node is Node => Boolean(node));

  if (groupNodes.length === 0) return null;

  const minX = Math.min(...groupNodes.map((node) => node.position.x));
  const maxX = Math.max(...groupNodes.map((node) => node.position.x + NODE_WIDTH));
  const minY = Math.min(...groupNodes.map((node) => node.position.y));
  const maxY = Math.max(...groupNodes.map((node) => node.position.y + nodeHeight(node)));

  return {
    centerX: minX + (maxX - minX) / 2,
    minY,
    maxY,
  };
}

function labelWidth(label: string) {
  return Math.min(260, Math.max(118, label.length * 10 + 32));
}

function addGroupLabel(nodes: Node[], id: string, label: string, ids: string[]) {
  const bounds = getGroupBounds(nodes, ids);
  if (!bounds) return;

  const width = labelWidth(label);
  addLabel(
    nodes,
    id,
    label,
    bounds.centerX - width / 2,
    bounds.minY - DIRECT_LABEL_GAP - DIRECT_LABEL_HEIGHT,
    true,
    width
  );
}

function addCenteredLabel(nodes: Node[], id: string, label: string, centerX: number, y: number, visible: boolean) {
  const width = labelWidth(label);
  addLabel(nodes, id, label, centerX - width / 2, y, visible, width);
}

function addAnchor(nodes: Node[], positionedIds: Set<string>, id: string, x: number, y: number) {
  nodes.push({
    id,
    type: 'directFamilyAnchorNode',
    data: {},
    position: finitePosition(x, y),
    draggable: false,
    selectable: false,
  });
  positionedIds.add(id);
}

function createEdgeBuilder(positionedIds: Set<string>) {
  const edgeIds = new Set<string>();
  const edgeSignatures = new Set<string>();
  const edges: Edge[] = [];

  const addEdge = (edge: Edge) => {
    if (!positionedIds.has(edge.source) || !positionedIds.has(edge.target)) return;
    const edgeSignature = `${edge.source}|${edge.target}|${edge.type || 'default'}`;
    if (edgeSignatures.has(edgeSignature)) return;
    if (edgeIds.has(edge.id)) return;
    edgeSignatures.add(edgeSignature);
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
    data?: Edge['data'];
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
      stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
      strokeWidth: options.strokeWidth || DIRECT_FAMILY_TOKENS.EDGE_STROKE_WIDTH,
      opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
    },
    data: { kind: 'directSmooth', ...options.data },
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
    style: {
      stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
      strokeWidth: DIRECT_FAMILY_TOKENS.SPOUSE_EDGE_STROKE_WIDTH,
      opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
    },
    data: { kind: 'directSmooth' },
  });
}

function addVerticalSpouseEdge(addEdge: (edge: Edge) => void, sourceId: string | undefined, spouseId: string | undefined) {
  if (!sourceId || !spouseId || sourceId === spouseId) return;

  addEdge({
    id: `direct-spouse-vertical-${sourceId}-${spouseId}`,
    source: sourceId,
    sourceHandle: 'bottom',
    target: spouseId,
    targetHandle: 'top',
    type: 'spouseEdge',
    style: {
      stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
      strokeWidth: DIRECT_FAMILY_TOKENS.SPOUSE_EDGE_STROKE_WIDTH,
      opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
    },
    data: {
      kind: 'singleParentChild',
      corridorX: CENTER_X + 72,
      corridorY: CENTRAL_BOTTOM_Y + 12,
    },
  });
}

function addGroupEdge(addEdge: (edge: Edge) => void, sourceId: string | undefined, targetId: string | undefined) {
  if (!sourceId || !targetId || sourceId === targetId) return;

  addEdge({
    id: `direct-group-${sourceId}-${targetId}`,
    source: sourceId,
    sourceHandle: 'bottom',
    target: targetId,
    targetHandle: 'top',
    type: 'childEdge',
    style: {
      stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
      strokeWidth: DIRECT_FAMILY_TOKENS.EDGE_STROKE_WIDTH,
      opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
    },
    data: { kind: 'directSmooth' },
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
  const visibleSiblings = onlyVisible(siblings);
  const visibleSpouses = onlyVisible(spouses);
  const visibleChildren = onlyVisible(children);
  const visibleGrandchildren = onlyVisible(grandchildren);
  const positionedNodes: Node[] = [];
  const positionedIds = new Set<string>();

  placeGridCentered(onlyVisible(groups.paternal.greatGreatGrandparents), FATHER_CENTER_X, TATARAVOS_Y, 4, 'greatGreatGrandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(groups.maternal.greatGreatGrandparents), MOTHER_CENTER_X, TATARAVOS_Y, 4, 'greatGreatGrandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(groups.paternal.greatGrandparents), FATHER_CENTER_X, BISAVOS_Y, 4, 'greatGrandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(groups.maternal.greatGrandparents), MOTHER_CENTER_X, BISAVOS_Y, 4, 'greatGrandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(onlyVisible(groups.paternal.grandparents), FATHER_CENTER_X, AVOS_Y, 2, 'grandparent', positionedNodes, positionedIds, personNodeById, 40);
  placeGridCentered(onlyVisible(groups.maternal.grandparents), MOTHER_CENTER_X, AVOS_Y, 2, 'grandparent', positionedNodes, positionedIds, personNodeById, 40);

  placeGridCentered(onlyVisible(groups.paternal.uncles), PATERNAL_OUTER_CENTER_X, TIOS_Y, UNCLES_PER_ROW, 'uncleAunt', positionedNodes, positionedIds, personNodeById, UNCLE_COLUMN_GAP, 102);
  placeGridCentered(onlyVisible(groups.maternal.uncles), MATERNAL_OUTER_CENTER_X, TIOS_Y, UNCLES_PER_ROW, 'uncleAunt', positionedNodes, positionedIds, personNodeById, UNCLE_COLUMN_GAP, 102);
  placeGridCentered(onlyVisible(groups.paternal.cousins), PATERNAL_OUTER_CENTER_X, PRIMOS_Y, COUSINS_PER_ROW, 'cousin', positionedNodes, positionedIds, personNodeById, COUSIN_COLUMN_GAP, 100);
  placeGridCentered(onlyVisible(groups.maternal.cousins), MATERNAL_OUTER_CENTER_X, PRIMOS_Y, COUSINS_PER_ROW, 'cousin', positionedNodes, positionedIds, personNodeById, COUSIN_COLUMN_GAP, 100);

  placePerson(groups.paternal.parentId, nodeXFromCenter(FATHER_CENTER_X), PAIS_Y, 'parent', positionedNodes, positionedIds, personNodeById);
  placePerson(groups.maternal.parentId, nodeXFromCenter(MOTHER_CENTER_X), PAIS_Y, 'parent', positionedNodes, positionedIds, personNodeById);
  placePerson(centralPersonId, CENTRAL_X, CENTRAL_Y, 'central', positionedNodes, positionedIds, personNodeById, true);

  placeGridCentered(visibleSiblings, SIBLINGS_CENTER_X, IRMAOS_Y, DIRECT_SIBLINGS_COLUMNS, 'sibling', positionedNodes, positionedIds, personNodeById, SIBLING_COLUMN_GAP, DIRECT_GROUP_GAP_Y);

  const placedNephewIds = new Set<string>();
  const nephewChildrenBySibling = new Map<string, string[]>();
  const siblingRows = gridRowCount(visibleSiblings, DIRECT_SIBLINGS_COLUMNS);
  const nephewsY = IRMAOS_Y + Math.max(1, siblingRows) * NODE_HEIGHT + Math.max(0, siblingRows - 1) * (DIRECT_GROUP_GAP_Y - NODE_HEIGHT) + 86;
  siblings.forEach((siblingId) => {
    const siblingNode = findPositionedNode(positionedNodes, siblingId);
    if (!siblingNode) return;

    const siblingChildren = onlyVisible(findChildren(siblingId, index, pessoasById))
      .filter((childId) => nephewsAndNieces.includes(childId) && !placedNephewIds.has(childId));
    siblingChildren.forEach((childId) => placedNephewIds.add(childId));
    nephewChildrenBySibling.set(siblingId, siblingChildren);
    placeGridCentered(siblingChildren, nodeCenterX(siblingNode), nephewsY, 1, 'nephewNiece', positionedNodes, positionedIds, personNodeById, 26, DIRECT_GROUP_GAP_Y);
  });

  placeGridCentered(visibleSpouses, SPOUSE_CENTER_X, SPOUSE_Y, 2, 'spouse', positionedNodes, positionedIds, personNodeById, 28, DIRECT_GROUP_GAP_Y);
  placeGridCentered(visibleChildren, CHILDREN_CENTER_X, CHILDREN_Y, 2, 'child', positionedNodes, positionedIds, personNodeById, SIBLING_COLUMN_GAP, DIRECT_GROUP_GAP_Y);
  placeGridCentered(visibleGrandchildren, CHILDREN_CENTER_X, GRANDCHILDREN_Y, 2, 'grandchild', positionedNodes, positionedIds, personNodeById, SIBLING_COLUMN_GAP, DIRECT_GROUP_GAP_Y);

  addGroupLabel(positionedNodes, 'direct-label-tataravos-paternos', 'TATARAVÓS', groups.paternal.greatGreatGrandparents);
  addGroupLabel(positionedNodes, 'direct-label-tataravos-maternos', 'TATARAVÓS', groups.maternal.greatGreatGrandparents);
  addGroupLabel(positionedNodes, 'direct-label-bisavos-paternos', 'BISAVÓS PATERNOS', groups.paternal.greatGrandparents);
  addGroupLabel(positionedNodes, 'direct-label-bisavos-maternos', 'BISAVÓS MATERNOS', groups.maternal.greatGrandparents);
  addGroupLabel(positionedNodes, 'direct-label-avos-paternos', 'AVÓS PATERNOS', groups.paternal.grandparents);
  addGroupLabel(positionedNodes, 'direct-label-avos-maternos', 'AVÓS MATERNOS', groups.maternal.grandparents);
  addGroupLabel(positionedNodes, 'direct-label-pai', 'PAI', groups.paternal.parentId ? [groups.paternal.parentId] : []);
  addGroupLabel(positionedNodes, 'direct-label-mae', 'MÃE', groups.maternal.parentId ? [groups.maternal.parentId] : []);
  addCenteredLabel(positionedNodes, 'direct-label-irmaos', 'IRMÃOS', SIBLINGS_CENTER_X, IRMAOS_LABEL_Y, visibleSiblings.length > 0);
  addCenteredLabel(positionedNodes, 'direct-label-conjuge', 'CÔNJUGE', SPOUSE_CENTER_X, SPOUSE_LABEL_Y, visibleSpouses.length > 0);
  addCenteredLabel(positionedNodes, 'direct-label-filhos', 'FILHOS', CHILDREN_CENTER_X, CHILDREN_LABEL_Y, visibleChildren.length > 0);
  addGroupLabel(positionedNodes, 'direct-label-sobrinhos', 'SOBRINHOS', Array.from(placedNephewIds));
  addGroupLabel(positionedNodes, 'direct-label-tios-paternos', 'TIOS', groups.paternal.uncles);
  addGroupLabel(positionedNodes, 'direct-label-tios-maternos', 'TIOS', groups.maternal.uncles);
  addGroupLabel(positionedNodes, 'direct-label-primos-paternos', 'PRIMOS', groups.paternal.cousins);
  addGroupLabel(positionedNodes, 'direct-label-primos-maternos', 'PRIMOS', groups.maternal.cousins);

  const sideGroupAnchors = {
    paternalGrandparentsAnchor: getGroupBounds(positionedNodes, groups.paternal.grandparents),
    paternalUnclesAnchor: getGroupBounds(positionedNodes, groups.paternal.uncles),
    paternalCousinsAnchor: getGroupBounds(positionedNodes, groups.paternal.cousins),
    maternalGrandparentsAnchor: getGroupBounds(positionedNodes, groups.maternal.grandparents),
    maternalUnclesAnchor: getGroupBounds(positionedNodes, groups.maternal.uncles),
    maternalCousinsAnchor: getGroupBounds(positionedNodes, groups.maternal.cousins),
  };

  if (sideGroupAnchors.paternalGrandparentsAnchor) {
    addAnchor(positionedNodes, positionedIds, 'paternalGrandparentsAnchor', sideGroupAnchors.paternalGrandparentsAnchor.centerX, sideGroupAnchors.paternalGrandparentsAnchor.maxY + GROUP_ANCHOR_GAP);
  }
  if (sideGroupAnchors.paternalUnclesAnchor) {
    addAnchor(positionedNodes, positionedIds, 'paternalUnclesAnchor', sideGroupAnchors.paternalUnclesAnchor.centerX, sideGroupAnchors.paternalUnclesAnchor.minY - GROUP_ANCHOR_GAP);
  }
  if (sideGroupAnchors.paternalCousinsAnchor) {
    addAnchor(positionedNodes, positionedIds, 'paternalCousinsAnchor', sideGroupAnchors.paternalCousinsAnchor.centerX, sideGroupAnchors.paternalCousinsAnchor.minY - GROUP_ANCHOR_GAP);
  }
  if (sideGroupAnchors.maternalGrandparentsAnchor) {
    addAnchor(positionedNodes, positionedIds, 'maternalGrandparentsAnchor', sideGroupAnchors.maternalGrandparentsAnchor.centerX, sideGroupAnchors.maternalGrandparentsAnchor.maxY + GROUP_ANCHOR_GAP);
  }
  if (sideGroupAnchors.maternalUnclesAnchor) {
    addAnchor(positionedNodes, positionedIds, 'maternalUnclesAnchor', sideGroupAnchors.maternalUnclesAnchor.centerX, sideGroupAnchors.maternalUnclesAnchor.minY - GROUP_ANCHOR_GAP);
  }
  if (sideGroupAnchors.maternalCousinsAnchor) {
    addAnchor(positionedNodes, positionedIds, 'maternalCousinsAnchor', sideGroupAnchors.maternalCousinsAnchor.centerX, sideGroupAnchors.maternalCousinsAnchor.minY - GROUP_ANCHOR_GAP);
  }

  const siblingGroupBounds = getGroupBounds(positionedNodes, visibleSiblings);
  if (siblingGroupBounds) {
    addAnchor(
      positionedNodes,
      positionedIds,
      'siblingsAnchor',
      siblingGroupBounds.centerX,
      siblingGroupBounds.minY - 6
    );
  }

  const nephewAnchorBySibling = new Map<string, string>();
  nephewChildrenBySibling.forEach((siblingChildren, siblingId) => {
    const bounds = getGroupBounds(positionedNodes, siblingChildren);
    if (!bounds) return;

    const anchorId = `nephewsAnchor-${siblingId}`;
    nephewAnchorBySibling.set(siblingId, anchorId);
    addAnchor(
      positionedNodes,
      positionedIds,
      anchorId,
      bounds.centerX,
      bounds.minY - GROUP_ANCHOR_GAP
    );
  });

  const childrenGroupBounds = getGroupBounds(positionedNodes, visibleChildren);
  if (childrenGroupBounds) {
    addAnchor(
      positionedNodes,
      positionedIds,
      'childrenAnchor',
      childrenGroupBounds.centerX,
      childrenGroupBounds.minY - 6
    );
  }

  const { addEdge } = createEdgeBuilder(positionedIds);

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

  addGroupEdge(addEdge, 'paternalGrandparentsAnchor', 'paternalUnclesAnchor');
  addGroupEdge(addEdge, 'paternalUnclesAnchor', 'paternalCousinsAnchor');
  addGroupEdge(addEdge, 'maternalGrandparentsAnchor', 'maternalUnclesAnchor');
  addGroupEdge(addEdge, 'maternalUnclesAnchor', 'maternalCousinsAnchor');

  if (visibleSiblings.length > 0) {
    addParentChildEdge(addEdge, centralPersonId, 'siblingsAnchor', {
      idSuffix: '-siblings-anchor',
      strokeWidth: 2,
      data: {
        kind: 'singleParentChild',
        corridorX: SIBLINGS_CENTER_X,
        offset: 12,
      },
    });
  }

  visibleSiblings.forEach((siblingId) => {
    addParentChildEdge(addEdge, 'siblingsAnchor', siblingId, {
      idSuffix: '-sibling',
      strokeWidth: 2,
    });

    const nephewAnchorId = nephewAnchorBySibling.get(siblingId);
    const siblingChildren = nephewChildrenBySibling.get(siblingId) || [];
    if (!nephewAnchorId || siblingChildren.length === 0) return;

    addParentChildEdge(addEdge, siblingId, nephewAnchorId, {
      idSuffix: '-nephews-anchor',
      strokeWidth: 2,
    });

    siblingChildren.forEach((childId) => {
      addParentChildEdge(addEdge, nephewAnchorId, childId, {
        idSuffix: '-nephew',
      });
    });
  });

  visibleSpouses.forEach((spouseId) => {
    addVerticalSpouseEdge(addEdge, centralPersonId, spouseId);
  });

  const childConnectionSourceId = visibleSpouses[0] || centralPersonId;
  if (visibleChildren.length > 0) {
    addParentChildEdge(addEdge, childConnectionSourceId, 'childrenAnchor', {
      idSuffix: '-children-anchor',
      data: {
        kind: 'singleParentChild',
        corridorX: CENTER_X + 72,
        offset: 12,
      },
    });
  }

  visibleChildren.forEach((childId) => {
    addParentChildEdge(addEdge, 'childrenAnchor', childId, { idSuffix: '-child' });
  });

  visibleGrandchildren.forEach((grandchildId) => {
    const parents = findParents(grandchildId, index, pessoasById).filter((parentId) => children.includes(parentId));
    parents.forEach((parentId) => addParentChildEdge(addEdge, parentId, grandchildId, { idSuffix: '-grandchild' }));
  });

  return {
    nodes: positionedNodes,
    edges: [],
  };
}
