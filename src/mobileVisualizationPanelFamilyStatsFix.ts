import { buildMobileFamilyTreeModel } from './app/components/FamilyTree/mobileFamilyTreeModel';
import { supabase } from './app/lib/supabaseClient';
import { obterTodasPessoas, obterTodosRelacionamentos } from './app/services/dataService';
import { getPrimaryLinkedPersonWithPessoa } from './app/services/memberProfileService';
import type { Pessoa, Relacionamento } from './app/types';
import { isHumanFamilyMember } from './app/utils/personEntity';

const MOBILE_QUERY = '(max-width: 767px)';
const DIRECT_MAP_PATHS = new Set(['/mapa-familiar', '/mapa-familiar-horizontal']);
const PANEL_SELECTOR = '[role="dialog"][aria-label="Painel de visualização"]';
const STYLE_ID = 'mobile-visualization-panel-family-stats-style';
const APPLY_DELAY_MS = [80, 240, 520, 1000];

type GroupKey =
  | 'pais'
  | 'conjuges'
  | 'irmaos'
  | 'filhos'
  | 'avos'
  | 'bisavos'
  | 'tataravos'
  | 'tios'
  | 'primos'
  | 'sobrinhos';

type GroupDetail = {
  count: number;
  names: string[];
};

const GROUP_LABEL_TO_KEY: Record<string, GroupKey> = {
  Pais: 'pais',
  Cônjuges: 'conjuges',
  Irmãos: 'irmaos',
  Filhos: 'filhos',
  Avós: 'avos',
  Bisavós: 'bisavos',
  Tataravós: 'tataravos',
  Tios: 'tios',
  Primos: 'primos',
  Sobrinhos: 'sobrinhos',
};

const EMPTY_GROUP_COPY: Record<GroupKey, string> = {
  pais: 'Nenhum pai ou mãe vinculado à pessoa selecionada.',
  conjuges: 'Nenhum cônjuge vinculado à pessoa selecionada.',
  irmaos: 'Nenhum irmão vinculado à pessoa selecionada.',
  filhos: 'Nenhum filho vinculado à pessoa selecionada.',
  avos: 'Nenhum avô ou avó vinculado à pessoa selecionada.',
  bisavos: 'Nenhum bisavô ou bisavó vinculado à pessoa selecionada.',
  tataravos: 'Nenhum tataravô ou tataravó vinculado à pessoa selecionada.',
  tios: 'Nenhum tio ou tia vinculado à pessoa selecionada.',
  primos: 'Nenhum primo vinculado à pessoa selecionada.',
  sobrinhos: 'Nenhum sobrinho vinculado à pessoa selecionada.',
};

let pessoasCache: Pessoa[] = [];
let relacionamentosCache: Relacionamento[] = [];
let primaryLinkedPessoaId: string | undefined;
let registeredPeopleCount = 0;
let dataPromise: Promise<void> | null = null;
let scheduled = false;
let expandedGroupKey: GroupKey | null = null;

function isMobileViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_QUERY).matches;
}

function normalizePathname() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

function isEnabled() {
  return isMobileViewport() && DIRECT_MAP_PATHS.has(normalizePathname());
}

function uniquePeople(people: Array<Pessoa | null | undefined>) {
  const byId = new Map<string, Pessoa>();
  people.forEach((person) => {
    if (person?.id && !byId.has(person.id)) byId.set(person.id, person);
  });

  return Array.from(byId.values()).sort((left, right) => (
    (left.nome_completo ?? '').localeCompare(right.nome_completo ?? '', 'pt-BR', { sensitivity: 'base' })
  ));
}

function toDetail(people: Array<Pessoa | null | undefined>): GroupDetail {
  const unique = uniquePeople(people).filter(isHumanFamilyMember);
  return {
    count: unique.length,
    names: unique.map((person) => person.nome_completo || person.id),
  };
}

function getSelectedPersonId(panel: HTMLElement) {
  const params = new URLSearchParams(window.location.search);
  const queryPessoa = params.get('pessoa')?.trim();
  if (queryPessoa) return queryPessoa;

  const select = panel.querySelector<HTMLSelectElement>('select[aria-label="Selecionar visualizador da árvore"]');
  if (select?.value?.trim()) return select.value.trim();

  if (primaryLinkedPessoaId) return primaryLinkedPessoaId;

  return pessoasCache.find(isHumanFamilyMember)?.id ?? pessoasCache[0]?.id;
}

