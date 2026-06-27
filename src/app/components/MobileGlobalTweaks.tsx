import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import { buildMobileFamilyTreeModel } from './FamilyTree/mobileFamilyTreeModel';
import { useAuth } from '../contexts/AuthContext';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../services/dataService';
import { getPrimaryLinkedPersonWithPessoa } from '../services/memberProfileService';
import type { Pessoa, Relacionamento } from '../types';

const mobileGlobalTweaks = `
@media (max-width: 767px) {
  header {
    z-index: 2147482000 !important;
    overflow: visible !important;
    isolation: isolate !important;
  }

  header [role="menu"][aria-label="Últimas notificações"] {
    position: fixed !important;
    left: 0.75rem !important;
    right: 0.75rem !important;
    top: calc(env(safe-area-inset-top, 0px) + 4.75rem) !important;
    width: auto !important;
    max-width: none !important;
    max-height: min(34rem, calc(100dvh - 6rem)) !important;
    transform: none !important;
    z-index: 2147483000 !important;
  }

  header div[class*="shadow-2xl"][class*="bg-white"][class*="overflow-y-auto"],
  header div[class*="shadow-2xl"][class*="bg-white"][class*="overflow-hidden"] {
    position: fixed !important;
    left: 0.75rem !important;
    right: 0.75rem !important;
    top: calc(env(safe-area-inset-top, 0px) + 4.75rem) !important;
    z-index: 2147483000 !important;
    width: auto !important;
    max-width: none !important;
    max-height: min(34rem, calc(100dvh - 6rem)) !important;
    transform: none !important;
  }

  header div[class*="max-h-96"][class*="shadow-2xl"] {
    position: fixed !important;
    left: 0.75rem !important;
    right: 0.75rem !important;
    top: calc(env(safe-area-inset-top, 0px) + 4.75rem) !important;
    z-index: 2147483000 !important;
    width: auto !important;
    max-width: none !important;
    max-height: min(28rem, calc(100dvh - 7rem)) !important;
  }

  [role="dialog"][aria-label="Painel de visualização"] {
    z-index: 2147483200 !important;
  }

  [role="dialog"][aria-label="Painel de visualização"] section {
    z-index: 2147483201 !important;
  }

  [role="dialog"][aria-label="Painel de visualização"] button span.truncate {
    display: -webkit-box !important;
    overflow: hidden !important;
    white-space: normal !important;
    text-overflow: clip !important;
    -webkit-box-orient: vertical !important;
    -webkit-line-clamp: 2 !important;
  }

  html[data-mobile-core-lower-content="false"] [data-mobile-family-tree-screen="core"] [data-mobile-tree-scroll] {
    overflow-y: hidden !important;
    overscroll-behavior-y: contain !important;
  }

  html.mobile-user-menu-open button[aria-label="Fechar menu"]:not(.fixed) {
    position: relative !important;
    z-index: 11120 !important;
  }

  html[data-mobile-route="curiosidades"] .curiosidades-top-sticky-nav,
  html[data-mobile-route="curiosidades"] .curiosidades-top-sticky-nav nav,
  html[data-mobile-route="curiosidades"] .curiosidades-top-sticky-nav .flex {
    overflow: visible !important;
  }

  html[data-mobile-route="curiosidades"] .curiosidades-section-links-wrapper {
    display: block !important;
    flex: 1 1 auto !important;
    width: 100% !important;
    min-width: 0 !important;
    overflow-x: auto !important;
    overflow-y: visible !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
  }

  html[data-mobile-route="curiosidades"] .curiosidades-section-links-wrapper::-webkit-scrollbar {
    display: none !important;
  }

  html[data-mobile-route="curiosidades"] .curiosidades-section-links {
    display: flex !important;
    width: max-content !important;
    min-width: max-content !important;
    flex-wrap: nowrap !important;
    justify-content: flex-start !important;
    transform: none !important;
  }

  html[data-mobile-route="curiosidades"] .curiosidades-section-link {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
  }

  html[data-mobile-route="person-profile"] main {
    padding-bottom: calc(9.5rem + env(safe-area-inset-bottom, 0px)) !important;
  }

  html[data-mobile-route="meus-vinculos"] article[data-relationship-group] {
    position: relative !important;
    padding-right: 3.75rem !important;
  }

  html[data-mobile-route="meus-vinculos"] article[data-relationship-group] button[aria-label="Solicitar remoção"],
  html[data-mobile-route="meus-vinculos"] article[data-relationship-group] button[aria-label="Cancelar adição"],
  html[data-mobile-route="meus-vinculos"] article[data-relationship-group] button[aria-label="Desfazer solicitação de remoção"] {
    position: absolute !important;
    right: 1rem !important;
    top: 1rem !important;
    z-index: 2 !important;
  }
}
`;

