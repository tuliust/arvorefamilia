const fs = require('fs');
const path = require('path');

const root = process.cwd();
const homePath = path.join(root, 'src/app/pages/Home.tsx');
const stickyPath = path.join(root, 'src/app/pages/home/HorizontalLineHighlightHint.tsx');

function fail(message) {
  console.error('\n[ERRO] ' + message + '\n');
  process.exit(1);
}

function replaceOnce(source, search, replacement, label) {
  if (!source.includes(search)) {
    fail('Não encontrei o trecho para alterar: ' + label);
  }

  return source.replace(search, replacement);
}

if (!fs.existsSync(homePath)) {
  fail('Arquivo não encontrado: src/app/pages/Home.tsx');
}

const stickyComponent = String.raw`import React, { useEffect, useState } from 'react';
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
      // Mantém apenas o estado em memória quando o localStorage não estiver disponível.
    }
  };

  return (
    <aside
      className="pointer-events-auto absolute right-4 top-4 z-[9000] max-w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-amber-950 shadow-xl backdrop-blur-sm sm:right-6 sm:top-6"
      role="note"
      aria-label="Dica sobre destaque de linhas"
      data-tree-export-ignore="true"
    >
      <div className="absolute -top-2 right-10 h-4 w-4 rotate-45 border-l border-t border-amber-200 bg-amber-50/95" />

      <div className="relative z-10 flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white/80 text-amber-700">
          <MousePointerClick className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-amber-700">
            Dica rápida
          </p>
          <p className="mt-1 text-sm font-bold leading-5 text-amber-950">
            Clique nas linhas que conectam grupos e cards para destacá-las.
          </p>
        </div>

        <button
          type="button"
          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-amber-800 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          onClick={handleDismiss}
          aria-label="Fechar dica"
          title="Fechar dica"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
`;

fs.mkdirSync(path.dirname(stickyPath), { recursive: true });
fs.writeFileSync(stickyPath, stickyComponent, 'utf8');

let home = fs.readFileSync(homePath, 'utf8');

if (!home.includes("import { HorizontalLineHighlightHint } from './home/HorizontalLineHighlightHint';")) {
  const importAnchor = "import { HomeHeader } from './home/HomeHeader';";

  home = replaceOnce(
    home,
    importAnchor,
    "import { HorizontalLineHighlightHint } from './home/HorizontalLineHighlightHint';\n" + importAnchor,
    'import HorizontalLineHighlightHint'
  );
}

if (!home.includes('<HorizontalLineHighlightHint')) {
  const renderAnchor = `        <HomeTreeSection
          isTreeResolving={isTreeResolving}
          loadError={loadError}
          pessoas={pessoas}
          centralReferencePersonId={centralReferencePersonId}
          canRenderTree={canRenderTree}
          familyTreeRef={familyTreeRef}
          visiblePersonIdsByLifeStatus={visiblePersonIdsByLifeStatus}
          relacionamentos={relacionamentos}
          onPersonClick={handlePersonClick}
          onPersonView={handlePersonView}
          onPersonEdit={handlePersonEdit}
          onPersonAddConnection={handlePersonAddConnection}
          onPersonRemove={handlePersonRemove}
          onMarriageClick={handleMarriageClick}
          selectedPersonId={selectedPersonId}
          edgeFilters={edgeFilters}
          directRelativeFilters={directRelativeFilters}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          treeLayoutRevision={treeLayoutRevision}
          treeViewMode={treeViewMode}
          genealogyFilters={genealogyFilters}
          visualLineFilters={visualLineFilters}
          renderStateMessage={(props) => <StateMessage {...props} />}
          onDirectRelationRenderedCounts={handleDirectRelationRenderedCounts}
        />`;

  home = replaceOnce(
    home,
    renderAnchor,
    renderAnchor + `

        <HorizontalLineHighlightHint
          visible={canRenderTree && treeViewMode === 'mapa-familiar-horizontal'}
        />`,
    'render HorizontalLineHighlightHint'
  );
}

fs.writeFileSync(homePath, home, 'utf8');

console.log('\nSticky da página horizontal inserido com sucesso.');
console.log('Arquivos alterados/criados:');
console.log('- src/app/pages/Home.tsx');
console.log('- src/app/pages/home/HorizontalLineHighlightHint.tsx');
console.log('\nAgora rode:');
console.log('npm run build');
console.log('git diff --check');
console.log('git status --short');
