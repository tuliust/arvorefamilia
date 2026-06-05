const directFilterCardColors = {
  tataravos: '#D9C7AD',
  bisavos: '#E0CCB0',
  avos: '#E7D8BF',
  tios: '#EADCC8',
  primos: '#F4EFE6',
  pais: '#FBF8F1',
  central: '#FBF8F1',
  irmaos: '#F4EFE6',
  sobrinhos: '#E7D8BF',
  netos: '#F4EFE6',
  pets: '#E2D2BA',
} as const;

export const DIRECT_FAMILY_RELATION_COLORS = {
  tataravos: {
    background: directFilterCardColors.tataravos,
    solid: '#5B4636',
    label: 'Tataravós',
  },
  bisavos: {
    background: directFilterCardColors.bisavos,
    solid: '#A9825A',
    label: 'Bisavós',
  },
  avos: {
    background: directFilterCardColors.avos,
    solid: '#A9825A',
    label: 'Avós',
  },
  tios: {
    background: directFilterCardColors.tios,
    solid: '#CBBDA6',
    label: 'Tios',
  },
  primos: {
    background: directFilterCardColors.primos,
    solid: '#CBBDA6',
    label: 'Primos',
  },
  pais: {
    background: directFilterCardColors.pais,
    solid: '#A85F45',
    label: 'Pai e Mãe',
  },
  central: {
    background: directFilterCardColors.central,
    solid: '#A85F45',
    label: 'Pessoa Principal',
  },
  irmaos: {
    background: directFilterCardColors.irmaos,
    solid: '#CBBDA6',
    label: 'Irmãos',
  },
  sobrinhos: {
    background: directFilterCardColors.sobrinhos,
    solid: '#66745B',
    label: 'Sobrinhos',
  },
  netos: {
    background: directFilterCardColors.netos,
    solid: '#66745B',
    label: 'Netos',
  },
  conjuge: {
    background: directFilterCardColors.pais,
    solid: '#A85F45',
    label: 'Cônjuge',
  },
  filhos: {
    background: directFilterCardColors.netos,
    solid: '#66745B',
    label: 'Filhos',
  },
  pets: {
    background: directFilterCardColors.pets,
    solid: '#A85F45',
    label: 'Pets',
  },
} as const;

export const DIRECT_FAMILY_CARD_TEXT_COLORS = {
  primary: '#2F2A25',
  muted: '#5B4636',
} as const;

export const DIRECT_FAMILY_STATUS_BORDER_COLORS = {
  alive: '#66745B',
  deceased: '#A9825A',
} as const;

export const DIRECT_FAMILY_GROUP_CONTAINER_BORDER = {
  color: '#CBBDA6',
  width: 2,
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
