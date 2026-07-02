const RESPONSIBLE_PERSPECTIVE_STORAGE_KEY = 'arvorefamilia:responsible-perspective';
const MEMORIAL_NOTICE_ID = 'arvorefamilia-memorial-interaction-notice';
const MEUS_DADOS_STYLE_ID = 'arvorefamilia-meus-dados-runtime-layout-fix';
const PET_MODAL_STYLE_ID = 'arvorefamilia-pet-modal-runtime-layout-fix';

function normalizeRuntimeText(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getResponsiblePerspectiveRuntime() {
  try {
    const raw = window.localStorage.getItem(RESPONSIBLE_PERSPECTIVE_STORAGE_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as { falecido?: boolean; nomeCompleto?: string } | null;
  } catch {
    return null;
  }
}

function isMemorialPerspectiveRuntime() {
  return getResponsiblePerspectiveRuntime()?.falecido === true;
}

function isForumPath() {
  return window.location.pathname === '/forum' || window.location.pathname.startsWith('/forum/');
}

function isCuriosidadesPath() {
  return window.location.pathname === '/curiosidades' || window.location.pathname.startsWith('/curiosidades/');
}

function findElementByText<T extends HTMLElement>(selector: string, text: string): T | null {
  const target = normalizeRuntimeText(text);
  return Array.from(document.querySelectorAll<T>(selector)).find((element) => {
    return normalizeRuntimeText(element.textContent).includes(target);
  }) ?? null;
}

function disableClickableElement(element: HTMLElement, reason: string) {
  element.setAttribute('aria-disabled', 'true');
  element.setAttribute('title', reason);
  element.style.pointerEvents = 'none';
  element.style.opacity = '0.55';
  element.style.cursor = 'not-allowed';

  if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    element.disabled = true;
  }
}

function ensureMemorialNotice() {
  if (!isMemorialPerspectiveRuntime()) return;
  if (!isForumPath() && !isCuriosidadesPath()) return;
  if (document.getElementById(MEMORIAL_NOTICE_ID)) return;

  const main = document.querySelector('main');
  if (!main) return;

  const perspective = getResponsiblePerspectiveRuntime();
  const name = perspective?.nomeCompleto?.trim() || 'Este perfil memorial';
  const notice = document.createElement('div');
  notice.id = MEMORIAL_NOTICE_ID;
  notice.className = 'mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700';
  notice.textContent = `${name} está em modo memorial. Publicações, respostas, comentários, reações e perguntas à IA ficam bloqueados nessa perspectiva.`;
  main.prepend(notice);
}

function isBlockedMemorialActionTarget(target: EventTarget | null) {
  if (!isMemorialPerspectiveRuntime()) return false;
  if (!isForumPath() && !isCuriosidadesPath()) return false;
  if (!(target instanceof HTMLElement)) return false;

  const interactive = target.closest<HTMLElement>('a, button, form, textarea, input, select');
  if (!interactive) return false;

  const text = normalizeRuntimeText([
    interactive.textContent,
    interactive.getAttribute('aria-label'),
    interactive.getAttribute('title'),
    interactive.getAttribute('href'),
    interactive.getAttribute('placeholder'),
  ].join(' '));

  if (isForumPath()) {
    return text.includes('/forum/novo')
      || text.includes('criar novo')
      || text.includes('criar topico')
      || text.includes('publicar resposta')
      || text.includes('responder como')
      || text.includes('reagir com')
      || text.includes('salvar resposta')
      || text.includes('editar resposta');
  }

  if (isCuriosidadesPath()) {
    const isAiPanel = Boolean(interactive.closest('.curiosidades-ai-question-panel, .curiosidades-ai-suggestions-card'));
    const isMemoryWall = Boolean(interactive.closest('[data-curiosidades-memory-wall="true"]'));

    return isAiPanel
      || isMemoryWall
      || text.includes('faca aqui sua pergunta')
      || text.includes('pergunte')
      || text.includes('nova pergunta')
      || text.includes('enviar')
      || text.includes('publicar');
  }

  return false;
}

function blockMemorialEvent(event: Event) {
  if (!isBlockedMemorialActionTarget(event.target)) return;

  event.preventDefault();
  event.stopPropagation();
  ensureMemorialNotice();
}

function applyForumMemorialGuard() {
  if (!isForumPath() || !isMemorialPerspectiveRuntime()) return;

  ensureMemorialNotice();
  const reason = 'Perfis memoriais não podem publicar, responder ou reagir no fórum.';

  document.querySelectorAll<HTMLElement>('a[href="/forum/novo"], a[href^="/forum/novo"], a[href*="/forum/novo"]').forEach((element) => {
    disableClickableElement(element, reason);
  });

  document.querySelectorAll<HTMLElement>('button').forEach((button) => {
    const text = normalizeRuntimeText(`${button.textContent ?? ''} ${button.getAttribute('aria-label') ?? ''} ${button.getAttribute('title') ?? ''}`);
    if (
      text.includes('criar novo')
      || text.includes('criar topico')
      || text.includes('publicar resposta')
      || text.includes('reagir com')
      || text.includes('salvar resposta')
    ) {
      disableClickableElement(button, reason);
    }
  });

  document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((textarea) => {
    const placeholder = normalizeRuntimeText(textarea.placeholder);
    if (placeholder.includes('responder como') || window.location.pathname.startsWith('/forum/novo')) {
      textarea.placeholder = 'Perfis memoriais não podem escrever no fórum.';
      disableClickableElement(textarea, reason);
    }
  });

  if (window.location.pathname.startsWith('/forum/novo')) {
    document.querySelectorAll<HTMLElement>('input, textarea, select, button[type="submit"]').forEach((element) => {
      disableClickableElement(element, reason);
    });
  }
}

function applyCuriosidadesMemorialGuard() {
  if (!isCuriosidadesPath() || !isMemorialPerspectiveRuntime()) return;

  ensureMemorialNotice();
  const reason = 'Perfis memoriais não podem escrever ou perguntar à IA.';

  document.querySelectorAll<HTMLElement>('.curiosidades-ai-suggestions-card button, .curiosidades-ai-question-panel button, .curiosidades-ai-question-panel textarea, .curiosidades-ai-question-panel input').forEach((element) => {
    if (element instanceof HTMLTextAreaElement) {
      element.placeholder = 'Perfis memoriais não podem perguntar à IA.';
    }
    disableClickableElement(element, reason);
  });
}

function ensureMeusDadosLayoutStyle() {
  if (document.getElementById(MEUS_DADOS_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = MEUS_DADOS_STYLE_ID;
  style.textContent = `
@media (min-width: 768px) {
  [data-meus-dados-runtime-fix="birth-date"] {
    max-width: 15rem !important;
  }

  [data-meus-dados-runtime-fix="death-location"] {
    grid-template-columns: minmax(0, 1.15fr) minmax(16.5rem, 0.85fr) !important;
  }

  [data-meus-dados-runtime-fix="death-location"] label,
  [data-meus-dados-runtime-fix="death-location"] span {
    white-space: nowrap !important;
  }
}
`;
  document.head.appendChild(style);
}

function applyMeusDadosLayoutFix() {
  if (!window.location.pathname.startsWith('/meus-dados')) return;

  ensureMeusDadosLayoutStyle();

  const birthLabel = findElementByText<HTMLElement>('label', 'Dia ou Ano de Nascimento');
  if (birthLabel) {
    birthLabel.dataset.meusDadosRuntimeFix = 'birth-date';
  }

  const deathLocationLabel = findElementByText<HTMLElement>('label', 'Local de falecimento');
  const deathLocationGrid = deathLocationLabel?.parentElement;
  if (deathLocationGrid) {
    deathLocationGrid.dataset.meusDadosRuntimeFix = 'death-location';
  }
}

function ensurePetModalStyle() {
  if (document.getElementById(PET_MODAL_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = PET_MODAL_STYLE_ID;
  style.textContent = `
[data-pet-modal-runtime-fix="single-column"] {
  grid-template-columns: minmax(0, 1fr) !important;
}

[data-pet-modal-runtime-fix="hidden-list"] {
  display: none !important;
}
`;
  document.head.appendChild(style);
}

function applyPetModalLayoutFix() {
  if (!window.location.pathname.startsWith('/meus-vinculos')) return;

  ensurePetModalStyle();

  const petsTitle = findElementByText<HTMLElement>('h1, h2, h3, h4, p, span', 'Pets cadastrados');
  const sidePanel = petsTitle?.closest<HTMLElement>('section, aside, div');
  if (!sidePanel) return;

  sidePanel.dataset.petModalRuntimeFix = 'hidden-list';
  const grid = sidePanel.parentElement;
  if (grid) grid.dataset.petModalRuntimeFix = 'single-column';

  const dialog = sidePanel.closest<HTMLElement>('[role="dialog"]');
  if (dialog) dialog.style.maxWidth = '42rem';
}

function applyRuntimeFixes() {
  applyForumMemorialGuard();
  applyCuriosidadesMemorialGuard();
  applyMeusDadosLayoutFix();
  applyPetModalLayoutFix();
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', blockMemorialEvent, true);
  document.addEventListener('submit', blockMemorialEvent, true);

  const observer = new MutationObserver(() => applyRuntimeFixes());
  const start = () => {
    applyRuntimeFixes();
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.addEventListener('popstate', () => window.setTimeout(applyRuntimeFixes, 50));
  window.addEventListener('arvorefamilia:responsible-perspective-changed', () => window.setTimeout(applyRuntimeFixes, 50));
}
