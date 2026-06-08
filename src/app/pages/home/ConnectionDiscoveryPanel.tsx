import React from 'react';
import { ArrowRight, UserRound } from 'lucide-react';

import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import type { Pessoa } from '../../types';
import type { RelationshipDegreeResult } from '../../utils/relationshipDegree';
import {
  formatShortName,
  getRelationshipNarrative,
  getRelationshipResultSentence,
} from '../../utils/relationshipDegreeDisplay';

interface ConnectionDiscoveryPanelProps {
  pessoas: Pessoa[];
  connectionPersonOneId: string;
  connectionPersonTwoId: string;
  connectionLoading: boolean;
  connectionError: string | null;
  connectionResult: RelationshipDegreeResult | null;
  onPersonOneChange: (value: string) => void;
  onPersonTwoChange: (value: string) => void;
  onDiscoverConnection: () => void;
  hideTitle?: boolean;
}

function getPessoaById(pessoas: Pessoa[], id: string) {
  return pessoas.find((pessoa) => pessoa.id === id);
}

function PersonAvatar({ pessoa }: { pessoa?: Pessoa }) {
  const name = formatShortName(pessoa?.nome_completo) || 'Pessoa';
  const imageUrl = pessoa?.foto_principal_url?.trim();

  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-white shadow-sm">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-7 w-7 text-blue-500" />
        )}
      </div>
      <span className="max-w-[10rem] truncate text-sm font-semibold text-slate-900">{name}</span>
    </div>
  );
}

function ConnectionResultCard({ result, pessoas }: { result: RelationshipDegreeResult; pessoas: Pessoa[] }) {
  const origin = getPessoaById(pessoas, result.originPersonId);
  const target = getPessoaById(pessoas, result.targetPersonId);
  const resultSentence = getRelationshipResultSentence(result, pessoas);
  const narrative = getRelationshipNarrative(result, pessoas);
  const narrativeSummary = narrative.summary.trim();
  const shouldShowNarrative = narrativeSummary && narrativeSummary !== resultSentence;

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-5 shadow-sm sm:px-6">
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
        <PersonAvatar pessoa={origin} />
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
          <ArrowRight className="h-5 w-5" />
        </div>
        <PersonAvatar pessoa={target} />
      </div>
      <p className="mt-5 text-center text-lg font-bold leading-relaxed text-slate-950 sm:text-xl">
        {resultSentence}
      </p>
      {shouldShowNarrative && (
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-slate-600 sm:text-base">
          {narrativeSummary}
        </p>
      )}
    </div>
  );
}

export function ConnectionDiscoveryPanel({
  pessoas,
  connectionPersonOneId,
  connectionPersonTwoId,
  connectionLoading,
  connectionError,
  connectionResult,
  onPersonOneChange,
  onPersonTwoChange,
  onDiscoverConnection,
  hideTitle = false,
}: ConnectionDiscoveryPanelProps) {
  return (
    <section className="space-y-4">
      {!hideTitle && (
        <div>
          <h2 className="text-base font-semibold text-gray-900">Qual a minha conexão com alguém?</h2>
          <p className="mt-1 text-sm text-gray-600">
            Escolha duas pessoas da árvore para descobrir o parentesco e o caminho familiar entre elas.
          </p>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
        <Select
          value={connectionPersonOneId}
          onValueChange={onPersonOneChange}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Pessoa 1" />
          </SelectTrigger>
          <SelectContent>
            {pessoas.map((pessoa) => (
              <SelectItem key={pessoa.id} value={pessoa.id}>
                {pessoa.nome_completo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={connectionPersonTwoId}
          onValueChange={onPersonTwoChange}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Pessoa 2" />
          </SelectTrigger>
          <SelectContent>
            {pessoas.map((pessoa) => (
              <SelectItem key={pessoa.id} value={pessoa.id}>
                {pessoa.nome_completo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          onClick={onDiscoverConnection}
          disabled={!connectionPersonOneId || !connectionPersonTwoId || connectionLoading}
          className="w-full whitespace-nowrap lg:w-auto"
        >
          {connectionLoading ? 'Calculando...' : 'Descobrir conexão'}
        </Button>
      </div>

      {connectionError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {connectionError}
        </p>
      )}

      {connectionResult && (
        <ConnectionResultCard result={connectionResult} pessoas={pessoas} />
      )}
    </section>
  );
}