function getGroupDetails(centralPersonId: string | undefined): Record<GroupKey, GroupDetail> {
  const model = buildMobileFamilyTreeModel(pessoasCache, relacionamentosCache, centralPersonId);
  const parents = uniquePeople([model.father, model.mother]);
  const grandparents = uniquePeople([...model.paternal.grandparents, ...model.maternal.grandparents]);
  const greatGrandparents = uniquePeople([
    ...model.paternal.greatGrandparents,
    ...model.maternal.greatGrandparents,
  ]);
  const greatGreatGrandparents = uniquePeople([
    ...model.paternal.greatGreatGrandparents,
    ...model.maternal.greatGreatGrandparents,
  ]);
  const uncles = uniquePeople([...model.paternal.uncles, ...model.maternal.uncles]);
  const cousins = uniquePeople([...model.paternal.cousins, ...model.maternal.cousins]);

  return {
    pais: toDetail(parents),
    conjuges: toDetail(model.spouses),
    irmaos: toDetail(model.siblings),
    filhos: toDetail(model.children),
    avos: toDetail(grandparents),
    bisavos: toDetail(greatGrandparents),
    tataravos: toDetail(greatGreatGrandparents),
    tios: toDetail(uncles),
    primos: toDetail(cousins),
    sobrinhos: toDetail(model.nephews),
  };
}

async function countRegisteredPeople() {
  try {
    const { data, error } = await supabase
      .from('user_person_links')
      .select('user_id');

    if (error) throw error;

    return new Set((data ?? [])
      .map((row: { user_id?: string | null }) => row.user_id)
      .filter(Boolean)).size;
  } catch (error) {
    console.warn('[Mobile Visualização] Não foi possível contar user_person_links. Tentando profiles.', error);
  }

  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error) throw error;
    return count ?? 0;
  } catch (error) {
    console.warn('[Mobile Visualização] Não foi possível contar profiles.', error);
    return 0;
  }
}

async function ensureDataLoaded() {
  if (dataPromise) return dataPromise;

  dataPromise = (async () => {
    const [peopleResult, relationshipsResult, registeredResult, authResult] = await Promise.allSettled([
      obterTodasPessoas(),
      obterTodosRelacionamentos(),
      countRegisteredPeople(),
      supabase.auth.getUser(),
    ]);

    pessoasCache = peopleResult.status === 'fulfilled' && Array.isArray(peopleResult.value)
      ? peopleResult.value
      : [];
    relacionamentosCache = relationshipsResult.status === 'fulfilled' && Array.isArray(relationshipsResult.value)
      ? relationshipsResult.value
      : [];
    registeredPeopleCount = registeredResult.status === 'fulfilled' ? registeredResult.value : 0;

    const userId = authResult.status === 'fulfilled' ? authResult.value.data.user?.id : undefined;
    if (userId) {
      try {
        const linkedPersonResult = await getPrimaryLinkedPersonWithPessoa(userId);
        primaryLinkedPessoaId = linkedPersonResult.data?.pessoa_id ?? linkedPersonResult.data?.pessoa?.id ?? undefined;
      } catch (error) {
        console.warn('[Mobile Visualização] Não foi possível resolver pessoa vinculada principal.', error);
      }
    }
  })();

  return dataPromise;
}

