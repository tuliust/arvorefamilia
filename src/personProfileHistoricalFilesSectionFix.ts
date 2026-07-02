function isPersonProfilePath() {
  return /^\/pessoa\/[^/]+\/?$/.test(window.location.pathname);
}

function removeStandaloneHistoricalFilesSection() {
  if (!isPersonProfilePath()) return;

  const heading = Array.from(document.querySelectorAll<HTMLElement>('h1,h2,h3,[data-slot="card-title"]'))
    .find((element) => (element.textContent ?? '').includes('Fatos e Arquivos Históricos'));

  const section = heading?.closest('section') ?? heading?.closest('[class*="rounded"], [class*="Card"]');
  section?.remove();
}

let scheduled = false;
function scheduleRemoval() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    removeStandaloneHistoricalFilesSection();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('DOMContentLoaded', scheduleRemoval);
  window.addEventListener('popstate', scheduleRemoval);

  const originalPushState = window.history.pushState;
  window.history.pushState = function patchedPushState(...args) {
    const result = originalPushState.apply(this, args);
    scheduleRemoval();
    return result;
  };

  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function patchedReplaceState(...args) {
    const result = originalReplaceState.apply(this, args);
    scheduleRemoval();
    return result;
  };

  new MutationObserver(scheduleRemoval).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  [80, 250, 600, 1200].forEach((delay) => window.setTimeout(scheduleRemoval, delay));
}

export {};
