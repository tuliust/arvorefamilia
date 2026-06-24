import { useEffect, useMemo, useState } from 'react';
import { Network } from 'lucide-react';

import { ConnectionDiscoveryPanel } from '../home/ConnectionDiscoveryPanel';
import {
  calculateRelationshipDegree,
  type RelationshipDegreeResult,
} from '../../utils/relationshipDegree';
import {
  curiositySectionCardClassName,
  isPet,
  type CuriosidadesDataProps,
} from './curiosidadesUtils';

export function CuriosidadesConnectionSection({
  pessoas,
  relacionamentos,
  loading,
  error,
}: CuriosidadesDataProps) {
  const selectablePeople = useMemo(
    () => pessoas.filter((pessoa) => !isPet(pessoa) && pessoa.nome_completo),
    [pessoas]
  );

  const [personOneId, setPersonOneId] = useState('');
  const [personTwoId, setPersonTwoId] = useState('');
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionResult, setConnectionResult] = useState<RelationshipDegreeResult | null>(null);

  useEffect(() => {
    if (selectablePeople.length < 2) {
      if (personOneId || personTwoId || connectionResult || connectionError) {
        setPersonOneId('');
        setPersonTwoId('');
        setConnectionResult(null);
        setConnectionError(null);
        setConnectionLoading(false);
      }
      return;
    }

    const firstStillExists = !personOneId || selectablePeople.some((pessoa) => pessoa.id === personOneId);
    const secondStillExists = !personTwoId || selectablePeople.some((pessoa) => pessoa.id === personTwoId);

    if (!firstStillExists || !secondStillExists) {
      if (!firstStillExists) setPersonOneId('');
      if (!secondStillExists) setPersonTwoId('');
      setConnectionResult(null);
      setConnectionError(null);
      setConnectionLoading(false);
    }
  }, [connectionError, connectionResult, personOneId, personTwoId, selectablePeople]);

  const clearConnectionState = () => {
    setConnectionResult(null);
    setConnectionError(null);
  };

  const handleDiscoverConnection = () => {
    if (!personOneId || !personTwoId || connectionLoading) return;

    if (personOneId === personTwoId) {
      setConnectionResult(null);
      setConnectionError('Selecione duas pessoas diferentes.');
      return;
    }

    setConnectionLoading(true);
    setConnectionError(null);
    setConnectionResult(null);

    try {
      const result = calculateRelationshipDegree({
        originPersonId: personOneId,
        targetPersonId: personTwoId,
        people: pessoas,
        relationships: relacionamentos,
        includeInactiveSpouses: false,
      });

      setConnectionResult(result);
    } catch (discoverError) {
      setConnectionError(discoverError instanceof Error ? discoverError.message : 'Não foi possível descobrir a conexão agora.');
    } finally {
      setConnectionLoading(false);
    }
  };

  return (
    <section className={curiositySectionCardClassName}>
      <div className="flex items-center gap-3">
        <Network className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-bold text-gray-950">Qual a minha conexão com alguém?</h2>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-600">
        Escolha duas pessoas da árvore para descobrir o parentesco e o caminho familiar entre elas.
      </p>

      {error && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não foi possível carregar as pessoas para calcular conexões agora.
        </div>
      )}

      {!error && loading && (
        <div className="mt-5 h-56 animate-pulse rounded-xl bg-gray-100" />
      )}

      {!error && !loading && selectablePeople.length < 2 && (
        <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Cadastre pelo menos duas pessoas para descobrir conexões familiares.
        </div>
      )}

      {!error && !loading && selectablePeople.length >= 2 && (
        <div className="mt-5 min-w-0 overflow-hidden break-words">
          <ConnectionDiscoveryPanel
            pessoas={selectablePeople}
            connectionPersonOneId={personOneId}
            connectionPersonTwoId={personTwoId}
            connectionLoading={connectionLoading}
            connectionError={connectionError}
            connectionResult={connectionResult}
            onPersonOneChange={(value) => {
              setPersonOneId(value);
              clearConnectionState();
            }}
            onPersonTwoChange={(value) => {
              setPersonTwoId(value);
              clearConnectionState();
            }}
            onDiscoverConnection={handleDiscoverConnection}
            hideTitle
          />
        </div>
      )}
    </section>
  );
}
