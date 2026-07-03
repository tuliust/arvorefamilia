import { getVisualPersonCardData } from './app/components/FamilyTree/FamilyTreeVisualCards';
import { obterTodasPessoas, obterTodosRelacionamentos } from './app/services/dataService';
import type { Pessoa, Relacionamento } from './app/types';
import { isHumanFamilyMember } from './app/utils/personEntity';

const DIRECT_MAP_PATH = '/mapa-familiar';
const EXTENDED_CARD_ATTR = 'data-family-map-extended-spouse-card';
const EXTENDED_WRAPPER_ATTR = 'data-family-map-extended-spouse-wrapper';
const SPOUSE_TONE_ATTR = 'data-family-map-spouse-tone';
const ANCHOR_ATTR = 'data-family-map-spouse-anchor-id';
const STYLE_ID = 'family-map-strict-extended-spouse-cards-style';

type RelIndex = {
  parents: Map<string, string[]>;
  children: Map<string, Set<string>>;
  siblings: Map<string, Set<string>>;
  spouses: Map<string, Set<string>>;
  parentKind: Map<string, Map<'pai' | 'mae', string>>;
};

type StrictScope = {
  paternalUncles: Set<string>;
  maternalUncles: Set<string>;
  paternalCousins: Set<string>;
  maternalCousins: Set<string>;
  siblings: Set<string>;
  nephews: Set<string>;
  children: Set<string>;
  grandchildren: Set<string>;
};

let people: Pessoa[] = [];
let relationships: Relacionamento[] = [];
let loadStarted = false;
let scheduled = false;

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isEnabled() {
  return typeof window !== 'undefined'
    && typeof document !== 'undefined'
    && window.location.pathname.replace(/\/$/, '') === DIRECT_MAP_PATH;
}

function addToSetMap(map: Map<string, Set<string>>, key?: string | null, value?: string | null) {
  if (!key || !value || key === value) return;
  const values = map.get(key) ?? new Set<string>();
  values.add(value);
  map.set(key, values);
}

function addParent(index: RelIndex, childId?: string | null, parentId?: string | null, kind?: 'pai' | 'mae') {
  if (!childId || !parentId || childId === parentId) return;
  const parents = index.parents.get(childId) ?? [];
  if (!parents.includes(parentId)) parents.push(parentId);
  index.parents.set(childId, parents);
  addToSetMap(index.children, parentId, childId);

  if (kind) {
    const kinds = index.parentKind.get(childId) ?? new Map<'pai' | 'mae', string>();
    kinds.set(kind, parentId);
    index.parentKind.set(childId, kinds);
  }
}

function buildIndex(): RelIndex {
  const index: RelIndex = {
    parents: new Map(),
    children: new Map(),
    siblings: new Map(),
    spouses: new Map(),
    parentKind: new Map(),
  };

  relationships.forEach((relationship) => {
    if (relationship.tipo_relacionamento === 'conjuge') {
      addToSetMap(index.spouses, relationship.pessoa_origem_id, relationship.pessoa_destino_id);
      addToSetMap(index.spouses, relationship.pessoa_destino_id, relationship.pessoa_origem_id);
      return;
    }

    if (relationship.tipo_relacionamento === 'irmao') {
      addToSetMap(index.siblings, relationship.pessoa_origem_id, relationship.pessoa_destino_id);
      addToSetMap(index.siblings, relationship.pessoa_destino_id, relationship.pessoa_origem_id);
      return;
    }

    if (relationship.tipo_relacionamento === 'filho') {
      addParent(index, relationship.pessoa_destino_id, relationship.pessoa_origem_id);
      return;
    }

    if (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae') {
      addParent(index, relationship.pessoa_origem_id, relationship.pessoa_destino_id, relationship.tipo_relacionamento);
    }
  });

  return index;
}

function getBirthSortValue(person?: Pessoa) {
  const value = person?.data_nascimento;
  if (!value) return Number.POSITIVE_INFINITY;
  if (typeof value === 'number') return value;
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return parsed;
  const year = value.match(/\d{4}/)?.[0];
  return year ? Number(year) : Number.POSITIVE_INFINITY;
}

function sortIds(ids: string[]) {
  const peopleById = new Map(people.map((person) => [person.id, person]));

  return Array.from(new Set(ids))
    .filter((id) => peopleById.has(id))
    .sort((leftId, rightId) => {
      const left = peopleById.get(leftId);
      const right = peopleById.get(rightId);
      return getBirthSortValue(left) - getBirthSortValue(right)
        || String(left?.nome_completo ?? '').localeCompare(String(right?.nome_completo ?? ''), 'pt-BR');
    });
}

function findChildren(personId: string | undefined, index: RelIndex) {
  if (!personId) return [];
  return sortIds(Array.from(index.children.get(personId) ?? []));
}

