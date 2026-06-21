const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const FULL_MAP_ID = 'mobile-family-map-full-overview';
const STYLE_ID = 'mobile-family-map-full-overview-mosaic-fix-style';

type GroupKind = 'ancestor' | 'core-group';

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && isMobileViewport()
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getRoot() {
  return document.querySelector<HTMLElement>(ROOT_SELECTOR);
}

function getScreen(screenName: string) {
  return getRoot()?.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`) ?? null;
}

function sectionTitle(section: HTMLElement) {
  return normalizeText(section.querySelector('h2, h3')?.textContent ?? '');
}

function findSectionByExactTitle(screenName: string, expectedTitle: string) {
  const screen = getScreen(screenName);
  const expected = normalizeText(expectedTitle);
  const sections = Array.from((screen ?? getRoot())?.querySelectorAll<HTMLElement>('section') ?? []);

  return sections.find((section) => sectionTitle(section) === expected)
    ?? sections.find((section) => {
      const title = sectionTitle(section);
      return title.includes(expected)
        && !title.includes('bisavos')
        && !title.includes('tataravos');
    })
    ?? null;
}

function cleanupClone(clone: HTMLElement) {
  clone.classList.add('mobile-family-full-map-clone');
  clone.querySelectorAll<HTMLElement>([
    '[data-tree-export-ignore="true"]',
    '.pointer-events-none.absolute',
    '[data-mobile-uncle-branch-connector]',
    '[data-mobile-maternal-uncle-down-connector]',
    '[data-mobile-uncle-native-connector]',
    '[data-mobile-core-center-descendant-line]',
    '[data-mobile-family-tree-descendant-source]',
    '[data-mobile-family-tree-descendant-connector]',
    '[data-mobile-family-overview-current-label="true"]',
  ].join(',')).forEach((element) => element.remove());

  clone.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    button.setAttribute('type', 'button');
    button.setAttribute('tabindex', '-1');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  });

  clone.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    element.style.removeProperty('transform');
    element.style.removeProperty('transition');
    element.style.removeProperty('top');
    element.style.removeProperty('left');
    element.style.removeProperty('right');
    element.style.removeProperty('bottom');
    element.style.removeProperty('height');
    element.style.removeProperty('width');
    element.style.removeProperty('max-height');
  });
}

function replaceGroupContent(groupId: string, source: HTMLElement | null, fallbackTitle: string) {
  const shell = document.querySelector<HTMLElement>(`#${FULL_MAP_ID} [data-full-map-id="${groupId}"] .mobile-family-full-map-group-shell`);
  if (!shell) return;

  shell.textContent = '';

  if (source) {
    const clone = source.cloneNode(true) as HTMLElement;
    cleanupClone(clone);
    shell.appendChild(clone);
    return;
  }

  shell.innerHTML = `<div class="mobile-family-full-map-empty">${fallbackTitle}</div>`;
}

function buildGroup(groupId: string, kind: GroupKind, left: number, top: number, width: number, source: HTMLElement | null, fallbackTitle: string) {
  const group = document.createElement('article');
  group.className = 'mobile-family-full-map-group';
  group.dataset.fullMapId = groupId;
  group.dataset.fullMapKind = kind;
  group.style.setProperty('left', `${left}px`);
  group.style.setProperty('top', `${top}px`);
  group.style.setProperty('width', `${width}px`);

  const shell = document.createElement('div');
  shell.className = 'mobile-family-full-map-group-shell';

  if (source) {
    const clone = source.cloneNode(true) as HTMLElement;
    cleanupClone(clone);
    shell.appendChild(clone);
  } else {
    shell.innerHTML = `<div class="mobile-family-full-map-empty">${fallbackTitle}</div>`;
  }

  group.appendChild(shell);
  return group;
}

function ensureExtraConnectors(stage: HTMLElement) {
  const svg = stage.querySelector<SVGSVGElement>('.mobile-family-full-map-connectors');
  if (!svg || svg.querySelector('[data-full-map-extra-connector="true"]')) return;

  [
    'M 735 1148 L 860 1148',
    'M 930 1215 L 930 1365',
  ].forEach((d) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('data-full-map-extra-connector', 'true');
    svg.appendChild(path);
  });
}

function ensureExtraGroups(stage: HTMLElement) {
  if (!stage.querySelector('[data-full-map-id="filhos"]')) {
    stage.appendChild(buildGroup(
      'filhos',
      'core-group',
      845,
      1060,
      170,
      findSectionByExactTitle('core', 'Filhos'),
      'Filhos',
    ));
  }

  if (!stage.querySelector('[data-full-map-id="netos"]')) {
    stage.appendChild(buildGroup(
      'netos',
      'core-group',
      845,
      1270,
      170,
      findSectionByExactTitle('core', 'Netos'),
      'Netos',
    ));
  }
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      #${FULL_MAP_ID} .mobile-family-full-map-stage {
        height: 1660px !important;
      }

      #${FULL_MAP_ID} [data-full-map-id="filhos"],
      #${FULL_MAP_ID} [data-full-map-id="netos"] {
        z-index: 2 !important;
      }
    }
  `;

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
  }

  if (style.textContent !== css) style.textContent = css;
  if (document.head.lastElementChild !== style) document.head.appendChild(style);
}

function applyMosaicFix() {
  if (!isEnabled()) return;
  ensureStyles();

  const stage = document.querySelector<HTMLElement>(`#${FULL_MAP_ID} .mobile-family-full-map-stage`);
  if (!stage || stage.dataset.mobileFamilyMosaicFixApplied === 'true') return;

  stage.dataset.mobileFamilyMosaicFixApplied = 'true';

  replaceGroupContent('avos-paternos', findSectionByExactTitle('ancestors', 'Avós paternos'), 'Avós paternos');
  replaceGroupContent('avos-maternos', findSectionByExactTitle('ancestors', 'Avós maternos'), 'Avós maternos');
  ensureExtraGroups(stage);
  ensureExtraConnectors(stage);
}

function scheduleApply() {
  window.requestAnimationFrame(() => {
    applyMosaicFix();
    window.setTimeout(applyMosaicFix, 80);
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  scheduleApply();
  [120, 360, 720, 1200].forEach((delay) => window.setTimeout(applyMosaicFix, delay));

  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('resize', applyMosaicFix, { passive: true });
  window.addEventListener('orientationchange', applyMosaicFix, { passive: true });
  window.addEventListener('popstate', applyMosaicFix, { passive: true });
  document.addEventListener('visibilitychange', applyMosaicFix, { passive: true });
}

export {};
