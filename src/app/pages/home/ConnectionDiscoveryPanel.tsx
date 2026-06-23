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

function getFirstName(value?: string | null) {
  const clean = value?.trim();
  if (!clean) return 'Pessoa';
  return clean.split(/\s+/)[0] || 'Pessoa';
}

function getFirstNameToken(value?: string | null) {
  return getFirstName(value).toLocaleLowerCase('pt-BR');
}

function getParentLabelByPersonName(value?: string | null) {
  const firstName = getFirstNameToken(value);
  const knownFemaleNames = new Set([
    'bianca',
    'condilênia',
    'condilenia',
    'ivania',
    'ivânia',
    'lourdes',
    'maria',
    'monika',
    'monica',
    'roseli',
    'rosely',
    'tathiane',
  ]);
  const knownMaleNames = new Set([
    'absalon',
    'athanase',
    'caio',
    'charalambos',
    'fabio',
    'fábio',
    'márcio',
    'marcio',
    'mauro',
    'tassius',
    'titus',
    'tulius',
    'yuri',
  ]);
  const likelyFemaleEndings = ['a', 'ia', 'na', 'ne', 'la', 'da', 'eli'];

  if (knownFemaleNames.has(firstName)) return 'mãe';
  if (knownMaleNames.has(firstName)) return 'pai';
  if (likelyFemaleEndings.some((ending) => firstName.endsWith(ending))) return 'mãe';
  return 'pai';
}

function getParentLabelFromRelationshipType(type?: string, parentName?: string | null) {
  if (type === 'mae') return 'mãe';
  if (type === 'pai') return 'pai';
  return getParentLabelByPersonName(parentName);
}

function getSiblingLabelByName(value?: string | null) {
  const firstName = getFirstName(value).toLocaleLowerCase('pt-BR');
  const knownFemaleNames = new Set(['bianca', 'condilênia', 'condilenia', 'ivania', 'ivânia', 'maria', 'tathiane']);
  const knownMaleNames = new Set(['absalon', 'athanase', 'charalambos', 'márcio', 'marcio', 'mauro', 'titus']);
  const likelyFemaleEndings = ['a', 'ia', 'na', 'ne', 'la', 'da', 'eli'];

  if (knownFemaleNames.has(firstName)) return 'irmã';
  if (knownMaleNames.has(firstName)) return 'irmão';
  return likelyFemaleEndings.some((ending) => firstName.endsWith(ending)) ? 'irmã' : 'irmão';
}

function getRelationshipPattern(result: RelationshipDegreeResult) {
  return result.path.map((step) => step.edge.normalizedType).join('>');
}

function buildUncleOrAuntNarrative(result: RelationshipDegreeResult, pessoas: Pessoa[]) {
  if (!result.found || getRelationshipPattern(result) !== 'child>sibling') return '';

  const origin = getPessoaById(pessoas, result.originPersonId);
  const target = getPessoaById(pessoas, result.targetPersonId);
  const parent = getPessoaById(pessoas, result.path[0]?.to);
  if (!origin || !target || !parent) return '';

  const targetFirstName = getFirstName(target.nome_completo);
  const parentFirstName = getFirstName(parent.nome_completo);
  const originFirstName = getFirstName(origin.nome_completo);
  const siblingLabel = getSiblingLabelByName(target.nome_completo);
  const parentLabel = getParentLabelFromRelationshipType(result.path[0]?.edge.type, parent.nome_completo);

  return `${targetFirstName} é ${siblingLabel} de ${parentFirstName}, ${parentLabel} de ${originFirstName}.`;
}

function shouldUseNarrativeSummary(summary: string, resultSentence: string) {
  if (!summary) return false;
  if (summary === resultSentence) return false;
  if (/sem classificação específica/i.test(summary)) return false;
  if (/^há um caminho familiar entre/i.test(summary)) return false;
  return true;
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
      <span className="max-w-[18rem] text-sm font-semibold leading-tight text-slate-900">{name}</span>
    </div>
  );
}

function ConnectionResultCard({ result, pessoas }: { result: RelationshipDegreeResult; pessoas: Pessoa[] }) {
  const origin = getPessoaById(pessoas, result.originPersonId);
  const target = getPessoaById(pessoas, result.targetPersonId);
  const resultSentence = getRelationshipResultSentence(result, pessoas);
  const narrative = getRelationshipNarrative(result, pessoas);
  const fallbackNarrative = buildUncleOrAuntNarrative(result, pessoas);
  const narrativeSummary = (fallbackNarrative || narrative.summary).trim();
  const shouldShowNarrative = shouldUseNarrativeSummary(narrativeSummary, resultSentence);

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
  const selectablePessoas = React.useMemo(
    () => pessoas.filter((pessoa) => pessoa.id?.trim() && pessoa.nome_completo?.trim()),
    [pessoas]
  );

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
            {selectablePessoas.map((pessoa) => (
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
            {selectablePessoas.map((pessoa) => (
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
