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

export const DIRECT_FRAME_LEFT = 120;
export const DIRECT_FRAME_RIGHT = 3080;
export const DIRECT_FRAME_TOP = 20;
export const DIRECT_FRAME_BOTTOM = 1760;
export const DIRECT_MIDLINE_X = (DIRECT_FRAME_LEFT + DIRECT_FRAME_RIGHT) / 2;
export const DIRECT_CENTER_X = DIRECT_MIDLINE_X;
export const DIRECT_PRESERVED_CENTER_BOTTOM_Y = 846;
export const DIRECT_CARD_WIDTH = DIRECT_FAMILY_TOKENS.CARD_WIDTH;
export const DIRECT_CARD_HEIGHT = DIRECT_FAMILY_TOKENS.CARD_HEIGHT;
export const DIRECT_CENTER_CARD_WIDTH = DIRECT_FAMILY_TOKENS.CENTRAL_WIDTH;
export const DIRECT_CENTER_CARD_HEIGHT = DIRECT_FAMILY_TOKENS.CENTRAL_HEIGHT;
export const DIRECT_GROUP_GAP_X = 60;
export const DIRECT_GROUP_GAP_Y = 148;
export const DIRECT_LABEL_GAP = 28;
export const DIRECT_LABEL_GAP_Y = DIRECT_LABEL_GAP;
export const DIRECT_GROUP_VERTICAL_GAP = 220;
export const GROUP_BOX_PADDING_X = 28;
export const GROUP_BOX_PADDING_Y = 32;
export const DIRECT_GROUP_BOX_PADDING_Y = GROUP_BOX_PADDING_Y;
export const DIRECT_GROUP_BOX_MARGIN_Y = 36;
export const LABEL_TO_CARDS_GAP = 16;
export const DIRECT_LABEL_TO_CARDS_GAP = LABEL_TO_CARDS_GAP;
export const CARD_ROW_GAP = 148;
export const DIRECT_ANCESTOR_GROUP_GAP_Y = 220;
export const DIRECT_UNCLES_TO_COUSINS_GAP_Y = 400;
export const CENTER_TO_LOWER_GROUP_GAP_Y = 150;
export const DIRECT_BORDER_COLOR = '#475569';
export const DIRECT_BORDER_OPACITY = 0.58;
export const DIRECT_EDGE_STROKE_WIDTH = 1.6;
const DIRECT_STRUCTURAL_EDGE_STYLE = {
  stroke: DIRECT_BORDER_COLOR,
  strokeWidth: DIRECT_EDGE_STROKE_WIDTH,
  opacity: DIRECT_BORDER_OPACITY,
};

const CENTER_X = DIRECT_CENTER_X;
const NODE_WIDTH = DIRECT_CARD_WIDTH;
const NODE_HEIGHT = DIRECT_CARD_HEIGHT;
const CENTRAL_WIDTH = DIRECT_CENTER_CARD_WIDTH;
const CENTRAL_HEIGHT = DIRECT_CENTER_CARD_HEIGHT;
export const DIRECT_CENTER_Y = DIRECT_PRESERVED_CENTER_BOTTOM_Y - CENTRAL_HEIGHT / 2;
const CENTER_Y = DIRECT_CENTER_Y;
const ROW_GAP = CARD_ROW_GAP;
const COLUMN_GAP = 46;
const SIBLING_COLUMN_GAP = DIRECT_GROUP_GAP_X;
const UNCLE_COLUMN_GAP = 46;
const COUSIN_COLUMN_GAP = 38;
const UNCLES_PER_ROW = 3;
const COUSINS_PER_ROW = 4;
export const DIRECT_SIBLINGS_COLUMNS = 2;
const DIRECT_LABEL_HEIGHT = 30;
const DIRECT_LABEL_TO_CARD_GAP = LABEL_TO_CARDS_GAP;
const ANCESTOR_SPOUSE_EDGE_STROKE = DIRECT_BORDER_COLOR;
const ANCESTOR_SPOUSE_EDGE_STROKE_WIDTH = 1.4;
const ANCESTOR_SPOUSE_EDGE_OPACITY = DIRECT_BORDER_OPACITY;

const CENTRAL_X = CENTER_X - CENTRAL_WIDTH / 2;
const CENTRAL_Y = CENTER_Y - CENTRAL_HEIGHT / 2;
export const DIRECT_MAIN_AXIS_X = CENTRAL_X + CENTRAL_WIDTH / 2;
export const DIRECT_PATERNAL_COLUMN_X = DIRECT_FRAME_LEFT + 490;
export const DIRECT_CENTER_COLUMN_X = DIRECT_MIDLINE_X;
export const DIRECT_MATERNAL_COLUMN_X = DIRECT_FRAME_RIGHT - 490;
export const DIRECT_TOP_ALIGNMENT_Y = CENTRAL_Y;
export const DIRECT_TITLE_Y = DIRECT_FRAME_TOP + 44;
export const DIRECT_TOP_GROUP_CARD_Y = DIRECT_TITLE_Y + 90;
export const DIRECT_SIDE_GROUP_STEP_Y = 260;
export const DIRECT_ALIGNED_GROUP_ROW_Y =
  DIRECT_TOP_ALIGNMENT_Y + DIRECT_GROUP_BOX_PADDING_Y + DIRECT_LABEL_GAP + DIRECT_LABEL_HEIGHT;
