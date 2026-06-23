import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Eye,
  MessageCircle,
  Network,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react';

type TutorialTarget = {
  selectors?: string[];
  textIncludes?: string[];
  containerTextIncludes?: string[];
  padding?: number;
};

type TutorialStep = {
  eyebrow: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  bullets?: string[];
  tip?: string;
  targets?: TutorialTarget[];
  panelPlacement?: 'auto' | 'right' | 'left' | 'above' | 'below' | 'center';
  panelReference?: 'all' | 'first' | 'last';
  mergeSpotlights?: boolean;
  panelGap?: number;
};

type FirstLoginTutorialProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: () => void;
};

type SpotlightRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  radius: number;
};

type PanelPosition = {
  left: number;
  top: number;
  width: number;
};

type TourLayout = {
  spotlights: SpotlightRect[];
  panel: PanelPosition;
};

const PANEL_MAX_WIDTH = 430;
const MOBILE_PANEL_MAX_WIDTH = 330;
const PANEL_ESTIMATED_HEIGHT = 315;
const MOBILE_PANEL_ESTIMATED_HEIGHT = 196;
const VIEWPORT_MARGIN = 14;
const SPOTLIGHT_RADIUS = 18;
const PANEL_GAP = 18;
const MOBILE_BREAKPOINT_QUERY = '(max-width: 767px)';

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Aqui é o seu menu',
    icon: Network,
    panelPlacement: 'left',
    mergeSpotlights: true,
    targets: [
      { selectors: ['[data-tour-target="alerts"]'], padding: 10 },
      { selectors: ['[data-tour-target="search"]'], padding: 10 },
      { selectors: ['[data-tour-target="profile-menu"]'], padding: 10 },
    ],
    bullets: [
      'Não perca datas importantes e avisos na área de Alertas e configure suas preferências de notificações.',
      'Utilize o botão de busca para procurar por pessoas, páginas do site ou histórias.',
      'No menu, tenha acesso rápido a todas as áreas do site.',
      'Edite e complemente seus dados e altere a sua foto do perfil ou a sua senha de acesso.',
      'Personalize o que pode ser visualizado por outras pessoas.',
      'Saia da plataforma pelo logout.',
    ],
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Modos de exibição e controles da árvore',
    icon: Eye,
    panelPlacement: 'below',
    targets: [
      { selectors: ['[data-tour-target="tree-controls"]'], padding: 12 },
      { selectors: ['[data-tour-target="tree-controls-collapse"]'], padding: 10 },
    ],
    bullets: [
      'Feche o painel no botão de seta para expandir a área de visualização.',
      'Escolha o modo de visualização da árvore genealógica.',
      'Mude a paleta de cores de exibição da sua tela de mapa familiar.',
      'Configure o zoom e a exibição de linhas, bordas, cards e grupos.',
      'Imprima ou salve em imagem ou PDF, destacando a área desejada da tela.',
    ],
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Controle quem aparece na árvore',
    icon: SlidersHorizontal,
    panelPlacement: 'right',
    targets: [{ selectors: ['[data-tour-target="groups-filters"]'], padding: 12 }],
    bullets: [
      'Clique nos botões coloridos para ocultar ou exibir grupos de parentes.',
      'Use os filtros para visualizar na árvore apenas pessoas vivas ou falecidas.',
      'Ative o botão de cônjuges para exibir os cards de pessoas que se juntaram à família.',
      'O botão de Pet faz aparecer na árvore os animais de estimação cadastrados.',
    ],
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Perfis, vínculos e memórias',
    icon: UserRound,
    panelPlacement: 'auto',
    panelReference: 'first',
    panelGap: 18,
    targets: [{ selectors: ['[data-family-map-central-card="true"]', '[data-family-map-mobile-card="true"]'], padding: 12 }],
    bullets: [
      'Clique nos cards para acessar informações pessoais, biografia e contatos de familiares.',
      'Descubra seu grau de parentesco e a linha genealógica que conecta vocês.',
      'Acesse arquivos históricos, certidões e uma linha do tempo de memórias.',
      'Confira ainda o que diz a astrologia e os fatos do dia do nascimento desta pessoa.',
    ],
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Inteligência artificial e datas importantes',
    icon: Sparkles,
    panelPlacement: 'below',
    mergeSpotlights: true,
    targets: [
      { selectors: ['[data-tour-target="curiosities"]'], padding: 10 },
      { selectors: ['[data-tour-target="calendar"]'], padding: 10 },
    ],
    bullets: [
      'Em Curiosidades, surpreenda-se com fatos e números. Faça perguntas para a inteligência artificial para descobrir conexões e buscar dados sobre você e seus familiares.',
      'Veja aniversários, datas de memória e comemorações no Calendário. Você pode integrar também ao Google Agenda.',
    ],
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Guarde os seus destaques',
    icon: Star,
    panelPlacement: 'auto',
    mergeSpotlights: true,
    targets: [
      { selectors: ['[data-tour-target="favorites"]'], padding: 10 },
      { selectors: ['[data-tour-target="tree-favorite"]'], padding: 10 },
    ],
    bullets: [
      'Favorite páginas e atalhos importantes para acessar rapidamente depois.',
      'Use Favoritos no menu superior e o botão de estrela na árvore para guardar o que quiser consultar novamente.',
    ],
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Interação entre familiares',
    icon: MessageCircle,
    panelPlacement: 'below',
    targets: [{ selectors: ['[data-tour-target="forum"]'], textIncludes: ['Fórum'], padding: 10 }],
    bullets: [
      'Interaja com todos criando tópicos de debate e compartilhando histórias, lembranças e dúvidas.',
      'Crie tópicos para organizar conversas.',
      'Responda mensagens e engaje com curtidas e outras reações.',
    ],
  },
];

