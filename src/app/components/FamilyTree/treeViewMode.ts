export type TreeViewMode = 'minha-arvore' | 'mapa-familiar' | 'mapa-horizontal' | 'genealogia' | 'visao-completa';

export const VIEW_MODE_TO_PATH: Record<TreeViewMode, string> = {
  'minha-arvore': '/minha-arvore',
  'mapa-familiar': '/mapa-familiar',
  'mapa-horizontal': '/mapa-horizontal',
  genealogia: '/genealogia',
  'visao-completa': '/mapa-horizontal',
};

export const PATH_TO_VIEW_MODE: Record<string, TreeViewMode> = {
  '/': 'mapa-familiar',
  '/minha-arvore': 'minha-arvore',
  '/mapa-familiar': 'mapa-familiar',
  '/mapa-horizontal': 'visao-completa',
  '/genealogia': 'genealogia',
  '/visao-completa': 'visao-completa',
};

export function getTreeViewModeFromPath(pathname: string): TreeViewMode {
  return PATH_TO_VIEW_MODE[pathname] ?? 'mapa-familiar';
}

export function getPathForTreeViewMode(viewMode: TreeViewMode): string {
  return VIEW_MODE_TO_PATH[viewMode];
}
