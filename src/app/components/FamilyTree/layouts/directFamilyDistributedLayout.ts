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
type DirectSide = 'paternal' | 'maternal';

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

interface GroupSpec {
  key: string;
  label: string;
  ids: string[];
  variant: DirectRelationVariant;
  maxPerRow: number;
  centerX: number;
  side?: DirectSide;
}

const FRAME_LEFT = 50;
const FRAME_RIGHT = 3150;
const FRAME_TOP = 50;
const FRAME_BOTTOM = 1980;
const TITLE_TOP = FRAME_TOP + 100;
const TITLE_WIDTH = 1120;
const TITLE_RESERVED_HEIGHT = 110;
const VIEW_CENTER_X = (FRAME_LEFT + FRAME_RIGHT) / 2;
const VIEW_CENTER_Y = (FRAME_TOP + FRAME_BOTTOM) / 2 + 35;

const CARD_WIDTH = DIRECT_FAMILY_TOKENS.CARD_WIDTH;
const CARD_HEIGHT = DIRECT_FAMILY_TOKENS.CARD_HEIGHT;
const CENTRAL_WIDTH = DIRECT_FAMILY_TOKENS.CENTRAL_WIDTH;
const CENTRAL_HEIGHT = DIRECT_FAMILY_TOKENS.CENTRAL_HEIGHT;

const GROUP_BOX_PADDING_X = 26;
const GROUP_BOX_PADDING_Y = 26;
const LABEL_HEIGHT = 30;
const LABEL_TO_CARD_GAP = 16;
const COLUMN_GAP = 46;
const ROW_GAP = 138;
const SIDE_TOP = TITLE_TOP + TITLE_RESERVED_HEIGHT;
const SIDE_BOTTOM = FRAME_BOTTOM - 50;
const CENTRAL_X = VIEW_CENTER_X - CENTRAL_WIDTH / 2;
const CENTRAL_Y = VIEW_CENTER_Y - CENTRAL_HEIGHT / 2;
const CENTRAL_LEFT_BOUNDARY = CENTRAL_X - 90;
const CENTRAL_RIGHT_BOUNDARY = CENTRAL_X + CENTRAL_WIDTH + 90;
const PATERNAL_CENTER_X = FRAME_LEFT + (CENTRAL_LEFT_BOUNDARY - FRAME_LEFT) / 2;
const MATERNAL_CENTER_X = CENTRAL_RIGHT_BOUNDARY + (FRAME_RIGHT - CENTRAL_RIGHT_BOUNDARY) / 2;
const LOWER_GROUP_Y = CENTRAL_Y + CENTRAL_HEIGHT + 170;
const LOWER_LEFT_CENTER_X = VIEW_CENTER_X - 360;
const LOWER_RIGHT_CENTER_X = VIEW_CENTER_X + 360;

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
  return sortPersonIds((index.parentsByChild.get(personId) || []).map((link) => link.parentId), pessoasById);
}

function findParentByKind(
  personId: string,
  kind: 'pai' | 'mae',
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  const explicit = (index.parentsByChild.get(personId) || []).find((link) => link.kind === kind)?.parentId;
  if (explicit) return explicit;
  return findParents(personId, index, pessoasById)[kind === 'pai' ? 0 : 1];
}