const MOBILE_TUTORIAL_STEPS: TutorialStep[] = [
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Busca e perfil',
    icon: UserRound,
    panelPlacement: 'below',
    mergeSpotlights: true,
    targets: [
      { selectors: ['[data-tour-target="search"]'], padding: 8 },
      { selectors: ['[data-tour-target="profile-menu"]'], padding: 8 },
    ],
    description:
      'Use a busca para encontrar pessoas e páginas. Edite seus dados, altere a sua foto do perfil e ajuste suas preferências.',
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Controles da árvore',
    icon: Eye,
    panelPlacement: 'below',
    targets: [{ selectors: ['[data-tour-target="mobile-tree-action-bar"]', '[data-mobile-family-map-toolbar="true"]'], padding: 8 }],
    description:
      'Escolha o modo de visualização e as cores da sua árvore. Imprima ou salve em imagem ou PDF.',
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Cards de pessoas',
    icon: UserRound,
    panelPlacement: 'below',
    panelGap: 14,
    targets: [
      {
        selectors: [
          '[data-family-map-central-card="true"]',
          '[data-family-map-mobile-main-card="true"]',
          '[data-family-map-mobile-card="true"][data-family-map-color-key="central"]',
        ],
        padding: 10,
      },
    ],
    description: 'Toque um card para descobrir mais sobre pessoas, suas conexões e histórias.',
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Curiosidades',
    icon: Sparkles,
    panelPlacement: 'above',
    targets: [{ selectors: ['[data-tour-target="curiosities"]'], textIncludes: ['Curiosidades'], padding: 8 }],
    description:
      'Surpreenda-se com conexões e histórias. Faça perguntas para a inteligência artificial. Veja datas e vincule ao Google Agenda.',
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Fórum da família',
    icon: MessageCircle,
    panelPlacement: 'above',
    targets: [{ selectors: ['[data-tour-target="forum"]'], textIncludes: ['Fórum'], padding: 8 }],
    description:
      'Crie tópicos, comente e reaja a publicações sobre lembranças, histórias ou dúvidas relacionadas a sua família.',
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function isInsideFirstLoginTutorial(element: HTMLElement) {
  return Boolean(element.closest('[data-first-login-tutorial="true"]'));
}

function isVisibleElement(element: HTMLElement) {
  if (isInsideFirstLoginTutorial(element)) return false;

  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
}

function getElementSearchText(element: HTMLElement) {
  const input = element instanceof HTMLInputElement ? element.placeholder : '';

  return normalizeText(
    [
      element.textContent ?? '',
      element.getAttribute('aria-label') ?? '',
      element.getAttribute('title') ?? '',
      input,
    ].join(' ')
  );
}

function queryVisibleElement(selectors: string[] = []) {
  for (const selector of selectors) {
    try {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
      const visibleElement = elements.find(isVisibleElement);
      if (visibleElement) return visibleElement;
    } catch {
      // Ignora seletores não suportados.
    }
  }

  return null;
}

function queryVisibleElementByText(textIncludes: string[] = []) {
  if (textIncludes.length === 0) return null;

  const normalizedTerms = textIncludes.map(normalizeText);
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(
      'header, nav, aside, button, a, input, section, div, [role="button"], [aria-label], [title]'
    )
  );

  return (
    candidates.find((element) => {
      if (!isVisibleElement(element)) return false;
      const text = getElementSearchText(element);
      return normalizedTerms.every((term) => text.includes(term));
    }) ?? null
  );
}

