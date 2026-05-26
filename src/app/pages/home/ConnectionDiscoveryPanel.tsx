import React from 'react';

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
import { getRelationshipResultMessage } from '../../utils/relationshipDegreeDisplay';

interface ConnectionDiscoveryPanelProps {
  pessoas: Pessoa[];
  connectionPersonOneId: string;
  connectionPersonTwoId: string;
  connectionIncludeInactiveSpouses: boolean;
  connectionLoading: boolean;
  connectionError: string | null;
  connectionResult: RelationshipDegreeResult | null;
  connectionMetricLabels: string[];
  connectionPathText: string;
  connectionRelationText: string;
  connectionWarnings: string[];
  onPersonOneChange: (value: string) => void;
  onPersonTwoChange: (value: string) => void;
  onIncludeInactiveSpousesChange: (value: boolean) => void;
  onDiscoverConnection: () => void;
}

export function ConnectionDiscoveryPanel({
  pessoas,
  connectionPersonOneId,
  connectionPersonTwoId,
  connectionIncludeInactiveSpouses,
  connectionLoading,
  connectionError,
  connectionResult,
  connectionMetricLabels,
  connectionPathText,
  connectionRelationText,
  connectionWarnings,
  onPersonOneChange,
  onPersonTwoChange,
  onIncludeInactiveSpousesChange,
  onDiscoverConnection,
}: ConnectionDiscoveryPanelProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Qual a minha conexão com alguém?</h2>
        <p className="mt-1 text-sm text-gray-600">
          Escolha duas pessoas da árvore para descobrir o parentesco e o caminho familiar entre elas.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
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
      </div>
      <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={connectionIncludeInactiveSpouses}
          onChange={(event) => onIncludeInactiveSpousesChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span>Incluir ex-cônjuges/separações no cálculo</span>
      </label>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onDiscoverConnection}
          disabled={!connectionPersonOneId || !connectionPersonTwoId || connectionLoading}
          className="w-full sm:w-auto"
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
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">
            {connectionResult.found ? connectionResult.label : 'Sem vínculo encontrado'}
          </p>
          <p className="mt-2">{getRelationshipResultMessage(connectionResult)}</p>
          <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-3">
            {connectionMetricLabels.map((metric) => (
              <span key={metric}>{metric}</span>
            ))}
          </div>
          {connectionPathText && (
            <p className="mt-3 text-xs text-gray-500">Caminho: {connectionPathText}</p>
          )}
          {connectionRelationText && (
            <p className="mt-1 text-xs text-gray-400">Relações: {connectionRelationText}</p>
          )}
          {connectionWarnings.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-amber-700">
              {connectionWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
