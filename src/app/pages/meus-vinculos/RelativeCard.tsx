import React from 'react';
import { PawPrint, Trash2, Undo2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { Pessoa } from '../../types';
import { getInitials } from '../../utils/personFields';
import {
  canRequestProfileControl,
  getPersonSecondaryDetails,
  getRelationshipCardClassName,
  getRelationshipCardLabel,
  getRelationshipStatusBadgeConfig,
  isPetPerson,
} from './meusVinculosUtils';
import { RelationshipGroupKey, RelationshipReviewStatus } from './types';

type RelativeCardProps = {
  person: Pessoa;
  relationshipGroup?: RelationshipGroupKey;
  relationshipLabel?: string;
  status: RelationshipReviewStatus;
  avatarSrc?: string | null;
  meta?: Array<{ label: string; value: string }>;
  helperText?: string;
  canRemove?: boolean;
  canRequestControl?: boolean;
  ownPersonId?: string;
  hasAuthUser?: boolean;
  isMother?: boolean;
  onRemove?: () => void;
  onUndoRemove?: () => void;
  onCancelAddition?: () => void;
  onRequestControl?: () => void;
  children?: React.ReactNode;
};

function PersonAvatar({ person, avatarSrc }: { person: Pessoa; avatarSrc?: string | null }) {
  const photo = String(avatarSrc || person.foto_principal_url || '').trim();
  const pet = isPetPerson(person);

  return (
    <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
      {photo ? (
        <img src={photo} alt={person.nome_completo} className="h-full w-full object-cover" />
      ) : pet ? (
        <span className="inline-flex h-full w-full items-center justify-center">
          <PawPrint className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : (
        <span className="inline-flex h-full w-full items-center justify-center text-sm font-semibold">
          {getInitials(person.nome_completo)}
        </span>
      )}
    </div>
  );
}

export function RelativeCard({
  person,
  relationshipGroup,
  relationshipLabel,
  status,
  avatarSrc,
  meta = [],
  helperText,
  canRemove = true,
  canRequestControl = false,
  ownPersonId,
  hasAuthUser = false,
  isMother = false,
  onRemove,
  onUndoRemove,
  onCancelAddition,
  onRequestControl,
  children,
}: RelativeCardProps) {
  const badge = getRelationshipStatusBadgeConfig(status, hasAuthUser);
  const secondaryDetails = getPersonSecondaryDetails(person, {
    genderHint: isMother ? 'mulher' : relationshipGroup === 'pais' ? 'homem' : undefined,
  });
  const relationLabel = relationshipLabel ?? (relationshipGroup ? getRelationshipCardLabel(relationshipGroup, isMother) : '');
  const showRequestControl = canRequestControl && status !== 'control_pending' && canRequestProfileControl(person, ownPersonId, false, status);
  const baseHelperText = helperText
    ?? (status === 'control_pending'
      ? 'Você solicitou permissão para administrar este perfil. A solicitação será avaliada antes de liberar edição.'
      : status === 'removed_pending'
        ? 'Você solicitou a remoção deste vínculo. A alteração será avaliada antes de sair da árvore.'
        : (status === 'added_pending' || status === 'edited_pending')
          ? 'Esta alteração será revisada antes de aparecer definitivamente na árvore.'
          : undefined);

  const actionButton = status === 'removed_pending'
    ? (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 border-red-200 text-red-700 hover:bg-red-50"
        onClick={onUndoRemove}
        aria-label="Desfazer solicitação de remoção"
        title="Desfazer solicitação de remoção"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
    )
    : canRemove && (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-red-700 hover:bg-red-50"
        onClick={status === 'added_pending' ? onCancelAddition : onRemove}
        aria-label={status === 'added_pending' ? 'Cancelar adição' : 'Solicitar remoção'}
        title={status === 'added_pending' ? 'Cancelar adição' : 'Solicitar remoção'}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    );

  return (
    <article className={cn('min-w-0 rounded-xl border p-4 shadow-sm', getRelationshipCardClassName(status))}>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-3">
            <PersonAvatar person={person} avatarSrc={avatarSrc} />
            <div className="min-w-0">
              <h4 className="min-w-0 break-words text-base font-semibold leading-snug text-gray-950">
                {person.nome_completo}
              </h4>
              {relationLabel && <p className="mt-1 text-sm font-medium text-gray-600">{relationLabel}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <span className={cn('inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold', badge.className)}>
              {badge.label}
            </span>
            {actionButton}
          </div>
        </div>

        {secondaryDetails.length > 0 && (
          <div className="flex min-w-0 flex-wrap gap-2 text-sm text-gray-600">
            {secondaryDetails.map((detail) => (
              <span key={detail} className="inline-flex max-w-full items-center gap-1 rounded-md bg-white/70 px-2 py-1 ring-1 ring-gray-200">
                <span className="min-w-0 break-words">{detail}</span>
              </span>
            ))}
          </div>
        )}

        {meta.length > 0 && (
          <div className="flex min-w-0 flex-wrap gap-2 text-sm text-gray-600">
            {meta.map((item) => (
              <span key={`${item.label}-${item.value}`} className="inline-flex max-w-full items-center gap-2 rounded-md bg-white/70 px-2 py-1 ring-1 ring-gray-200">
                <span className="font-medium text-gray-500">{item.label}:</span>
                <span className="min-w-0 break-words text-gray-900">{item.value}</span>
              </span>
            ))}
          </div>
        )}

        {children}

        {baseHelperText && (
          <p className={cn(
            'rounded-lg px-3 py-2 text-sm',
            status === 'control_pending'
              ? 'border border-blue-200 bg-blue-100/70 text-blue-900'
              : status === 'removed_pending'
                ? 'border border-red-200 bg-red-100/70 text-red-900'
                : 'border border-amber-200 bg-amber-100/60 text-amber-900'
          )}>
            {baseHelperText}
          </p>
        )}

        {showRequestControl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 sm:w-auto"
            onClick={onRequestControl}
          >
            Solicitar controle do perfil
          </Button>
        )}
      </div>
    </article>
  );
}
