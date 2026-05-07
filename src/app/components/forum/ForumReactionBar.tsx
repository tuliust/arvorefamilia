import { Heart, PartyPopper, Sparkles, ThumbsUp } from 'lucide-react';
import { Button } from '../ui/button';
import { ForumAlvoTipo, ForumReacaoTipo } from '../../types';

export type ForumReactionSummary = Record<ForumReacaoTipo, number>;

type ForumReactionBarProps = {
  alvoTipo: ForumAlvoTipo;
  alvoId: string;
  resumo?: Partial<ForumReactionSummary>;
  disabled?: boolean;
  onReact: (alvoTipo: ForumAlvoTipo, alvoId: string, tipo: ForumReacaoTipo) => void | Promise<void>;
};

const REACOES: Array<{ tipo: ForumReacaoTipo; label: string; icon: typeof ThumbsUp }> = [
  { tipo: 'curtir', label: 'Curtir', icon: ThumbsUp },
  { tipo: 'apoiar', label: 'Apoiar', icon: Heart },
  { tipo: 'lembrar', label: 'Lembrar', icon: Sparkles },
  { tipo: 'celebrar', label: 'Celebrar', icon: PartyPopper },
];

export function ForumReactionBar({
  alvoTipo,
  alvoId,
  resumo = {},
  disabled = false,
  onReact,
}: ForumReactionBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {REACOES.map(({ tipo, label, icon: Icone }) => (
        <Button
          key={tipo}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onReact(alvoTipo, alvoId, tipo)}
        >
          <Icone className="mr-1 h-3 w-3" />
          {label}
          {resumo[tipo] ? <span className="ml-1 text-xs text-gray-500">({resumo[tipo]})</span> : null}
        </Button>
      ))}
    </div>
  );
}
