import type { Pessoa } from '../types';
import { includesNormalizedText } from '../utils/searchText';
import { buscarPessoas } from './dataService';

export type GlobalSearchPageResult = {
  id: string;
  title: string;
  description: string;
  path: string;
  keywords: string[];
};

export type GlobalSearchResults = {
  people: Pessoa[];
  pages: GlobalSearchPageResult[];
};

export const GLOBAL_SEARCH_PAGES: GlobalSearchPageResult[] = [
  {
    id: 'minha-arvore',
    title: 'Minha Árvore',
    description: 'Visualização principal da árvore familiar com pessoa central, parentes diretos e filtros.',
    path: '/minha-arvore',
    keywords: ['arvore', 'árvore', 'familia', 'família', 'parentes', 'pessoa central', 'inicio', 'home'],
  },
  {
    id: 'mapa-familiar',
    title: 'Mapa Familiar',
    description: 'Visualização panorâmica da família direta em mapa com grupos, cônjuges, pets e descendentes.',
    path: '/mapa-familiar',
    keywords: [
      'mapa familiar',
      'mapa',
      'panoramico',
      'panorâmico',
      'familia',
      'família',
      'arvore visual',
      'árvore visual',
      'cônjuges',
      'conjuges',
      'pets',
      'descendentes',
    ],
  },
  {
    id: 'genealogia',
    title: 'Genealogia',
    description: 'Visualização genealógica organizada por gerações e ramos familiares.',
    path: '/genealogia',
    keywords: ['genealogia', 'geracoes', 'gerações', 'ancestrais', 'descendentes', 'ramos'],
  },
  {
    id: 'visao-completa',
    title: 'Visão Completa',
    description: 'Visualização ampliada da árvore com mais pessoas e relacionamentos.',
    path: '/visao-completa',
    keywords: ['visao completa', 'visão completa', 'arvore completa', 'árvore completa', 'todos'],
  },
  {
    id: 'meus-dados',
    title: 'Meus Dados',
    description: 'Página para revisar e atualizar os dados do perfil familiar vinculado à sua conta.',
    path: '/meus-dados',
    keywords: ['dados', 'perfil', 'minhas informacoes', 'minhas informações', 'editar cadastro'],
  },
  {
    id: 'meus-vinculos',
    title: 'Meus Vínculos',
    description: 'Gerenciamento dos vínculos entre sua conta e pessoas da árvore.',
    path: '/meus-vinculos',
    keywords: ['vinculos', 'vínculos', 'perfil vinculado', 'conta', 'pessoa vinculada'],
  },
  {
    id: 'favoritos',
    title: 'Meus Favoritos',
    description: 'Lista de pessoas e conteúdos marcados como favoritos.',
    path: '/meus-favoritos',
    keywords: ['favoritos', 'favorito', 'salvos'],
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
    id: 'calendario',
    title: 'Calendário Familiar',
    description: 'Datas, aniversários e eventos familiares organizados em calendário.',
    path: '/calendario-familiar',
    keywords: ['calendario', 'calendário', 'aniversarios', 'aniversários', 'eventos', 'datas'],
  },
  {
    id: 'forum',
    title: 'Fórum',
    description: 'Discussões, perguntas e conversas entre membros da família.',
    path: '/forum',
    keywords: ['forum', 'fórum', 'discussao', 'discussão', 'topicos', 'tópicos', 'conversas'],
  },
  {
    id: 'termos',
    title: 'Termos de Uso',
    description: 'Regras de uso da plataforma familiar.',
    path: '/termos',
    keywords: ['termos', 'termos de uso', 'regras', 'legal'],
  },
  {
    id: 'privacidade',
    title: 'Política de Privacidade',
    description: 'Informações sobre tratamento, proteção e uso de dados pessoais.',
    path: '/privacidade',
    keywords: ['privacidade', 'politica', 'política', 'dados pessoais', 'lgpd'],
  },
];

export function searchGlobalPages(term: string, limit?: number) {
  const trimmedTerm = term.trim();
  if (!trimmedTerm) return [];

  const results = GLOBAL_SEARCH_PAGES.filter((page) => (
    includesNormalizedText(page.title, trimmedTerm) ||
    includesNormalizedText(page.description, trimmedTerm) ||
    page.keywords.some((keyword) => includesNormalizedText(keyword, trimmedTerm))
  ));

  return typeof limit === 'number' ? results.slice(0, limit) : results;
}

export async function searchGlobal(term: string): Promise<GlobalSearchResults> {
  const trimmedTerm = term.trim();
  if (!trimmedTerm) {
    return { people: [], pages: [] };
  }

  const [people, pages] = await Promise.all([
    buscarPessoas(trimmedTerm),
    Promise.resolve(searchGlobalPages(trimmedTerm)),
  ]);

  return {
    people,
    pages,
  };
}
