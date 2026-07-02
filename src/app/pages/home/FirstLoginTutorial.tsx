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
  targets?: TutorialTarget[];
  panelPlacement?: 'auto' | 'right' | 'left' | 'above' | 'below' | 'center';
};

type FirstLoginTutorialProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: () => void;
};

type SpotlightRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  radius: number;
};

type PanelPosition = {
  left: number;
  top: number;
  width: number;
};

const PANEL_WIDTH = 430;
const MOBILE_PANEL_WIDTH = 330;
const PANEL_ESTIMATED_HEIGHT = 330;
const VIEWPORT_MARGIN = 14;
const SPOTLIGHT_RADIUS = 18;
const DEFAULT_TARGET_PADDING = 10;
const STEP_STORAGE_KEY = 'arvorefamilia:first-login-tutorial-step:v1';
const MOBILE_BREAKPOINT_QUERY = '(max-width: 767px)';

const DESKTOP_STEPS: TutorialStep[] = [
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Aqui é o seu menu',
    icon: Network,
    panelPlacement: 'left',
    targets: [
      { selectors: ['[data-tour-target="alerts"]'], padding: 10 },
      { selectors: ['[data-tour-target="search"]'], padding: 10 },
      { selectors: ['[data-tour-target="profile-menu"]'], padding: 10 },
    ],
    bullets: [
      'Não perca datas importantes e avisos na área de Alertas e configure suas preferências de notificações.',
      'Utilize o botão de busca para procurar por pessoas, páginas do site ou histórias.',
      'No menu, tenha acesso rápido a todas as áreas do site.',
      'Edite e complemente seus dados, altere sua foto do perfil ou sua senha de acesso.',
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
      'Mude a paleta de cores de exibição do mapa familiar.',
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
      'Use os filtros para visualizar apenas pessoas vivas ou falecidas.',
      'Ative o botão de cônjuges para exibir os cards de pessoas que se juntaram à família.',
      'O botão de Pet faz aparecer na árvore os animais de estimação cadastrados.',
    ],
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Perfis, vínculos e memórias',
    icon: UserRound,
    panelPlacement: 'auto',
    targets: [{ selectors: ['[data-family-map-central-card="true"]', '[data-family-map-mobile-card="true"]'], padding: 12 }],
    bullets: [
      'Clique nos cards para acessar informações pessoais, biografia e contatos de familiares.',
      'Descubra seu grau de parentesco e a linha genealógica que conecta vocês.',
      'Acesse arquivos históricos, certidões e uma linha do tempo de memórias.',
      'Confira também fatos do dia do nascimento desta pessoa.',
    ],
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Inteligência artificial e datas importantes',
    icon: Sparkles,
    panelPlacement: 'below',
    targets: [
      { selectors: ['[data-tour-target="curiosities"]'], padding: 10 },
      { selectors: ['[data-tour-target="calendar"]'], padding: 10 },
    ],
    bullets: [
      'Em Curiosidades, veja fatos, números e conexões da família.',
      'Faça perguntas para a inteligência artificial sobre você e seus familiares.',
      'Veja aniversários, datas de memória e comemorações no Calendário.',
    ],
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Guarde os seus destaques',
    icon: Star,
    panelPlacement: 'auto',
    targets: [
      { selectors: ['[data-tour-target="favorites"]'], padding: 10 },
      { selectors: ['[data-tour-target="tree-favorite"]'], padding: 10 },
    ],
    bullets: [
      'Acesse páginas, arquivos e dados marcados como importantes.',
      'Use o botão de estrela nas páginas do site para guardar o conteúdo que desejar.',
    ],
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Interação entre familiares',
    icon: MessageCircle,
    panelPlacement: 'below',
    targets: [{ selectors: ['[data-tour-target="forum"]'], textIncludes: ['Fórum'], padding: 10 }],
    bullets: [
      'Interaja criando tópicos de debate e compartilhando histórias, lembranças e dúvidas.',
      'Responda mensagens e engaje com curtidas e outras reações.',
    ],
  },
];

const MOBILE_STEPS: TutorialStep[] = [
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Busca e perfil',
    icon: UserRound,
    panelPlacement: 'below',
    targets: [
      { selectors: ['[data-tour-target="search"]'], padding: 8 },
      { selectors: ['[data-tour-target="profile-menu"]'], padding: 8 },
    ],
    description: 'Use a busca para encontrar pessoas e páginas. Edite seus dados, foto do perfil e preferências.',
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Controles da árvore',
    icon: Eye,
    panelPlacement: 'below',
    targets: [{ selectors: ['[data-tour-target="mobile-tree-action-bar"]', '[data-mobile-family-map-toolbar="true"]'], padding: 8 }],
    description: 'Escolha o modo de visualização, ajuste as cores da árvore e salve ou imprima o mapa.',
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Cards de pessoas',
    icon: UserRound,
    panelPlacement: 'below',
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
    description: 'Veja conexões, faça perguntas para a inteligência artificial e acompanhe datas importantes.',
  },
  {
    eyebrow: 'GUIA RÁPIDO',
    title: 'Fórum da família',
    icon: MessageCircle,
    panelPlacement: 'above',
    targets: [{ selectors: ['[data-tour-target="forum"]'], textIncludes: ['Fórum'], padding: 8 }],
    description: 'Crie tópicos, comente e reaja a publicações sobre lembranças, histórias ou dúvidas.',
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

  return rect.width > 0
    && rect.height > 0
    && style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.opacity !== '0';
}

