const MOBILE_QUERY = '(max-width: 767px)';
const FAMILY_MAP_PATH = '/mapa-familiar';

const IGNORED_CONNECTOR_SELECTORS = [
  '[data-mobile-family-tree-ancestor-connectors="true"]',
  '[data-mobile-family-tree-descendant-connectors="true"]',
  '[data-mobile-family-tree-core-descendant-connectors="true"]',
  '.mobile-family-tree-ancestor-connector-line',
  '.mobile-family-descendant-connector-line',
  '.mobile-family-tree-core-descendant-connector-line',
].join(',');

function isMobileFamilyMap() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches
    && window.location.pathname === FAMILY_MAP_PATH;
}

function isStyleMutation(mutation: MutationRecord) {
  const target = mutation.target;

  if (target instanceof HTMLStyleElement) return true;
  if (target instanceof HTMLElement && target.tagName === 'HEAD') return true;
  if (target instanceof HTMLElement && target.closest('head')) return true;

  return Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes)).some((node) => (
    node instanceof HTMLStyleElement
    || (node instanceof HTMLElement && node.tagName === 'STYLE')
  ));
}

function isConnectorMutation(mutation: MutationRecord) {
  const nodes = [mutation.target, ...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)];

  return nodes.some((node) => {
    if (!(node instanceof HTMLElement)) return false;

    return Boolean(
      node.matches(IGNORED_CONNECTOR_SELECTORS)
      || node.closest(IGNORED_CONNECTOR_SELECTORS)
      || node.hasAttribute('data-mobile-family-tree-ancestor-connectors')
      || node.hasAttribute('data-mobile-family-tree-descendant-connectors')
      || node.hasAttribute('data-mobile-family-tree-core-descendant-connectors'),
    );
  });
}

function shouldIgnoreMutation(mutation: MutationRecord) {
  return isStyleMutation(mutation) || isConnectorMutation(mutation);
}

if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
  const nativeMutationObserver = window.MutationObserver;

  class MobileFamilyTreeMutationObserver extends nativeMutationObserver {
    constructor(callback: MutationCallback) {
      let scheduledFrame = 0;
      let pendingMutations: MutationRecord[] = [];
      let pendingObserver: MutationObserver | null = null;

      super((mutations, observer) => {
        if (!isMobileFamilyMap()) {
          callback(mutations, observer);
          return;
        }

        const relevantMutations = mutations.filter((mutation) => !shouldIgnoreMutation(mutation));
        if (relevantMutations.length === 0) return;

        pendingMutations = pendingMutations.concat(relevantMutations);
        pendingObserver = observer;

        if (scheduledFrame) return;

        scheduledFrame = window.requestAnimationFrame(() => {
          scheduledFrame = 0;

          const nextMutations = pendingMutations;
          const nextObserver = pendingObserver ?? observer;
          pendingMutations = [];
          pendingObserver = null;

          if (nextMutations.length > 0) callback(nextMutations, nextObserver);
        });
      });
    }
  }

  window.MutationObserver = MobileFamilyTreeMutationObserver;
}

export {};
