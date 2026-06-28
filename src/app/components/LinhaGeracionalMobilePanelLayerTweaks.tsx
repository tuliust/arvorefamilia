import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useAuth } from '../contexts/AuthContext';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../services/dataService';
import { getPrimaryLinkedPersonWithPessoa } from '../services/memberProfileService';
import type { Pessoa, Relacionamento } from '../types';
import { isPetFamilyMember } from '../utils/personEntity';

const LINE_PANEL_OPEN_CLASS = 'linha-geracional-controls-panel-open';
const LINE_PANEL_CLOSE_BUTTON_CLASS = 'linha-geracional-controls-panel-close-button';
const LINE_PANEL_Z_INDEX = '2147483700';
const LINE_PANEL_CONTENT_Z_INDEX = '2147483701';
const LINE_PANEL_CLOSE_Z_INDEX = '2147483702';

type FamilyGroupKey =
  | 'pais'
  | 'conjuges'
  | 'irmaos'
  | 'filhos'
  | 'pets'
  | 'avos'
  | 'bisavos'
  | 'tataravos'
  | 'tios'
  | 'primos'
  | 'sobrinhos';

type FamilyGroupPersonOption = {
  id: string;
  label: string;
};

type FamilyGroupOptions = Record<FamilyGroupKey, FamilyGroupPersonOption[]>;

type RelationshipIndex = {
  parentsByChild: Map<string, Set<string>>;
  childrenByParent: Map<string, Set<string>>;
  siblingsByPerson: Map<string, Set<string>>;
  spousesByPerson: Map<string, Set<string>>;
};

const EMPTY_GROUP_OPTIONS: FamilyGroupOptions = {
  pais: [],
  conjuges: [],
  irmaos: [],
  filhos: [],
  pets: [],
  avos: [],
  bisavos: [],
  tataravos: [],
  tios: [],
  primos: [],
  sobrinhos: [],
};

const FAMILY_GROUP_LABELS: Record<FamilyGroupKey, string> = {
  pais: 'Pais',
  conjuges: 'Cônjuges',
  irmaos: 'Irmãos',
  filhos: 'Filhos',
  pets: 'Pets',
  avos: 'Avós',
  bisavos: 'Bisavós',
  tataravos: 'Tataravós',
  tios: 'Tios',
  primos: 'Primos',
  sobrinhos: 'Sobrinhos',
};

const styles = `
@media (max-width: 767px) {
  html.${LINE_PANEL_OPEN_CLASS} header {
    z-index: 0 !important;
  }

  html.${LINE_PANEL_OPEN_CLASS} [data-linha-geracional-mobile-root="true"] {
    overflow: visible !important;
  }

  html.${LINE_PANEL_OPEN_CLASS} [role="dialog"][aria-label="Painel de visualização"] {
    position: fixed !important;
    inset: 0 !important;
    z-index: ${LINE_PANEL_Z_INDEX} !important;
  }

  html.${LINE_PANEL_OPEN_CLASS} [role="dialog"][aria-label="Painel de visualização"] > section,
  html.${LINE_PANEL_OPEN_CLASS} [role="dialog"][aria-label="Painel de visualização"] section {
    z-index: ${LINE_PANEL_CONTENT_Z_INDEX} !important;
  }

  html.${LINE_PANEL_OPEN_CLASS} [role="dialog"][aria-label="Painel de visualização"] button[class*="border-blue-100"][class*="w-full"] {
    min-height: 2.7rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    padding-top: 0.38rem !important;
    padding-bottom: 0.38rem !important;
    padding-left: 1.25rem !important;
    padding-right: 1rem !important;
    text-align: left !important;
  }

  html.${LINE_PANEL_OPEN_CLASS} [role="dialog"][aria-label="Painel de visualização"] button[class*="border-blue-100"][class*="w-full"] > span {
    display: block !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    overflow: hidden !important;
    text-align: left !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
    line-height: 1.1 !important;
    font-size: clamp(0.78rem, 3.2vw, 0.92rem) !important;
    letter-spacing: -0.02em !important;
  }

  html.${LINE_PANEL_OPEN_CLASS} .${LINE_PANEL_CLOSE_BUTTON_CLASS} {
    position: absolute !important;
    top: 0.75rem !important;
    right: 0.75rem !important;
    z-index: ${LINE_PANEL_CLOSE_Z_INDEX} !important;
    display: inline-flex !important;
    height: 2.75rem !important;
    width: 2.75rem !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 9999px !important;
    border: 1px solid rgb(226 232 240) !important;
    background: rgba(255, 255, 255, 0.98) !important;
    color: rgb(15 23 42) !important;
    font-size: 2rem !important;
    font-weight: 500 !important;
    line-height: 1 !important;
    box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12) !important;
    -webkit-tap-highlight-color: transparent !important;
  }
}
`;