export const DIRECT_PARENT_ROW_UP_OFFSET_Y = 70;
export const DIRECT_UNCLES_ROW_DOWN_OFFSET_Y = 160;
export const DIRECT_ROW_TATARAVOS_PATERNOS_Y = DIRECT_TOP_GROUP_CARD_Y;
export const DIRECT_ROW_BISAVOS_PATERNOS_Y = DIRECT_ROW_TATARAVOS_PATERNOS_Y + DIRECT_SIDE_GROUP_STEP_Y;
export const DIRECT_ROW_AVOS_PATERNOS_Y = DIRECT_ROW_BISAVOS_PATERNOS_Y + DIRECT_SIDE_GROUP_STEP_Y;
export const DIRECT_ROW_TATARAVOS_MATERNOS_Y = DIRECT_TOP_GROUP_CARD_Y;
export const DIRECT_ROW_BISAVOS_MATERNOS_Y = DIRECT_ROW_TATARAVOS_MATERNOS_Y + DIRECT_SIDE_GROUP_STEP_Y;
export const DIRECT_ROW_AVOS_MATERNOS_Y = DIRECT_ROW_BISAVOS_MATERNOS_Y + DIRECT_SIDE_GROUP_STEP_Y;
export const DIRECT_ROW_PAIS_Y =
  Math.max(DIRECT_ROW_AVOS_PATERNOS_Y, DIRECT_ROW_AVOS_MATERNOS_Y) +
  DIRECT_GROUP_VERTICAL_GAP -
  DIRECT_PARENT_ROW_UP_OFFSET_Y;
export const DIRECT_ROW_TIOS_Y = DIRECT_ROW_PAIS_Y + DIRECT_GROUP_VERTICAL_GAP + DIRECT_UNCLES_ROW_DOWN_OFFSET_Y;
export const DIRECT_ROW_PRIMOS_Y = DIRECT_ROW_TIOS_Y + DIRECT_UNCLES_TO_COUSINS_GAP_Y;
export const DIRECT_ROW_SIBLINGS_Y = CENTRAL_Y + CENTRAL_HEIGHT + CENTER_TO_LOWER_GROUP_GAP_Y;
export const DIRECT_ROW_SPOUSE_Y = DIRECT_ROW_SIBLINGS_Y;
export const DIRECT_ROW_CHILDREN_Y = DIRECT_ROW_SPOUSE_Y + NODE_HEIGHT + 130;
export const DIRECT_ROW_NEPHEWS_Y = DIRECT_ROW_SIBLINGS_Y + NODE_HEIGHT + 164;

const FATHER_CENTER_X = DIRECT_PATERNAL_COLUMN_X;
const MOTHER_CENTER_X = DIRECT_MATERNAL_COLUMN_X;
const PATERNAL_OUTER_CENTER_X = DIRECT_PATERNAL_COLUMN_X;
const MATERNAL_OUTER_CENTER_X = DIRECT_MATERNAL_COLUMN_X;

const TATARAVOS_PATERNOS_Y = DIRECT_ROW_TATARAVOS_PATERNOS_Y;
const BISAVOS_PATERNOS_Y = DIRECT_ROW_BISAVOS_PATERNOS_Y;
const AVOS_PATERNOS_Y = DIRECT_ROW_AVOS_PATERNOS_Y;
const TATARAVOS_MATERNOS_Y = DIRECT_ROW_TATARAVOS_MATERNOS_Y;
const BISAVOS_MATERNOS_Y = DIRECT_ROW_BISAVOS_MATERNOS_Y;
const AVOS_MATERNOS_Y = DIRECT_ROW_AVOS_MATERNOS_Y;
const PAIS_Y = DIRECT_ROW_PAIS_Y;
const TIOS_Y = DIRECT_ROW_TIOS_Y;
const PRIMOS_Y = DIRECT_ROW_PRIMOS_Y;
const CENTRAL_BOTTOM_Y = CENTRAL_Y + CENTRAL_HEIGHT;
export const DIRECT_BELOW_CENTER_START_Y = DIRECT_ROW_SIBLINGS_Y - DIRECT_LABEL_HEIGHT - DIRECT_LABEL_TO_CARD_GAP;
export const DIRECT_LEFT_ZONE_CENTER_X = DIRECT_CENTER_COLUMN_X - 340;
export const DIRECT_RIGHT_ZONE_CENTER_X = DIRECT_CENTER_COLUMN_X + 260;
export const DIRECT_SPOUSE_OFFSET_Y = 0;
export const DIRECT_CHILDREN_OFFSET_Y = DIRECT_ROW_CHILDREN_Y - DIRECT_ROW_SPOUSE_Y;

const SPOUSE_LABEL_Y = DIRECT_BELOW_CENTER_START_Y + DIRECT_SPOUSE_OFFSET_Y;
const SPOUSE_Y = SPOUSE_LABEL_Y + DIRECT_LABEL_HEIGHT + DIRECT_LABEL_TO_CARD_GAP;
const CHILDREN_LABEL_Y = DIRECT_ROW_CHILDREN_Y - DIRECT_LABEL_HEIGHT - DIRECT_LABEL_TO_CARD_GAP;
const CHILDREN_Y = CHILDREN_LABEL_Y + DIRECT_LABEL_HEIGHT + DIRECT_LABEL_TO_CARD_GAP;
const SIBLINGS_CENTER_X = DIRECT_LEFT_ZONE_CENTER_X;
const SPOUSE_CENTER_X = DIRECT_RIGHT_ZONE_CENTER_X;
const CHILDREN_CENTER_X = DIRECT_RIGHT_ZONE_CENTER_X;
const IRMAOS_LABEL_Y = DIRECT_BELOW_CENTER_START_Y;
const IRMAOS_Y = IRMAOS_LABEL_Y + DIRECT_LABEL_HEIGHT + DIRECT_LABEL_TO_CARD_GAP;
const GRANDCHILDREN_Y = CHILDREN_Y + 112;

