import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Download,
  GitBranch,
  LayoutDashboard,
  MessageCircle,
  Network,
  PanelLeftClose,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRound,
  Users,
  X,
  ZoomIn,
} from 'lucide-react';

type TourPlacement =
  | 'center'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

type ArrowPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'right-center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'left-center'
  | 'none';

type TutorialStep = {
  title: string;
  eyebrow: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  bullets?: string[];
  tip?: string;
  placement: TourPlacement;
  arrow: ArrowPosition;
};

type FirstLoginTutorialProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: () => void;
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    eyebrow: 'Início',
    title: 'Bem-vindo ao Mapa Familiar',
    description:
      'Este guia mostra os principais recursos da plataforma: árvore, busca, curiosidades, fórum, calendário, favoritos e perfil.',
    icon: Network,
    placement: 'center',
    arrow: 'none',
    tip: 'Ele aparece apenas no primeiro acesso, mas pode ser reaberto usando ?tutorial=1 na URL.',
  },
  {
    eyebrow: 'Header',
    title: 'Menu superior',
    description:
      'Use o topo da tela para alternar entre Árvore geral, Mapa Familiar, Calendário, Favoritos, Notificações e Perfil.',
    icon: LayoutDashboard,
    placement: 'top-right',
    arrow: 'top-right',
    bullets: [
      'Mapa Familiar abre a árvore principal.',
      'Calendário reúne datas da família.',
      'Avatar abre os atalhos da conta.',
    ],
  },
  {
    eyebrow: 'Visualização',
    title: 'Visualizar como outra pessoa',
    description:
      'No seletor “Sua view padrão”, você pode escolher outro familiar e ver a árvore a partir da perspectiva dele.',
    icon: Users,
    placement: 'top-left',
    arrow: 'top-left',
    tip: 'Útil para entender conexões familiares por outro ponto de partida.',
  },
  {
    eyebrow: 'Busca',
    title: 'Busca geral',
    description:
      'Use a busca para encontrar pessoas, páginas, tópicos do fórum ou conteúdos salvos.',
    icon: Search,
    placement: 'top-right',
    arrow: 'top-right',
    bullets: [
      'Na árvore, pode aparecer como ícone.',
      'Em páginas internas, pode aparecer como campo de busca.',
    ],
  },
  {
    eyebrow: 'Painel',
    title: 'Colapsar painel',
    description:
      'O botão de recolher painel aumenta a área útil da tela e melhora a visualização dos cards da árvore.',
    icon: PanelLeftClose,
    placement: 'middle-left',
    arrow: 'left-center',
  },
  {
    eyebrow: 'Navegação da árvore',
    title: 'Zoom e arraste',
    description:
      'Aproxime ou afaste a árvore pelos botões de zoom ou atalhos Ctrl + e Ctrl -. Também é possível arrastar a visualização.',
    icon: ZoomIn,
    placement: 'middle-right',
    arrow: 'right-center',
  },
  {
    eyebrow: 'Cards',
    title: 'Cards de pessoas',
    description:
      'Clique em um card para visualizar dados, vínculos e informações da pessoa selecionada.',
    icon: UserRound,
    placement: 'middle-right',
    arrow: 'right-center',
  },
  {
    eyebrow: 'Grupos',
    title: 'Grupos familiares',
    description:
      'Cards de tataravós, bisavós e outros grupos exibem contagem de parentes. Clique para ocultar ou exibir familiares.',
    icon: GitBranch,
    placement: 'middle-left',
    arrow: 'left-center',
  },
  {
    eyebrow: 'Filtros',
    title: 'Vivos e falecidos',
    description:
      'Use os filtros Vivo e Falecido para exibir ou ocultar pessoas e simplificar a visualização da árvore.',
    icon: SlidersHorizontal,
    placement: 'bottom-left',
    arrow: 'bottom-left',
  },
  {
    eyebrow: 'Exportação',
    title: 'PDF, imagem e área de exportação',
    description:
      'Exporte a árvore em PDF ou imagem. A área de exportação permite selecionar exatamente qual parte será salva.',
    icon: Download,
    placement: 'bottom-right',
    arrow: 'bottom-right',
  },
  {
    eyebrow: 'Curiosidades',
    title: 'Curiosidades da família',
    description:
      'Acesse estatísticas rápidas, perguntas sobre pessoas, IA e conexões familiares.',
    icon: Sparkles,
    placement: 'top-center',
    arrow: 'top-center',
    bullets: [
      'Você Sabia? mostra dados rápidos.',
      'Pergunte à IA permite consultar a árvore.',
      'Conexão calcula parentesco entre pessoas.',
    ],
  },
  {
    eyebrow: 'Fórum',
    title: 'Fórum da Família',
    description:
      'Espaço para dúvidas, memórias, documentos e eventos familiares.',
    icon: MessageCircle,
    placement: 'top-right',
    arrow: 'top-right',
    bullets: [
      'Use a busca para localizar tópicos.',
      'Clique em Criar tópico para iniciar uma conversa.',
    ],
  },
  {
    eyebrow: 'Calendário',
    title: 'Datas importantes',
    description:
      'O calendário reúne aniversários, casamentos, falecimentos, eventos históricos e reuniões.',
    icon: CalendarDays,
    placement: 'middle-right',
    arrow: 'right-center',
    tip: 'Também é possível conectar ao Google Agenda.',
  },
  {
    eyebrow: 'Favoritos',
    title: 'Conteúdos salvos',
    description:
      'Use a estrela para salvar páginas, pessoas e tópicos do fórum para consultar depois.',
    icon: Star,
    placement: 'top-right',
    arrow: 'top-right',
  },
  {
    eyebrow: 'Notificações',
    title: 'Avisos da família',
    description:
      'As notificações mostram novidades, interações, eventos e atualizações importantes.',
    icon: Bell,
    placement: 'top-right',
    arrow: 'top-right',
  },
  {
    eyebrow: 'Perfil',
    title: 'Menu do avatar',
    description:
      'No avatar ficam os atalhos para Home, Atualizar perfil, Fórum, Calendário, Favoritos, Notificações, Painel Admin e Sair.',
    icon: CircleUserRound,
    placement: 'top-right',
    arrow: 'top-right',
  },
  {
    eyebrow: 'Final',
    title: 'Pronto para explorar',
    description:
      'Agora você já conhece os principais controles da plataforma. Explore a árvore, clique nos cards e use os atalhos do topo.',
    icon: CheckCircle2,
    placement: 'center',
    arrow: 'none',
  },
];