function findSiblings(personId: string, index: RelIndex) {
  const sharedParentSiblings = (index.parents.get(personId) ?? []).flatMap((parentId) => findChildren(parentId, index));
  const explicitSiblings = Array.from(index.siblings.get(personId) ?? []);
  return sortIds([...sharedParentSiblings, ...explicitSiblings]).filter((id) => id !== personId);
}

function findParentByKind(personId: string, kind: 'pai' | 'mae', index: RelIndex) {
  return index.parentKind.get(personId)?.get(kind)
    ?? index.parents.get(personId)?.[kind === 'pai' ? 0 : 1];
}

function buildDisplayNameMap() {
  const map = new Map<string, string[]>();

  people.forEach((person) => {
    [getVisualPersonCardData(person).displayName, person.nome_completo, person.id]
      .map((value) => normalizeText(value))
      .filter(Boolean)
      .forEach((name) => {
        const ids = map.get(name) ?? [];
        if (!ids.includes(person.id)) ids.push(person.id);
        map.set(name, ids);
      });
  });

  return map;
}

function resolvePersonIdFromText(text: string, displayNameMap: Map<string, string[]>) {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  return Array.from(displayNameMap.entries())
    .filter(([name]) => normalized.includes(name) || name.includes(normalized))
    .sort((left, right) => right[0].length - left[0].length)[0]?.[1]?.[0] ?? null;
}

function resolveCentralPersonId(displayNameMap: Map<string, string[]>) {
  const queryPersonId = new URLSearchParams(window.location.search).get('pessoa');
  if (queryPersonId && people.some((person) => person.id === queryPersonId)) return queryPersonId;

  const centralCard = document.querySelector<HTMLElement>([
    '[data-family-map-central-card="true"] [data-family-map-person-name="true"]',
    '[data-mobile-family-tree-root="true"] button[data-family-map-color-key="central"]',
    '[data-mobile-family-tree-root="true"] [data-family-map-color-key="central"]',
  ].join(', '));

  return centralCard ? resolvePersonIdFromText(centralCard.textContent ?? '', displayNameMap) : null;
}

function buildStrictScope(centralPersonId: string, index: RelIndex): StrictScope {
  const fatherId = findParentByKind(centralPersonId, 'pai', index) ?? index.parents.get(centralPersonId)?.[0];
  const motherId = findParentByKind(centralPersonId, 'mae', index)
    ?? index.parents.get(centralPersonId)?.find((personId) => personId !== fatherId);
  const paternalUncles = sortIds(fatherId ? findSiblings(fatherId, index).filter((personId) => personId !== motherId) : []);
  const maternalUncles = sortIds(motherId ? findSiblings(motherId, index).filter((personId) => personId !== fatherId) : []);
  const siblings = findSiblings(centralPersonId, index);
  const children = findChildren(centralPersonId, index).filter((personId) => isHumanFamilyMember(people.find((person) => person.id === personId)));

  return {
    paternalUncles: new Set(paternalUncles),
    maternalUncles: new Set(maternalUncles),
    paternalCousins: new Set(sortIds(paternalUncles.flatMap((personId) => findChildren(personId, index)))),
    maternalCousins: new Set(sortIds(maternalUncles.flatMap((personId) => findChildren(personId, index)))),
    siblings: new Set(siblings),
    nephews: new Set(sortIds(siblings.flatMap((personId) => findChildren(personId, index)))),
    children: new Set(children),
    grandchildren: new Set(sortIds(children.flatMap((personId) => findChildren(personId, index)))),
  };
}

function getBaseIdsForTitle(title: string, scope: StrictScope) {
  const normalized = normalizeText(title);
  if (normalized.includes('tios paternos')) return scope.paternalUncles;
  if (normalized.includes('tios maternos')) return scope.maternalUncles;
  if (normalized.includes('primos paternos')) return scope.paternalCousins;
  if (normalized.includes('primos maternos')) return scope.maternalCousins;
  if (normalized.includes('irmaos')) return scope.siblings;
  if (normalized.includes('sobrinhos')) return scope.nephews;
  if (normalized.includes('filhos')) return scope.children;
  if (normalized.includes('netos')) return scope.grandchildren;
  return null;
}

function getSpouseAnchor(personId: string, baseIds: Set<string>, index: RelIndex) {
  return Array.from(baseIds).find((baseId) => index.spouses.get(baseId)?.has(personId));
}

function isExtendedSpouseFilterActive() {
  const mobileScope = document.documentElement.dataset.mobileFamilySpouseScope;
  if (mobileScope === 'extended') return true;
  if (mobileScope === 'direct') return false;

  const spouseButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find((button) => {
    const label = normalizeText(button.textContent);
    const ariaLabel = normalizeText(button.getAttribute('aria-label'));
    return label.includes('todos os conjuges') || ariaLabel.includes('todos os conjuges');
  });

  return spouseButton?.getAttribute('aria-pressed') === 'true'
    || spouseButton?.dataset.active === 'true'
    || spouseButton?.dataset.mobileFamilyFilterActive === 'true';
}

