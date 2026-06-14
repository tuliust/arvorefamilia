export type TreeViewMode =
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal';

export const VIEW_MODE_TO_PATH: Record<TreeViewMode, string> = {
  'mapa-familiar': '/mapa-familiar',
  'mapa-familiar-horizontal': '/mapa-familiar-horizontal',
};

export const PATH_TO_VIEW_MODE: Record<string, TreeViewMode> = {
  '/': 'mapa-familiar',
  '/mapa-familiar': 'mapa-familiar',
  '/mapa-familiar-horizontal': 'mapa-familiar-horizontal',
};

export function getTreeViewModeFromPath(pathname: string): TreeViewMode {
  return PATH_TO_VIEW_MODE[pathname] ?? 'mapa-familiar';
}

export function getPathForTreeViewMode(viewMode: TreeViewMode): string {
  return VIEW_MODE_TO_PATH[viewMode];
}
