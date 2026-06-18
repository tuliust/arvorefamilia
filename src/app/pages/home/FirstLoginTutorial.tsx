import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Eye,
  MessageCircle,
  Network,
  Search,
  SlidersHorizontal,
  Sparkles,
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
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  bullets?: string[];
  tip?: string;
  targets?: TutorialTarget[];
  panelPlacement?: 'auto' | 'right' | 'left' | 'above' | 'below';
  panelReference?: 'all' | 'first' | 'last';
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
const PANEL_ESTIMATED_HEIGHT = 315;
const VIEWPORT_MARGIN = 14;
const SPOTLIGHT_RADIUS = 18;
const PANEL_GAP = 18;

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    eyebrow: 'Início',
    title: 'Bem-vindo ao Mapa Familiar',
    description:
      'Esta é uma plataforma familiar privada para organizar a árvore genealógica, perfis de familiares, fotos, documentos, memórias e datas importantes da família.',
    icon: Network,
    panelPlacement: 'left',
    targets: [
      {
        selectors: [
          'button img',
          'img[alt*="perfil"]',
          'img[alt*="avatar"]',
          'img[alt*="profile"]',
        ],
        padding: 10,
      },
      {
        containerTextIncludes: ['Atualizar perfil', 'Painel Admin', 'Sair'],
        padding: 12,
      },
    ],
    bullets: [
      'Preencha seu perfil no início.',
      'Atualize seus dados sempre que desejar.',
      'Use a plataforma como um acervo privado da história familiar.',
    ],
  },
  {
    eyebrow: 'Visualização',
    title: 'Modos de exibição e controles da árvore',
    description:
      'Você pode visualizar a árvore genealógica de duas formas: no modo vertical, em formato de pirâmide, ou no modo horizontal, organizado por colunas de gerações.',
    icon: Eye,
    panelPlacement: 'below',
    targets: [
      {
        containerTextIncludes: [
          'Zoom',
          'Vertical',
          'Horizontal',
          'Cores',
          'Exportar',
          'Destacar',
        ],
        padding: 12,
      },
    ],
    bullets: [
      'Troque as paletas de cores.',
      'Alterne entre vertical e horizontal.',
      'Controle o zoom pelos botões do painel, pelo mouse ou pelos atalhos do teclado.',
    ],
  },
  {
    eyebrow: 'Grupos e filtros',
    title: 'Controle quem aparece na árvore',
    description:
      'No painel lateral, os cards de grupos mostram quantas pessoas estão cadastradas em cada categoria de parentesco.',
    icon: SlidersHorizontal,
    panelPlacement: 'right',
    targets: [
      {
        containerTextIncludes: ['GRUPOS', 'FILTROS'],
        padding: 12,
      },
    ],
    bullets: [
      'Clique nos botões para ocultar ou exibir grupos de parentes.',
      'Use os filtros para ver pessoas vivas ou falecidas.',
      'Inclua ou oculte cônjuges conforme a visualização desejada.',
    ],
  },
  {
    eyebrow: 'Busca e favoritos',
    title: 'Favorite e encontre informações',
    description:
      'A busca ajuda a navegar rapidamente pelo acervo familiar.',
    icon: Search,
    panelPlacement: 'below',
    targets: [
      {
        selectors: [
          '[data-tour-target="search"]',
          'input[placeholder*="Buscar"]',
          'input[placeholder*="buscar"]',
          'input[placeholder*="pessoa ou página"]',
          'input[placeholder*="Pesquise"]',
        ],
        padding: 10,
      },
      {
        selectors: [
          '[data-tour-target="favorite"]',
          'button[aria-label*="favoritos"]',
          'button[aria-label*="Favoritos"]',
        ],
        padding: 10,
      },
    ],
    bullets: [
      'Pesquise por pessoas, momentos e eventos.',
      'Use o botão com estrela para salvar seus conteúdos favoritos.',
    ],
  },
  {
    eyebrow: 'Pessoas e relacionamentos',
    title: 'Perfis, vínculos e memórias',
    description:
      'Visualize dados pessoais, histórias, curiosidades e a linha do tempo de memórias dos seus parentes.',
    icon: UserRound,
    panelPlacement: 'below',
    panelReference: 'last',
    targets: [
      {
        selectors: ['[data-tour-target="curiosities"]'],
        textIncludes: ['Curiosidades'],
        padding: 10,
      },
      {
        selectors: ['[data-family-map-central-card="true"]'],
        padding: 12,
      },
    ],
    bullets: [
      'Descubra seu grau de parentesco e encontre novos familiares.',
      'Acesse contatos, astrologia, fatos do dia do nascimento, lembranças, fotos e arquivos históricos.',
      'Consulte datas de casamento, nascimento e óbito.',
    ],
  },
  {
    eyebrow: 'Calendário e Notificações',
    title: 'Datas Importantes e Alertas',
    description:
      'Acesse estatísticas rápidas, faça perguntas sobre pessoas e memórias com apoio da IA e acompanhe eventos da família pelo Calendário.',
    icon: Sparkles,
    panelPlacement: 'below',
    targets: [
      {
        selectors: ['[data-tour-target="curiosities"]'],
        textIncludes: ['Curiosidades'],
        padding: 10,
      },
    ],
    bullets: [
      'Veja aniversários, datas de memória e comemorações.',
      'Integre o calendário ao Google Agenda.',
      'Configure preferências de alertas e salve itens favoritos.',
    ],
  },
  {
    eyebrow: 'Fórum',
    title: 'Interação entre familiares',
    description:
      'Interaja com os demais usuários criando tópicos de debate e compartilhando histórias, lembranças, dúvidas, documentos e registros importantes da família.',
    icon: MessageCircle,
    panelPlacement: 'below',
    targets: [
      {
        selectors: ['[data-tour-target="forum"]'],
        textIncludes: ['Fórum'],
        padding: 10,
      },
    ],
    bullets: [
      'Crie tópicos para organizar conversas.',
      'Compartilhe memórias e descobertas.',
      'Use o fórum como espaço de colaboração familiar.',
    ],
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
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
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(selector)
      );

      const visibleElement = elements.find(isVisibleElement);

      if (visibleElement) {
        return visibleElement;
      }
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

  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>('div, section, aside, nav, header, main')
  )
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

    if (element) {
      elements.push({
        element,
        padding: target.padding ?? 10,
      });
    }
  }

  return elements;
}

