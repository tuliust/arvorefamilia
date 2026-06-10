export type TreeViewMode = 'minha-arvore' | 'mapa-familiar' | 'genealogia' | 'visao-completa';

export const VIEW_MODE_TO_PATH: Record<TreeViewMode, string> = {
  'minha-arvore': '/minha-arvore',
  'mapa-familiar': '/mapa-familiar',
  genealogia: '/genealogia',
  'visao-completa': '/visao-completa',
};

export const PATH_TO_VIEW_MODE: Record<string, TreeViewMode> = {
  '/': 'minha-arvore',
  '/minha-arvore': 'minha-arvore',
  '/mapa-familiar': 'mapa-familiar',
  '/genealogia': 'genealogia',
  '/visao-completa': 'visao-completa',
};

export function getTreeViewModeFromPath(pathname: string): TreeViewMode {
  return PATH_TO_VIEW_MODE[pathname] ?? 'minha-arvore';
}

export function getPathForTreeViewMode(viewMode: TreeViewMode): string {
  return VIEW_MODE_TO_PATH[viewMode];
}