function findChildren(
  personId: string | undefined,
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  if (!personId) return [];
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
  const fatherId = findParentByKind(centralPersonId, 'pai', index, pessoasById) || parents[0];
  const motherId = findParentByKind(centralPersonId, 'mae', index, pessoasById) || parents.find((id) => id !== fatherId);

  const paternalGrandparents = findGrandparents(fatherId, index, pessoasById);
  const maternalGrandparents = findGrandparents(motherId, index, pessoasById);
  const paternalGreatGrandparents = findGreatGrandparents(paternalGrandparents, index, pessoasById);
  const maternalGreatGrandparents = findGreatGrandparents(maternalGrandparents, index, pessoasById);
  const paternalGreatGreatGrandparents = findGreatGrandparents(paternalGreatGrandparents, index, pessoasById);
  const maternalGreatGreatGrandparents = findGreatGrandparents(maternalGreatGrandparents, index, pessoasById);
  const paternalUncles = findUnclesAndAunts(fatherId, motherId, index, pessoasById);
  const maternalUncles = findUnclesAndAunts(motherId, fatherId, index, pessoasById);

  return {
    fatherId,
    motherId,
    paternal: {
      greatGreatGrandparents: paternalGreatGreatGrandparents,
      greatGrandparents: paternalGreatGrandparents,
      grandparents: paternalGrandparents,
      parent: fatherId ? [fatherId] : [],
      uncles: paternalUncles,
      cousins: findCousins(paternalUncles, index, pessoasById),
    },
    maternal: {
      greatGreatGrandparents: maternalGreatGreatGrandparents,
      greatGrandparents: maternalGreatGrandparents,
      grandparents: maternalGrandparents,
      parent: motherId ? [motherId] : [],
      uncles: maternalUncles,
      cousins: findCousins(maternalUncles, index, pessoasById),
    },
  };
}

function finitePosition(x: number, y: number) {
  return {
    x: Number.isFinite(x) ? x : VIEW_CENTER_X,
    y: Number.isFinite(y) ? y : VIEW_CENTER_Y,
  };
}

function labelWidth(label: string, variant: 'group' | 'title' = 'group') {
  if (variant === 'title') return TITLE_WIDTH;
  return Math.min(280, Math.max(130, label.length * 9 + 34));
}

function addLabel(
  nodes: Node[],
  id: string,
  label: string,
  centerX: number,
  y: number,
  variant: 'group' | 'title' = 'group'
) {
  const width = labelWidth(label, variant);
  nodes.push({
    id,
    type: 'directFamilyLabelNode',
    data: { label, width, variant },
    position: finitePosition(centerX - width / 2, y),
    draggable: false,
    selectable: false,
  });
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

function addGroupBox(nodes: Node[], id: string, x: number, y: number, width: number, height: number) {
  nodes.unshift({
    id: `direct-group-box-${id}`,
    type: 'directFamilyGroupBoxNode',
    data: { width, height },
    position: finitePosition(x, y),
    draggable: false,
    selectable: false,
    zIndex: -10,
  });
}

function groupGridMetrics(ids: string[], maxPerRow: number) {
  const rows = Math.max(1, Math.ceil(ids.length / maxPerRow));
  const largestRow = Math.min(maxPerRow, Math.max(1, ids.length));
  return {
    rows,
    largestRow,
    cardsHeight: rows * CARD_HEIGHT + Math.max(0, rows - 1) * ROW_GAP,
    cardsWidth: largestRow * CARD_WIDTH + Math.max(0, largestRow - 1) * COLUMN_GAP,
  };
}

function groupHeight(ids: string[], maxPerRow: number) {
  const metrics = groupGridMetrics(ids, maxPerRow);
  return GROUP_BOX_PADDING_Y * 2 + LABEL_HEIGHT + LABEL_TO_CARD_GAP + metrics.cardsHeight;
}

function placeGroup(
  spec: GroupSpec,
  topY: number,
  positionedNodes: Node[],
  positionedIds: Set<string>,
  personNodeById: Map<string, Node>
) {
  const visibleIds = spec.ids.filter((id) => !positionedIds.has(id) && personNodeById.has(id));
  if (visibleIds.length === 0) return [];

  const metrics = groupGridMetrics(visibleIds, spec.maxPerRow);
  const groupWidth = Math.max(metrics.cardsWidth, labelWidth(spec.label)) + GROUP_BOX_PADDING_X * 2;
  const groupX = spec.centerX - groupWidth / 2;
  const labelY = topY + GROUP_BOX_PADDING_Y;
  const firstCardY = labelY + LABEL_HEIGHT + LABEL_TO_CARD_GAP;
  const placedIds: string[] = [];

  addLabel(positionedNodes, `direct-label-${spec.key}`, spec.label, spec.centerX, labelY);

  for (let rowIndex = 0; rowIndex < metrics.rows; rowIndex += 1) {
    const rowIds = visibleIds.slice(rowIndex * spec.maxPerRow, rowIndex * spec.maxPerRow + spec.maxPerRow);
    const rowWidth = rowIds.length * CARD_WIDTH + Math.max(0, rowIds.length - 1) * COLUMN_GAP;
    const startX = spec.centerX - rowWidth / 2;

    rowIds.forEach((id, index) => {
      const node = personNodeById.get(id);
      if (!node) return;

      positionedNodes.push(clonePersonNode(
        node,
        startX + index * (CARD_WIDTH + COLUMN_GAP),
        firstCardY + rowIndex * ROW_GAP,
        spec.variant
      ));
      positionedIds.add(id);
      placedIds.push(id);
    });
  }

  addGroupBox(positionedNodes, spec.key, groupX, topY, groupWidth, groupHeight(visibleIds, spec.maxPerRow));

  return placedIds;
}

function placeGroupStack(
  groups: GroupSpec[],
  positionedNodes: Node[],
  positionedIds: Set<string>,
  personNodeById: Map<string, Node>
) {
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      ids: group.ids.filter((id) => !positionedIds.has(id) && personNodeById.has(id)),
    }))
    .filter((group) => group.ids.length > 0);

  if (visibleGroups.length === 0) return [];

  const heights = visibleGroups.map((group) => groupHeight(group.ids, group.maxPerRow));
  const availableHeight = SIDE_BOTTOM - SIDE_TOP;
  const totalHeight = heights.reduce((sum, height) => sum + height, 0);
  const uniformGap = Math.max(64, (availableHeight - totalHeight) / (visibleGroups.length + 1));
  let cursorY = SIDE_TOP + uniformGap;
  const placedIds: string[] = [];

  visibleGroups.forEach((group, index) => {
    placedIds.push(...placeGroup(group, cursorY, positionedNodes, positionedIds, personNodeById));
    cursorY += heights[index] + uniformGap;
  });

  return placedIds;
}

