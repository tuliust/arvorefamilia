import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  PawPrint,
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
import { MobileFamilyMapBackdrop } from '../../components/FamilyTree/MobileFamilyMapBackdrop';
import { MobileFamilyMapContextTray } from '../../components/FamilyTree/MobileFamilyMapContextTray';
import { MobileFamilyMapFullLayer } from '../../components/FamilyTree/MobileFamilyMapFullLayer';
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
import { isHumanFamilyMember, isPetFamilyMember } from '../../utils/personEntity';
import { dispatchTreeAction, type SidebarTreeAction } from './SidebarPanelTabs';

interface HomeMobileNavProps {
  legendOpen: boolean;
  onToggleLegend: () => void;
  navigateFromHome: (path: string) => void;
}

type ViewAsPersonOption = { id: string; label: string };
type MobileFamilyGroupPersonOption = { id: string; label: string };
type MobileFamilyGroupTab = 'nucleo' | 'ascendentes' | 'colaterais';
type MobileMapOverviewScreenName =
  | 'paternal-ancestors'
  | 'ancestors'
  | 'maternal-ancestors'
  | 'paternal-uncles'
  | 'core'
  | 'maternal-uncles'
  | 'paternal-cousins'
  | 'descendants'
  | 'maternal-cousins';
type MobileMapPanelMode = 'overview' | 'full';
type MobileGenerationMapPanelMode = 'overview' | 'full';
type MobileFamilyGroupCountKey =
  | 'pais'
  | 'conjuges'
  | 'irmaos'
  | 'filhos'
  | 'pets'
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
const MOBILE_FULL_MAP_OPEN_EVENT = 'arvorefamilia:mobile-full-map-open';
const MOBILE_GENERATION_FULL_MAP_OPEN_EVENT = 'arvorefamilia:mobile-generation-full-map-open';

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
  pessoas: Pessoa[],
  relacionamentos: Relacionamento[]
): Record<MobileFamilyGroupCountKey, number> {
  const activeRelationships = relacionamentos.filter((relationship) => relationship.ativo !== false);
  const pessoasById = new globalThis.Map(pessoas.filter((p) => Boolean(p.id)).map((p) => [p.id, p]));

  if (!centralPersonId) {
    return {
      pais: uniqueCount(
        activeRelationships
          .filter((r) => r.tipo_relacionamento === 'pai' || r.tipo_relacionamento === 'mae')
          .map((r) => r.pessoa_origem_id)
      ),
      conjuges: uniqueCount(
        activeRelationships
          .filter((r) => r.tipo_relacionamento === 'conjuge')
          .flatMap((r) => [r.pessoa_origem_id, r.pessoa_destino_id])
      ),
      irmaos: uniqueCount(
        activeRelationships
          .filter((r) => r.tipo_relacionamento === 'irmao')
          .flatMap((r) => [r.pessoa_origem_id, r.pessoa_destino_id])
      ),
      filhos: 0,
      pets: 0,
      avos: 0,
      bisavos: 0,
      tataravos: 0,
      tios: 0,
      primos: 0,
      sobrinhos: 0,
    };
  }

  // Parents: tipo=pai/mae pointing to centralPerson OR centralPerson with tipo=filho pointing to parent
  const parentIds = new Set<string>();
  activeRelationships.forEach((r) => {
    if (r.pessoa_destino_id === centralPersonId && (r.tipo_relacionamento === 'pai' || r.tipo_relacionamento === 'mae')) {
      if (r.pessoa_origem_id) parentIds.add(r.pessoa_origem_id);
    }
    if (r.pessoa_origem_id === centralPersonId && r.tipo_relacionamento === 'filho') {
      if (r.pessoa_destino_id) parentIds.add(r.pessoa_destino_id);
    }
  });

  // Children: centralPerson with tipo=pai/mae (centralPerson is the parent)
  const childIds = new Set<string>();
  const petIds = new Set<string>();
  activeRelationships.forEach((r) => {
    if (r.pessoa_origem_id === centralPersonId && (r.tipo_relacionamento === 'pai' || r.tipo_relacionamento === 'mae')) {
      const id = r.pessoa_destino_id;
      if (id) {
        if (isPetFamilyMember(pessoasById.get(id))) petIds.add(id);
        else childIds.add(id);
      }
    }
  });

  // Also route any parent that is a pet into pets
  const truePetIds = new Set<string>(petIds);
  const trueParentIds = new Set<string>();
  parentIds.forEach((id) => {
    if (isPetFamilyMember(pessoasById.get(id))) truePetIds.add(id);
    else trueParentIds.add(id);
  });

  const siblingIds = new Set(
    activeRelationships
      .filter((r) => r.tipo_relacionamento === 'irmao' && (r.pessoa_origem_id === centralPersonId || r.pessoa_destino_id === centralPersonId))
      .map((r) => r.pessoa_origem_id === centralPersonId ? r.pessoa_destino_id : r.pessoa_origem_id)
      .filter(Boolean) as string[]
  );

  const spouseIds = new Set(
    activeRelationships
      .filter((r) => r.tipo_relacionamento === 'conjuge' && (r.pessoa_origem_id === centralPersonId || r.pessoa_destino_id === centralPersonId))
      .map((r) => r.pessoa_origem_id === centralPersonId ? r.pessoa_destino_id : r.pessoa_origem_id)
      .filter(Boolean) as string[]
  );

  const grandparentIds = new Set<string>();
  trueParentIds.forEach((parentId) => {
    activeRelationships
      .filter((r) => r.pessoa_destino_id === parentId && (r.tipo_relacionamento === 'pai' || r.tipo_relacionamento === 'mae'))
      .forEach((r) => grandparentIds.add(r.pessoa_origem_id));
  });

  const uncleAuntIds = new Set<string>();
  trueParentIds.forEach((parentId) => {
    activeRelationships
      .filter((r) => r.tipo_relacionamento === 'irmao' && (r.pessoa_origem_id === parentId || r.pessoa_destino_id === parentId))
      .forEach((r) => {
        uncleAuntIds.add(r.pessoa_origem_id === parentId ? r.pessoa_destino_id : r.pessoa_origem_id);
      });
  });

  return {
    pais: trueParentIds.size,
    conjuges: spouseIds.size,
    irmaos: siblingIds.size,
    filhos: childIds.size,
    pets: truePetIds.size,
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
    pets: new Set<string>(),
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
    pets: new Set<string>(),
    avos: new Set<string>(),
    bisavos: new Set<string>(),
    tataravos: new Set<string>(),
    tios: new Set<string>(),
    primos: new Set<string>(),
    sobrinhos: new Set<string>(),
  };

  activeRelationships.forEach((relationship) => {
    // Parents: stored as (parent, pai/mae, child=centralPerson)
    if (
      relationship.pessoa_destino_id === centralPersonId &&
      (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae')
    ) {
      const id = relationship.pessoa_origem_id;
      if (isPetFamilyMember(pessoasById.get(id))) addId(groups.pets, id);
      else addId(groups.pais, id);
    }

    // Parents stored from child's perspective: (centralPerson, filho, parent)
    if (
      relationship.pessoa_origem_id === centralPersonId &&
      relationship.tipo_relacionamento === 'filho'
    ) {
      const id = relationship.pessoa_destino_id;
      if (isPetFamilyMember(pessoasById.get(id))) addId(groups.pets, id);
      else addId(groups.pais, id);
    }

    // Children: centralPerson is parent (centralPerson, pai/mae, child)
    if (
      relationship.pessoa_origem_id === centralPersonId &&
      (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae')
    ) {
      const id = relationship.pessoa_destino_id;
      if (isPetFamilyMember(pessoasById.get(id))) addId(groups.pets, id);
      else addId(groups.filhos, id);
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

function normalizeMobileMapText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

function getMobileMapRoot() {
  if (typeof document === 'undefined') return null;
  return document.querySelector<HTMLElement>('[data-mobile-family-tree-root="true"]');
}

function getMobileMapStage(root = getMobileMapRoot()) {
  return root?.querySelector<HTMLElement>('[data-mobile-family-tree-stage="true"]') ?? null;
}

function getMobileMapScreen(screenName: MobileMapOverviewScreenName, root = getMobileMapRoot()) {
  return root?.querySelector<HTMLElement>(`[data-mobile-family-tree-screen="${screenName}"]`) ?? null;
}

function getMobileMapTransform(screenName: MobileMapOverviewScreenName) {
  const screen = MOBILE_MAP_OVERVIEW_SCREENS.find((item) => item.key === screenName);
  if (!screen) return '';
  return `translate3d(calc(${-screen.column * (100 / 3)}% + 0px), calc(${-screen.row * (100 / 3)}% + 0px), 0)`;
}

function getMobileMapDescendantSelector() {
  return MOBILE_OVERVIEW_DESCENDANT_KEYS.map((key) => `[data-family-map-color-key="${key}"]`).join(', ');
}

function countMobileMapCards(screenName: MobileMapOverviewScreenName) {
  const root = getMobileMapRoot();
  if (!root) return screenName === 'core' ? 1 : 0;
  if (screenName === 'core') return getMobileMapScreen('core', root)?.querySelectorAll('[data-family-map-mobile-card="true"]').length || 1;
  if (screenName === 'descendants') return getMobileMapScreen('core', root)?.querySelectorAll(getMobileMapDescendantSelector()).length ?? 0;
  return getMobileMapScreen(screenName, root)?.querySelectorAll('[data-family-map-mobile-card="true"]').length ?? 0;
}

function countMobileGenerationCards(generation: number) {
  if (typeof document === 'undefined') return generation === 5 ? 1 : 0;

  return document.querySelectorAll(
    `[data-family-map-horizontal-mobile-root="true"] [data-mobile-horizontal-generation="${generation}"][data-mobile-horizontal-card="true"]`
  ).length;
}

function getActiveMobileGeneration() {
  if (typeof document === 'undefined') return 5;

  const activeButton = Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      '[data-family-map-horizontal-mobile-root="true"] nav[aria-label^="Gera"] button'
    )
  ).find((button) => button.getAttribute('aria-current') === 'page');
  const generation = Number((activeButton?.textContent ?? '').match(/\d+/)?.[0]);

  return Number.isFinite(generation) ? generation : 5;
}

function parseMobileMapScreenFromTransform(value: string) {
  const match = value.match(/translate3d\(calc\((-?\d+(?:\.\d+)?)%[^,]*,\s*calc\((-?\d+(?:\.\d+)?)%/);
  if (!match) return 'core' as MobileMapOverviewScreenName;

  const toIndex = (percent: number) => {
    const absolute = Math.abs(percent);
    if (absolute < 1) return 0;
    if (Math.abs(absolute - 100 / 3) < 2) return 1;
    if (Math.abs(absolute - 200 / 3) < 2) return 2;
    return null;
  };

  const column = toIndex(Number(match[1]));
  const row = toIndex(Number(match[2]));
  return MOBILE_MAP_OVERVIEW_SCREENS.find((screen) => screen.column === column && screen.row === row)?.key ?? 'core';
}

function getCurrentMobileMapScreen() {
  const root = getMobileMapRoot();
  const explicit = root?.getAttribute('data-mobile-family-tree-active-screen') as MobileMapOverviewScreenName | null;
  if (explicit && MOBILE_MAP_OVERVIEW_SCREENS.some((screen) => screen.key === explicit)) return explicit;
  return parseMobileMapScreenFromTransform(getMobileMapStage(root)?.style.transform ?? '');
}

function clickMobileMapBaseTab(screenName: MobileMapOverviewScreenName) {
  const root = getMobileMapRoot();
  if (!root) return;

  const label = screenName.startsWith('paternal')
    ? 'paterno'
    : screenName.startsWith('maternal')
      ? 'materno'
      : 'central';

  const tab = Array.from(root.querySelectorAll<HTMLButtonElement>('nav[aria-label="Visualizações da árvore"] button'))
    .find((candidate) => normalizeMobileMapText(candidate.textContent ?? '').includes(label));

  tab?.click();
}

function applyMobileMapScreen(screenName: MobileMapOverviewScreenName, animate = true) {
  const root = getMobileMapRoot();
  const stage = getMobileMapStage(root);
  if (!root || !stage) return;

  stage.style.setProperty('transform', getMobileMapTransform(screenName), 'important');
  if (animate) stage.style.setProperty('transition', 'transform 300ms ease-out', 'important');
  else stage.style.removeProperty('transition');
  root.setAttribute('data-mobile-family-tree-active-screen', screenName);

  getMobileMapScreen(screenName, root)?.querySelectorAll<HTMLElement>('[data-mobile-tree-scroll], .mobile-family-descendant-screen__scroll').forEach((scrollArea) => {
    scrollArea.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });

  if (animate) window.setTimeout(() => getMobileMapStage()?.style.removeProperty('transition'), 340);
}

function navigateMobileMapOverview(screenName: MobileMapOverviewScreenName) {
  const root = getMobileMapRoot();
  const stage = getMobileMapStage(root);
  root?.removeAttribute(MOBILE_OVERVIEW_LOCK_ATTR);
  stage?.style.setProperty('transition', 'none', 'important');

  clickMobileMapBaseTab(screenName);
  applyMobileMapScreen(screenName);
  [60, 140, 300, 520, 780].forEach((delay) => {
    window.setTimeout(() => applyMobileMapScreen(screenName, delay < 520), delay);
  });
}


const mobileTreeToolbarTopClass = 'top-[calc(env(safe-area-inset-top,0px)+5.05rem)]';
const paletteOptions: TreeColorPalette[] = ['white', 'visual', 'orange', 'brown'];
const MOBILE_OVERVIEW_DESCENDANT_KEYS = ['irmaos', 'sobrinhos', 'conjuge', 'pets', 'filhos', 'netos'];
const MOBILE_OVERVIEW_LOCK_ATTR = 'data-mobile-family-descendants-transform-lock';

const MOBILE_MAP_OVERVIEW_SCREENS: Array<{
  key: MobileMapOverviewScreenName;
  title: string;
  column: number;
  row: number;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'paternal-ancestors', title: 'Bisavós paternos', column: 0, row: 0, icon: Network },
  { key: 'ancestors', title: 'Avós', column: 1, row: 0, icon: UsersRound },
  { key: 'maternal-ancestors', title: 'Bisavós maternos', column: 2, row: 0, icon: Star },
  { key: 'paternal-uncles', title: 'Tios paternos', column: 0, row: 1, icon: UserRound },
  { key: 'core', title: 'Núcleo central', column: 1, row: 1, icon: Home },
  { key: 'maternal-uncles', title: 'Tios maternos', column: 2, row: 1, icon: HeartHandshake },
  { key: 'paternal-cousins', title: 'Primos paternos', column: 0, row: 2, icon: Layers },
  { key: 'descendants', title: 'Descendentes', column: 1, row: 2, icon: PawPrint },
  { key: 'maternal-cousins', title: 'Primos maternos', column: 2, row: 2, icon: ClipboardList },
];

const MOBILE_GENERATION_OVERVIEW_SCREENS: Array<{
  generation: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { generation: 1, title: 'Tataravós', icon: Network },
  { generation: 2, title: 'Bisavós', icon: UsersRound },
  { generation: 3, title: 'Avós', icon: UsersRound },
  { generation: 4, title: 'Pais', icon: HeartHandshake },
  { generation: 5, title: 'Pessoa principal', icon: UserRound },
  { generation: 6, title: 'Filhos', icon: Heart },
  { generation: 7, title: 'Netos', icon: UsersRound },
  { generation: 8, title: 'Pets', icon: PawPrint },
];

const TREE_VIEW_OPTIONS: Array<{
  path: '/mapa-familiar' | '/linha-geracional';
  label: string;
  subtitle: string;
  ariaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    path: '/linha-geracional',
    label: 'Linha Geracional',
    subtitle: 'Visualização cronológica por gerações',
    ariaLabel: 'Alternar para Linha Geracional',
    icon: Map,
  },
  {
    path: '/mapa-familiar',
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
    { key: 'pets', label: 'Pets', icon: PawPrint },
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
  const [mobileMapPanelMode, setMobileMapPanelMode] = useState<MobileMapPanelMode>('overview');
  const [mobileGenerationMapPanelMode, setMobileGenerationMapPanelMode] = useState<MobileGenerationMapPanelMode>('overview');
  const [treeColorPalette, setTreeColorPalette] = useState<TreeColorPalette>(getStoredPalette);
  const [viewAsPersonOptions, setViewAsPersonOptions] = useState<ViewAsPersonOption[]>([]);
  const [mobilePeople, setMobilePeople] = useState<Pessoa[]>([]);
  const [mobileRelationships, setMobileRelationships] = useState<Relacionamento[]>([]);
  const [defaultViewAsLabel, setDefaultViewAsLabel] = useState('Família principal');
  const [defaultViewAsPersonId, setDefaultViewAsPersonId] = useState('');
  const [showExtendedSpouseFilters, setShowExtendedSpouseFilters] = useState(readStoredExtendedSpouseFilterState);
  const [fullControlsOpen, setFullControlsOpen] = useState(false);
  const [activeGroupTab, setActiveGroupTab] = useState<MobileFamilyGroupTab>('nucleo');
  const contextTrayRef = useRef<HTMLDivElement | null>(null);
  const [partialBackdropTop, setPartialBackdropTop] = useState(0);
  const [mobileMapOverviewCounts, setMobileMapOverviewCounts] = useState<Record<MobileMapOverviewScreenName, number>>(() => (
    Object.fromEntries(MOBILE_MAP_OVERVIEW_SCREENS.map((screen) => [screen.key, screen.key === 'core' ? 1 : 0])) as Record<MobileMapOverviewScreenName, number>
  ));
  const [activeMobileMapScreen, setActiveMobileMapScreen] = useState<MobileMapOverviewScreenName>('core');
  const [mobileGenerationOverviewCounts, setMobileGenerationOverviewCounts] = useState<Record<number, number>>(() => (
    Object.fromEntries(MOBILE_GENERATION_OVERVIEW_SCREENS.map((screen) => [screen.generation, screen.generation === 5 ? 1 : 0]))
  ));
  const [activeMobileGeneration, setActiveMobileGeneration] = useState(5);

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
  const isGenerationLinePath = pathname === '/linha-geracional';
  const isDirectFamilyMapPath = pathname === '/mapa-familiar';
  const isMobileMapToolbarRoute = isDirectFamilyMapPath || isGenerationLinePath;
  const isDirectFamilyMap = pathname === '/mapa-familiar' || pathname === '/mapa-familiar-horizontal' || pathname === '/linha-geracional';
  const selectedViewAsPersonOption = useMemo(
    () => viewAsPersonOptions.find((option) => option.id === currentViewAsPersonValue),
    [currentViewAsPersonValue, viewAsPersonOptions]
  );

  useEffect(() => {
    if (!isDirectFamilyMap) {
      setActiveToolbarAction(null);
      setMobileMapPanelMode('overview');
      setMobileGenerationMapPanelMode('overview');
      setFullControlsOpen(false);
    }
  }, [isDirectFamilyMap, pathname]);

  useEffect(() => {
    if (activeToolbarAction !== 'zoom') {
      setMobileMapPanelMode('overview');
      setMobileGenerationMapPanelMode('overview');
    }
  }, [activeToolbarAction]);

  useEffect(() => {
    if (!isDirectFamilyMapPath) return;

    const updateOverviewState = () => {
      if (mobileMapPanelMode === 'full') return;

      setMobileMapOverviewCounts(
        Object.fromEntries(MOBILE_MAP_OVERVIEW_SCREENS.map((screen) => [screen.key, countMobileMapCards(screen.key)])) as Record<MobileMapOverviewScreenName, number>
      );
      setActiveMobileMapScreen(getCurrentMobileMapScreen());
    };

    updateOverviewState();
    const observer = new MutationObserver(updateOverviewState);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-mobile-family-tree-active-screen', 'style'] });
    window.addEventListener('resize', updateOverviewState, { passive: true });
    window.addEventListener('orientationchange', updateOverviewState, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateOverviewState);
      window.removeEventListener('orientationchange', updateOverviewState);
    };
  }, [isDirectFamilyMapPath, mobileMapPanelMode]);

  useEffect(() => {
    if (!isGenerationLinePath) return;

    const updateGenerationOverviewState = () => {
      if (mobileGenerationMapPanelMode === 'full') return;

      setMobileGenerationOverviewCounts(
        Object.fromEntries(MOBILE_GENERATION_OVERVIEW_SCREENS.map((screen) => [screen.generation, countMobileGenerationCards(screen.generation)]))
      );
      setActiveMobileGeneration(getActiveMobileGeneration());
    };

    updateGenerationOverviewState();
    const observer = new MutationObserver(updateGenerationOverviewState);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current', 'style'] });
    window.addEventListener('resize', updateGenerationOverviewState, { passive: true });
    window.addEventListener('orientationchange', updateGenerationOverviewState, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateGenerationOverviewState);
      window.removeEventListener('orientationchange', updateGenerationOverviewState);
    };
  }, [isGenerationLinePath, mobileGenerationMapPanelMode]);

  useEffect(() => {
    if (activeToolbarAction !== 'zoom' || mobileMapPanelMode !== 'full') return;

    const dispatchFullMapOpen = () => {
      window.dispatchEvent(new CustomEvent(MOBILE_FULL_MAP_OPEN_EVENT));
    };

    const animationFrameId = window.requestAnimationFrame(dispatchFullMapOpen);
    const timeoutIds = [40, 160, 420].map((delay) => window.setTimeout(dispatchFullMapOpen, delay));

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [activeToolbarAction, mobileMapPanelMode]);

  useEffect(() => {
    if (activeToolbarAction !== 'zoom' || mobileGenerationMapPanelMode !== 'full' || !isGenerationLinePath) return;

    const dispatchFullMapOpen = () => {
      window.dispatchEvent(new CustomEvent(MOBILE_GENERATION_FULL_MAP_OPEN_EVENT));
    };

    const animationFrameId = window.requestAnimationFrame(dispatchFullMapOpen);
    const timeoutIds = [40, 160, 420].map((delay) => window.setTimeout(dispatchFullMapOpen, delay));

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [activeToolbarAction, isGenerationLinePath, mobileGenerationMapPanelMode]);

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
    setDefaultViewAsPersonId('');

    if (!user?.id) return;

    let cancelled = false;

    async function loadDefaultViewerLabel() {
      try {
        const linkedPersonResult = await getPrimaryLinkedPersonWithPessoa(user.id);
        if (cancelled) return;

        const linkedPersonName = linkedPersonResult.data?.pessoa?.nome_completo;
        const linkedPersonId = linkedPersonResult.data?.pessoa_id || linkedPersonResult.data?.pessoa?.id || '';

        setDefaultViewAsPersonId(linkedPersonId);
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
      activeToolbarAction !== 'exportar' &&
      activeToolbarAction !== 'zoom'
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

  const effectiveMobileCentralPersonId = currentViewAsPersonValue || defaultViewAsPersonId;

  const mobileGroupCounts = useMemo(
    () => getMobileFamilyGroupCounts(effectiveMobileCentralPersonId || undefined, mobilePeople, mobileRelationships),
    [effectiveMobileCentralPersonId, mobilePeople, mobileRelationships]
  );

  const mobileGroupPeople = useMemo(
    () => getMobileFamilyGroupPeople(effectiveMobileCentralPersonId || undefined, mobilePeople, mobileRelationships),
    [effectiveMobileCentralPersonId, mobilePeople, mobileRelationships]
  );

  const openMobileControlsPanel = useCallback((action: MobileFamilyMapToolbarAction) => {
    if (action === 'visualizacao' || action === 'formato' || action === 'cor' || action === 'grupos' || action === 'exportar' || action === 'zoom') {
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

  const handleViewOptionClick = useCallback((path: '/mapa-familiar' | '/linha-geracional') => {
    const query = typeof window === 'undefined' ? '' : window.location.search;
    const nextPath = `${path}${query}`;

    if (pathname !== path) {
      navigateFromHome(nextPath);
    }

    setActiveToolbarAction(null);
    setFullControlsOpen(false);
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

  const visibleGenerationOverviewScreens = MOBILE_GENERATION_OVERVIEW_SCREENS.filter((screen) => (
    screen.generation === 5 || (mobileGenerationOverviewCounts[screen.generation] ?? 0) > 0
  ));
  const isFamilyMapFullOpen = isDirectFamilyMapPath && activeToolbarAction === 'zoom' && mobileMapPanelMode === 'full';
  const isGenerationMapFullOpen = isGenerationLinePath && activeToolbarAction === 'zoom' && mobileGenerationMapPanelMode === 'full';
  const isMapFullOpen = isFamilyMapFullOpen || isGenerationMapFullOpen;
  const isTrayOpen = isMobileMapToolbarRoute && Boolean(activeToolbarAction) && !isMapFullOpen && !fullControlsOpen;
  const isImmersiveOpen = isMapFullOpen || fullControlsOpen;

  useLayoutEffect(() => {
    if (!isTrayOpen) {
      setPartialBackdropTop(0);
      return;
    }

    const updateBackdropTop = () => {
      const trayBottom = contextTrayRef.current?.getBoundingClientRect().bottom ?? 0;
      setPartialBackdropTop(Math.max(0, Math.ceil(trayBottom)));
    };

    updateBackdropTop();

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(updateBackdropTop);
    if (contextTrayRef.current) resizeObserver?.observe(contextTrayRef.current);

    window.addEventListener('resize', updateBackdropTop, { passive: true });
    window.addEventListener('orientationchange', updateBackdropTop, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateBackdropTop);
      window.removeEventListener('orientationchange', updateBackdropTop);
    };
  }, [activeToolbarAction, isTrayOpen, mobileGenerationMapPanelMode, mobileMapPanelMode]);

  const itemClassName = 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:bg-gray-100';
  const activeItemClassName = 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg bg-blue-50 px-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition active:bg-blue-100';

  return (
    <>
      {isMobileMapToolbarRoute && (
        <>
          <style>
            {`
              [data-mobile-family-tree-root="true"] > nav[aria-label="Visualizações da árvore"],
              [data-family-map-horizontal-mobile-root="true"] > nav[aria-label="Gerações do Mapa Genealógico"] {
                display: none !important;
              }

              [data-mobile-family-tree-screen="paternal-uncles"],
              [data-mobile-family-tree-screen="maternal-uncles"] {
                overflow: hidden !important;
                overscroll-behavior: contain !important;
              }

              [data-mobile-family-tree-screen="paternal-uncles"] > div,
              [data-mobile-family-tree-screen="maternal-uncles"] > div {
                box-sizing: border-box !important;
                height: 100% !important;
                max-height: 100% !important;
                overflow-x: visible !important;
                overflow-y: auto !important;
                overscroll-behavior-y: contain !important;
                -webkit-overflow-scrolling: touch !important;
                padding-bottom: calc(env(safe-area-inset-bottom,0px) + 6.5rem) !important;
              }
            `}
          </style>
          <MobileFamilyMapToolbar
            activeAction={activeToolbarAction}
            className={`fixed inset-x-0 ${mobileTreeToolbarTopClass} z-[10000]`}
            onAction={openMobileControlsPanel}
            onAddClick={openFullControlsPanel}
          />

          {isTrayOpen && (
            <MobileFamilyMapBackdrop mode="partial" top={partialBackdropTop} />
          )}

          {isImmersiveOpen && (
            <MobileFamilyMapBackdrop
              mode="immersive"
              onClick={() => {
                if (fullControlsOpen) {
                  setFullControlsOpen(false);
                  return;
                }

                setMobileMapPanelMode('overview');
                setMobileGenerationMapPanelMode('overview');
              }}
            />
          )}

          {activeToolbarAction === 'visualizacao' && (
            <MobileFamilyMapContextTray ref={contextTrayRef} action="visualizacao" className="pb-3">
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
            </MobileFamilyMapContextTray>
          )}

          {activeToolbarAction === 'formato' && (
            <MobileFamilyMapContextTray ref={contextTrayRef} action="formato">
              <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white/95 p-2 pb-5 shadow-sm backdrop-blur">
              <div className="grid grid-cols-2 gap-2">
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
                        'flex min-h-[72px] min-w-0 flex-col items-center justify-start gap-1 rounded-xl border bg-white px-2 pt-2 pb-5 text-center shadow-sm transition active:scale-[0.99]',
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
            </MobileFamilyMapContextTray>
          )}

          {activeToolbarAction === 'cor' && (
            <MobileFamilyMapContextTray ref={contextTrayRef} action="cor">
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
            </MobileFamilyMapContextTray>
          )}

          {activeToolbarAction === 'grupos' && (
            <MobileFamilyMapContextTray ref={contextTrayRef} action="grupos">
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
            </MobileFamilyMapContextTray>
          )}

          {activeToolbarAction === 'zoom' && !isMapFullOpen && (
            <MobileFamilyMapContextTray
              ref={contextTrayRef}
              action="zoom"
              className="bottom-[calc(env(safe-area-inset-bottom,0px)+5.65rem)]"
            >
              <div
                className="mx-auto flex h-full max-h-[min(22rem,calc(100dvh-13.8rem))] max-w-md flex-col gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_14px_34px_rgba(15,23,42,0.14)] backdrop-blur"
                aria-label="Mapa da família"
                data-mobile-family-map-inline-overview="true"
                data-mobile-family-map-overview-source="direct-map"
                data-mobile-family-map-overview-stable="true"
                data-mobile-family-map-panel-mode="overview"
              >
                {isGenerationLinePath ? (
                  mobileGenerationMapPanelMode === 'overview' ? (
                    <>
                      <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5 overflow-y-auto pr-0.5 [-webkit-overflow-scrolling:touch] min-[390px]:grid-cols-3">
                        {visibleGenerationOverviewScreens.map((screen) => {
                          const Icon = screen.icon;
                          const active = activeMobileGeneration === screen.generation;
                          const count = mobileGenerationOverviewCounts[screen.generation] ?? 0;

                          return (
                            <button
                              key={screen.generation}
                              type="button"
                              aria-label={`${active ? 'Geração atual: ' : 'Abrir geração: '}${screen.title}`}
                              aria-current={active ? 'location' : undefined}
                              onClick={() => {
                                const target = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-family-map-horizontal-mobile-root="true"] nav[aria-label^="Gera"] button'))
                                  .find((button) => Number((button.textContent ?? '').match(/\d+/)?.[0]) === screen.generation);
                                target?.click();
                                setActiveToolbarAction(null);
                              }}
                              className={[
                                'flex min-h-[5.6rem] min-w-0 flex-col items-center justify-center gap-1 rounded-xl border bg-white px-1.5 py-2 text-center shadow-sm transition active:scale-[0.99]',
                                active
                                  ? 'border-cyan-600 bg-cyan-50 text-slate-950 ring-2 ring-cyan-600/60'
                                  : 'border-slate-200 text-slate-900 hover:border-cyan-200 hover:bg-cyan-50/70',
                              ].join(' ')}
                            >
                              <span className="flex min-h-[1.35rem] w-full items-center justify-center text-[9px] font-black uppercase leading-[0.95] tracking-[-0.015em] text-current min-[390px]:text-[9.5px]">
                                {screen.title}
                              </span>
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--tree-palette-card-central,#38bdf8)] text-[var(--tree-palette-text-primary,#0f172a)] shadow-[0_7px_16px_rgba(15,23,42,0.14)]" aria-hidden="true">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="inline-flex max-w-full shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 px-1.5 py-0.5 text-[8.5px] font-black leading-none text-cyan-900">
                                {count || (screen.generation === 5 ? 1 : 0)} pessoa{(count || (screen.generation === 5 ? 1 : 0)) === 1 ? '' : 's'}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setMobileGenerationMapPanelMode('full')}
                        className="flex min-h-10 w-full shrink-0 items-center justify-center rounded-xl border border-cyan-700 bg-cyan-700 px-3 text-sm font-black leading-none tracking-[-0.015em] text-white shadow-[0_10px_24px_rgba(8,145,178,0.22)] transition active:scale-[0.99]"
                      >
                        Exibir mapa completo
                      </button>
                    </>
                  ) : (
                    <div
                      id="mobile-generation-line-full-overview"
                      className="mobile-generation-line-full-map-panel flex min-h-0 flex-1 flex-col"
                      role="region"
                      aria-label="Mapa completo da linha geracional"
                      data-tree-export-ignore="true"
                      data-mobile-generation-line-full-inline="true"
                    >
                      <div className="mobile-generation-line-full-map-viewport min-h-0 flex-1" aria-label="Linha geracional completa com zoom por toque" />
                    </div>
                  )
                ) : mobileMapPanelMode === 'overview' ? (
                  <>
                <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-3 gap-1.5 overflow-visible">
                  {MOBILE_MAP_OVERVIEW_SCREENS.map((screen) => {
                    const Icon = screen.icon;
                    const active = activeMobileMapScreen === screen.key;
                    const count = mobileMapOverviewCounts[screen.key] ?? 0;

                    return (
                      <button
                        key={screen.key}
                        type="button"
                        data-screen={screen.key}
                        aria-label={`${active ? 'Tela atual: ' : 'Abrir tela: '}${screen.title}`}
                        aria-current={active ? 'location' : undefined}
                        onClick={() => {
                          navigateMobileMapOverview(screen.key);
                          setActiveToolbarAction(null);
                        }}
                        className={[
                          'flex min-h-0 min-w-0 flex-col items-center justify-center gap-1 overflow-visible rounded-xl border bg-white px-1 py-1.5 text-center shadow-sm transition active:scale-[0.99]',
                          active
                            ? 'border-blue-500 bg-blue-50 text-blue-950 ring-2 ring-blue-500/70'
                            : 'border-slate-200 text-slate-900 hover:border-blue-200 hover:bg-blue-50/70',
                        ].join(' ')}
                      >
                        <span className="flex min-h-[1.5rem] w-full shrink-0 items-center justify-center px-0.5 text-[8.5px] font-black uppercase leading-[0.95] tracking-[-0.025em] text-current min-[390px]:text-[9.5px]">
                          {screen.title}
                        </span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_7px_16px_rgba(37,99,235,0.20)] min-[390px]:h-9 min-[390px]:w-9" aria-hidden="true">
                          <Icon className="h-4 w-4 min-[390px]:h-[1.1rem] min-[390px]:w-[1.1rem]" />
                        </span>
                        <span className="inline-flex max-w-full shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[8.5px] font-black leading-none text-blue-800 min-[390px]:text-[9.5px]">
                          {count} pessoa{count === 1 ? '' : 's'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  data-mobile-family-full-map-button="true"
                  onClick={() => setMobileMapPanelMode('full')}
                  className="flex min-h-10 w-full shrink-0 items-center justify-center rounded-xl border border-blue-600 bg-blue-600 px-3 text-sm font-black leading-none tracking-[-0.015em] text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition active:scale-[0.99]"
                >
                  Exibir mapa completo
                </button>
                  </>
                ) : (
                  <div
                    id="mobile-family-map-full-overview"
                    className="mobile-family-full-map-panel flex min-h-0 flex-1 flex-col"
                    role="region"
                    aria-label="Mapa completo da famÃ­lia"
                    data-tree-export-ignore="true"
                    data-mobile-family-map-full-inline="true"
                  >
                    <div className="mobile-family-full-map-viewport min-h-0 flex-1" aria-label="Mapa completo com zoom por toque" />
                  </div>
                )}
              </div>
            </MobileFamilyMapContextTray>
          )}

          {isFamilyMapFullOpen && (
            <MobileFamilyMapFullLayer
              title="Mapa completo da familia"
              onClose={() => setMobileMapPanelMode('overview')}
            >
              <div
                id="mobile-family-map-full-overview"
                className="mobile-family-full-map-panel flex h-full min-h-0 flex-1 flex-col"
                role="region"
                aria-label="Mapa completo da famÃƒÂ­lia"
                data-tree-export-ignore="true"
                data-mobile-family-map-full-inline="true"
              >
                <div className="mobile-family-full-map-viewport min-h-0 flex-1" aria-label="Mapa completo com zoom por toque" />
              </div>
            </MobileFamilyMapFullLayer>
          )}

          {isGenerationMapFullOpen && (
            <MobileFamilyMapFullLayer
              title="Visualizacao completa da linha geracional"
              onClose={() => setMobileGenerationMapPanelMode('overview')}
            >
              <div
                id="mobile-generation-line-full-overview"
                className="mobile-generation-line-full-map-panel flex h-full min-h-0 flex-1 flex-col"
                role="region"
                aria-label="Mapa completo da linha geracional"
                data-tree-export-ignore="true"
                data-mobile-generation-line-full-inline="true"
              >
                <div className="mobile-generation-line-full-map-viewport min-h-0 flex-1" aria-label="Linha geracional completa com zoom por toque" />
              </div>
            </MobileFamilyMapFullLayer>
          )}

          {activeToolbarAction === 'exportar' && (
            <MobileFamilyMapContextTray ref={contextTrayRef} action="exportar">
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
            </MobileFamilyMapContextTray>
          )}

          {fullControlsOpen && (
            <div
              className="fixed inset-0 z-[12010] md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Painel de visualização"
              data-tree-export-ignore="true"
            >
              <button
                type="button"
                className="hidden"
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
                            'flex min-h-16 min-w-0 items-center justify-center gap-2 px-2 text-center text-[13px] font-bold transition',
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
                              <div className="flex w-full flex-col gap-2">
                                {people.map((person) => (
                                  <button
                                    key={person.id}
                                    type="button"
                                    onClick={() => {
                                      setFullControlsOpen(false);
                                      handleViewAsPersonChange(person.id);
                                    }}
                                    className="flex w-full items-center justify-center rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm font-bold leading-tight text-blue-950 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98]"
                                  >
                                    <span className="min-w-0 truncate">{person.label}</span>
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
        <strong className="block text-[2rem] font-bold leading-none tracking-[-0.035em]">{value}</strong>
        <span className="mt-1.5 block truncate text-base font-semibold text-blue-950">{label}</span>
      </div>
    </div>
  );
}