function ensureStyles() {
  const css = `
    @media (max-width: 767px) {
      [data-mobile-visualization-family-list="true"] {
        background: rgb(248 250 252) !important;
        border-bottom: 1px solid rgb(226 232 240) !important;
        padding: 0.65rem 0.85rem 0.75rem 4.25rem !important;
      }

      [data-mobile-visualization-family-list="true"] ul {
        display: grid !important;
        gap: 0.35rem !important;
        margin: 0 !important;
        padding: 0 !important;
        list-style: none !important;
      }

      [data-mobile-visualization-family-list="true"] li,
      [data-mobile-visualization-family-list="true"] p {
        margin: 0 !important;
        color: rgb(30 41 59) !important;
        font-size: 0.88rem !important;
        font-weight: 700 !important;
        line-height: 1.25 !important;
      }

      [data-mobile-visualization-family-list="true"] li::before {
        content: '•' !important;
        margin-right: 0.4rem !important;
        color: rgb(37 99 235) !important;
      }

      [data-mobile-visualization-family-row="true"][aria-expanded="true"] {
        background: rgb(239 246 255) !important;
      }

      [data-mobile-visualization-family-row="true"][aria-expanded="true"] svg:last-child {
        transform: rotate(90deg) !important;
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

function findSummaryValue(panel: HTMLElement, label: string) {
  const labelNode = Array.from(panel.querySelectorAll<HTMLElement>('span'))
    .find((element) => element.textContent?.trim() === label);

  const tile = labelNode?.closest('div.flex');
  return tile?.querySelector<HTMLElement>('strong') ?? null;
}

function getRowKey(button: HTMLButtonElement): GroupKey | null {
  const labelText = Array.from(button.querySelectorAll('span'))
    .map((span) => span.textContent?.trim() ?? '')
    .find((text) => text in GROUP_LABEL_TO_KEY);

  return labelText ? GROUP_LABEL_TO_KEY[labelText] : null;
}

function removeExistingGroupLists(panel: HTMLElement) {
  panel.querySelectorAll('[data-mobile-visualization-family-list="true"]').forEach((element) => element.remove());
}

function buildNamesList(key: GroupKey, detail: GroupDetail) {
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-mobile-visualization-family-list', 'true');
  wrapper.setAttribute('data-mobile-visualization-family-list-key', key);

  if (detail.names.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = EMPTY_GROUP_COPY[key];
    wrapper.appendChild(empty);
    return wrapper;
  }

  const list = document.createElement('ul');
  detail.names.forEach((name) => {
    const item = document.createElement('li');
    item.textContent = name;
    list.appendChild(item);
  });
  wrapper.appendChild(list);
  return wrapper;
}

function applyPanelStatsNow() {
  if (!isEnabled()) return;
  ensureStyles();

  const panel = document.querySelector<HTMLElement>(PANEL_SELECTOR);
  if (!panel) return;

  const centralPersonId = getSelectedPersonId(panel);
  const groupDetails = getGroupDetails(centralPersonId);

  const registeredValue = findSummaryValue(panel, 'Cadastrados');
  if (registeredValue) registeredValue.textContent = String(registeredPeopleCount);

  removeExistingGroupLists(panel);

  Array.from(panel.querySelectorAll<HTMLButtonElement>('button')).forEach((button) => {
    const key = getRowKey(button);
    if (!key) return;

    const detail = groupDetails[key];
    const countElement = button.querySelector<HTMLElement>('strong');
    if (countElement) countElement.textContent = String(detail.count);

    button.setAttribute('data-mobile-visualization-family-row', 'true');
    button.setAttribute('data-mobile-visualization-family-row-key', key);
    button.setAttribute('aria-expanded', expandedGroupKey === key ? 'true' : 'false');

    if (button.dataset.mobileVisualizationFamilyBound !== 'true') {
      button.dataset.mobileVisualizationFamilyBound = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        expandedGroupKey = expandedGroupKey === key ? null : key;
        scheduleApplyPanelStats();
      });
    }

    if (expandedGroupKey === key) {
      button.insertAdjacentElement('afterend', buildNamesList(key, detail));
    }
  });
}

function scheduleApplyPanelStats() {
  if (scheduled) return;
  scheduled = true;

  window.requestAnimationFrame(() => {
    scheduled = false;
    void ensureDataLoaded().then(applyPanelStatsNow);
  });
}

function resetExpandedGroupOnTabChange(event: Event) {
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest('button[aria-pressed]');
  const label = button?.textContent?.trim();
  if (label === 'Núcleo' || label === 'Ascendentes' || label === 'Colaterais') {
    expandedGroupKey = null;
    scheduleApplyPanelStats();
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  ensureStyles();
  scheduleApplyPanelStats();
  APPLY_DELAY_MS.forEach((delay) => window.setTimeout(scheduleApplyPanelStats, delay));

  const observer = new MutationObserver(scheduleApplyPanelStats);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('click', resetExpandedGroupOnTabChange, { capture: true });
  window.addEventListener('resize', scheduleApplyPanelStats, { passive: true });
  window.addEventListener('orientationchange', scheduleApplyPanelStats, { passive: true });
  window.addEventListener('popstate', () => {
    expandedGroupKey = null;
    scheduleApplyPanelStats();
  }, { passive: true });
  document.addEventListener('visibilitychange', scheduleApplyPanelStats, { passive: true });
}

export {};