function addCentralPerson(
  centralPersonId: string,
  positionedNodes: Node[],
  positionedIds: Set<string>,
  personNodeById: Map<string, Node>
) {
  const node = personNodeById.get(centralPersonId);
  if (!node) return;

  positionedNodes.push(clonePersonNode(node, CENTRAL_X, CENTRAL_Y, 'central', true));
  positionedIds.add(centralPersonId);
}

function makeEdge(
  source: string,
  target: string,
  suffix: string,
  kind: 'child' | 'spouse' | 'sibling' = 'child'
): Edge {
  return {
    id: `direct-distributed-${kind}-${source}-${target}-${suffix}`,
    source,
    target,
    sourceHandle: kind === 'spouse' ? 'spouse-right' : 'bottom',
    targetHandle: kind === 'spouse' ? 'spouse-left' : 'top',
    type: kind === 'spouse' ? 'spouseEdge' : 'childEdge',
    selectable: false,
    style: {
      stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
      strokeWidth: kind === 'spouse'
        ? DIRECT_FAMILY_TOKENS.SPOUSE_EDGE_STROKE_WIDTH
        : DIRECT_FAMILY_TOKENS.EDGE_STROKE_WIDTH,
      opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
      strokeDasharray: kind === 'sibling' ? '5,5' : undefined,
    },
    data: { kind: 'directSmooth' },
  };
}

