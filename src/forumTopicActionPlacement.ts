const FORUM_TOOLBAR_SELECTOR = 'main section[aria-label="Busca e filtros do fórum"]';
const FORUM_NEW_TOPIC_SELECTOR = 'a[href="/forum/novo"]';

function isForumHomePath() {
  return window.location.pathname === '/forum';
}

function normalizeForumNewTopicButton(link: HTMLAnchorElement) {
  link.className = [
    'inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4',
    'text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  ].join(' ');
  link.setAttribute('aria-label', 'Criar novo tópico');

  const textNode = Array.from(link.querySelectorAll('span')).find((span) => span.textContent?.trim());
  if (textNode) {
    textNode.textContent = 'Criar novo tópico';
    textNode.className = 'truncate';
  }
}

function placeForumNewTopicButton() {
  if (!isForumHomePath()) return;

  const toolbar = document.querySelector<HTMLElement>(FORUM_TOOLBAR_SELECTOR);
  const link = document.querySelector<HTMLAnchorElement>(FORUM_NEW_TOPIC_SELECTOR);

  if (!toolbar || !link) return;

  normalizeForumNewTopicButton(link);

  if (link.parentElement !== toolbar) {
    toolbar.appendChild(link);
  }
}

function scheduleForumButtonPlacement() {
  window.requestAnimationFrame(() => {
    placeForumNewTopicButton();
    window.setTimeout(placeForumNewTopicButton, 50);
    window.setTimeout(placeForumNewTopicButton, 250);
  });
}

function patchHistoryMethod(methodName: 'pushState' | 'replaceState') {
  const original = window.history[methodName];
  window.history[methodName] = function patchedHistoryMethod(...args) {
    const result = original.apply(this, args);
    scheduleForumButtonPlacement();
    return result;
  };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  patchHistoryMethod('pushState');
  patchHistoryMethod('replaceState');

  window.addEventListener('popstate', scheduleForumButtonPlacement);
  window.addEventListener('resize', scheduleForumButtonPlacement);
  document.addEventListener('DOMContentLoaded', scheduleForumButtonPlacement);

  const observer = new MutationObserver(scheduleForumButtonPlacement);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  scheduleForumButtonPlacement();
}

export {};