const placementClassName: Record<TourPlacement, string> = {
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  'top-left': 'left-4 top-24 sm:left-8 sm:top-24',
  'top-center': 'left-1/2 top-24 -translate-x-1/2',
  'top-right': 'right-4 top-24 sm:right-8 sm:top-24',
  'middle-left': 'left-4 top-1/2 -translate-y-1/2 sm:left-8',
  'middle-right': 'right-4 top-1/2 -translate-y-1/2 sm:right-8',
  'bottom-left': 'bottom-8 left-4 sm:left-8',
  'bottom-center': 'bottom-8 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-8 right-4 sm:right-8',
};

const arrowClassName: Record<ArrowPosition, string> = {
  none: 'hidden',
  'top-left':
    'absolute -top-3 left-8 h-6 w-6 rotate-45 border-l border-t border-slate-200 bg-white',
  'top-center':
    'absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 border-l border-t border-slate-200 bg-white',
  'top-right':
    'absolute -top-3 right-8 h-6 w-6 rotate-45 border-l border-t border-slate-200 bg-white',
  'right-center':
    'absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rotate-45 border-r border-t border-slate-200 bg-white',
  'bottom-left':
    'absolute -bottom-3 left-8 h-6 w-6 rotate-45 border-b border-r border-slate-200 bg-white',
  'bottom-center':
    'absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 border-b border-r border-slate-200 bg-white',
  'bottom-right':
    'absolute -bottom-3 right-8 h-6 w-6 rotate-45 border-b border-r border-slate-200 bg-white',
  'left-center':
    'absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rotate-45 border-b border-l border-slate-200 bg-white',
};

export function FirstLoginTutorial({
  open,
  onOpenChange,
  onFinish,
}: FirstLoginTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);

  const totalSteps = TUTORIAL_STEPS.length;
  const currentStep = TUTORIAL_STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const progress = useMemo(() => {
    return Math.round(((stepIndex + 1) / totalSteps) * 100);
  }, [stepIndex, totalSteps]);

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
      className="fixed inset-0 z-[12000] bg-slate-950/80 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-login-tutorial-title"
      data-tree-export-ignore="true"
    >
      <section
        className={
          'absolute z-[12001] w-[calc(100vw-2rem)] max-w-[420px] rounded-2xl border border-slate-200 bg-white shadow-2xl ' +
          placementClassName[currentStep.placement]
        }
      >
        <span className={arrowClassName[currentStep.arrow]} aria-hidden="true" />

        <header className="relative z-10 flex items-start gap-3 border-b border-slate-100 px-4 py-4">
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

        <main className="relative z-10 max-h-[48vh] overflow-y-auto px-4 py-4">
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
