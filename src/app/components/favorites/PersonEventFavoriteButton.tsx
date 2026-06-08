import React from 'react';
import { PersonEvent } from '../../types';
import { FavoriteButton } from './FavoriteButton';

type PersonEventFavoriteButtonProps = {
  evento: PersonEvent;
  className?: string;
};

function getPersonEventDescription(evento: PersonEvent) {
  return evento.descricao || evento.local || evento.data_evento || 'Evento pessoal';
}

export function PersonEventFavoriteButton({ evento, className = '' }: PersonEventFavoriteButtonProps) {
  return (
    <FavoriteButton
      entityType="person_event"
      entityId={evento.id}
      label={evento.titulo || 'Evento pessoal'}
      description={getPersonEventDescription(evento)}
      href={`/pessoa/${evento.pessoa_id}`}
      metadata={{
        event_type: evento.tipo,
        data_evento: evento.data_evento ?? null,
        local: evento.local ?? null,
        pessoa_id: evento.pessoa_id,
      }}
      variant="icon"
      size="sm"
      className={className}
    />
  );
}
