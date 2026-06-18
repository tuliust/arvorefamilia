import { createRoot } from "react-dom/client";
import App from "./app/App";
import { MobileTreeControlsPortal } from "./app/components/FamilyTree/MobileTreeControlsPortal";
import "./styles/index.css";
import "./styles/mobile-tree-controls.css";
import "./styles/mobile-tree-lines.css";
import "./styles/mobile-edit-profile.css";
import "./styles/mobile-member-pages.css";

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

disableMobileDesktopTip();
installTreeOnlyZoomShortcuts();
installMobileFamilyTreeVitalLineCleanup();

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
