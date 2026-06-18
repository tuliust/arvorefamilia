import { Anchor } from 'lucide-react';

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

export function CuriosidadesSectionNav() {
  return (
    <nav
      aria-label="Navegação interna de curiosidades"
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Anchor className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-bold text-gray-950">Explore a página</p>
          <p className="text-xs text-gray-500">Atalhos para navegar pelas curiosidades da família.</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {sectionLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
