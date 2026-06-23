import { Edge, Node } from 'reactflow';
import { Relacionamento } from '../../../types';
import { isHumanFamilyMember, isPetFamilyMember } from '../../../utils/personEntity';
import {
  DEFAULT_DIRECT_RELATIVE_FILTERS,
  DirectRelationVariant,
  DirectRelativeFilters,
  EdgeFilters,
  TREE_CONSTANTS,
  TreeLayoutBounds,
  TreeLayoutParams,
  TreeLayoutResult,
  VisualLineFilters,
  getSortableBirthValue,
} from '../types';
import { DIRECT_FAMILY_TOKENS, FAMILY_TREE_COLORS } from '../visualTokens';

interface DirectFamilyLayoutOptions {
  centralPersonId?: string;
  filters?: DirectRelativeFilters;
  visiblePersonIds?: Set<string>;
  visualLineFilters?: VisualLineFilters;
  edgeFilters?: EdgeFilters;
  isMobile?: boolean;
}

type ParentKind = 'pai' | 'mae' | 'parent';
type DirectSide = 'paternal' | 'maternal';
type DirectLineGroup = 'spouse' | 'parentChild' | 'sibling' | 'auxiliary';

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
  laneWidth?: number;
  fillAvailableWidth?: boolean;
  cardWidth?: number;
  cardHeight?: number;
  columnGap?: number;
  rowGap?: number;
  alignBoundary?: {
    side: 'left' | 'right';
    x: number;
  };
}

interface GroupBoxBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centerX: number;
  centerY: number;
}

interface GroupLayoutUnit {
  ids: string[];
}

interface GroupGridMetrics {
  rows: GroupLayoutUnit[][];
  largestRow: number;
  columns: number;
  cardsHeight: number;
  cardsWidth: number;
}

interface SideStackPlanItem {
  group: GroupSpec;
  topY: number;
  height: number;
}

const DIRECT_FRAME_EXTRA_HORIZONTAL_SPACE = 560;
const DIRECT_FRAME_LEFT = 10 - DIRECT_FRAME_EXTRA_HORIZONTAL_SPACE;
const DIRECT_FRAME_RIGHT = 3210 + DIRECT_FRAME_EXTRA_HORIZONTAL_SPACE;
const FRAME_TOP = 10;
const FRAME_BOTTOM = 1810;
const MOBILE_FRAME_LEFT = -70;
const MOBILE_FRAME_RIGHT = 3290;
const MOBILE_FRAME_TOP = -30;
const MOBILE_FRAME_BOTTOM = 4200;
const TITLE_TOP = FRAME_TOP + 10;
const TITLE_WIDTH = 1540;
const TITLE_RESERVED_HEIGHT = 80;
const VIEW_CENTER_X = (DIRECT_FRAME_LEFT + DIRECT_FRAME_RIGHT) / 2;
const VIEW_CENTER_Y = (FRAME_TOP + FRAME_BOTTOM) / 2;

const CARD_WIDTH = 400;
const CARD_HEIGHT = DIRECT_FAMILY_TOKENS.CARD_HEIGHT;
const CENTRAL_WIDTH = DIRECT_FAMILY_TOKENS.CENTRAL_WIDTH;
const CENTRAL_HEIGHT = 760;
const LEGEND_WIDTH = Math.min(760, CENTRAL_WIDTH * 1.8);
const LEGEND_HEIGHT = 92;
const LEGEND_BOTTOM_GAP = 30;

const SIDE_GROUPS_TOP = 170;
const SIDE_GROUPS_BOTTOM = FRAME_BOTTOM;
const CENTRAL_GROUP_TOP = SIDE_GROUPS_TOP;
const DIRECT_FILTER_PANEL_BOTTOM_ALIGNMENT_Y = SIDE_GROUPS_BOTTOM;
// Extra logical room used only by Minha Árvore so lower groups reach the filter panel's visual base.
const DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET = 140;
const DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y =
  DIRECT_FILTER_PANEL_BOTTOM_ALIGNMENT_Y + DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET;
const CENTRAL_GROUP_BOTTOM = DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y;

const GROUP_BOX_PADDING_X = 18;
const GROUP_BOX_PADDING_Y = 14;
const LABEL_HEIGHT = 38;
const LABEL_TO_CARD_GAP = 8;
const COLUMN_GAP = 14;
const ROW_GAP = 16;
const ROW_STEP = CARD_HEIGHT + ROW_GAP;
const SIDE_TOP = SIDE_GROUPS_TOP;
const SIDE_BOTTOM = SIDE_GROUPS_BOTTOM;
const SIDE_GROUP_MIN_GAP = 10;
const CENTRAL_X = VIEW_CENTER_X - CENTRAL_WIDTH / 2;
const CENTRAL_AREA_VERTICAL_CENTER_Y = (SIDE_GROUPS_TOP + DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y) / 2;
const CENTRAL_LOWER_REFERENCE_HEIGHT = 620;
const CENTRAL_AREA_SHIFT_DOWN = -100;
const CENTRAL_BASE_Y = CENTRAL_AREA_VERTICAL_CENTER_Y - CENTRAL_LOWER_REFERENCE_HEIGHT / 2 + CENTRAL_AREA_SHIFT_DOWN;
const CENTRAL_CORE_SHIFT_UP = 210;
const CENTRAL_Y = CENTRAL_BASE_Y - CENTRAL_CORE_SHIFT_UP;
const CENTRAL_PARENT_GAP = 120;
const CENTRAL_LOWER_GROUP_GAP = 60;
const CENTRAL_LOWER_STACK_GAP = 18;
const CENTRAL_SIDE_GROUP_WIDTH = CARD_WIDTH + GROUP_BOX_PADDING_X * 2;
const SIDE_AREA_OUTER_INSET_X = 8;
const SIDE_AREA_CENTER_GAP_X = 180;
const CENTRAL_AREA_TARGET_RATIO = 0.28;
const DIRECT_USEFUL_LEFT = DIRECT_FRAME_LEFT + SIDE_AREA_OUTER_INSET_X;
const DIRECT_USEFUL_RIGHT = DIRECT_FRAME_RIGHT - SIDE_AREA_OUTER_INSET_X;
const DIRECT_AREA_CONTENT_WIDTH = DIRECT_USEFUL_RIGHT - DIRECT_USEFUL_LEFT - SIDE_AREA_CENTER_GAP_X * 2;
const CENTRAL_AREA_WIDTH = DIRECT_AREA_CONTENT_WIDTH * CENTRAL_AREA_TARGET_RATIO;
const SIDE_AREA_WIDTH = (DIRECT_AREA_CONTENT_WIDTH - CENTRAL_AREA_WIDTH) / 2;
const PATERNAL_SIDE_AREA_LEFT = DIRECT_USEFUL_LEFT;
const PATERNAL_SIDE_AREA_RIGHT = PATERNAL_SIDE_AREA_LEFT + SIDE_AREA_WIDTH;
const MATERNAL_SIDE_AREA_RIGHT = DIRECT_USEFUL_RIGHT;
const MATERNAL_SIDE_AREA_LEFT = MATERNAL_SIDE_AREA_RIGHT - SIDE_AREA_WIDTH;
const CENTRAL_LEFT_BOUNDARY = PATERNAL_SIDE_AREA_RIGHT + SIDE_AREA_CENTER_GAP_X;
const CENTRAL_RIGHT_BOUNDARY = MATERNAL_SIDE_AREA_LEFT - SIDE_AREA_CENTER_GAP_X;
const FATHER_GROUP_CENTER_X = CENTRAL_LEFT_BOUNDARY + CENTRAL_SIDE_GROUP_WIDTH / 2;
const MOTHER_GROUP_CENTER_X = CENTRAL_RIGHT_BOUNDARY - CENTRAL_SIDE_GROUP_WIDTH / 2;
const PATERNAL_LANE_LEFT = PATERNAL_SIDE_AREA_LEFT;
const PATERNAL_LANE_RIGHT = PATERNAL_SIDE_AREA_RIGHT;
const MATERNAL_LANE_LEFT = MATERNAL_SIDE_AREA_LEFT;
const MATERNAL_LANE_RIGHT = MATERNAL_SIDE_AREA_RIGHT;
const SIDE_LANE_WIDTH = Math.min(
  PATERNAL_LANE_RIGHT - PATERNAL_LANE_LEFT,
  MATERNAL_LANE_RIGHT - MATERNAL_LANE_LEFT
);
const SIDE_GROUP_COLUMNS = 4;
const SIDE_COLLATERAL_MIN_COLUMNS = 2;
const ANCESTOR_GROUP_COLUMNS = 2;
const STANDARD_GROUP_CARD_WIDTH = 340;
const STANDARD_GROUP_CARD_HEIGHT = DIRECT_FAMILY_TOKENS.CARD_HEIGHT;
const SIDE_ANCESTOR_CARD_WIDTH = STANDARD_GROUP_CARD_WIDTH;
const SIDE_ANCESTOR_CARD_HEIGHT = 136;
const SIDE_COLLATERAL_CARD_WIDTH = 340;
const SIDE_COLLATERAL_CARD_HEIGHT = 136;
const SIDE_COLLATERAL_CARD_SCALE_STEP = 0.04;
const SIDE_COLLATERAL_CARD_MAX_SCALE = 1.48;
const SIDE_PARENT_CARD_WIDTH = STANDARD_GROUP_CARD_WIDTH;
const SIDE_PARENT_CARD_HEIGHT = 136;
const CENTRAL_PARENT_GROUP_Y = CENTRAL_Y - CENTRAL_PARENT_GAP - SIDE_PARENT_CARD_HEIGHT;
const LOWER_CARD_WIDTH = 340;
const LOWER_CARD_HEIGHT = 136;
const MOBILE_LOWER_CARD_WIDTH = 250;
const MOBILE_LOWER_CARD_HEIGHT = 124;
const MOBILE_LOWER_LANE_WIDTH = 620;
const MOBILE_LOWER_SPLIT_CARD_WIDTH = 230;
const MOBILE_DIRECT_GROUP_WIDTH = 760;
const MOBILE_DIRECT_CARD_WIDTH = 230;
const MOBILE_DIRECT_CARD_HEIGHT = 118;
const MOBILE_DIRECT_COLUMN_GAP = 12;
const MOBILE_DIRECT_ROW_GAP = 12;
const MOBILE_DIRECT_CENTER_X = VIEW_CENTER_X;
const MOBILE_PARENT_CARD_WIDTH = 250;
const MOBILE_PARENT_CARD_HEIGHT = 118;
const MOBILE_PARENT_GAP = 54;
const MOBILE_DIRECT_PARENT_CENTER_GAP = MOBILE_PARENT_CARD_WIDTH + MOBILE_PARENT_GAP;
const MOBILE_DIRECT_PARENT_Y = 20;
const MOBILE_DIRECT_CENTRAL_Y = 260;
const MOBILE_DIRECT_LOWER_Y = 760;
const MOBILE_DIRECT_STACK_GAP = 54;
const MOBILE_DIRECT_BOUNDS_PADDING_X = 90;
const MOBILE_DIRECT_BOUNDS_PADDING_TOP = 80;
const MOBILE_DIRECT_BOUNDS_PADDING_BOTTOM = 520;
const SIDE_COLUMN_GAP = 8;
const SIDE_ROW_GAP = 6;
const ANCESTOR_COLUMN_GAP = 32;
const ANCESTOR_ROW_GAP = 10;
const IN_GROUP_SIBLING_COLUMN_GAP = 18;
const IN_GROUP_SIBLING_ROW_GAP = 12;
const MARRIAGE_NODE_SIZE = TREE_CONSTANTS.MARRIAGE_NODE_WIDTH;
const MIN_COUPLE_CARD_GAP = TREE_CONSTANTS.HORIZONTAL_GAP_BETWEEN_SPOUSES;
const SIDE_GROUP_EXTRA_INNER_SPACE = 0;
const SIDE_GROUP_WIDTH =
  SIDE_GROUP_COLUMNS * SIDE_COLLATERAL_CARD_WIDTH +
  Math.max(0, SIDE_GROUP_COLUMNS - 1) * SIDE_COLUMN_GAP +
  GROUP_BOX_PADDING_X * 2 +
  SIDE_GROUP_EXTRA_INNER_SPACE;
const ANCESTOR_GROUP_WIDTH =
  ANCESTOR_GROUP_COLUMNS * SIDE_ANCESTOR_CARD_WIDTH +
  Math.max(0, ANCESTOR_GROUP_COLUMNS - 1) * ANCESTOR_COLUMN_GAP +
  GROUP_BOX_PADDING_X * 2;