function buildSideRows(groups: Array<{ key: string; visible: boolean }>) {
  const rows: Record<string, number> = {};
  let rowIndex = 0;

  groups.forEach((group) => {
    if (!group.visible) return;
    rows[group.key] = DIRECT_TOP_GROUP_CARD_Y + rowIndex * DIRECT_SIDE_GROUP_STEP_Y;
    rowIndex += 1;
  });

  return rows;
}

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

function sortAncestorCouples(
  ids: string[],
  index: RelationshipIndex,
  pessoasById: Map<string, TreeLayoutParams['pessoas'][number]>
) {
  const groupIds = new Set(ids);
  const usedIds = new Set<string>();
  const units: { ids: string[]; sortValue: number; name: string }[] = [];

  ids.forEach((personId) => {
    if (usedIds.has(personId)) return;

    const spouseId = Array.from(index.spousesByPerson.get(personId) || [])
      .find((candidateId) => groupIds.has(candidateId) && !usedIds.has(candidateId));

    if (spouseId) {
      const pairIds = sortPersonIds([personId, spouseId], pessoasById);
      pairIds.forEach((id) => usedIds.add(id));
      units.push({
        ids: pairIds,
        sortValue: Math.min(...pairIds.map((id) => getSortableBirthValue(pessoasById.get(id)?.data_nascimento))),
        name: pairIds.map((id) => pessoasById.get(id)?.nome_completo || '').join(' '),
      });
      return;
    }

    usedIds.add(personId);
    units.push({
      ids: [personId],
      sortValue: getSortableBirthValue(pessoasById.get(personId)?.data_nascimento),
      name: pessoasById.get(personId)?.nome_completo || '',
    });
  });

  return units
    .sort((a, b) => {
      if (a.sortValue !== b.sortValue) return a.sortValue - b.sortValue;
      return a.name.localeCompare(b.name);
    })
    .flatMap((unit) => unit.ids);
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
  const width = getNodeWidth(node);
  return node.position.x + width / 2;
}

function getNodeWidth(node: Node) {
  if (node.type === 'directFamilyLabelNode') return Number(node.data?.width) || labelWidth(String(node.data?.label || ''));
  if (node.type === 'directFamilyGroupBoxNode') return Number(node.data?.width) || 0;
  return node.data?.directRelation === 'central' ? CENTRAL_WIDTH : NODE_WIDTH;
}

