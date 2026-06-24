import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const sectionLinks = [
  { href: '#numeros-da-familia', label: 'Números' },
  { href: '#hoje-na-familia', label: 'Hoje' },
  { href: '#voce-sabia', label: 'Você Sabia?' },
  { href: '#graficos', label: 'Gráficos' },
  { href: '#geracoes', label: 'Gerações' },
  { href: '#bodas', label: 'Bodas' },
  { href: '#descobertas', label: 'Descobertas' },
  { href: '#ia', label: 'IA' },
  { href: '#conexoes', label: 'Conexões' },
  { href: '#quiz', label: 'Quiz' },
  { href: '#rota', label: 'Rota' },
  { href: '#interesses', label: 'Interesses' },
  { href: '#mural', label: 'Mural' },
  { href: '#astrologia', label: 'Astrologia' },
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
    <section className="curiosidades-hero rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-8">
      <div className="min-w-0">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:text-sm">
          <Sparkles className="h-4 w-4" />
          Curiosidades da família
        </div>
        <h2 className="text-2xl font-bold leading-tight text-gray-950 sm:text-3xl md:text-4xl">
          Uma área para reunir descobertas, memórias e conexões familiares.
        </h2>
        <div className="curiosidades-section-links-wrapper relative mt-4 sm:mt-5">
          <div
            ref={linksRef}
            className="curiosidades-section-links flex flex-wrap gap-2"
            aria-label="Atalhos para áreas de curiosidades"
          >
            {sectionLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 sm:text-xs"
              >
                {link.label}
              </a>
            ))}
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
      </div>
    </section>
  );
}
