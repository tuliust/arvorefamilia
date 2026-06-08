import type { GlobalSearchPageResult } from '../services/globalSearchService';

export type FavoritePage = GlobalSearchPageResult;

export const FAVORITE_PAGES: FavoritePage[] = [
  {
    id: 'minha-arvore',
    title: 'Minha Árvore',
    description: 'Visualização principal da árvore familiar.',
    path: '/minha-arvore',
    keywords: ['arvore', 'árvore', 'familia', 'família'],
  },
  {
    id: 'genealogia',
    title: 'Genealogia',
    description: 'Visualização por gerações e ramos familiares.',
    path: '/genealogia',
    keywords: ['genealogia', 'geracoes', 'gerações'],
  },
  {
    id: 'visao-completa',
    title: 'Visão Completa',
    description: 'Visualização ampliada da árvore.',
    path: '/visao-completa',
    keywords: ['visao', 'visão', 'completa'],
  },
  {
    id: 'meus-dados',
    title: 'Meus Dados',
    description: 'Revisão e atualização dos dados pessoais.',
    path: '/meus-dados',
    keywords: ['dados', 'perfil'],
  },
  {
    id: 'meus-vinculos',
    title: 'Meus Vínculos',
    description: 'Solicitações e vínculos familiares associados ao seu acesso.',
    path: '/meus-vinculos',
    keywords: ['vinculos', 'vínculos', 'familiares', 'perfil'],
  },
  {
    id: 'notificacoes',
    title: 'Notificações',
    description: 'Central de notificações e avisos relacionados à família.',
    path: '/notificacoes',
    keywords: ['notificacoes', 'notificações', 'avisos', 'alertas', 'novidades'],
  },
  {
    id: 'ajustar-notificacoes',
    title: 'Ajustar Notificações',
    description: 'Preferências de recebimento e configuração das notificações familiares.',
    path: '/ajustar-notificacoes',
    keywords: ['notificacoes', 'notificações', 'ajustar notificacoes', 'ajustar notificações', 'preferencias', 'preferências', 'configurar notificacoes', 'configurar notificações'],
  },
  {
    id: 'forum',
    title: 'Fórum',
    description: 'Discussões entre membros da família.',
    path: '/forum',
    keywords: ['forum', 'fórum', 'topicos', 'tópicos'],
  },
  {
    id: 'calendario',
    title: 'Calendário Familiar',
    description: 'Datas, aniversários e eventos familiares.',
    path: '/calendario-familiar',
    keywords: ['calendario', 'calendário', 'aniversarios', 'aniversários'],
  },
];

export function getFavoritePageByPath(pathname: string) {
  return FAVORITE_PAGES.find((page) => page.path === pathname);
}
