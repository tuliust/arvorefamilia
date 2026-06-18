import { Pessoa } from '../../types';

export type RelationshipGroupKey = 'pais' | 'filhos' | 'conjuges' | 'irmaos';

export type RelationshipReviewStatus =
  | 'confirmed'
  | 'added_pending'
  | 'edited_pending'
  | 'removed_pending'
  | 'control_pending';

export type ProfileControlRequestReason =
  | 'deceased'
  | 'minor_or_dependent'
  | 'close_family'
  | 'other';

export type ProfileControlRequestDraft = {
  pessoaId: string;
  pessoaNome: string;
  reason: ProfileControlRequestReason;
  relationshipDescription: string;
  createdAt: string;
};

export type RelationshipCounts = {
  parents: number;
  children: number;
  spouses: number;
  siblings: number;
};

export type RelationshipChangeCounts = {
  added: number;
  edited: number;
  removed: number;
  controlRequests: number;
  totalPending: number;
};

export type RelationshipOverviewGroup = {
  key: RelationshipGroupKey;
  label: string;
  count: number;
  pendingCount: number;
};

export type RelativeCardMeta = Array<{ label: string; value: string }>;

export type RelativeCardPerson = Pessoa;

export type RemovedRelationshipIds = Record<RelationshipGroupKey, string[]>;
