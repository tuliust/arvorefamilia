import { defineConfig, loadEnv, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import aiHandler from './api/ai'

const HORIZONTAL_MAP_SPOUSE_VISIBILITY_TARGET = 'if (!hasBaseFamilyAnchor && !isAlwaysVisibleSpouseGeneration(effectiveGeneration)) return;';
const HORIZONTAL_MAP_SPOUSE_VISIBILITY_REPLACEMENT = 'if (directFamilyOnly && !directRelativeFilters.conjuge && !hasBaseFamilyAnchor && !isAlwaysVisibleSpouseGeneration(effectiveGeneration)) return;';

function replaceExact(code: string, target: string, replacement: string) {
  return code.includes(target) ? code.replace(target, replacement) : code;
}

function desktopTreeVisualizationPanelPatch(code: string) {
  let nextCode = code;

  nextCode = replaceExact(
    nextCode,
    `  directRelationCounts,
  onToggleDirectRelative,
  onCollapse,
}: {`,
    `  directRelationCounts,
  onToggleDirectRelative,
  directFamilyOnly = true,
  onToggleDirectFamilyOnly,
  onCollapse,
}: {`,
  );

  nextCode = replaceExact(
    nextCode,
    `  directRelationCounts: DirectRelationCounts;
  onToggleDirectRelative: (key: DirectRelativeGroup) => void;
  onCollapse?: () => void;`,
    `  directRelationCounts: DirectRelationCounts;
  onToggleDirectRelative: (key: DirectRelativeGroup) => void;
  directFamilyOnly?: boolean;
  onToggleDirectFamilyOnly?: () => void;
  onCollapse?: () => void;`,
  );

  nextCode = replaceExact(
    nextCode,
    `          <button
            type="button"
            className="desktop-tree-final-filter-button"
            disabled
            aria-label="Apenas meus familiares. Funcionalidade será definida posteriormente."
            title="Funcionalidade será definida posteriormente."
          >
            <UsersRound />
            <span>Apenas meus familiares</span>
          </button>`,
    `          <button
            type="button"
            className="desktop-tree-final-filter-button"
            aria-pressed={directFamilyOnly}
            aria-label={directFamilyOnly ? 'Apenas meus familiares ativo' : 'Exibir todas as pessoas cadastradas'}
            data-active={directFamilyOnly ? 'true' : 'false'}
            disabled={currentViewMode !== 'mapa-familiar-horizontal' || !onToggleDirectFamilyOnly}
            onClick={() => {
              if (currentViewMode !== 'mapa-familiar-horizontal') return;
              onToggleDirectFamilyOnly?.();
            }}
            title={currentViewMode !== 'mapa-familiar-horizontal'
              ? 'Disponível na Linha Geracional'
              : directFamilyOnly
                ? 'Exibir todas as pessoas cadastradas'
                : 'Mostrar apenas meus familiares'}
          >
            <UsersRound />
            <span>{directFamilyOnly ? 'Apenas meus familiares' : 'Todas as pessoas'}</span>
          </button>`,
  );

  return nextCode;
}

function homePageDirectFamilyOnlyPatch(code: string) {
  let nextCode = code;

  nextCode = replaceExact(
    nextCode,
    `  const [registeredPeopleCount, setRegisteredPeopleCount] = useState(0);`,
    `  const [registeredPeopleCount, setRegisteredPeopleCount] = useState(0);
  const [directFamilyOnly, setDirectFamilyOnly] = useState(true);`,
  );

  nextCode = replaceExact(
    nextCode,
    `  const toggleDirectRelativeFilter = useCallback((filterKey: DirectRelativeGroup) => {
    setDirectRelativeFilterState((prev) => ({
      userId: user?.id,
      filters: {
        ...prev.filters,
        [filterKey]: !prev.filters[filterKey],
      },
    }));
  }, [user?.id]);`,
    `  const toggleDirectRelativeFilter = useCallback((filterKey: DirectRelativeGroup) => {
    setDirectRelativeFilterState((prev) => ({
      userId: user?.id,
      filters: {
        ...prev.filters,
        [filterKey]: !prev.filters[filterKey],
      },
    }));
  }, [user?.id]);

  const toggleDirectFamilyOnly = useCallback(() => {
    setDirectFamilyOnly((current) => !current);
    setRenderedDirectRelationCounts(null);
    setTreeLayoutRevision((revision) => revision + 1);

    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      setTreeLayoutRevision((revision) => revision + 1);
    }, 80);
  }, []);`,
  );

  nextCode = replaceExact(
    nextCode,
    `                    directRelationCounts={effectiveDirectRelationCounts}
                    onToggleDirectRelative={toggleDirectRelativeFilter}
                    onCollapse={() => setSidebarOpen(false)}`, 
    `                    directRelationCounts={effectiveDirectRelationCounts}
                    onToggleDirectRelative={toggleDirectRelativeFilter}
                    directFamilyOnly={directFamilyOnly}
                    onToggleDirectFamilyOnly={toggleDirectFamilyOnly}
                    onCollapse={() => setSidebarOpen(false)}`,
  );

  nextCode = replaceExact(
    nextCode,
    `          directRelativeFilters={directRelativeFilters}
          isMobile={isMobile}`, 
    `          directRelativeFilters={directRelativeFilters}
          directFamilyOnly={directFamilyOnly}
          isMobile={isMobile}`,
  );

  return nextCode;
}

function homeTreeSectionDirectFamilyOnlyPatch(code: string) {
  let nextCode = code;

  nextCode = replaceExact(
    nextCode,
    `  directRelativeFilters: DirectRelativeFilters;
  isMobile: boolean;`,
    `  directRelativeFilters: DirectRelativeFilters;
  directFamilyOnly?: boolean;
  isMobile: boolean;`,
  );

  nextCode = replaceExact(
    nextCode,
    `  directRelativeFilters,
  isMobile,`,
    `  directRelativeFilters,
  directFamilyOnly = true,
  isMobile,`,
  );

  nextCode = replaceExact(
    nextCode,
    `          directRelativeFilters={directRelativeFilters}
          onPersonClick={onPersonClick}`, 
    `          directRelativeFilters={directRelativeFilters}
          directFamilyOnly={directFamilyOnly}
          onPersonClick={onPersonClick}`,
  );

  return nextCode;
}

function desktopHorizontalMapFilteredViewPatch(code: string) {
  let nextCode = code;

  nextCode = replaceExact(
    nextCode,
    `  directRelativeFilters: DirectRelativeFilters;
  onPersonClick: (pessoa: Pessoa) => void;`,
    `  directRelativeFilters: DirectRelativeFilters;
  directFamilyOnly?: boolean;
  onPersonClick: (pessoa: Pessoa) => void;`,
  );

  nextCode = replaceExact(
    nextCode,
    `  directRelativeFilters,
  onPersonClick,`,
    `  directRelativeFilters,
  directFamilyOnly = true,
  onPersonClick,`,
  );

  nextCode = replaceExact(
    nextCode,
    `  const filteredVisiblePersonIds = React.useMemo(() => {
    const graph = buildTreeGraph({`,
    `  const filteredVisiblePersonIds = React.useMemo(() => {
    if (!directFamilyOnly) return visiblePersonIds;

    const graph = buildTreeGraph({`,
  );

  nextCode = replaceExact(
    nextCode,
    `  }, [centralPersonId, directRelativeFilters, onPersonClick, pessoas, relacionamentos, visiblePersonIds]);`,
    `  }, [centralPersonId, directFamilyOnly, directRelativeFilters, onPersonClick, pessoas, relacionamentos, visiblePersonIds]);`,
  );

  nextCode = replaceExact(
    nextCode,
    `      directRelativeFilters={directRelativeFilters}
      onPersonClick={onPersonClick}`, 
    `      directRelativeFilters={directRelativeFilters}
      directFamilyOnly={directFamilyOnly}
      onPersonClick={onPersonClick}`,
  );

  return nextCode;
}

function desktopHorizontalMapViewPatch(code: string) {
  let nextCode = code;

  nextCode = replaceExact(
    nextCode,
    `  directRelativeFilters: DirectRelativeFilters;
  onPersonClick: (pessoa: Pessoa) => void;`,
    `  directRelativeFilters: DirectRelativeFilters;
  directFamilyOnly?: boolean;
  onPersonClick: (pessoa: Pessoa) => void;`,
  );

  nextCode = replaceExact(
    nextCode,
    `  directRelativeFilters,
  onPersonClick,`,
    `  directRelativeFilters,
  directFamilyOnly = true,
  onPersonClick,`,
  );

  nextCode = replaceExact(
    nextCode,
    `    const inferredGenerations = inferHorizontalGenerations(statusFilteredPeople, maps, centralPersonId);
    const selectedPersonIds = new Set(baseScopeIds);
    const baseFamilyPersonIds = new Set(baseScopeIds);`,
    `    const inferredGenerations = inferHorizontalGenerations(statusFilteredPeople, maps, centralPersonId);
    if (!directFamilyOnly) {
      statusFilteredPeople.forEach((person) => {
        if (!inferredGenerations.has(person.id)) inferredGenerations.set(person.id, getManualGeneration(person) ?? 5);
      });
    }
    const allStatusFilteredPersonIds = new Set(statusFilteredPeople.map((person) => person.id));
    const selectedPersonIds = directFamilyOnly ? new Set(baseScopeIds) : new Set(allStatusFilteredPersonIds);
    const baseFamilyPersonIds = directFamilyOnly ? new Set(baseScopeIds) : new Set(allStatusFilteredPersonIds);`,
  );

  nextCode = replaceExact(
    nextCode,
    HORIZONTAL_MAP_SPOUSE_VISIBILITY_TARGET,
    HORIZONTAL_MAP_SPOUSE_VISIBILITY_REPLACEMENT,
  );

  nextCode = replaceExact(
    nextCode,
    `        const shouldActivateCouple = isAlwaysVisibleSpouseGeneration(effectiveGeneration)
          || directRelativeFilters.conjuge;`,
    `        const shouldActivateCouple = !directFamilyOnly
          || isAlwaysVisibleSpouseGeneration(effectiveGeneration)
          || directRelativeFilters.conjuge;`,
  );

  nextCode = replaceExact(
    nextCode,
    `  }, [centralPersonId, directRelativeFilters.conjuge, maps, onPersonClick, pessoas, relacionamentos, visiblePersonIds]);`,
    `  }, [centralPersonId, directFamilyOnly, directRelativeFilters.conjuge, maps, onPersonClick, pessoas, relacionamentos, visiblePersonIds]);`,
  );

  nextCode = replaceExact(
    nextCode,
    `  const generationByPersonId = React.useMemo(
    () => inferHorizontalGenerations(visibleHorizontalPessoas, maps, centralPersonId),
    [centralPersonId, maps, visibleHorizontalPessoas],
  );`,
    `  const generationByPersonId = React.useMemo(() => {
    const generations = inferHorizontalGenerations(visibleHorizontalPessoas, maps, centralPersonId);
    if (!directFamilyOnly) {
      visibleHorizontalPessoas.forEach((person) => {
        if (!generations.has(person.id)) generations.set(person.id, getManualGeneration(person) ?? 5);
      });
    }
    return generations;
  }, [centralPersonId, directFamilyOnly, maps, visibleHorizontalPessoas]);`,
  );

  return nextCode;
}

function familyMapRuntimePatches(): Plugin {
  return {
    name: 'family-map-runtime-patches',
    enforce: 'pre',
    transform(code, id) {
      let nextCode = code;

      if (id.endsWith('DesktopTreeVisualizationPanel.tsx')) {
        nextCode = desktopTreeVisualizationPanelPatch(nextCode);
      } else if (id.endsWith('/Home.tsx')) {
        nextCode = homePageDirectFamilyOnlyPatch(nextCode);
      } else if (id.endsWith('HomeTreeSection.tsx')) {
        nextCode = homeTreeSectionDirectFamilyOnlyPatch(nextCode);
      } else if (id.endsWith('DesktopFamilyHorizontalMapFilteredView.tsx')) {
        nextCode = desktopHorizontalMapFilteredViewPatch(nextCode);
      } else if (id.endsWith('DesktopFamilyHorizontalMapView.tsx')) {
        nextCode = desktopHorizontalMapViewPatch(nextCode);
      }

      return nextCode === code ? null : { code: nextCode, map: null };
    },
  };
}

function readRequestBody(req: any) {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function createLocalApiResponse(res: any) {
  return {
    status(code: number) {
      res.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      if (!res.statusCode) res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(payload));
      return res;
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(env)) {
    process.env[key] ||= value;
  }

  return {
    plugins: [
      familyMapRuntimePatches(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
      {
        name: 'local-api-ai',
        configureServer(server) {
          server.middlewares.use('/api/ai', async (req, res) => {
            try {
              req.body = await readRequestBody(req);
              await aiHandler(req, createLocalApiResponse(res));
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro local na API.' }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('reactflow') || id.includes('dagre')) return 'vendor-tree';
            if (id.includes('html2canvas')) return 'vendor-html2canvas';
            if (id.includes('jspdf')) return 'vendor-jspdf';
            if (id.includes('@mui') || id.includes('@emotion')) return 'vendor-mui';
            if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('@radix-ui')) return 'vendor-radix';
            return undefined;
          },
        },
      },
    },
    test: {
      exclude: ['node_modules/**', 'dist/**', 'tests/e2e/**'],
    },
  };
})