const PATERNAL_GROUP_LEFT_X = PATERNAL_LANE_LEFT;
const PATERNAL_GROUP_RIGHT_X = PATERNAL_LANE_RIGHT;
const MATERNAL_GROUP_LEFT_X = MATERNAL_LANE_LEFT;
const MATERNAL_GROUP_RIGHT_X = MATERNAL_LANE_RIGHT;
const PATERNAL_GROUP_LANE_WIDTH = PATERNAL_GROUP_RIGHT_X - PATERNAL_GROUP_LEFT_X;
const MATERNAL_GROUP_LANE_WIDTH = MATERNAL_GROUP_RIGHT_X - MATERNAL_GROUP_LEFT_X;
const PATERNAL_CENTER_X = PATERNAL_GROUP_LEFT_X + PATERNAL_GROUP_LANE_WIDTH / 2;
const MATERNAL_CENTER_X = MATERNAL_GROUP_LEFT_X + MATERNAL_GROUP_LANE_WIDTH / 2;
const LOWER_GROUP_Y = CENTRAL_BASE_Y + CENTRAL_LOWER_REFERENCE_HEIGHT + CENTRAL_LOWER_GROUP_GAP;
const LOWER_LANE_WIDTH = 860;
const LOWER_GROUP_GAP = 10;
const LOWER_LEFT_GROUP_CENTER_X = FATHER_GROUP_CENTER_X;
const LOWER_RIGHT_GROUP_CENTER_X = MOTHER_GROUP_CENTER_X;
const LOWER_RIGHT_GROUP_SHIFT_X = 180;
const MOBILE_LOWER_LEFT_GROUP_CENTER_X = VIEW_CENTER_X - 220;
const MOBILE_LOWER_RIGHT_GROUP_CENTER_X = VIEW_CENTER_X + 220;
const DIRECT_STRUCTURAL_EDGE_STYLE = {
  stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
  strokeWidth: 3,
  opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
};
const DIRECT_HIGHLIGHT_EDGE_STROKE_WIDTH = DIRECT_STRUCTURAL_EDGE_STYLE.strokeWidth;
const DIRECT_PARENT_CHILD_HIGHLIGHT_EDGE_STYLE = {
  stroke: FAMILY_TREE_COLORS.EDGE_CHILD,
  strokeWidth: DIRECT_HIGHLIGHT_EDGE_STROKE_WIDTH,
  opacity: 0.86,
  strokeDasharray: 'none',
};
const DIRECT_SIBLING_HIGHLIGHT_EDGE_STYLE = {
  stroke: FAMILY_TREE_COLORS.EDGE_SIBLING,
  strokeWidth: DIRECT_HIGHLIGHT_EDGE_STROKE_WIDTH,
  opacity: 0.86,
  strokeDasharray: '5,5',
};
const DIRECT_SPOUSE_HIGHLIGHT_EDGE_STYLE = {
  stroke: FAMILY_TREE_COLORS.EDGE_SPOUSE,
  strokeWidth: DIRECT_HIGHLIGHT_EDGE_STROKE_WIDTH,
  opacity: 0.9,
  strokeDasharray: 'none',
};
const ANCESTOR_SPOUSE_EDGE_STYLE = {
  stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
  strokeWidth: DIRECT_STRUCTURAL_EDGE_STYLE.strokeWidth,
  opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
};

function isDirectLineVisible(lineGroup: DirectLineGroup, edgeFilters?: EdgeFilters) {
  if (!edgeFilters) return true;

  switch (lineGroup) {
    case 'spouse':
      return edgeFilters.conjugal;
    case 'parentChild':
      return edgeFilters.filiacao_sangue || edgeFilters.filiacao_adotiva;
    case 'sibling':
      return edgeFilters.irmaos;
    case 'auxiliary':
      return true;
    default:
      return true;
  }
}

function getDirectLineStyle(
  lineGroup: DirectLineGroup,
  visualLineFilters?: VisualLineFilters
): Edge['style'] {
  if (lineGroup === 'spouse' && visualLineFilters?.spouseHighlight) {
    return DIRECT_SPOUSE_HIGHLIGHT_EDGE_STYLE;
  }

  if (lineGroup === 'parentChild' && visualLineFilters?.parentChildHighlight) {
    return DIRECT_PARENT_CHILD_HIGHLIGHT_EDGE_STYLE;
  }

  if (lineGroup === 'sibling' && visualLineFilters?.siblingHighlight) {
    return DIRECT_SIBLING_HIGHLIGHT_EDGE_STYLE;
  }

  return DIRECT_STRUCTURAL_EDGE_STYLE;
}

// Hidden line groups always win over highlight flags; highlighting only restyles visible edges.

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
  return Math.min(420, Math.max(220, label.length * 11 + 40));
}

