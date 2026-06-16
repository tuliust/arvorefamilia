import { Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  getRelationshipChangeNoticeText,
  getRelationshipControlNoticeText,
  getRelationshipFinalButtonLabel,
  getRelationshipOverviewGroupLabel,
  getProfileControlRequestSummaryLabel,
} from './meusVinculosUtils';
import { RelationshipChangeCounts, RelationshipCounts } from './types';

type RelationshipReviewAsideProps = {
  counts: RelationshipCounts;
  changes: RelationshipChangeCounts;
  hasPendingRelationshipRequest?: boolean;
  saving?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
};

export function RelationshipReviewAside({
  counts,
  changes,
  hasPendingRelationshipRequest = false,
  saving = false,
  disabled = false,
  onConfirm,
}: RelationshipReviewAsideProps) {
  const hasChanges = changes.totalPending > 0;
  const finalButtonLabel = getRelationshipFinalButtonLabel(hasChanges, changes.controlRequests > 0);

  return (
    <div className="sticky top-4 h-fit min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="space-y-3">
        <div>
          <h2 className="break-words font-semibold text-gray-950">Resumo da revisão</h2>
          <p className="break-words text-sm text-gray-600">Revise vínculos, alterações e solicitações de controle.</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">Vínculos atuais</p>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500">{getRelationshipOverviewGroupLabel('pais')}</dt>
              <dd className="font-semibold text-gray-900">{counts.parents}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500">{getRelationshipOverviewGroupLabel('filhos')}</dt>
              <dd className="font-semibold text-gray-900">{counts.children}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500">{getRelationshipOverviewGroupLabel('conjuges')}</dt>
              <dd className="font-semibold text-gray-900">{counts.spouses}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500">{getRelationshipOverviewGroupLabel('irmaos')}</dt>
              <dd className="font-semibold text-gray-900">{counts.siblings}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">Alterações nesta etapa</p>
          {changes.totalPending === 0 && changes.controlRequests === 0 ? (
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>Nenhuma alteração pendente.</p>
              <p>Você pode confirmar e continuar.</p>
            </div>
          ) : (
            <div className="mt-2 space-y-2 text-sm text-gray-700">
              {changes.added > 0 && <p>+ {changes.added} vínculo(s) adicionado(s)</p>}
              {changes.removed > 0 && <p>- {changes.removed} remoção(ões) solicitada(s)</p>}
              {changes.edited > 0 && <p>{changes.edited} vínculo(s) alterado(s)</p>}
              {changes.controlRequests > 0 && <p>{changes.controlRequests} solicitação(ões) de controle</p>}
              <p className="pt-2 text-amber-900">{getRelationshipChangeNoticeText(hasChanges)}</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Solicitações de controle</p>
          <p className="mt-1">{getProfileControlRequestSummaryLabel(changes.controlRequests)}</p>
        </div>

        {changes.controlRequests > 0 && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            {getRelationshipControlNoticeText()}
          </div>
        )}

        {hasPendingRelationshipRequest && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Sua solicitação está em aprovação. Você receberá um e-mail quando a análise for finalizada.
          </p>
        )}
      </div>

      <Button className="mt-5 w-full" onClick={onConfirm} disabled={saving || disabled}>
        {saving ? 'Finalizando...' : (
          <>
            <Save className="h-4 w-4" />
            {finalButtonLabel}
          </>
        )}
      </Button>
    </div>
  );
}