type MobileGroupKey =
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

type MobileFamilyPanelPerson = {
  id: string;
  label: string;
};

type MobileFamilyPanelData = {
  groups: Record<MobileGroupKey, {
    count: number;
    people: MobileFamilyPanelPerson[];
  }>;
  coreLowerCount: number;
  paternalCousinsCount: number;
  maternalCousinsCount: number;
};

type TouchGuardState = {
  x: number;
  y: number;
  screen: string;
};

const MOBILE_GROUP_LABELS: Record<MobileGroupKey, string> = {
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

const EMPTY_MOBILE_FAMILY_PANEL_DATA: MobileFamilyPanelData = {
  groups: {
    pais: { count: 0, people: [] },
    conjuges: { count: 0, people: [] },
    irmaos: { count: 0, people: [] },
    filhos: { count: 0, people: [] },
    pets: { count: 0, people: [] },
    avos: { count: 0, people: [] },
    bisavos: { count: 0, people: [] },
    tataravos: { count: 0, people: [] },
    tios: { count: 0, people: [] },
    primos: { count: 0, people: [] },
    sobrinhos: { count: 0, people: [] },
  },
  coreLowerCount: 0,
  paternalCousinsCount: 0,
  maternalCousinsCount: 0,
};

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMobileRoute(pathname: string) {
  if (pathname === '/meus-dados') return 'meus-dados';
  if (pathname === '/meus-vinculos') return 'meus-vinculos';
  if (pathname === '/arquivos-historicos') return 'arquivos-historicos';
  if (pathname === '/curiosidades') return 'curiosidades';
  if (pathname === '/mapa-familiar') return 'mapa-familiar';
  if (pathname === '/linha-geracional') return 'linha-geracional';
  if (pathname.startsWith('/pessoa/') || pathname.startsWith('/pessoas/')) return 'person-profile';
  return '';
}

function isDirectMobileFamilyRoute(pathname: string) {
  return pathname === '/mapa-familiar' || pathname === '/linha-geracional';
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 767px)').matches;
}

function findExactTextElement(text: string) {
  const normalizedTarget = normalizeText(text);
  return Array.from(document.querySelectorAll<HTMLElement>('h1, h2, h3, h4, p, span, div'))
    .find((element) => normalizeText(element.textContent) === normalizedTarget) ?? null;
}

function setStyleValue(element: HTMLElement, property: keyof CSSStyleDeclaration, value: string) {
  if (element.style[property] === value) return;
  element.style[property] = value as never;
}

function uniquePeople(people: Array<Pessoa | undefined | null>) {
  const seen = new Set<string>();
  return people.filter((person): person is Pessoa => {
    if (!person?.id || seen.has(person.id)) return false;
    seen.add(person.id);
    return true;
  });
}