function queryVisibleContainerByText(textIncludes: string[] = []) {
  if (textIncludes.length === 0) return null;

  const normalizedTerms = textIncludes.map(normalizeText);
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('div, section, aside, nav, header, main'))
    .filter(isVisibleElement)
    .filter((element) => {
      const text = normalizeText(element.textContent ?? '');
      return normalizedTerms.every((term) => text.includes(term));
    })
    .sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      return rectA.width * rectA.height - rectB.width * rectB.height;
    });

  return candidates[0] ?? null;
}

function resolveSingleTarget(target: TutorialTarget) {
  return (
    queryVisibleElement(target.selectors) ??
    queryVisibleContainerByText(target.containerTextIncludes) ??
    queryVisibleElementByText(target.textIncludes)
  );
}

function resolveTargetElements(targets: TutorialTarget[] = []) {
  const elements: { element: HTMLElement; padding: number }[] = [];

  for (const target of targets) {
    const element = resolveSingleTarget(target);
    if (!element) continue;

    elements.push({
      element,
      padding: target.padding ?? 10,
    });
  }

  return elements;
}

function createSpotlightRect(targetElements: { element: HTMLElement; padding: number }[]): SpotlightRect | null {
  if (targetElements.length === 0) return null;

  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const target of targetElements) {
    const rect = target.element.getBoundingClientRect();
    const padding = target.padding;

    left = Math.min(left, rect.left - padding);
    top = Math.min(top, rect.top - padding);
    right = Math.max(right, rect.right + padding);
    bottom = Math.max(bottom, rect.bottom + padding);
  }

  left = clamp(left, VIEWPORT_MARGIN, window.innerWidth - VIEWPORT_MARGIN);
  top = clamp(top, VIEWPORT_MARGIN, window.innerHeight - VIEWPORT_MARGIN);
  right = clamp(right, VIEWPORT_MARGIN, window.innerWidth - VIEWPORT_MARGIN);
  bottom = clamp(bottom, VIEWPORT_MARGIN, window.innerHeight - VIEWPORT_MARGIN);

  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(right - left, 1),
    height: Math.max(bottom - top, 1),
    radius: SPOTLIGHT_RADIUS,
  };
}

function createSpotlightRects(targetElements: { element: HTMLElement; padding: number }[]): SpotlightRect[] {
  return targetElements.map((target) => createSpotlightRect([target])).filter((rect): rect is SpotlightRect => Boolean(rect));
}

function createUnionSpotlightRect(spotlights: SpotlightRect[]) {
  if (spotlights.length === 0) return null;

  const left = Math.min(...spotlights.map((spotlight) => spotlight.left));
  const top = Math.min(...spotlights.map((spotlight) => spotlight.top));
  const right = Math.max(...spotlights.map((spotlight) => spotlight.right));
  const bottom = Math.max(...spotlights.map((spotlight) => spotlight.bottom));

  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(right - left, 1),
    height: Math.max(bottom - top, 1),
    radius: SPOTLIGHT_RADIUS,
  } satisfies SpotlightRect;
}

