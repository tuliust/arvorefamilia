const MAP_EXPORT_ROOT_SELECTOR = '[data-family-map-export-root="true"]';
const MAP_HORIZONTAL_VIEWPORT_SELECTOR = '[data-family-map-horizontal-viewport="true"]';
const MAP_DRAG_READY_ATTR = 'data-family-map-drag-scroll-ready';
const MAP_DRAG_ACTIVE_ATTR = 'data-family-map-drag-scroll-active';
const MAP_RUNTIME_STYLE_ID = 'family-map-desktop-runtime-fixes';
const VIEW_ICON_ATTR = 'data-tree-view-mode-custom-icon';
const INTERACTIVE_TARGET_SELECTOR = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  '[role="button"]',
  '[contenteditable="true"]',
  '[data-tree-export-ignore="true"]',
  '[data-tree-selection-overlay="true"]',
].join(',');

const FAMILY_TREE_ICON_SVG = `
<svg ${VIEW_ICON_ATTR}="family-tree" viewBox="0 0 48 48" fill="none" aria-hidden="true" class="h-5 w-5 shrink-0 text-current">
  <path d="M24 8v8" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M13 24h22" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M13 24v7M35 24v7M24 24v7" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <circle cx="24" cy="7" r="4.5" fill="currentColor" opacity="0.9" />
  <circle cx="13" cy="35" r="4.5" fill="currentColor" opacity="0.9" />
  <circle cx="24" cy="35" r="4.5" fill="currentColor" opacity="0.9" />
  <circle cx="35" cy="35" r="4.5" fill="currentColor" opacity="0.9" />
  <path d="M7 42c1.3-4 4.1-6 6-6s4.7 2 6 6M18 42c1.3-4 4.1-6 6-6s4.7 2 6 6M29 42c1.3-4 4.1-6 6-6s4.7 2 6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity="0.55" />
</svg>`;

const GENERATIONAL_LINE_ICON_SVG = `
<svg ${VIEW_ICON_ATTR}="generational-line" viewBox="0 0 48 48" fill="none" aria-hidden="true" class="h-5 w-5 shrink-0 text-current">
  <path d="M8 12h11M29 12h11M14 24h20M8 36h11M29 36h11" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <rect x="6" y="7" width="14" height="10" rx="3" fill="currentColor" opacity="0.78" />
  <rect x="28" y="7" width="14" height="10" rx="3" fill="currentColor" opacity="0.78" />
  <rect x="16" y="19" width="16" height="10" rx="3" fill="currentColor" opacity="0.95" />
  <rect x="6" y="31" width="14" height="10" rx="3" fill="currentColor" opacity="0.78" />
  <rect x="28" y="31" width="14" height="10" rx="3" fill="currentColor" opacity="0.78" />
  <path d="M24 17v2M24 29v2" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
</svg>`;

