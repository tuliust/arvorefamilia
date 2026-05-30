const TEXT_ENCODING_REPLACEMENTS: Array<[string, string]> = [
  ['Arquivos Hist?ricos', 'Arquivos Históricos'],
  ['arquivos hist?ricos', 'arquivos históricos'],
  [
    'Voc? tem altera??es pendentes nesta p?gina. Se sair agora, as altera??es n?o salvas ser?o descartadas.',
    'Você tem alterações pendentes nesta página. Se sair agora, as alterações não salvas serão descartadas.',
  ],
  ['O corte final ser? quadrado.', 'O corte final será quadrado.'],
];

function repairText(value: string) {
  if (!value.includes('?')) return value;

  return TEXT_ENCODING_REPLACEMENTS.reduce(
    (current, [broken, fixed]) => current.replaceAll(broken, fixed),
    value,
  );
}

function repairTextNode(node: Text) {
  const currentValue = node.nodeValue;
  if (!currentValue) return;

  const repairedValue = repairText(currentValue);
  if (repairedValue !== currentValue) {
    node.nodeValue = repairedValue;
  }
}

function repairTextNodes(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    repairTextNode(root as Text);
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();

  while (currentNode) {
    repairTextNode(currentNode as Text);
    currentNode = walker.nextNode();
  }
}

export function startTextEncodingRepair() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => undefined;
  }

  repairTextNodes(document.body);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(repairTextNodes);

      if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
        repairTextNode(mutation.target as Text);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  return () => observer.disconnect();
}
