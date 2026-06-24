import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Cross,
  Eye,
  FileDown,
  Heart,
  HeartHandshake,
  Home,
  ImageDown,
  Layers,
  Map,
  MessageCircle,
  Network,
  Printer,
  Scan,
  Star,
  UserRound,
  UsersRound,
} from 'lucide-react';
import {
  MobileFamilyMapToolbar,
  type MobileFamilyMapToolbarAction,
} from '../../components/FamilyTree/MobileFamilyMapToolbar';
import {
  TREE_COLOR_PALETTE_CSS_VARIABLES,
  TREE_COLOR_PALETTE_STORAGE_KEY,
  TREE_COLOR_PALETTES,
  isTreeColorPalette,
  type TreeColorPalette,
} from '../../components/FamilyTree/treeColorPalettes';
import { useAuth } from '../../contexts/AuthContext';
import { obterTodasPessoas, obterTodosRelacionamentos } from '../../services/dataService';
import { getPrimaryLinkedPersonWithPessoa } from '../../services/memberProfileService';
import { contarNotificacoesNaoLidasSupabase } from '../../services/userEngagementService';
import type { Pessoa, Relacionamento } from '../../types';
import { isPersonDeceased } from '../../utils/personFields';
import { isHumanFamilyMember } from '../../utils/personEntity';
import { dispatchTreeAction, type SidebarTreeAction } from './SidebarPanelTabs';

interface HomeMobileNavProps {
  legendOpen: boolean;
  onToggleLegend: () => void;
  navigateFromHome: (path: string) => void;
}

type ViewAsPersonOption = { id: string; label: string };
type MobileFamilyGroupPersonOption = { id: string; label: string };
type MobileFamilyGroupTab = 'nucleo' | 'ascendentes' | 'colaterais';
type MobileFamilyGroupCountKey =
  | 'pais'
  | 'conjuges'
  | 'irmaos'
  | 'filhos'
  | 'avos'
  | 'bisavos'
  | 'tataravos'
  | 'tios'
  | 'primos'
  | 'sobrinhos';

