const ADMIN_RELATIONSHIP_PATH_RE = /^\/admin\/pessoas(?:\/nova|\/[a-z0-9-]+\/editar)?\/?$/i;
const ADMIN_APPROVALS_PATH = '/admin/aprovacoes';
const STYLE_ID = 'relationship-subtype-deprecation-runtime-fix-style';
const INSTALLED_ATTR = 'data-relationship-subtype-deprecation-installed';
const FAMILY_RELATIONSHIP_TYPES = new Set(['pai', 'mae', 'filho', 'irmao']);

let syncFrame: number | null = null;

function normalizeText(value?: string | null) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isAdminRelationshipPage() {
  return ADMIN_RELATIONSHIP_PATH_RE.test(window.location.pathname.replace(/\/$/, ''));
}

function isAdminApprovalsPage() {
  return window.location.pathname.replace(/\/$/, '') === ADMIN_APPROVALS_PATH;
}

function isRelevantPage() {
  return isAdminRelationshipPage() || isAdminApprovalsPage();
}

function getFieldContainer(label: HTMLElement) {
  const directParent = label.parentElement;
  if (!directParent) return null;

  const select = directParent.querySelector('select');
  if (select) return directParent;

  return label.closest('div');
}

function hideSubtypeFields() {
  document.querySelectorAll<HTMLElement>('label').forEach((label) => {
    if (normalizeText(label.textContent) !== 'subtipo') return;

    const container = getFieldContainer(label);
    if (!container) return;

    container.setAttribute('data-relationship-subtype-deprecated', 'true');
    container.setAttribute('aria-hidden', 'true');

    const select = container.querySelector<HTMLSelectElement>('select');
    if (select) {
      const typeSelect = Array.from(document.querySelectorAll<HTMLSelectElement>('select')).find((candidate) => {
        const candidateLabel = candidate.parentElement?.querySelector('label');
        return normalizeText(candidateLabel?.textContent) === 'tipo';
      });
      const selectedType = typeSelect?.value ?? '';
      const desiredValue = FAMILY_RELATIONSHIP_TYPES.has(selectedType) ? 'sangue' : 'casamento';
      if (select.value !== desiredValue) {
        select.value = desiredValue;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
}

function removeSubtypeDisplayText() {
  const removableExactLabels = new Set([
    'sangue',
    'adotivo',
    'sangue casamento',
    'subtipo sangue',
    'subtipo adotivo',
    'subtipo casamento',
    'subtipo uniao',
    'subtipo separado',
  ]);

  document.querySelectorAll<HTMLElement>('p, span, div').forEach((element) => {
    if (element.children.length > 0) return;

    const normalized = normalizeText(element.textContent);
    if (removableExactLabels.has(normalized)) {
      element.setAttribute('data-relationship-subtype-display-deprecated', 'true');
      element.setAttribute('aria-hidden', 'true');
      return;
    }

    if (normalized.startsWith('subtipo ')) {
      element.setAttribute('data-relationship-subtype-display-deprecated', 'true');
      element.setAttribute('aria-hidden', 'true');
    }
  });
}

function normalizeSubtypeSelects() {
  document.querySelectorAll<HTMLSelectElement>('select').forEach((select) => {
    const label = select.parentElement?.querySelector('label');
    if (normalizeText(label?.textContent) !== 'subtipo') return;

    const typeSelect = Array.from(document.querySelectorAll<HTMLSelectElement>('select')).find((candidate) => {
      const candidateLabel = candidate.parentElement?.querySelector('label');
      return normalizeText(candidateLabel?.textContent) === 'tipo';
    });
    const selectedType = typeSelect?.value ?? '';
    const desiredValue = FAMILY_RELATIONSHIP_TYPES.has(selectedType) ? 'sangue' : 'casamento';

    if (select.value !== desiredValue) {
      select.value = desiredValue;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

function normalizeRelationshipPayloadValue(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    return value.map((item) => normalizeRelationshipPayloadValue(item));
  }

  const next = { ...(value as Record<string, unknown>) };
  const relationshipType = String(next.tipo_relacionamento ?? next.relationship_type ?? '');

  if (FAMILY_RELATIONSHIP_TYPES.has(relationshipType)) {
    if ('subtipo_relacionamento' in next) next.subtipo_relacionamento = 'sangue';
    if ('relationship_subtype' in next) next.relationship_subtype = 'sangue';
  }

  if ('changes' in next && next.changes && typeof next.changes === 'object') {
    const changes = { ...(next.changes as Record<string, unknown>) };
    delete changes.subtipo_relacionamento;
    next.changes = changes;
  }

  if ('payload' in next && next.payload && typeof next.payload === 'object') {
    next.payload = normalizeRelationshipPayloadValue(next.payload);
  }

  return next;
}

function normalizeRequestInit(input: RequestInfo | URL, init?: RequestInit): RequestInit | undefined {
  if (!init?.body || typeof init.body !== 'string') return init;

  const url = typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

  if (!url.includes('/rest/v1/relacionamentos') && !url.includes('/rest/v1/relationship_change_requests')) {
    return init;
  }

  try {
    const parsed = JSON.parse(init.body);
    const normalized = normalizeRelationshipPayloadValue(parsed);
    return {
      ...init,
      body: JSON.stringify(normalized),
    };
  } catch {
    return init;
  }
}

function installFetchNormalizer() {
  if (document.documentElement.getAttribute(INSTALLED_ATTR) === 'true') return;
  document.documentElement.setAttribute(INSTALLED_ATTR, 'true');

  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    return originalFetch(input, normalizeRequestInit(input, init));
  }) as typeof window.fetch;
}

function ensureStyles() {
  const css = `
    [data-relationship-subtype-deprecated="true"],
    [data-relationship-subtype-display-deprecated="true"] {
      display: none !important;
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

function syncSubtypeDeprecation() {
  if (!isRelevantPage()) return;
  ensureStyles();
  normalizeSubtypeSelects();
  hideSubtypeFields();
  removeSubtypeDisplayText();
}

function scheduleSync() {
  if (syncFrame !== null) return;

  syncFrame = window.requestAnimationFrame(() => {
    syncFrame = null;
    syncSubtypeDeprecation();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  installFetchNormalizer();
  ensureStyles();
  syncSubtypeDeprecation();

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['value', 'class', 'data-state'],
  });

  document.addEventListener('change', scheduleSync, true);
  window.addEventListener('popstate', scheduleSync, { passive: true });
  window.addEventListener('resize', scheduleSync, { passive: true });
  [80, 220, 520, 1200].forEach((delay) => window.setTimeout(scheduleSync, delay));
}

export {};
