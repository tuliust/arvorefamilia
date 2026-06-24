import { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Brain,
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Network,
  Route,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

const sectionLinks = [
  { href: '#hoje-na-familia', label: 'Hoje', icon: CalendarDays },
  { href: '#ia', label: 'IA', icon: Brain },
  { href: '#fotos', label: 'Fotos', icon: Camera },
  { href: '#numeros-da-familia', label: 'Números', icon: Users },
  { href: '#quiz', label: 'Quiz', icon: HelpCircle },
  { href: '#mural', label: 'Mural', icon: Star },
  { href: '#voce-sabia', label: 'Você Sabia', icon: Sparkles },
  { href: '#graficos', label: 'Gráficos', icon: BarChart3 },
  { href: '#geracoes', label: 'Gerações', icon: Network },
  { href: '#bodas', label: 'Relacionamentos', icon: Network },
  { href: '#rota', label: 'Rotas', icon: Route },
  { href: '#conexoes', label: 'Conexões', icon: Network },
];

function getScrollState(element: HTMLDivElement | null) {
  if (!element) {
    return {
      canScrollLeft: false,
      canScrollRight: false,
    };
  }

  const maxScrollLeft = element.scrollWidth - element.clientWidth;

  return {
    canScrollLeft: element.scrollLeft > 4,
    canScrollRight: element.scrollLeft < maxScrollLeft - 4,
  };
}

export function CuriosidadesHero() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = useState(() => getScrollState(null));

  const updateScrollState = () => {
    setScrollState(getScrollState(scrollRef.current));
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;

    updateScrollState();

    const handleScroll = () => updateScrollState();
    const handleResize = () => updateScrollState();

    element.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateScrollState)
      : null;

    resizeObserver?.observe(element);

    const frame = window.requestAnimationFrame(updateScrollState);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollNav = (direction: 'left' | 'right') => {
    const element = scrollRef.current;
    if (!element) return;

    const distance = Math.max(220, Math.round(element.clientWidth * 0.8));
    element.scrollBy({
      left: direction === 'right' ? distance : -distance,
      behavior: 'smooth',
    });
  };

  return (
    <section className="curiosidades-sticky-nav sticky top-0 z-[420] -mx-1 rounded-b-2xl bg-gray-50/95 px-1 pb-3 pt-1 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80">
      <nav aria-label="Seções de curiosidades" className="min-w-0">
        <div className="flex min-w-0 items-stretch gap-2">
          {scrollState.canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollNav('left')}
              className="curiosidades-section-scroll-button shrink-0 rounded-2xl border border-gray-200 bg-white px-2 text-blue-700 shadow-sm md:hidden"
              aria-label="Ver botões anteriores"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="curiosidades-section-links-wrapper min-w-0 flex-1 overflow-x-auto pb-1"
          >
            <div className="curiosidades-section-links grid min-w-max grid-flow-col auto-cols-[5.8rem] gap-2 xl:min-w-0 xl:grid-flow-row xl:grid-cols-12">
              {sectionLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="curiosidades-section-link flex min-h-20 min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-2 text-center text-xs font-bold leading-tight text-blue-950 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-blue-700" />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {scrollState.canScrollRight && (
            <button
              type="button"
              onClick={() => scrollNav('right')}
              className="curiosidades-section-scroll-button shrink-0 rounded-2xl border border-gray-200 bg-white px-2 text-blue-700 shadow-sm md:hidden"
              aria-label="Ver próximos botões"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </nav>
    </section>
  );
}
