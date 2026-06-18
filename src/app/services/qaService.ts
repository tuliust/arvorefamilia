import { supabase } from '../lib/supabaseClient';
import type { QaCategory, QaCategoryInput, QaItem, QaItemInput, QaPublishedContent } from '../types/qa';

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

function handleQaError(error: unknown, fallbackMessage: string): never {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: unknown }).message ?? '');
    if (message) throw new Error(message);
  }

  throw new Error(fallbackMessage);
}

function cleanCategoryPayload(payload: QaCategoryInput) {
  return {
    title: payload.title.trim(),
    short_title: payload.short_title?.trim() || null,
    slug: payload.slug.trim(),
    description: payload.description?.trim() || null,
    order_index: Number(payload.order_index ?? 0),
    is_active: payload.is_active !== false,
    updated_at: new Date().toISOString(),
  };
}

function cleanItemPayload(payload: QaItemInput) {
  const status = payload.status ?? 'draft';

  return {
    category_id: payload.category_id,
    question: payload.question.trim(),
    answer: payload.answer.trim(),
    slug: payload.slug.trim(),
    keywords: payload.keywords ?? [],
    related_page_label: payload.related_page_label?.trim() || null,
    related_page_path: payload.related_page_path?.trim() || null,
    is_featured: payload.is_featured === true,
    status,
    order_index: Number(payload.order_index ?? 0),
    published_at: status === 'published' ? payload.published_at ?? new Date().toISOString() : payload.published_at ?? null,
    updated_at: new Date().toISOString(),
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

export async function adminListQaCategories(): Promise<QaCategory[]> {
  const response = await supabase
    .from('qa_categories')
    .select('*')
    .order('order_index', { ascending: true })
    .order('title', { ascending: true });

  if (response.error) handleQaError(response.error, 'Não foi possível carregar as categorias de dúvidas.');

  return (response.data ?? []).map((row) => mapCategory(row as Record<string, unknown>));
}

export async function adminCreateQaCategory(payload: QaCategoryInput): Promise<QaCategory> {
  const response = await supabase
    .from('qa_categories')
    .insert({
      ...cleanCategoryPayload(payload),
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (response.error) handleQaError(response.error, 'Não foi possível criar a categoria.');

  return mapCategory(response.data as Record<string, unknown>);
}

export async function adminUpdateQaCategory(id: string, payload: QaCategoryInput): Promise<QaCategory> {
  const response = await supabase
    .from('qa_categories')
    .update(cleanCategoryPayload(payload))
    .eq('id', id)
    .select('*')
    .single();

  if (response.error) handleQaError(response.error, 'Não foi possível atualizar a categoria.');

  return mapCategory(response.data as Record<string, unknown>);
}

export async function adminToggleQaCategoryActive(category: QaCategory): Promise<QaCategory> {
  const response = await supabase
    .from('qa_categories')
    .update({ is_active: !category.is_active, updated_at: new Date().toISOString() })
    .eq('id', category.id)
    .select('*')
    .single();

  if (response.error) handleQaError(response.error, 'Não foi possível alterar o status da categoria.');

  return mapCategory(response.data as Record<string, unknown>);
}

export async function adminListQaItems(): Promise<QaItem[]> {
  const response = await supabase
    .from('qa_items')
    .select('*')
    .order('order_index', { ascending: true })
    .order('question', { ascending: true });

  if (response.error) handleQaError(response.error, 'Não foi possível carregar as perguntas de dúvidas.');

  return (response.data ?? []).map((row) => mapItem(row as Record<string, unknown>));
}

export async function adminCreateQaItem(payload: QaItemInput): Promise<QaItem> {
  const response = await supabase
    .from('qa_items')
    .insert({
      ...cleanItemPayload(payload),
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (response.error) handleQaError(response.error, 'Não foi possível criar a pergunta.');

  return mapItem(response.data as Record<string, unknown>);
}

export async function adminUpdateQaItem(id: string, payload: QaItemInput): Promise<QaItem> {
  const response = await supabase
    .from('qa_items')
    .update(cleanItemPayload(payload))
    .eq('id', id)
    .select('*')
    .single();

  if (response.error) handleQaError(response.error, 'Não foi possível atualizar a pergunta.');

  return mapItem(response.data as Record<string, unknown>);
}

export async function adminPublishQaItem(item: QaItem): Promise<QaItem> {
  const response = await supabase
    .from('qa_items')
    .update({
      status: 'published',
      published_at: item.published_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', item.id)
    .select('*')
    .single();

  if (response.error) handleQaError(response.error, 'Não foi possível publicar a pergunta.');

  return mapItem(response.data as Record<string, unknown>);
}

export async function adminArchiveQaItem(item: QaItem): Promise<QaItem> {
  const response = await supabase
    .from('qa_items')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', item.id)
    .select('*')
    .single();

  if (response.error) handleQaError(response.error, 'Não foi possível arquivar a pergunta.');

  return mapItem(response.data as Record<string, unknown>);
}

export async function adminMoveQaItemToDraft(item: QaItem): Promise<QaItem> {
  const response = await supabase
    .from('qa_items')
    .update({ status: 'draft', updated_at: new Date().toISOString() })
    .eq('id', item.id)
    .select('*')
    .single();

  if (response.error) handleQaError(response.error, 'Não foi possível mover a pergunta para rascunho.');

  return mapItem(response.data as Record<string, unknown>);
}
