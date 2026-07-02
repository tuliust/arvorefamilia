import { supabase } from '../lib/supabaseClient';
import { dispatchNotification } from './notificationDispatchService';
import {
  excludeActor,
  listAdminUserIds,
  listForumCommentParticipantUserIds,
  listForumTopicParticipantUserIds,
  listLinkedUserIdsForPessoas,
  listRelevantUserIdsForHistoricalFile,
  uniqueUserIds,
} from './notificationRecipientsService';

type HistoricalFileAddedParams = {
  historicalFileId: string;
  title: string;
  fileType: string;
  pessoaId?: string | null;
  relacionamentoId?: string | null;
  actorUserId?: string | null;
};

type NewUserLinkedParams = {
  linkedUserId: string;
  pessoaId: string;
  linkId?: string | null;
  actorUserId?: string | null;
};

type ForumTopicCreatedParams = {
  topicId: string;
  actorUserId: string;
  mentionedPessoaIds?: string[];
  relatedPessoaIds?: string[];
};

type ForumReplyCreatedParams = {
  topicId: string;
  replyId: string;
  actorUserId: string;
};

type ForumCommentCreatedParams = {
  responseId: string;
  commentId: string;
  actorUserId: string;
};

function getShortName(value?: string | null, fallback = 'usuário') {
  const cleanValue = String(value ?? '').trim();
  if (!cleanValue) return fallback;
  return cleanValue.split(/\s+/).filter(Boolean)[0] || fallback;
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn('[Supabase] Não foi possível obter usuário para notificação:', error.message);
  }
  return data.user?.id ?? null;
}

async function getPessoaShortName(pessoaId?: string | null, fallback = 'pessoa') {
  if (!pessoaId) return fallback;

  try {
    const { data, error } = await supabase
      .from('pessoas')
      .select('nome_completo')
      .eq('id', pessoaId)
      .maybeSingle();

    if (error) throw error;
    return getShortName((data as { nome_completo?: string | null } | null)?.nome_completo, fallback);
  } catch (error) {
    console.warn('[Notificações] Não foi possível obter nome curto da pessoa afetada:', error);
    return fallback;
  }
}

async function getUserShortName(userId?: string | null, fallback = 'usuário') {
  if (!userId) return fallback;

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('nome_exibicao')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw profileError;

    const profileName = String((profile as { nome_exibicao?: string | null } | null)?.nome_exibicao ?? '').trim();
    if (profileName) return getShortName(profileName, fallback);
  } catch (error) {
    console.warn('[Notificações] Não foi possível obter nome do perfil do autor:', error);
  }

  try {
    const { data: link, error: linkError } = await supabase
      .from('user_person_links')
      .select('pessoa:pessoas(nome_completo)')
      .eq('user_id', userId)
      .order('principal', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (linkError) throw linkError;

    const pessoa = (link as { pessoa?: { nome_completo?: string | null } | null } | null)?.pessoa;
    return getShortName(pessoa?.nome_completo, fallback);
  } catch (error) {
    console.warn('[Notificações] Não foi possível obter nome curto do vínculo do autor:', error);
    return fallback;
  }
}

async function getRelationshipAffectedShortName(relacionamentoId?: string | null, fallback = 'pessoa') {
  if (!relacionamentoId) return fallback;

  try {
    const { data: relacionamento, error } = await supabase
      .from('relacionamentos')
      .select('pessoa_origem_id, pessoa_destino_id')
      .eq('id', relacionamentoId)
      .maybeSingle();

    if (error) throw error;

    const ids = [
      (relacionamento as { pessoa_origem_id?: string | null } | null)?.pessoa_origem_id,
      (relacionamento as { pessoa_destino_id?: string | null } | null)?.pessoa_destino_id,
    ].filter(Boolean) as string[];

    if (ids.length === 0) return fallback;

    const { data: pessoas, error: pessoasError } = await supabase
      .from('pessoas')
      .select('nome_completo')
      .in('id', ids);

    if (pessoasError) throw pessoasError;

    const names = ((pessoas ?? []) as Array<{ nome_completo?: string | null }>)
      .map((pessoa) => getShortName(pessoa.nome_completo, ''))
      .filter(Boolean);

    return names.length > 0 ? names.join(' e ') : fallback;
  } catch (error) {
    console.warn('[Notificações] Não foi possível obter nome curto do relacionamento afetado:', error);
    return fallback;
  }
}

async function resolveHistoricalFileAffectedShortName(params: HistoricalFileAddedParams) {
  if (params.pessoaId) return getPessoaShortName(params.pessoaId, 'pessoa');
  return getRelationshipAffectedShortName(params.relacionamentoId, 'vínculo');
}

async function dispatchInternalToRecipients(params: {
  userIds: string[];
  type: 'novos_registros_historicos' | 'novo_usuario' | 'novas_mensagens_forum';
  titulo: string;
  mensagem: string;
  link: string;
  metadata: Record<string, unknown>;
}) {
  await Promise.all(
    uniqueUserIds(params.userIds).map(async (userId) => {
      try {
        await dispatchNotification({
          userId,
          type: params.type,
          titulo: params.titulo,
          mensagem: params.mensagem,
          link: params.link,
          metadata: params.metadata,
          channels: ['interna'],
          respectPreferences: true,
        });
      } catch (error) {
        console.warn('[Notificações] Falha ao disparar notificação interna:', error);
      }
    })
  );
}

