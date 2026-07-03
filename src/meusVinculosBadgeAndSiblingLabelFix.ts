import { isPersonAlreadyLinked } from './app/services/memberProfileService';

const REGISTERED_BADGE_CLASSES = [
  'border-green-200',
  'bg-green-100',
  'text-green-800',
];

const PRE_REGISTERED_BADGE_CLASSES = [
  'border-gray-200',
  'bg-gray-100',
  'text-gray-700',
];

const explicitMasculineFirstNames = new Set([
  'leonardo',
  'lorenzo',
  'tassius',
  'titus',
]);

const explicitFeminineFirstNames = new Set<string>([]);

let syncTimer: number | null = null;
const statusCache = new Map<string, boolean>();

function isMeusVinculosPage() {
  return window.location.pathname.replace(/\/$/, '') === '/meus-vinculos';
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function getFirstName(fullName: string) {
  return normalizeText(fullName).split(/\s+/)[0] ?? '';
}

function inferSiblingLabel(fullName: string) {
  const firstName = getFirstName(fullName);
  if (!firstName) return null;

  if (explicitMasculineFirstNames.has(firstName)) return 'Irmão';
  if (explicitFeminineFirstNames.has(firstName)) return 'Irmã';

  if (firstName.endsWith('o') || firstName.endsWith('us')) return 'Irmão';
  if (firstName.endsWith('a')) return 'Irmã';

  return null;
}

function getStatusBadge(card: HTMLElement) {
  return Array.from(card.querySelectorAll<HTMLElement>('span'))
    .find((element) => element.textContent?.trim() === 'Pré-cadastrado' || element.textContent?.trim() === 'Cadastrado') ?? null;
}

function markBadgeAsRegistered(badge: HTMLElement) {
  badge.textContent = 'Cadastrado';
  PRE_REGISTERED_BADGE_CLASSES.forEach((className) => badge.classList.remove(className));
  REGISTERED_BADGE_CLASSES.forEach((className) => badge.classList.add(className));
}

async function updateRegistrationBadges(cards: HTMLElement[]) {
  await Promise.all(cards.map(async (card) => {
    const personId = card.dataset.personId?.trim();
    if (!personId || personId.startsWith('local-')) return;

    const badge = getStatusBadge(card);
    if (!badge || badge.textContent?.trim() === 'Cadastrado') return;

    let alreadyLinked = statusCache.get(personId);
    if (alreadyLinked === undefined) {
      const result = await isPersonAlreadyLinked(personId);
      alreadyLinked = Boolean(result.alreadyLinked);
      statusCache.set(personId, alreadyLinked);
    }

    if (alreadyLinked) {
      markBadgeAsRegistered(badge);
    }
  }));
}

function updateSiblingLabels(cards: HTMLElement[]) {
  cards
    .filter((card) => card.dataset.relationshipGroup === 'irmaos')
    .forEach((card) => {
      const name = card.dataset.personName ?? '';
      const inferredLabel = inferSiblingLabel(name);
      if (!inferredLabel) return;

      const label = Array.from(card.querySelectorAll<HTMLElement>('p'))
        .find((element) => element.textContent?.trim() === 'Irmão(ã)') ?? null;

      if (label) {
        label.textContent = inferredLabel;
      }
    });
}

function getRelationshipCards() {
  return Array.from(document.querySelectorAll<HTMLElement>('article[data-person-id][data-relationship-group]'));
}

async function syncMeusVinculosBadgesAndLabels() {
  if (!isMeusVinculosPage()) return;

  const cards = getRelationshipCards();
  if (cards.length === 0) return;

  updateSiblingLabels(cards);
  await updateRegistrationBadges(cards);
}

function scheduleSync() {
  if (syncTimer) window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    void syncMeusVinculosBadgesAndLabels();
  }, 120);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  scheduleSync();

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  window.addEventListener('popstate', scheduleSync);
  window.addEventListener('focus', scheduleSync);
}

export {};