function createCenteredPanel(width: number, estimatedHeight: number): PanelPosition {
  return {
    left: clamp((window.innerWidth - width) / 2, VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN),
    top: clamp((window.innerHeight - estimatedHeight) / 2, VIEWPORT_MARGIN, window.innerHeight - estimatedHeight - VIEWPORT_MARGIN),
    width,
  };
}

function createPanelPosition(
  spotlight: SpotlightRect | null,
  placement: TutorialStep['panelPlacement'],
  gap = PANEL_GAP,
  compact = false
): PanelPosition {
  const maxWidth = compact ? MOBILE_PANEL_MAX_WIDTH : PANEL_MAX_WIDTH;
  const estimatedHeight = compact ? MOBILE_PANEL_ESTIMATED_HEIGHT : PANEL_ESTIMATED_HEIGHT;
  const width = Math.min(maxWidth, window.innerWidth - VIEWPORT_MARGIN * 2);

  if (!spotlight || placement === 'center') {
    return createCenteredPanel(width, estimatedHeight);
  }

  const tryBelow = () => ({
    left: clamp(spotlight.left + spotlight.width / 2 - width / 2, VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN),
    top: spotlight.bottom + gap,
    width,
  });

  const tryAbove = () => ({
    left: clamp(spotlight.left + spotlight.width / 2 - width / 2, VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN),
    top: spotlight.top - estimatedHeight - gap,
    width,
  });

  const tryRight = () => ({
    left: spotlight.right + gap,
    top: clamp(spotlight.top, VIEWPORT_MARGIN, window.innerHeight - estimatedHeight - VIEWPORT_MARGIN),
    width,
  });

  const tryLeft = () => ({
    left: spotlight.left - width - gap,
    top: clamp(spotlight.top, VIEWPORT_MARGIN, window.innerHeight - estimatedHeight - VIEWPORT_MARGIN),
    width,
  });

  const fits = (panel: PanelPosition) => (
    panel.left >= VIEWPORT_MARGIN &&
    panel.top >= VIEWPORT_MARGIN &&
    panel.left + panel.width <= window.innerWidth - VIEWPORT_MARGIN &&
    panel.top + estimatedHeight <= window.innerHeight - VIEWPORT_MARGIN
  );

  const preferredOrder: Record<NonNullable<TutorialStep['panelPlacement']>, (() => PanelPosition)[]> = {
    auto: [tryBelow, tryAbove, tryRight, tryLeft],
    below: [tryBelow, tryAbove, tryRight, tryLeft],
    above: [tryAbove, tryBelow, tryRight, tryLeft],
    right: [tryRight, tryBelow, tryAbove, tryLeft],
    left: [tryLeft, tryBelow, tryAbove, tryRight],
    center: [() => createCenteredPanel(width, estimatedHeight)],
  };

  for (const build of preferredOrder[placement ?? 'auto']) {
    const panel = build();
    if (fits(panel)) return panel;
  }

  const fallback = tryBelow();

  return {
    left: clamp(fallback.left, VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN),
    top: clamp(fallback.top, VIEWPORT_MARGIN, window.innerHeight - estimatedHeight - VIEWPORT_MARGIN),
    width,
  };
}

