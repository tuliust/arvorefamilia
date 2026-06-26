const DESKTOP_TREE_VIEW_SELECT_SELECTOR = '.desktop-tree-view-select';

const BROKEN_I_ACUTE_SINGLE = String.fromCharCode(0x00c3, 0x00ad);
const BROKEN_I_ACUTE_DOUBLE = String.fromCharCode(0x00c3, 0x0192, 0x00c2, 0x00ad);
const BROKEN_A_TILDE_SINGLE = String.fromCharCode(0x00c3, 0x00a3);
const BROKEN_A_TILDE_DOUBLE = String.fromCharCode(0x00c3, 0x0192, 0x00c2, 0x00a3);

const TEXT_REPLACEMENTS: Array<[string, string]> = [
  [`Fam${BROKEN_I_ACUTE_DOUBLE}lia`, 'Família'],
  [`Fam${BROKEN_I_ACUTE_SINGLE}lia`, 'Família'],
  [`padr${BROKEN_A_TILDE_DOUBLE}o`, 'padrão'],
  [`padr${BROKEN_A_TILDE_SINGLE}o`, 'padrão'],
];

function replaceAllOccurrences(value: string, search: string, replacement: string) {
  return value.split(search).join(replacement);
}

function normalizeDesktopPanelText(value: string) {
  return TEXT_REPLACEMENTS.reduce(
    (current, [search, replacement]) => replaceAllOccurrences(current, search, replacement),
    value,
  );
}

function normalizeSelectOptions(select: HTMLSelectElement) {
  Array.from(select.options).forEach((option) => {
    const current = option.textContent ?? '';
    const normalized = normalizeDesktopPanelText(current);

    if (normalized !== current) {
      option.textContent = normalized;
    }
  });
}

function syncDesktopPanelLabels() {
  document
    .querySelectorAll<HTMLSelectElement>(DESKTOP_TREE_VIEW_SELECT_SELECTOR)
    .forEach(normalizeSelectOptions);
}

function installDesktopPanelTextFix() {
  syncDesktopPanelLabels();

  const observer = new MutationObserver(syncDesktopPanelLabels);
  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installDesktopPanelTextFix, { once: true });
} else {
  installDesktopPanelTextFix();
}

export {};
