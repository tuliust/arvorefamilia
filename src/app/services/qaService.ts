import { supabase } from '../lib/supabaseClient';
import type { QaCategory, QaItem, QaPublishedContent } from '../types/qa';

function mapCategory(row: Record<string, unknown>): QaCategory {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    short_title: row.short_title ? String(row.short_title) : null,
    slug: String(row.slug ?? ''),
    description: row.description ? String(row.description) : null,
    order_index: Number(row.order_index ?? 0),
    is_active: row.is_active !== false,
    created_by: row.created_by ? String(row.created_by) : null,
    updated_by: row.updated_by ? String(row.updated_by) : null,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function mapItem(row: Record<string, unknown>): QaItem {
  const rawKeywords = Array.isArray(row.keywords) ? row.keywords : [];

  return {
    id: String(row.id),
    category_id: String(row.category_id ?? ''),
    question: String(row.question ?? ''),
    answer: String(row.answer ?? ''),
    slug: String(row.slug ?? ''),
    keywords: rawKeywords.map((keyword) => String(keyword)).filter(Boolean),
    related_page_label: row.related_page_label ? String(row.related_page_label) : null,
    related_page_path: row.related_page_path ? String(row.related_page_path) : null,
    is_featured: row.is_featured === true,
    status: row.status === 'draft' || row.status === 'archived' ? row.status : 'published',
    order_index: Number(row.order_index ?? 0),
    published_at: row.published_at ? String(row.published_at) : null,
    created_by: row.created_by ? String(row.created_by) : null,
    updated_by: row.updated_by ? String(row.updated_by) : null,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function listPublishedQaContent(): Promise<QaPublishedContent> {
  const categoriesResponse = await supabase
    .from('qa_categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })
    .order('title', { ascending: true });

  if (categoriesResponse.error) {
    throw new Error('Não foi possível carregar as categorias de dúvidas.');
  }

  const itemsResponse = await supabase
    .from('qa_items')
    .select('*')
    .eq('status', 'published')
    .order('order_index', { ascending: true })
    .order('question', { ascending: true });

  if (itemsResponse.error) {
    throw new Error('Não foi possível carregar as perguntas de dúvidas.');
  }

  const categories = (categoriesResponse.data ?? []).map((row) => mapCategory(row as Record<string, unknown>));
  const activeCategoryIds = new Set(categories.map((category) => category.id));
  const items = (itemsResponse.data ?? [])
    .map((row) => mapItem(row as Record<string, unknown>))
    .filter((item) => item.status === 'published' && activeCategoryIds.has(item.category_id));

  return { categories, items };
}