function getFirstTwoNames(person: Pessoa) {
  const parts = String(person.nome_completo ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
  return parts[0] || person.id;
}

function toMobilePanelPeople(people: Array<Pessoa | undefined | null>): MobileFamilyPanelPerson[] {
  return uniquePeople(people)
    .map((person) => ({ id: person.id, label: getFirstTwoNames(person) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
}

function createPanelGroup(people: Array<Pessoa | undefined | null>) {
  const options = toMobilePanelPeople(people);
  return { count: options.length, people: options };
}

function buildMobileFamilyPanelData(
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[],
  centralPersonId?: string,
): MobileFamilyPanelData {
  if (!centralPersonId) return EMPTY_MOBILE_FAMILY_PANEL_DATA;

  const model = buildMobileFamilyTreeModel(pessoas, relacionamentos, centralPersonId);

  const parents = uniquePeople([model.father, model.mother]);
  const grandparents = uniquePeople([...model.paternal.grandparents, ...model.maternal.grandparents]);
  const greatGrandparents = uniquePeople([...model.paternal.greatGrandparents, ...model.maternal.greatGrandparents]);
  const greatGreatGrandparents = uniquePeople([...model.paternal.greatGreatGrandparents, ...model.maternal.greatGreatGrandparents]);
  const uncles = uniquePeople([...model.paternal.uncles, ...model.maternal.uncles]);
  const cousins = uniquePeople([...model.paternal.cousins, ...model.maternal.cousins]);

  const groups: MobileFamilyPanelData['groups'] = {
    pais: createPanelGroup(parents),
    conjuges: createPanelGroup(model.spouses),
    irmaos: createPanelGroup(model.siblings),
    filhos: createPanelGroup(model.children),
    pets: createPanelGroup(model.pets),
    avos: createPanelGroup(grandparents),
    bisavos: createPanelGroup(greatGrandparents),
    tataravos: createPanelGroup(greatGreatGrandparents),
    tios: createPanelGroup(uncles),
    primos: createPanelGroup(cousins),
    sobrinhos: createPanelGroup(model.nephews),
  };

  return {
    groups,
    coreLowerCount:
      groups.conjuges.count
      + groups.filhos.count
      + groups.sobrinhos.count
      + groups.pets.count,
    paternalCousinsCount: model.paternal.cousins.length,
    maternalCousinsCount: model.maternal.cousins.length,
  };
}

function setInlineBadgeStyle(element: HTMLElement | null) {
  if (!element) return;
  setStyleValue(element, 'display', 'inline-flex');
  setStyleValue(element, 'alignItems', 'center');
  setStyleValue(element, 'borderRadius', '9999px');
  setStyleValue(element, 'border', '1px solid rgb(229, 231, 235)');
  setStyleValue(element, 'background', 'rgb(255, 255, 255)');
  setStyleValue(element, 'padding', '0.25rem 0.625rem');
  setStyleValue(element, 'fontSize', '0.75rem');
  setStyleValue(element, 'fontWeight', '600');
  setStyleValue(element, 'lineHeight', '1rem');
  setStyleValue(element, 'color', 'rgb(55, 65, 81)');
}

function hideMeusDadosOtherAdjustments() {
  const heading = findExactTextElement('Outros ajustes');
  const card = heading?.closest('section, aside, article, .rounded-2xl, .rounded-xl') as HTMLElement | null;
  if (!card) return;

  setStyleValue(card, 'display', 'none');
}

function rewriteMeusDadosPhotoButton() {
  Array.from(document.querySelectorAll<HTMLButtonElement>('button')).forEach((button) => {
    const text = normalizeText(button.textContent);
    if (!text.includes('cadastrar')) return;
    if (!button.querySelector('svg') && !button.textContent?.includes('foto')) return;

    const visibleLabel = Array.from(button.querySelectorAll<HTMLElement>('span'))
      .find((span) => normalizeText(span.textContent) === 'cadastrar');

    if (visibleLabel) {
      if (visibleLabel.textContent !== 'Adicionar foto') visibleLabel.textContent = 'Adicionar foto';
      return;
    }

    button.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && normalizeText(node.textContent) === 'cadastrar') {
        node.textContent = 'Adicionar foto';
      }
    });
  });
}

function compactDeathStatusToggle() {
  const heading = findExactTextElement('Status da pessoa');
  const wrapper = heading?.closest('div')?.parentElement as HTMLElement | null;
  if (!wrapper) return;

  const toggle = Array.from(wrapper.querySelectorAll<HTMLElement>('div'))
    .find((element) => normalizeText(element.textContent).includes('vivo') && normalizeText(element.textContent).includes('falecido'));

  if (!toggle) return;

  setStyleValue(toggle, 'width', 'fit-content');
  setStyleValue(toggle, 'maxWidth', '100%');
  setStyleValue(toggle, 'alignSelf', 'flex-start');

  toggle.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    setStyleValue(button, 'minWidth', '4.35rem');
    setStyleValue(button, 'paddingLeft', '0.75rem');
    setStyleValue(button, 'paddingRight', '0.75rem');
  });
}

