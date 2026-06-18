import { supabase } from '../lib/supabaseClient';

export type MemoryWallVisibility = 'family' | 'close_relatives' | 'private';

export type MemoryWallPost = {
  id: string;
  user_id: string;
  author_name: string;
  body: string;
  visibility: MemoryWallVisibility;
  status: 'published' | 'hidden';
  created_at: string;
  updated_at?: string;
};

export type CreateMemoryWallPostPayload = {
  author_name: string;
  body: string;
  visibility: MemoryWallVisibility;
};

function mapMemoryWallPost(row: Record<string, unknown>): MemoryWallPost {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    author_name: String(row.author_name ?? 'Familiar'),
    body: String(row.body ?? ''),
    visibility: row.visibility as MemoryWallVisibility,
    status: row.status as MemoryWallPost['status'],
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('[memoryWallService] Erro ao obter usuario atual:', error);
    return null;
  }

  return data.user?.id ?? null;
}

export async function listMemoryWallPosts(limit = 20): Promise<MemoryWallPost[]> {
  try {
    const { data, error } = await supabase
      .from('family_memory_wall_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data ?? []).map((row) => mapMemoryWallPost(row));
  } catch (error) {
    console.error('[memoryWallService] Erro ao listar mural:', error);
    return [];
  }
}

export async function createMemoryWallPost(payload: CreateMemoryWallPostPayload): Promise<MemoryWallPost> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Usuario autenticado nao encontrado para publicar no mural.');
  }

  const authorName = payload.author_name.trim() || 'Familiar';
  const body = payload.body.trim();

  if (!body) {
    throw new Error('Escreva uma lembranca antes de publicar.');
  }

  const { data, error } = await supabase
    .from('family_memory_wall_posts')
    .insert({
      user_id: userId,
      author_name: authorName,
      body,
      visibility: payload.visibility,
      status: 'published',
    })
    .select('*')
    .single();

  if (error) throw error;

  return mapMemoryWallPost(data);
}
