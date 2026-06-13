import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import type { FamilyTreeActions } from '../components/FamilyTree/FamilyTree';
import { TreeLegend } from '../components/FamilyTree/TreeLegend';
import { buildTreeGraph } from '../components/FamilyTree/buildTreeGraph';
import { collectDirectFamilyScopePersonIds } from '../components/FamilyTree/layouts/directFamilyDistributedLayout';
import { ViewMarriageModal } from '../components/FamilyTree/modals/ViewMarriageModal';
import {
  AddConnectionModal,
  type AddConnectionPayload,
} from '../components/FamilyTree/modals/AddConnectionModal';
import { useIsMobile } from '../components/FamilyTree/hooks/useIsMobile';
import {
  readDirectRelativeFilters,
  storeDirectRelativeFilters,
  migrateLegacyTreeViewPreferences,
} from '../components/FamilyTree/utils/treePreferences';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  obterTodasPessoas,
  obterTodosRelacionamentos,
  buscarPessoas,
} from '../services/dataService';
import {
  clearTreeDataCache,
  getCachedTreeData,
  setCachedTreeData,
  subscribeTreeDataChanged,
} from '../services/treeDataCache';
import { Pessoa, Relacionamento } from '../types';
import {
  DEFAULT_GENEALOGY_FILTERS,
  DEFAULT_DIRECT_RELATIVE_FILTERS,
  DEFAULT_VISUAL_LINE_FILTERS,
  DirectRelativeFilters,
  DirectRelativeGroup,
  GenealogyFilterKey,
  GenealogyFilters,
  MarriageNodeDetails,
  VisualLineFilterKey,
  VisualLineFilters,
} from '../components/FamilyTree/types';
import {
  getPathForTreeViewMode,
  getTreeViewModeFromPath,
  type TreeViewMode,
} from '../components/FamilyTree/treeViewMode';
import { useAuth } from '../contexts/AuthContext';
import { getMemberProfile, getPrimaryLinkedPerson, MemberProfile } from '../services/memberProfileService';
import { isAdminUser } from '../services/permissionService';
import {
  getInsightByType,
  obterInsightsGeradosPessoa,
  PersonGeneratedInsight,
} from '../services/personInsightsService';
import { isPersonDeceased } from '../utils/personFields';
import { isHumanFamilyMember, isPetFamilyMember } from '../utils/personEntity';
import {
  calculateRelationshipDegree,
  type RelationshipDegreeResult,
} from '../utils/relationshipDegree';
import {
  Search,
  Lightbulb,
  Bot,
  Network,
  Monitor,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';
import { DirectRelationKpiGrid } from './home/DirectRelationKpiGrid';
import { GenealogyFilterGrid } from './home/GenealogyFilterGrid';
import { buildAiTreeContext } from './home/homeAiContext';
import {
  calculateCuriosities,
  type CuriosityTopic,
} from './home/homeCuriositiesUtils';
import {
  HomeCuriositiesDialog,
  type CuriosidadesTab,
} from './home/HomeCuriositiesDialog';
import { HomeHeader } from './home/HomeHeader';
import { HomeMobileNav } from './home/HomeMobileNav';
import { HomeTreeSection } from './home/HomeTreeSection';
import { LifeStatusKpiGrid } from './home/LifeStatusKpiGrid';
import { SidebarInfoPanel } from './home/SidebarInfoPanel';
import { SidebarPanelTabs, type SidebarPanel } from './home/SidebarPanelTabs';

const AI_QUESTION_EXAMPLES = [
  'Quem são meus bisavós paternos?',
  'Quantas pessoas da família nasceram em Recife?',
  'Quais parentes moram em Porto Alegre?',
  'Monte um resumo da linha genealógica de uma pessoa.',
];
const AI_QUESTION_PLACEHOLDER = `Pergunte, por exemplo:\n${AI_QUESTION_EXAMPLES.join('\n')}`;

const AI_ENDPOINT = '/api/ai';
const MOBILE_DESKTOP_TIP_SESSION_KEY = 'arvore-mobile-desktop-tip-dismissed';
const MOBILE_DESKTOP_TIP_PENDING_KEY = 'arvore-mobile-desktop-tip-pending';

type PersonStatusFilters = {
  vivos: boolean;
  falecidos: boolean;
  pets: boolean;
};

function isVisibleByLifeStatusFilter(
  pessoa: Pessoa,
  filters: PersonStatusFilters,
  centralReferencePersonId?: string
) {
  if (centralReferencePersonId && pessoa.id === centralReferencePersonId) {
    return true;
  }

  if (isPetFamilyMember(pessoa)) {
    return filters.pets;
  }

  if (isPersonDeceased(pessoa)) {
    return filters.falecidos;
  }

  return filters.vivos;
}


export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryPersonId = searchParams.get('pessoa')?.trim() || undefined;
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | undefined>();
  const [linkedPersonId, setLinkedPersonId] = useState<string | undefined>();
  const [linkedPersonResolved, setLinkedPersonResolved] = useState(false);
  const [treeFocusPersonId, setTreeFocusPersonId] = useState<string | undefined>();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([]);
  const [pessoasFiltradas, setPessoasFiltradas] = useState<Pessoa[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [treeLayoutRevision, setTreeLayoutRevision] = useState(0);
  const [activeSidebarPanel, setActiveSidebarPanel] = useState<SidebarPanel>('filters');
  const [legendOpen, setLegendOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileTipOpen, setMobileTipOpen] = useState(false);

  const [directRelativeFilterState, setDirectRelativeFilterState] = useState<{
    userId?: string;
    filters: DirectRelativeFilters;
  }>(() => ({
    userId: user?.id,
    filters: readDirectRelativeFilters(user?.id),
  }));

  const [selectedMarriage, setSelectedMarriage] = useState<MarriageNodeDetails | null>(null);
  const [connectionTarget, setConnectionTarget] = useState<Pessoa | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedCuriosityPersonId, setSelectedCuriosityPersonId] = useState<string>('');
  const [selectedCuriosityTopics, setSelectedCuriosityTopics] = useState<CuriosityTopic[]>([]);
  const [activeCuriosityTab, setActiveCuriosityTab] = useState<CuriosidadesTab>('voce-sabia');
  const [discoverSubmitted, setDiscoverSubmitted] = useState(false);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [discoverInsights, setDiscoverInsights] = useState<PersonGeneratedInsight[]>([]);
  const [connectionPersonOneId, setConnectionPersonOneId] = useState<string>('');
  const [connectionPersonTwoId, setConnectionPersonTwoId] = useState<string>('');
  const [connectionResult, setConnectionResult] = useState<RelationshipDegreeResult | null>(null);
  const [connectionIncludeInactiveSpouses, setConnectionIncludeInactiveSpouses] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const familyTreeRef = useRef<FamilyTreeActions | null>(null);
  const treeViewMode = getTreeViewModeFromPath(location.pathname);
  const treeDataLoadTokenRef = useRef(0);
  const treeCacheKey = linkedPersonResolved
    ? `home:${user?.id ?? 'anon'}:${linkedPersonId ?? 'no-linked-person'}`
    : null;

  const buildTreePathForPerson = useCallback(
    (personId?: string) => {
      const nextPath = getPathForTreeViewMode(treeViewMode);
      const params = new URLSearchParams(location.search);
      const cleanPersonId = personId?.trim();

      if (cleanPersonId) {
        params.set('pessoa', cleanPersonId);
      } else {
        params.delete('pessoa');
      }

      const query = params.toString();
      return `${nextPath}${query ? `?${query}` : ''}`;
    },
    [location.search, treeViewMode]
  );

  const buildCurrentTreeReturnPath = useCallback(
    () => buildTreePathForPerson(queryPersonId || treeFocusPersonId || selectedPersonId || linkedPersonId),
    [buildTreePathForPerson, linkedPersonId, queryPersonId, selectedPersonId, treeFocusPersonId]
  );

  const [edgeFilters, setEdgeFilters] = useState({
    conjugal: true,
    filiacao_sangue: true,
    filiacao_adotiva: true,
    irmaos: true,
  });

  const [visualLineFilters, setVisualLineFilters] = useState<VisualLineFilters>(DEFAULT_VISUAL_LINE_FILTERS);

  const [personFilters, setPersonFilters] = useState({
    vivos: true,
    falecidos: true,
    pets: true,
  });

  const [renderedDirectRelationCounts, setRenderedDirectRelationCounts] = useState<DirectRelationCounts | null>(null);

  const [genealogyFilters, setGenealogyFilters] = useState<GenealogyFilters>(DEFAULT_GENEALOGY_FILTERS);

  useEffect(() => {
    setSidebarOpen((prev) => (isMobile ? false : prev));
    setLegendOpen((prev) => (isMobile ? false : prev));
  }, [isMobile]);

  useEffect(() => {
    setTreeLayoutRevision((revision) => revision + 1);

    const timers = [0, 120, 240].map((delay) =>
      window.setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        setTreeLayoutRevision((revision) => revision + 1);
      }, delay)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    migrateLegacyTreeViewPreferences();
  }, []);

  useEffect(() => {
    clearTreeDataCache();
    treeDataLoadTokenRef.current += 1;
    setPessoas([]);
    setRelacionamentos([]);
    setSelectedPersonId(undefined);
    setLinkedPersonId(undefined);
    setLinkedPersonResolved(false);
    setTreeFocusPersonId(undefined);
    setPessoasFiltradas([]);
    setIsLoading(true);
    setLoadError(null);
  }, [user?.id]);

  useEffect(() => {
    setDirectRelativeFilterState({
      userId: user?.id,
      filters: readDirectRelativeFilters(user?.id),
    });
  }, [user?.id]);

  useEffect(() => {
    if (!directRelativeFilterState.userId || directRelativeFilterState.userId !== user?.id) return;

    storeDirectRelativeFilters(directRelativeFilterState.userId, directRelativeFilterState.filters);
  }, [user?.id, directRelativeFilterState]);

  const loadTreeData = useCallback(async (options: { force?: boolean } = {}) => {
    if (!treeCacheKey) {
      setIsLoading(true);
      return;
    }

    const loadToken = treeDataLoadTokenRef.current + 1;
    treeDataLoadTokenRef.current = loadToken;
    const cachedTreeData = getCachedTreeData(treeCacheKey);
    if (!options.force && cachedTreeData) {
      setPessoas(cachedTreeData.pessoas);
      setRelacionamentos(cachedTreeData.relacionamentos);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      const [pessoasResult, relacionamentosResult] = await Promise.allSettled([
        obterTodasPessoas(),
        obterTodosRelacionamentos(),
      ]);

      const pessoasData = pessoasResult.status === 'fulfilled' && Array.isArray(pessoasResult.value)
        ? pessoasResult.value
        : [];
      const relacionamentosData = relacionamentosResult.status === 'fulfilled' && Array.isArray(relacionamentosResult.value)
        ? relacionamentosResult.value
        : [];

      if (treeDataLoadTokenRef.current !== loadToken) return;

      const errors = [
        pessoasResult.status === 'rejected' ? pessoasResult.reason : null,
        relacionamentosResult.status === 'rejected' ? relacionamentosResult.reason : null,
      ].filter(Boolean);

      if (errors.length > 0) {
        const message = errors
          .map((error) => error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados.')
          .join('\n');
        setLoadError(message);
        return;
      }

      if (pessoasData.length === 0) {
        setLoadError('Tabela sem dados: pessoas não retornou registros.');
        return;
      }

      const nextPessoas = Array.isArray(pessoasData) ? pessoasData : [];
      const nextRelacionamentos = Array.isArray(relacionamentosData) ? relacionamentosData : [];

      setCachedTreeData({
        pessoas: nextPessoas,
        relacionamentos: nextRelacionamentos,
      }, treeCacheKey);

      setPessoas(nextPessoas);
      setRelacionamentos(nextRelacionamentos);

      if (relacionamentosData.length === 0) {
        console.warn('[Supabase] Tabela sem dados: relacionamentos não retornou registros.');
      }
    } catch (error) {
      if (treeDataLoadTokenRef.current !== loadToken) return;
      const message = error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados.';
      console.error('Erro ao carregar dados da árvore:', error);
      setLoadError(message);
      setPessoas([]);
      setRelacionamentos([]);
    } finally {
      if (treeDataLoadTokenRef.current === loadToken) {
        setIsLoading(false);
      }
    }
  }, [treeCacheKey]);

  useEffect(() => {
    let active = true;

    const runLoad = (options?: { force?: boolean }) => {
      if (!active) return;
      void loadTreeData(options);
    };

    runLoad();
    const unsubscribe = subscribeTreeDataChanged(() => runLoad({ force: true }));

    return () => {
      active = false;
      treeDataLoadTokenRef.current += 1;
      unsubscribe();
    };
  }, [loadTreeData]);

  useEffect(() => {
    let cancelled = false;

    const loadLinkedPerson = async () => {
      setLinkedPersonResolved(false);
      setLinkedPersonId(undefined);
      setTreeFocusPersonId(undefined);

      if (!user) {
        if (!cancelled) {
          setLinkedPersonResolved(true);
        }
        return;
      }

      try {
        const { data } = await getPrimaryLinkedPerson(user.id);
        if (cancelled) return;

        setLinkedPersonId(data?.pessoa_id);
        if (data?.pessoa_id && !queryPersonId) {
          setSelectedPersonId(data.pessoa_id);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Erro ao carregar vínculo do membro:', error);
        setLinkedPersonId(undefined);
      } finally {
        if (!cancelled) {
          setLinkedPersonResolved(true);
        }
      }
    };

    loadLinkedPerson();

    return () => {
      cancelled = true;
    };
  }, [queryPersonId, user?.id]);

  useEffect(() => {
    if (!linkedPersonResolved || !queryPersonId || pessoas.length === 0) return;

    const queryPersonExists = pessoas.some((pessoa) => pessoa.id === queryPersonId);

    if (!queryPersonExists) {
      const fallbackPersonId = linkedPersonId || pessoas[0]?.id;
      setTreeFocusPersonId(fallbackPersonId);
      setSelectedPersonId(fallbackPersonId);
      navigate(buildTreePathForPerson(fallbackPersonId), { replace: true });
      return;
    }

    setTreeFocusPersonId(queryPersonId);
    setSelectedPersonId(queryPersonId);
  }, [buildTreePathForPerson, linkedPersonId, linkedPersonResolved, navigate, pessoas, queryPersonId]);

  useEffect(() => {
    if (selectedCuriosityPersonId || pessoas.length === 0) return;

    const defaultPersonId = linkedPersonId || selectedPersonId || pessoas[0]?.id;
    if (defaultPersonId) {
      setSelectedCuriosityPersonId(defaultPersonId);
    }
  }, [linkedPersonId, pessoas, selectedCuriosityPersonId, selectedPersonId]);

  useEffect(() => {
    if (connectionPersonOneId || pessoas.length === 0) return;

    const defaultPersonId = linkedPersonId || selectedPersonId || pessoas[0]?.id;
    if (defaultPersonId) {
      setConnectionPersonOneId(defaultPersonId);
    }
  }, [connectionPersonOneId, linkedPersonId, pessoas, selectedPersonId]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        const { data, error } = await getMemberProfile(user.id);
        if (error) {
          console.error('Erro ao carregar perfil do usuário:', error);
        }
        setProfile(data);
      } catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
        setProfile(null);
      }
    };

    loadProfile();
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(false);

      try {
        const { isAdmin: nextIsAdmin, error } = await isAdminUser(user);
        if (error) {
          console.error('Erro ao verificar permissão administrativa:', error);
        }
        if (!cancelled) {
          setIsAdmin(nextIsAdmin);
        }
      } catch (error) {
        console.error('Erro ao verificar permissão administrativa:', error);
        if (!cancelled) {
          setIsAdmin(false);
        }
      }
    };

    loadAdminStatus();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setPessoasFiltradas([]);
        return;
      }

      try {
        const resultados = await buscarPessoas(searchTerm);
        setPessoasFiltradas(Array.isArray(resultados) ? resultados : []);
      } catch (error) {
        console.error('Erro ao buscar pessoas:', error);
        setPessoasFiltradas([]);
      }
    };

    const timeoutId = window.setTimeout(() => {
      performSearch();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (!searchExpanded) return;

    const focusTimer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 160);

    return () => window.clearTimeout(focusTimer);
  }, [searchExpanded]);

  const navigateToPersonProfile = useCallback(
    (personId: string) => {
      const returnPath = buildCurrentTreeReturnPath();
      const path = `/pessoa/${personId}?voltar=${encodeURIComponent(returnPath)}`;
      navigate(path, { replace: false, flushSync: true });
    },
    [buildCurrentTreeReturnPath, navigate]
  );

  const navigateFromHome = useCallback(
    (path: string) => {
      navigate(path, { replace: false, flushSync: true });
    },
    [navigate]
  );

  const handleTreeViewModeChange = useCallback(
    (viewMode: TreeViewMode) => {
      const nextPath = getPathForTreeViewMode(viewMode);
      if (location.pathname === nextPath) return;

      navigate(`${nextPath}${location.search}`, { replace: false, flushSync: true });
    },
    [location.pathname, location.search, navigate]
  );

  const handlePersonClick = useCallback(
    (pessoa: Pessoa) => {
      flushSync(() => {
        setSelectedPersonId(pessoa.id);
      });

      navigateToPersonProfile(pessoa.id);
    },
    [navigateToPersonProfile]
  );

  const handleSearchSelect = useCallback(
    (pessoa: Pessoa) => {
      setSelectedPersonId(pessoa.id);
      setSearchTerm('');
      setPessoasFiltradas([]);
      setSearchExpanded(false);

      if (!isMobile) {
        navigateToPersonProfile(pessoa.id);
      }
    },
    [navigateToPersonProfile, isMobile]
  );

  const handlePersonView = useCallback(
    (pessoa: Pessoa) => {
      flushSync(() => {
        setSelectedPersonId(pessoa.id);
      });
      navigateToPersonProfile(pessoa.id);
    },
    [navigateToPersonProfile]
  );

  const handlePersonEdit = useCallback((pessoa: Pessoa) => {
    setSelectedPersonId(pessoa.id);
    console.info('Editar pessoa:', pessoa);
  }, []);

  const handlePersonAddConnection = useCallback((pessoa: Pessoa) => {
    setConnectionTarget(pessoa);
  }, []);

  const handlePersonRemove = useCallback((pessoa: Pessoa) => {
    setSelectedPersonId(pessoa.id);
    console.info('Remover pessoa:', pessoa);
  }, []);

  const handleMarriageClick = useCallback((details: MarriageNodeDetails) => {
    setSelectedMarriage(details);
  }, []);

  const handleAddConnectionSubmit = useCallback((payload: AddConnectionPayload) => {
    console.info('Salvar conexão:', payload);
    setConnectionTarget(null);
  }, []);

  const toggleFilter = useCallback((filterKey: keyof typeof edgeFilters) => {
    setEdgeFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  }, []);

  const toggleParentChildFilters = useCallback(() => {
    setEdgeFilters((prev) => {
      const shouldEnable = !(prev.filiacao_sangue || prev.filiacao_adotiva);

      return {
        ...prev,
        filiacao_sangue: shouldEnable,
        filiacao_adotiva: shouldEnable,
      };
    });
  }, []);

  const toggleAllEdgeFilters = useCallback(() => {
    setEdgeFilters((prev) => {
      const allActive = prev.conjugal && prev.filiacao_sangue && prev.filiacao_adotiva && prev.irmaos;
      const nextValue = !allActive;

      return {
        conjugal: nextValue,
        filiacao_sangue: nextValue,
        filiacao_adotiva: nextValue,
        irmaos: nextValue,
      };
    });
  }, []);

  const toggleVisualLineFilter = useCallback((filterKey: VisualLineFilterKey) => {
    setVisualLineFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  }, []);

  const toggleAllVisualLineFilters = useCallback(() => {
    setVisualLineFilters((prev) => {
      const allActive = prev.spouseHighlight && prev.parentChildHighlight && prev.siblingHighlight;
      const nextValue = !allActive;

      return {
        spouseHighlight: nextValue,
        parentChildHighlight: nextValue,
        siblingHighlight: nextValue,
      };
    });
  }, []);

  const togglePersonFilter = useCallback((filterKey: keyof typeof personFilters) => {
    setPersonFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  }, []);

  const toggleDirectRelativeFilter = useCallback((filterKey: DirectRelativeGroup) => {
    setDirectRelativeFilterState((prev) => ({
      userId: user?.id,
      filters: {
        ...prev.filters,
        [filterKey]: !prev.filters[filterKey],
      },
    }));
  }, [user?.id]);

  const toggleGenealogyFilter = useCallback((filterKey: GenealogyFilterKey) => {
    setGenealogyFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  }, []);

  const centralReferencePersonId = linkedPersonResolved
    ? treeFocusPersonId || linkedPersonId || selectedPersonId || pessoas[0]?.id
    : undefined;
  const centralReferencePerson = useMemo(
    () => pessoas.find((pessoa) => pessoa.id === centralReferencePersonId),
    [centralReferencePersonId, pessoas]
  );

  const handleDirectRelationRenderedCounts = useCallback((counts: DirectRelationCounts) => {
    setRenderedDirectRelationCounts((prev) => {
      if (prev && JSON.stringify(prev) === JSON.stringify(counts)) return prev;
      return counts;
    });
  }, []);

  useEffect(() => {
    setRenderedDirectRelationCounts(null);
  }, [centralReferencePersonId, treeViewMode]);

  const handleOpenPersonTree = useCallback((personId: string) => {
    setTreeFocusPersonId(personId);
    setSelectedPersonId(personId);
    setAiDialogOpen(false);
    if (isMobile) {
      setSidebarOpen(false);
      setLegendOpen(false);
    }
    navigate(buildTreePathForPerson(personId), { replace: false });

    window.setTimeout(() => {
      setTreeLayoutRevision((revision) => revision + 1);
      window.dispatchEvent(new Event('resize'));
    }, 80);
  }, [buildTreePathForPerson, isMobile, navigate]);

  const pessoasVisiveisPorStatus = useMemo(() => {
    return pessoas.filter((pessoa) =>
      isVisibleByLifeStatusFilter(pessoa, personFilters, centralReferencePersonId)
    );
  }, [centralReferencePersonId, pessoas, personFilters]);

  const visiblePersonIdsByLifeStatus = useMemo(() => {
    return new Set(pessoasVisiveisPorStatus.map((pessoa) => pessoa.id));
  }, [pessoasVisiveisPorStatus]);

  const directRelativeFilters = useMemo(
    () => {
      if (isMobile && treeViewMode === 'minha-arvore') {
        return DEFAULT_DIRECT_RELATIVE_FILTERS;
      }

      return directRelativeFilterState.filters;
    },
    [directRelativeFilterState.filters, isMobile, treeViewMode]
  );

  const lifeStatusScopePeople = useMemo(() => {
    if (!centralReferencePersonId || pessoas.length === 0) return [];

    if (
      treeViewMode !== 'minha-arvore' &&
      treeViewMode !== 'mapa-familiar' &&
      treeViewMode !== 'visao-completa'
    ) {
      return pessoas;
    }

    const graph = buildTreeGraph({
      pessoas,
      relacionamentos,
      selectedPersonId,
      edgeFilters,
    });

    const scopeIds = collectDirectFamilyScopePersonIds(graph, {
      centralPersonId: centralReferencePersonId,
      filters: directRelativeFilters,
    });

    if (scopeIds.size === 0) return [];

    return pessoas.filter((pessoa) => scopeIds.has(pessoa.id));
  }, [
    centralReferencePersonId,
    directRelativeFilters,
    edgeFilters,
    pessoas,
    relacionamentos,
    selectedPersonId,
    treeViewMode,
  ]);

  const lifeStatusCounts = useMemo(() => {
    return {
      vivos: lifeStatusScopePeople.filter(
        (pessoa) => isHumanFamilyMember(pessoa) && !isPersonDeceased(pessoa)
      ).length,
      falecidos: lifeStatusScopePeople.filter(
        (pessoa) => isHumanFamilyMember(pessoa) && isPersonDeceased(pessoa)
      ).length,
      pets: lifeStatusScopePeople.filter(isPetFamilyMember).length,
    };
  }, [lifeStatusScopePeople]);

  const stats = useMemo(() => {
    const pessoasVivas = pessoas.filter((p) => isHumanFamilyMember(p) && !isPersonDeceased(p));
    const pessoasFalecidas = pessoas.filter((p) => isHumanFamilyMember(p) && isPersonDeceased(p));
    const pets = pessoas.filter((p) => isPetFamilyMember(p));

    const pessoasComConjuge = new Set<string>();
    relacionamentos
      .filter((r) => r.tipo_relacionamento === 'conjuge')
      .forEach((r) => {
        if (r.pessoa_origem_id) pessoasComConjuge.add(r.pessoa_origem_id);
        if (r.pessoa_destino_id) pessoasComConjuge.add(r.pessoa_destino_id);
      });

    const cidadesNascimento = new Map<string, number>();
    pessoas.forEach((p) => {
      if (p.local_nascimento && isHumanFamilyMember(p)) {
        const count = cidadesNascimento.get(p.local_nascimento) || 0;
        cidadesNascimento.set(p.local_nascimento, count + 1);
      }
    });

    const cidadesAtuais = new Set<string>();
    pessoasVivas.forEach((p) => {
      if (p.local_atual) {
        cidadesAtuais.add(p.local_atual);
      }
    });

    const topCidadesNascimento = Array.from(cidadesNascimento.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalPessoas: pessoas.length,
      pessoasVivas: pessoasVivas.length,
      pessoasFalecidas: pessoasFalecidas.length,
      pets: pets.length,
      casados: pessoasComConjuge.size,
      cidadesNascimento: topCidadesNascimento,
      cidadesAtuais: cidadesAtuais.size,
    };
  }, [pessoas, relacionamentos]);

  const curiosities = useMemo(() => calculateCuriosities(pessoas, relacionamentos), [pessoas, relacionamentos]);

  const linkedPerson = useMemo(
    () => pessoas.find((pessoa) => pessoa.id === linkedPersonId),
    [pessoas, linkedPersonId]
  );
  const fullDisplayName = (
    linkedPerson?.nome_completo ||
    profile?.nome_exibicao ||
    (user?.user_metadata?.nome_exibicao as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    ''
  ).trim();
  const directRelationCounts = useMemo(
    () =>
      calculateDirectRelationCounts(
        pessoas,
        relacionamentos,
        centralReferencePersonId,
        visiblePersonIdsByLifeStatus
      ),
    [pessoas, relacionamentos, centralReferencePersonId, visiblePersonIdsByLifeStatus]
  );
  const effectiveDirectRelationCounts = useMemo(
    () => (
      renderedDirectRelationCounts && (
        treeViewMode === 'mapa-familiar' || treeViewMode === 'mapa-familiar-horizontal'
      )
        ? {
            ...directRelationCounts,
            conjuge: renderedDirectRelationCounts.conjuge,
          }
        : directRelationCounts
    ),
    [directRelationCounts, renderedDirectRelationCounts, treeViewMode]
  );
  const genealogyFilterCounts = useMemo(
    () => calculateGenealogyFilterCounts(pessoasVisiveisPorStatus, relacionamentos),
    [pessoasVisiveisPorStatus, relacionamentos]
  );
  const sidebarPanelContent = (
    <section className="h-full min-h-0 min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-[clamp(0.45rem,1.05vh,0.625rem)]">
      {activeSidebarPanel === 'filters' && (
        <div className="flex h-full min-h-0 min-w-0 flex-col gap-3">
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto pr-0.5">
            {treeViewMode === 'genealogia' ? (
              <GenealogyFilterGrid
                filters={genealogyFilters}
                counts={genealogyFilterCounts}
                onToggle={toggleGenealogyFilter}
              />
            ) : (
              <DirectRelationKpiGrid
                filters={directRelativeFilters}
                counts={effectiveDirectRelationCounts}
                onToggle={toggleDirectRelativeFilter}
              />
            )}
          </div>

          <LifeStatusKpiGrid
            vivos={lifeStatusCounts.vivos}
            falecidos={lifeStatusCounts.falecidos}
            filters={personFilters}
            onToggle={togglePersonFilter}
            directRelativeFilters={directRelativeFilters}
            directRelationCounts={effectiveDirectRelationCounts}
            onToggleDirectRelative={toggleDirectRelativeFilter}
          />
        </div>
      )}

      {activeSidebarPanel === 'legend' && (
        <div className="h-full min-h-0 overflow-y-auto pr-0.5">
          <TreeLegend
            viewMode={treeViewMode}
            compact
            showTitle
            personFilters={personFilters}
            edgeFilters={edgeFilters}
            directRelativeFilters={treeViewMode === 'minha-arvore' || treeViewMode === 'mapa-familiar' ? directRelativeFilters : undefined}
            onTogglePersonFilter={togglePersonFilter}
            onToggleEdgeFilter={toggleFilter}
            onToggleAllEdgeFilters={toggleAllEdgeFilters}
            onToggleParentChildFilter={toggleParentChildFilters}
            onToggleDirectRelativeFilter={treeViewMode === 'minha-arvore' || treeViewMode === 'mapa-familiar' ? toggleDirectRelativeFilter : undefined}
            visualLineFilters={visualLineFilters}
            onToggleVisualLineFilter={toggleVisualLineFilter}
            onToggleAllVisualLineFilters={toggleAllVisualLineFilters}
          />
        </div>
      )}

      {activeSidebarPanel === 'info' && (
        <SidebarInfoPanel
          onSelectArea={() => familyTreeRef.current?.startAreaSelection()}
          onSavePdf={() => familyTreeRef.current?.savePdf()}
          onSaveImage={() => familyTreeRef.current?.saveImage()}
          onPrint={() => familyTreeRef.current?.print()}
          onWhatsApp={() => toast.info('Envio por WhatsApp será implementado em breve.')}
        />
      )}
    </section>
  );
  const selectedCuriosityPerson = useMemo(
    () => pessoas.find((pessoa) => pessoa.id === selectedCuriosityPersonId),
    [pessoas, selectedCuriosityPersonId]
  );
  const discoverAstrologyInsight = useMemo(
    () => getInsightByType(discoverInsights, 'astrology'),
    [discoverInsights]
  );
  const discoverHistoricalInsight = useMemo(
    () => getInsightByType(discoverInsights, 'historical_events'),
    [discoverInsights]
  );
  const canAskAi = Boolean(!aiAnswer && (aiQuestion.trim() || (selectedCuriosityPerson && selectedCuriosityTopics.length > 0)));
  const toggleCuriosityTopic = useCallback((topic: CuriosityTopic) => {
    setSelectedCuriosityTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic]
    );
    setDiscoverSubmitted(false);
    setDiscoverResultsEmpty();
  }, []);

  function setDiscoverResultsEmpty() {
    setDiscoverError(null);
    setDiscoverInsights([]);
  }

  function handleBackToDiscoverForm() {
    setDiscoverSubmitted(false);
    setDiscoverError(null);
  }

  const handleAdvanceCuriosityPrompt = useCallback(async () => {
    if (!selectedCuriosityPerson || selectedCuriosityTopics.length === 0) return;

    setDiscoverLoading(true);
    setDiscoverError(null);
    setDiscoverInsights([]);
    setDiscoverSubmitted(true);

    try {
      const insightsResult = selectedCuriosityTopics.some((topic) =>
        topic === 'Fatos Históricos do Dia de Nascimento' || topic === 'O que diz a Astrologia'
      )
        ? await obterInsightsGeradosPessoa(selectedCuriosityPerson.id)
        : [];
      setDiscoverInsights(insightsResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível carregar as informações selecionadas.';
      setDiscoverError(message);
    } finally {
      setDiscoverLoading(false);
    }
  }, [selectedCuriosityPerson, selectedCuriosityTopics]);

  const handleAskAi = useCallback(async () => {
    const manualQuestion = aiQuestion.trim();
    if ((!manualQuestion && (!selectedCuriosityPerson || selectedCuriosityTopics.length === 0)) || aiLoading) return;

    const curiosityInstruction = selectedCuriosityPerson && selectedCuriosityTopics.length > 0
      ? [
          `Pessoa selecionada: ${selectedCuriosityPerson.nome_completo}.`,
          `Tópicos desejados: ${selectedCuriosityTopics.join(', ')}.`,
        ].join('\n')
      : '';
    const question = manualQuestion || 'Fale sobre a pessoa selecionada considerando os tópicos marcados.';
    const message = [question, curiosityInstruction].filter(Boolean).join('\n\n');

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: buildAiTreeContext({
            pessoas,
            relacionamentos,
            stats,
            curiosities,
            centralPersonId: centralReferencePersonId,
            centralPersonName: centralReferencePerson?.nome_completo || fullDisplayName,
            directRelationCounts,
            selectedCuriosityPerson,
            selectedCuriosityTopics,
          }),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || 'Não foi possível gerar a resposta agora.');
      }

      const answer = payload?.answer || payload?.data?.answer || payload?.response;

      if (!answer || typeof answer !== 'string') {
        throw new Error('A IA não retornou uma resposta válida.');
      }

      setAiAnswer(answer || 'Não encontrei uma resposta para essa pergunta.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível gerar a resposta agora.';
      setAiError(message);
      toast.error(message);
    } finally {
      setAiLoading(false);
    }
  }, [
    aiLoading,
    aiQuestion,
    centralReferencePersonId,
    centralReferencePerson,
    curiosities,
    directRelationCounts,
    fullDisplayName,
    pessoas,
    relacionamentos,
    selectedCuriosityPerson,
    selectedCuriosityTopics,
    stats,
  ]);

  function handleNewAiQuestion() {
    setAiQuestion('');
    setAiAnswer('');
    setAiError(null);
  }

  const handleDiscoverConnection = useCallback(() => {
    if (!connectionPersonOneId || !connectionPersonTwoId || connectionLoading) return;

    if (connectionPersonOneId === connectionPersonTwoId) {
      setConnectionResult(null);
      setConnectionError('Selecione duas pessoas diferentes.');
      return;
    }

    setConnectionLoading(true);
    setConnectionError(null);
    setConnectionResult(null);

    try {
      const resultado = calculateRelationshipDegree({
        originPersonId: connectionPersonOneId,
        targetPersonId: connectionPersonTwoId,
        people: pessoas,
        relationships: relacionamentos,
        includeInactiveSpouses: connectionIncludeInactiveSpouses,
      });
      setConnectionResult(resultado);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível descobrir a conexão agora.';
      setConnectionError(message);
    } finally {
      setConnectionLoading(false);
    }
  }, [
    connectionIncludeInactiveSpouses,
    connectionLoading,
    connectionPersonOneId,
    connectionPersonTwoId,
    pessoas,
    relacionamentos,
  ]);

  const curiosityTabs = useMemo(
    () => [
      { id: 'voce-sabia' as const, label: 'Você Sabia?', icon: Lightbulb },
      { id: 'descubra' as const, label: 'Descubra mais sobre...', icon: Search },
      { id: 'pergunte-ia' as const, label: 'Pergunte à IA', icon: Bot },
      { id: 'conexao' as const, label: 'Qual a minha conexão com alguém?', icon: Network },
    ],
    []
  );
  const isSearchExpanded = searchExpanded;
  const isTreeResolving = isLoading || !linkedPersonResolved;
  const canRenderTree = !isTreeResolving && !loadError && pessoas.length > 0 && Boolean(centralReferencePersonId);
  const currentTreeViewLabel =
    treeViewMode === 'genealogia'
      ? 'Genealogia'
      : treeViewMode === 'mapa-familiar'
        ? 'Mapa Familiar'
      : treeViewMode === 'visao-completa'
        ? 'Visão Completa'
        : 'Minha Árvore';
  const headerActionTextClassName = isSearchExpanded ? 'hidden' : 'hidden xl:inline-flex';

  useEffect(() => {
    if (!isMobile || !canRenderTree) return;
    if (window.sessionStorage.getItem(MOBILE_DESKTOP_TIP_PENDING_KEY) !== 'true') return;
    if (window.sessionStorage.getItem(MOBILE_DESKTOP_TIP_SESSION_KEY) === 'true') {
      window.sessionStorage.removeItem(MOBILE_DESKTOP_TIP_PENDING_KEY);
      return;
    }

    setMobileTipOpen(true);
  }, [canRenderTree, isMobile]);

  const dismissMobileTip = () => {
    window.sessionStorage.removeItem(MOBILE_DESKTOP_TIP_PENDING_KEY);
    window.sessionStorage.setItem(MOBILE_DESKTOP_TIP_SESSION_KEY, 'true');
    setMobileTipOpen(false);
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden overscroll-none bg-gray-50">
      <HomeHeader
        currentTreeViewLabel={currentTreeViewLabel}
        treeViewMode={treeViewMode}
        onTreeViewModeChange={handleTreeViewModeChange}
        isSearchExpanded={isSearchExpanded}
        searchExpanded={searchExpanded}
        onSearchExpandedChange={setSearchExpanded}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchInputRef={searchInputRef}
        pessoasFiltradas={pessoasFiltradas}
        handleSearchSelect={handleSearchSelect}
        headerActionTextClassName={headerActionTextClassName}
        onCuriosities={() => setAiDialogOpen(true)}
        navigateFromHome={navigateFromHome}
      />

      <main className="relative flex min-h-0 flex-1 overflow-hidden overscroll-none">
        {!isMobile && (
          <aside
            className={[
              'flex h-full min-h-0 shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200',
              sidebarOpen ? 'w-80 p-[clamp(0.65rem,1.45vh,1rem)]' : 'w-14 p-2',
            ].join(' ')}
          >
            {sidebarOpen && (
              <div className="flex min-h-0 flex-1 flex-col gap-[clamp(0.45rem,1.05vh,0.75rem)]">
                <div className="relative flex items-center gap-[clamp(0.35rem,0.8vh,0.5rem)]">
                  <div className="min-w-0 flex-1">
                    <SidebarPanelTabs
                      activePanel={activeSidebarPanel}
                      onChange={setActiveSidebarPanel}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-[clamp(32px,4.5vh,36px)] shrink-0 border-gray-500 bg-gray-500 px-[clamp(0.55rem,1.2vh,0.75rem)] text-[clamp(11px,1.45vh,12px)] text-white shadow-sm hover:border-gray-600 hover:bg-gray-600 hover:text-white"
                    onClick={() => setActiveSidebarPanel('info')}
                    title="Ações da árvore"
                    aria-label="Ações da árvore"
                    aria-pressed={activeSidebarPanel === 'info'}
                  >
                    <Printer className="h-4 w-4" />
                    <span className="ml-2">Ações</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-0 top-0 h-[clamp(32px,4.5vh,36px)] w-[clamp(32px,4.5vh,36px)] shrink-0 bg-white shadow-sm"
                    onClick={() => setSidebarOpen(false)}
                    title="Recolher painel lateral"
                    aria-label="Recolher painel lateral"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">
                  {sidebarPanelContent}
                </div>
              </div>
            )}
            {!sidebarOpen && (
              <div className="flex h-full items-start justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-[clamp(32px,4.5vh,36px)] w-[clamp(32px,4.5vh,36px)] shrink-0 bg-white shadow-sm"
                  onClick={() => setSidebarOpen(true)}
                  title="Expandir painel lateral"
                  aria-label="Expandir painel lateral"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </aside>
        )}

        <HomeTreeSection
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
        />
      </main>

      {isMobile && (
        <HomeMobileNav
          legendOpen={legendOpen}
          onToggleLegend={() => setLegendOpen((open) => !open)}
          currentTreeViewLabel={currentTreeViewLabel}
          onTreeViewModeChange={handleTreeViewModeChange}
          familyTreeRef={familyTreeRef}
          onCuriosities={() => setAiDialogOpen(true)}
          navigateFromHome={navigateFromHome}
        />
      )}

      {isMobile && legendOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/15"
            onClick={() => setLegendOpen(false)}
            aria-label="Fechar painel"
          />
          <section className="tree-mobile-controls-panel fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-40 flex max-h-[min(82vh,calc(100vh-7rem))] flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
              <div className="min-w-0 flex-1">
                <SidebarPanelTabs
                  activePanel={activeSidebarPanel}
                  onChange={setActiveSidebarPanel}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 border-gray-500 bg-gray-500 text-white shadow-sm hover:border-gray-600 hover:bg-gray-600 hover:text-white"
                onClick={() => setActiveSidebarPanel('info')}
                title="Ações da árvore"
                aria-label="Ações da árvore"
                aria-pressed={activeSidebarPanel === 'info'}
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 bg-white shadow-sm"
                onClick={() => setLegendOpen(false)}
                title="Fechar painel"
                aria-label="Fechar painel"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="tree-mobile-controls-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">
              {sidebarPanelContent}
            </div>
          </section>
        </>
      )}

      <Dialog
        open={mobileTipOpen}
        onOpenChange={(open) => {
          if (!open && mobileTipOpen) {
            dismissMobileTip();
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm">
          <DialogHeader>
            <DialogTitle>Fica a dica</DialogTitle>
            <DialogDescription>
              Este site é melhor acessado pelo computador, notebook ou tablet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" className="w-full" onClick={dismissMobileTip}>
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ViewMarriageModal
        open={!!selectedMarriage}
        marriage={selectedMarriage}
        isAdmin={isAdmin}
        onClose={() => setSelectedMarriage(null)}
      />

      <AddConnectionModal
        open={!!connectionTarget}
        sourcePerson={connectionTarget}
        pessoas={pessoas}
        isAdmin={isAdmin}
        onClose={() => setConnectionTarget(null)}
        onSubmit={handleAddConnectionSubmit}
      />

      <HomeCuriositiesDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        curiosityTabs={curiosityTabs}
        activeCuriosityTab={activeCuriosityTab}
        onActiveCuriosityTabChange={setActiveCuriosityTab}
        stats={stats}
        curiosities={curiosities}
        pessoas={pessoas}
        selectedCuriosityPersonId={selectedCuriosityPersonId}
        onSelectedCuriosityPersonIdChange={setSelectedCuriosityPersonId}
        selectedCuriosityPerson={selectedCuriosityPerson}
        selectedCuriosityTopics={selectedCuriosityTopics}
        toggleCuriosityTopic={toggleCuriosityTopic}
        discoverSubmitted={discoverSubmitted}
        discoverLoading={discoverLoading}
        discoverError={discoverError}
        discoverAstrologyInsight={discoverAstrologyInsight}
        discoverHistoricalInsight={discoverHistoricalInsight}
        setDiscoverResultsEmpty={setDiscoverResultsEmpty}
        onDiscoverSubmittedChange={setDiscoverSubmitted}
        handleBackToDiscoverForm={handleBackToDiscoverForm}
        handleAdvanceCuriosityPrompt={handleAdvanceCuriosityPrompt}
        handleOpenPersonTree={handleOpenPersonTree}
        aiQuestion={aiQuestion}
        aiAnswer={aiAnswer}
        aiLoading={aiLoading}
        aiError={aiError}
        canAskAi={canAskAi}
        aiQuestionPlaceholder={AI_QUESTION_PLACEHOLDER}
        onAiQuestionChange={setAiQuestion}
        onAiErrorChange={setAiError}
        handleAskAi={handleAskAi}
        handleNewAiQuestion={handleNewAiQuestion}
        connectionPersonOneId={connectionPersonOneId}
        connectionPersonTwoId={connectionPersonTwoId}
        connectionIncludeInactiveSpouses={connectionIncludeInactiveSpouses}
        connectionLoading={connectionLoading}
        connectionError={connectionError}
        connectionResult={connectionResult}
        onConnectionPersonOneIdChange={setConnectionPersonOneId}
        onConnectionPersonTwoIdChange={setConnectionPersonTwoId}
        onConnectionIncludeInactiveSpousesChange={setConnectionIncludeInactiveSpouses}
        clearConnectionResult={() => setConnectionResult(null)}
        clearConnectionError={() => setConnectionError(null)}
        handleDiscoverConnection={handleDiscoverConnection}
      />
    </div>
  );
}

type DirectRelationCounts = Record<DirectRelativeGroup, number>;
type GenealogyFilterCounts = Record<GenealogyFilterKey, number>;

function uniqueIds(ids: Array<string | undefined | null>, centralPersonId?: string) {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id) && id !== centralPersonId)));
}

