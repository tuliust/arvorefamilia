const ACTIVITY_CLEAR_CUTOFF_KEY = 'arvorefamilia:admin-activity-clear-cutoff';

function isAdminDashboardPath() {
  return window.location.pathname === '/admin' || window.location.pathname === '/admin/';
}

function isNewPersonAdminPath() {
  return window.location.pathname === '/admin/pessoas/nova' || window.location.pathname === '/admin/pessoas/nova/';
}

function parseBrazilianDateTime(value: string): number | null {
  const match = value.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s*(\d{2}):(\d{2})/);
  if (!match) return null;

  const [, day, month, year, hour, minute] = match;
  const timestamp = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function replaceExactText(from: string, to: string) {
  document.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6,p,span,label,button,div').forEach((element) => {
    if (element.childNodes.length !== 1) return;
    const child = element.childNodes[0];
    if (child.nodeType !== Node.TEXT_NODE) return;
    if ((child.textContent ?? '').trim() === from) {
      child.textContent = to;
    }
  });
}

function normalizeRelationshipSubtypeLabels() {
  document.querySelectorAll<HTMLElement>('p,span,div').forEach((element) => {
    const current = (element.textContent ?? '').trim();
    if (!current.includes('·')) return;
    if (!/Sangue\/Casamento|Adotivo|Sangue/i.test(current)) return;

    const next = current
      .replace(/\s*·\s*Sangue\/Casamento\s*$/i, '')
      .replace(/\s*·\s*Adotivo\s*$/i, '')
      .replace(/\s*·\s*Sangue\s*$/i, '');

    if (next && next !== current && element.childNodes.length === 1) {
      element.textContent = next;
    }
  });
}

function findAncestorByClass(element: HTMLElement | null, classFragment: string) {
  let current: HTMLElement | null = element;
  while (current && current !== document.body) {
    if (String(current.className).includes(classFragment)) return current;
    current = current.parentElement;
  }
  return null;
}

function applyPersonRelationshipTextFixes() {
  if (!isNewPersonAdminPath()) return;

  replaceExactText('Relacionamentos Familiares (opcional)', 'Relacionamentos Familiares');
  replaceExactText('Filiação (Pais)', 'Filiação');
  normalizeRelationshipSubtypeLabels();
}

function applyRelationshipModalFixes() {
  if (!isNewPersonAdminPath()) return;

  const dialogTitle = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"] h2, [role="dialog"] h3, [role="dialog"] [data-radix-dialog-title]'))
    .find((element) => (element.textContent ?? '').trim() === 'Adicionar relacionamento');
  const dialog = dialogTitle?.closest<HTMLElement>('[role="dialog"]');
  if (!dialog) return;

  const selects = Array.from(dialog.querySelectorAll<HTMLSelectElement>('select'));
  const typeSelect = selects[0];
  const subtypeSelect = selects[1];
  if (!typeSelect) return;

  const isParentSelection = typeSelect.value === 'pai' || typeSelect.value === 'mae';

  const typeWrapper = findAncestorByClass(typeSelect, 'min-w-0') ?? typeSelect.parentElement;
  const subtypeWrapper = subtypeSelect ? findAncestorByClass(subtypeSelect, 'min-w-0') ?? subtypeSelect.parentElement : null;

  [typeWrapper, subtypeWrapper].forEach((wrapper) => {
    if (!wrapper) return;
    wrapper.style.display = isParentSelection ? 'none' : '';
  });

  if (isParentSelection && subtypeSelect && subtypeSelect.value !== 'sangue') {
    subtypeSelect.value = 'sangue';
    subtypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function applyDashboardActivityCutoff() {
  if (!isAdminDashboardPath()) return;

  const cutoff = window.localStorage.getItem(ACTIVITY_CLEAR_CUTOFF_KEY);
  if (!cutoff) return;

  const cutoffTime = new Date(cutoff).getTime();
  if (!Number.isFinite(cutoffTime)) return;

  const title = Array.from(document.querySelectorAll<HTMLElement>('h2,h3,[data-slot="card-title"]'))
    .find((element) => (element.textContent ?? '').trim() === 'Histórico de Atividades');
  const card = title?.closest<HTMLElement>('.rounded-lg, .rounded-xl, [class*="Card"]') ?? title?.parentElement?.parentElement;
  if (!card) return;

  const content = Array.from(card.querySelectorAll<HTMLElement>('div,p')).find((element) => {
    const text = (element.textContent ?? '').trim();
    return text.includes('Notificação criada') || text.includes('Primeiro acesso') || text.includes('Nenhuma atividade registrada') || text.includes('Carregando');
  })?.closest<HTMLElement>('[class*="space-y"], [class*="flex-1"]');

  if (!content || (content.textContent ?? '').includes('Carregando')) return;

  const activityItems = Array.from(content.querySelectorAll<HTMLElement>(':scope > div > div, :scope > div'))
    .filter((element) => parseBrazilianDateTime(element.textContent ?? '') !== null);

  activityItems.forEach((item) => {
    const itemTime = parseBrazilianDateTime(item.textContent ?? '');
    if (itemTime !== null && itemTime <= cutoffTime) item.remove();
  });

  const remainingItems = Array.from(content.querySelectorAll<HTMLElement>(':scope > div > div, :scope > div'))
    .filter((element) => parseBrazilianDateTime(element.textContent ?? '') !== null);

  if (remainingItems.length === 0 && !(content.textContent ?? '').includes('Nenhuma atividade registrada')) {
    content.innerHTML = '<p class="text-sm text-gray-500">Nenhuma atividade registrada.</p>';
  }
}

function applyRuntimeFixes() {
  applyPersonRelationshipTextFixes();
  applyRelationshipModalFixes();
  applyDashboardActivityCutoff();
}

let scheduled = false;
function scheduleRuntimeFixes() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    applyRuntimeFixes();
  });
}

window.addEventListener('DOMContentLoaded', scheduleRuntimeFixes);
window.addEventListener('popstate', scheduleRuntimeFixes);
window.addEventListener('storage', scheduleRuntimeFixes);

const originalPushState = window.history.pushState;
window.history.pushState = function patchedPushState(...args) {
  const result = originalPushState.apply(this, args);
  scheduleRuntimeFixes();
  return result;
};

const originalReplaceState = window.history.replaceState;
window.history.replaceState = function patchedReplaceState(...args) {
  const result = originalReplaceState.apply(this, args);
  scheduleRuntimeFixes();
  return result;
};

new MutationObserver(scheduleRuntimeFixes).observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});

scheduleRuntimeFixes();

export {};