function isMobileViewport() {
  return window.matchMedia('(max-width: 767px)').matches;
}

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function setStyle(element: HTMLElement | null, property: string, value: string) {
  if (!element) return;
  if (element.style.getPropertyValue(property) === value) return;
  element.style.setProperty(property, value);
}

function addToSetMap(map: Map<string, Set<string>>, key?: string | null, value?: string | null) {
  if (!key || !value || key === value) return;
  if (!map.has(key)) map.set(key, new Set<string>());
  map.get(key)?.add(value);
}

function unique(ids: Array<string | undefined | null>) {
  return Array.from(new Set(ids.filter(Boolean) as string[]));
}

function getFirstTwoNames(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');
}

function getPersonLabel(pessoa: Pessoa | undefined, fallbackId: string) {
  return getFirstTwoNames(String(pessoa?.nome_completo || fallbackId).trim()) || fallbackId;
}

function sortPersonOptions(ids: string[], pessoasById: Map<string, Pessoa>) {
  return unique(ids)
    .map((id) => ({
      id,
      label: getPersonLabel(pessoasById.get(id), id),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR', { sensitivity: 'base' }));
}

function buildRelationshipIndex(relacionamentos: Relacionamento[]) {
  const index: RelationshipIndex = {
    parentsByChild: new Map<string, Set<string>>(),
    childrenByParent: new Map<string, Set<string>>(),
    siblingsByPerson: new Map<string, Set<string>>(),
    spousesByPerson: new Map<string, Set<string>>(),
  };

  relacionamentos
    .filter((relationship) => relationship.ativo !== false)
    .forEach((relationship) => {
      if (relationship.tipo_relacionamento === 'conjuge') {
        addToSetMap(index.spousesByPerson, relationship.pessoa_origem_id, relationship.pessoa_destino_id);
        addToSetMap(index.spousesByPerson, relationship.pessoa_destino_id, relationship.pessoa_origem_id);
        return;
      }

      if (relationship.tipo_relacionamento === 'irmao') {
        addToSetMap(index.siblingsByPerson, relationship.pessoa_origem_id, relationship.pessoa_destino_id);
        addToSetMap(index.siblingsByPerson, relationship.pessoa_destino_id, relationship.pessoa_origem_id);
        return;
      }

      if (relationship.tipo_relacionamento === 'filho') {
        addToSetMap(index.parentsByChild, relationship.pessoa_destino_id, relationship.pessoa_origem_id);
        addToSetMap(index.childrenByParent, relationship.pessoa_origem_id, relationship.pessoa_destino_id);
        return;
      }

      if (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae') {
        addToSetMap(index.parentsByChild, relationship.pessoa_origem_id, relationship.pessoa_destino_id);
        addToSetMap(index.childrenByParent, relationship.pessoa_destino_id, relationship.pessoa_origem_id);
      }
    });

  return index;
}

function findParents(personId: string, index: RelationshipIndex) {
  return Array.from(index.parentsByChild.get(personId) || []);
}

function findChildren(personId: string, index: RelationshipIndex) {
  return Array.from(index.childrenByParent.get(personId) || []);
}

function findSpouses(personId: string, index: RelationshipIndex) {
  return Array.from(index.spousesByPerson.get(personId) || []);
}

function findSiblings(personId: string, index: RelationshipIndex) {
  const sharedParentSiblings = findParents(personId, index).flatMap((parentId) => findChildren(parentId, index));
  const explicitSiblings = Array.from(index.siblingsByPerson.get(personId) || []);
  return unique([...sharedParentSiblings, ...explicitSiblings]).filter((id) => id !== personId);
}

function findAncestors(ids: string[], index: RelationshipIndex) {
  return unique(ids.flatMap((id) => findParents(id, index)));
}

function buildFamilyGroupOptions(
  centralPersonId: string,
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[]
): FamilyGroupOptions {
  if (!centralPersonId) return EMPTY_GROUP_OPTIONS;

  const pessoasById = new Map(
    pessoas
      .filter((pessoa) => Boolean(pessoa.id))
      .map((pessoa) => [pessoa.id, pessoa] as [string, Pessoa])
  );
  const index = buildRelationshipIndex(relacionamentos);
  const parents = findParents(centralPersonId, index).filter((id) => !isPetFamilyMember(pessoasById.get(id)));
  const children = findChildren(centralPersonId, index);
  const humanChildren = children.filter((id) => !isPetFamilyMember(pessoasById.get(id)));
  const pets = children.filter((id) => isPetFamilyMember(pessoasById.get(id)));
  const siblings = findSiblings(centralPersonId, index).filter((id) => !isPetFamilyMember(pessoasById.get(id)));
  const grandparents = findAncestors(parents, index);
  const greatGrandparents = findAncestors(grandparents, index);
  const greatGreatGrandparents = findAncestors(greatGrandparents, index);
  const unclesAndAunts = unique(parents.flatMap((parentId) => findSiblings(parentId, index)))
    .filter((id) => id !== centralPersonId && !parents.includes(id));
  const cousins = unique(unclesAndAunts.flatMap((id) => findChildren(id, index)))
    .filter((id) => id !== centralPersonId && !isPetFamilyMember(pessoasById.get(id)));
  const nephews = unique(siblings.flatMap((id) => findChildren(id, index)))
    .filter((id) => id !== centralPersonId && !isPetFamilyMember(pessoasById.get(id)));

  return {
    pais: sortPersonOptions(parents, pessoasById),
    conjuges: sortPersonOptions(findSpouses(centralPersonId, index), pessoasById),
    irmaos: sortPersonOptions(siblings, pessoasById),
    filhos: sortPersonOptions(humanChildren, pessoasById),
    pets: sortPersonOptions(pets, pessoasById),
    avos: sortPersonOptions(grandparents, pessoasById),
    bisavos: sortPersonOptions(greatGrandparents, pessoasById),
    tataravos: sortPersonOptions(greatGreatGrandparents, pessoasById),
    tios: sortPersonOptions(unclesAndAunts, pessoasById),
    primos: sortPersonOptions(cousins, pessoasById),
    sobrinhos: sortPersonOptions(nephews, pessoasById),
  };
}

function findLineGenerationControlsPanel() {
  return document.querySelector<HTMLElement>(
    '[data-linha-geracional-mobile-root="true"] [role="dialog"][aria-label="Painel de visualização"]'
  );
}

function findFamilyGroupRow(panel: HTMLElement, key: FamilyGroupKey) {
  const expectedLabel = normalizeText(FAMILY_GROUP_LABELS[key]);
  return Array.from(panel.querySelectorAll<HTMLElement>('div[class*="border-b"]')).find((candidate) => {
    const header = Array.from(candidate.children).find((child): child is HTMLElement => (
      child instanceof HTMLElement &&
      String(child.className).includes('grid') &&
      String(child.className).includes('min-h-16')
    ));

    if (!header) return false;

    return Array.from(header.querySelectorAll('span')).some((label) => normalizeText(label.textContent) === expectedLabel);
  }) ?? null;
}

function getFamilyGroupHeader(row: HTMLElement) {
  return Array.from(row.children).find((child): child is HTMLElement => (
    child instanceof HTMLElement &&
    String(child.className).includes('grid') &&
    String(child.className).includes('min-h-16')
  )) ?? null;
}

function closeLineGenerationControlsPanel(panel: HTMLElement) {
  const closeBackdropButton = panel.querySelector<HTMLButtonElement>('button[aria-label="Fechar painel de visualização"]');
  closeBackdropButton?.click();
}

function renderFamilyGroupDetails(
  row: HTMLElement,
  people: FamilyGroupPersonOption[],
  navigateToPerson: (personId: string) => void
) {
  const nextSignature = people.map((person) => `${person.id}:${person.label}`).join('|');
  if (row.dataset.lineGenerationGroupPeople === nextSignature) return;

  row.dataset.lineGenerationGroupPeople = nextSignature;
  Array.from(row.children).slice(1).forEach((child) => child.remove());

  if (people.length === 0) return;

  const details = document.createElement('div');
  details.className = 'border-t border-slate-100 bg-slate-50/70 px-3 py-2';

  const list = document.createElement('div');
  list.className = 'flex w-full flex-col gap-1.5';

  people.forEach((person) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'flex min-h-10 w-full items-center justify-start rounded-xl border border-blue-100 bg-white px-5 py-1.5 text-left text-[13px] font-bold leading-none text-blue-950 shadow-sm transition active:scale-[0.98]';
    button.setAttribute('aria-label', `Visualizar ${person.label}`);
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      navigateToPerson(person.id);
    });

    const label = document.createElement('span');
    label.textContent = person.label;
    button.appendChild(label);
    list.appendChild(button);
  });

  details.appendChild(list);
  row.appendChild(details);
}

