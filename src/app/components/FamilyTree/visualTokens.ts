export const FAMILY_TREE_COLORS = {
  CARD_BORDER_ALIVE: '#66745B',
  CARD_BORDER_DECEASED: '#A9825A',
  CARD_BORDER_PET: '#A85F45',
  EDGE_SPOUSE: '#A85F45',
  EDGE_CHILD: '#CBBDA6',
  EDGE_SIBLING: '#CBBDA6',
  EDGE_MUTED: '#D8CBB7',
  PAPER_BACKGROUND: '#F4EFE6',
  PAPER_SURFACE: '#FBF8F1',
  PAPER_MUTED: '#E7D8BF',
  TEXT_PRIMARY: '#2F2A25',
  TEXT_SECONDARY: '#5B4636',
  TERRACOTTA: '#A85F45',
  OLIVE: '#66745B',
  BEIGE_BORDER: '#CBBDA6',
} as const;

export const DIRECT_FAMILY_TOKENS = {
  CARD_WIDTH: 410,
  CARD_HEIGHT: 190,
  CENTRAL_WIDTH: 620,
  CENTRAL_HEIGHT: 680,
  AVATAR_SIZE: 72,
  CENTRAL_AVATAR_SIZE: 336,
  EDGE_STROKE: '#CBBDA6',
  EDGE_STROKE_WIDTH: 1.4,
  EDGE_OPACITY: 0.58,
  SPOUSE_EDGE_STROKE_WIDTH: 1.5,
  DESKTOP_ZOOM: 0.9,
  MOBILE_ZOOM: 0.34,
} as const;

export const DIRECT_RELATION_STYLES = {
  central: {
    label: 'Pessoa central',
    background: '#FBF8F1',
    border: '#A85F45',
    color: '#2F2A25',
    muted: '#5B4636',
  },
  parent: {
    label: 'Pais, irmãos e filhos',
    background: '#FBF8F1',
    border: '#CBBDA6',
    color: '#2F2A25',
    muted: '#5B4636',
  },
  sibling: {
    label: 'Irmãos',
    background: '#FBF8F1',
    border: '#CBBDA6',
    color: '#2F2A25',
    muted: '#5B4636',
  },
  child: {
    label: 'Filhos',
    background: '#FBF8F1',
    border: '#CBBDA6',
    color: '#2F2A25',
    muted: '#5B4636',
  },
  spouse: {
    label: 'Cônjuge',
    background: '#F4EFE6',
    border: '#A85F45',
    color: '#2F2A25',
    muted: '#5B4636',
  },
  grandparent: {
    label: 'Avós',
    background: '#F4EFE6',
    border: '#A9825A',
    color: '#2F2A25',
    muted: '#5B4636',
  },
  greatGrandparent: {
    label: 'Bisavós',
    background: '#E7D8BF',
    border: '#A9825A',
    color: '#2F2A25',
    muted: '#5B4636',
  },
  greatGreatGrandparent: {
    label: 'Tataravós e tios',
    background: '#E7D8BF',
    border: '#5B4636',
    color: '#2F2A25',
    muted: '#5B4636',
  },
  uncleAunt: {
    label: 'Tios',
    background: '#F4EFE6',
    border: '#A9825A',
    color: '#2F2A25',
    muted: '#5B4636',
  },
  cousin: {
    label: 'Primos',
    background: '#FBF8F1',
    border: '#CBBDA6',
    color: '#2F2A25',
    muted: '#5B4636',
  },
  nephewNiece: {
    label: 'Sobrinhos e netos',
    background: '#FBF8F1',
    border: '#66745B',
    color: '#2F2A25',
    muted: '#5B4636',
  },
  grandchild: {
    label: 'Netos',
    background: '#FBF8F1',
    border: '#66745B',
    color: '#2F2A25',
    muted: '#5B4636',
  },
} as const;

export const DIRECT_RELATION_PET_STYLE = {
  label: 'Pets',
  background: '#F4EFE6',
  border: '#A85F45',
  color: '#2F2A25',
  muted: '#5B4636',
} as const;

export function hasDeathDate(value?: string | number | null) {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}
