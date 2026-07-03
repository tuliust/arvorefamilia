import { getVisualPersonCardData } from './app/components/FamilyTree/FamilyTreeVisualCards';
import { obterTodasPessoas, obterTodosRelacionamentos } from './app/services/dataService';
import type { Pessoa, Relacionamento } from './app/types';
import { isHumanFamilyMember } from './app/utils/personEntity';

const DIRECT_MAP_PATH = '/mapa-familiar';
const EXTENDED_CARD_ATTR = 'data-family-map-extended-spouse-card';
const EXTENDED_WRAPPER_ATTR = 'data-family-map-extended-spouse-wrapper';
const SPOUSE_TONE_ATTR = 'data-family-map-spouse-tone';
const ANCHOR_ATTR = 'data-family-map-spouse-anchor-id';
const STYLE_ID = 'family-map-strict-lineage-collateral-style';

type ParentKind = 'pai' | 'mae' | 'parent';

type RelIndex = {
  parentsByChild: Map<string, Array<{ parentId: string; kind: ParentKind }>>;
  childrenByParent: Map<string, Set<string>>;
  spousesByPerson: Map<string, Set<string>>;
};

type StrictScope = Record<
  'paternalUncles'
  | 'maternalUncles'
  | 'paternalCousins'
  | 'maternalCousins'
  | 'siblings'
  | 'nephews'
  | 'children'
  | 'grandchildren',
  Set<string>
>;

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

function addParent(index: RelIndex, childId?: string | null, parentId?: string | null, kind: ParentKind = 'parent') {
  if (!childId || !parentId || childId === parentId) return;

  const links = index.parentsByChild.get(childId) ?? [];
  if (!links.some((link) => link.parentId === parentId)) {
    links.push({ parentId, kind });
    index.parentsByChild.set(childId, links);
  }

  addToSetMap(index.childrenByParent, parentId, childId);
}

function buildIndex(): RelIndex {
  const index: RelIndex = {
    parentsByChild: new Map(),
    childrenByParent: new Map(),
    spousesByPerson: new Map(),
  };

  relationships.forEach((relationship) => {
    if (relationship.tipo_relacionamento === 'conjuge') {
      addToSetMap(index.spousesByPerson, relationship.pessoa_origem_id, relationship.pessoa_destino_id);
      addToSetMap(index.spousesByPerson, relationship.pessoa_destino_id, relationship.pessoa_origem_id);
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

function findParents(personId: string | undefined, index: RelIndex) {
  if (!personId) return [];
  return sortIds((index.parentsByChild.get(personId) ?? []).map((link) => link.parentId));
}

function findParentByKind(personId: string, kind: 'pai' | 'mae', index: RelIndex) {
  const explicit = (index.parentsByChild.get(personId) ?? []).find((link) => link.kind === kind)?.parentId;
  if (explicit) return explicit;

  const parents = findParents(personId, index);
  return parents[kind === 'pai' ? 0 : 1];
}

function findChildren(personId: string | undefined, index: RelIndex) {
  if (!personId) return [];
  return sortIds(Array.from(index.childrenByParent.get(personId) ?? []));
}

function findStrictSiblings(personId: string, index: RelIndex) {
  return sortIds(findParents(personId, index).flatMap((parentId) => findChildren(parentId, index)))
    .filter((id) => id !== personId);
}

function buildStrictScope(centralPersonId: string, index: RelIndex): StrictScope {
  const fatherId = findParentByKind(centralPersonId, 'pai', index) ?? findParents(centralPersonId, index)[0];
  const motherId = findParentByKind(centralPersonId, 'mae', index)
    ?? findParents(centralPersonId, index).find((personId) => personId !== fatherId);

  const paternalUncles = sortIds(fatherId ? findStrictSiblings(fatherId, index).filter((personId) => personId !== motherId) : []);
  const maternalUncles = sortIds(motherId ? findStrictSiblings(motherId, index).filter((personId) => personId !== fatherId) : []);
  const siblings = findStrictSiblings(centralPersonId, index);
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
  return Array.from(baseIds).find((baseId) => index.spousesByPerson.get(baseId)?.has(personId));
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

      const anchorId = getSpouseAnchor(personId, baseIds, index) ?? 'non-lineage-collateral';
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
  [80, 220, 520, 1200, 2200, 3600].forEach((delay) => window.setTimeout(markExtendedSpouseCards, delay));

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