function SpotlightOverlay({ spotlights }: { spotlights: SpotlightRect[] }) {
  const maskId = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');

  if (spotlights.length === 0) {
    return <div className="fixed inset-0 z-[12001] bg-slate-950/85 backdrop-blur-[1px]" data-tree-export-ignore="true" />;
  }

  return (
    <>
      <svg className="pointer-events-none fixed inset-0 z-[12001] h-screen w-screen" data-tree-export-ignore="true" aria-hidden="true">
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlights.map((spotlight, index) => (
              <rect
                key={`${spotlight.left}-${spotlight.top}-${index}`}
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx={spotlight.radius}
                ry={spotlight.radius}
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(2,6,23,0.85)" mask={`url(#${maskId})`} />
      </svg>
      {spotlights.map((spotlight, index) => (
        <div
          key={`${spotlight.left}-${spotlight.top}-${index}`}
          className="pointer-events-none fixed z-[12002] border-2 border-blue-400"
          style={{
            left: spotlight.left,
            top: spotlight.top,
            width: spotlight.width,
            height: spotlight.height,
            borderRadius: spotlight.radius,
            boxShadow: '0 0 0 2px rgba(255,255,255,0.65), 0 0 34px rgba(59,130,246,0.85), inset 0 0 18px rgba(255,255,255,0.22)',
          }}
          data-tree-export-ignore="true"
        />
      ))}
    </>
  );
}

function getInitialMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
}

export function FirstLoginTutorial({
  open,
  onOpenChange,
  onFinish,
}: FirstLoginTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(getInitialMobileViewport);
  const [layout, setLayout] = useState<TourLayout>(() => ({
    spotlights: [],
    panel: {
      left: VIEWPORT_MARGIN,
      top: VIEWPORT_MARGIN,
      width: PANEL_MAX_WIDTH,
    },
  }));

  const tutorialSteps = isMobileViewport ? MOBILE_TUTORIAL_STEPS : TUTORIAL_STEPS;
  const totalSteps = tutorialSteps.length;
  const currentStep = tutorialSteps[Math.min(stepIndex, totalSteps - 1)];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const progress = useMemo(() => Math.round(((stepIndex + 1) / totalSteps) * 100), [stepIndex, totalSteps]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);

    return () => {
      mediaQuery.removeEventListener('change', syncViewport);
    };
  }, []);

  useEffect(() => {
    setStepIndex((current) => Math.min(current, totalSteps - 1));
  }, [totalSteps]);

  const updateLayout = useCallback(() => {
    const targetElements = resolveTargetElements(currentStep.targets ?? []);
    const individualSpotlights = createSpotlightRects(targetElements);
    const mergedSpotlight = createUnionSpotlightRect(individualSpotlights);
    const spotlights = currentStep.mergeSpotlights && mergedSpotlight ? [mergedSpotlight] : individualSpotlights;
    const panelSpotlight = currentStep.panelReference === 'first'
      ? spotlights[0] ?? null
      : currentStep.panelReference === 'last'
        ? spotlights[spotlights.length - 1] ?? null
        : createUnionSpotlightRect(spotlights);

    setLayout({
      spotlights,
      panel: createPanelPosition(
        panelSpotlight,
        currentStep.panelPlacement ?? 'auto',
        currentStep.panelGap ?? PANEL_GAP,
        isMobileViewport
      ),
    });
  }, [currentStep, isMobileViewport]);

  useEffect(() => {
    if (!open) {
      setStepIndex(0);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
      if (event.key === 'ArrowRight') setStepIndex((current) => Math.min(current + 1, totalSteps - 1));
      if (event.key === 'ArrowLeft') setStepIndex((current) => Math.max(current - 1, 0));
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange, totalSteps]);

  useEffect(() => {
    if (!open) return;

    let frame = 0;
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateLayout);
    };

    scheduleUpdate();
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);

    const timeoutIds = [
      window.setTimeout(scheduleUpdate, 80),
      window.setTimeout(scheduleUpdate, 250),
      window.setTimeout(scheduleUpdate, 600),
    ];

    return () => {
      window.cancelAnimationFrame(frame);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate, true);
    };
  }, [open, stepIndex, updateLayout]);

  if (!open) return null;

  const StepIcon = currentStep.icon;

  const goBack = () => setStepIndex((current) => Math.max(current - 1, 0));
  const goNext = () => {
    if (isLastStep) {
      onFinish();
      return;
    }
    setStepIndex((current) => Math.min(current + 1, totalSteps - 1));
  };

  return (
    <div
      className="fixed inset-0 z-[12000]"
      data-first-login-tutorial="true"
      data-first-login-tutorial-step={currentStep.title}
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-login-tutorial-title"
      data-tree-export-ignore="true"
    >
      <div className="pointer-events-auto fixed inset-0 z-[12000]" />
      <SpotlightOverlay spotlights={layout.spotlights} />

      <section
        className={[
          'fixed z-[12003] overflow-hidden border border-slate-200 bg-white text-slate-950 shadow-2xl',
          isMobileViewport ? 'rounded-xl' : 'rounded-2xl',
        ].join(' ')}
        style={{
          left: layout.panel.left,
          top: layout.panel.top,
          width: layout.panel.width,
        }}
      >
        <header className={[
          'relative z-10 flex items-start border-b border-slate-100 bg-white',
          isMobileViewport ? 'gap-2 px-3 py-3' : 'gap-3 px-4 py-4',
        ].join(' ')}>
          <div className={[
            'flex shrink-0 items-center justify-center border border-blue-100 bg-blue-50 text-blue-700',
            isMobileViewport ? 'h-9 w-9 rounded-lg' : 'h-11 w-11 rounded-xl',
          ].join(' ')}>
            <StepIcon className={isMobileViewport ? 'h-4 w-4' : 'h-5 w-5'} />
          </div>

          <div className="min-w-0 flex-1">
            <p className={[
              'font-extrabold uppercase text-blue-700',
              isMobileViewport ? 'text-[9px] tracking-[0.14em]' : 'text-[11px] tracking-[0.16em]',
            ].join(' ')}>
              {currentStep.eyebrow}
            </p>
            <h2
              id="first-login-tutorial-title"
              className={[
                'mt-0.5 font-extrabold leading-tight text-slate-950',
                isMobileViewport ? 'text-base' : 'text-lg',
              ].join(' ')}
            >
              {currentStep.title}
            </h2>
          </div>

          <button
            type="button"
            className={[
              'flex shrink-0 items-center justify-center border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
              isMobileViewport ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-xl',
            ].join(' ')}
            onClick={() => onOpenChange(false)}
            aria-label="Fechar tutorial"
          >
            <X className={isMobileViewport ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </button>
        </header>

        <div className="h-1 bg-slate-100">
          <div
            className="h-full rounded-r-full bg-blue-600 transition-all duration-300"
            style={{ width: progress + '%' }}
          />
        </div>

        <main className={[
          'relative z-10 overflow-y-auto bg-white',
          isMobileViewport ? 'max-h-[30vh] px-3 py-3' : 'max-h-[44vh] px-4 py-4',
        ].join(' ')}>
          {currentStep.description && (
            <p className={isMobileViewport ? 'text-xs leading-5 text-slate-700' : 'text-sm leading-6 text-slate-700'}>
              {currentStep.description}
            </p>
          )}

          {currentStep.bullets && currentStep.bullets.length > 0 && (
            <ul className={[
              isMobileViewport ? 'space-y-1.5' : 'space-y-2',
              currentStep.description ? 'mt-3' : '',
            ].join(' ')}>
              {currentStep.bullets.map((item) => (
                <li
                  key={item}
                  className={[
                    'flex gap-2 text-slate-700',
                    isMobileViewport ? 'text-xs leading-5' : 'text-sm leading-5',
                  ].join(' ')}
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {currentStep.tip && (
            <div className={[
              'rounded-xl border border-blue-100 bg-blue-50 text-blue-950',
              isMobileViewport ? 'mt-3 px-3 py-2 text-[11px] leading-4' : 'mt-4 px-3 py-2 text-xs leading-5',
            ].join(' ')}>
              <strong className="font-extrabold">Dica: </strong>
              {currentStep.tip}
            </div>
          )}
        </main>

        <footer className={[
          'relative z-10 flex justify-end gap-2 border-t border-slate-100 bg-white',
          isMobileViewport ? 'px-3 py-2.5' : 'px-4 py-3',
        ].join(' ')}>
          {!isFirstStep && (
            <button
              type="button"
              className={[
                'rounded-xl border border-slate-200 bg-white font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                isMobileViewport ? 'px-3 py-2 text-[11px]' : 'px-4 py-2 text-xs',
              ].join(' ')}
              onClick={goBack}
            >
              Voltar
            </button>
          )}

          <button
            type="button"
            className={[
              'rounded-xl bg-blue-600 font-extrabold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              isMobileViewport ? 'px-3 py-2 text-[11px]' : 'px-4 py-2 text-xs',
            ].join(' ')}
            onClick={goNext}
          >
            {isLastStep ? 'Começar' : 'Próximo'}
          </button>
        </footer>
      </section>
    </div>
  );
}