function createSpotlightRect(
  targetElements: { element: HTMLElement; padding: number }[]
): SpotlightRect | null {
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

function createSpotlightRects(
  targetElements: { element: HTMLElement; padding: number }[]
): SpotlightRect[] {
  return targetElements
    .map((target) => createSpotlightRect([target]))
    .filter((rect): rect is SpotlightRect => Boolean(rect));
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

function createCenteredPanel(width: number): PanelPosition {
  return {
    left: clamp(
      (window.innerWidth - width) / 2,
      VIEWPORT_MARGIN,
      window.innerWidth - width - VIEWPORT_MARGIN
    ),
    top: clamp(
      (window.innerHeight - PANEL_ESTIMATED_HEIGHT) / 2,
      VIEWPORT_MARGIN,
      window.innerHeight - PANEL_ESTIMATED_HEIGHT - VIEWPORT_MARGIN
    ),
    width,
  };
}

function createPanelPosition(
  spotlight: SpotlightRect | null,
  placement: TutorialStep['panelPlacement']
): PanelPosition {
  const width = Math.min(PANEL_MAX_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);

  if (!spotlight) {
    return createCenteredPanel(width);
  }

  const tryBelow = () => ({
    left: clamp(
      spotlight.left + spotlight.width / 2 - width / 2,
      VIEWPORT_MARGIN,
      window.innerWidth - width - VIEWPORT_MARGIN
    ),
    top: spotlight.bottom + PANEL_GAP,
    width,
  });

  const tryAbove = () => ({
    left: clamp(
      spotlight.left + spotlight.width / 2 - width / 2,
      VIEWPORT_MARGIN,
      window.innerWidth - width - VIEWPORT_MARGIN
    ),
    top: spotlight.top - PANEL_ESTIMATED_HEIGHT - PANEL_GAP,
    width,
  });

  const tryRight = () => ({
    left: spotlight.right + PANEL_GAP,
    top: clamp(
      spotlight.top,
      VIEWPORT_MARGIN,
      window.innerHeight - PANEL_ESTIMATED_HEIGHT - VIEWPORT_MARGIN
    ),
    width,
  });

  const tryLeft = () => ({
    left: spotlight.left - width - PANEL_GAP,
    top: clamp(
      spotlight.top,
      VIEWPORT_MARGIN,
      window.innerHeight - PANEL_ESTIMATED_HEIGHT - VIEWPORT_MARGIN
    ),
    width,
  });

  const fits = (panel: PanelPosition) => {
    return (
      panel.left >= VIEWPORT_MARGIN &&
      panel.top >= VIEWPORT_MARGIN &&
      panel.left + panel.width <= window.innerWidth - VIEWPORT_MARGIN &&
      panel.top + PANEL_ESTIMATED_HEIGHT <= window.innerHeight - VIEWPORT_MARGIN
    );
  };

  const preferredOrder: Record<NonNullable<TutorialStep['panelPlacement']>, (() => PanelPosition)[]> = {
    auto: [tryBelow, tryAbove, tryRight, tryLeft],
    below: [tryBelow, tryAbove, tryRight, tryLeft],
    above: [tryAbove, tryBelow, tryRight, tryLeft],
    right: [tryRight, tryBelow, tryAbove, tryLeft],
    left: [tryLeft, tryBelow, tryAbove, tryRight],
  };

  const order = preferredOrder[placement ?? 'auto'];

  for (const build of order) {
    const panel = build();
    if (fits(panel)) return panel;
  }

  const fallback = tryBelow();

  return {
    left: clamp(
      fallback.left,
      VIEWPORT_MARGIN,
      window.innerWidth - width - VIEWPORT_MARGIN
    ),
    top: clamp(
      fallback.top,
      VIEWPORT_MARGIN,
      window.innerHeight - PANEL_ESTIMATED_HEIGHT - VIEWPORT_MARGIN
    ),
    width,
  };
}

function SpotlightOverlay({ spotlights }: { spotlights: SpotlightRect[] }) {
  const maskId = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');

  if (spotlights.length === 0) {
    return (
      <div
        className="fixed inset-0 z-[12001] bg-slate-950/85 backdrop-blur-[1px]"
        data-tree-export-ignore="true"
      />
    );
  }

  return (
    <>
      <svg
        className="pointer-events-none fixed inset-0 z-[12001] h-screen w-screen"
        data-tree-export-ignore="true"
        aria-hidden="true"
      >
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
            boxShadow:
              '0 0 0 2px rgba(255,255,255,0.65), 0 0 34px rgba(59,130,246,0.85), inset 0 0 18px rgba(255,255,255,0.22)',
          }}
          data-tree-export-ignore="true"
        />
      ))}
    </>
  );
}

