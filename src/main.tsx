import { createRoot } from "react-dom/client";
import App from "./app/App";
import { MobileTreeControlsPortal } from "./app/components/FamilyTree/MobileTreeControlsPortal";
import "./styles/index.css";
import "./styles/mobile-tree-controls.css";
import "./styles/mobile-tree-lines.css";
import "./styles/mobile-member-pages.css";
import "./mobileFamilyMapFullPanelStyleFix";

const DYNAMIC_IMPORT_RELOAD_KEY = "arvorefamilia:dynamic-import-reload";
const CSS_RELOAD_KEY = "arvorefamilia:css-reload";
const TREE_ACTION_EVENT = "arvore-family-tree-action";
const TREE_ROOT_SELECTOR = '[data-export-root="family-tree"], [data-family-map-export-root="true"]';
const MOBILE_FAMILY_TREE_ROOT_SELECTOR = '[data-mobile-family-tree-root="true"]';
const MOBILE_FAMILY_TREE_CARD_SELECTOR = `${MOBILE_FAMILY_TREE_ROOT_SELECTOR} [data-family-map-mobile-card="true"]`;
const UNKNOWN_BIRTH_TEXT = "Nascimento não informado";
const UNKNOWN_DEATH_TEXT = "Falecimento não informado";
const MOBILE_DESKTOP_TIP_SESSION_KEY = "arvore-mobile-desktop-tip-dismissed";
const MOBILE_DESKTOP_TIP_PENDING_KEY = "arvore-mobile-desktop-tip-pending";
const FIRST_LOGIN_TUTORIAL_SELECTOR = '[data-first-login-tutorial="true"]';
const FIRST_LOGIN_TUTORIAL_TITLE_SELECTOR = '#first-login-tutorial-title';
const DESKTOP_TREE_PANEL_SELECTOR = '.desktop-tree-visualization-panel';
const TREE_CONTROLS_COLLAPSE_SELECTOR = '[data-tour-target="tree-controls-collapse"]';
const DYNAMIC_IMPORT_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
  /Expected a JavaScript-or-Wasm module script/i,
  /MIME type of "text\/html"/i,
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }
  return String(error ?? "");
}

function isDynamicImportError(error: unknown) {
  const message = getErrorMessage(error);
  return DYNAMIC_IMPORT_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

async function clearBrowserCaches() {
  if (!("caches" in window)) return;

  try {
    const cacheNames = await window.caches.keys();
    await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
  } catch {
    // Cache cleanup is best-effort; reload still handles the recovery path.
  }
}

function reloadWithFreshIndex(paramName = "__reload") {
  const url = new URL(window.location.href);
  url.searchParams.set(paramName, String(Date.now()));
  window.location.replace(url.toString());
}

function recoverFromDynamicImportError(error: unknown) {
  if (!isDynamicImportError(error)) return;
  if (sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY) === "1") return;

  sessionStorage.setItem(DYNAMIC_IMPORT_RELOAD_KEY, "1");
  void clearBrowserCaches().finally(() => reloadWithFreshIndex());
}

function isUtilityCssAvailable() {
  const probe = document.createElement("div");
  probe.className = "hidden";
  probe.setAttribute("aria-hidden", "true");
  document.body.appendChild(probe);

  const cssAvailable = window.getComputedStyle(probe).display === "none";
  probe.remove();
  return cssAvailable;
}

function recoverFromMissingCss() {
  if (sessionStorage.getItem(CSS_RELOAD_KEY) === "1") return;
  if (isUtilityCssAvailable()) return;

  sessionStorage.setItem(CSS_RELOAD_KEY, "1");
  void clearBrowserCaches().finally(() => reloadWithFreshIndex("__css_reload"));
}

function hasVisibleTreeSurface() {
  return Boolean(document.querySelector(TREE_ROOT_SELECTOR));
}

function isEditableShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function dispatchTreeZoomAction(action: "zoom-in" | "zoom-out") {
  window.dispatchEvent(new CustomEvent(TREE_ACTION_EVENT, { detail: action }));
}

function disableMobileDesktopTip() {
  try {
    window.sessionStorage.removeItem(MOBILE_DESKTOP_TIP_PENDING_KEY);
    window.sessionStorage.setItem(MOBILE_DESKTOP_TIP_SESSION_KEY, "true");
  } catch {
    // A dica mobile é apenas informativa; falha de storage não deve bloquear o app.
  }
}

function installTreeOnlyZoomShortcuts() {
  window.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      if (!hasVisibleTreeSurface()) return;

      event.preventDefault();
    },
    { capture: true, passive: false },
  );

  window.addEventListener(
    "keydown",
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      if (event.altKey) return;
      if (!hasVisibleTreeSurface()) return;
      if (isEditableShortcutTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const code = event.code;
      const isZoomIn = key === "+" || key === "=" || code === "NumpadAdd";
      const isZoomOut = key === "-" || key === "_" || code === "NumpadSubtract";
      const isResetBrowserZoom = key === "0" || code === "Numpad0";

      if (!isZoomIn && !isZoomOut && !isResetBrowserZoom) return;

      event.preventDefault();
      event.stopPropagation();

      if (isZoomIn) dispatchTreeZoomAction("zoom-in");
      if (isZoomOut) dispatchTreeZoomAction("zoom-out");
    },
    { capture: true },
  );
}

