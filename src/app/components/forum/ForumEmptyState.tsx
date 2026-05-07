import { MessageCircleQuestion } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

type ForumEmptyStateProps = {
  titulo?: string;
  descricao?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ForumEmptyState({
  titulo = 'Nenhum tópico encontrado',
  descricao = 'Ainda não há conteúdo para exibir nesta categoria ou busca.',
  actionLabel,
  onAction,
}: ForumEmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
          <MessageCircleQuestion className="h-6 w-6" />
        </span>
        <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">{descricao}</p>
        {actionLabel && onAction && (
          <Button type="button" onClick={onAction} className="mt-5">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
