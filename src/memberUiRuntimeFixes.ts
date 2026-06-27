export {};

const RUNTIME_FIX_ATTR = 'data-member-ui-runtime-fix';
const RUNTIME_FIX_SIGNATURE_ATTR = 'data-member-ui-runtime-signature';
const MARRIAGE_CARD_ID = 'casamentos';
const MENTION_OVERLAY_ATTR = 'data-forum-mention-overlay';
const MENTION_ENHANCED_ATTR = 'data-forum-mention-enhanced';

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function isCurrentPath(path: string) {
  return window.location.pathname === path;
}

function isForumTopicPath() {
  return /^\/forum\/topico\/[^/]+\/?$/.test(window.location.pathname);
}

function getFirstTwoNames(name: string) {
  const parts = normalizeSpaces(name).split(' ').filter(Boolean);
  return parts.slice(0, 2).join(' ') || name.trim();
}

function getShortMarriageNames(rawTitle: string) {
  const names = normalizeSpaces(rawTitle).replace(/^(Data de casamento de|Aniversário de casamento de)\s+/i, '');
  const [firstPerson, ...remainingParts] = names.split(/\s+e\s+/i);
  const secondPerson = remainingParts.join(' e ');

  if (!secondPerson) return getFirstTwoNames(names);
  return `${getFirstTwoNames(firstPerson)} e ${getFirstTwoNames(secondPerson)}`;
}

function maybeShortenCalendarText(value: string) {
  const trimmed = normalizeSpaces(value);

  if (/^(Data de casamento de|Aniversário de casamento de)\s+/i.test(trimmed)) {
    return getShortMarriageNames(trimmed);
  }

  return value.replace(/Memória de\s+([^\n.,;]+)/gi, (_match, name: string) => `Memória de ${getFirstTwoNames(name)}`);
}

function replaceVisibleText(root: ParentNode, replacer: (value: string) => string) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest('script, style, input, textarea, select')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    if (current instanceof Text) nodes.push(current);
    current = walker.nextNode();
  }

  nodes.forEach((node) => {
    const currentValue = node.nodeValue ?? '';
    const nextValue = replacer(currentValue);
    if (nextValue !== currentValue) node.nodeValue = nextValue;
  });
}

type MarriageSummaryItem = {
  href: string;
  title: string;
  day: string;
  badge: string;
};

function getMarriageTitleFromAnchor(anchor: HTMLAnchorElement) {
  const storedTitle = anchor.getAttribute('data-member-ui-marriage-title');
  if (storedTitle) return storedTitle;

  const candidates = Array.from(anchor.querySelectorAll<HTMLElement>('span, p, div'))
    .map((element) => normalizeSpaces(element.textContent ?? ''))
    .filter(Boolean);
  const rawTitle = candidates.find((candidate) => /^(Data de casamento de|Aniversário de casamento de)\s+/i.test(candidate));

  if (!rawTitle) return '';

  const shortTitle = getShortMarriageNames(rawTitle);
  anchor.setAttribute('data-member-ui-marriage-title', shortTitle);
  return shortTitle;
}

function getCalendarDayFromAnchor(anchor: HTMLAnchorElement) {
  const storedDay = anchor.getAttribute('data-member-ui-marriage-day');
  if (storedDay) return storedDay;

  const calendarCell = anchor.closest('.border-b.border-r');
  const dayElement = calendarCell?.querySelector<HTMLElement>(':scope > div span');
  const day = normalizeSpaces(dayElement?.textContent ?? '');

  if (day) anchor.setAttribute('data-member-ui-marriage-day', day);
  return day;
}

function getMarriageBadgeFromAnchor(anchor: HTMLAnchorElement) {
  const storedBadge = anchor.getAttribute('data-member-ui-marriage-badge');
  if (storedBadge) return storedBadge;

  const text = normalizeSpaces(anchor.textContent ?? '');
  const yearsMatch = text.match(/(\d+)\s+anos?\s+desde\s+o\s+casamento/i);
  const badge = yearsMatch ? `Há ${yearsMatch[1]} anos` : 'Casamento';

  anchor.setAttribute('data-member-ui-marriage-badge', badge);
  return badge;
}

function collectMarriageSummaries() {
  const summaries = new Map<string, MarriageSummaryItem>();
  const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('main a[href]'));

  anchors.forEach((anchor) => {
    if (anchor.closest(`#${MARRIAGE_CARD_ID}`)) return;

    const title = getMarriageTitleFromAnchor(anchor);
    if (!title) return;

    const href = anchor.getAttribute('href') ?? '#';
    const day = getCalendarDayFromAnchor(anchor);
    const badge = getMarriageBadgeFromAnchor(anchor);
    const key = `${href}|${title}|${day}`;

    summaries.set(key, { href, title, day, badge });
  });

  return Array.from(summaries.values());
}

function createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, className?: string) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  return element;
}

function renderMarriageSummaryCard(items: MarriageSummaryItem[]) {
  const birthdayCard = document.getElementById('aniversariantes');
  const parent = birthdayCard?.parentElement;
  if (!birthdayCard || !parent) return;

  let card = document.getElementById(MARRIAGE_CARD_ID);
  if (!card) {
    card = createElement('div', 'scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm');
    card.id = MARRIAGE_CARD_ID;
    card.setAttribute(RUNTIME_FIX_ATTR, 'casamentos');
    birthdayCard.insertAdjacentElement('afterend', card);
  }

  const signature = JSON.stringify(items);
  if (card.getAttribute(RUNTIME_FIX_SIGNATURE_ATTR) === signature) return;
  card.setAttribute(RUNTIME_FIX_SIGNATURE_ATTR, signature);

  const title = createElement('h3', 'mb-4 flex items-center gap-2 text-lg font-bold text-gray-900');
  const icon = createElement('span', 'inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-lg text-red-700');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '💍';
  title.append(icon, document.createTextNode('Casamentos'));

  const list = createElement('div', 'space-y-3');

  if (items.length === 0) {
    const empty = createElement('p', 'text-sm text-gray-500');
    empty.textContent = 'Nenhum casamento neste mês com os filtros atuais.';
    list.appendChild(empty);
  } else {
    items.forEach((item) => {
      const link = createElement('a', 'grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-xl border border-gray-200 px-3 py-3 hover:bg-gray-50');
      link.href = item.href;

      const content = createElement('div', 'min-w-0');
      const name = createElement('p', 'break-words text-sm font-semibold leading-snug text-gray-900');
      name.textContent = item.title;
      const day = createElement('p', 'mt-1 text-xs text-gray-500');
      day.textContent = item.day ? `Dia ${item.day}` : 'Data de casamento';
      content.append(name, day);

      const badge = createElement('span', 'max-w-[90px] shrink-0 text-right text-xs font-medium leading-tight');
      badge.style.color = '#B91C1C';
      badge.textContent = item.badge;

      link.append(content, badge);
      list.appendChild(link);
    });
  }

  card.replaceChildren(title, list);
}

