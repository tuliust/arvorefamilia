import { Pessoa, Relacionamento } from '../types';

export type CachedTreeData = {
  pessoas: Pessoa[];
  relacionamentos: Relacionamento[];
  cacheKey?: string;
};

const TREE_DATA_CHANGED_EVENT = 'arvorefamilia:tree-data-changed';

let cachedTreeData: CachedTreeData | null = null;

export function getCachedTreeData(cacheKey?: string) {
  if (cacheKey && cachedTreeData?.cacheKey !== cacheKey) {
    return null;
  }

  return cachedTreeData;
}

export function setCachedTreeData(data: CachedTreeData, cacheKey?: string) {
  cachedTreeData = { ...data, cacheKey };
}

export function clearTreeDataCache(cacheKey?: string) {
  if (cacheKey && cachedTreeData?.cacheKey !== cacheKey) {
    return;
  }

  cachedTreeData = null;
}

export function emitTreeDataChanged() {
  clearTreeDataCache();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(TREE_DATA_CHANGED_EVENT));
  }
}

export function subscribeTreeDataChanged(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener(TREE_DATA_CHANGED_EVENT, callback);
  return () => window.removeEventListener(TREE_DATA_CHANGED_EVENT, callback);
}