function calculateDirectRelationCounts(
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[],
  centralPersonId?: string,
  visiblePersonIds?: Set<string>
): DirectRelationCounts {
  const emptyCounts: DirectRelationCounts = {
    pais: 0,
    avos: 0,
    bisavos: 0,
    tataravos: 0,
    conjuge: 0,
    filhos: 0,
    netos: 0,
    irmaos: 0,
    sobrinhos: 0,
    tios: 0,
    primos: 0,
    pets: 0,
  };

  if (!centralPersonId || pessoas.length === 0) return emptyCounts;

  const personIds = new Set(pessoas.map((pessoa) => pessoa.id));
  const peopleById = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  if (!personIds.has(centralPersonId)) return emptyCounts;

  const countVisible = (ids: string[]) =>
    ids.filter((id) => !visiblePersonIds || visiblePersonIds.has(id)).length;

  const parentsByChild = new Map<string, Set<string>>();
  const childrenByParent = new Map<string, Set<string>>();
  const siblingsByPerson = new Map<string, Set<string>>();
  const spousesByPerson = new Map<string, Set<string>>();

  const addToSet = (map: Map<string, Set<string>>, key: string, value: string) => {
    if (!key || !value || key === value || !personIds.has(key) || !personIds.has(value)) return;
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(value);
  };

  const addParentChild = (parentId: string, childId: string) => {
    addToSet(parentsByChild, childId, parentId);
    addToSet(childrenByParent, parentId, childId);
  };

  relacionamentos.forEach((relacionamento) => {
    if (relacionamento.tipo_relacionamento === 'conjuge') {
      addToSet(spousesByPerson, relacionamento.pessoa_origem_id, relacionamento.pessoa_destino_id);
      addToSet(spousesByPerson, relacionamento.pessoa_destino_id, relacionamento.pessoa_origem_id);
      return;
    }

    if (relacionamento.tipo_relacionamento === 'irmao') {
      addToSet(siblingsByPerson, relacionamento.pessoa_origem_id, relacionamento.pessoa_destino_id);
      addToSet(siblingsByPerson, relacionamento.pessoa_destino_id, relacionamento.pessoa_origem_id);
      return;
    }

    if (relacionamento.tipo_relacionamento === 'filho') {
      addParentChild(relacionamento.pessoa_origem_id, relacionamento.pessoa_destino_id);
      return;
    }

    if (relacionamento.tipo_relacionamento === 'pai' || relacionamento.tipo_relacionamento === 'mae') {
      addParentChild(relacionamento.pessoa_destino_id, relacionamento.pessoa_origem_id);
    }
  });

  const getParents = (id: string) => Array.from(parentsByChild.get(id) || []);
  const getChildren = (id: string) => Array.from(childrenByParent.get(id) || []);
  const getSiblings = (id: string) => {
    const sharedParentSiblings = getParents(id).flatMap(getChildren);
    const explicitSiblings = Array.from(siblingsByPerson.get(id) || []);
    return uniqueIds([...sharedParentSiblings, ...explicitSiblings], id);
  };

  const parents = uniqueIds(getParents(centralPersonId), centralPersonId);
  const grandparents = uniqueIds(parents.flatMap(getParents), centralPersonId);
  const greatGrandparents = uniqueIds(grandparents.flatMap(getParents), centralPersonId);
  const greatGreatGrandparents = uniqueIds(greatGrandparents.flatMap(getParents), centralPersonId);
  const siblings = uniqueIds(getSiblings(centralPersonId), centralPersonId);
  const uncles = uniqueIds(
    parents.flatMap((parentId) => getSiblings(parentId).filter((id) => !parents.includes(id))),
    centralPersonId
  );
  const cousins = uniqueIds(uncles.flatMap(getChildren), centralPersonId);
  const nephews = uniqueIds(siblings.flatMap(getChildren), centralPersonId);
  const spouses = uniqueIds(Array.from(spousesByPerson.get(centralPersonId) || []), centralPersonId);
  const children = uniqueIds(getChildren(centralPersonId), centralPersonId);
  const humanChildren = children.filter((id) => isHumanFamilyMember(peopleById.get(id)));
  const petChildren = children.filter((id) => isPetFamilyMember(peopleById.get(id)));
  const grandchildren = uniqueIds(humanChildren.flatMap(getChildren), centralPersonId);

  return {
    pais: countVisible(parents),
    avos: countVisible(grandparents),
    bisavos: countVisible(greatGrandparents),
    tataravos: countVisible(greatGreatGrandparents),
    conjuge: countVisible(spouses),
    filhos: countVisible(humanChildren),
    netos: countVisible(grandchildren),
    irmaos: countVisible(siblings),
    sobrinhos: countVisible(nephews),
    tios: countVisible(uncles),
    primos: countVisible(cousins),
    pets: countVisible(petChildren),
  };
}