function syncMobileFamilyTreeUnknownVitalLines() {
  if (!document.querySelector(MOBILE_FAMILY_TREE_ROOT_SELECTOR)) return;

  const rules = [
    { iconSelector: ".family-map-birth-icon", unknownText: UNKNOWN_BIRTH_TEXT },
    { iconSelector: ".family-map-deceased-icon", unknownText: UNKNOWN_DEATH_TEXT },
  ];

  for (const rule of rules) {
    document
      .querySelectorAll(`${MOBILE_FAMILY_TREE_CARD_SELECTOR} ${rule.iconSelector}`)
      .forEach((icon) => {
        const line = icon.parentElement;
        if (!(line instanceof HTMLElement)) return;

        const shouldHide = line.textContent?.includes(rule.unknownText) ?? false;
        if (shouldHide) {
          line.hidden = true;
          line.setAttribute("aria-hidden", "true");
          return;
        }

        line.hidden = false;
        line.removeAttribute("aria-hidden");
      });
  }
}

function installMobileFamilyTreeVitalLineCleanup() {
  let scheduled = false;
  const scheduleSync = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      syncMobileFamilyTreeUnknownVitalLines();
    });
  };

  scheduleSync();

  const observer = new MutationObserver(scheduleSync);
  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  window.addEventListener("resize", scheduleSync);
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getFirstLoginTutorialPanel(root: HTMLElement) {
  return Array.from(root.children).find(
    (child): child is HTMLElement => child instanceof HTMLElement && child.tagName === "SECTION",
  );
}

function getFirstLoginTutorialTitle(root: HTMLElement) {
  return root.querySelector(FIRST_LOGIN_TUTORIAL_TITLE_SELECTOR)?.textContent?.trim() ?? "";
}

function clickFirstLoginTutorialNext(root: HTMLElement) {
  const nextButton = Array.from(root.querySelectorAll<HTMLButtonElement>("button")).find((button) =>
    button.textContent?.trim() === "Próximo",
  );

  nextButton?.click();
}

function tuneFirstLoginTutorialDom() {
  const treePanel = document.querySelector<HTMLElement>(DESKTOP_TREE_PANEL_SELECTOR);
  if (treePanel) {
    treePanel.setAttribute("data-tour-target", "tree-controls");
  }

  document.querySelectorAll<HTMLElement>(TREE_CONTROLS_COLLAPSE_SELECTOR).forEach((element) => {
    element.removeAttribute("data-tour-target");
  });

  const root = document.querySelector<HTMLElement>(FIRST_LOGIN_TUTORIAL_SELECTOR);
  if (!root) return;

  const title = getFirstLoginTutorialTitle(root);
  const tutorialPanel = getFirstLoginTutorialPanel(root);
  if (!tutorialPanel) return;

  if (title === "Controle quem aparece na árvore") {
    clickFirstLoginTutorialNext(root);
    return;
  }

  const viewportMargin = 14;
  const estimatedPanelHeight = 315;
  const width = Math.min(430, window.innerWidth - viewportMargin * 2);

  if (title === "Modos de exibição e controles da árvore" && treePanel) {
    const targetRect = treePanel.getBoundingClientRect();
    const preferredLeft = targetRect.right + 18;
    const fitsRight = preferredLeft + width <= window.innerWidth - viewportMargin;
    const left = fitsRight
      ? preferredLeft
      : clampNumber(targetRect.left, viewportMargin, window.innerWidth - width - viewportMargin);
    const top = clampNumber(
      targetRect.top,
      viewportMargin,
      window.innerHeight - estimatedPanelHeight - viewportMargin,
    );

    tutorialPanel.style.left = `${left}px`;
    tutorialPanel.style.top = `${top}px`;
    tutorialPanel.style.width = `${width}px`;
    return;
  }

  if (title === "Perfis, vínculos e memórias") {
    const personCard = document.querySelector<HTMLElement>('[data-family-map-central-card="true"]');
    const targetRect = personCard?.getBoundingClientRect();
    const desiredTop = targetRect
      ? targetRect.top - estimatedPanelHeight - 24
      : tutorialPanel.getBoundingClientRect().top - 120;

    tutorialPanel.style.top = `${clampNumber(
      desiredTop,
      viewportMargin,
      window.innerHeight - estimatedPanelHeight - viewportMargin,
    )}px`;
  }
}

function installFirstLoginTutorialTuning() {
  let scheduled = false;

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      tuneFirstLoginTutorialDom();
    });
  };

  schedule();

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    childList: true,
    characterData: true,
    attributes: true,
    subtree: true,
  });

  window.addEventListener("resize", schedule);
  window.addEventListener("scroll", schedule, true);
}

disableMobileDesktopTip();
installTreeOnlyZoomShortcuts();
installMobileFamilyTreeVitalLineCleanup();
installFirstLoginTutorialTuning();

window.addEventListener("error", (event) => {
  recoverFromDynamicImportError(event.error || event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  recoverFromDynamicImportError(event.reason);
});

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <MobileTreeControlsPortal />
  </>
);

window.setTimeout(recoverFromMissingCss, 1200);

window.setTimeout(() => {
  sessionStorage.removeItem(DYNAMIC_IMPORT_RELOAD_KEY);
  sessionStorage.removeItem(CSS_RELOAD_KEY);
}, 5000);
