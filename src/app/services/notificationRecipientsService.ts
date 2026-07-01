import { supabase } from '../lib/supabaseClient';

type UserIdRow = {
  user_id?: string | null;
  autor_id?: string | null;
};

type RelationshipRow = {
  pessoa_origem_id?: string | null;
  pessoa_destino_id?: string | null;
  tipo_relacionamento?: string | null;
  subtipo_relacionamento?: string | null;
  ativo?: boolean | null;
  data_separacao?: string | null;
};

export function uniqueUserIds(userIds: Array<string | null | undefined>) {
  return Array.from(new Set(userIds.filter((userId): userId is string => Boolean(userId))));
}

export function excludeActor(userIds: string[], actorUserId?: string | null) {
  if (!actorUserId) return userIds;
  return userIds.filter((userId) => userId !== actorUserId);
}

export async function listAdminUserIds(): Promise<string[]> {
  const { data, error } = await supabase.rpc('list_admin_user_ids');

  if (error) {
    console.warn('[Supabase] Não foi possível listar admins para notificação:', error.message);
    return [];
  }

  return uniqueUserIds(Array.isArray(data) ? data : []);
}

export async function listLinkedUserIdsForPessoa(pessoaId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_person_links')
    .select('user_id')
    .eq('pessoa_id', pessoaId);

  if (error) {
    console.warn('[Supabase] Não foi possível listar usuários vinculados à pessoa:', error.message);
    return [];
  }

  return uniqueUserIds(((data || []) as UserIdRow[]).map((row) => row.user_id));
}

export async function listLinkedUserIdsForPessoas(pessoaIds: string[]): Promise<Record<string, string[]>> {
  const uniquePessoaIds = Array.from(new Set(pessoaIds.filter(Boolean)));

  if (uniquePessoaIds.length === 0) return {};

  const { data, error } = await supabase
    .from('user_person_links')
    .select('pessoa_id,user_id')
    .in('pessoa_id', uniquePessoaIds);

  if (error) {
    console.warn('[Supabase] Não foi possível listar usuários vinculados às pessoas:', error.message);
    return {};
  }

  return ((data || []) as Array<{ pessoa_id?: string | null; user_id?: string | null }>).reduce<Record<string, string[]>>(
    (acc, row) => {
      if (!row.pessoa_id || !row.user_id) return acc;
      acc[row.pessoa_id] = uniqueUserIds([...(acc[row.pessoa_id] || []), row.user_id]);
      return acc;
    },
    {}
  );
}

async function listRelationshipsForPeople(pessoaIds: string[]) {
  const ids = Array.from(new Set(pessoaIds.filter(Boolean)));
  if (ids.length === 0) return [] as RelationshipRow[];

  const { data, error } = await supabase
    .from('relacionamentos')
    .select('pessoa_origem_id,pessoa_destino_id,tipo_relacionamento,subtipo_relacionamento,ativo,data_separacao')
    .or(`pessoa_origem_id.in.(${ids.join(',')}),pessoa_destino_id.in.(${ids.join(',')})`);

  if (error) {
    console.warn('[Supabase] Não foi possível listar relacionamentos para destinatários próximos:', error.message);
    return [] as RelationshipRow[];
  }

  return ((data || []) as RelationshipRow[]).filter((relationship) => relationship.ativo !== false);
}

function getOtherPersonId(relationship: RelationshipRow, pessoaId: string) {
  if (relationship.pessoa_origem_id === pessoaId) return relationship.pessoa_destino_id ?? null;
  if (relationship.pessoa_destino_id === pessoaId) return relationship.pessoa_origem_id ?? null;
  return null;
}

function getParentChildIds(relationship: RelationshipRow) {
  if (relationship.tipo_relacionamento === 'filho') {
    return {
      parentId: relationship.pessoa_origem_id ?? null,
      childId: relationship.pessoa_destino_id ?? null,
    };
  }

  if (relationship.tipo_relacionamento === 'pai' || relationship.tipo_relacionamento === 'mae') {
    return {
      parentId: relationship.pessoa_destino_id ?? null,
      childId: relationship.pessoa_origem_id ?? null,
    };
  }

  return { parentId: null, childId: null };
}

function isActiveSpouseRelationship(relationship: RelationshipRow) {
  if (relationship.tipo_relacionamento !== 'conjuge') return false;
  if (relationship.ativo === false) return false;
  if (relationship.data_separacao) return false;
  return relationship.subtipo_relacionamento !== 'separado';
}

function collectImmediateFamilyIds(pessoaId: string, relationships: RelationshipRow[]) {
  const parents = new Set<string>();
  const siblings = new Set<string>();
  const spouses = new Set<string>();
  const children = new Set<string>();

  relationships.forEach((relationship) => {
    if (relationship.tipo_relacionamento === 'irmao') {
      const otherId = getOtherPersonId(relationship, pessoaId);
      if (otherId) siblings.add(otherId);
      return;
    }

    if (isActiveSpouseRelationship(relationship)) {
      const otherId = getOtherPersonId(relationship, pessoaId);
      if (otherId) spouses.add(otherId);
      return;
    }

    const { parentId, childId } = getParentChildIds(relationship);
    if (!parentId || !childId) return;

    if (childId === pessoaId) parents.add(parentId);
    if (parentId === pessoaId) children.add(childId);
  });

  return { parents, siblings, spouses, children };
}

