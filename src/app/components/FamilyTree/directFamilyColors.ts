const directFilterCardColors = {
  tataravos: '#B7AED6',
  bisavos: '#D49BC5',
  avos: '#E8A29B',
  tios: '#EAB08F',
  primos: '#E7B985',
  pais: '#E4C37A',
  central: '#E7E8E8',
  irmaos: '#A9CB72',
  sobrinhos: '#B8CEC2',
  netos: '#BDD8DC',
  pets: '#F4C7AB',
} as const;

export const DIRECT_FAMILY_RELATION_COLORS = {
  tataravos: {
    background: directFilterCardColors.tataravos,
    solid: directFilterCardColors.tataravos,
    label: 'Tataravós',
  },
  bisavos: {
    background: directFilterCardColors.bisavos,
    solid: directFilterCardColors.bisavos,
    label: 'Bisavós',
  },
  avos: {
    background: directFilterCardColors.avos,
    solid: directFilterCardColors.avos,
    label: 'Avós',
  },
  tios: {
    background: directFilterCardColors.tios,
    solid: directFilterCardColors.tios,
    label: 'Tios',
  },
  primos: {
    background: directFilterCardColors.primos,
    solid: directFilterCardColors.primos,
    label: 'Primos',
  },
  pais: {
    background: directFilterCardColors.pais,
    solid: directFilterCardColors.pais,
    label: 'Pai e Mãe',
  },
  central: {
    background: directFilterCardColors.central,
    solid: directFilterCardColors.central,
    label: 'Pessoa Principal',
  },
  irmaos: {
    background: directFilterCardColors.irmaos,
    solid: directFilterCardColors.irmaos,
    label: 'Irmãos',
  },
  sobrinhos: {
    background: directFilterCardColors.sobrinhos,
    solid: directFilterCardColors.sobrinhos,
    label: 'Sobrinhos',
  },
  netos: {
    background: directFilterCardColors.netos,
    solid: directFilterCardColors.netos,
    label: 'Netos',
  },
  conjuge: {
    background: directFilterCardColors.pais,
    solid: directFilterCardColors.pais,
    label: 'Cônjuge',
  },
  filhos: {
    background: directFilterCardColors.netos,
    solid: directFilterCardColors.netos,
    label: 'Filhos',
  },
  pets: {
    background: directFilterCardColors.pets,
    solid: directFilterCardColors.pets,
    label: 'Pets',
  },
} as const;

export const DIRECT_FAMILY_CARD_TEXT_COLORS = {
  primary: '#111827',
  muted: '#4B5563',
} as const;

export const DIRECT_FAMILY_STATUS_BORDER_COLORS = {
  alive: '#3F7F72',
  deceased: '#6B7280',
} as const;

export const DIRECT_FAMILY_GROUP_CONTAINER_BORDER = {
  color: '#94A3B8',
  width: 4,
  background: '#F8FAFC',
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
