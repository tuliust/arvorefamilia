const fs = require('fs');
const path = require('path');

const root = process.cwd();
const stickyPath = path.join(root, 'src/app/pages/home/HorizontalLineHighlightHint.tsx');

if (!fs.existsSync(stickyPath)) {
  console.error('[ERRO] Arquivo não encontrado:', stickyPath);
  process.exit(1);
}

const content = String.raw`import React, { useEffect, useState } from 'react';
import { MousePointerClick, X } from 'lucide-react';

type HorizontalLineHighlightHintProps = {
  visible: boolean;
};

const STORAGE_KEY = 'arvorefamilia:horizontal-line-highlight-hint:v1';

export function HorizontalLineHighlightHint({
  visible,
}: HorizontalLineHighlightHintProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === 'dismissed');
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!visible || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);

    try {
      window.localStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {
      // Ignora quando localStorage não estiver disponível.
    }
  };

  return (
    <aside
      className="pointer-events-auto absolute right-3 top-3 z-[9000] sm:right-5 sm:top-5"
      role="note"
      aria-label="Dica sobre destaque de linhas"
      data-tree-export-ignore="true"
    >
      <svg
        className="pointer-events-none absolute right-[10.5rem] top-[2.6rem] hidden h-24 w-40 overflow-visible text-amber-500 sm:block"
        viewBox="0 0 160 96"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="horizontal-line-hint-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0 0L8 4L0 8Z" fill="currentColor" />
          </marker>
        </defs>

        <path
          d="M150 8C112 12 88 28 69 48C51 67 32 80 9 84"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="5 5"
          markerEnd="url(#horizontal-line-hint-arrow)"
        />
      </svg>

      <div className="relative max-w-[15rem] rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2.5 text-amber-950 shadow-lg backdrop-blur-sm">
        <span
          className="absolute -left-1.5 top-7 hidden h-3 w-3 rotate-45 border-b border-l border-amber-200 bg-amber-50/95 sm:block"
          aria-hidden="true"
        />

        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-white/80 text-amber-700">
            <MousePointerClick className="h-3.5 w-3.5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-700">
              Dica
            </p>
            <p className="mt-0.5 text-xs font-bold leading-4 text-amber-950">
              Clique nas linhas entre grupos e cards para destacá-las.
            </p>
          </div>

          <button
            type="button"
            className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-amber-800 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            onClick={handleDismiss}
            aria-label="Fechar dica"
            title="Fechar dica"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
`;

fs.writeFileSync(stickyPath, content, 'utf8');

console.log('Dica compactada com seta aplicada em:');
console.log('- src/app/pages/home/HorizontalLineHighlightHint.tsx');
console.log('');
console.log('Agora rode:');
console.log('npm run build');
console.log('git diff --check');
console.log('git status --short');