function getElementSearchText(element: HTMLElement) {
  const input = element instanceof HTMLInputElement ? element.placeholder : '';

  return normalizeText([
    element.textContent ?? '',
    element.getAttribute('aria-label') ?? '',
    element.getAttribute('title') ?? '',
    input,
  ].join(' '));
}

function queryVisibleElement(selectors: string[] = []) {
  for (const selector of selectors) {
    try {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
      const visibleElement = elements.find(isVisibleElement);
      if (visibleElement) return visibleElement;
    } catch {
      // Ignora seletores inválidos sem quebrar a rota.
    }
  }

  return null;
}

function queryVisibleElementByText(textIncludes: string[] = []) {
  if (textIncludes.length === 0) return null;

  const normalizedTerms = textIncludes.map(normalizeText);
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>('header, nav, aside, button, a, input, section, div, [role="button"], [aria-label], [title]')
  );

  return candidates.find((element) => {
    if (!isVisibleElement(element)) return false;
    const text = getElementSearchText(element);
    return normalizedTerms.every((term) => text.includes(term));
  }) ?? null;
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
  return queryVisibleElement(target.selectors)
    ?? queryVisibleContainerByText(target.containerTextIncludes)
    ?? queryVisibleElementByText(target.textIncludes);
}

function getSpotlightRects(step: TutorialStep): SpotlightRect[] {
  if (typeof window === 'undefined') return [];

  const elements = (step.targets ?? [])
    .map((target) => {
      const element = resolveSingleTarget(target);
      if (!element) return null;

      const rect = element.getBoundingClientRect();
      const padding = target.padding ?? DEFAULT_TARGET_PADDING;

      return {
        left: clamp(rect.left - padding, 0, window.innerWidth),
        top: clamp(rect.top - padding, 0, window.innerHeight),
        width: Math.min(rect.width + padding * 2, window.innerWidth),
        height: Math.min(rect.height + padding * 2, window.innerHeight),
        radius: SPOTLIGHT_RADIUS,
      };
    })
    .filter(Boolean) as SpotlightRect[];

  return elements;
}

function getReferenceRect(rects: SpotlightRect[]) {
  if (rects.length === 0) return null;

  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.left + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.top + rect.height));

  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