function clearButtonTextNodes(button: HTMLButtonElement) {
  Array.from(button.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && normalizeText(node.textContent)) {
      node.textContent = '';
    }
  });

  Array.from(button.children).forEach((child) => {
    if (child.tagName.toLowerCase() === 'svg') return;
    if (child instanceof HTMLElement && normalizeText(child.textContent)) {
      setStyleValue(child, 'display', 'none');
    }
  });
}

function styleIconOnlyQuestionnaireButton(button: HTMLButtonElement, label: string, iconColor: string) {
  button.setAttribute('aria-label', label);
  button.title = label;
  setStyleValue(button, 'width', '3.25rem');
  setStyleValue(button, 'minWidth', '3.25rem');
  setStyleValue(button, 'maxWidth', '3.25rem');
  setStyleValue(button, 'height', '3rem');
  setStyleValue(button, 'flex', '0 0 3.25rem');
  setStyleValue(button, 'justifyContent', 'center');
  setStyleValue(button, 'gap', '0');
  clearButtonTextNodes(button);

  const svg = button.querySelector<SVGElement>('svg');
  if (!svg) return;

  svg.style.opacity = '1';
  svg.style.color = iconColor;
  svg.style.stroke = iconColor;
  svg.setAttribute('aria-hidden', 'true');
}

function fixQuestionnaireNavigationIcons() {
  const section = Array.from(document.querySelectorAll<HTMLElement>('section')).find((candidate) => {
    const text = normalizeText(candidate.textContent);
    return text.includes('sobre mim') && text.includes('etapa') && text.includes('voltar');
  });

  if (!section) return;

  const actionBar = Array.from(section.querySelectorAll<HTMLElement>('div'))
    .reverse()
    .find((node) => {
      const text = normalizeText(node.textContent);
      return text.includes('voltar') && (text.includes('pular tudo') || text.includes('avancar') || text.includes('avançar'));
    }) ?? null;

  if (!actionBar) return;

  setStyleValue(actionBar, 'display', 'flex');
  setStyleValue(actionBar, 'flexDirection', 'row');
  setStyleValue(actionBar, 'alignItems', 'center');
  setStyleValue(actionBar, 'gap', '0.5rem');
  setStyleValue(actionBar, 'justifyContent', 'space-between');

  const portalHost = actionBar.querySelector<HTMLElement>('#meus-dados-profile-bio-actions-host');
  if (portalHost) {
    setStyleValue(portalHost, 'display', 'contents');
    const portalContainer = portalHost.firstElementChild;
    if (portalContainer instanceof HTMLElement) setStyleValue(portalContainer, 'display', 'contents');
  }

  const buttons = Array.from(actionBar.querySelectorAll<HTMLButtonElement>('button'));
  const backButton = buttons.find((button) => normalizeText(button.textContent).includes('voltar'));
  const skipButton = buttons.find((button) => normalizeText(button.textContent).includes('pular tudo'));
  const nextButton = buttons.find((button) => {
    const text = normalizeText(button.textContent);
    return text.includes('avancar') || text.includes('avançar') || text.includes('salvando');
  });

  if (backButton) {
    styleIconOnlyQuestionnaireButton(backButton, 'Voltar', 'rgb(37, 99, 235)');
    setStyleValue(backButton, 'order', '1');
  }

  if (skipButton) {
    setStyleValue(skipButton, 'order', '2');
    setStyleValue(skipButton, 'height', '3rem');
    setStyleValue(skipButton, 'flex', '1 1 auto');
    setStyleValue(skipButton, 'minWidth', '0');
    setStyleValue(skipButton, 'width', 'auto');
    setStyleValue(skipButton, 'justifyContent', 'center');
  }

  if (nextButton) {
    styleIconOnlyQuestionnaireButton(nextButton, 'Avançar', 'rgb(255, 255, 255)');
    setStyleValue(nextButton, 'order', '3');
  }
}