function clearSpouseMarks() {
  document.querySelectorAll<HTMLElement>(`[${EXTENDED_CARD_ATTR}="true"], [${EXTENDED_WRAPPER_ATTR}="true"], [${SPOUSE_TONE_ATTR}="true"]`).forEach((element) => {
    element.removeAttribute(EXTENDED_CARD_ATTR);
    element.removeAttribute(EXTENDED_WRAPPER_ATTR);
    element.removeAttribute(SPOUSE_TONE_ATTR);
    element.removeAttribute(ANCHOR_ATTR);
  });
}

function getHideTarget(card: HTMLElement) {
  const parent = card.parentElement;
  if (parent && parent.children.length === 1 && !parent.matches('[data-family-map-group="true"]')) return parent;
  return card;
}

function getRenderedGroups() {
  return [
    ...Array.from(document.querySelectorAll<HTMLElement>('[data-family-map-group="true"]')),
    ...Array.from(document.querySelectorAll<HTMLElement>('[data-mobile-family-tree-root="true"] section')),
  ];
}

function getGroupTitle(group: HTMLElement) {
  return group.querySelector<HTMLElement>('[data-family-map-group-title="true"], h2, h3')?.textContent ?? '';
}

function getGroupCards(group: HTMLElement) {
  return Array.from(group.querySelectorAll<HTMLElement>('[data-family-map-mobile-card="true"], button[data-family-map-color-key]'));
}

function markExtendedSpouseCards() {
  if (!isEnabled()) return;
  ensureStyles();
  document.documentElement.dataset.familyMapSpouseScope = isExtendedSpouseFilterActive() ? 'extended' : 'direct';

  if (people.length === 0 || relationships.length === 0) return;

  const displayNames = buildDisplayNameMap();
  const centralPersonId = resolveCentralPersonId(displayNames);
  if (!centralPersonId) return;

  const index = buildIndex();
  const scope = buildStrictScope(centralPersonId, index);
  clearSpouseMarks();

  getRenderedGroups().forEach((group) => {
    const baseIds = getBaseIdsForTitle(getGroupTitle(group), scope);
    if (!baseIds) return;

    getGroupCards(group).forEach((card) => {
      const personId = resolvePersonIdFromText(card.textContent ?? '', displayNames);
      if (!personId || baseIds.has(personId)) return;

      const anchorId = getSpouseAnchor(personId, baseIds, index);
      if (!anchorId) return;

      getHideTarget(card).setAttribute(EXTENDED_WRAPPER_ATTR, 'true');
      card.setAttribute(EXTENDED_CARD_ATTR, 'true');
      card.setAttribute(SPOUSE_TONE_ATTR, 'true');
      card.setAttribute(ANCHOR_ATTR, anchorId);
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
    html[data-family-map-spouse-scope="direct"] [${EXTENDED_CARD_ATTR}="true"],
    html[data-family-map-spouse-scope="direct"] [${EXTENDED_WRAPPER_ATTR}="true"] {
      display: none !important;
    }

    [${EXTENDED_CARD_ATTR}="true"],
    [${SPOUSE_TONE_ATTR}="true"] {
      background: var(--family-map-card-bg-spouse, linear-gradient(180deg, #d8edaa 0%, #b9d87d 52%, #86ad5d 100%)) !important;
      background-color: #b9d87d !important;
      border-color: var(--family-map-card-border-spouse, #8fb164) !important;
      box-shadow: 0 8px 22px rgba(71, 85, 105, 0.14) !important;
    }

    [${EXTENDED_CARD_ATTR}="true"] [data-family-map-avatar="true"],
    [${SPOUSE_TONE_ATTR}="true"] [data-family-map-avatar="true"] {
      background: rgba(255, 255, 255, 0.28) !important;
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
  [80, 220, 520, 1200, 2200].forEach((delay) => window.setTimeout(markExtendedSpouseCards, delay));

  const observer = new MutationObserver(scheduleMark);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      'data-mobile-family-spouse-scope',
      'data-mobile-family-filter-active',
      'aria-pressed',
      'data-active',
      'data-family-map-mobile-card',
      'data-family-map-color-key',
    ],
  });

  window.addEventListener('resize', markExtendedSpouseCards, { passive: true });
  window.addEventListener('orientationchange', markExtendedSpouseCards, { passive: true });
  window.addEventListener('popstate', markExtendedSpouseCards, { passive: true });
  window.addEventListener('arvorefamilia:mobile-spouse-filter-changed', markExtendedSpouseCards);
  document.addEventListener('visibilitychange', markExtendedSpouseCards, { passive: true });
}

export {};