function buildEdges(relacionamentos: Relacionamento[], positionedIds: Set<string>) {
  const edges: Edge[] = [];
  const signatures = new Set<string>();

  const addEdge = (edge: Edge) => {
    if (!positionedIds.has(edge.source) || !positionedIds.has(edge.target)) return;
    const signature = [edge.source, edge.target, edge.type, edge.sourceHandle, edge.targetHandle].join('|');
    if (signatures.has(signature)) return;
    signatures.add(signature);
    edges.push(edge);
  };

  relacionamentos.forEach((rel, index) => {
    if (rel.tipo_relacionamento === 'conjuge') {
      addEdge(makeEdge(rel.pessoa_origem_id, rel.pessoa_destino_id, String(index), 'spouse'));
      return;
    }

    if (rel.tipo_relacionamento === 'irmao') {
      addEdge(makeEdge(rel.pessoa_origem_id, rel.pessoa_destino_id, String(index), 'sibling'));
      return;
    }

    if (rel.tipo_relacionamento === 'filho') {
      addEdge(makeEdge(rel.pessoa_origem_id, rel.pessoa_destino_id, String(index), 'child'));
      return;
    }

    if (rel.tipo_relacionamento === 'pai' || rel.tipo_relacionamento === 'mae') {
      addEdge(makeEdge(rel.pessoa_destino_id, rel.pessoa_origem_id, String(index), 'child'));
    }
  });

  return edges;
}

function addTitle(nodes: Node[], centralPersonName: string) {
  const firstName = centralPersonName.trim().split(/\s+/)[0] || centralPersonName;
  addLabel(nodes, 'direct-title', `Linha Genealógica de ${firstName}`, VIEW_CENTER_X, TITLE_TOP, 'title');
}

