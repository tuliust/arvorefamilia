import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { CreateUserFavoritePayload, FavoriteEntityType } from '../../types';
import { isFavorite, toggleFavorite } from '../../services/favoritesService';

type FavoriteButtonProps = {
  entityType: FavoriteEntityType;
  entityId: string;
  label: string;
  description?: string;
  href?: string;
  metadata?: Record<string, unknown>;
  size?: 'sm' | 'md';
  variant?: 'icon' | 'button';
  className?: string;
  onChange?: (active: boolean) => void;
};

export function FavoriteButton({
  entityType,
  entityId,
  label,
  description,
  href,
  metadata,
  size = 'md',
  variant = 'button',
  className = '',
  onChange,
}: FavoriteButtonProps) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkFavorite() {
      const result = await isFavorite(entityType, entityId);
      if (mounted) setActive(result);
    }

    checkFavorite();

    return () => {
      mounted = false;
    };
  }, [entityType, entityId]);

  const handleClick = async () => {
    if (loading) return;

    setLoading(true);

    const payload: CreateUserFavoritePayload = {
      entity_type: entityType,
      entity_id: entityId,
      label,
      description,
      href,
      metadata,
    };

    try {
      const result = await toggleFavorite(payload);
      setActive(result.active);
      onChange?.(result.active);
    } catch (error) {
      console.error('[FavoriteButton] Erro ao alternar favorito:', error);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        className={`inline-flex shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-60 ${
          size === 'sm' ? 'h-9 w-9' : 'h-10 w-10'
        } ${active ? 'border-amber-200 bg-amber-50 text-amber-600' : ''} ${className}`}
      >
        <Star className={`${iconSize} ${active ? 'fill-current' : ''}`} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-center text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      } ${className}`}
    >
      <Star className={`${iconSize} shrink-0 ${active ? 'fill-current' : ''}`} />
      <span className="min-w-0 truncate">{loading ? 'Salvando...' : active ? 'Salvo' : 'Salvar'}</span>
    </button>
  );
}