function nodeHeight(node: Node) {
  if (node.type === 'directFamilyLabelNode') return DIRECT_LABEL_HEIGHT;
  if (node.type === 'directFamilyGroupBoxNode') return Number(node.data?.height) || 0;
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
  width?: number,
  variant: 'group' | 'title' = 'group'
) {
  if (!visible) return;
  nodes.push({
    id,
    type: 'directFamilyLabelNode',
    data: { label, width, variant },
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
  const maxX = Math.max(...groupNodes.map((node) => node.position.x + getNodeWidth(node)));
  const minY = Math.min(...groupNodes.map((node) => node.position.y));
  const maxY = Math.max(...groupNodes.map((node) => node.position.y + nodeHeight(node)));

  return {
    minX,
    maxX,
    centerX: minX + (maxX - minX) / 2,
    minY,
    maxY,
  };
}

function addGroupBox(nodes: Node[], id: string, memberIds: string[], labelId: string) {
  const bounds = getGroupBounds(nodes, [labelId, ...memberIds]);
  if (!bounds) return;

  const width = bounds.maxX - bounds.minX + GROUP_BOX_PADDING_X * 2;
  const height = bounds.maxY - bounds.minY + GROUP_BOX_PADDING_Y * 2;

  nodes.unshift({
    id: `direct-group-box-${id}`,
    type: 'directFamilyGroupBoxNode',
    data: { width, height },
    position: finitePosition(bounds.minX - GROUP_BOX_PADDING_X, bounds.minY - GROUP_BOX_PADDING_Y),
    draggable: false,
    selectable: false,
    zIndex: -10,
  });
}

function getGroupBoxBounds(nodes: Node[], memberIds: string[], labelId: string) {
  const bounds = getGroupBounds(nodes, [labelId, ...memberIds]);
  if (!bounds) return null;

  return {
    minX: bounds.minX - GROUP_BOX_PADDING_X,
    maxX: bounds.maxX + GROUP_BOX_PADDING_X,
    minY: bounds.minY - GROUP_BOX_PADDING_Y,
    maxY: bounds.maxY + GROUP_BOX_PADDING_Y,
    centerX: bounds.centerX,
    centerY: bounds.minY + (bounds.maxY - bounds.minY) / 2,
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

function addTitle(nodes: Node[], centralPersonName: string) {
  const firstName = centralPersonName.trim().split(/\s+/)[0] || centralPersonName;
  const label = `Linha Genealógica de ${firstName}`;
  const width = 760;
  addLabel(nodes, 'direct-title', label, CENTER_X - width / 2, DIRECT_TITLE_Y, true, width, 'title');
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
    selectable: false,
    style: {
      stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
      strokeWidth: DIRECT_FAMILY_TOKENS.SPOUSE_EDGE_STROKE_WIDTH,
      opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
    },
    data: { kind: 'directSmooth' },
  });
}

function addAncestorSpouseEdge(addEdge: (edge: Edge) => void, leftId: string | undefined, rightId: string | undefined) {
  if (!leftId || !rightId || leftId === rightId) return;

  addEdge({
    id: `direct-ancestor-spouse-${[leftId, rightId].sort().join('-')}`,
    source: leftId,
    sourceHandle: 'spouse-right',
    target: rightId,
    targetHandle: 'spouse-left',
    type: 'spouseEdge',
    style: {
      stroke: ANCESTOR_SPOUSE_EDGE_STROKE,
      strokeWidth: ANCESTOR_SPOUSE_EDGE_STROKE_WIDTH,
      opacity: ANCESTOR_SPOUSE_EDGE_OPACITY,
    },
    data: { kind: 'directSmooth' },
  });
}

function addAncestorSpouseEdges(
  addEdge: (edge: Edge) => void,
  ids: string[],
  positionedNodes: Node[],
  index: RelationshipIndex
) {
  const groupIds = new Set(ids);
  const addedPairs = new Set<string>();

  ids.forEach((personId) => {
    Array.from(index.spousesByPerson.get(personId) || [])
      .filter((spouseId) => groupIds.has(spouseId))
      .forEach((spouseId) => {
        const pairKey = [personId, spouseId].sort().join('|');
        if (addedPairs.has(pairKey)) return;
        addedPairs.add(pairKey);

        const personNode = findPositionedNode(positionedNodes, personId);
        const spouseNode = findPositionedNode(positionedNodes, spouseId);
        if (!personNode || !spouseNode) return;
        if (Math.abs(personNode.position.y - spouseNode.position.y) > 2) return;

        const leftId = personNode.position.x <= spouseNode.position.x ? personId : spouseId;
        const rightId = leftId === personId ? spouseId : personId;
        addAncestorSpouseEdge(addEdge, leftId, rightId);
      });
  });
}

function addDirectStructuralEdge(
  addEdge: (edge: Edge) => void,
  id: string,
  source: string,
  target: string,
  kind: 'directHorizontal' | 'directElbowFromCenter' | 'directSideElbow',
  options: {
    sourceHandle?: string;
    targetHandle?: string;
    elbowY?: number;
    elbowX?: number;
  } = {}
) {
  addEdge({
    id,
    source,
    sourceHandle: options.sourceHandle || 'right',
    target,
    targetHandle: options.targetHandle || 'left',
    type: 'childEdge',
    selectable: false,
    style: DIRECT_STRUCTURAL_EDGE_STYLE,
    data: {
      kind,
      elbowY: options.elbowY,
      elbowX: options.elbowX,
    },
  });
}

function addGroupBoundaryAnchors(
  nodes: Node[],
  positionedIds: Set<string>,
  id: string,
  bounds: NonNullable<ReturnType<typeof getGroupBoxBounds>>
) {
  addAnchor(nodes, positionedIds, `${id}-top-anchor`, bounds.centerX, bounds.minY);
  addAnchor(nodes, positionedIds, `${id}-bottom-anchor`, bounds.centerX, bounds.maxY);
}

function addGroupBoxConnection(
  addEdge: (edge: Edge) => void,
  sourceGroupId: string,
  targetGroupId: string
) {
  addDirectStructuralEdge(
    addEdge,
    `direct-group-${sourceGroupId}-to-${targetGroupId}`,
    `${sourceGroupId}-bottom-anchor`,
    `${targetGroupId}-top-anchor`,
    'directHorizontal',
    {
      sourceHandle: 'bottom',
      targetHandle: 'top',
    }
  );
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
  addVisible(filters.sobrinhos, nephewsAndNieces);
  addVisible(filters.tios, [...groups.paternal.uncles, ...groups.maternal.uncles]);
  addVisible(filters.primos, [...groups.paternal.cousins, ...groups.maternal.cousins]);
  addVisible(filters.conjuge, spouses);
  addVisible(filters.filhos, children);
  addVisible(filters.netos, grandchildren);

  const onlyVisible = (ids: string[]) =>
    sortPersonIds(ids.filter((id) => id !== centralPersonId && visiblePeople.has(id)), pessoasById);
  const visibleSiblings = onlyVisible(siblings);
  const visibleNephewsAndNieces = onlyVisible(nephewsAndNieces);
  const visibleSpouses = onlyVisible(spouses);
  const visibleChildren = onlyVisible(children);
  const visibleGrandchildren = onlyVisible(grandchildren);
  const visiblePaternalGreatGreatGrandparents = sortAncestorCouples(onlyVisible(groups.paternal.greatGreatGrandparents), index, pessoasById);
  const visibleMaternalGreatGreatGrandparents = sortAncestorCouples(onlyVisible(groups.maternal.greatGreatGrandparents), index, pessoasById);
  const visiblePaternalGreatGrandparents = sortAncestorCouples(onlyVisible(groups.paternal.greatGrandparents), index, pessoasById);
  const visibleMaternalGreatGrandparents = sortAncestorCouples(onlyVisible(groups.maternal.greatGrandparents), index, pessoasById);
  const visiblePaternalGrandparents = sortAncestorCouples(onlyVisible(groups.paternal.grandparents), index, pessoasById);
  const visibleMaternalGrandparents = sortAncestorCouples(onlyVisible(groups.maternal.grandparents), index, pessoasById);
  const visiblePaternalUncles = onlyVisible(groups.paternal.uncles);
  const visibleMaternalUncles = onlyVisible(groups.maternal.uncles);
  const visiblePaternalCousins = onlyVisible(groups.paternal.cousins);
  const visibleMaternalCousins = onlyVisible(groups.maternal.cousins);
  const paternalRows = buildSideRows([
    { key: 'tataravos', visible: visiblePaternalGreatGreatGrandparents.length > 0 },
    { key: 'bisavos', visible: visiblePaternalGreatGrandparents.length > 0 },
    { key: 'avos', visible: visiblePaternalGrandparents.length > 0 },
    { key: 'pai', visible: Boolean(groups.paternal.parentId && visiblePeople.has(groups.paternal.parentId)) },
    { key: 'tios', visible: visiblePaternalUncles.length > 0 },
    { key: 'primos', visible: visiblePaternalCousins.length > 0 },
  ]);
  const maternalRows = buildSideRows([
    { key: 'tataravos', visible: visibleMaternalGreatGreatGrandparents.length > 0 },
    { key: 'bisavos', visible: visibleMaternalGreatGrandparents.length > 0 },
    { key: 'avos', visible: visibleMaternalGrandparents.length > 0 },
    { key: 'mae', visible: Boolean(groups.maternal.parentId && visiblePeople.has(groups.maternal.parentId)) },
    { key: 'tios', visible: visibleMaternalUncles.length > 0 },
    { key: 'primos', visible: visibleMaternalCousins.length > 0 },
  ]);
  const positionedNodes: Node[] = [];
  const positionedIds = new Set<string>();

  addTitle(positionedNodes, pessoasById.get(centralPersonId)?.nome_completo || '');

  placeGridCentered(visiblePaternalGreatGreatGrandparents, FATHER_CENTER_X, paternalRows.tataravos ?? TATARAVOS_PATERNOS_Y, 4, 'greatGreatGrandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(visibleMaternalGreatGreatGrandparents, MOTHER_CENTER_X, maternalRows.tataravos ?? TATARAVOS_MATERNOS_Y, 4, 'greatGreatGrandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(visiblePaternalGreatGrandparents, FATHER_CENTER_X, paternalRows.bisavos ?? BISAVOS_PATERNOS_Y, 4, 'greatGrandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(visibleMaternalGreatGrandparents, MOTHER_CENTER_X, maternalRows.bisavos ?? BISAVOS_MATERNOS_Y, 4, 'greatGrandparent', positionedNodes, positionedIds, personNodeById);
  placeGridCentered(visiblePaternalGrandparents, FATHER_CENTER_X, paternalRows.avos ?? AVOS_PATERNOS_Y, 2, 'grandparent', positionedNodes, positionedIds, personNodeById, 40);
  placeGridCentered(visibleMaternalGrandparents, MOTHER_CENTER_X, maternalRows.avos ?? AVOS_MATERNOS_Y, 2, 'grandparent', positionedNodes, positionedIds, personNodeById, 40);

  placeGridCentered(visiblePaternalUncles, PATERNAL_OUTER_CENTER_X, paternalRows.tios ?? TIOS_Y, UNCLES_PER_ROW, 'uncleAunt', positionedNodes, positionedIds, personNodeById, UNCLE_COLUMN_GAP, CARD_ROW_GAP);
  placeGridCentered(visibleMaternalUncles, MATERNAL_OUTER_CENTER_X, maternalRows.tios ?? TIOS_Y, UNCLES_PER_ROW, 'uncleAunt', positionedNodes, positionedIds, personNodeById, UNCLE_COLUMN_GAP, CARD_ROW_GAP);
  placeGridCentered(visiblePaternalCousins, PATERNAL_OUTER_CENTER_X, paternalRows.primos ?? PRIMOS_Y, COUSINS_PER_ROW, 'cousin', positionedNodes, positionedIds, personNodeById, COUSIN_COLUMN_GAP, CARD_ROW_GAP);
  placeGridCentered(visibleMaternalCousins, MATERNAL_OUTER_CENTER_X, maternalRows.primos ?? PRIMOS_Y, COUSINS_PER_ROW, 'cousin', positionedNodes, positionedIds, personNodeById, COUSIN_COLUMN_GAP, CARD_ROW_GAP);

  placePerson(groups.paternal.parentId, nodeXFromCenter(FATHER_CENTER_X), paternalRows.pai ?? PAIS_Y, 'parent', positionedNodes, positionedIds, personNodeById);
  placePerson(groups.maternal.parentId, nodeXFromCenter(MOTHER_CENTER_X), maternalRows.mae ?? PAIS_Y, 'parent', positionedNodes, positionedIds, personNodeById);
  placePerson(centralPersonId, CENTRAL_X, CENTRAL_Y, 'central', positionedNodes, positionedIds, personNodeById, true);

  placeGridCentered(visibleSiblings, SIBLINGS_CENTER_X, IRMAOS_Y, DIRECT_SIBLINGS_COLUMNS, 'sibling', positionedNodes, positionedIds, personNodeById, SIBLING_COLUMN_GAP, DIRECT_GROUP_GAP_Y);

  const siblingRows = gridRowCount(visibleSiblings, DIRECT_SIBLINGS_COLUMNS);
  const nephewsY = Math.max(
    DIRECT_ROW_NEPHEWS_Y,
    IRMAOS_Y + Math.max(1, siblingRows) * NODE_HEIGHT + Math.max(0, siblingRows - 1) * (DIRECT_GROUP_GAP_Y - NODE_HEIGHT) + 86
  );
  placeGridCentered(visibleNephewsAndNieces, SIBLINGS_CENTER_X, nephewsY, 2, 'nephewNiece', positionedNodes, positionedIds, personNodeById, DIRECT_GROUP_GAP_X, DIRECT_GROUP_GAP_Y);

  placeGridCentered(visibleSpouses, SPOUSE_CENTER_X, SPOUSE_Y, 2, 'spouse', positionedNodes, positionedIds, personNodeById, 28, DIRECT_GROUP_GAP_Y);
  placeGridCentered(visibleChildren, CHILDREN_CENTER_X, CHILDREN_Y, 2, 'child', positionedNodes, positionedIds, personNodeById, SIBLING_COLUMN_GAP, DIRECT_GROUP_GAP_Y);
  placeGridCentered(visibleGrandchildren, CHILDREN_CENTER_X, GRANDCHILDREN_Y, 2, 'grandchild', positionedNodes, positionedIds, personNodeById, SIBLING_COLUMN_GAP, DIRECT_GROUP_GAP_Y);

  addGroupLabel(positionedNodes, 'direct-label-tataravos-paternos', 'TATARAVÓS PATERNOS', visiblePaternalGreatGreatGrandparents);
  addGroupLabel(positionedNodes, 'direct-label-tataravos-maternos', 'TATARAVÓS MATERNOS', visibleMaternalGreatGreatGrandparents);
  addGroupLabel(positionedNodes, 'direct-label-bisavos-paternos', 'BISAVÓS PATERNOS', visiblePaternalGreatGrandparents);
  addGroupLabel(positionedNodes, 'direct-label-bisavos-maternos', 'BISAVÓS MATERNOS', visibleMaternalGreatGrandparents);
  addGroupLabel(positionedNodes, 'direct-label-avos-paternos', 'AVÓS PATERNOS', visiblePaternalGrandparents);
  addGroupLabel(positionedNodes, 'direct-label-avos-maternos', 'AVÓS MATERNOS', visibleMaternalGrandparents);
  addGroupLabel(positionedNodes, 'direct-label-pai', 'PAI', groups.paternal.parentId ? [groups.paternal.parentId] : []);
  addGroupLabel(positionedNodes, 'direct-label-mae', 'MÃE', groups.maternal.parentId ? [groups.maternal.parentId] : []);
  addCenteredLabel(positionedNodes, 'direct-label-irmaos', 'IRMÃOS', SIBLINGS_CENTER_X, IRMAOS_LABEL_Y, visibleSiblings.length > 0);
  addCenteredLabel(positionedNodes, 'direct-label-conjuge', 'CÔNJUGE', SPOUSE_CENTER_X, SPOUSE_LABEL_Y, visibleSpouses.length > 0);
  addCenteredLabel(positionedNodes, 'direct-label-filhos', 'FILHOS', CHILDREN_CENTER_X, CHILDREN_LABEL_Y, visibleChildren.length > 0);
  addGroupLabel(positionedNodes, 'direct-label-sobrinhos', 'SOBRINHOS', visibleNephewsAndNieces);
  addGroupLabel(positionedNodes, 'direct-label-tios-paternos', 'TIOS PATERNOS', visiblePaternalUncles);
  addGroupLabel(positionedNodes, 'direct-label-tios-maternos', 'TIOS MATERNOS', visibleMaternalUncles);
  addGroupLabel(positionedNodes, 'direct-label-primos-paternos', 'PRIMOS PATERNOS', visiblePaternalCousins);
  addGroupLabel(positionedNodes, 'direct-label-primos-maternos', 'PRIMOS MATERNOS', visibleMaternalCousins);

  addGroupBox(positionedNodes, 'tataravos-paternos', visiblePaternalGreatGreatGrandparents, 'direct-label-tataravos-paternos');
  addGroupBox(positionedNodes, 'tataravos-maternos', visibleMaternalGreatGreatGrandparents, 'direct-label-tataravos-maternos');
  addGroupBox(positionedNodes, 'bisavos-paternos', visiblePaternalGreatGrandparents, 'direct-label-bisavos-paternos');
  addGroupBox(positionedNodes, 'bisavos-maternos', visibleMaternalGreatGrandparents, 'direct-label-bisavos-maternos');
  addGroupBox(positionedNodes, 'avos-paternos', visiblePaternalGrandparents, 'direct-label-avos-paternos');
  addGroupBox(positionedNodes, 'avos-maternos', visibleMaternalGrandparents, 'direct-label-avos-maternos');
  addGroupBox(positionedNodes, 'pai', groups.paternal.parentId ? [groups.paternal.parentId] : [], 'direct-label-pai');
  addGroupBox(positionedNodes, 'mae', groups.maternal.parentId ? [groups.maternal.parentId] : [], 'direct-label-mae');
  addGroupBox(positionedNodes, 'irmaos', visibleSiblings, 'direct-label-irmaos');
  addGroupBox(positionedNodes, 'conjuge', visibleSpouses, 'direct-label-conjuge');
  addGroupBox(positionedNodes, 'filhos', visibleChildren, 'direct-label-filhos');
  addGroupBox(positionedNodes, 'sobrinhos', visibleNephewsAndNieces, 'direct-label-sobrinhos');
  addGroupBox(positionedNodes, 'tios-paternos', visiblePaternalUncles, 'direct-label-tios-paternos');
  addGroupBox(positionedNodes, 'tios-maternos', visibleMaternalUncles, 'direct-label-tios-maternos');
  addGroupBox(positionedNodes, 'primos-paternos', visiblePaternalCousins, 'direct-label-primos-paternos');
  addGroupBox(positionedNodes, 'primos-maternos', visibleMaternalCousins, 'direct-label-primos-maternos');

  const fatherGroupBoxBounds = getGroupBoxBounds(
    positionedNodes,
    groups.paternal.parentId ? [groups.paternal.parentId] : [],
    'direct-label-pai'
  );
  const motherGroupBoxBounds = getGroupBoxBounds(
    positionedNodes,
    groups.maternal.parentId ? [groups.maternal.parentId] : [],
    'direct-label-mae'
  );
  const paternalGreatGrandparentsGroupBoxBounds = getGroupBoxBounds(
    positionedNodes,
    visiblePaternalGreatGrandparents,
    'direct-label-bisavos-paternos'
  );
  const paternalGreatGreatGrandparentsGroupBoxBounds = getGroupBoxBounds(
    positionedNodes,
    visiblePaternalGreatGreatGrandparents,
    'direct-label-tataravos-paternos'
  );
  const maternalGreatGreatGrandparentsGroupBoxBounds = getGroupBoxBounds(
    positionedNodes,
    visibleMaternalGreatGreatGrandparents,
    'direct-label-tataravos-maternos'
  );
  const maternalGreatGrandparentsGroupBoxBounds = getGroupBoxBounds(
    positionedNodes,
    visibleMaternalGreatGrandparents,
    'direct-label-bisavos-maternos'
  );
  const paternalGrandparentsGroupBoxBounds = getGroupBoxBounds(
    positionedNodes,
    visiblePaternalGrandparents,
    'direct-label-avos-paternos'
  );
  const maternalGrandparentsGroupBoxBounds = getGroupBoxBounds(
    positionedNodes,
    visibleMaternalGrandparents,
    'direct-label-avos-maternos'
  );
  const paternalUnclesGroupBoxBounds = getGroupBoxBounds(
    positionedNodes,
    visiblePaternalUncles,
    'direct-label-tios-paternos'
  );
  const maternalUnclesGroupBoxBounds = getGroupBoxBounds(
    positionedNodes,
    visibleMaternalUncles,
    'direct-label-tios-maternos'
  );
  const paternalCousinsGroupBoxBounds = getGroupBoxBounds(
    positionedNodes,
    visiblePaternalCousins,
    'direct-label-primos-paternos'
  );
  const maternalCousinsGroupBoxBounds = getGroupBoxBounds(
    positionedNodes,
    visibleMaternalCousins,
    'direct-label-primos-maternos'
  );
  const siblingsGroupBoxBounds = getGroupBoxBounds(positionedNodes, visibleSiblings, 'direct-label-irmaos');
  const nephewsGroupBoxBounds = getGroupBoxBounds(positionedNodes, visibleNephewsAndNieces, 'direct-label-sobrinhos');
  const spouseGroupBoxBounds = getGroupBoxBounds(positionedNodes, visibleSpouses, 'direct-label-conjuge');
  const childrenGroupBoxBounds = getGroupBoxBounds(positionedNodes, visibleChildren, 'direct-label-filhos');
  const centralSideConnectionY = CENTRAL_Y + CENTRAL_HEIGHT * 0.66;
  const lowerGroupTopY = Math.min(
    siblingsGroupBoxBounds?.minY ?? Number.POSITIVE_INFINITY,
    spouseGroupBoxBounds?.minY ?? Number.POSITIVE_INFINITY
  );
  const lowerConnectionElbowY = Number.isFinite(lowerGroupTopY)
    ? Math.min(CENTRAL_BOTTOM_Y + 54, lowerGroupTopY - 18)
    : CENTRAL_BOTTOM_Y + 54;
  const fatherConnectionElbowX = Math.min(
    CENTRAL_X - 112,
    (siblingsGroupBoxBounds?.minX ?? CENTRAL_X - 64) - 48
  );
  const motherConnectionElbowX = Math.max(
    CENTRAL_X + CENTRAL_WIDTH + 112,
    (spouseGroupBoxBounds?.maxX ?? CENTRAL_X + CENTRAL_WIDTH + 64) + 48
  );

  if (fatherGroupBoxBounds) {
    addAnchor(positionedNodes, positionedIds, 'direct-anchor-central-left', CENTRAL_X, centralSideConnectionY);
    addAnchor(
      positionedNodes,
      positionedIds,
      'direct-anchor-pai-right',
      fatherGroupBoxBounds.maxX,
      fatherGroupBoxBounds.centerY
    );
  }

  if (motherGroupBoxBounds) {
    addAnchor(positionedNodes, positionedIds, 'direct-anchor-central-right', CENTRAL_X + CENTRAL_WIDTH, centralSideConnectionY);
    addAnchor(
      positionedNodes,
      positionedIds,
      'direct-anchor-mae-left',
      motherGroupBoxBounds.minX,
      motherGroupBoxBounds.centerY
    );
  }

  if (siblingsGroupBoxBounds || spouseGroupBoxBounds) {
    addAnchor(positionedNodes, positionedIds, 'direct-center-bottom-anchor', CENTER_X, CENTRAL_BOTTOM_Y);
  }

  if (siblingsGroupBoxBounds) {
    addAnchor(
      positionedNodes,
      positionedIds,
      'direct-siblings-group-top-anchor',
      siblingsGroupBoxBounds.centerX,
      siblingsGroupBoxBounds.minY
    );
  }

  if (spouseGroupBoxBounds) {
    addAnchor(
      positionedNodes,
      positionedIds,
      'direct-spouse-group-top-anchor',
      spouseGroupBoxBounds.centerX,
      spouseGroupBoxBounds.minY
    );
  }

  const connectionGroupBounds = [
    ['paternal-great-great-grandparents', paternalGreatGreatGrandparentsGroupBoxBounds],
    ['paternal-great-grandparents', paternalGreatGrandparentsGroupBoxBounds],
    ['paternal-grandparents', paternalGrandparentsGroupBoxBounds],
    ['father', fatherGroupBoxBounds],
    ['paternal-uncles', paternalUnclesGroupBoxBounds],
    ['paternal-cousins', paternalCousinsGroupBoxBounds],
    ['maternal-great-great-grandparents', maternalGreatGreatGrandparentsGroupBoxBounds],
    ['maternal-great-grandparents', maternalGreatGrandparentsGroupBoxBounds],
    ['maternal-grandparents', maternalGrandparentsGroupBoxBounds],
    ['mother', motherGroupBoxBounds],
    ['maternal-uncles', maternalUnclesGroupBoxBounds],
    ['maternal-cousins', maternalCousinsGroupBoxBounds],
    ['siblings', siblingsGroupBoxBounds],
    ['nephews', nephewsGroupBoxBounds],
    ['spouse', spouseGroupBoxBounds],
    ['children', childrenGroupBoxBounds],
  ] as const;

  connectionGroupBounds.forEach(([id, bounds]) => {
    if (bounds) addGroupBoundaryAnchors(positionedNodes, positionedIds, `direct-group-${id}`, bounds);
  });

  const { edges, addEdge } = createEdgeBuilder(positionedIds);
  if (fatherGroupBoxBounds) {
    addDirectStructuralEdge(
      addEdge,
      'direct-central-to-father-group',
      'direct-anchor-central-left',
      'direct-anchor-pai-right',
      'directSideElbow',
      {
        elbowX: fatherConnectionElbowX,
      }
    );
  }

  if (motherGroupBoxBounds) {
    addDirectStructuralEdge(
      addEdge,
      'direct-central-to-mother-group',
      'direct-anchor-central-right',
      'direct-anchor-mae-left',
      'directSideElbow',
      {
        elbowX: motherConnectionElbowX,
      }
    );
  }

  if (siblingsGroupBoxBounds) {
    addDirectStructuralEdge(
      addEdge,
      'direct-central-to-siblings-group',
      'direct-center-bottom-anchor',
      'direct-siblings-group-top-anchor',
      'directElbowFromCenter',
      {
        sourceHandle: 'bottom',
        targetHandle: 'top',
        elbowY: lowerConnectionElbowY,
      }
    );
  }

  if (spouseGroupBoxBounds) {
    addDirectStructuralEdge(
      addEdge,
      'direct-central-to-spouse-group',
      'direct-center-bottom-anchor',
      'direct-spouse-group-top-anchor',
      'directElbowFromCenter',
      {
        sourceHandle: 'bottom',
        targetHandle: 'top',
        elbowY: lowerConnectionElbowY,
      }
    );
  }

  if (paternalGreatGreatGrandparentsGroupBoxBounds && paternalGreatGrandparentsGroupBoxBounds) {
    addGroupBoxConnection(addEdge, 'direct-group-paternal-great-great-grandparents', 'direct-group-paternal-great-grandparents');
  }
  if (paternalGreatGrandparentsGroupBoxBounds && paternalGrandparentsGroupBoxBounds) {
    addGroupBoxConnection(addEdge, 'direct-group-paternal-great-grandparents', 'direct-group-paternal-grandparents');
  }
  if (paternalGrandparentsGroupBoxBounds && fatherGroupBoxBounds) {
    addGroupBoxConnection(addEdge, 'direct-group-paternal-grandparents', 'direct-group-father');
  }
  if (fatherGroupBoxBounds && paternalUnclesGroupBoxBounds) {
    addGroupBoxConnection(addEdge, 'direct-group-father', 'direct-group-paternal-uncles');
  }
  if (paternalUnclesGroupBoxBounds && paternalCousinsGroupBoxBounds) {
    addGroupBoxConnection(addEdge, 'direct-group-paternal-uncles', 'direct-group-paternal-cousins');
  }

  if (maternalGreatGreatGrandparentsGroupBoxBounds && maternalGreatGrandparentsGroupBoxBounds) {
    addGroupBoxConnection(addEdge, 'direct-group-maternal-great-great-grandparents', 'direct-group-maternal-great-grandparents');
  }
  if (maternalGreatGrandparentsGroupBoxBounds && maternalGrandparentsGroupBoxBounds) {
    addGroupBoxConnection(addEdge, 'direct-group-maternal-great-grandparents', 'direct-group-maternal-grandparents');
  }
  if (maternalGrandparentsGroupBoxBounds && motherGroupBoxBounds) {
    addGroupBoxConnection(addEdge, 'direct-group-maternal-grandparents', 'direct-group-mother');
  }
  if (motherGroupBoxBounds && maternalUnclesGroupBoxBounds) {
    addGroupBoxConnection(addEdge, 'direct-group-mother', 'direct-group-maternal-uncles');
  }
  if (maternalUnclesGroupBoxBounds && maternalCousinsGroupBoxBounds) {
    addGroupBoxConnection(addEdge, 'direct-group-maternal-uncles', 'direct-group-maternal-cousins');
  }

  if (siblingsGroupBoxBounds && nephewsGroupBoxBounds) {
    addGroupBoxConnection(addEdge, 'direct-group-siblings', 'direct-group-nephews');
  }
  if (spouseGroupBoxBounds && childrenGroupBoxBounds) {
    addGroupBoxConnection(addEdge, 'direct-group-spouse', 'direct-group-children');
  }

  addAncestorSpouseEdges(addEdge, visiblePaternalGreatGreatGrandparents, positionedNodes, index);
  addAncestorSpouseEdges(addEdge, visibleMaternalGreatGreatGrandparents, positionedNodes, index);
  addAncestorSpouseEdges(addEdge, visiblePaternalGreatGrandparents, positionedNodes, index);
  addAncestorSpouseEdges(addEdge, visibleMaternalGreatGrandparents, positionedNodes, index);
  addAncestorSpouseEdges(addEdge, visiblePaternalGrandparents, positionedNodes, index);
  addAncestorSpouseEdges(addEdge, visibleMaternalGrandparents, positionedNodes, index);

  return {
    nodes: positionedNodes,
    edges,
  };
}