function rewriteMobileTreeHeaderTitle() {
  document.querySelectorAll<HTMLElement>('header h1').forEach((title) => {
    if (normalizeText(title.textContent).startsWith('familia de ')) {
      if (title.textContent !== 'Árvore Familiar') title.textContent = 'Árvore Familiar';
    }
  });
}

function expandMobileUserMenu() {
  if (!document.documentElement.classList.contains('mobile-user-menu-open')) return;

  const closeButton = document.querySelector<HTMLButtonElement>('button[aria-label="Fechar menu"]:not(.fixed)');
  const panel = closeButton?.closest('div.fixed') as HTMLElement | null;
  if (!panel) return;

  setStyleValue(panel, 'top', 'calc(env(safe-area-inset-top, 0px) + 1rem)');
  setStyleValue(panel, 'maxHeight', 'calc(100dvh - 2rem - env(safe-area-inset-top, 0px))');
  setStyleValue(panel, 'zIndex', '11110');
}

function preventMobileAddRelativeDialogAutoKeyboard() {
  const title = Array.from(document.querySelectorAll<HTMLElement>('h1, h2, h3, [data-slot="dialog-title"]'))
    .find((element) => normalizeText(element.textContent).startsWith('adicionar '));
  const dialog = title?.closest('[data-slot="dialog-content"]') as HTMLElement | null;
  if (!dialog || dialog.dataset.mobileAddRelativeAutoblurred === 'true') return;

  const input = dialog.querySelector<HTMLInputElement>('#relative-search-name');
  if (!input) return;

  dialog.dataset.mobileAddRelativeAutoblurred = 'true';
  dialog.setAttribute('tabindex', '-1');

  const blurInput = () => {
    if (document.activeElement === input) input.blur();
    dialog.focus({ preventScroll: true });
  };

  window.requestAnimationFrame(blurInput);
  window.setTimeout(blurInput, 80);
  window.setTimeout(blurInput, 220);
}

function restoreRelationshipCardsForDesktop() {
  document.querySelectorAll<HTMLElement>('[data-mobile-review-badge="true"]').forEach((badge) => badge.remove());
  document.querySelectorAll<HTMLElement>('[data-mobile-original-review-badge="true"]').forEach((badge) => {
    setStyleValue(badge, 'display', '');
    delete badge.dataset.mobileOriginalReviewBadge;
  });
  document.querySelectorAll<HTMLElement>('[data-mobile-life-badge="true"]').forEach((badge) => {
    badge.removeAttribute('style');
    delete badge.dataset.mobileLifeBadge;
  });
}

function enhanceMobileRelationshipCards() {
  document.querySelectorAll<HTMLElement>('article[data-relationship-group]').forEach((card) => {
    const actionButton = card.querySelector<HTMLButtonElement>('button[aria-label="Solicitar remoção"], button[aria-label="Cancelar adição"], button[aria-label="Desfazer solicitação de remoção"]');
    const actionContainer = actionButton?.closest('div') as HTMLElement | null;
    const originalBadge = actionContainer?.querySelector<HTMLElement>('span');
    const lifeBadge = Array.from(card.querySelectorAll<HTMLElement>('span')).find((span) => {
      const text = normalizeText(span.textContent);
      return text === 'vivo' || text === 'falecido' || text === 'falecida';
    }) ?? null;

    if (!originalBadge || !lifeBadge) return;

    const badgesRow = lifeBadge.closest('div') as HTMLElement | null;
    if (!badgesRow) return;

    if (originalBadge.style.display !== 'none') {
      originalBadge.dataset.mobileOriginalReviewBadge = 'true';
      setStyleValue(originalBadge, 'display', 'none');
    }

    let mobileBadge = badgesRow.querySelector<HTMLElement>('[data-mobile-review-badge="true"]');
    if (!mobileBadge) {
      mobileBadge = document.createElement('span');
      mobileBadge.dataset.mobileReviewBadge = 'true';
      badgesRow.insertBefore(mobileBadge, badgesRow.firstChild);
    }

    if (mobileBadge.textContent !== originalBadge.textContent) {
      mobileBadge.textContent = originalBadge.textContent ?? '';
    }

    setInlineBadgeStyle(mobileBadge);
    setInlineBadgeStyle(lifeBadge);
    lifeBadge.dataset.mobileLifeBadge = 'true';

    setStyleValue(badgesRow, 'display', 'flex');
    setStyleValue(badgesRow, 'flexDirection', 'row');
    setStyleValue(badgesRow, 'alignItems', 'center');
    setStyleValue(badgesRow, 'gap', '0.5rem');
    setStyleValue(badgesRow, 'flexWrap', 'wrap');
  });
}

