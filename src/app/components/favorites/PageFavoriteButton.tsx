import React from 'react';
import { getFavoritePageByPath } from '../../constants/favoritePages';
import { FavoriteButton } from './FavoriteButton';

type PageFavoriteButtonProps = {
  path: string;
  className?: string;
};

export function PageFavoriteButton({ path, className = '' }: PageFavoriteButtonProps) {
  const page = getFavoritePageByPath(path);

  if (!page) return null;

  return (
    <FavoriteButton
      entityType="page"
      entityId={page.path}
      label={page.title}
      description={page.description}
      href={page.path}
      metadata={{ source: 'page_shortcut' }}
      variant="icon"
      size="sm"
      className={className}
    />
  );
}