function addLabel(
  nodes: Node[],
  id: string,
  label: string,
  centerX: number,
  y: number,
  variant: 'group' | 'title' = 'group',
  subtitle?: string
) {
  const width = labelWidth(label, variant);
  nodes.push({
    id,
    type: 'directFamilyLabelNode',
    data: { label, subtitle, width, variant },
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

function addMarriageNode(
  nodes: Node[],
  positionedIds: Set<string>,
  id: string,
  centerX: number,
  centerY: number,
  size = MARRIAGE_NODE_SIZE
) {
  if (!Number.isFinite(centerX) || !Number.isFinite(centerY) || positionedIds.has(id)) return;

  nodes.push({
    id,
    type: 'marriageNode',
    data: {
      visualVariant: 'direct-family',
      layoutWidth: size,
      layoutHeight: size,
    },
    position: finitePosition(centerX - size / 2, centerY - size / 2),
    draggable: false,
    selectable: false,
    zIndex: 40,
  });
  positionedIds.add(id);
}

function getGroupBoxBounds(nodes: Node[], key: string): GroupBoxBounds | null {
  const groupBox = nodes.find((node) => node.id === `direct-group-box-${key}`);
  if (!groupBox) return null;

  const width = Number(groupBox.data?.width) || 0;
  const height = Number(groupBox.data?.height) || 0;
  if (width <= 0 || height <= 0) return null;

  return {
    minX: groupBox.position.x,
    minY: groupBox.position.y,
    maxX: groupBox.position.x + width,
    maxY: groupBox.position.y + height,
    centerX: groupBox.position.x + width / 2,
    centerY: groupBox.position.y + height / 2,
  };
}

function unitCardCount(unit: GroupLayoutUnit) {
  return unit.ids.length;
}

function rowCardCount(row: GroupLayoutUnit[]) {
  return row.reduce((sum, unit) => sum + unitCardCount(unit), 0);
}

function areDirectSiblings(firstId: string, secondId: string, index: RelationshipIndex) {
  if (firstId === secondId) return false;
  if (index.siblingsByPerson.get(firstId)?.has(secondId)) return true;

  const firstParentIds = new Set((index.parentsByChild.get(firstId) || []).map((link) => link.parentId));
  if (firstParentIds.size === 0) return false;

  return (index.parentsByChild.get(secondId) || []).some((link) => firstParentIds.has(link.parentId));
}

function buildSiblingLayoutUnits(ids: string[], index: RelationshipIndex) {
  const groupIds = new Set(ids);
  const usedIds = new Set<string>();
  const units: GroupLayoutUnit[] = [];

  ids.forEach((id) => {
    if (usedIds.has(id)) return;

    const unitIds = new Set<string>();
    const pending = [id];

    while (pending.length > 0) {
      const currentId = pending.pop();
      if (!currentId || unitIds.has(currentId) || !groupIds.has(currentId)) continue;

      unitIds.add(currentId);
      ids.forEach((candidateId) => {
        if (!unitIds.has(candidateId) && areDirectSiblings(currentId, candidateId, index)) {
          pending.push(candidateId);
        }
      });
    }

    const orderedUnitIds = ids.filter((candidateId) => unitIds.has(candidateId));
    orderedUnitIds.forEach((candidateId) => usedIds.add(candidateId));
    units.push({ ids: orderedUnitIds });
  });

  return units;
}

function buildGroupLayoutUnits(ids: string[], index?: RelationshipIndex, spec?: GroupSpec) {
  if (index && spec?.variant === 'cousin') {
    return buildSiblingLayoutUnits(ids, index);
  }

  const groupIds = new Set(ids);
  const usedIds = new Set<string>();
  const units: GroupLayoutUnit[] = [];

  ids.forEach((id) => {
    if (usedIds.has(id)) return;

    const spouseId = Array.from(index?.spousesByPerson.get(id) || []).find(
      (candidateId) => groupIds.has(candidateId) && !usedIds.has(candidateId)
    );

    if (spouseId) {
      units.push({ ids: [id, spouseId] });
      usedIds.add(id);
      usedIds.add(spouseId);
      return;
    }

    units.push({ ids: [id] });
    usedIds.add(id);
  });

  return units;
}

function buildGroupRows(ids: string[], maxPerRow: number, index?: RelationshipIndex, spec?: GroupSpec) {
  const units = buildGroupLayoutUnits(ids, index, spec);
  const columns = Math.max(
    1,
    Math.min(
      Math.max(maxPerRow, ...units.map(unitCardCount)),
      Math.max(1, ids.length)
    )
  );
  const rows: GroupLayoutUnit[][] = [];
  let currentRow: GroupLayoutUnit[] = [];
  let currentCards = 0;

  units.forEach((unit) => {
    const unitSize = unitCardCount(unit);
    if (currentRow.length > 0 && currentCards + unitSize > columns) {
      rows.push(currentRow);
      currentRow = [];
      currentCards = 0;
    }

    currentRow.push(unit);
    currentCards += unitSize;
  });

  if (currentRow.length > 0) rows.push(currentRow);
  if (rows.length === 0) rows.push([]);

  return { rows, columns };
}

function getSpecCardWidth(spec?: Pick<GroupSpec, 'cardWidth'>) {
  return spec?.cardWidth || CARD_WIDTH;
}

function getSpecCardHeight(spec?: Pick<GroupSpec, 'cardHeight'>) {
  return spec?.cardHeight || CARD_HEIGHT;
}

function getSpecColumnGap(spec?: Pick<GroupSpec, 'columnGap'>) {
  return Math.max(spec?.columnGap ?? COLUMN_GAP, MIN_COUPLE_CARD_GAP);
}

function getSpecRowGap(spec?: Pick<GroupSpec, 'rowGap'>) {
  return spec?.rowGap ?? ROW_GAP;
}

function groupGridMetrics(ids: string[], maxPerRow: number, index?: RelationshipIndex, spec?: GroupSpec): GroupGridMetrics {
  const { rows, columns } = buildGroupRows(ids, maxPerRow, index, spec);
  const largestRow = Math.max(1, ...rows.map(rowCardCount));
  const rowCount = Math.max(1, rows.length);
  const cardWidth = getSpecCardWidth(spec);
  const cardHeight = getSpecCardHeight(spec);
  const columnGap = getSpecColumnGap(spec);
  const rowGap = getSpecRowGap(spec);

  return {
    rows,
    largestRow,
    columns,
    cardsHeight: rowCount * cardHeight + Math.max(0, rowCount - 1) * rowGap,
    cardsWidth: largestRow * cardWidth + Math.max(0, largestRow - 1) * columnGap,
  };
}

function groupHeight(ids: string[], maxPerRow: number, index?: RelationshipIndex, spec?: GroupSpec) {
  const metrics = groupGridMetrics(ids, maxPerRow, index, spec);
  return GROUP_BOX_PADDING_Y * 2 + LABEL_HEIGHT + LABEL_TO_CARD_GAP + metrics.cardsHeight;
}

function isAncestorGroup(spec: GroupSpec) {
  return (
    spec.variant === 'greatGreatGrandparent' ||
    spec.variant === 'greatGrandparent' ||
    spec.variant === 'grandparent'
  );
}

function isCollateralGroup(spec: GroupSpec) {
  return spec.variant === 'uncleAunt' || spec.variant === 'cousin';
}

function groupWidthForColumns(label: string, columns: number, spec?: GroupSpec) {
  const cardsWidth = cardRowWidthForColumns(columns, spec);
  return Math.max(cardsWidth, labelWidth(label)) + GROUP_BOX_PADDING_X * 2;
}

function cardRowWidthForColumns(columns: number, spec?: GroupSpec) {
  const cardWidth = getSpecCardWidth(spec);
  const columnGap = getSpecColumnGap(spec);
  return columns * cardWidth + Math.max(0, columns - 1) * columnGap;
}

function cappedGroupWidthForColumns(label: string, columns: number, laneWidth: number, spec?: GroupSpec) {
  return Math.min(groupWidthForColumns(label, columns, spec), laneWidth);
}

function compactColumns(ids: string[], label: string, maxColumns: number, laneWidth: number, index?: RelationshipIndex, spec?: GroupSpec) {
  const visibleCount = Math.max(1, ids.length);
  const units = buildGroupLayoutUnits(ids, index, spec);
  const minColumns = Math.max(1, ...units.map(unitCardCount));
  if (maxColumns <= 1) return 1;

  const cappedMax = Math.min(Math.max(maxColumns, minColumns), visibleCount);
  const preferred = visibleCount <= 2
    ? Math.min(Math.max(2, minColumns), cappedMax)
    : visibleCount <= 4
      ? Math.min(Math.max(2, minColumns), cappedMax)
      : Math.min(3, cappedMax);

  for (let columns = preferred; columns >= minColumns; columns -= 1) {
    if (groupWidthForColumns(label, columns, spec) <= laneWidth) return columns;
  }

  return minColumns;
}

function sideGroupColumns(ids: string[], label: string, maxColumns: number, laneWidth: number, index?: RelationshipIndex, spec?: GroupSpec) {
  const visibleCount = Math.max(1, ids.length);
  const units = buildGroupLayoutUnits(ids, index, spec);
  const minColumns = Math.max(1, ...units.map(unitCardCount));
  const cappedMax = Math.min(Math.max(maxColumns, minColumns), visibleCount, SIDE_GROUP_COLUMNS);

  const preferredColumns = spec && isCollateralGroup(spec)
    ? visibleCount <= 1
      ? 1
      : visibleCount === 2
        ? 2
        : visibleCount === 3
          ? 3
        : visibleCount === 4
          ? 4
        : visibleCount <= 6
          ? 3
          : 4
    : cappedMax;

  const preferredMax = Math.max(
    minColumns,
    Math.min(preferredColumns, cappedMax)
  );

  for (let columns = preferredMax; columns >= minColumns; columns -= 1) {
    if (groupWidthForColumns(label, columns, spec) <= laneWidth) return columns;
  }

  return minColumns;
}

function resolveGroupColumns(spec: GroupSpec, ids = spec.ids, index?: RelationshipIndex) {
  if (spec.side) {
    return sideGroupColumns(
      ids,
      spec.label,
      spec.maxPerRow,
      spec.laneWidth || SIDE_GROUP_WIDTH,
      index,
      spec
    );
  }

  return compactColumns(ids, spec.label, spec.maxPerRow, spec.laneWidth || SIDE_LANE_WIDTH, index, spec);
}

function visibleGroupHeight(ids: string[], maxPerRow: number, index?: RelationshipIndex, spec?: GroupSpec) {
  return ids.length > 0 ? groupHeight(ids, maxPerRow, index, spec) : 0;
}

// Helpers legados de alinhamento vertical. A area central inferior da Minha Árvore
// nao deve usar alinhamento pelo bottom logico da view: Irmaos, Sobrinhos,
// Conjuge, Filhos e Netos devem permanecer compactados a partir de
// compactLowerGroupTopPositions(). Qualquer mudanca nesse comportamento precisa
// ser deliberada e testada visualmente na view Minha Árvore.
function lowerGroupTopPositions(
  groups: GroupSpec[],
  minTopY: number,
  bottomY: number,
  gap: number,
  index?: RelationshipIndex
) {
  const visibleGroups = groups.filter((group) => group.ids.length > 0);
  if (visibleGroups.length === 0) return new Map<string, number>();

  const heights = new Map(
    visibleGroups.map((group) => {
      const columns = resolveGroupColumns(group, group.ids, index);
      return [group.key, visibleGroupHeight(group.ids, columns, index, group)];
    })
  );
  const totalHeight = visibleGroups.reduce((sum, group) => sum + (heights.get(group.key) || 0), 0);
  const availableGap = visibleGroups.length > 1
    ? (bottomY - minTopY - totalHeight) / (visibleGroups.length - 1)
    : 0;
  const uniformGap = Math.max(gap, availableGap);
  let cursorY = visibleGroups.length === 1
    ? Math.max(minTopY, bottomY - totalHeight)
    : minTopY;
  const positions = new Map<string, number>();

  visibleGroups.forEach((group) => {
    positions.set(group.key, cursorY);
    cursorY += (heights.get(group.key) || 0) + uniformGap;
  });

  return positions;
}

function compactLowerGroupTopPositions(
  groups: GroupSpec[],
  minTopY: number,
  gap: number,
  index?: RelationshipIndex
) {
  const visibleGroups = groups.filter((group) => group.ids.length > 0);
  const positions = new Map<string, number>();
  let cursorY = minTopY;

  visibleGroups.forEach((group) => {
    const columns = resolveGroupColumns(group, group.ids, index);
    positions.set(group.key, cursorY);
    cursorY += visibleGroupHeight(group.ids, columns, index, group) + gap;
  });

  return positions;
}

function shouldCenterCardsInGroup(spec: GroupSpec) {
  return Boolean(spec.side) || isAncestorGroup(spec);
}

function getGroupWidth(spec: GroupSpec, metrics: GroupGridMetrics) {
  if (spec.laneWidth && metrics.columns > 2 && spec.fillAvailableWidth) {
    return spec.laneWidth;
  }

  const contentWidth = Math.max(metrics.cardsWidth, labelWidth(spec.label));
  const proportionalWidth = contentWidth + GROUP_BOX_PADDING_X * 2;

  if (spec.laneWidth) {
    return Math.min(proportionalWidth, spec.laneWidth);
  }

  return proportionalWidth;
}

function getGroupX(spec: GroupSpec, groupWidth: number) {
  if (spec.fillAvailableWidth && spec.side === 'paternal' && groupWidth === spec.laneWidth) {
    return PATERNAL_SIDE_AREA_LEFT;
  }

  if (spec.fillAvailableWidth && spec.side === 'maternal' && groupWidth === spec.laneWidth) {
    return MATERNAL_SIDE_AREA_RIGHT - groupWidth;
  }

  return spec.centerX - groupWidth / 2;
}

function getGroupCenterX(groupX: number, groupWidth: number) {
  return groupX + groupWidth / 2;
}

function getInnerCenterX(groupX: number, groupWidth: number) {
  const innerLeft = groupX + GROUP_BOX_PADDING_X;
  const innerRight = groupX + groupWidth - GROUP_BOX_PADDING_X;
  return (innerLeft + innerRight) / 2;
}

function getRowWidth(cardCount: number) {
  return cardCount * CARD_WIDTH + Math.max(0, cardCount - 1) * COLUMN_GAP;
}

function placeGroup(
  spec: GroupSpec,
  topY: number,
  positionedNodes: Node[],
  positionedIds: Set<string>,
  personNodeById: Map<string, Node>,
  index?: RelationshipIndex
) {
  const visibleIds = spec.ids.filter((id) => !positionedIds.has(id) && personNodeById.has(id));
  if (visibleIds.length === 0) return [];

  const maxPerRow = resolveGroupColumns(spec, visibleIds, index);
  const metrics = groupGridMetrics(visibleIds, maxPerRow, index, spec);
  const groupWidth = getGroupWidth(spec, metrics);
  const shouldCenterCards = shouldCenterCardsInGroup(spec);
  const groupX = getGroupX(spec, groupWidth);
  const groupCenterX = getGroupCenterX(groupX, groupWidth);
  const innerCenterX = getInnerCenterX(groupX, groupWidth);
  const labelY = topY + GROUP_BOX_PADDING_Y;
  const firstCardY = labelY + LABEL_HEIGHT + LABEL_TO_CARD_GAP;
  const placedIds: string[] = [];
  const cardWidth = getSpecCardWidth(spec);
  const cardHeight = getSpecCardHeight(spec);
  const columnGap = getSpecColumnGap(spec);
  const rowGap = getSpecRowGap(spec);

  addLabel(positionedNodes, `direct-label-${spec.key}`, spec.label, groupCenterX, labelY);

  for (let rowIndex = 0; rowIndex < metrics.rows.length; rowIndex += 1) {
    const rowIds = metrics.rows[rowIndex].flatMap((unit) => unit.ids);
    const rowWidth = rowIds.length * cardWidth + Math.max(0, rowIds.length - 1) * columnGap;
    const startX = shouldCenterCards
      ? innerCenterX - rowWidth / 2
      : spec.alignBoundary?.side === 'left'
        ? groupX + GROUP_BOX_PADDING_X
        : spec.alignBoundary?.side === 'right'
          ? groupX + groupWidth - GROUP_BOX_PADDING_X - rowWidth
          : groupCenterX - rowWidth / 2;

    rowIds.forEach((id, index) => {
      const node = personNodeById.get(id);
      if (!node) return;

      positionedNodes.push(clonePersonNode(
        {
          ...node,
          data: {
            ...node.data,
            width: cardWidth,
            height: cardHeight,
            layoutWidth: cardWidth,
            layoutHeight: cardHeight,
          },
        },
        startX + index * (cardWidth + columnGap),
        firstCardY + rowIndex * (cardHeight + rowGap),
        spec.variant
      ));
      positionedIds.add(id);
      placedIds.push(id);
    });
  }

  addGroupBox(positionedNodes, spec.key, groupX, topY, groupWidth, groupHeight(visibleIds, maxPerRow, index, spec));

  return placedIds;
}

function resolveSideStackGroups(groups: GroupSpec[], index?: RelationshipIndex) {
  const measuredGroups = groups.map((group) => {
    const laneWidth = group.laneWidth || SIDE_LANE_WIDTH;
    const columns = resolveGroupColumns(group, group.ids, index);
    const rows = groupGridMetrics(group.ids, columns, index, group);
    const contentWidth = Math.max(rows.cardsWidth, labelWidth(group.label));
    const measuredWidth = Math.min(contentWidth + GROUP_BOX_PADDING_X * 2, laneWidth);

    return {
      ...group,
      maxPerRow: columns,
      measuredWidth,
    };
  });

  return measuredGroups.map(({ measuredWidth, ...group }) => ({
    ...group,
    fillAvailableWidth: group.fillAvailableWidth,
  }));
}

function resolveSideStackLayout(groups: GroupSpec[], index?: RelationshipIndex) {
  const resolvedGroups = groups.map((group) => {
    const maxPerRow = resolveGroupColumns(group, group.ids, index);

    return {
      ...group,
      maxPerRow,
    };
  });

  const sideRangeHeight = SIDE_BOTTOM - SIDE_TOP;
  const stackGapFor = (items: typeof resolvedGroups) => {
    if (items.length <= 1) return 0;

    const totalHeight = items.reduce(
      (sum, group) => sum + groupHeight(group.ids, group.maxPerRow, index, group),
      0
    );

    return (sideRangeHeight - totalHeight) / (items.length - 1);
  };

  let adjustedGroups = resolvedGroups;
  let availableGap = stackGapFor(adjustedGroups);

  while (adjustedGroups.length > 1 && availableGap > 150) {
    let changed = false;

    adjustedGroups = adjustedGroups.map((group) => {
      if (changed || !isCollateralGroup(group) || group.maxPerRow <= 3 || group.ids.length <= 4) {
        return group;
      }

      const nextColumns = group.maxPerRow - 1;
      if (groupWidthForColumns(group.label, nextColumns, group) > (group.laneWidth || SIDE_LANE_WIDTH)) {
        return group;
      }

      changed = true;
      return {
        ...group,
        maxPerRow: nextColumns,
      };
    });

    if (!changed) break;
    availableGap = stackGapFor(adjustedGroups);
  }

  return adjustedGroups.map((group) => ({
    ...group,
    fillAvailableWidth: group.fillAvailableWidth,
  }));
}

function resolveSideStackPlan(
  visibleGroups: GroupSpec[],
  index?: RelationshipIndex,
  bottomY = SIDE_BOTTOM
): SideStackPlanItem[] {
  if (visibleGroups.length === 0) return [];

  const resolvedGroupsWithFill = resolveSideStackLayout(visibleGroups, index);
  const heights = resolvedGroupsWithFill.map((group) => groupHeight(group.ids, group.maxPerRow, index, group));
  const totalHeight = heights.reduce((sum, height) => sum + height, 0);
  const availableGap = resolvedGroupsWithFill.length > 1
    ? (bottomY - SIDE_TOP - totalHeight) / (resolvedGroupsWithFill.length - 1)
    : 0;
  const uniformGap = Math.max(SIDE_GROUP_MIN_GAP, availableGap);
  let cursorY = resolvedGroupsWithFill.length === 1 && totalHeight < bottomY - SIDE_TOP
    ? bottomY - totalHeight
    : SIDE_TOP;

  return resolvedGroupsWithFill.map((group, groupIndex) => {
    const item = {
      group,
      topY: cursorY,
      height: heights[groupIndex],
    };

    cursorY += heights[groupIndex] + uniformGap;
    return item;
  });
}

function scaleGroupCards(spec: GroupSpec, scale: number): GroupSpec {
  if (!isCollateralGroup(spec)) return spec;

  return {
    ...spec,
    cardWidth: Math.round(getSpecCardWidth(spec) * scale),
    cardHeight: Math.round(getSpecCardHeight(spec) * scale),
  };
}

function sideStackPlanFits(
  plan: SideStackPlanItem[],
  index?: RelationshipIndex
) {
  let previousBottom = Number.NEGATIVE_INFINITY;

  return plan.every((item) => {
    const columns = resolveGroupColumns(item.group, item.group.ids, index);
    const width = groupWidthForColumns(item.group.label, columns, item.group);
    const laneWidth = item.group.laneWidth || SIDE_LANE_WIDTH;
    const height = groupHeight(item.group.ids, columns, index, item.group);
    const bottomY = item.topY + height;
    const fitsWidth = width <= laneWidth;
    const fitsHeight = bottomY <= DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y;
    const keepsGap = item.topY >= previousBottom + SIDE_GROUP_MIN_GAP;

    previousBottom = bottomY;
    return fitsWidth && fitsHeight && keepsGap;
  });
}

function getLastCollateralPlanIndex(plan: SideStackPlanItem[]) {
  for (let itemIndex = plan.length - 1; itemIndex >= 0; itemIndex -= 1) {
    if (isCollateralGroup(plan[itemIndex].group)) {
      return itemIndex;
    }
  }

  return -1;
}

function buildAdaptiveSideStackPlan(
  basePlan: SideStackPlanItem[],
  lastCollateralIndex: number,
  scale: number,
  index?: RelationshipIndex
) {
  return basePlan.map((item, itemIndex) => {
    const group = scaleGroupCards(item.group, scale);
    const columns = resolveGroupColumns(group, group.ids, index);
    const height = groupHeight(group.ids, columns, index, group);
    const topY = itemIndex === lastCollateralIndex
      ? DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y - height
      : item.topY;

    return {
      group: {
        ...group,
        maxPerRow: columns,
      },
      topY,
      height,
    };
  });
}

function redistributeSideStackPlanToBottom(
  plan: SideStackPlanItem[],
  bottomY = DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y
): SideStackPlanItem[] {
  if (plan.length === 0) return plan;

  if (plan.length === 1) {
    const [item] = plan;
    return [{
      ...item,
      topY: Math.max(SIDE_TOP, bottomY - item.height),
    }];
  }

  const totalHeight = plan.reduce((sum, item) => sum + item.height, 0);
  const availableGap = (bottomY - SIDE_TOP - totalHeight) / (plan.length - 1);
  const uniformGap = Math.max(SIDE_GROUP_MIN_GAP, availableGap);

  let cursorY = SIDE_TOP;

  return plan.map((item) => {
    const nextItem = {
      ...item,
      topY: cursorY,
    };

    cursorY += item.height + uniformGap;
    return nextItem;
  });
}

function sideCollateralScaleSteps(maxScale = SIDE_COLLATERAL_CARD_MAX_SCALE) {
  const boundedMaxScale = Math.max(1, Math.min(maxScale, SIDE_COLLATERAL_CARD_MAX_SCALE));
  return Math.floor((boundedMaxScale - 1 + 0.0001) / SIDE_COLLATERAL_CARD_SCALE_STEP);
}

function resolveAdaptiveSideStackMaxScale(groups: GroupSpec[], index?: RelationshipIndex) {
  const basePlan = resolveSideStackPlan(groups, index, DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y);
  const lastCollateralIndex = getLastCollateralPlanIndex(basePlan);

  if (lastCollateralIndex < 0) return undefined;

  let bestScale = 1;
  const scaleSteps = sideCollateralScaleSteps();

  for (let step = 0; step <= scaleSteps; step += 1) {
    const scale = 1 + step * SIDE_COLLATERAL_CARD_SCALE_STEP;
    const candidatePlan = buildAdaptiveSideStackPlan(basePlan, lastCollateralIndex, scale, index);

    if (sideStackPlanFits(candidatePlan, index)) {
      bestScale = scale;
    }
  }

  return bestScale;
}

function resolveAdaptiveSideStackPlan(
  groups: GroupSpec[],
  index?: RelationshipIndex,
  maxScale = SIDE_COLLATERAL_CARD_MAX_SCALE
) {
  const basePlan = resolveSideStackPlan(groups, index, DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y);
  const lastCollateralIndex = getLastCollateralPlanIndex(basePlan);

  if (lastCollateralIndex < 0) return basePlan;

  let bestPlan = basePlan;
  const scaleSteps = sideCollateralScaleSteps(maxScale);

  for (let step = 0; step <= scaleSteps; step += 1) {
    const scale = 1 + step * SIDE_COLLATERAL_CARD_SCALE_STEP;
    const candidatePlan = buildAdaptiveSideStackPlan(basePlan, lastCollateralIndex, scale, index);

    if (sideStackPlanFits(candidatePlan, index)) {
      bestPlan = candidatePlan;
    }
  }

  return redistributeSideStackPlanToBottom(bestPlan);
}

function placeGroupStackPlan(
  plan: SideStackPlanItem[],
  positionedNodes: Node[],
  positionedIds: Set<string>,
  personNodeById: Map<string, Node>,
  index?: RelationshipIndex
) {
  const placedIds: string[] = [];

  plan.forEach((item) => {
    placedIds.push(...placeGroup(item.group, item.topY, positionedNodes, positionedIds, personNodeById, index));
  });

  return placedIds;
}

function shiftPlacedGroupY(
  nodes: Node[],
  spec: GroupSpec,
  deltaY: number,
  positionedIds: Set<string>
) {
  if (!Number.isFinite(deltaY) || Math.abs(deltaY) < 0.5) return;

  const groupNodeIds = new Set([
    `direct-group-box-${spec.key}`,
    `direct-label-${spec.key}`,
    ...spec.ids.filter((id) => positionedIds.has(id)),
  ]);

  nodes.forEach((node) => {
    if (!groupNodeIds.has(node.id)) return;
    node.position = {
      ...node.position,
      y: node.position.y + deltaY,
    };
  });
}

// Helper auxiliar legado para casos pontuais de alinhamento ao bottom.
// Nao aplicar aos grupos inferiores centrais da Minha Árvore.
function alignGroupToBottom(
  nodes: Node[],
  spec: GroupSpec,
  bottomY: number,
  positionedIds: Set<string>
) {
  const bounds = getGroupBoxBounds(nodes, spec.key);
  if (!bounds) return;

  shiftPlacedGroupY(nodes, spec, bottomY - bounds.maxY, positionedIds);
}

// Helper auxiliar legado para pilhas alinhadas ao bottom.
// Nao usar para Irmaos, Sobrinhos, Conjuge, Filhos e Netos na area central
// inferior da Minha Árvore; esses grupos devem continuar com
// compactLowerGroupTopPositions(), sem serem empurrados para o bottom logico.
function alignGroupStackToBottom(
  nodes: Node[],
  specs: GroupSpec[],
  bottomY: number,
  positionedIds: Set<string>
) {
  const visibleSpecs = specs.filter((spec) => getGroupBoxBounds(nodes, spec.key));
  if (visibleSpecs.length === 0) return;

  const lastVisibleSpec = visibleSpecs[visibleSpecs.length - 1];
  const lastBounds = getGroupBoxBounds(nodes, lastVisibleSpec.key);
  if (!lastBounds) return;

  const deltaY = bottomY - lastBounds.maxY;
  if (!Number.isFinite(deltaY) || Math.abs(deltaY) < 0.5) return;

  visibleSpecs.forEach((spec) => {
    shiftPlacedGroupY(nodes, spec, deltaY, positionedIds);
  });
}

function addCentralPerson(
  centralPersonId: string,
  positionedNodes: Node[],
  positionedIds: Set<string>,
  personNodeById: Map<string, Node>,
  isMobile = false
) {
  const node = personNodeById.get(centralPersonId);
  if (!node) return;

  const centralWidth = isMobile ? 320 : CENTRAL_WIDTH;
  const centralHeight = isMobile ? 410 : CENTRAL_HEIGHT;
  const centralX = CENTRAL_X + (CENTRAL_WIDTH - centralWidth) / 2;
  const centralY = isMobile ? MOBILE_DIRECT_CENTRAL_Y : CENTRAL_Y;

  positionedNodes.push(clonePersonNode(
    {
      ...node,
      data: {
        ...node.data,
        width: centralWidth,
        height: centralHeight,
        layoutWidth: centralWidth,
        layoutHeight: centralHeight,
      },
    },
    centralX,
    centralY,
    'central',
    true
  ));
  positionedIds.add(centralPersonId);
}

function createEdgeBuilder(positionedIds: Set<string>) {
  const edges: Edge[] = [];
  const signatures = new Set<string>();

  const addEdge = (edge: Edge) => {
    if (!positionedIds.has(edge.source) || !positionedIds.has(edge.target)) return;
    const signature = [edge.source, edge.target, edge.type, edge.sourceHandle, edge.targetHandle].join('|');
    if (signatures.has(signature)) return;
    signatures.add(signature);
    edges.push(edge);
  };

  return { edges, addEdge };
}

function addGroupBoundaryAnchors(
  nodes: Node[],
  positionedIds: Set<string>,
  key: string,
  bounds: GroupBoxBounds
) {
  addAnchor(nodes, positionedIds, `direct-group-${key}-top-anchor`, bounds.centerX, bounds.minY);
  addAnchor(nodes, positionedIds, `direct-group-${key}-bottom-anchor`, bounds.centerX, bounds.maxY);
  addAnchor(nodes, positionedIds, `direct-group-${key}-left-anchor`, bounds.minX, bounds.centerY);
  addAnchor(nodes, positionedIds, `direct-group-${key}-right-anchor`, bounds.maxX, bounds.centerY);
  addAnchor(nodes, positionedIds, `direct-group-${key}-center-anchor`, bounds.centerX, bounds.centerY);
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
    lineGroup?: DirectLineGroup;
    edgeFilters?: EdgeFilters;
    visualLineFilters?: VisualLineFilters;
    style?: Edge['style'];
  } = {}
) {
  const lineGroup = options.lineGroup || 'auxiliary';
  if (!isDirectLineVisible(lineGroup, options.edgeFilters)) return;

  addEdge({
    id,
    source,
    sourceHandle: options.sourceHandle || 'right',
    target,
    targetHandle: options.targetHandle || 'left',
    type: 'childEdge',
    style: options.style || getDirectLineStyle(lineGroup, options.visualLineFilters),
    data: {
      kind,
      elbowY: options.elbowY,
      elbowX: options.elbowX,
      lineGroup,
      isStructural: true,
    },
  });
}

function addGroupBoxConnection(
  addEdge: (edge: Edge) => void,
  sourceGroupKey: string,
  targetGroupKey: string,
  options: {
    lineGroup?: DirectLineGroup;
    edgeFilters?: EdgeFilters;
    visualLineFilters?: VisualLineFilters;
  } = {}
) {
  addDirectStructuralEdge(
    addEdge,
    `direct-group-${sourceGroupKey}-to-${targetGroupKey}`,
    `direct-group-${sourceGroupKey}-bottom-anchor`,
    `direct-group-${targetGroupKey}-top-anchor`,
    'directHorizontal',
    {
      sourceHandle: 'bottom',
      targetHandle: 'top',
      lineGroup: options.lineGroup,
      edgeFilters: options.edgeFilters,
      visualLineFilters: options.visualLineFilters,
    }
  );
}

function addConsecutiveGroupConnections(
  addEdge: (edge: Edge) => void,
  groupKeys: string[],
  groupBoundsByKey: Map<string, GroupBoxBounds>,
  options: {
    lineGroup?: DirectLineGroup;
    edgeFilters?: EdgeFilters;
    visualLineFilters?: VisualLineFilters;
  } = {}
) {
  const visibleKeys = groupKeys.filter((key) => groupBoundsByKey.has(key));

  for (let index = 0; index < visibleKeys.length - 1; index += 1) {
    addGroupBoxConnection(addEdge, visibleKeys[index], visibleKeys[index + 1], options);
  }
}

function findPositionedNode(nodes: Node[], id: string) {
  return nodes.find((node) => node.id === id);
}

function getPositionedNodeDimensions(node: Node) {
  return {
    width: Number(node.data?.layoutWidth || node.data?.width) || CARD_WIDTH,
    height: Number(node.data?.layoutHeight || node.data?.height) || CARD_HEIGHT,
  };
}

function getVisiblePersonNodeBounds(nodes: Node[]): TreeLayoutBounds | null {
  const personNodes = nodes.filter((node) => node.type === 'personNode' && !node.hidden);
  if (personNodes.length === 0) return null;

  const minX = Math.min(...personNodes.map((node) => node.position.x));
  const minY = Math.min(...personNodes.map((node) => node.position.y));
  const maxX = Math.max(...personNodes.map((node) => {
    const { width } = getPositionedNodeDimensions(node);
    return node.position.x + width;
  }));
  const maxY = Math.max(...personNodes.map((node) => {
    const { height } = getPositionedNodeDimensions(node);
    return node.position.y + height;
  }));

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

function getPositionedNodeCenter(node: Node) {
  const dimensions = getPositionedNodeDimensions(node);
  return {
    x: node.position.x + dimensions.width / 2,
    y: node.position.y + dimensions.height / 2,
  };
}

function isNodeInsideBounds(node: Node, bounds: GroupBoxBounds) {
  const center = getPositionedNodeCenter(node);
  return (
    center.x >= bounds.minX &&
    center.x <= bounds.maxX &&
    center.y >= bounds.minY &&
    center.y <= bounds.maxY
  );
}

function getInGroupVerticalConnectionOptions(sourceNode: Node, targetNode: Node) {
  const sourceCenter = getPositionedNodeCenter(sourceNode);
  const targetCenter = getPositionedNodeCenter(targetNode);
  const deltaX = targetCenter.x - sourceCenter.x;

  if (Math.abs(deltaX) <= 12) {
    return {
      kind: 'directHorizontal' as const,
      sourceHandle: 'bottom',
      targetHandle: 'top',
    };
  }

  return {
    kind: 'directSideElbow' as const,
    sourceHandle: deltaX > 0 ? 'right-source' : 'left-source',
    targetHandle: deltaX > 0 ? 'left-target' : 'right-target',
    elbowX: sourceCenter.x + deltaX / 2,
  };
}

function addInGroupSiblingEdges(
  addEdge: (edge: Edge) => void,
  positionedNodes: Node[],
  groupBoundsByKey: Map<string, GroupBoxBounds>,
  groupKeys: string[],
  options: {
    edgeFilters?: EdgeFilters;
    visualLineFilters?: VisualLineFilters;
  } = {}
) {
  groupKeys.forEach((groupKey) => {
    const bounds = groupBoundsByKey.get(groupKey);
    if (!bounds) return;

    const groupCards = positionedNodes
      .filter((node) => node.type === 'personNode' && isNodeInsideBounds(node, bounds))
      .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
    const rows: Node[][] = [];

    groupCards.forEach((node) => {
      const center = getPositionedNodeCenter(node);
      const row = rows.find((candidate) => {
        const firstCenter = getPositionedNodeCenter(candidate[0]);
        return Math.abs(firstCenter.y - center.y) <= 8;
      });

      if (row) {
        row.push(node);
      } else {
        rows.push([node]);
      }
    });

    rows.forEach((row, rowIndex) => {
      const sortedRow = row.sort((a, b) => a.position.x - b.position.x);

      for (let index = 0; index < sortedRow.length - 1; index += 1) {
        addDirectStructuralEdge(
          addEdge,
          `direct-${groupKey}-sibling-row-${rowIndex}-${sortedRow[index].id}-to-${sortedRow[index + 1].id}`,
          sortedRow[index].id,
          sortedRow[index + 1].id,
          'directHorizontal',
          {
            sourceHandle: 'right-source',
            targetHandle: 'left-target',
            lineGroup: 'sibling',
            edgeFilters: options.edgeFilters,
            visualLineFilters: options.visualLineFilters,
          }
        );
      }
    });

    const maxColumns = Math.max(0, ...rows.map((row) => row.length));
    for (let columnIndex = 0; columnIndex < maxColumns; columnIndex += 1) {
      for (let rowIndex = 0; rowIndex < rows.length - 1; rowIndex += 1) {
        const sourceNode = rows[rowIndex][columnIndex];
        const targetNode = rows[rowIndex + 1][columnIndex];
        if (!sourceNode || !targetNode) continue;

        const verticalConnection = getInGroupVerticalConnectionOptions(sourceNode, targetNode);

        addDirectStructuralEdge(
          addEdge,
          `direct-${groupKey}-sibling-column-${columnIndex}-${rowIndex}`,
          sourceNode.id,
          targetNode.id,
          verticalConnection.kind,
          {
            sourceHandle: verticalConnection.sourceHandle,
            targetHandle: verticalConnection.targetHandle,
            elbowX: verticalConnection.elbowX,
            lineGroup: 'sibling',
            edgeFilters: options.edgeFilters,
            visualLineFilters: options.visualLineFilters,
          }
        );
      }
    }
  });
}

function groupNodesByVisualRows(nodes: Node[]) {
  const rows: Node[][] = [];

  nodes
    .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x)
    .forEach((node) => {
      const center = getPositionedNodeCenter(node);
      const row = rows.find((candidate) => {
        const firstCenter = getPositionedNodeCenter(candidate[0]);
        return Math.abs(firstCenter.y - center.y) <= 8;
      });

      if (row) {
        row.push(node);
      } else {
        rows.push([node]);
      }
    });

  rows.forEach((row) => row.sort((a, b) => a.position.x - b.position.x));

  return rows;
}

function addCousinGroupGridEdges(
  addEdge: (edge: Edge) => void,
  positionedNodes: Node[],
  groupBoundsByKey: Map<string, GroupBoxBounds>,
  groupKeys: string[],
  index: RelationshipIndex,
  options: {
    edgeFilters?: EdgeFilters;
    visualLineFilters?: VisualLineFilters;
  } = {}
) {
  const siblingHighlightEnabled =
    isDirectLineVisible('sibling', options.edgeFilters) &&
    options.visualLineFilters?.siblingHighlight === true;

  const edgeStyleFor = (sourceId: string, targetId: string) =>
    siblingHighlightEnabled && areDirectSiblings(sourceId, targetId, index)
      ? getDirectLineStyle('sibling', options.visualLineFilters)
      : DIRECT_STRUCTURAL_EDGE_STYLE;

  groupKeys.forEach((groupKey) => {
    const bounds = groupBoundsByKey.get(groupKey);
    if (!bounds) return;

    const rows = groupNodesByVisualRows(
      positionedNodes.filter((node) => node.type === 'personNode' && isNodeInsideBounds(node, bounds))
    );

    rows.forEach((row, rowIndex) => {
      for (let columnIndex = 0; columnIndex < row.length - 1; columnIndex += 1) {
        const sourceNode = row[columnIndex];
        const targetNode = row[columnIndex + 1];

        addDirectStructuralEdge(
          addEdge,
          `direct-${groupKey}-grid-row-${rowIndex}-${columnIndex}`,
          sourceNode.id,
          targetNode.id,
          'directHorizontal',
          {
            sourceHandle: 'right-source',
            targetHandle: 'left-target',
            lineGroup: 'auxiliary',
            style: edgeStyleFor(sourceNode.id, targetNode.id),
          }
        );
      }
    });

    const maxColumns = Math.max(0, ...rows.map((row) => row.length));
    for (let columnIndex = 0; columnIndex < maxColumns; columnIndex += 1) {
      for (let rowIndex = 0; rowIndex < rows.length - 1; rowIndex += 1) {
        const sourceNode = rows[rowIndex][columnIndex];
        const targetNode = rows[rowIndex + 1][columnIndex];
        if (!sourceNode || !targetNode) continue;

        const verticalConnection = getInGroupVerticalConnectionOptions(sourceNode, targetNode);

        addDirectStructuralEdge(
          addEdge,
          `direct-${groupKey}-grid-column-${columnIndex}-${rowIndex}`,
          sourceNode.id,
          targetNode.id,
          verticalConnection.kind,
          {
            sourceHandle: verticalConnection.sourceHandle,
            targetHandle: verticalConnection.targetHandle,
            elbowX: verticalConnection.elbowX,
            lineGroup: 'auxiliary',
            style: edgeStyleFor(sourceNode.id, targetNode.id),
          }
        );
      }
    }
  });
}

function addAncestorSpouseEdge(
  addEdge: (edge: Edge) => void,
  leftId: string | undefined,
  rightId: string | undefined,
  options: {
    edgeFilters?: EdgeFilters;
    visualLineFilters?: VisualLineFilters;
  } = {}
) {
  if (!leftId || !rightId || leftId === rightId) return;
  if (!isDirectLineVisible('spouse', options.edgeFilters)) return;

  addEdge({
    id: `direct-ancestor-spouse-${[leftId, rightId].sort().join('-')}`,
    source: leftId,
    sourceHandle: 'spouse-right',
    target: rightId,
    targetHandle: 'spouse-left',
    type: 'spouseEdge',
    // Ancestor spouse lines keep the thinner spouse baseline, but still use the shared highlight style.
    style: options.visualLineFilters?.spouseHighlight
      ? getDirectLineStyle('spouse', options.visualLineFilters)
      : ANCESTOR_SPOUSE_EDGE_STYLE,
    data: {
      kind: 'directHorizontal',
      forceHorizontal: true,
      horizontalTolerance: 4,
      lineGroup: 'spouse',
      isStructural: true,
    },
  });
}

function addAncestorSpouseEdges(
  addEdge: (edge: Edge) => void,
  ids: string[],
  positionedNodes: Node[],
  positionedIds: Set<string>,
  index: RelationshipIndex,
  options: {
    edgeFilters?: EdgeFilters;
    visualLineFilters?: VisualLineFilters;
  } = {}
) {
  if (!isDirectLineVisible('spouse', options.edgeFilters)) return;

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

        const leftId = personNode.position.x <= spouseNode.position.x ? personId : spouseId;
        const rightId = leftId === personId ? spouseId : personId;
        const leftNode = leftId === personId ? personNode : spouseNode;
        const rightNode = rightId === personId ? personNode : spouseNode;
        const leftDimensions = getPositionedNodeDimensions(leftNode);
        const rightDimensions = getPositionedNodeDimensions(rightNode);
        const marriageCenterX = (leftNode.position.x + leftDimensions.width + rightNode.position.x) / 2;
        const marriageCenterY =
          (leftNode.position.y + leftDimensions.height / 2 + rightNode.position.y + rightDimensions.height / 2) / 2;

        addMarriageNode(
          positionedNodes,
          positionedIds,
          `direct-ancestor-marriage-${pairKey.replace('|', '-')}`,
          marriageCenterX,
          marriageCenterY
        );
        addAncestorSpouseEdge(addEdge, leftId, rightId, options);
      });
  });
}