function getMobileFamilyPanelRow(panel: HTMLElement, key: MobileGroupKey) {
  const normalizedLabel = normalizeText(MOBILE_GROUP_LABELS[key]);
  const label = Array.from(panel.querySelectorAll<HTMLElement>('span'))
    .find((element) => normalizeText(element.textContent) === normalizedLabel);
  return label?.closest('div.border-b') as HTMLElement | null;
}

function navigateMobileFamilyAsPerson(personId: string) {
  const params = new URLSearchParams(window.location.search);
  params.set('pessoa', personId);
  window.location.assign(`${window.location.pathname}?${params.toString()}`);
}

function updateMobileFamilyPanel(data: MobileFamilyPanelData | null) {
  const panel = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Painel de visualização"]');
  if (!panel || !data) return;

  (Object.keys(MOBILE_GROUP_LABELS) as MobileGroupKey[]).forEach((key) => {
    const row = getMobileFamilyPanelRow(panel, key);
    if (!row) return;

    const group = data.groups[key];
    const count = row.querySelector<HTMLElement>('strong');
    const countText = String(group.count);
    if (count && count.textContent !== countText) count.textContent = countText;

    const header = row.firstElementChild;
    if (!header) return;

    Array.from(row.children).slice(1).forEach((child) => {
      if (!(child instanceof HTMLElement)) return;
      if (child.dataset.mobileFamilyGroupList === key) return;
      child.remove();
    });

    const signature = group.people.map((person) => `${person.id}:${person.label}`).join('|');
    let list = row.querySelector<HTMLElement>(`[data-mobile-family-group-list="${key}"]`);

    if (group.people.length === 0) {
      list?.remove();
      return;
    }

    if (list?.dataset.mobileFamilyGroupSignature === signature) return;

    list?.remove();
    list = document.createElement('div');
    list.dataset.mobileFamilyGroupList = key;
    list.dataset.mobileFamilyGroupSignature = signature;
    list.className = 'border-t border-slate-100 bg-slate-50/70 px-3 pb-3 pt-3';

    const inner = document.createElement('div');
    inner.className = 'flex w-full flex-col gap-2';

    group.people.forEach((person) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'flex w-full items-center justify-start rounded-xl border border-blue-100 bg-white px-3 py-2 text-left text-[13px] font-bold leading-tight text-blue-950 shadow-sm transition active:scale-[0.98]';
      button.textContent = person.label;
      button.addEventListener('click', () => navigateMobileFamilyAsPerson(person.id));
      inner.appendChild(button);
    });

    list.appendChild(inner);
    row.appendChild(list);
  });
}

function applyMobileFamilyPanelDataset(data: MobileFamilyPanelData | null) {
  document.documentElement.dataset.mobileCoreLowerContent = data && data.coreLowerCount > 0 ? 'true' : 'false';
}

function applyMobileDomTweaks(pathname: string, mobileFamilyPanelData: MobileFamilyPanelData | null) {
  const route = getMobileRoute(pathname);
  document.documentElement.dataset.mobileRoute = route;

  if (!isMobileViewport()) {
    restoreRelationshipCardsForDesktop();
    return;
  }

  rewriteMobileTreeHeaderTitle();
  expandMobileUserMenu();

  if (isDirectMobileFamilyRoute(pathname)) {
    applyMobileFamilyPanelDataset(mobileFamilyPanelData);
    updateMobileFamilyPanel(mobileFamilyPanelData);
  }

  if (route === 'meus-dados') {
    hideMeusDadosOtherAdjustments();
    rewriteMeusDadosPhotoButton();
    compactDeathStatusToggle();
    fixQuestionnaireNavigationIcons();
  }

  if (route === 'meus-vinculos') {
    enhanceMobileRelationshipCards();
    preventMobileAddRelativeDialogAutoKeyboard();
  }
}

