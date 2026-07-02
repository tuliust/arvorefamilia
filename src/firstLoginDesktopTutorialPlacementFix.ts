const DESKTOP_QUERY = '(min-width: 768px)';
const TUTORIAL_SELECTOR = '[data-first-login-tutorial="true"]';
const MASK_SELECTOR = 'mask#first-login-tutorial-mask rect[fill="black"]';
const VIEWPORT_MARGIN = 14;
const DESKTOP_GAP = 18;

const MERGED_SPOTLIGHT_STEPS = new Set([
  'Aqui é o seu menu',
  'Inteligência artificial e datas importantes',
]);

const RIGHT_SIDE_PANEL_STEPS = new Set([
  'Modos de exibição e controles da árvore',
]);

type RectLike = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function isDesktopViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(DESKTOP_QUERY).matches;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTutorialRoot() {
  return document.querySelector<HTMLElement>(TUTORIAL_SELECTOR);
}

function getCurrentStepTitle(root: HTMLElement) {
  return String(root.dataset.firstLoginTutorialStep || '').trim();
}

function getPanel(root: HTMLElement) {
  return Array.from(root.children).find((child): child is HTMLElement => (
    child instanceof HTMLElement && child.tagName.toLowerCase() === 'section'
  )) ?? null;
}

function getSpotlightBorderElements(root: HTMLElement) {
  return Array.from(root.children).filter((child): child is HTMLElement => (
    child instanceof HTMLElement
    && child.tagName.toLowerCase() === 'div'
    && child.classList.contains('pointer-events-none')
    && child.classList.contains('fixed')
    && child.style.width !== ''
    && child.style.height !== ''
  ));
}

function getVisibleBorderRects(root: HTMLElement) {
  return getSpotlightBorderElements(root)
    .filter((element) => element.style.display !== 'none')
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0);
}

function getUnionRect(rects: RectLike[]) {
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.left + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.top + rect.height));

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

function applyRectToBorder(element: HTMLElement, rect: RectLike) {
  element.style.left = `${rect.left}px`;
  element.style.top = `${rect.top}px`;
  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
  element.style.display = '';
}

function applyRectToMask(maskRect: SVGRectElement, rect: RectLike) {
  maskRect.setAttribute('x', String(rect.left));
  maskRect.setAttribute('y', String(rect.top));
  maskRect.setAttribute('width', String(rect.width));
  maskRect.setAttribute('height', String(rect.height));
  maskRect.setAttribute('rx', '18');
  maskRect.setAttribute('ry', '18');
}

function mergeStepSpotlights(root: HTMLElement) {
  const borderElements = getSpotlightBorderElements(root);
  const visibleRects = getVisibleBorderRects(root);
  if (borderElements.length < 2 || visibleRects.length < 2) return;

  const unionRect = getUnionRect(visibleRects);
  applyRectToBorder(borderElements[0], unionRect);
  borderElements.slice(1).forEach((element) => {
    element.style.display = 'none';
  });

  const maskRects = Array.from(root.querySelectorAll<SVGRectElement>(MASK_SELECTOR));
  if (maskRects[0]) applyRectToMask(maskRects[0], unionRect);
  maskRects.slice(1).forEach((rect) => rect.remove());
}

function positionPanelOnRight(root: HTMLElement) {
  const panel = getPanel(root);
  const borderRects = getVisibleBorderRects(root);
  if (!panel || borderRects.length === 0) return;

  const reference = getUnionRect(borderRects);
  const panelRect = panel.getBoundingClientRect();
  const availableRight = window.innerWidth - reference.left - reference.width - DESKTOP_GAP - VIEWPORT_MARGIN;
  const currentWidth = panelRect.width || 430;
  const width = Math.max(320, Math.min(currentWidth, availableRight));
  const panelHeight = panelRect.height || 330;

  panel.style.width = `${width}px`;
  panel.style.left = `${reference.left + reference.width + DESKTOP_GAP}px`;
  panel.style.top = `${clamp(reference.top, VIEWPORT_MARGIN, window.innerHeight - panelHeight - VIEWPORT_MARGIN)}px`;
}

function applyDesktopTutorialFixes() {
  if (!isDesktopViewport()) return;

  const root = getTutorialRoot();
  if (!root) return;

  const stepTitle = getCurrentStepTitle(root);
  if (MERGED_SPOTLIGHT_STEPS.has(stepTitle)) mergeStepSpotlights(root);
  if (RIGHT_SIDE_PANEL_STEPS.has(stepTitle)) positionPanelOnRight(root);
}

let scheduled = false;
function scheduleFixes() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    applyDesktopTutorialFixes();
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const observer = new MutationObserver(scheduleFixes);
  observer.observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  });

  window.addEventListener('resize', scheduleFixes, { passive: true });
  window.addEventListener('orientationchange', scheduleFixes, { passive: true });
  window.addEventListener('scroll', scheduleFixes, { passive: true, capture: true });
  [80, 250, 600, 1000].forEach((delay) => window.setTimeout(scheduleFixes, delay));
}

export {};
