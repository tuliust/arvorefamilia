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

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.warn('[Supabase] Não foi possível obter usuário para notificação:', error.message);
  }
  return data.user?.id ?? null;
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

  const linkedTo = params.pessoaId ? 'person' : 'relationship';
  await dispatchInternalToRecipients({
    userIds: recipients,
    type: 'novos_registros_historicos',
    titulo: 'Novo registro histórico',
    mensagem: `Um novo registro histórico foi adicionado: ${params.title}.`,
    link: params.pessoaId ? `/pessoa/${params.pessoaId}` : '/notificacoes',
    metadata: {
      historical_file_id: params.historicalFileId,
      linked_to: linkedTo,
      pessoa_id: params.pessoaId ?? undefined,
      relacionamento_id: params.relacionamentoId ?? undefined,
      file_type: params.fileType,
      title: params.title,
    },
  });
}

export async function notifyNewUserLinked(params: NewUserLinkedParams) {
  const actorUserId = params.actorUserId ?? await getCurrentUserId();
  const recipients = excludeActor(await listAdminUserIds(), actorUserId);

  if (recipients.length === 0) return;

  await dispatchInternalToRecipients({
    userIds: recipients,
    type: 'novo_usuario',
    titulo: 'Novo vínculo confirmado',
    mensagem: 'Um usuário confirmou vínculo com uma pessoa da árvore.',
    link: '/admin/atividades',
    metadata: {
      linked_user_id: params.linkedUserId,
      pessoa_id: params.pessoaId,
      link_id: params.linkId ?? undefined,
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
