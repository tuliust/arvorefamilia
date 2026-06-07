import { Edge, Node } from 'reactflow';
import { Pessoa, Relacionamento } from '../../types';

export interface EdgeFilters {
  conjugal: boolean;
  filiacao_sangue: boolean;
  filiacao_adotiva: boolean;
  irmaos: boolean;
}

export type VisualLineFilterKey =
  | 'spouseHighlight'
  | 'parentChildHighlight'
  | 'siblingHighlight';

export type VisualLineFilters = Record<VisualLineFilterKey, boolean>;

export type DirectRelativeGroup =
  | 'pais'
  | 'avos'
  | 'bisavos'
  | 'tataravos'
  | 'conjuge'
  | 'filhos'
  | 'netos'
  | 'irmaos'
  | 'sobrinhos'
  | 'tios'
  | 'primos'
  | 'pets';

export type DirectRelativeFilters = Record<DirectRelativeGroup, boolean>;

export type GenealogyFilterKey =
  | 'generation1'
  | 'generation2'
  | 'generation3Family'
  | 'generation3Spouses'
  | 'generation4Family'
  | 'generation4Spouses'
  | 'generation5Family'
  | 'generation5Spouses'
  | 'generation6';

export type GenealogyFilters = Record<GenealogyFilterKey, boolean>;

export interface MarriageNodeDetails {
  id?: string;
  marriageKey: string;
  person1Id: string;
  person2Id: string;
  person1?: Pessoa;
  person2?: Pessoa;
  relationship?: Relacionamento;
}

export interface PersonNodeContextActions {
  onView?: (pessoa: Pessoa) => void;
  onEdit?: (pessoa: Pessoa) => void;
  onAddConnection?: (pessoa: Pessoa) => void;
  onRemove?: (pessoa: Pessoa) => void;
}

export type DirectRelationVariant =
  | 'central'
  | 'parent'
  | 'sibling'
  | 'grandparent'
  | 'greatGrandparent'
  | 'greatGreatGrandparent'
  | 'uncleAunt'
  | 'cousin'
  | 'nephewNiece'
  | 'spouse'
  | 'child'
  | 'grandchild'
  | 'pet';

export interface FamilyTreeBuildParams extends PersonNodeContextActions {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  onPersonClick?: (pessoa: Pessoa) => void;
  onMarriageClick?: (details: MarriageNodeDetails) => void;
  selectedPersonId?: string;
  edgeFilters?: EdgeFilters;
}

export interface TreeLayoutParams {
  personNodes: Node[];
  marriageNodes: Node[];
  edges: Edge[];
  marriageMap: Map<string, string>;
  childrenByMarriage: Map<string, string[]>;
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  childParentsMap: Map<string, Set<string>>;
}

export interface TreeGraphBuildResult extends TreeLayoutParams {
  nodes: Node[];
}

export interface TreeLayoutResult {
  nodes: Node[];
  edges: Edge[];
  viewportBounds?: TreeLayoutBounds;
  translateBounds?: TreeLayoutBounds;
}

export interface TreeLayoutBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutConstants {
  NODE_WIDTH: number;
  NODE_HEIGHT: number;
  MARRIAGE_NODE_WIDTH: number;
  HORIZONTAL_GAP_BETWEEN_SPOUSES: number;
  HORIZONTAL_GAP_TO_CHILDREN: number;
  INITIAL_X: number;
  INITIAL_Y: number;
}

export interface PlacementUnit {
  key: string;
  memberIds: string[];
  marriageNodeId?: string;
  primaryPersonId: string;
  parentKey: string;
  anchorY: number;
  blockHeight: number;
}

export interface FamilyBlock {
  key: string;
  memberIds: string[];
  marriageNodeId?: string;
  column: number;
  anchorKey: string;
  anchorY: number;
  sortValue: number;
}

export interface PersonNodeData extends PersonNodeContextActions {
  pessoa: Pessoa;
  onClick?: (pessoa: Pessoa) => void;
  isSelected?: boolean;
  isCentralPerson?: boolean;
  directRelation?: DirectRelationVariant;
  useDirectRelationStyleForPet?: boolean;
  useCentralDirectLayout?: boolean;
  useCentralFocusPanel?: boolean;
  layoutWidth?: number;
  layoutHeight?: number;
  isMobile?: boolean;
}

export interface MarriageNodeData {
  emoji?: string;
  details?: MarriageNodeDetails;
  onClickMarriage?: (details: MarriageNodeDetails) => void;
}

export const DEFAULT_EDGE_FILTERS: EdgeFilters = {
  conjugal: true,
  filiacao_sangue: true,
  filiacao_adotiva: true,
  irmaos: true,
};

export const DEFAULT_VISUAL_LINE_FILTERS: VisualLineFilters = {
  spouseHighlight: false,
  parentChildHighlight: false,
  siblingHighlight: false,
};

export const DEFAULT_DIRECT_RELATIVE_FILTERS: DirectRelativeFilters = {
  pais: true,
  avos: true,
  bisavos: true,
  tataravos: true,
  conjuge: true,
  filhos: true,
  netos: true,
  irmaos: true,
  sobrinhos: true,
  tios: true,
  primos: true,
  pets: true,
};

export const DEFAULT_GENEALOGY_FILTERS: GenealogyFilters = {
  generation1: true,
  generation2: true,
  generation3Family: true,
  generation3Spouses: true,
  generation4Family: true,
  generation4Spouses: true,
  generation5Family: true,
  generation5Spouses: true,
  generation6: true,
};

export const TREE_CONSTANTS: LayoutConstants = {
  NODE_WIDTH: 380,
  NODE_HEIGHT: 142,
  MARRIAGE_NODE_WIDTH: 28,
  HORIZONTAL_GAP_BETWEEN_SPOUSES: 76,
  HORIZONTAL_GAP_TO_CHILDREN: 100,
  INITIAL_X: 100,
  INITIAL_Y: 100,
};

export function getSortableBirthValue(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return Number.POSITIVE_INFINITY;

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
  }

  const normalizedValue = String(value).trim();
  if (!normalizedValue) return Number.POSITIVE_INFINITY;

  const timestamp = Date.parse(normalizedValue);
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

export function isLeftSidePerson(pessoa?: Pessoa) {
  return (pessoa?.lado || 'esquerda') === 'esquerda';
}