function calculateGenealogyFilterCounts(
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[]
): GenealogyFilterCounts {
  const counts: GenealogyFilterCounts = {
    generation1: 0,
    generation2: 0,
    generation3Family: 0,
    generation3Spouses: 0,
    generation4Family: 0,
    generation4Spouses: 0,
    generation5Family: 0,
    generation5Spouses: 0,
    generation6: 0,
  };

  const peopleById = new Map(pessoas.map((pessoa) => [pessoa.id, pessoa]));
  const spouseIdsByGeneration = new Map<number, Set<string>>();

  const getSortableBirthTimestamp = (pessoa: Pessoa) => {
    if (!pessoa.data_nascimento) return Number.POSITIVE_INFINITY;
    const timestamp = new Date(pessoa.data_nascimento).getTime();
    return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY;
  };

  const comparePeopleForGenealogyOrder = (pessoaA: Pessoa, pessoaB: Pessoa) => {
    const birthA = getSortableBirthTimestamp(pessoaA);
    const birthB = getSortableBirthTimestamp(pessoaB);

    if (birthA !== birthB) return birthA - birthB;
    return (pessoaA.nome_completo || '').localeCompare(pessoaB.nome_completo || '');
  };

  const markSpouseInGeneration = (generation: number, personId: string) => {
    if (!spouseIdsByGeneration.has(generation)) spouseIdsByGeneration.set(generation, new Set());
    spouseIdsByGeneration.get(generation)!.add(personId);
  };

  relacionamentos.forEach((relacionamento) => {
    if (relacionamento.tipo_relacionamento !== 'conjuge') return;

    const origin = peopleById.get(relacionamento.pessoa_origem_id);
    const destination = peopleById.get(relacionamento.pessoa_destino_id);
    if (!origin || !destination) return;
    if (origin.manual_generation !== destination.manual_generation) return;

    const generation = origin.manual_generation;
    if (generation !== 3 && generation !== 4 && generation !== 5) return;

    const orderedPair = [origin, destination].sort(comparePeopleForGenealogyOrder);
    markSpouseInGeneration(generation, orderedPair[1].id);
  });

  pessoas.forEach((pessoa) => {
    switch (pessoa.manual_generation) {
      case 1:
        counts.generation1 += 1;
        break;
      case 2:
        counts.generation2 += 1;
        break;
      case 3:
        if (spouseIdsByGeneration.get(3)?.has(pessoa.id)) {
          counts.generation3Spouses += 1;
        } else {
          counts.generation3Family += 1;
        }
        break;
      case 4:
        if (spouseIdsByGeneration.get(4)?.has(pessoa.id)) {
          counts.generation4Spouses += 1;
        } else {
          counts.generation4Family += 1;
        }
        break;
      case 5:
        if (spouseIdsByGeneration.get(5)?.has(pessoa.id)) {
          counts.generation5Spouses += 1;
        } else {
          counts.generation5Family += 1;
        }
        break;
      case 6:
        counts.generation6 += 1;
        break;
      default:
        break;
    }
  });

  return counts;
}

function StateMessage({
  title,
  message,
  tone = 'neutral',
}: {
  title: string;
  message: string;
  tone?: 'neutral' | 'error';
}) {
  return (
    <div className="flex h-full min-h-[500px] items-center justify-center p-6">
      <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <div
          className={[
            'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full',
            tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700',
          ].join(' ')}
        >
          <Monitor className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}