function patchFamilyGroupRows(
  panel: HTMLElement,
  familyGroupOptions: FamilyGroupOptions,
  navigateToPerson: (personId: string) => void
) {
  (Object.keys(FAMILY_GROUP_LABELS) as FamilyGroupKey[]).forEach((key) => {
    const row = findFamilyGroupRow(panel, key);
    const header = row ? getFamilyGroupHeader(row) : null;
    if (!row || !header) return;

    const people = familyGroupOptions[key];
    const count = header.querySelector('strong');
    if (count && count.textContent !== String(people.length)) count.textContent = String(people.length);

    renderFamilyGroupDetails(row, people, navigateToPerson);
  });
}

function ensureLineGenerationCloseButton(panel: HTMLElement) {
  const surface = panel.querySelector<HTMLElement>('section');
  if (!surface) return;

  const existingButtons = Array.from(surface.querySelectorAll<HTMLButtonElement>(`.${LINE_PANEL_CLOSE_BUTTON_CLASS}`));
  existingButtons.slice(1).forEach((button) => button.remove());
  if (existingButtons[0]) return;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = LINE_PANEL_CLOSE_BUTTON_CLASS;
  closeButton.setAttribute('aria-label', 'Fechar painel de visualização');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeLineGenerationControlsPanel(panel);
  });

  surface.appendChild(closeButton);
}

