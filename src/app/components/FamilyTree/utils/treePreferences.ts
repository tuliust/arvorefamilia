import {
  DEFAULT_DIRECT_RELATIVE_FILTERS,
  DirectRelativeFilters,
  DirectRelativeGroup,
} from '../types';

const STORAGE_KEYS = {
  desktopNoticeDismissed: 'familyTree:desktopNoticeDismissed',
};

const LEGACY_TREE_MODE_STORAGE_KEY = `familyTree:${'view'}${'Mode'}`;
const LEGACY_TREE_GENERATION_STORAGE_KEY = `familyTree:${'active'}${'Generation'}`;

export const MOBILE_INITIAL_DIRECT_RELATIVE_FILTERS: DirectRelativeFilters = {
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

function isMobileViewport() {
  try {
    return window.matchMedia('(max-width: 767px)').matches;
  } catch {
    return false;
  }
}

function shouldEnableInitialSpouseFilter() {
  try {
    const isFamilyMap = window.location.pathname === '/mapa-familiar';
    const isHorizontalFamilyMap = window.location.pathname === '/mapa-familiar-horizontal';
    const isViewingAnotherPerson = new URLSearchParams(window.location.search).has('pessoa');
    return isFamilyMap || isHorizontalFamilyMap || isViewingAnotherPerson;
  } catch {
    return false;
  }
}

function withInitialFamilyMapDefaults(filters: DirectRelativeFilters): DirectRelativeFilters {
  if (!shouldEnableInitialSpouseFilter()) return filters;

  return {
    ...filters,
    conjuge: true,
  };
}

export function readDirectRelativeFilters(userId?: string): DirectRelativeFilters {
  if (isMobileViewport()) return MOBILE_INITIAL_DIRECT_RELATIVE_FILTERS;
  if (!userId) return withInitialFamilyMapDefaults(DEFAULT_DIRECT_RELATIVE_FILTERS);

  try {
    const value = window.localStorage.getItem(`familyTree:directRelativeFilters:${userId}`);
    if (!value) return withInitialFamilyMapDefaults(DEFAULT_DIRECT_RELATIVE_FILTERS);

    const parsed = JSON.parse(value) as Partial<Record<DirectRelativeGroup, unknown>>;
    const storedFilters = (Object.keys(DEFAULT_DIRECT_RELATIVE_FILTERS) as DirectRelativeGroup[]).reduce(
      (filters, key) => ({
        ...filters,
        [key]: typeof parsed[key] === 'boolean' ? parsed[key] : DEFAULT_DIRECT_RELATIVE_FILTERS[key],
      }),
      {} as DirectRelativeFilters
    );

    return withInitialFamilyMapDefaults(storedFilters);
  } catch {
    return withInitialFamilyMapDefaults(DEFAULT_DIRECT_RELATIVE_FILTERS);
  }
}

export function storeDirectRelativeFilters(userId: string | undefined, value: DirectRelativeFilters) {
  if (!userId) return;

  try {
    window.localStorage.setItem(`familyTree:directRelativeFilters:${userId}`, JSON.stringify(value));
  } catch {
    // noop
  }
}

export function migrateLegacyTreeViewPreferences() {
  try {
    window.localStorage.removeItem(LEGACY_TREE_MODE_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_TREE_GENERATION_STORAGE_KEY);
  } catch {
    // noop
  }
}

export function readDesktopNoticeDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.desktopNoticeDismissed) === 'true';
  } catch {
    return false;
  }
}

export function storeDesktopNoticeDismissed(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.desktopNoticeDismissed, String(value));
  } catch {
    // noop
  }
}

export function clearTreePreferences() {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // noop
  }
}

export { STORAGE_KEYS as TREE_PREFERENCE_KEYS };
