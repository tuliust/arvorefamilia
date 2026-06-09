import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { MobileTreeControlsPortal } from "./app/components/FamilyTree/MobileTreeControlsPortal.tsx";
import "./styles/index.css";
import "./styles/mobile-tree-controls.css";
import "./styles/mobile-tree-lines.css";
import "./styles/mobile-edit-profile.css";

const DYNAMIC_IMPORT_RELOAD_KEY = "arvorefamilia:dynamic-import-reload";
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

function reloadWithFreshIndex() {
  const url = new URL(window.location.href);
  url.searchParams.set("__reload", String(Date.now()));
  window.location.replace(url.toString());
}

function recoverFromDynamicImportError(error: unknown) {
  if (!isDynamicImportError(error)) return;
  if (sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY) === "1") return;

  sessionStorage.setItem(DYNAMIC_IMPORT_RELOAD_KEY, "1");
  void clearBrowserCaches().finally(reloadWithFreshIndex);
}

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