export function collectDirectFamilyScopePersonIds(
  graph: TreeLayoutParams,
  options: DirectFamilyLayoutOptions = {}
) {
  const filters = options.filters || DEFAULT_DIRECT_RELATIVE_FILTERS;
  const personNodeById = new Map(graph.personNodes.map((node) => [node.id, node]));
  const pessoasById = new Map(graph.pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const index = buildRelationshipIndex(graph.relacionamentos);
  const centralPersonId = options.centralPersonId && personNodeById.has(options.centralPersonId)
    ? options.centralPersonId
    : graph.pessoas[0]?.id;
  const scopeIds = new Set<string>();

  if (!centralPersonId || !personNodeById.has(centralPersonId)) {
    return scopeIds;
  }

  const addIds = (ids: string[]) => {
    ids.forEach((id) => {
      if (personNodeById.has(id)) {
        scopeIds.add(id);
      }
    });
  };

  scopeIds.add(centralPersonId);

  const sides = groupByPaternalMaternalSide(centralPersonId, index, pessoasById);
  addIds(filters.tataravos ? sides.paternal.greatGreatGrandparents : []);
  addIds(filters.bisavos ? sides.paternal.greatGrandparents : []);
  addIds(filters.avos ? sides.paternal.grandparents : []);
  addIds(sides.paternal.parent);
  addIds(filters.tios ? sides.paternal.uncles : []);
  addIds(filters.primos ? sides.paternal.cousins : []);
  addIds(filters.tataravos ? sides.maternal.greatGreatGrandparents : []);
  addIds(filters.bisavos ? sides.maternal.greatGrandparents : []);
  addIds(filters.avos ? sides.maternal.grandparents : []);
  addIds(sides.maternal.parent);
  addIds(filters.tios ? sides.maternal.uncles : []);
  addIds(filters.primos ? sides.maternal.cousins : []);

  const allSiblings = findSiblings(centralPersonId, index, pessoasById);
  const allChildren = findChildren(centralPersonId, index, pessoasById);
  const humanChildren = allChildren.filter((id) => isHumanFamilyMember(pessoasById.get(id)));
  const petChildren = allChildren.filter((id) => isPetFamilyMember(pessoasById.get(id)));

  addIds(filters.irmaos ? allSiblings : []);
  addIds(filters.sobrinhos ? sortPersonIds(allSiblings.flatMap((id) => findChildren(id, index, pessoasById)), pessoasById) : []);
  addIds(filters.conjuge ? sortPersonIds(Array.from(index.spousesByPerson.get(centralPersonId) || []), pessoasById) : []);
  addIds(filters.filhos ? humanChildren : []);
  addIds(filters.pets ? petChildren : []);
  addIds(filters.netos ? sortPersonIds(humanChildren.flatMap((id) => findChildren(id, index, pessoasById)), pessoasById) : []);

  return scopeIds;
}

function addLegend(nodes: Node[]) {
  nodes.push({
    id: 'direct-legend',
    type: 'directFamilyLegendNode',
    data: {
      width: LEGEND_WIDTH,
      height: LEGEND_HEIGHT,
    },
    position: finitePosition(
      CENTRAL_X + CENTRAL_WIDTH / 2 - LEGEND_WIDTH / 2,
      CENTRAL_Y - LEGEND_HEIGHT - LEGEND_BOTTOM_GAP
    ),
    draggable: false,
    selectable: false,
  });
}

function getDirectFamilyViewportBounds(isMobile = false): TreeLayoutBounds {
  if (isMobile) {
    return {
      x: MOBILE_FRAME_LEFT,
      y: MOBILE_FRAME_TOP,
      width: MOBILE_FRAME_RIGHT - MOBILE_FRAME_LEFT,
      height: MOBILE_FRAME_BOTTOM - MOBILE_FRAME_TOP,
    };
  }

  return {
    x: DIRECT_FRAME_LEFT,
    y: FRAME_TOP,
    width: DIRECT_FRAME_RIGHT - DIRECT_FRAME_LEFT,
    height: DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y - FRAME_TOP,
  };
}

export function directFamilyDistributedLayout(
  graph: TreeLayoutParams,
  options: DirectFamilyLayoutOptions = {}
): TreeLayoutResult {
  const filters = options.filters || DEFAULT_DIRECT_RELATIVE_FILTERS;
  const viewportBounds = getDirectFamilyViewportBounds(options.isMobile);
  const allPersonNodeById = new Map(graph.personNodes.map((node) => [node.id, node]));
  const pessoasById = new Map(graph.pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const index = buildRelationshipIndex(graph.relacionamentos);
  const centralPersonId = options.centralPersonId && allPersonNodeById.has(options.centralPersonId)
    ? options.centralPersonId
    : graph.pessoas[0]?.id;

  if (!centralPersonId || !allPersonNodeById.has(centralPersonId)) {
    return { nodes: [], edges: [] };
  }

  const visiblePersonIds = options.visiblePersonIds;
  const personNodeById = visiblePersonIds
    ? new Map(
        graph.personNodes
          .filter((node) => node.id === centralPersonId || visiblePersonIds.has(node.id))
          .map((node) => [node.id, node])
      )
    : allPersonNodeById;

  const sides = groupByPaternalMaternalSide(centralPersonId, index, pessoasById);
  const positionedNodes: Node[] = [];
  const positionedIds = new Set<string>();

  addCentralPerson(centralPersonId, positionedNodes, positionedIds, personNodeById, options.isMobile);

  const resolveDirectGroups = (groups: GroupSpec[]) => {
    if (!options.isMobile) return resolveSideStackGroups(groups, index);

    return groups.map((group) => ({
      ...group,
      maxPerRow: group.variant === 'uncleAunt' || group.variant === 'cousin'
        ? 3
        : Math.min(group.maxPerRow, 3),
      centerX: MOBILE_DIRECT_CENTER_X,
      side: undefined,
      laneWidth: MOBILE_DIRECT_GROUP_WIDTH,
      cardWidth: MOBILE_DIRECT_CARD_WIDTH,
      cardHeight: MOBILE_DIRECT_CARD_HEIGHT,
      columnGap: MOBILE_DIRECT_COLUMN_GAP,
      rowGap: MOBILE_DIRECT_ROW_GAP,
      alignBoundary: undefined,
    }));
  };

  const paternalGroups: GroupSpec[] = resolveDirectGroups([
    { key: 'tataravos-paternos', label: 'Tataravós paternos', ids: filters.tataravos ? sides.paternal.greatGreatGrandparents : [], variant: 'greatGreatGrandparent', maxPerRow: ANCESTOR_GROUP_COLUMNS, centerX: PATERNAL_CENTER_X, side: 'paternal', laneWidth: PATERNAL_GROUP_LANE_WIDTH, cardWidth: SIDE_ANCESTOR_CARD_WIDTH, cardHeight: SIDE_ANCESTOR_CARD_HEIGHT, columnGap: ANCESTOR_COLUMN_GAP, rowGap: ANCESTOR_ROW_GAP, alignBoundary: { side: 'left', x: PATERNAL_SIDE_AREA_LEFT } },
    { key: 'bisavos-paternos', label: 'Bisavós paternos', ids: filters.bisavos ? sides.paternal.greatGrandparents : [], variant: 'greatGrandparent', maxPerRow: ANCESTOR_GROUP_COLUMNS, centerX: PATERNAL_CENTER_X, side: 'paternal', laneWidth: PATERNAL_GROUP_LANE_WIDTH, cardWidth: SIDE_ANCESTOR_CARD_WIDTH, cardHeight: SIDE_ANCESTOR_CARD_HEIGHT, columnGap: ANCESTOR_COLUMN_GAP, rowGap: ANCESTOR_ROW_GAP, alignBoundary: { side: 'left', x: PATERNAL_SIDE_AREA_LEFT } },
    { key: 'avos-paternos', label: 'Avós paternos', ids: filters.avos ? sides.paternal.grandparents : [], variant: 'grandparent', maxPerRow: ANCESTOR_GROUP_COLUMNS, centerX: PATERNAL_CENTER_X, side: 'paternal', laneWidth: PATERNAL_GROUP_LANE_WIDTH, cardWidth: SIDE_ANCESTOR_CARD_WIDTH, cardHeight: SIDE_ANCESTOR_CARD_HEIGHT, columnGap: ANCESTOR_COLUMN_GAP, rowGap: ANCESTOR_ROW_GAP, alignBoundary: { side: 'left', x: PATERNAL_SIDE_AREA_LEFT } },
    { key: 'tios-paternos', label: 'Tios paternos', ids: filters.tios ? sides.paternal.uncles : [], variant: 'uncleAunt', maxPerRow: SIDE_GROUP_COLUMNS, centerX: PATERNAL_CENTER_X, side: 'paternal', laneWidth: PATERNAL_GROUP_LANE_WIDTH, cardWidth: SIDE_COLLATERAL_CARD_WIDTH, cardHeight: SIDE_COLLATERAL_CARD_HEIGHT, columnGap: IN_GROUP_SIBLING_COLUMN_GAP, rowGap: IN_GROUP_SIBLING_ROW_GAP, alignBoundary: { side: 'left', x: PATERNAL_SIDE_AREA_LEFT } },
    { key: 'primos-paternos', label: 'Primos paternos', ids: filters.primos ? sides.paternal.cousins : [], variant: 'cousin', maxPerRow: 3, centerX: PATERNAL_CENTER_X, side: 'paternal', laneWidth: PATERNAL_GROUP_LANE_WIDTH, cardWidth: SIDE_COLLATERAL_CARD_WIDTH, cardHeight: SIDE_COLLATERAL_CARD_HEIGHT, columnGap: IN_GROUP_SIBLING_COLUMN_GAP, rowGap: IN_GROUP_SIBLING_ROW_GAP, alignBoundary: { side: 'left', x: PATERNAL_SIDE_AREA_LEFT } },
  ]);

  const maternalGroups: GroupSpec[] = resolveDirectGroups([
    { key: 'tataravos-maternos', label: 'Tataravós maternos', ids: filters.tataravos ? sides.maternal.greatGreatGrandparents : [], variant: 'greatGreatGrandparent', maxPerRow: ANCESTOR_GROUP_COLUMNS, centerX: MATERNAL_CENTER_X, side: 'maternal', laneWidth: MATERNAL_GROUP_LANE_WIDTH, cardWidth: SIDE_ANCESTOR_CARD_WIDTH, cardHeight: SIDE_ANCESTOR_CARD_HEIGHT, columnGap: ANCESTOR_COLUMN_GAP, rowGap: ANCESTOR_ROW_GAP, alignBoundary: { side: 'right', x: MATERNAL_SIDE_AREA_RIGHT } },
    { key: 'bisavos-maternos', label: 'Bisavós maternos', ids: filters.bisavos ? sides.maternal.greatGrandparents : [], variant: 'greatGrandparent', maxPerRow: ANCESTOR_GROUP_COLUMNS, centerX: MATERNAL_CENTER_X, side: 'maternal', laneWidth: MATERNAL_GROUP_LANE_WIDTH, cardWidth: SIDE_ANCESTOR_CARD_WIDTH, cardHeight: SIDE_ANCESTOR_CARD_HEIGHT, columnGap: ANCESTOR_COLUMN_GAP, rowGap: ANCESTOR_ROW_GAP, alignBoundary: { side: 'right', x: MATERNAL_SIDE_AREA_RIGHT } },
    { key: 'avos-maternos', label: 'Avós maternos', ids: filters.avos ? sides.maternal.grandparents : [], variant: 'grandparent', maxPerRow: ANCESTOR_GROUP_COLUMNS, centerX: MATERNAL_CENTER_X, side: 'maternal', laneWidth: MATERNAL_GROUP_LANE_WIDTH, cardWidth: SIDE_ANCESTOR_CARD_WIDTH, cardHeight: SIDE_ANCESTOR_CARD_HEIGHT, columnGap: ANCESTOR_COLUMN_GAP, rowGap: ANCESTOR_ROW_GAP, alignBoundary: { side: 'right', x: MATERNAL_SIDE_AREA_RIGHT } },
    { key: 'tios-maternos', label: 'Tios maternos', ids: filters.tios ? sides.maternal.uncles : [], variant: 'uncleAunt', maxPerRow: SIDE_GROUP_COLUMNS, centerX: MATERNAL_CENTER_X, side: 'maternal', laneWidth: MATERNAL_GROUP_LANE_WIDTH, cardWidth: SIDE_COLLATERAL_CARD_WIDTH, cardHeight: SIDE_COLLATERAL_CARD_HEIGHT, columnGap: IN_GROUP_SIBLING_COLUMN_GAP, rowGap: IN_GROUP_SIBLING_ROW_GAP, alignBoundary: { side: 'right', x: MATERNAL_SIDE_AREA_RIGHT } },
    { key: 'primos-maternos', label: 'Primos maternos', ids: filters.primos ? sides.maternal.cousins : [], variant: 'cousin', maxPerRow: 3, centerX: MATERNAL_CENTER_X, side: 'maternal', laneWidth: MATERNAL_GROUP_LANE_WIDTH, cardWidth: SIDE_COLLATERAL_CARD_WIDTH, cardHeight: SIDE_COLLATERAL_CARD_HEIGHT, columnGap: IN_GROUP_SIBLING_COLUMN_GAP, rowGap: IN_GROUP_SIBLING_ROW_GAP, alignBoundary: { side: 'right', x: MATERNAL_SIDE_AREA_RIGHT } },
  ]);

  const visiblePaternalGroups = paternalGroups
    .map((group) => ({
      ...group,
      ids: group.ids.filter((id) => !positionedIds.has(id) && personNodeById.has(id)),
    }))
    .filter((group) => group.ids.length > 0);
  const visibleMaternalGroups = maternalGroups
    .map((group) => ({
      ...group,
      ids: group.ids.filter((id) => !positionedIds.has(id) && personNodeById.has(id)),
    }))
    .filter((group) => group.ids.length > 0);
  if (!options.isMobile) {
    const paternalSideMaxScale = resolveAdaptiveSideStackMaxScale(visiblePaternalGroups, index);
    const maternalSideMaxScale = resolveAdaptiveSideStackMaxScale(visibleMaternalGroups, index);
    const sideMaxScales = [paternalSideMaxScale, maternalSideMaxScale]
      .filter((scale): scale is number => typeof scale === 'number' && Number.isFinite(scale));
    const sharedSideMaxScale = sideMaxScales.length > 1
      ? Math.min(...sideMaxScales)
      : sideMaxScales[0] ?? SIDE_COLLATERAL_CARD_MAX_SCALE;

    placeGroupStackPlan(
      resolveAdaptiveSideStackPlan(visiblePaternalGroups, index, sharedSideMaxScale),
      positionedNodes,
      positionedIds,
      personNodeById,
      index
    );
    placeGroupStackPlan(
      resolveAdaptiveSideStackPlan(visibleMaternalGroups, index, sharedSideMaxScale),
      positionedNodes,
      positionedIds,
      personNodeById,
      index
    );
  }

  const motherGroup: GroupSpec = {
    key: 'mae',
    label: 'MÃE',
    ids: sides.maternal.parent,
    variant: 'parent',
    maxPerRow: 1,
    centerX: options.isMobile
      ? MOBILE_DIRECT_CENTER_X + MOBILE_DIRECT_PARENT_CENTER_GAP / 2
      : MOTHER_GROUP_CENTER_X,
    laneWidth: (options.isMobile ? MOBILE_PARENT_CARD_WIDTH : SIDE_PARENT_CARD_WIDTH) + GROUP_BOX_PADDING_X * 2,
    cardWidth: options.isMobile ? MOBILE_PARENT_CARD_WIDTH : SIDE_PARENT_CARD_WIDTH,
    cardHeight: options.isMobile ? MOBILE_PARENT_CARD_HEIGHT : SIDE_PARENT_CARD_HEIGHT,
    columnGap: SIDE_COLUMN_GAP,
    rowGap: SIDE_ROW_GAP,
  };
  const fatherGroup: GroupSpec = {
    key: 'pai',
    label: 'PAI',
    ids: sides.paternal.parent,
    variant: 'parent',
    maxPerRow: 1,
    centerX: options.isMobile
      ? MOBILE_DIRECT_CENTER_X - MOBILE_DIRECT_PARENT_CENTER_GAP / 2
      : FATHER_GROUP_CENTER_X,
    laneWidth: (options.isMobile ? MOBILE_PARENT_CARD_WIDTH : SIDE_PARENT_CARD_WIDTH) + GROUP_BOX_PADDING_X * 2,
    cardWidth: options.isMobile ? MOBILE_PARENT_CARD_WIDTH : SIDE_PARENT_CARD_WIDTH,
    cardHeight: options.isMobile ? MOBILE_PARENT_CARD_HEIGHT : SIDE_PARENT_CARD_HEIGHT,
    columnGap: SIDE_COLUMN_GAP,
    rowGap: SIDE_ROW_GAP,
  };

  const parentGroupY = options.isMobile ? MOBILE_DIRECT_PARENT_Y : CENTRAL_PARENT_GROUP_Y;
  placeGroup(motherGroup, parentGroupY, positionedNodes, positionedIds, personNodeById, index);
  placeGroup(fatherGroup, parentGroupY, positionedNodes, positionedIds, personNodeById, index);

  let mobileLowerGroupY = MOBILE_DIRECT_LOWER_Y;

  if (options.isMobile) {
    const centralNode = findPositionedNode(positionedNodes, centralPersonId);
    const centralDimensions = centralNode
      ? getPositionedNodeDimensions(centralNode)
      : { width: 320, height: 410 };
    let nextGroupY = (centralNode?.position.y ?? MOBILE_DIRECT_CENTRAL_Y)
      + centralDimensions.height
      + MOBILE_DIRECT_STACK_GAP;

    visiblePaternalGroups.forEach((group) => {
      placeGroup(group, nextGroupY, positionedNodes, positionedIds, personNodeById, index);
      const columns = resolveGroupColumns(group, group.ids, index);
      nextGroupY += groupHeight(group.ids, columns, index, group) + MOBILE_DIRECT_STACK_GAP;
    });

    visibleMaternalGroups.forEach((group) => {
      placeGroup(group, nextGroupY, positionedNodes, positionedIds, personNodeById, index);
      const columns = resolveGroupColumns(group, group.ids, index);
      nextGroupY += groupHeight(group.ids, columns, index, group) + MOBILE_DIRECT_STACK_GAP;
    });

    mobileLowerGroupY = nextGroupY;
  }

  const allSiblings = findSiblings(centralPersonId, index, pessoasById);
  const siblings = filters.irmaos ? allSiblings : [];
  const spouses = filters.conjuge ? sortPersonIds(Array.from(index.spousesByPerson.get(centralPersonId) || []), pessoasById) : [];
  const allChildren = findChildren(centralPersonId, index, pessoasById);
  const humanChildren = allChildren.filter((id) => isHumanFamilyMember(pessoasById.get(id)));
  const petChildren = allChildren.filter((id) => isPetFamilyMember(pessoasById.get(id)));
  const children = filters.filhos ? humanChildren : [];
  const pets = filters.pets ? petChildren : [];
  const grandchildren = filters.netos ? sortPersonIds(humanChildren.flatMap((id) => findChildren(id, index, pessoasById)), pessoasById) : [];
  const nephews = filters.sobrinhos ? sortPersonIds(allSiblings.flatMap((id) => findChildren(id, index, pessoasById)), pessoasById) : [];
  const lowerLaneWidth = options.isMobile ? MOBILE_LOWER_LANE_WIDTH : LOWER_LANE_WIDTH;
  const lowerCardWidth = options.isMobile ? MOBILE_LOWER_CARD_WIDTH : LOWER_CARD_WIDTH;
  const lowerCardHeight = options.isMobile ? MOBILE_LOWER_CARD_HEIGHT : LOWER_CARD_HEIGHT;
  const lowerSplitCardWidth = options.isMobile ? MOBILE_LOWER_SPLIT_CARD_WIDTH : 360;
  const lowerSplitLaneWidth = options.isMobile
    ? Math.max(260, lowerLaneWidth / 2 - LOWER_GROUP_GAP)
    : Math.max(380, lowerLaneWidth / 2 - LOWER_GROUP_GAP);
  const hasChildrenAndPets = children.length > 0 && pets.length > 0;
  const lowerLeftGroupCenterX = options.isMobile ? MOBILE_LOWER_LEFT_GROUP_CENTER_X : LOWER_LEFT_GROUP_CENTER_X;
  const lowerRightGroupCenterX = options.isMobile
    ? MOBILE_LOWER_RIGHT_GROUP_CENTER_X
    : LOWER_RIGHT_GROUP_CENTER_X + LOWER_RIGHT_GROUP_SHIFT_X;
  const lowerGroupY = options.isMobile ? mobileLowerGroupY : LOWER_GROUP_Y;
  const childrenPetsLeftCenterX = hasChildrenAndPets
    ? lowerRightGroupCenterX - lowerLaneWidth / 4
    : lowerRightGroupCenterX;
  const childrenPetsRightCenterX = hasChildrenAndPets
    ? lowerRightGroupCenterX + lowerLaneWidth / 4
    : lowerRightGroupCenterX;

  const siblingGroup: GroupSpec = {
    key: 'irmaos',
    label: 'Irmãos',
    ids: siblings,
    variant: 'sibling',
    maxPerRow: options.isMobile ? 1 : 2,
    centerX: lowerLeftGroupCenterX,
    laneWidth: lowerLaneWidth, cardWidth: lowerCardWidth, cardHeight: lowerCardHeight, columnGap: IN_GROUP_SIBLING_COLUMN_GAP, rowGap: IN_GROUP_SIBLING_ROW_GAP,
  };
  const nephewGroup: GroupSpec = {
    key: 'sobrinhos',
    label: 'Sobrinhos',
    ids: nephews,
    variant: 'nephewNiece',
    maxPerRow: 3,
    centerX: lowerLeftGroupCenterX,
    laneWidth: lowerLaneWidth, cardWidth: lowerCardWidth, cardHeight: lowerCardHeight, columnGap: IN_GROUP_SIBLING_COLUMN_GAP, rowGap: IN_GROUP_SIBLING_ROW_GAP,
  };
  const spouseGroup: GroupSpec = {
    key: 'conjuge',
    label: 'Cônjuge',
    ids: spouses,
    variant: 'spouse',
    maxPerRow: 1,
    centerX: lowerRightGroupCenterX,
    laneWidth: lowerLaneWidth, cardWidth: lowerCardWidth, cardHeight: lowerCardHeight, columnGap: SIDE_COLUMN_GAP, rowGap: SIDE_ROW_GAP,
  };
  const childrenGroup: GroupSpec = {
    key: 'filhos',
    label: 'Filhos',
    ids: children,
    variant: 'child',
    maxPerRow: 2,
    centerX: childrenPetsLeftCenterX,
    laneWidth: lowerSplitLaneWidth, cardWidth: lowerSplitCardWidth, cardHeight: lowerCardHeight, columnGap: SIDE_COLUMN_GAP, rowGap: SIDE_ROW_GAP,
  };
  const petGroup: GroupSpec = {
    key: 'pets',
    label: 'Pets',
    ids: pets,
    variant: 'pet',
    maxPerRow: 2,
    centerX: children.length > 0 ? childrenPetsRightCenterX : lowerRightGroupCenterX,
    laneWidth: lowerSplitLaneWidth, cardWidth: lowerSplitCardWidth, cardHeight: lowerCardHeight, columnGap: SIDE_COLUMN_GAP, rowGap: SIDE_ROW_GAP,
  };
  const grandchildrenGroup: GroupSpec = {
    key: 'netos',
    label: 'Netos',
    ids: grandchildren,
    variant: 'grandchild',
    maxPerRow: 2,
    centerX: children.length > 0 ? childrenPetsLeftCenterX : lowerRightGroupCenterX,
    laneWidth: lowerSplitLaneWidth, cardWidth: lowerSplitCardWidth, cardHeight: LOWER_CARD_HEIGHT, columnGap: IN_GROUP_SIBLING_COLUMN_GAP, rowGap: IN_GROUP_SIBLING_ROW_GAP,
  };

  const leftLowerPositions = compactLowerGroupTopPositions(
    [siblingGroup, nephewGroup],
    lowerGroupY,
    CENTRAL_LOWER_STACK_GAP,
    index
  );

  const spouseColumns = resolveGroupColumns(spouseGroup, spouseGroup.ids, index);
  const spouseHeight = visibleGroupHeight(spouseGroup.ids, spouseColumns, index, spouseGroup);
  const childrenColumns = resolveGroupColumns(childrenGroup, childrenGroup.ids, index);
  const childrenHeight = visibleGroupHeight(childrenGroup.ids, childrenColumns, index, childrenGroup);
  const splitTopY = spouses.length > 0
    ? lowerGroupY + spouseHeight + CENTRAL_LOWER_STACK_GAP
    : lowerGroupY;
  const grandchildrenTopY = children.length > 0
    ? splitTopY + childrenHeight + CENTRAL_LOWER_STACK_GAP
    : splitTopY;

  placeGroup(siblingGroup, leftLowerPositions.get(siblingGroup.key) ?? lowerGroupY, positionedNodes, positionedIds, personNodeById, index);
  placeGroup(nephewGroup, leftLowerPositions.get(nephewGroup.key) ?? lowerGroupY, positionedNodes, positionedIds, personNodeById, index);
  placeGroup(spouseGroup, lowerGroupY, positionedNodes, positionedIds, personNodeById, index);
  placeGroup(childrenGroup, splitTopY, positionedNodes, positionedIds, personNodeById, index);
  placeGroup(petGroup, splitTopY, positionedNodes, positionedIds, personNodeById, index);
  placeGroup(grandchildrenGroup, grandchildrenTopY, positionedNodes, positionedIds, personNodeById, index);

  const groupBoundsByKey = new Map<string, GroupBoxBounds>();
  [
    'tataravos-paternos',
    'bisavos-paternos',
    'avos-paternos',
    'pai',
    'tios-paternos',
    'primos-paternos',
    'tataravos-maternos',
    'bisavos-maternos',
    'avos-maternos',
    'mae',
    'tios-maternos',
    'primos-maternos',
    'irmaos',
    'sobrinhos',
    'conjuge',
    'filhos',
    'pets',
    'netos',
  ].forEach((key) => {
    const bounds = getGroupBoxBounds(positionedNodes, key);
    if (!bounds) return;
    groupBoundsByKey.set(key, bounds);
    addGroupBoundaryAnchors(positionedNodes, positionedIds, key, bounds);
  });

  const fatherGroupBounds = groupBoundsByKey.get('pai');
  const motherGroupBounds = groupBoundsByKey.get('mae');
  const paternalUnclesGroupBounds = groupBoundsByKey.get('tios-paternos');
  const maternalUnclesGroupBounds = groupBoundsByKey.get('tios-maternos');
  const siblingsGroupBounds = groupBoundsByKey.get('irmaos');
  const spouseGroupBounds = groupBoundsByKey.get('conjuge');
  const childrenGroupBounds = groupBoundsByKey.get('filhos');
  const petsGroupBounds = groupBoundsByKey.get('pets');
  const centralNode = findPositionedNode(positionedNodes, centralPersonId);
  const centralDimensions = centralNode ? getPositionedNodeDimensions(centralNode) : { width: CENTRAL_WIDTH, height: CENTRAL_HEIGHT };
  const centralTopY = centralNode?.position.y ?? CENTRAL_Y;
  const centralBottomY = centralNode ? centralNode.position.y + centralDimensions.height : CENTRAL_Y + CENTRAL_HEIGHT;
  const lowerGroupTopY = Math.min(
    siblingsGroupBounds?.minY ?? Number.POSITIVE_INFINITY,
    spouseGroupBounds?.minY ?? Number.POSITIVE_INFINITY
  );
  const lowerConnectionElbowY = Number.isFinite(lowerGroupTopY)
    ? Math.min(centralBottomY + 34, lowerGroupTopY - 4)
    : centralBottomY + 34;

  if (fatherGroupBounds && motherGroupBounds) {
    const parentCoupleMidX = (fatherGroupBounds.maxX + motherGroupBounds.minX) / 2;
    const parentCoupleMidY = options.isMobile
      ? Math.min(fatherGroupBounds.centerY, motherGroupBounds.centerY) - 4
      : (fatherGroupBounds.centerY + motherGroupBounds.centerY) / 2;
    addAnchor(positionedNodes, positionedIds, 'direct-parent-couple-mid-anchor', parentCoupleMidX, parentCoupleMidY);
    if (isDirectLineVisible('spouse', options.edgeFilters)) {
      addMarriageNode(
        positionedNodes,
        positionedIds,
        'direct-parent-marriage-node',
        parentCoupleMidX,
        parentCoupleMidY,
        options.isMobile ? 36 : MARRIAGE_NODE_SIZE
      );
    }
    addAnchor(positionedNodes, positionedIds, 'direct-central-top-anchor', VIEW_CENTER_X, centralTopY);
  } else if (fatherGroupBounds || motherGroupBounds) {
    const singleParentBounds = fatherGroupBounds || motherGroupBounds;
    if (singleParentBounds) {
      addAnchor(positionedNodes, positionedIds, 'direct-single-parent-bottom-anchor', singleParentBounds.centerX, singleParentBounds.maxY);
      addAnchor(positionedNodes, positionedIds, 'direct-central-top-anchor', VIEW_CENTER_X, centralTopY);
    }
  }

  if (siblingsGroupBounds || spouseGroupBounds || childrenGroupBounds || petsGroupBounds) {
    addAnchor(positionedNodes, positionedIds, 'direct-center-bottom-anchor', VIEW_CENTER_X, centralBottomY);
  }

  if (siblingsGroupBounds) {
    addAnchor(positionedNodes, positionedIds, 'direct-siblings-group-top-anchor', siblingsGroupBounds.centerX, siblingsGroupBounds.minY);
  }

  if (spouseGroupBounds) {
    addAnchor(positionedNodes, positionedIds, 'direct-spouse-group-top-anchor', spouseGroupBounds.centerX, spouseGroupBounds.minY);
  }

  if (spouseGroupBounds && childrenGroupBounds) {
    const splitAnchorX = childrenGroupBounds && petsGroupBounds
      ? spouseGroupBounds.centerX
      : (childrenGroupBounds || petsGroupBounds)?.centerX ?? spouseGroupBounds.centerX;
    addAnchor(
      positionedNodes,
      positionedIds,
      'direct-children-pets-split-anchor',
      splitAnchorX,
      spouseGroupBounds.maxY + 34
    );
  }


  const { edges, addEdge } = createEdgeBuilder(positionedIds);

  if (fatherGroupBounds && motherGroupBounds) {
    addDirectStructuralEdge(
      addEdge,
      'direct-father-to-parent-mid',
      'direct-group-pai-right-anchor',
      'direct-parent-couple-mid-anchor',
      'directHorizontal',
      {
        sourceHandle: 'right',
        targetHandle: 'left',
        lineGroup: 'spouse',
        edgeFilters: options.edgeFilters,
        visualLineFilters: options.visualLineFilters,
      }
    );
    addDirectStructuralEdge(
      addEdge,
      'direct-parent-mid-to-mother',
      'direct-parent-couple-mid-anchor',
      'direct-group-mae-left-anchor',
      'directHorizontal',
      {
        sourceHandle: 'right',
        targetHandle: 'left',
        lineGroup: 'spouse',
        edgeFilters: options.edgeFilters,
        visualLineFilters: options.visualLineFilters,
      }
    );
    addDirectStructuralEdge(
      addEdge,
      'direct-parent-mid-to-central-top',
      'direct-parent-couple-mid-anchor',
      'direct-central-top-anchor',
      'directElbowFromCenter',
      {
        sourceHandle: 'bottom',
        targetHandle: 'top',
        elbowY: centralTopY - 22,
        lineGroup: 'parentChild',
        edgeFilters: options.edgeFilters,
        visualLineFilters: options.visualLineFilters,
      }
    );
  } else if (fatherGroupBounds || motherGroupBounds) {
    addDirectStructuralEdge(
      addEdge,
      'direct-single-parent-to-central-top',
      'direct-single-parent-bottom-anchor',
      'direct-central-top-anchor',
      'directElbowFromCenter',
      {
        sourceHandle: 'bottom',
        targetHandle: 'top',
        elbowY: centralTopY - 22,
        lineGroup: 'parentChild',
        edgeFilters: options.edgeFilters,
        visualLineFilters: options.visualLineFilters,
      }
    );
  }

  if (fatherGroupBounds && paternalUnclesGroupBounds) {
    addDirectStructuralEdge(
      addEdge,
      'direct-father-to-paternal-uncles',
      options.isMobile ? 'direct-group-pai-bottom-anchor' : 'direct-group-pai-left-anchor',
      options.isMobile ? 'direct-group-tios-paternos-top-anchor' : 'direct-group-tios-paternos-right-anchor',
      options.isMobile ? 'directElbowFromCenter' : 'directSideElbow',
      options.isMobile ? {
        sourceHandle: 'bottom',
        targetHandle: 'top',
        elbowY: (fatherGroupBounds.maxY + paternalUnclesGroupBounds.minY) / 2,
        lineGroup: 'sibling',
        edgeFilters: options.edgeFilters,
        visualLineFilters: options.visualLineFilters,
      } : {
        sourceHandle: 'left',
        targetHandle: 'right',
        elbowX: (paternalUnclesGroupBounds.maxX + fatherGroupBounds.minX) / 2,
        lineGroup: 'sibling',
        edgeFilters: options.edgeFilters,
        visualLineFilters: options.visualLineFilters,
      }
    );
  }

  if (motherGroupBounds && maternalUnclesGroupBounds) {
    addDirectStructuralEdge(
      addEdge,
      'direct-mother-to-maternal-uncles',
      options.isMobile ? 'direct-group-mae-bottom-anchor' : 'direct-group-mae-right-anchor',
      options.isMobile ? 'direct-group-tios-maternos-top-anchor' : 'direct-group-tios-maternos-left-anchor',
      options.isMobile ? 'directElbowFromCenter' : 'directSideElbow',
      options.isMobile ? {
        sourceHandle: 'bottom',
        targetHandle: 'top',
        elbowY: (motherGroupBounds.maxY + maternalUnclesGroupBounds.minY) / 2,
        lineGroup: 'sibling',
        edgeFilters: options.edgeFilters,
        visualLineFilters: options.visualLineFilters,
      } : {
        sourceHandle: 'right',
        targetHandle: 'left',
        elbowX: (motherGroupBounds.maxX + maternalUnclesGroupBounds.minX) / 2,
        lineGroup: 'sibling',
        edgeFilters: options.edgeFilters,
        visualLineFilters: options.visualLineFilters,
      }
    );
  }

  if (siblingsGroupBounds) {
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
        lineGroup: 'sibling',
        edgeFilters: options.edgeFilters,
        visualLineFilters: options.visualLineFilters,
      }
    );
  }

  if (spouseGroupBounds) {
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
        lineGroup: 'spouse',
        edgeFilters: options.edgeFilters,
        visualLineFilters: options.visualLineFilters,
      }
    );
  }

  addConsecutiveGroupConnections(
    addEdge,
    ['tataravos-paternos', 'bisavos-paternos', 'avos-paternos', 'tios-paternos', 'primos-paternos'],
    groupBoundsByKey,
    {
      lineGroup: 'parentChild',
      edgeFilters: options.edgeFilters,
      visualLineFilters: options.visualLineFilters,
    }
  );
  addConsecutiveGroupConnections(
    addEdge,
    ['tataravos-maternos', 'bisavos-maternos', 'avos-maternos', 'tios-maternos', 'primos-maternos'],
    groupBoundsByKey,
    {
      lineGroup: 'parentChild',
      edgeFilters: options.edgeFilters,
      visualLineFilters: options.visualLineFilters,
    }
  );
  addConsecutiveGroupConnections(addEdge, ['irmaos', 'sobrinhos'], groupBoundsByKey, {
    lineGroup: 'parentChild',
    edgeFilters: options.edgeFilters,
    visualLineFilters: options.visualLineFilters,
  });

  if (spouseGroupBounds && childrenGroupBounds) {
    addDirectStructuralEdge(
      addEdge,
      'direct-spouse-to-children-pets-split',
      'direct-group-conjuge-bottom-anchor',
      'direct-children-pets-split-anchor',
      'directHorizontal',
      {
        sourceHandle: 'bottom',
        targetHandle: 'top',
        lineGroup: 'parentChild',
        edgeFilters: options.edgeFilters,
        visualLineFilters: options.visualLineFilters,
      }
    );

    if (childrenGroupBounds) {
      addDirectStructuralEdge(
        addEdge,
        'direct-children-pets-split-to-children',
        'direct-children-pets-split-anchor',
        'direct-group-filhos-top-anchor',
        'directElbowFromCenter',
        {
          sourceHandle: 'bottom',
          targetHandle: 'top',
          elbowY: spouseGroupBounds.maxY + 56,
          lineGroup: 'parentChild',
          edgeFilters: options.edgeFilters,
          visualLineFilters: options.visualLineFilters,
        }
      );
    }

    if (petsGroupBounds) {
      addDirectStructuralEdge(
        addEdge,
        'direct-children-pets-split-to-pets',
        'direct-children-pets-split-anchor',
        'direct-group-pets-top-anchor',
        'directElbowFromCenter',
        {
          sourceHandle: 'bottom',
          targetHandle: 'top',
          elbowY: spouseGroupBounds.maxY + 56,
          lineGroup: 'parentChild',
          edgeFilters: options.edgeFilters,
          visualLineFilters: options.visualLineFilters,
        }
      );
    }
  } else if (spouseGroupBounds && petsGroupBounds) {
    addDirectStructuralEdge(
      addEdge,
      'direct-spouse-to-pets-group',
      'direct-group-conjuge-bottom-anchor',
      'direct-group-pets-top-anchor',
      'directElbowFromCenter',
      {
        sourceHandle: 'bottom',
        targetHandle: 'top',
        elbowY: spouseGroupBounds.maxY + 56,
        lineGroup: 'parentChild',
        edgeFilters: options.edgeFilters,
        visualLineFilters: options.visualLineFilters,
      }
    );
  } else {
    if (childrenGroupBounds) {
      addDirectStructuralEdge(
        addEdge,
        'direct-central-to-children-group',
        'direct-center-bottom-anchor',
        'direct-group-filhos-top-anchor',
        'directElbowFromCenter',
        {
          sourceHandle: 'bottom',
          targetHandle: 'top',
          elbowY: lowerConnectionElbowY,
          lineGroup: 'parentChild',
          edgeFilters: options.edgeFilters,
          visualLineFilters: options.visualLineFilters,
        }
      );
    }

    if (petsGroupBounds) {
      addDirectStructuralEdge(
        addEdge,
        'direct-central-to-pets-group',
        'direct-center-bottom-anchor',
        'direct-group-pets-top-anchor',
        'directElbowFromCenter',
        {
          sourceHandle: 'bottom',
          targetHandle: 'top',
          elbowY: lowerConnectionElbowY,
          lineGroup: 'parentChild',
          edgeFilters: options.edgeFilters,
          visualLineFilters: options.visualLineFilters,
        }
      );
    }
  }

  addConsecutiveGroupConnections(addEdge, ['filhos', 'netos'], groupBoundsByKey, {
    lineGroup: 'parentChild',
    edgeFilters: options.edgeFilters,
    visualLineFilters: options.visualLineFilters,
  });

  addInGroupSiblingEdges(
    addEdge,
    positionedNodes,
    groupBoundsByKey,
    [
      'tios-paternos',
      'tios-maternos',
      'irmaos',
      'sobrinhos',
      'netos',
    ],
    {
      edgeFilters: options.edgeFilters,
      visualLineFilters: options.visualLineFilters,
    }
  );

  addCousinGroupGridEdges(
    addEdge,
    positionedNodes,
    groupBoundsByKey,
    ['primos-paternos', 'primos-maternos'],
    index,
    {
      edgeFilters: options.edgeFilters,
      visualLineFilters: options.visualLineFilters,
    }
  );

  const spouseLineOptions = {
    edgeFilters: options.edgeFilters,
    visualLineFilters: options.visualLineFilters,
  };
  addAncestorSpouseEdges(addEdge, sides.paternal.greatGreatGrandparents, positionedNodes, positionedIds, index, spouseLineOptions);
  addAncestorSpouseEdges(addEdge, sides.maternal.greatGreatGrandparents, positionedNodes, positionedIds, index, spouseLineOptions);
  addAncestorSpouseEdges(addEdge, sides.paternal.greatGrandparents, positionedNodes, positionedIds, index, spouseLineOptions);
  addAncestorSpouseEdges(addEdge, sides.maternal.greatGrandparents, positionedNodes, positionedIds, index, spouseLineOptions);
  addAncestorSpouseEdges(addEdge, sides.paternal.grandparents, positionedNodes, positionedIds, index, spouseLineOptions);
  addAncestorSpouseEdges(addEdge, sides.maternal.grandparents, positionedNodes, positionedIds, index, spouseLineOptions);

  const renderedPersonBounds = options.isMobile
    ? getVisiblePersonNodeBounds(positionedNodes)
    : null;
  const mobileViewportBounds = renderedPersonBounds
    ? {
      x: renderedPersonBounds.x - MOBILE_DIRECT_BOUNDS_PADDING_X,
      y: renderedPersonBounds.y - MOBILE_DIRECT_BOUNDS_PADDING_TOP,
      width: renderedPersonBounds.width + MOBILE_DIRECT_BOUNDS_PADDING_X * 2,
      height:
        renderedPersonBounds.height
        + MOBILE_DIRECT_BOUNDS_PADDING_TOP
        + MOBILE_DIRECT_BOUNDS_PADDING_BOTTOM,
    }
    : viewportBounds;

  return {
    nodes: positionedNodes,
    edges,
    viewportBounds: options.isMobile ? mobileViewportBounds : viewportBounds,
    translateBounds: options.isMobile ? mobileViewportBounds : viewportBounds,
  };
}