function collectChildrenOfPeople(peopleIds: Set<string>, relationships: RelationshipRow[]) {
  const children = new Set<string>();

  relationships.forEach((relationship) => {
    const { parentId, childId } = getParentChildIds(relationship);
    if (parentId && childId && peopleIds.has(parentId)) {
      children.add(childId);
    }
  });

  return children;
}

export async function listCloseFamilyUserIdsForPessoa(params: {
  pessoaId: string;
  actorUserId?: string | null;
}) {
  const firstLevelRelationships = await listRelationshipsForPeople([params.pessoaId]);
  const immediate = collectImmediateFamilyIds(params.pessoaId, firstLevelRelationships);
  const secondLevelSeedIds = [...immediate.children, ...immediate.siblings];
  const secondLevelRelationships = await listRelationshipsForPeople(secondLevelSeedIds);

  const grandchildren = collectChildrenOfPeople(immediate.children, secondLevelRelationships);
  const nephewsAndNieces = collectChildrenOfPeople(immediate.siblings, secondLevelRelationships);

  const closePessoaIds = Array.from(new Set([
    ...immediate.parents,
    ...immediate.siblings,
    ...immediate.spouses,
    ...immediate.children,
    ...grandchildren,
    ...nephewsAndNieces,
  ])).filter((id) => id !== params.pessoaId);

  const linkedUserGroups = await listLinkedUserIdsForPessoas(closePessoaIds);
  const recipients = Object.values(linkedUserGroups).flat();

  return excludeActor(uniqueUserIds(recipients), params.actorUserId);
}

async function listPessoaIdsForRelationship(relacionamentoId: string) {
  const { data, error } = await supabase
    .from('relacionamentos')
    .select('pessoa_origem_id,pessoa_destino_id')
    .eq('id', relacionamentoId)
    .maybeSingle();

  if (error) {
    console.warn('[Supabase] Não foi possível resolver pessoas do relacionamento:', error.message);
    return [];
  }

  return uniqueUserIds([
    data?.pessoa_origem_id ? String(data.pessoa_origem_id) : null,
    data?.pessoa_destino_id ? String(data.pessoa_destino_id) : null,
  ]);
}

export async function listRelevantUserIdsForHistoricalFile(params: {
  pessoaId?: string | null;
  relacionamentoId?: string | null;
  includeAdmins?: boolean;
  actorUserId?: string | null;
}) {
  const recipients: string[] = [];

  if (params.pessoaId) {
    recipients.push(...await listLinkedUserIdsForPessoa(params.pessoaId));
  }

  if (params.relacionamentoId) {
    const pessoaIds = await listPessoaIdsForRelationship(params.relacionamentoId);
    const linkedUserGroups = await Promise.all(pessoaIds.map((pessoaId) => listLinkedUserIdsForPessoa(pessoaId)));
    recipients.push(...linkedUserGroups.flat());
  }

  if (params.includeAdmins) {
    recipients.push(...await listAdminUserIds());
  }

  return excludeActor(uniqueUserIds(recipients), params.actorUserId);
}

export async function listForumTopicParticipantUserIds(topicId: string): Promise<string[]> {
  const [topicResult, repliesResult, commentsResult] = await Promise.all([
    supabase.from('forum_topicos').select('autor_id').eq('id', topicId).maybeSingle(),
    supabase.from('forum_respostas').select('autor_id').eq('topico_id', topicId),
    supabase
      .from('forum_comentarios')
      .select('autor_id, resposta:forum_respostas!inner(topico_id)')
      .eq('resposta.topico_id', topicId),
  ]);

  if (topicResult.error) {
    console.warn('[Supabase] Não foi possível listar autor do tópico para notificação:', topicResult.error.message);
  }

  if (repliesResult.error) {
    console.warn('[Supabase] Não foi possível listar respostas do tópico para notificação:', repliesResult.error.message);
  }

  if (commentsResult.error) {
    console.warn('[Supabase] Não foi possível listar comentários do tópico para notificação:', commentsResult.error.message);
  }

  return uniqueUserIds([
    topicResult.data?.autor_id ? String(topicResult.data.autor_id) : null,
    ...(((repliesResult.data || []) as UserIdRow[]).map((row) => row.autor_id)),
    ...(((commentsResult.data || []) as UserIdRow[]).map((row) => row.autor_id)),
  ]);
}

export async function listForumCommentParticipantUserIds(respostaId: string): Promise<{
  topicId?: string;
  userIds: string[];
}> {
  const { data: reply, error: replyError } = await supabase
    .from('forum_respostas')
    .select('id,topico_id,autor_id')
    .eq('id', respostaId)
    .maybeSingle();

  if (replyError || !reply) {
    if (replyError) {
      console.warn('[Supabase] Não foi possível listar resposta para notificação:', replyError.message);
    }
    return { userIds: [] };
  }

  const [topicParticipants, commentsResult] = await Promise.all([
    listForumTopicParticipantUserIds(String(reply.topico_id)),
    supabase.from('forum_comentarios').select('autor_id').eq('resposta_id', respostaId),
  ]);

  if (commentsResult.error) {
    console.warn('[Supabase] Não foi possível listar comentários da resposta para notificação:', commentsResult.error.message);
  }

  return {
    topicId: String(reply.topico_id),
    userIds: uniqueUserIds([
      String(reply.autor_id),
      ...topicParticipants,
      ...(((commentsResult.data || []) as UserIdRow[]).map((row) => row.autor_id)),
    ]),
  };
}