export function directFamilyDistributedLayout(
  graph: TreeLayoutParams,
  options: DirectFamilyLayoutOptions = {}
): TreeLayoutResult {
  const filters = options.filters || DEFAULT_DIRECT_RELATIVE_FILTERS;
  const personNodeById = new Map(graph.personNodes.map((node) => [node.id, node]));
  const pessoasById = new Map(graph.pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const index = buildRelationshipIndex(graph.relacionamentos);
  const centralPersonId = options.centralPersonId || graph.pessoas[0]?.id;

  if (!centralPersonId || !personNodeById.has(centralPersonId)) {
    return { nodes: [], edges: [] };
  }

  const centralPerson = pessoasById.get(centralPersonId);
  const sides = groupByPaternalMaternalSide(centralPersonId, index, pessoasById);
  const positionedNodes: Node[] = [];
  const positionedIds = new Set<string>();

  addTitle(positionedNodes, centralPerson?.nome_completo || '');
  addCentralPerson(centralPersonId, positionedNodes, positionedIds, personNodeById);

  const paternalGroups: GroupSpec[] = [
    { key: 'tataravos-paternos', label: 'Tataravós paternos', ids: filters.tataravos ? sides.paternal.greatGreatGrandparents : [], variant: 'greatGreatGrandparent', maxPerRow: 3, centerX: PATERNAL_CENTER_X, side: 'paternal' },
    { key: 'bisavos-paternos', label: 'Bisavós paternos', ids: filters.bisavos ? sides.paternal.greatGrandparents : [], variant: 'greatGrandparent', maxPerRow: 3, centerX: PATERNAL_CENTER_X, side: 'paternal' },
    { key: 'avos-paternos', label: 'Avós paternos', ids: filters.avos ? sides.paternal.grandparents : [], variant: 'grandparent', maxPerRow: 2, centerX: PATERNAL_CENTER_X, side: 'paternal' },
    { key: 'pai', label: 'Pai', ids: filters.pais ? sides.paternal.parent : [], variant: 'parent', maxPerRow: 1, centerX: PATERNAL_CENTER_X, side: 'paternal' },
    { key: 'tios-paternos', label: 'Tios paternos', ids: filters.tios ? sides.paternal.uncles : [], variant: 'uncleAunt', maxPerRow: 3, centerX: PATERNAL_CENTER_X, side: 'paternal' },
    { key: 'primos-paternos', label: 'Primos paternos', ids: filters.primos ? sides.paternal.cousins : [], variant: 'cousin', maxPerRow: 3, centerX: PATERNAL_CENTER_X, side: 'paternal' },
  ];

  const maternalGroups: GroupSpec[] = [
    { key: 'tataravos-maternos', label: 'Tataravós maternos', ids: filters.tataravos ? sides.maternal.greatGreatGrandparents : [], variant: 'greatGreatGrandparent', maxPerRow: 3, centerX: MATERNAL_CENTER_X, side: 'maternal' },
    { key: 'bisavos-maternos', label: 'Bisavós maternos', ids: filters.bisavos ? sides.maternal.greatGrandparents : [], variant: 'greatGrandparent', maxPerRow: 3, centerX: MATERNAL_CENTER_X, side: 'maternal' },
    { key: 'avos-maternos', label: 'Avós maternos', ids: filters.avos ? sides.maternal.grandparents : [], variant: 'grandparent', maxPerRow: 2, centerX: MATERNAL_CENTER_X, side: 'maternal' },
    { key: 'mae', label: 'Mãe', ids: filters.pais ? sides.maternal.parent : [], variant: 'parent', maxPerRow: 1, centerX: MATERNAL_CENTER_X, side: 'maternal' },
    { key: 'tios-maternos', label: 'Tios maternos', ids: filters.tios ? sides.maternal.uncles : [], variant: 'uncleAunt', maxPerRow: 3, centerX: MATERNAL_CENTER_X, side: 'maternal' },
    { key: 'primos-maternos', label: 'Primos maternos', ids: filters.primos ? sides.maternal.cousins : [], variant: 'cousin', maxPerRow: 3, centerX: MATERNAL_CENTER_X, side: 'maternal' },
  ];

  placeGroupStack(paternalGroups, positionedNodes, positionedIds, personNodeById);
  placeGroupStack(maternalGroups, positionedNodes, positionedIds, personNodeById);

  const siblings = filters.irmaos ? findSiblings(centralPersonId, index, pessoasById) : [];
  const spouses = filters.conjuge ? sortPersonIds(Array.from(index.spousesByPerson.get(centralPersonId) || []), pessoasById) : [];
  const children = filters.filhos ? findChildren(centralPersonId, index, pessoasById) : [];
  const grandchildren = filters.netos ? sortPersonIds(children.flatMap((id) => findChildren(id, index, pessoasById)), pessoasById) : [];
  const nephews = filters.sobrinhos ? sortPersonIds(siblings.flatMap((id) => findChildren(id, index, pessoasById)), pessoasById) : [];

  placeGroup({ key: 'irmaos', label: 'Irmãos', ids: siblings, variant: 'sibling', maxPerRow: 2, centerX: LOWER_LEFT_CENTER_X }, LOWER_GROUP_Y, positionedNodes, positionedIds, personNodeById);
  placeGroup({ key: 'sobrinhos', label: 'Sobrinhos', ids: nephews, variant: 'nephewNiece', maxPerRow: 2, centerX: LOWER_LEFT_CENTER_X }, LOWER_GROUP_Y + 360, positionedNodes, positionedIds, personNodeById);
  placeGroup({ key: 'conjuge', label: 'Cônjuge', ids: spouses, variant: 'spouse', maxPerRow: 1, centerX: LOWER_RIGHT_CENTER_X }, LOWER_GROUP_Y, positionedNodes, positionedIds, personNodeById);
  placeGroup({ key: 'filhos', label: 'Filhos', ids: children, variant: 'child', maxPerRow: 2, centerX: LOWER_RIGHT_CENTER_X }, LOWER_GROUP_Y + 320, positionedNodes, positionedIds, personNodeById);
  placeGroup({ key: 'netos', label: 'Netos', ids: grandchildren, variant: 'grandchild', maxPerRow: 2, centerX: LOWER_RIGHT_CENTER_X }, LOWER_GROUP_Y + 700, positionedNodes, positionedIds, personNodeById);

  return {
    nodes: positionedNodes,
    edges: buildEdges(graph.relacionamentos, positionedIds),
  };
}