function shouldBlockMobileTreeSwipe(screen: string, direction: 'up' | 'down', data: MobileFamilyPanelData | null) {
  if (!data || direction !== 'down') return false;
  if (screen === 'core') return data.coreLowerCount <= 0;
  if (screen === 'paternal-uncles') return data.paternalCousinsCount <= 0;
  if (screen === 'maternal-uncles') return data.maternalCousinsCount <= 0;
  return false;
}

export function MobileGlobalTweaks() {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileFamilyPanelData, setMobileFamilyPanelData] = useState<MobileFamilyPanelData | null>(null);
  const touchGuardRef = useRef<TouchGuardState | null>(null);

  useEffect(() => {
    if (!isDirectMobileFamilyRoute(location.pathname) || !isMobileViewport()) {
      setMobileFamilyPanelData(null);
      return;
    }

    let cancelled = false;

    async function loadMobileFamilyPanelData() {
      try {
        const requestedPersonId = new URLSearchParams(location.search).get('pessoa') || '';
        const [pessoas, relacionamentos, linkedPersonResult] = await Promise.all([
          obterTodasPessoas(),
          obterTodosRelacionamentos(),
          requestedPersonId || !user?.id
            ? Promise.resolve(null)
            : getPrimaryLinkedPersonWithPessoa(user.id),
        ]);

        if (cancelled) return;

        const centralPersonId = requestedPersonId
          || linkedPersonResult?.data?.pessoa_id
          || linkedPersonResult?.data?.pessoa?.id
          || '';

        setMobileFamilyPanelData(buildMobileFamilyPanelData(pessoas, relacionamentos, centralPersonId));
      } catch (error) {
        if (!cancelled) {
          console.warn('[MobileGlobalTweaks] Não foi possível carregar vínculos do painel mobile:', error);
          setMobileFamilyPanelData(EMPTY_MOBILE_FAMILY_PANEL_DATA);
        }
      }
    }

    void loadMobileFamilyPanelData();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search, user?.id]);

  useEffect(() => {
    if (!isDirectMobileFamilyRoute(location.pathname)) return undefined;

    const handleTouchStart = (event: TouchEvent) => {
      if (!isMobileViewport()) return;
      const touch = event.touches[0];
      const target = event.target;
      if (!touch || !(target instanceof HTMLElement)) return;

      const screen = target.closest<HTMLElement>('[data-mobile-family-tree-screen]');
      touchGuardRef.current = screen
        ? { x: touch.clientX, y: touch.clientY, screen: screen.dataset.mobileFamilyTreeScreen || '' }
        : null;
    };

    const stopBlockedSwipe = (event: TouchEvent) => {
      const start = touchGuardRef.current;
      const touch = event.changedTouches[0] || event.touches[0];
      if (!start || !touch) return;

      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      const absoluteX = Math.abs(deltaX);
      const absoluteY = Math.abs(deltaY);
      if (absoluteY < 12 || absoluteY <= absoluteX * 1.2) return;

      const direction = deltaY < 0 ? 'down' : 'up';
      if (!shouldBlockMobileTreeSwipe(start.screen, direction, mobileFamilyPanelData)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      stopBlockedSwipe(event);
      touchGuardRef.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
    document.addEventListener('touchmove', stopBlockedSwipe, { capture: true, passive: false });
    document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchmove', stopBlockedSwipe, { capture: true });
      document.removeEventListener('touchend', handleTouchEnd, { capture: true });
    };
  }, [location.pathname, mobileFamilyPanelData]);

  useEffect(() => {
    let frameId: number | null = null;
    const apply = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        try {
          applyMobileDomTweaks(location.pathname, mobileFamilyPanelData);
        } catch (error) {
          console.warn('[MobileGlobalTweaks] Ajustes mobile ignorados para evitar bloqueio da página:', error);
        }
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('resize', apply);

    const timerIds = [
      window.setTimeout(apply, 80),
      window.setTimeout(apply, 250),
      window.setTimeout(apply, 700),
    ];

    return () => {
      observer.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', apply);
      timerIds.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [location.pathname, mobileFamilyPanelData]);

  return <style>{mobileGlobalTweaks}</style>;
}