function getPanelPosition(step: TutorialStep, rects: SpotlightRect[], isMobile: boolean): PanelPosition {
  const width = Math.min(isMobile ? MOBILE_PANEL_WIDTH : PANEL_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
  const reference = getReferenceRect(rects);

  if (!reference) {
    return {
      left: (window.innerWidth - width) / 2,
      top: Math.max(VIEWPORT_MARGIN, window.innerHeight * 0.18),
      width,
    };
  }

  const placement = isMobile ? 'below' : step.panelPlacement ?? 'auto';
  const gap = isMobile ? 12 : 18;
  const panelHeight = isMobile ? 245 : PANEL_ESTIMATED_HEIGHT;
  const centeredLeft = reference.left + reference.width / 2 - width / 2;

  let left = centeredLeft;
  let top = reference.bottom + gap;

  if (placement === 'right') {
    left = reference.right + gap;
    top = reference.top;
  } else if (placement === 'left') {
    left = reference.left - width - gap;
    top = reference.top;
  } else if (placement === 'above') {
    left = centeredLeft;
    top = reference.top - panelHeight - gap;
  } else if (placement === 'center') {
    left = (window.innerWidth - width) / 2;
    top = (window.innerHeight - panelHeight) / 2;
  } else if (placement === 'auto') {
    const hasRoomRight = reference.right + gap + width <= window.innerWidth - VIEWPORT_MARGIN;
    const hasRoomLeft = reference.left - gap - width >= VIEWPORT_MARGIN;
    const hasRoomBelow = reference.bottom + gap + panelHeight <= window.innerHeight - VIEWPORT_MARGIN;

    if (hasRoomRight) {
      left = reference.right + gap;
      top = reference.top;
    } else if (hasRoomLeft) {
      left = reference.left - width - gap;
      top = reference.top;
    } else if (!hasRoomBelow) {
      left = centeredLeft;
      top = reference.top - panelHeight - gap;
    }
  }

  return {
    left: clamp(left, VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN),
    top: clamp(top, VIEWPORT_MARGIN, window.innerHeight - panelHeight - VIEWPORT_MARGIN),
    width,
  };
}

function readStoredStepIndex(maxIndex: number) {
  if (typeof window === 'undefined') return 0;

  const raw = window.sessionStorage.getItem(STEP_STORAGE_KEY);
  const parsed = Number(raw);

  if (!Number.isInteger(parsed)) return 0;
  return clamp(parsed, 0, maxIndex);
}

function storeStepIndex(index: number) {
  try {
    window.sessionStorage.setItem(STEP_STORAGE_KEY, String(index));
  } catch {
    // Sem persistência em ambientes que bloqueiam storage.
  }
}

function clearStoredStepIndex() {
  try {
    window.sessionStorage.removeItem(STEP_STORAGE_KEY);
  } catch {
    // noop
  }
}

export function FirstLoginTutorial({ open, onOpenChange, onFinish }: FirstLoginTutorialProps) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
  });
  const steps = useMemo(() => (isMobile ? MOBILE_STEPS : DESKTOP_STEPS), [isMobile]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlights, setSpotlights] = useState<SpotlightRect[]>([]);
  const [panelPosition, setPanelPosition] = useState<PanelPosition>({
    left: VIEWPORT_MARGIN,
    top: VIEWPORT_MARGIN,
    width: PANEL_WIDTH,
  });

  const currentStep = steps[currentStepIndex] ?? steps[0];
  const isLastStep = currentStepIndex >= steps.length - 1;

  const updateLayout = useCallback(() => {
    if (!open || !currentStep) return;

    try {
      const nextSpotlights = getSpotlightRects(currentStep);
      setSpotlights(nextSpotlights);
      setPanelPosition(getPanelPosition(currentStep, nextSpotlights, isMobile));
    } catch (error) {
      console.error('[FirstLoginTutorial] Falha ao calcular layout do tour:', error);
      setSpotlights([]);
      setPanelPosition(getPanelPosition({ ...currentStep, panelPlacement: 'center' }, [], isMobile));
    }
  }, [currentStep, isMobile, open]);

  useEffect(() => {
    if (!open) return;

    const nextIndex = readStoredStepIndex(steps.length - 1);
    setCurrentStepIndex(nextIndex);
  }, [open, steps.length]);

  useEffect(() => {
    if (!open) return;
    storeStepIndex(currentStepIndex);
  }, [currentStepIndex, open]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const handleChange = () => setIsMobile(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener?.('change', handleChange);

    return () => {
      mediaQuery.removeEventListener?.('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    updateLayout();
    const resizeHandler = () => updateLayout();
    const scrollHandler = () => updateLayout();
    const timeoutIds = [80, 250, 600].map((delay) => window.setTimeout(updateLayout, delay));

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('scroll', scrollHandler, true);

    return () => {
      timeoutIds.forEach(window.clearTimeout);
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('scroll', scrollHandler, true);
    };
  }, [currentStepIndex, open, updateLayout]);

  const goToPreviousStep = () => {
    setCurrentStepIndex((current) => Math.max(0, current - 1));
  };

  const goToNextStep = () => {
    if (isLastStep) {
      clearStoredStepIndex();
      onFinish();
      onOpenChange(false);
      return;
    }

    setCurrentStepIndex((current) => Math.min(steps.length - 1, current + 1));
  };

  const closeTutorial = () => {
    onOpenChange(false);
  };

  if (!open || !currentStep) return null;

  const StepIcon = currentStep.icon;

  return (
    <div
      data-first-login-tutorial="true"
      data-first-login-tutorial-step={currentStep.title}
      className="fixed inset-0 z-[12000]"
      role="dialog"
      aria-modal="true"
      aria-label="Guia rápido da árvore familiar"
    >
      <svg className="pointer-events-none fixed inset-0 z-[12001] h-full w-full" aria-hidden="true">
        <defs>
          <mask id="first-login-tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlights.map((rect, index) => (
              <rect
                key={`spotlight-mask-${index}`}
                x={rect.left}
                y={rect.top}
                width={rect.width}
                height={rect.height}
                rx={rect.radius}
                ry={rect.radius}
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(15,23,42,0.62)" mask="url(#first-login-tutorial-mask)" />
      </svg>

      {spotlights.map((rect, index) => (
        <div
          key={`spotlight-border-${index}`}
          className="pointer-events-none fixed z-[12002] rounded-[18px] ring-2 ring-blue-400 ring-offset-2 ring-offset-white/60"
          style={{
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }}
        />
      ))}

      <section
        className="fixed z-[12003] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-blue-100 bg-white p-4 text-gray-900 shadow-2xl sm:p-5"
        style={{
          left: panelPosition.left,
          top: panelPosition.top,
          width: panelPosition.width,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <StepIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{currentStep.eyebrow}</p>
              <h2 className="mt-1 break-words text-lg font-bold leading-tight text-gray-950">{currentStep.title}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeTutorial}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Fechar tutorial"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {currentStep.description && (
          <p className="mt-4 text-sm leading-6 text-gray-600">{currentStep.description}</p>
        )}

        {currentStep.bullets && currentStep.bullets.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-700">
            {currentStep.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {spotlights.length === 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Esta etapa não encontrou o elemento destacado na tela atual. Você pode continuar o tour normalmente.
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-gray-500">
            {currentStepIndex + 1} de {steps.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={goToNextStep}
              className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {isLastStep ? 'Concluir' : 'Próximo'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