export async function notifyHistoricalFileAdded(params: HistoricalFileAddedParams) {
  const actorUserId = params.actorUserId ?? await getCurrentUserId();
  const recipients = await listRelevantUserIdsForHistoricalFile({
    pessoaId: params.pessoaId,
    relacionamentoId: params.relacionamentoId,
    includeAdmins: true,
    actorUserId,
  });

  if (recipients.length === 0) return;

  const [actorShortName, affectedShortName] = await Promise.all([
    getUserShortName(actorUserId, 'Usuário'),
    resolveHistoricalFileAffectedShortName(params),
  ]);
  const linkedTo = params.pessoaId ? 'person' : 'relationship';

  await dispatchInternalToRecipients({
    userIds: recipients,
    type: 'novos_registros_historicos',
    titulo: `${actorShortName} adicionou registro para ${affectedShortName}`,
    mensagem: `${actorShortName} adicionou ${params.title} ao perfil de ${affectedShortName}.`,
    link: params.pessoaId ? `/pessoa/${params.pessoaId}` : '/notificacoes',
    metadata: {
      historical_file_id: params.historicalFileId,
      linked_to: linkedTo,
      pessoa_id: params.pessoaId ?? undefined,
      relacionamento_id: params.relacionamentoId ?? undefined,
      actor_user_id: actorUserId ?? undefined,
      actor_short_name: actorShortName,
      affected_short_name: affectedShortName,
      file_type: params.fileType,
      title: params.title,
    },
  });
}

export async function notifyNewUserLinked(params: NewUserLinkedParams) {
  const actorUserId = params.actorUserId ?? await getCurrentUserId() ?? params.linkedUserId;
  const recipients = excludeActor(await listAdminUserIds(), actorUserId);

  if (recipients.length === 0) return;

  const [actorShortName, affectedShortName] = await Promise.all([
    getUserShortName(actorUserId, 'Usuário'),
    getPessoaShortName(params.pessoaId, 'pessoa'),
  ]);

  await dispatchInternalToRecipients({
    userIds: recipients,
    type: 'novo_usuario',
    titulo: `${actorShortName} confirmou vínculo com ${affectedShortName}`,
    mensagem: `${actorShortName} confirmou vínculo com ${affectedShortName} na árvore.`,
    link: '/admin/atividades',
    metadata: {
      linked_user_id: params.linkedUserId,
      pessoa_id: params.pessoaId,
      link_id: params.linkId ?? undefined,
      actor_user_id: actorUserId,
      actor_short_name: actorShortName,
      affected_short_name: affectedShortName,
    },
  });
}

export async function notifyForumTopicCreated(params: ForumTopicCreatedParams) {
  const mentionedPessoaIds = Array.from(new Set((params.mentionedPessoaIds || []).filter(Boolean)));
  const relatedPessoaIds = Array.from(new Set((params.relatedPessoaIds || []).filter(Boolean)));
  const pessoaIds = Array.from(new Set([...mentionedPessoaIds, ...relatedPessoaIds]));

  if (pessoaIds.length === 0) return;

  const userIdsByPessoa = await listLinkedUserIdsForPessoas(pessoaIds);
  const mentionedRecipients = excludeActor(
    uniqueUserIds(mentionedPessoaIds.flatMap((pessoaId) => userIdsByPessoa[pessoaId] || [])),
    params.actorUserId
  );
  const mentionedRecipientSet = new Set(mentionedRecipients);
  const relatedRecipients = excludeActor(
    uniqueUserIds(relatedPessoaIds.flatMap((pessoaId) => userIdsByPessoa[pessoaId] || [])),
    params.actorUserId
  ).filter((userId) => !mentionedRecipientSet.has(userId));

  const link = `/forum/topico/${params.topicId}`;

  await Promise.all([
    mentionedRecipients.length > 0
      ? dispatchInternalToRecipients({
          userIds: mentionedRecipients,
          type: 'novas_mensagens_forum',
          titulo: 'Você foi mencionado no fórum',
          mensagem: 'Você foi mencionado em uma publicação.',
          link,
          metadata: {
            topic_id: params.topicId,
            notification_reason: 'mention',
            mentioned_pessoa_ids: mentionedPessoaIds,
          },
        })
      : Promise.resolve(),
    relatedRecipients.length > 0
      ? dispatchInternalToRecipients({
          userIds: relatedRecipients,
          type: 'novas_mensagens_forum',
          titulo: 'Você foi relacionado a uma publicação',
          mensagem: 'Você foi relacionado a uma publicação.',
          link,
          metadata: {
            topic_id: params.topicId,
            notification_reason: 'related_person',
            related_pessoa_ids: relatedPessoaIds,
          },
        })
      : Promise.resolve(),
  ]);
}

export async function notifyForumReplyCreated(params: ForumReplyCreatedParams) {
  const participants = await listForumTopicParticipantUserIds(params.topicId);
  const recipients = excludeActor(participants, params.actorUserId);

  if (recipients.length === 0) return;

  await dispatchInternalToRecipients({
    userIds: recipients,
    type: 'novas_mensagens_forum',
    titulo: 'Nova resposta no fórum',
    mensagem: 'Um tópico que você acompanha recebeu uma nova resposta.',
    link: `/forum/topico/${params.topicId}`,
    metadata: {
      topic_id: params.topicId,
      reply_id: params.replyId,
    },
  });
}

export async function notifyForumCommentCreated(params: ForumCommentCreatedParams) {
  const participants = await listForumCommentParticipantUserIds(params.responseId);
  const recipients = excludeActor(participants.userIds, params.actorUserId);

  if (recipients.length === 0 || !participants.topicId) return;

  await dispatchInternalToRecipients({
    userIds: recipients,
    type: 'novas_mensagens_forum',
    titulo: 'Novo comentário no fórum',
    mensagem: 'Uma conversa do fórum que você acompanha recebeu um novo comentário.',
    link: `/forum/topico/${participants.topicId}`,
    metadata: {
      topic_id: participants.topicId,
      response_id: params.responseId,
      comment_id: params.commentId,
    },
  });
}
