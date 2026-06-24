import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  HeartHandshake,
  HelpCircle,
  Lightbulb,
  MapPinned,
  MessageCircleQuestion,
  MoonStar,
  Network,
  Route,
  Sparkles,
  Star,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

type SectionLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const sectionLinks: SectionLink[] = [
  { href: '#numeros-da-familia', label: 'Números', icon: UsersRound },
  { href: '#hoje-na-familia', label: 'Hoje', icon: CalendarDays },
  { href: '#voce-sabia', label: 'Você Sabia?', icon: Lightbulb },
  { href: '#graficos', label: 'Gráficos', icon: BarChart3 },
  { href: '#geracoes', label: 'Gerações', icon: GitBranch },
  { href: '#bodas', label: 'Bodas', icon: HeartHandshake },
  { href: '#descobertas', label: 'Descobertas', icon: Sparkles },
  { href: '#ia', label: 'IA', icon: MessageCircleQuestion },
  { href: '#conexoes', label: 'Conexões', icon: Network },
  { href: '#quiz', label: 'Quiz', icon: HelpCircle },
  { href: '#rota', label: 'Rota', icon: Route },
  { href: '#interesses', label: 'Interesses', icon: Star },
  { href: '#mural', label: 'Mural', icon: MapPinned },
  { href: '#astrologia', label: 'Astrologia', icon: MoonStar },
];

export function CuriosidadesHero() {
  const linksRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = linksRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = node.scrollWidth - node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 4);
    setCanScrollRight(node.scrollLeft < maxScrollLeft - 4);
  }, []);

  useEffect(() => {
    const node = linksRef.current;
    if (!node) return;

    updateScrollState();

    node.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      node.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollLinks = (direction: 'left' | 'right') => {
    const node = linksRef.current;
    if (!node) return;

    node.scrollBy({
      left: direction === 'right' ? node.clientWidth * 0.78 : -node.clientWidth * 0.78,
      behavior: 'smooth',
    });
  };

  return (
    <nav className="curiosidades-hero" aria-label="Atalhos para áreas de curiosidades">
      <div className="curiosidades-section-links-wrapper relative">
        <div
          ref={linksRef}
          className="curiosidades-section-links flex gap-2 md:gap-3"
        >
          {sectionLinks.map((link) => {
            const Icon = link.icon;

            return (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 md:h-20 md:w-[5.15rem] md:flex-col md:gap-2 md:rounded-2xl md:border-gray-200 md:px-2 md:py-3 md:text-center md:text-xs md:leading-tight"
              >
                <Icon className="hidden h-5 w-5 shrink-0 text-blue-700 md:block" />
                <span className="truncate md:whitespace-normal md:leading-tight">{link.label}</span>
              </a>
            );
          })}
        </div>

        {canScrollLeft && (
          <button
            type="button"
            className="curiosidades-section-scroll-button curiosidades-section-scroll-button-left md:hidden"
            onClick={() => scrollLinks('left')}
            aria-label="Deslizar atalhos para a esquerda"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            className="curiosidades-section-scroll-button curiosidades-section-scroll-button-right md:hidden"
            onClick={() => scrollLinks('right')}
            aria-label="Deslizar atalhos para a direita"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </nav>
  );
}
