const directFilterCardColors = {
  tataravos: 'var(--tree-palette-card-tataravos, #B7AED6)',
  bisavos: 'var(--tree-palette-card-bisavos, #D49BC5)',
  avos: 'var(--tree-palette-card-avos, #E8A29B)',
  tios: 'var(--tree-palette-card-tios, #EAB08F)',
  primos: 'var(--tree-palette-card-primos, #E7B985)',
  pais: 'var(--tree-palette-card-pais, #E4C37A)',
  central: 'var(--tree-palette-card-central, #E7E8E8)',
  irmaos: 'var(--tree-palette-card-irmaos, #A9CB72)',
  sobrinhos: 'var(--tree-palette-card-sobrinhos, #B8CEC2)',
  netos: 'var(--tree-palette-card-netos, #BDD8DC)',
  pets: 'var(--tree-palette-card-pets, #F4C7AB)',
} as const;

const directRelationBorderColors = {
  tataravos: 'var(--tree-palette-border-tataravos, #B7AED6)',
  bisavos: 'var(--tree-palette-border-bisavos, #D49BC5)',
  avos: 'var(--tree-palette-border-avos, #E8A29B)',
  tios: 'var(--tree-palette-border-tios, #EAB08F)',
  primos: 'var(--tree-palette-border-primos, #E7B985)',
  pais: 'var(--tree-palette-border-pais, #E4C37A)',
  central: 'var(--tree-palette-border-central, #E7E8E8)',
  irmaos: 'var(--tree-palette-border-irmaos, #A9CB72)',
  sobrinhos: 'var(--tree-palette-border-sobrinhos, #B8CEC2)',
  netos: 'var(--tree-palette-border-netos, #BDD8DC)',
  pets: 'var(--tree-palette-border-pets, #F4C7AB)',
} as const;

export const DIRECT_FAMILY_RELATION_COLORS = {
  tataravos: { background: directFilterCardColors.tataravos, solid: directRelationBorderColors.tataravos, label: 'Tataravós' },
  bisavos: { background: directFilterCardColors.bisavos, solid: directRelationBorderColors.bisavos, label: 'Bisavós' },
  avos: { background: directFilterCardColors.avos, solid: directRelationBorderColors.avos, label: 'Avós' },
  tios: { background: directFilterCardColors.tios, solid: directRelationBorderColors.tios, label: 'Tios' },
  primos: { background: directFilterCardColors.primos, solid: directRelationBorderColors.primos, label: 'Primos' },
  pais: { background: directFilterCardColors.pais, solid: directRelationBorderColors.pais, label: 'Pai e Mãe' },
  central: { background: directFilterCardColors.central, solid: directRelationBorderColors.central, label: 'Pessoa Principal' },
  irmaos: { background: directFilterCardColors.irmaos, solid: directRelationBorderColors.irmaos, label: 'Irmãos' },
  sobrinhos: { background: directFilterCardColors.sobrinhos, solid: directRelationBorderColors.sobrinhos, label: 'Sobrinhos' },
  netos: { background: directFilterCardColors.netos, solid: directRelationBorderColors.netos, label: 'Netos' },
  conjuge: { background: directFilterCardColors.pais, solid: directRelationBorderColors.pais, label: 'Cônjuges' },
  filhos: { background: directFilterCardColors.netos, solid: directRelationBorderColors.netos, label: 'Filhos' },
  pets: { background: directFilterCardColors.pets, solid: directRelationBorderColors.pets, label: 'Pets' },
} as const;

export const DIRECT_FAMILY_CARD_TEXT_COLORS = {
  primary: 'var(--tree-palette-text-primary, #111827)',
  muted: 'var(--tree-palette-text-muted, #4B5563)',
} as const;

export const DIRECT_FAMILY_STATUS_BORDER_COLORS = {
  alive: 'var(--tree-palette-status-alive, #3F7F72)',
  deceased: 'var(--tree-palette-status-deceased, #6B7280)',
} as const;

export const DIRECT_FAMILY_GROUP_CONTAINER_BORDER = {
  color: 'var(--tree-palette-group-border, #CBD5E1)',
  width: 'var(--tree-palette-group-border-width, 3px)',
  background: 'var(--tree-palette-group-bg, rgba(255, 255, 255, 0.04))',
} as const;

export const DIRECT_FAMILY_LEGEND_BACKGROUNDS = [
  DIRECT_FAMILY_RELATION_COLORS.tataravos,
  DIRECT_FAMILY_RELATION_COLORS.bisavos,
  DIRECT_FAMILY_RELATION_COLORS.avos,
  DIRECT_FAMILY_RELATION_COLORS.tios,
  DIRECT_FAMILY_RELATION_COLORS.primos,
  DIRECT_FAMILY_RELATION_COLORS.pais,
  DIRECT_FAMILY_RELATION_COLORS.central,
  DIRECT_FAMILY_RELATION_COLORS.irmaos,
  DIRECT_FAMILY_RELATION_COLORS.sobrinhos,
  DIRECT_FAMILY_RELATION_COLORS.netos,
  DIRECT_FAMILY_RELATION_COLORS.conjuge,
  DIRECT_FAMILY_RELATION_COLORS.filhos,
  DIRECT_FAMILY_RELATION_COLORS.pets,
] as const;
