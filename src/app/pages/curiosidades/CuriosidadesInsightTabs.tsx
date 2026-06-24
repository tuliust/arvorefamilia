import { useEffect, useMemo, useState } from 'react';
import { GitCompareArrows, MoonStar, Network, Search } from 'lucide-react';

import { CuriosidadesAstrology } from './CuriosidadesAstrology';
import { CuriosidadesConnectionSection } from './CuriosidadesConnectionSection';
import { CuriosidadesDiscoverySection } from './CuriosidadesDiscoverySection';
import { CuriosidadesInterestsSection } from './CuriosidadesInterestsSection';
import {
  curiositySectionCardClassName,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

type CuriosidadesInsightTabKey = 'discovery' | 'connections' | 'interests' | 'astrology';

const insightTabs = [
  {
    key: 'discovery',
    label: 'Descubra mais sobre...',
    hash: '#descobertas',
    icon: Search,
  },
  {
    key: 'connections',
    label: 'Qual a minha conexão?',
    hash: '#conexoes',
    icon: Network,
  },
  {
    key: 'interests',
    label: 'Comparar interesses',
    hash: '#interesses',
    icon: GitCompareArrows,
  },
  {
    key: 'astrology',
    label: 'Astrologia da família',
    hash: '#astrologia',
    icon: MoonStar,
  },
] satisfies Array<{
  key: CuriosidadesInsightTabKey;
  label: string;
  hash: string;
  icon: typeof Search;
}>;

function getTabFromHash(hash: string): CuriosidadesInsightTabKey {
  if (hash === '#conexoes') return 'connections';
  if (hash === '#interesses') return 'interests';
  if (hash === '#astrologia') return 'astrology';
  return 'discovery';
}

export function CuriosidadesInsightTabs(props: CuriosidadesDataProps) {
  const [activeTab, setActiveTab] = useState<CuriosidadesInsightTabKey>(() => {
    if (typeof window === 'undefined') return 'discovery';
    return getTabFromHash(window.location.hash);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncTabWithHash = () => {
      setActiveTab(getTabFromHash(window.location.hash));
    };

    syncTabWithHash();
    window.addEventListener('hashchange', syncTabWithHash);

    return () => {
      window.removeEventListener('hashchange', syncTabWithHash);
    };
  }, []);

  const activeTabConfig = useMemo(
    () => insightTabs.find((tab) => tab.key === activeTab) ?? insightTabs[0],
    [activeTab]
  );

  const updateActiveTab = (tabKey: CuriosidadesInsightTabKey, hash: string) => {
    setActiveTab(tabKey);

    if (typeof window === 'undefined') return;

    const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;
    window.history.replaceState(null, '', nextUrl);
  };

  return (
    <section className={`${curiositySectionCardClassName} relative`}>
      <span id="descobertas" className="pointer-events-none absolute -top-24" aria-hidden="true" />
      <span id="conexoes" className="pointer-events-none absolute -top-24" aria-hidden="true" />
      <span id="interesses" className="pointer-events-none absolute -top-24" aria-hidden="true" />
      <span id="astrologia" className="pointer-events-none absolute -top-24" aria-hidden="true" />

      <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5">
        {insightTabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.key === activeTabConfig.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => updateActiveTab(tab.key, tab.hash)}
              className={[
                'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition sm:flex-none sm:justify-start',
                active
                  ? 'bg-white text-blue-800 shadow-sm ring-1 ring-blue-100'
                  : 'text-gray-600 hover:bg-white hover:text-blue-700',
              ].join(' ')}
              aria-pressed={active}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 min-w-0">
        {activeTab === 'discovery' && (
          <CuriosidadesDiscoverySection {...props} embedded />
        )}

        {activeTab === 'connections' && (
          <CuriosidadesConnectionSection {...props} embedded />
        )}

        {activeTab === 'interests' && (
          <CuriosidadesInterestsSection {...props} embedded />
        )}

        {activeTab === 'astrology' && (
          <CuriosidadesAstrology {...props} embedded />
        )}
      </div>
    </section>
  );
}
