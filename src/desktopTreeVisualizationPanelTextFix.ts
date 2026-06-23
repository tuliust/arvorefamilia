const DESKTOP_TREE_VIEW_SELECT_SELECTOR = '.desktop-tree-view-select';

function normalizeDesktopPanelText(value: string) {
  return value
    .replace(/FamÃƒÂ­lia/g, 'Família')
    .replace(/FamÃ­lia/g, 'Família')
    .replace(/padrÃƒÂ£o/g, 'padrão')
    .replace(/padrÃ£o/g, 'padrão');
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
