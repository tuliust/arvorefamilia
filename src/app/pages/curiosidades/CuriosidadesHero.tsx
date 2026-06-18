import { Sparkles } from 'lucide-react';

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
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-8">
      <div className="min-w-0">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:text-sm">
          <Sparkles className="h-4 w-4" />
          Curiosidades da família
        </div>
        <h2 className="text-2xl font-bold leading-tight text-gray-950 sm:text-3xl md:text-4xl">
          Uma área para reunir descobertas, memórias e conexões familiares.
        </h2>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-5" aria-label="Atalhos para áreas de curiosidades">
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
      </div>
    </section>
  );
}
