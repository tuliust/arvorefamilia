import { getVisualPersonCardData } from './app/components/FamilyTree/FamilyTreeVisualCards';
import { obterTodasPessoas, obterTodosRelacionamentos } from './app/services/dataService';
import type { Pessoa, Relacionamento } from './app/types';

const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATH = '/mapa-familiar';
const ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const EXTENDED_CARD_ATTR = 'data-family-map-extended-spouse-card';
const SPOUSE_TONE_ATTR = 'data-family-map-spouse-tone';
const ANCHOR_ATTR = 'data-family-map-spouse-anchor-id';
const STYLE_ID = 'mobile-family-map-extended-spouse-cards-style';

let people: Pessoa[] = [];
let relationships: Relacionamento[] = [];
let loadStarted = false;
let scheduled = false;

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

function buildSpouseMap(relacionamentos: Relacionamento[]) {
  const map = new Map<string, Set<string>>();

  const add = (firstId?: string | null, secondId?: string | null) => {
    if (!firstId || !secondId || firstId === secondId) return;
    const spouses = map.get(firstId) ?? new Set<string>();
    spouses.add(secondId);
    map.set(firstId, spouses);
  };

  relacionamentos.forEach((relationship) => {
    if (relationship.tipo_relacionamento !== 'conjuge') return;
    add(relationship.pessoa_origem_id, relationship.pessoa_destino_id);
    add(relationship.pessoa_destino_id, relationship.pessoa_origem_id);
  });

  return map;
}

function buildDisplayNameMap(pessoas: Pessoa[]) {
  const map = new Map<string, string[]>();

  pessoas.forEach((person) => {
    const displayName = normalizeText(getVisualPersonCardData(person).displayName || person.nome_completo || person.id);
    if (!displayName) return;
    const ids = map.get(displayName) ?? [];
    ids.push(person.id);
    map.set(displayName, ids);
  });

  return map;
}

function isExtendedGroup(section: HTMLElement) {
  const title = normalizeText(section.querySelector('h2, h3')?.textContent ?? '');
  return title.includes('tios')
    || title.includes('primos')
    || title.includes('sobrinhos')
    || title.includes('filhos')
    || title.includes('netos')
    || title.includes('irmaos');
}

function resolveCardPersonIds(button: HTMLElement, displayNameMap: Map<string, string[]>) {
  const text = normalizeText(button.textContent ?? '');
  if (!text) return [];

  return Array.from(displayNameMap.entries())
    .filter(([displayName]) => text.includes(displayName))
    .sort((a, b) => b[0].length - a[0].length)
    .flatMap(([, ids]) => ids)
    .filter(Boolean);
}

function chooseCardPersonId(candidateIds: string[], previousPersonId: string | null, spouseMap: Map<string, Set<string>>) {
  if (candidateIds.length === 0) return null;

  if (previousPersonId) {
    const spouseCandidate = candidateIds.find((personId) => spouseMap.get(previousPersonId)?.has(personId));
    if (spouseCandidate) return spouseCandidate;
  }

  return candidateIds[0];
}

function clearSpouseMarks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(`[${EXTENDED_CARD_ATTR}="true"]`).forEach((element) => {
    element.removeAttribute(EXTENDED_CARD_ATTR);
    element.removeAttribute(SPOUSE_TONE_ATTR);
    element.removeAttribute(ANCHOR_ATTR);
  });
}

function markExtendedSpouseCards() {
  if (!isEnabled()) return;
  ensureStyles();

  const root = document.querySelector<HTMLElement>(ROOT_SELECTOR);
  if (!root || people.length === 0 || relationships.length === 0) return;

  const spouseMap = buildSpouseMap(relationships);
  const displayNameMap = buildDisplayNameMap(people);
  clearSpouseMarks(root);

  root.querySelectorAll<HTMLElement>('section').forEach((section) => {
    if (!isExtendedGroup(section)) return;

    let previousPersonId: string | null = null;
    section.querySelectorAll<HTMLElement>('button[data-family-map-mobile-card="true"]').forEach((button) => {
      const candidateIds = resolveCardPersonIds(button, displayNameMap);
      const personId = chooseCardPersonId(candidateIds, previousPersonId, spouseMap);

      if (personId && previousPersonId && spouseMap.get(previousPersonId)?.has(personId)) {
        button.setAttribute(EXTENDED_CARD_ATTR, 'true');
        button.setAttribute(SPOUSE_TONE_ATTR, 'true');
        button.setAttribute(ANCHOR_ATTR, previousPersonId);
      }

      if (personId) previousPersonId = personId;
    });
  });
}

function scheduleMark() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    markExtendedSpouseCards();
  });
}

async function loadDataOnce() {
  if (loadStarted) return;
  loadStarted = true;

  try {
    const [loadedPeople, loadedRelationships] = await Promise.all([
      obterTodasPessoas(),
      obterTodosRelacionamentos(),
    ]);
    people = Array.isArray(loadedPeople) ? loadedPeople : [];
    relationships = Array.isArray(loadedRelationships) ? loadedRelationships : [];
  } catch {
    people = [];
    relationships = [];
  }

  markExtendedSpouseCards();
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      html[data-mobile-family-spouse-scope="direct"] ${ROOT_SELECTOR} [${EXTENDED_CARD_ATTR}="true"] {
        display: none !important;
      }

      ${ROOT_SELECTOR} [${EXTENDED_CARD_ATTR}="true"] {
        background: var(--family-map-card-bg-spouse, linear-gradient(180deg, #c7dc98 0%, #a9c875 52%, #7da357 100%)) !important;
        border-color: var(--family-map-card-border-spouse, #9fbd6a) !important;
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

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  void loadDataOnce();
  [120, 320, 720, 1400].forEach((delay) => window.setTimeout(markExtendedSpouseCards, delay));

  const observer = new MutationObserver(scheduleMark);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-mobile-family-spouse-scope', 'data-family-map-mobile-card'],
  });

  window.addEventListener('resize', markExtendedSpouseCards, { passive: true });
  window.addEventListener('orientationchange', markExtendedSpouseCards, { passive: true });
  window.addEventListener('popstate', markExtendedSpouseCards, { passive: true });
  document.addEventListener('visibilitychange', markExtendedSpouseCards, { passive: true });
}

export {};