function applyLineGenerationPanelLayer(
  familyGroupOptions: FamilyGroupOptions,
  navigateToPerson: (personId: string) => void
) {
  const root = document.documentElement;

  if (!isMobileViewport()) {
    root.classList.remove(LINE_PANEL_OPEN_CLASS);
    return;
  }

  const panel = findLineGenerationControlsPanel();
  const isOpen = Boolean(panel);
  root.classList.toggle(LINE_PANEL_OPEN_CLASS, isOpen);

  if (!panel) return;

  setStyle(panel, 'position', 'fixed');
  setStyle(panel, 'inset', '0');
  setStyle(panel, 'z-index', LINE_PANEL_Z_INDEX);

  panel.querySelectorAll<HTMLElement>('section').forEach((section) => {
    setStyle(section, 'z-index', LINE_PANEL_CONTENT_Z_INDEX);
  });

  patchFamilyGroupRows(panel, familyGroupOptions, navigateToPerson);
  ensureLineGenerationCloseButton(panel);
}

export function LinhaGeracionalMobilePanelLayerTweaks() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const enabled = location.pathname === '/linha-geracional';
  const requestedPersonId = useMemo(() => new URLSearchParams(location.search).get('pessoa') || '', [location.search]);
  const [familyGroupOptions, setFamilyGroupOptions] = useState<FamilyGroupOptions>(EMPTY_GROUP_OPTIONS);

  useEffect(() => {
    if (!enabled) {
      setFamilyGroupOptions(EMPTY_GROUP_OPTIONS);
      return undefined;
    }

    let cancelled = false;

    async function loadFamilyGroupOptions() {
      try {
        const [pessoas, relacionamentos, linkedPersonResult] = await Promise.all([
          obterTodasPessoas(),
          obterTodosRelacionamentos(),
          requestedPersonId
            ? Promise.resolve({ data: { pessoa_id: requestedPersonId }, error: undefined })
            : user?.id
              ? getPrimaryLinkedPersonWithPessoa(user.id)
              : Promise.resolve({ data: null, error: undefined }),
        ]);

        if (cancelled) return;

        const centralPersonId = linkedPersonResult.data?.pessoa_id || '';
        setFamilyGroupOptions(buildFamilyGroupOptions(centralPersonId, pessoas, relacionamentos));
      } catch (error) {
        if (!cancelled) {
          console.warn('[LinhaGeracionalMobilePanelLayerTweaks] Não foi possível recalcular grupos familiares:', error);
          setFamilyGroupOptions(EMPTY_GROUP_OPTIONS);
        }
      }
    }

    void loadFamilyGroupOptions();

    return () => {
      cancelled = true;
    };
  }, [enabled, requestedPersonId, user?.id]);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove(LINE_PANEL_OPEN_CLASS);
      return undefined;
    }

    let frameId: number | null = null;

    const navigateToPerson = (personId: string) => {
      const params = new URLSearchParams(location.search);
      params.set('pessoa', personId);
      closeLineGenerationControlsPanel(findLineGenerationControlsPanel() || document.body);
      navigate(`/linha-geracional?${params.toString()}`);
    };

    const apply = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        applyLineGenerationPanelLayer(familyGroupOptions, navigateToPerson);
      });
    };

    apply();

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    window.addEventListener('resize', apply);

    return () => {
      observer.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', apply);
      document.documentElement.classList.remove(LINE_PANEL_OPEN_CLASS);
    };
  }, [enabled, familyGroupOptions, location.search, navigate]);

  if (!enabled) return null;

  return <style>{styles}</style>;
}