function applyCalendarFixes() {
  if (!isCurrentPath('/calendario-familiar')) return;

  const summaries = collectMarriageSummaries();
  const root = document.querySelector('main') ?? document.body;
  replaceVisibleText(root, maybeShortenCalendarText);
  renderMarriageSummaryCard(summaries);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildMentionHighlight(value: string) {
  if (!value) return '<span style="color: transparent;">&nbsp;</span>';

  const mentionRegex = /@[\p{L}\p{N}_-]+(?:\s+[\p{L}\p{N}_-]+){0,5}/gu;
  let html = '';
  let lastIndex = 0;
  let match = mentionRegex.exec(value);

  while (match) {
    html += escapeHtml(value.slice(lastIndex, match.index));
    html += `<strong style="color: #2563eb; font-weight: 700;">${escapeHtml(match[0])}</strong>`;
    lastIndex = match.index + match[0].length;
    match = mentionRegex.exec(value);
  }

  html += escapeHtml(value.slice(lastIndex));
  return html;
}

function updateMentionOverlay(textarea: HTMLTextAreaElement) {
  const parent = textarea.parentElement;
  if (!parent) return;

  parent.style.position = parent.style.position || 'relative';

  let overlay = parent.querySelector<HTMLElement>(`[${MENTION_OVERLAY_ATTR}="true"]`);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.setAttribute(MENTION_OVERLAY_ATTR, 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.position = 'absolute';
    overlay.style.inset = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.overflow = 'hidden';
    overlay.style.whiteSpace = 'pre-wrap';
    overlay.style.overflowWrap = 'break-word';
    overlay.style.wordBreak = 'break-word';
    overlay.style.zIndex = '0';
    parent.insertBefore(overlay, textarea);
  }

  const computed = window.getComputedStyle(textarea);
  overlay.style.padding = computed.padding;
  overlay.style.font = computed.font;
  overlay.style.letterSpacing = computed.letterSpacing;
  overlay.style.lineHeight = computed.lineHeight;
  overlay.style.border = '1px solid transparent';
  overlay.style.borderRadius = computed.borderRadius;

  textarea.style.backgroundColor = 'transparent';
  textarea.style.color = 'transparent';
  textarea.style.caretColor = '#111827';
  textarea.style.position = 'relative';
  textarea.style.zIndex = '1';
  textarea.style.setProperty('-webkit-text-fill-color', 'transparent');

  const signature = `${textarea.value}|${textarea.scrollTop}|${textarea.clientWidth}|${textarea.clientHeight}`;
  if (overlay.getAttribute(RUNTIME_FIX_SIGNATURE_ATTR) === signature) return;

  overlay.setAttribute(RUNTIME_FIX_SIGNATURE_ATTR, signature);
  overlay.innerHTML = `<div style="transform: translateY(-${textarea.scrollTop}px);">${buildMentionHighlight(textarea.value)}</div>`;
}

function enhanceForumNewTopicTextarea() {
  if (!isCurrentPath('/forum/novo')) return;

  const textarea = document.querySelector<HTMLTextAreaElement>('textarea#conteudo');
  if (!textarea) return;

  if (textarea.getAttribute(MENTION_ENHANCED_ATTR) !== 'true') {
    textarea.setAttribute(MENTION_ENHANCED_ATTR, 'true');
    const update = () => window.requestAnimationFrame(() => updateMentionOverlay(textarea));
    textarea.addEventListener('input', update);
    textarea.addEventListener('scroll', update);
    textarea.addEventListener('keyup', update);
    textarea.addEventListener('click', update);
  }

  updateMentionOverlay(textarea);
}

function hideReplyReactionBars() {
  if (!isForumTopicPath()) return;

  const repliesSection = document.querySelector<HTMLElement>('section[aria-label="Respostas do tópico"]');
  if (!repliesSection) return;

  repliesSection.querySelectorAll<HTMLButtonElement>('button[aria-label^="Reagir com"]').forEach((button) => {
    const bar = button.closest('div.flex');
    if (!(bar instanceof HTMLElement)) return;
    bar.hidden = true;
    bar.setAttribute('aria-hidden', 'true');
    bar.setAttribute(RUNTIME_FIX_ATTR, 'reply-reactions-hidden');
  });
}

function applyUserMenuFixes() {
  const closeButton = document.querySelector<HTMLButtonElement>('button[aria-label="Fechar menu"]');
  const menu = closeButton?.closest('div');
  if (!menu) return;

  const profileButton = Array.from(menu.querySelectorAll<HTMLButtonElement>('button')).find((button) => {
    const title = button.getAttribute('title') ?? '';
    return title === 'Atualizar perfil' || normalizeSpaces(button.textContent ?? '').includes('@');
  });

  if (profileButton) {
    if (profileButton.getAttribute('title') === 'Atualizar perfil') {
      profileButton.setAttribute('title', 'Editar perfil');
    }

    const subtitle = Array.from(profileButton.querySelectorAll<HTMLElement>('span')).find((span) => (span.textContent ?? '').includes('@'));
    if (subtitle && normalizeSpaces(subtitle.textContent ?? '') !== 'Editar perfil') {
      subtitle.textContent = 'Editar perfil';
    }
  }

  Array.from(menu.querySelectorAll<HTMLButtonElement>('button')).forEach((button) => {
    const text = normalizeSpaces(button.textContent ?? '');

    if (text === 'Atualizar perfil') {
      button.remove();
      return;
    }

    if (text === 'Dúvidas?') {
      button.classList.add('border', 'border-gray-200', 'bg-white');
      button.setAttribute(RUNTIME_FIX_ATTR, 'duvidas-bordered');
    }
  });
}

function applyMeusDadosTextFixes() {
  if (!isCurrentPath('/meus-dados')) return;

  replaceVisibleText(document.body, (value) => {
    if (normalizeSpaces(value) === 'Ajustar Meus Vínculos') return 'Meus Vínculos';
    if (normalizeSpaces(value) === 'Ajustar Fatos e Arquivos Históricos') return 'Fatos e Arquivos Históricos';
    return value;
  });
}

function applyMemberUiRuntimeFixes() {
  applyCalendarFixes();
  enhanceForumNewTopicTextarea();
  hideReplyReactionBars();
  applyUserMenuFixes();
  applyMeusDadosTextFixes();
}

function installMemberUiRuntimeFixes() {
  let scheduled = false;

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      applyMemberUiRuntimeFixes();
    });
  };

  schedule();

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  window.addEventListener('resize', schedule);
  window.addEventListener('popstate', schedule);
  window.addEventListener('hashchange', schedule);
  document.addEventListener('click', () => window.setTimeout(schedule, 0), true);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installMemberUiRuntimeFixes, { once: true });
} else {
  installMemberUiRuntimeFixes();
}
