import {
  BarChart3,
  Brain,
  CalendarDays,
  Camera,
  HelpCircle,
  MapPinned,
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
  { href: '#conexoes', label: 'Conexões', icon: MapPinned },
];

export function CuriosidadesHero() {
  return (
    <section className="curiosidades-sticky-nav sticky top-0 z-[420] -mx-1 rounded-b-2xl bg-gray-50/95 px-1 pb-3 pt-1 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80">
      <nav aria-label="Seções de curiosidades" className="min-w-0">
        <div className="curiosidades-section-links-wrapper min-w-0 overflow-x-auto pb-1">
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
                  <span className="line-clamp-2">{link.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </nav>
    </section>
  );
}
