import { BookOpen, CalendarDays, HelpCircle, Image, LucideIcon, MessageCircle, TreePine } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { ForumCategoria } from '../../types';

const ICONES: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  'calendar-days': CalendarDays,
  'help-circle': HelpCircle,
  image: Image,
  'tree-pine': TreePine,
};

const CORES: Record<string, string> = {
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
};

type ForumCategoryCardProps = {
  categoria: ForumCategoria;
  selecionada?: boolean;
  totalTopicos?: number;
  onClick?: (categoria: ForumCategoria) => void;
};

export function ForumCategoryCard({
  categoria,
  selecionada = false,
  totalTopicos,
  onClick,
}: ForumCategoryCardProps) {
  const Icone = categoria.icone ? ICONES[categoria.icone] ?? MessageCircle : MessageCircle;
  const cor = categoria.cor_token ? CORES[categoria.cor_token] ?? CORES.blue : CORES.blue;
  const total = totalTopicos ?? categoria.total_topicos;
  const conteudo = (
    <Card className={`h-full transition ${selecionada ? 'border-blue-500 ring-2 ring-blue-100' : 'hover:border-blue-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${cor}`}>
            <Icone className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-gray-900">{categoria.nome}</h3>
              {typeof total === 'number' && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {total}
                </span>
              )}
            </div>
            {categoria.descricao && <p className="mt-1 text-sm leading-5 text-gray-500">{categoria.descricao}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!onClick) return conteudo;

  return (
    <button type="button" onClick={() => onClick(categoria)} className="block w-full text-left">
      {conteudo}
    </button>
  );
}