export function FirstLoginTutorial({
  open,
  onOpenChange,
  onFinish,
}: FirstLoginTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [layout, setLayout] = useState<TourLayout>(() => ({
    spotlights: [],
    panel: {
      left: VIEWPORT_MARGIN,
      top: VIEWPORT_MARGIN,
      width: PANEL_MAX_WIDTH,
    },
  }));

  const totalSteps = TUTORIAL_STEPS.length;
  const currentStep = TUTORIAL_STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const progress = useMemo(() => {
    return Math.round(((stepIndex + 1) / totalSteps) * 100);
  }, [stepIndex, totalSteps]);

  const updateLayout = useCallback(() => {
    const targetElements = resolveTargetElements(currentStep.targets ?? []);
    const spotlights = createSpotlightRects(targetElements);
    const panelSpotlight = currentStep.panelReference === 'first'
      ? spotlights[0] ?? null
      : currentStep.panelReference === 'last'
        ? spotlights[spotlights.length - 1] ?? null
        : createUnionSpotlightRect(spotlights);

    setLayout({
      spotlights,
      panel: createPanelPosition(panelSpotlight, currentStep.panelPlacement ?? 'auto'),
    });
  }, [currentStep]);

  useEffect(() => {
    if (!open) {
      setStepIndex(0);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }

      if (event.key === 'ArrowRight') {
        setStepIndex((current) => Math.min(current + 1, totalSteps - 1));
      }

      if (event.key === 'ArrowLeft') {
        setStepIndex((current) => Math.max(current - 1, 0));
      }
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

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

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
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-login-tutorial-title"
      data-tree-export-ignore="true"
    >
      <div className="pointer-events-auto fixed inset-0 z-[12000]" />
      <SpotlightOverlay spotlights={layout.spotlights} />

      <section
        className="fixed z-[12003] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl"
        style={{
          left: layout.panel.left,
          top: layout.panel.top,
          width: layout.panel.width,
        }}
      >
        <header className="relative z-10 flex items-start gap-3 border-b border-slate-100 bg-white px-4 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
            <StepIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-700">
              {currentStep.eyebrow}
            </p>
            <h2
              id="first-login-tutorial-title"
              className="mt-0.5 text-lg font-extrabold leading-tight text-slate-950"
            >
              {currentStep.title}
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Etapa {stepIndex + 1} de {totalSteps}
            </p>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar tutorial"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="h-1 bg-slate-100">
          <div
            className="h-full rounded-r-full bg-blue-600 transition-all duration-300"
            style={{ width: progress + '%' }}
          />
        </div>

        <main className="relative z-10 max-h-[44vh] overflow-y-auto bg-white px-4 py-4">
          <p className="text-sm leading-6 text-slate-700">
            {currentStep.description}
          </p>

          {currentStep.bullets && currentStep.bullets.length > 0 && (
            <ul className="mt-3 space-y-2">
              {currentStep.bullets.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-5 text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {currentStep.tip && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-950">
              <strong className="font-extrabold">Dica: </strong>
              {currentStep.tip}
            </div>
          )}
        </main>

        <footer className="relative z-10 flex flex-col gap-2 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => onOpenChange(false)}
          >
            Pular
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-none"
              onClick={goBack}
              disabled={isFirstStep}
            >
              Voltar
            </button>

            <button
              type="button"
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:flex-none"
              onClick={goNext}
            >
              {isLastStep ? 'Começar' : 'Próximo'}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