function installRuntimeStyles() {
  if (document.getElementById(MAP_RUNTIME_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = MAP_RUNTIME_STYLE_ID;
  style.textContent = `
    [${MAP_DRAG_READY_ATTR}="true"] {
      cursor: grab;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    [${MAP_DRAG_READY_ATTR}="true"]::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }

    [${MAP_DRAG_ACTIVE_ATTR}="true"] {
      cursor: grabbing !important;
      user-select: none !important;
    }

    [${MAP_DRAG_ACTIVE_ATTR}="true"] * {
      cursor: grabbing !important;
    }
  `;
  document.head.appendChild(style);
}

function isFinePointerDevice() {
  return window.matchMedia?.('(pointer: fine)').matches ?? true;
}

function getElementTarget(target: EventTarget | null) {
  return target instanceof Element ? target : null;
}

function getScrollableViewportFromElement(element: Element | null) {
  if (!element) return null;

  const explicitHorizontalViewport = element.closest(MAP_HORIZONTAL_VIEWPORT_SELECTOR);
  if (explicitHorizontalViewport instanceof HTMLElement) return explicitHorizontalViewport;

  const exportRoot = element.closest(MAP_EXPORT_ROOT_SELECTOR);
  let current = exportRoot instanceof HTMLElement ? exportRoot.parentElement : element.parentElement;

  while (current && current !== document.body) {
    const styles = window.getComputedStyle(current);
    const overflow = `${styles.overflow} ${styles.overflowX} ${styles.overflowY}`;
    const canScroll = current.scrollWidth > current.clientWidth + 2 || current.scrollHeight > current.clientHeight + 2;

    if (canScroll && /(auto|scroll)/.test(overflow)) return current;
    current = current.parentElement;
  }

  return null;
}

function getMapViewportFromTarget(target: EventTarget | null) {
  return getScrollableViewportFromElement(getElementTarget(target));
}

function shouldIgnoreDragTarget(target: EventTarget | null) {
  const element = getElementTarget(target);
  if (!element) return true;
  if (document.querySelector('[data-tree-selection-overlay="true"]')) return true;
  return Boolean(element.closest(INTERACTIVE_TARGET_SELECTOR));
}

function centerInitialFamilyMapViewport(viewport: HTMLElement, exportRoot: HTMLElement) {
  if (exportRoot.dataset.familyMapHorizontalRoot === 'true') return;
  if (exportRoot.dataset.familyMapInitialCentered === 'true') return;
  if (viewport.scrollWidth <= viewport.clientWidth + 2) return;

  exportRoot.dataset.familyMapInitialCentered = 'true';
  viewport.scrollLeft = Math.max(0, Math.round((viewport.scrollWidth - viewport.clientWidth) / 2));
}

function syncMapViewports() {
  if (!isFinePointerDevice()) return;

  document.querySelectorAll<HTMLElement>(MAP_EXPORT_ROOT_SELECTOR).forEach((exportRoot) => {
    const viewport = getScrollableViewportFromElement(exportRoot);
    if (!viewport) return;

    viewport.setAttribute(MAP_DRAG_READY_ATTR, 'true');

    window.requestAnimationFrame(() => centerInitialFamilyMapViewport(viewport, exportRoot));
    window.setTimeout(() => centerInitialFamilyMapViewport(viewport, exportRoot), 120);
    window.setTimeout(() => centerInitialFamilyMapViewport(viewport, exportRoot), 320);
  });
}

type DragState = {
  viewport: HTMLElement;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startScrollLeft: number;
  startScrollTop: number;
  dragging: boolean;
};

function installMapMouseDragScroll() {
  let dragState: DragState | null = null;
  let suppressClickUntil = 0;

  window.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.pointerType !== 'mouse') return;
    if (!isFinePointerDevice() || shouldIgnoreDragTarget(event.target)) return;

    const viewport = getMapViewportFromTarget(event.target);
    if (!viewport) return;

    dragState = {
      viewport,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startScrollLeft: viewport.scrollLeft,
      startScrollTop: viewport.scrollTop,
      dragging: false,
    };
  }, { capture: true });

  window.addEventListener('pointermove', (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    const deltaX = event.clientX - dragState.startClientX;
    const deltaY = event.clientY - dragState.startClientY;
    const passedThreshold = Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4;

    if (!dragState.dragging && !passedThreshold) return;

    dragState.dragging = true;
    dragState.viewport.setAttribute(MAP_DRAG_ACTIVE_ATTR, 'true');
    dragState.viewport.scrollLeft = dragState.startScrollLeft - deltaX;
    dragState.viewport.scrollTop = dragState.startScrollTop - deltaY;
    event.preventDefault();
  }, { capture: true, passive: false });

  const finishDrag = (event: PointerEvent) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    if (dragState.dragging) {
      suppressClickUntil = Date.now() + 350;
      dragState.viewport.removeAttribute(MAP_DRAG_ACTIVE_ATTR);
    }

    dragState = null;
  };

  window.addEventListener('pointerup', finishDrag, { capture: true });
  window.addEventListener('pointercancel', finishDrag, { capture: true });

  window.addEventListener('click', (event) => {
    if (Date.now() > suppressClickUntil) return;

    event.preventDefault();
    event.stopPropagation();
  }, { capture: true });
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getCustomIconForButton(button: HTMLButtonElement) {
  const text = normalizeText(button.textContent ?? '');
  if (text.includes('arvore familiar')) return FAMILY_TREE_ICON_SVG;
  if (text.includes('linha geracional')) return GENERATIONAL_LINE_ICON_SVG;
  return null;
}

function replaceTreeViewModeIcons() {
  document.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    const customIcon = getCustomIconForButton(button);
    if (!customIcon || button.querySelector(`[${VIEW_ICON_ATTR}]`)) return;

    const firstIcon = button.querySelector('svg');
    if (!(firstIcon instanceof SVGSVGElement)) return;

    firstIcon.style.display = 'none';
    firstIcon.setAttribute('aria-hidden', 'true');
    firstIcon.insertAdjacentHTML('afterend', customIcon);
  });
}

function hideLegacyBloodRelationshipOptions() {
  document.querySelectorAll<HTMLOptionElement>('option').forEach((option) => {
    if (normalizeText(option.textContent ?? '').trim() !== 'sangue') return;

    const select = option.parentElement instanceof HTMLSelectElement ? option.parentElement : null;
    const shouldSelectFallback = select?.value === option.value;
    option.remove();

    if (select && shouldSelectFallback) {
      const fallbackOption = Array.from(select.options).find((item) => !item.disabled);
      if (fallbackOption) {
        select.value = fallbackOption.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
}

function installDomRuntimeSync() {
  let scheduled = false;

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;

    window.requestAnimationFrame(() => {
      scheduled = false;
      syncMapViewports();
      replaceTreeViewModeIcons();
      hideLegacyBloodRelationshipOptions();
    });
  };

  schedule();

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  window.addEventListener('resize', schedule);
  window.addEventListener('popstate', schedule);
  window.setTimeout(schedule, 450);
  window.setTimeout(schedule, 1200);
}

installRuntimeStyles();
installMapMouseDragScroll();
installDomRuntimeSync();