function getCurrentPathname() {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

function getCurrentSearchParams() {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function getFirstName(value?: string | null) {
  const source = String(value ?? '').trim();
  if (!source) return '';

  const beforeEmail = source.includes('@') ? source.split('@')[0] : source;
  return beforeEmail.split(/\s+/)[0] || '';
}

const MOBILE_SPOUSE_FILTER_STORAGE_KEY = 'arvorefamilia:mobile-family-map:show-extended-spouses';

function getShortPersonName(pessoa: Pessoa) {
  const source = String(pessoa.nome_completo || pessoa.id || '').trim();
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length <= 2) return parts.join(' ') || pessoa.id;

  const compactName = [parts[0], parts[1], parts[parts.length - 1]]
    .filter(Boolean)
    .join(' ');

  return compactName || pessoa.id;
}

function readStoredExtendedSpouseFilterState() {
  if (typeof window === 'undefined') return true;

  try {
    const stored = window.localStorage.getItem(MOBILE_SPOUSE_FILTER_STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

function getExtendedSpouseFilterLabel(active: boolean) {
  return active
    ? 'Ocultar cônjuges de tios, primos etc'
    : 'Exibir cônjuges de tios, primos etc';
}

function getViewAsOptionLabel(option: ViewAsPersonOption, currentValue: string) {
  return option.id === currentValue ? formatFamilyViewLabel(option.label) : option.label;
}

function buildViewAsPersonOptions(pessoas: Pessoa[]): ViewAsPersonOption[] {
  return [...pessoas]
    .filter((pessoa) => Boolean(pessoa.id))
    .map((pessoa) => ({
      id: pessoa.id,
      label: getShortPersonName(pessoa),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
}

function formatFamilyViewLabel(value: string) {
  const clean = value.trim();
  if (!clean) return 'Família principal';
  if (clean.toLocaleLowerCase('pt-BR').startsWith('família de ')) return clean;
  return `Família de ${clean}`;
}

function uniqueCount(values: Array<string | undefined | null>) {
  return new Set(values.filter(Boolean) as string[]).size;
}

function getMobileFamilyGroupCounts(
  centralPersonId: string | undefined,
  relacionamentos: Relacionamento[]
): Record<MobileFamilyGroupCountKey, number> {
  const activeRelationships = relacionamentos.filter((relationship) => relationship.ativo !== false);

  if (!centralPersonId) {
    return {
      pais: uniqueCount(
        activeRelationships
          .filter((relationship) => relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae')
          .map((relationship) => relationship.pessoa_origem_id)
      ),
      conjuges: uniqueCount(
        activeRelationships
          .filter((relationship) => relationship.tipo_relacionamento === 'conjuge')
          .flatMap((relationship) => [relationship.pessoa_origem_id, relationship.pessoa_destino_id])
      ),
      irmaos: uniqueCount(
        activeRelationships
          .filter((relationship) => relationship.tipo_relacionamento === 'irmao')
          .flatMap((relationship) => [relationship.pessoa_origem_id, relationship.pessoa_destino_id])
      ),
      filhos: uniqueCount(
        activeRelationships
          .filter((relationship) => relationship.tipo_relacionamento === 'filho')
          .map((relationship) => relationship.pessoa_destino_id)
      ),
      avos: 0,
      bisavos: 0,
      tataravos: 0,
      tios: 0,
      primos: 0,
      sobrinhos: 0,
    };
  }

  const parentIds = new Set(
    activeRelationships
      .filter(
        (relationship) =>
          relationship.pessoa_destino_id === centralPersonId &&
          (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae')
      )
      .map((relationship) => relationship.pessoa_origem_id)
      .filter(Boolean)
  );

  const childIds = new Set(
    activeRelationships
      .filter(
        (relationship) =>
          relationship.pessoa_origem_id === centralPersonId &&
          (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae' || relationship.tipo_relacionamento === 'filho')
      )
      .map((relationship) => relationship.pessoa_destino_id)
      .filter(Boolean)
  );

  const siblingIds = new Set(
    activeRelationships
      .filter(
        (relationship) =>
          relationship.tipo_relacionamento === 'irmao' &&
          (relationship.pessoa_origem_id === centralPersonId || relationship.pessoa_destino_id === centralPersonId)
      )
      .map((relationship) =>
        relationship.pessoa_origem_id === centralPersonId
          ? relationship.pessoa_destino_id
          : relationship.pessoa_origem_id
      )
      .filter(Boolean)
  );

  const spouseIds = new Set(
    activeRelationships
      .filter(
        (relationship) =>
          relationship.tipo_relacionamento === 'conjuge' &&
          (relationship.pessoa_origem_id === centralPersonId || relationship.pessoa_destino_id === centralPersonId)
      )
      .map((relationship) =>
        relationship.pessoa_origem_id === centralPersonId
          ? relationship.pessoa_destino_id
          : relationship.pessoa_origem_id
      )
      .filter(Boolean)
  );

  const grandparentIds = new Set<string>();
  parentIds.forEach((parentId) => {
    activeRelationships
      .filter(
        (relationship) =>
          relationship.pessoa_destino_id === parentId &&
          (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae')
      )
      .forEach((relationship) => grandparentIds.add(relationship.pessoa_origem_id));
  });

  const uncleAuntIds = new Set<string>();
  parentIds.forEach((parentId) => {
    activeRelationships
      .filter(
        (relationship) =>
          relationship.tipo_relacionamento === 'irmao' &&
          (relationship.pessoa_origem_id === parentId || relationship.pessoa_destino_id === parentId)
      )
      .forEach((relationship) => {
        uncleAuntIds.add(
          relationship.pessoa_origem_id === parentId
            ? relationship.pessoa_destino_id
            : relationship.pessoa_origem_id
        );
      });
  });

  return {
    pais: parentIds.size,
    conjuges: spouseIds.size,
    irmaos: siblingIds.size,
    filhos: childIds.size,
    avos: grandparentIds.size,
    bisavos: 0,
    tataravos: 0,
    tios: uncleAuntIds.size,
    primos: 0,
    sobrinhos: 0,
  };
}


function getMobileFamilyGroupPeople(
  centralPersonId: string | undefined,
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[]
): Record<MobileFamilyGroupCountKey, MobileFamilyGroupPersonOption[]> {
  const activeRelationships = relacionamentos.filter((relationship) => relationship.ativo !== false);
  const pessoasById = new globalThis.Map(pessoas.filter((pessoa) => Boolean(pessoa.id)).map((pessoa) => [pessoa.id, pessoa]));
  const emptyGroups: Record<MobileFamilyGroupCountKey, Set<string>> = {
    pais: new Set<string>(),
    conjuges: new Set<string>(),
    irmaos: new Set<string>(),
    filhos: new Set<string>(),
    avos: new Set<string>(),
    bisavos: new Set<string>(),
    tataravos: new Set<string>(),
    tios: new Set<string>(),
    primos: new Set<string>(),
    sobrinhos: new Set<string>(),
  };

  const addId = (set: Set<string>, value: string | undefined | null) => {
    if (value) set.add(value);
  };

  const toOptions = (ids: Set<string>) =>
    Array.from(ids)
      .map((id) => {
        const pessoa = pessoasById.get(id);
        return {
          id,
          label: pessoa ? getShortPersonName(pessoa) : id,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));

  if (!centralPersonId) {
    activeRelationships.forEach((relationship) => {
      if (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae') {
        addId(emptyGroups.pais, relationship.pessoa_origem_id);
        addId(emptyGroups.filhos, relationship.pessoa_destino_id);
      }

      if (relationship.tipo_relacionamento === 'conjuge') {
        addId(emptyGroups.conjuges, relationship.pessoa_origem_id);
        addId(emptyGroups.conjuges, relationship.pessoa_destino_id);
      }

      if (relationship.tipo_relacionamento === 'irmao') {
        addId(emptyGroups.irmaos, relationship.pessoa_origem_id);
        addId(emptyGroups.irmaos, relationship.pessoa_destino_id);
      }

      if (relationship.tipo_relacionamento === 'filho') {
        addId(emptyGroups.filhos, relationship.pessoa_destino_id);
      }
    });

    return Object.fromEntries(
      Object.entries(emptyGroups).map(([key, ids]) => [key, toOptions(ids)])
    ) as Record<MobileFamilyGroupCountKey, MobileFamilyGroupPersonOption[]>;
  }

  const groups: Record<MobileFamilyGroupCountKey, Set<string>> = {
    pais: new Set<string>(),
    conjuges: new Set<string>(),
    irmaos: new Set<string>(),
    filhos: new Set<string>(),
    avos: new Set<string>(),
    bisavos: new Set<string>(),
    tataravos: new Set<string>(),
    tios: new Set<string>(),
    primos: new Set<string>(),
    sobrinhos: new Set<string>(),
  };

  activeRelationships.forEach((relationship) => {
    if (
      relationship.pessoa_destino_id === centralPersonId &&
      (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae')
    ) {
      addId(groups.pais, relationship.pessoa_origem_id);
    }

    if (
      relationship.pessoa_origem_id === centralPersonId &&
      (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae' || relationship.tipo_relacionamento === 'filho')
    ) {
      addId(groups.filhos, relationship.pessoa_destino_id);
    }

    if (
      relationship.tipo_relacionamento === 'irmao' &&
      (relationship.pessoa_origem_id === centralPersonId || relationship.pessoa_destino_id === centralPersonId)
    ) {
      addId(
        groups.irmaos,
        relationship.pessoa_origem_id === centralPersonId
          ? relationship.pessoa_destino_id
          : relationship.pessoa_origem_id
      );
    }

    if (
      relationship.tipo_relacionamento === 'conjuge' &&
      (relationship.pessoa_origem_id === centralPersonId || relationship.pessoa_destino_id === centralPersonId)
    ) {
      addId(
        groups.conjuges,
        relationship.pessoa_origem_id === centralPersonId
          ? relationship.pessoa_destino_id
          : relationship.pessoa_origem_id
      );
    }
  });

  groups.pais.forEach((parentId) => {
    activeRelationships.forEach((relationship) => {
      if (
        relationship.pessoa_destino_id === parentId &&
        (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae')
      ) {
        addId(groups.avos, relationship.pessoa_origem_id);
      }

      if (
        relationship.tipo_relacionamento === 'irmao' &&
        (relationship.pessoa_origem_id === parentId || relationship.pessoa_destino_id === parentId)
      ) {
        addId(
          groups.tios,
          relationship.pessoa_origem_id === parentId
            ? relationship.pessoa_destino_id
            : relationship.pessoa_origem_id
        );
      }
    });
  });

  return Object.fromEntries(
    Object.entries(groups).map(([key, ids]) => [key, toOptions(ids)])
  ) as Record<MobileFamilyGroupCountKey, MobileFamilyGroupPersonOption[]>;
}

const mobileTreeToolbarTopClass = 'top-[calc(env(safe-area-inset-top,0px)+5.05rem)]';
const mobileTreeViewPopoverTopClass = 'top-[calc(env(safe-area-inset-top,0px)+8.15rem)]';
const paletteOptions: TreeColorPalette[] = ['white', 'visual', 'orange', 'brown'];

const TREE_VIEW_OPTIONS: Array<{
  path: '/mapa-familiar' | '/mapa-familiar-horizontal';
  label: string;
  subtitle: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    path: '/mapa-familiar',
    label: 'Linha Geracional',
    subtitle: 'Visualização cronológica por gerações',
    ariaLabel: 'Alternar para Linha Geracional',
    icon: Map,
  },
  {
    path: '/mapa-familiar-horizontal',
    label: 'Árvore Familiar',
    subtitle: 'Visão de parentesco por grupos',
    ariaLabel: 'Alternar para Árvore Familiar',
    icon: Layers,
  },
];

const EXPORT_OPTIONS: Array<{
  action: SidebarTreeAction;
  label: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { action: 'select-area', label: 'Área', ariaLabel: 'Selecionar área para exportação', icon: Scan },
  { action: 'save-image', label: 'Imagem', ariaLabel: 'Exportar como imagem', icon: ImageDown },
  { action: 'save-pdf', label: 'PDF', ariaLabel: 'Exportar como PDF', icon: FileDown },
  { action: 'print', label: 'Imprimir', ariaLabel: 'Imprimir árvore', icon: Printer },
];

const FILTER_OPTIONS: Array<{
  value: boolean;
  label: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: true,
    label: 'Exibir cônjuges de tios, primos etc',
    ariaLabel: 'Exibir cônjuges de tios, primos e outros parentes',
    icon: Heart,
  },
  {
    value: false,
    label: 'Apenas meus familiares',
    ariaLabel: 'Exibir apenas meus familiares',
    icon: UsersRound,
  },
];

const MOBILE_GROUP_TABS: Array<{ key: MobileFamilyGroupTab; label: string }> = [
  { key: 'nucleo', label: 'Núcleo' },
  { key: 'ascendentes', label: 'Ascendentes' },
  { key: 'colaterais', label: 'Colaterais' },
];

const MOBILE_GROUP_ROWS: Record<MobileFamilyGroupTab, Array<{
  key: MobileFamilyGroupCountKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}>> = {
  nucleo: [
    { key: 'pais', label: 'Pais', icon: UsersRound },
    { key: 'conjuges', label: 'Cônjuges', icon: HeartHandshake },
    { key: 'irmaos', label: 'Irmãos', icon: UsersRound },
    { key: 'filhos', label: 'Filhos', icon: UserRound },
  ],
  ascendentes: [
    { key: 'avos', label: 'Avós', icon: Network },
    { key: 'bisavos', label: 'Bisavós', icon: Network },
    { key: 'tataravos', label: 'Tataravós', icon: Network },
  ],
  colaterais: [
    { key: 'tios', label: 'Tios', icon: UsersRound },
    { key: 'primos', label: 'Primos', icon: UsersRound },
    { key: 'sobrinhos', label: 'Sobrinhos', icon: UsersRound },
  ],
};

function getStoredPalette(): TreeColorPalette {
  if (typeof window === 'undefined') return 'white';

  const stored = window.localStorage.getItem(TREE_COLOR_PALETTE_STORAGE_KEY);
  return isTreeColorPalette(stored) ? stored : 'white';
}

function applyTreePalette(value: TreeColorPalette) {
  if (typeof document === 'undefined') return;

  const palette = TREE_COLOR_PALETTES[value];
  const root = document.documentElement;

  root.dataset.treeColorPalette = value;

  TREE_COLOR_PALETTE_CSS_VARIABLES.forEach((variableName) => {
    root.style.setProperty(variableName, palette.cssVariables[variableName]);
  });
}

function NotificationCountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-5 text-white ring-2 ring-white"
      aria-label={`${count} notificação${count === 1 ? '' : 'es'} não lida${count === 1 ? '' : 's'}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

function MobileSwitch({ active }: { active: boolean }) {
  return (
    <span
      className={[
        'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition',
        active ? 'bg-blue-600' : 'bg-slate-300',
      ].join(' ')}
      aria-hidden="true"
    >
      <span
        className={[
          'h-6 w-6 rounded-full bg-white shadow-sm transition-transform',
          active ? 'translate-x-6' : 'translate-x-0',
        ].join(' ')}
      />
    </span>
  );
}

export function HomeMobileNav({
  legendOpen,
  onToggleLegend,
  navigateFromHome,
}: HomeMobileNavProps) {
  const { user } = useAuth();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [activeToolbarAction, setActiveToolbarAction] = useState<MobileFamilyMapToolbarAction | null>(null);
  const [treeColorPalette, setTreeColorPalette] = useState<TreeColorPalette>(getStoredPalette);
  const [viewAsPersonOptions, setViewAsPersonOptions] = useState<ViewAsPersonOption[]>([]);
  const [mobilePeople, setMobilePeople] = useState<Pessoa[]>([]);
  const [mobileRelationships, setMobileRelationships] = useState<Relacionamento[]>([]);
  const [defaultViewAsLabel, setDefaultViewAsLabel] = useState('Família principal');
  const [showExtendedSpouseFilters, setShowExtendedSpouseFilters] = useState(readStoredExtendedSpouseFilterState);
  const [fullControlsOpen, setFullControlsOpen] = useState(false);
  const [activeGroupTab, setActiveGroupTab] = useState<MobileFamilyGroupTab>('nucleo');

  const refreshUnreadNotificationsCount = useCallback(async () => {
    if (!user) {
      setUnreadNotificationsCount(0);
      return;
    }

    try {
      const count = await contarNotificacoesNaoLidasSupabase(user.id);
      setUnreadNotificationsCount(count);
    } catch {
      setUnreadNotificationsCount(0);
    }
  }, [user]);

  useEffect(() => {
    applyTreePalette(treeColorPalette);
    window.localStorage.setItem(TREE_COLOR_PALETTE_STORAGE_KEY, treeColorPalette);
  }, [treeColorPalette]);

  useEffect(() => {
    document.documentElement.dataset.mobileFamilySpouseScope = showExtendedSpouseFilters ? 'extended' : 'direct';

    try {
      window.localStorage.setItem(MOBILE_SPOUSE_FILTER_STORAGE_KEY, String(showExtendedSpouseFilters));
    } catch {
      // noop
    }
  }, [showExtendedSpouseFilters]);

  useEffect(() => {
    const syncExtendedSpouseFilterState = () => {
      setShowExtendedSpouseFilters(document.documentElement.dataset.mobileFamilySpouseScope === 'extended');
    };

    window.addEventListener('arvorefamilia:mobile-spouse-filter-changed', syncExtendedSpouseFilterState);

    return () => {
      window.removeEventListener('arvorefamilia:mobile-spouse-filter-changed', syncExtendedSpouseFilterState);
    };
  }, []);

  useEffect(() => {
    if (!fullControlsOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullControlsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullControlsOpen]);

  useEffect(() => {
    void refreshUnreadNotificationsCount();

    window.addEventListener('arvorefamilia:notifications-updated', refreshUnreadNotificationsCount);
    window.addEventListener('focus', refreshUnreadNotificationsCount);

    return () => {
      window.removeEventListener('arvorefamilia:notifications-updated', refreshUnreadNotificationsCount);
      window.removeEventListener('focus', refreshUnreadNotificationsCount);
    };
  }, [refreshUnreadNotificationsCount]);

  const pathname = getCurrentPathname();
  const currentViewAsPersonValue = getCurrentSearchParams().get('pessoa')?.trim() || '';
  const isDirectFamilyMap = pathname === '/mapa-familiar' || pathname === '/mapa-familiar-horizontal';
  const selectedViewAsPersonOption = useMemo(
    () => viewAsPersonOptions.find((option) => option.id === currentViewAsPersonValue),
    [currentViewAsPersonValue, viewAsPersonOptions]
  );

  useEffect(() => {
    if (!isDirectFamilyMap) {
      setActiveToolbarAction(null);
      setFullControlsOpen(false);
    }
  }, [isDirectFamilyMap, pathname]);

  useEffect(() => {
    const metadataName = String(
      user?.user_metadata?.nome_exibicao ||
      user?.user_metadata?.name ||
      user?.user_metadata?.full_name ||
      user?.email ||
      ''
    );
    const fallbackLabel = formatFamilyViewLabel(getFirstName(metadataName));
    setDefaultViewAsLabel(fallbackLabel);

    if (!user?.id) return;

    let cancelled = false;

    async function loadDefaultViewerLabel() {
      try {
        const linkedPersonResult = await getPrimaryLinkedPersonWithPessoa(user.id);
        if (cancelled) return;

        const linkedPersonName = linkedPersonResult.data?.pessoa?.nome_completo;
        setDefaultViewAsLabel(formatFamilyViewLabel(getFirstName(linkedPersonName) || getFirstName(metadataName)));
      } catch {
        if (!cancelled) {
          setDefaultViewAsLabel(fallbackLabel);
        }
      }
    }

    void loadDefaultViewerLabel();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!isDirectFamilyMap) return;

    let cancelled = false;

    async function loadViewAsOptions() {
      try {
        const [pessoasResult, relacionamentosResult] = await Promise.allSettled([
          obterTodasPessoas(),
          obterTodosRelacionamentos(),
        ]);
        if (cancelled) return;

        const pessoas = pessoasResult.status === 'fulfilled' && Array.isArray(pessoasResult.value)
          ? pessoasResult.value
          : [];
        const relacionamentos = relacionamentosResult.status === 'fulfilled' && Array.isArray(relacionamentosResult.value)
          ? relacionamentosResult.value
          : [];

        setMobilePeople(pessoas);
        setMobileRelationships(relacionamentos);
        setViewAsPersonOptions(buildViewAsPersonOptions(pessoas));
      } catch (error) {
        if (!cancelled) {
          console.error('Erro ao carregar pessoas para Visualização mobile:', error);
          setMobilePeople([]);
          setMobileRelationships([]);
          setViewAsPersonOptions([]);
        }
      }
    }

    void loadViewAsOptions();

    return () => {
      cancelled = true;
    };
  }, [isDirectFamilyMap]);

  useEffect(() => {
    if (
      !legendOpen &&
      activeToolbarAction &&
      activeToolbarAction !== 'visualizacao' &&
      activeToolbarAction !== 'formato' &&
      activeToolbarAction !== 'cor' &&
      activeToolbarAction !== 'grupos' &&
      activeToolbarAction !== 'exportar'
    ) {
      setActiveToolbarAction(null);
    }
  }, [activeToolbarAction, legendOpen]);

  const mobileStats = useMemo(() => {
    const humanPeople = mobilePeople.filter(isHumanFamilyMember);
    const deceasedPeople = humanPeople.filter(isPersonDeceased);
    const alivePeople = humanPeople.filter((pessoa) => !isPersonDeceased(pessoa));

    return {
      totalPeople: humanPeople.length || mobilePeople.length,
      alivePeople: alivePeople.length,
      deceasedPeople: deceasedPeople.length,
      registeredPeople: viewAsPersonOptions.length || humanPeople.length || mobilePeople.length,
    };
  }, [mobilePeople, viewAsPersonOptions.length]);

  const mobileGroupCounts = useMemo(
    () => getMobileFamilyGroupCounts(currentViewAsPersonValue || mobilePeople[0]?.id, mobileRelationships),
    [currentViewAsPersonValue, mobilePeople, mobileRelationships]
  );

  const mobileGroupPeople = useMemo(
    () => getMobileFamilyGroupPeople(currentViewAsPersonValue || mobilePeople[0]?.id, mobilePeople, mobileRelationships),
    [currentViewAsPersonValue, mobilePeople, mobileRelationships]
  );

  const openMobileControlsPanel = useCallback((action: MobileFamilyMapToolbarAction) => {
    if (action === 'visualizacao' || action === 'formato' || action === 'cor' || action === 'grupos' || action === 'exportar') {
      setFullControlsOpen(false);
      setActiveToolbarAction((current) => (current === action ? null : action));

      if (legendOpen) onToggleLegend();
      return;
    }

    setActiveToolbarAction(action);

    if (!legendOpen) onToggleLegend();
  }, [legendOpen, onToggleLegend]);

  const openFullControlsPanel = useCallback(() => {
    setActiveToolbarAction(null);
    if (legendOpen) onToggleLegend();
    setFullControlsOpen(true);
  }, [legendOpen, onToggleLegend]);

  const handleViewAsPersonChange = useCallback((nextValue: string) => {
    const params = getCurrentSearchParams();

    if (nextValue) {
      params.set('pessoa', nextValue);
    } else {
      params.delete('pessoa');
    }

    setActiveToolbarAction(null);

    const query = params.toString();
    navigateFromHome(`${pathname}${query ? `?${query}` : ''}`);
  }, [navigateFromHome, pathname]);

  const handleViewOptionClick = useCallback((path: '/mapa-familiar' | '/mapa-familiar-horizontal') => {
    setActiveToolbarAction(null);
    setFullControlsOpen(false);

    if (pathname === path) return;

    const query = typeof window === 'undefined' ? '' : window.location.search;
    const nextPath = `${path}${query}`;

    window.setTimeout(() => {
      navigateFromHome(nextPath);
    }, 0);
  }, [navigateFromHome, pathname]);

  const handleExportOptionClick = useCallback((action: SidebarTreeAction) => {
    setActiveToolbarAction(null);
    dispatchTreeAction(action);
  }, []);

  const handleFullPanelExportClick = useCallback((action: SidebarTreeAction) => {
    setFullControlsOpen(false);
    dispatchTreeAction(action);
  }, []);

  const handleFilterOptionClick = useCallback((nextValue: boolean) => {
    setShowExtendedSpouseFilters((current) => (nextValue ? !current : false));
    setActiveToolbarAction(null);
  }, []);

  const itemClassName = 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100';
  const activeItemClassName = 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg bg-blue-50 px-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition active:bg-blue-100';

  return (
    <>
      {isDirectFamilyMap && (
        <>
          <style>
            {`
              [data-mobile-family-tree-root="true"] > nav[aria-label="Visualizações da árvore"],
              [data-family-map-horizontal-mobile-root="true"] > nav[aria-label="Gerações do Mapa Genealógico"] {
                display: none !important;
              }
            `}
          </style>
          <MobileFamilyMapToolbar
            activeAction={activeToolbarAction}
            className={`fixed inset-x-0 ${mobileTreeToolbarTopClass} z-[10000]`}
            onAction={openMobileControlsPanel}
            onAddClick={openFullControlsPanel}
          />

          {activeToolbarAction === 'visualizacao' && (
            <div
              className={`fixed inset-x-2 ${mobileTreeViewPopoverTopClass} z-[10001] md:hidden`}
              data-tree-export-ignore="true"
            >
              <label className="mx-auto block max-w-md">
                <span className="sr-only">Selecionar visualizador</span>
                <span className="relative block">
                  <select
                    value={currentViewAsPersonValue}
                    onChange={(event) => handleViewAsPersonChange(event.target.value)}
                    className="h-9 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-[11px] font-extrabold text-blue-950 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    aria-label="Selecionar visualizador da árvore"
                  >
                    <option value="">{defaultViewAsLabel}</option>
                    {currentViewAsPersonValue && !selectedViewAsPersonOption && (
                      <option value={currentViewAsPersonValue}>Visualizador selecionado</option>
                    )}
                    {viewAsPersonOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {getViewAsOptionLabel(option, currentViewAsPersonValue)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />
                </span>
              </label>
            </div>
          )}

          {activeToolbarAction === 'formato' && (
            <div
              className={`fixed inset-x-2 ${mobileTreeViewPopoverTopClass} z-[10001] md:hidden`}
              data-tree-export-ignore="true"
            >
              <div className="mx-auto grid max-w-md grid-cols-2 gap-1.5">
                {TREE_VIEW_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = pathname === option.path;

                  return (
                    <button
                      key={option.path}
                      type="button"
                      aria-pressed={active}
                      aria-label={option.ariaLabel}
                      onClick={() => handleViewOptionClick(option.path)}
                      className={[
                        'flex min-h-[72px] min-w-0 flex-col items-center justify-start gap-1 rounded-xl border bg-white px-2 py-2 text-center shadow-sm transition active:scale-[0.99]',
                        active
                          ? 'border-blue-500 bg-blue-50 text-blue-950 ring-1 ring-blue-500'
                          : 'border-slate-200 text-slate-900 hover:border-blue-200 hover:bg-blue-50/70',
                      ].join(' ')}
                    >
                      <Icon className={['h-4 w-4 shrink-0', active ? 'text-blue-700' : 'text-slate-700'].join(' ')} />
                      <span className="max-w-full text-[11px] font-extrabold leading-tight text-current">
                        {option.label}
                      </span>
                      <span className="max-w-full text-[9px] font-semibold leading-tight text-slate-700">
                        {option.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeToolbarAction === 'cor' && (
            <div
              className={`fixed inset-x-3 ${mobileTreeViewPopoverTopClass} z-[10001] md:hidden`}
              data-tree-export-ignore="true"
            >
              <div
                className="mx-auto flex max-w-sm items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur"
                aria-label="Paletas de cores da árvore"
              >
                {paletteOptions.map((paletteKey) => {
                  const palette = TREE_COLOR_PALETTES[paletteKey];
                  const active = paletteKey === treeColorPalette;

                  return (
                    <button
                      key={paletteKey}
                      type="button"
                      aria-label={palette.ariaLabel}
                      aria-pressed={active}
                      title={palette.label}
                      onClick={() => setTreeColorPalette(paletteKey)}
                      className="flex h-8 min-w-0 flex-1 items-center justify-center rounded-lg transition active:scale-95"
                    >
                      <span
                        className={[
                          'h-4 w-4 shrink-0 rounded-full border transition',
                          active ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-white' : '',
                        ].join(' ')}
                        style={{ backgroundColor: palette.swatch, borderColor: palette.swatchBorder }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeToolbarAction === 'grupos' && (
            <div
              className={`fixed inset-x-2 ${mobileTreeViewPopoverTopClass} z-[10001] md:hidden`}
              data-tree-export-ignore="true"
            >
              <div
                className="mx-auto grid max-w-md grid-cols-2 gap-1.5"
                role="dialog"
                aria-label="Filtros do mapa familiar"
              >
                {FILTER_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = option.value ? showExtendedSpouseFilters : false;
                  const disabled = !option.value;

                  return (
                    <button
                      key={String(option.value)}
                      type="button"
                      aria-label={option.ariaLabel}
                      aria-pressed={active}
                      onClick={() => {
                        if (!disabled) handleFilterOptionClick(option.value);
                      }}
                      disabled={disabled}
                      className={[
                        'flex min-h-[42px] min-w-0 items-center justify-center gap-1.5 rounded-xl border bg-white px-1.5 py-1.5 text-center shadow-sm transition active:scale-[0.99]',
                        active
                          ? 'border-blue-500 bg-blue-50 text-blue-950 ring-1 ring-blue-500'
                          : disabled
                            ? 'cursor-default border-slate-200 text-slate-400 opacity-80'
                            : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-950',
                      ].join(' ')}
                    >
                      <Icon className={['h-4 w-4 shrink-0', active ? 'text-blue-700' : 'text-slate-400'].join(' ')} />
                      <span className="min-w-0 text-[9px] font-extrabold leading-[1.05] tracking-[-0.02em]">
                        {option.value ? getExtendedSpouseFilterLabel(showExtendedSpouseFilters) : option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeToolbarAction === 'exportar' && (
            <div
              className={`fixed inset-x-2 ${mobileTreeViewPopoverTopClass} z-[10001] md:hidden`}
              data-tree-export-ignore="true"
            >
              <div
                className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-sm backdrop-blur"
                role="dialog"
                aria-label="Exportar mapa familiar"
              >
                <div className="px-1 pb-1 text-[11px] font-extrabold leading-tight text-blue-950">
                  Exportar
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {EXPORT_OPTIONS.map((option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.action}
                        type="button"
                        aria-label={option.ariaLabel}
                        onClick={() => handleExportOptionClick(option.action)}
                        className="flex h-7 min-w-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-extrabold leading-none text-blue-950 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 active:scale-[0.99]"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {fullControlsOpen && (
            <div
              className="fixed inset-0 z-[12000] md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Painel de visualização"
              data-tree-export-ignore="true"
            >
              <button
                type="button"
                className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]"
                onClick={() => setFullControlsOpen(false)}
                aria-label="Fechar painel de visualização"
              />

              <section className="absolute left-1/2 top-1/2 flex max-h-[calc(100dvh-1.25rem)] w-[min(calc(100vw-1.25rem),28rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
                <div className="mx-auto mt-3 h-1.5 w-16 shrink-0 rounded-full bg-slate-300" aria-hidden="true" />

                <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4 [-webkit-overflow-scrolling:touch]">
                  <header className="mb-4 flex items-center gap-3">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-white text-blue-600 shadow-sm" aria-hidden="true">
                      <Eye className="h-8 w-8" />
                    </span>
                    <h2 className="min-w-0 flex-1 text-[2rem] font-black leading-none tracking-[-0.045em] text-blue-950">
                      Visualização
                    </h2>
                    <button
                      type="button"
                      className="flex shrink-0 items-center gap-1.5 rounded-xl px-1.5 py-2 text-base font-bold text-blue-600 transition hover:bg-blue-50 active:scale-95"
                      onClick={() => handleFullPanelExportClick('save-image')}
                    >
                      <Printer className="h-7 w-7" />
                      <span>Salvar</span>
                    </button>
                  </header>

                  <label className="relative mb-5 block">
                    <span className="sr-only">Selecionar visualizador</span>
                    <select
                      value={currentViewAsPersonValue}
                      onChange={(event) => handleViewAsPersonChange(event.target.value)}
                      className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-11 text-base font-semibold text-blue-950 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      aria-label="Selecionar visualizador da árvore"
                    >
                      <option value="">{defaultViewAsLabel}</option>
                      {currentViewAsPersonValue && !selectedViewAsPersonOption && (
                        <option value={currentViewAsPersonValue}>Visualizador selecionado</option>
                      )}
                      {viewAsPersonOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {getViewAsOptionLabel(option, currentViewAsPersonValue)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-950" />
                  </label>

                  <div className="mb-2 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {TREE_VIEW_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const active = pathname === option.path;

                      return (
                        <button
                          key={option.path}
                          type="button"
                          aria-label={option.ariaLabel}
                          aria-pressed={active}
                          onClick={() => handleViewOptionClick(option.path)}
                          className={[
                            'flex min-h-16 min-w-0 items-center justify-center gap-2 px-2 text-center text-sm font-extrabold transition',
                            active
                              ? 'rounded-2xl border border-blue-600 bg-blue-50 text-blue-600 shadow-[0_0_0_1px_rgba(37,99,235,0.35)]'
                              : 'text-slate-500',
                          ].join(' ')}
                        >
                          <Icon className="h-6 w-6 shrink-0" />
                          <span className="min-w-0 leading-tight">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="mb-5 text-base font-medium leading-tight text-slate-500">
                    {TREE_VIEW_OPTIONS.find((option) => option.path === pathname)?.subtitle || 'Visualização da árvore familiar'}
                  </p>

                  <div className="mb-6 grid h-16 grid-cols-4 items-center rounded-2xl border border-slate-200 bg-white px-4">
                    {paletteOptions.map((paletteKey) => {
                      const palette = TREE_COLOR_PALETTES[paletteKey];
                      const active = paletteKey === treeColorPalette;

                      return (
                        <button
                          key={paletteKey}
                          type="button"
                          aria-label={palette.ariaLabel}
                          aria-pressed={active}
                          title={palette.label}
                          onClick={() => setTreeColorPalette(paletteKey)}
                          className="flex h-full items-center justify-center rounded-xl transition active:scale-95"
                        >
                          <span
                            className={[
                              'h-8 w-8 rounded-full border-2 transition',
                              active ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-white' : '',
                            ].join(' ')}
                            style={{ backgroundColor: palette.swatch, borderColor: palette.swatchBorder }}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <h3 className="mb-3 text-2xl font-black tracking-[-0.035em] text-blue-950">Resumo</h3>
                  <div className="mb-6 grid grid-cols-2 gap-x-1.5 gap-y-2.5">
                    <SummaryTile tone="blue" icon={UsersRound} value={mobileStats.totalPeople} label="Pessoas" />
                    <SummaryTile tone="green" icon={UserRound} value={mobileStats.alivePeople} label="Vivos" />
                    <SummaryTile tone="purple" icon={Cross} value={mobileStats.deceasedPeople} label="Falecidos" />
                    <SummaryTile tone="orange" icon={ClipboardList} value={mobileStats.registeredPeople} label="Cadastrados" />
                  </div>

                  <h3 className="mb-3 text-2xl font-black tracking-[-0.035em] text-blue-950">Grupos familiares</h3>
                  <div className="mb-3 grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {MOBILE_GROUP_TABS.map((tab) => {
                      const active = activeGroupTab === tab.key;

                      return (
                        <button
                          key={tab.key}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setActiveGroupTab(tab.key)}
                          className={[
                            'h-11 border-r border-slate-200 px-1 text-sm font-bold last:border-r-0',
                            active
                              ? 'rounded-2xl border border-blue-600 bg-blue-50 text-blue-600 shadow-[0_0_0_1px_rgba(37,99,235,0.35)]'
                              : 'text-slate-500',
                          ].join(' ')}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {MOBILE_GROUP_ROWS[activeGroupTab].map((row) => {
                      const Icon = row.icon;
                      const people = mobileGroupPeople[row.key];

                      return (
                        <div key={row.key} className="border-b border-slate-200 last:border-b-0">
                          <div className="grid min-h-16 w-full grid-cols-[3rem_minmax(0,1fr)_auto_1.5rem] items-center gap-2 px-3 text-left">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-blue-950" aria-hidden="true">
                              <Icon className="h-6 w-6" />
                            </span>
                            <span className="truncate text-lg font-semibold text-blue-950">{row.label}</span>
                            <strong className="text-lg font-black text-blue-950">{mobileGroupCounts[row.key]}</strong>
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                          </div>

                          {people.length > 0 && (
                            <div className="border-t border-slate-100 bg-slate-50/70 px-3 pb-3 pt-3">
                              <div className="flex w-full flex-wrap gap-2">
                                {people.map((person) => (
                                  <button
                                    key={person.id}
                                    type="button"
                                    onClick={() => {
                                      setFullControlsOpen(false);
                                      handleViewAsPersonChange(person.id);
                                    }}
                                    className="max-w-full rounded-full border border-blue-100 bg-white px-3 py-1.5 text-left text-sm font-bold leading-tight text-blue-950 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98]"
                                  >
                                    <span className="block max-w-full truncate">{person.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <button
                      type="button"
                      aria-pressed={showExtendedSpouseFilters}
                      onClick={() => setShowExtendedSpouseFilters((current) => !current)}
                      data-mobile-family-filter-panel-toggle="true"
                      className="grid min-h-16 w-full grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-200 px-4 text-left active:bg-blue-50"
                    >
                      <HeartHandshake className="h-8 w-8 text-blue-600" />
                      <span className="text-base font-semibold leading-tight text-blue-950">{getExtendedSpouseFilterLabel(showExtendedSpouseFilters)}</span>
                      <MobileSwitch active={showExtendedSpouseFilters} />
                    </button>
                    <button
                      type="button"
                      aria-pressed={false}
                      aria-disabled="true"
                      disabled
                      data-mobile-family-filter-panel-toggle="true"
                      className="grid min-h-16 w-full cursor-default grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-2 px-4 text-left text-slate-400"
                    >
                      <UsersRound className="h-8 w-8 text-blue-500" />
                      <span className="text-base font-semibold leading-tight text-blue-950">Apenas meus familiares</span>
                      <MobileSwitch active={false} />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.16)] backdrop-blur" data-tree-export-ignore="true">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1.5">
          <button
            type="button"
            className={activeItemClassName}
            onClick={() => navigateFromHome('/mapa-familiar')}
            aria-label="Abrir Home"
            aria-current="page"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={itemClassName}
            onClick={() => navigateFromHome('/calendario-familiar')}
            aria-label="Abrir calendário familiar"
          >
            <CalendarDays className="h-5 w-5" />
            <span>Calendário</span>
          </button>

          <button
            type="button"
            className={itemClassName}
            onClick={() => navigateFromHome('/forum')}
            aria-label="Abrir fórum"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Fórum</span>
          </button>

          <button
            type="button"
            className={itemClassName}
            onClick={() => navigateFromHome('/meus-favoritos')}
            aria-label="Abrir favoritos"
          >
            <Star className="h-5 w-5" />
            <span>Favoritos</span>
          </button>

          <button
            type="button"
            className={itemClassName}
            onClick={() => navigateFromHome('/notificacoes')}
            aria-label="Abrir alertas"
          >
            <span className="relative">
              <Bell className="h-5 w-5" />
              <NotificationCountBadge count={unreadNotificationsCount} />
            </span>
            <span>Alertas</span>
          </button>
        </div>
      </nav>
    </>
  );
}

function SummaryTile({
  tone,
  icon: Icon,
  value,
  label,
}: {
  tone: 'blue' | 'green' | 'purple' | 'orange';
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  const toneClassName = {
    blue: 'border-blue-200 bg-blue-50 text-blue-600',
    green: 'border-green-200 bg-green-50 text-green-600',
    purple: 'border-violet-200 bg-violet-50 text-violet-600',
    orange: 'border-orange-200 bg-orange-50 text-orange-600',
  }[tone];

  return (
    <div className={['flex min-h-24 items-center gap-3 rounded-2xl border px-4 py-3', toneClassName].join(' ')}>
      <Icon className="h-10 w-10 shrink-0" />
      <div className="min-w-0">
        <strong className="block text-4xl font-black leading-none tracking-[-0.04em]">{value}</strong>
        <span className="mt-1.5 block truncate text-base font-semibold text-blue-950">{label}</span>
      </div>
    </div>
  );
}
