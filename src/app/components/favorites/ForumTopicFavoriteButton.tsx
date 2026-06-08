import React from 'react';
import { ForumTopico } from '../../types';
import { FavoriteButton } from './FavoriteButton';

type ForumTopicFavoriteButtonProps = {
  topico: ForumTopico;
  className?: string;
};

function getForumTopicDescription(topico: ForumTopico) {
  return topico.conteudo || topico.categoria?.nome || 'Tópico do fórum';
}

export function ForumTopicFavoriteButton({ topico, className = '' }: ForumTopicFavoriteButtonProps) {
  return (
    <FavoriteButton
      entityType="forum_topic"
      entityId={topico.id}
      label={topico.titulo || 'Tópico do fórum'}
      description={getForumTopicDescription(topico)}
      href={`/forum/topico/${topico.id}`}
      metadata={{
        tipo: topico.tipo,
        status: topico.status,
        categoria_id: topico.categoria_id ?? null,
        pessoa_relacionada_id: topico.pessoa_relacionada_id ?? null,
      }}
      variant="icon"
      size="sm"
      className={className}
    />
  );
}
