export const FAMILY_TREE_COLORS = {
  CARD_BORDER_ALIVE: '#3b82f6',
  CARD_BORDER_DECEASED: '#8b5cf6',
  CARD_BORDER_PET: '#f59e0b',
  EDGE_SPOUSE: '#f97316',
  EDGE_CHILD: '#eab308',
  EDGE_SIBLING: '#eab308',
} as const;

export const DIRECT_FAMILY_TOKENS = {
  CARD_WIDTH: 210,
  CARD_HEIGHT: 82,
  CENTRAL_WIDTH: 570,
  CENTRAL_HEIGHT: 636,
  AVATAR_SIZE: 50,
  CENTRAL_AVATAR_SIZE: 300,
  EDGE_STROKE: '#64748b',
  EDGE_STROKE_WIDTH: 1.6,
  EDGE_OPACITY: 0.72,
  SPOUSE_EDGE_STROKE_WIDTH: 1.6,
  DESKTOP_ZOOM: 0.9,
  MOBILE_ZOOM: 0.34,
} as const;

export function hasDeathDate(value?: string | number | null) {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}
