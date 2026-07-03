import React, { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { Pessoa, Relacionamento } from '../../types';
import { calculateRelationshipDegree, type RelationshipDegreeResult } from '../../utils/relationshipDegree';
import { getRelationshipResultSentence } from '../../utils/relationshipDegreeDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type RelationshipFinderProps = {
  pessoaBase: Pessoa;
  linkedPessoaId?: string | null;
  pessoas: Pessoa[];
  relacionamentos?: Relacionamento[];
  dataScopeNotice?: string;
};

function formatShortName(fullName?: string | null) {
  if (!fullName) return 'Pessoa';

  const cleanName = fullName.trim();
  if (!cleanName) return 'Pessoa';

  const parts = cleanName.split(/\s+/);
  if (parts.length <= 2) return cleanName;

  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function getPersonById(people: Pessoa[], personId?: string | null) {
  if (!personId) return undefined;
  return people.find((person) => person.id === personId);
}

function getPersonNameById(people: Pessoa[], personId?: string | null) {
  return getPersonById(people, personId)?.nome_completo?.trim() || 'Pessoa';
}

function getFirstNameToken(name: string) {
  return (name.trim().split(/\s+/)[0] || '').toLocaleLowerCase('pt-BR');
}

function inferFemaleByName(name: string) {
  const firstName = getFirstNameToken(name);
  const knownFemaleNames = new Set([
    'alexia',
    'bianca',
    'condilênia',
    'condilenia',
    'ivania',
    'ivânia',
    'lourdes',
    'monika',
    'monica',
    'roseli',
    'rosely',
    'tathiane',
    'thatiane',
  ]);
  const knownMaleNames = new Set([
    'absalon',
    'adalberto',
    'caio',
    'fabio',
    'fábio',
    'leonardo',
    'lorenzo',
    'marcio',
    'márcio',
    'tassius',
    'tulius',
    'yuri',
  ]);

  if (knownFemaleNames.has(firstName)) return true;
  if (knownMaleNames.has(firstName)) return false;

  return ['a', 'ia', 'na', 'ne', 'la', 'da', 'eli'].some((ending) => firstName.endsWith(ending));
}

function getCousinLabelForPerson(person?: Pessoa) {
  if (person?.genero === 'mulher') return 'prima';
  if (person?.genero === 'homem') return 'primo';

  return inferFemaleByName(person?.nome_completo ?? '') ? 'prima' : 'primo';
}

function getRelationshipPattern(result: RelationshipDegreeResult) {
  return result.path.map((step) => step.edge.normalizedType).join('>');
}

function replaceOriginWithVoce(sentence: string) {
  return sentence
    .replace(/^.+?(\s+e\s+)/, 'Você$1')
    .replace(/^.+?(\s+(?:é|foi)\s+)/, 'Você$1')
    .replace(/^.+?(\s+são\s+)/, 'Você$1');
}

function getSelfRelationshipSentence(result: RelationshipDegreeResult, people: Pessoa[]) {
  const pattern = getRelationshipPattern(result);

  if (pattern === 'spouse>child>sibling>parent' || pattern === 'child>sibling>parent>spouse') {
    const originPerson = getPersonById(people, result.originPersonId);
    const targetName = formatShortName(getPersonNameById(people, result.targetPersonId));
    const spouseStep = result.path.find((step) => step.edge.normalizedType === 'spouse');
    const spousePersonId = spouseStep?.from === result.targetPersonId ? spouseStep.to : spouseStep?.from;
    const spouseName = formatShortName(getPersonNameById(people, spousePersonId));
    const cousinLabel = getCousinLabelForPerson(originPerson);
    const spouseLabel = spouseStep?.edge.active ? 'cônjuge' : 'ex-cônjuge';

    return `Você é ${cousinLabel} de ${targetName}, ${spouseLabel} de ${spouseName}.`;
  }

  return replaceOriginWithVoce(getRelationshipResultSentence(result, people));
}

export function RelationshipFinder({
  pessoaBase,
  linkedPessoaId,
  pessoas,
  relacionamentos = [],
  dataScopeNotice,
}: RelationshipFinderProps) {
  const [selectedPersonId, setSelectedPersonId] = useState('');

  const pessoasDisponiveis = useMemo(
    () =>
      pessoas
        .filter((pessoa) => pessoa.id !== pessoaBase.id)
        .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo)),
    [pessoas, pessoaBase.id]
  );

  const resultado = useMemo(() => {
    if (!selectedPersonId) return null;

    return calculateRelationshipDegree({
      originPersonId: pessoaBase.id,
      targetPersonId: selectedPersonId,
      people: pessoas,
      relationships: relacionamentos,
    });
  }, [pessoaBase.id, pessoas, relacionamentos, selectedPersonId]);

  const nomeBaseCurto = pessoaBase.nome_completo.trim().split(/\s+/)[0] || 'esta pessoa';
  const pronoun = pessoaBase.genero === 'mulher' ? 'ela' : 'ele';
  const selfRelationshipResult = useMemo(() => {
    if (!linkedPessoaId) return null;

    return calculateRelationshipDegree({
      originPersonId: linkedPessoaId,
      targetPersonId: pessoaBase.id,
      people: pessoas,
      relationships: relacionamentos,
    });
  }, [linkedPessoaId, pessoaBase.id, pessoas, relacionamentos]);

  const selfRelationshipSentence = selfRelationshipResult
    ? getSelfRelationshipSentence(selfRelationshipResult, pessoas)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Seu parentesco com {pronoun}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="rounded-lg bg-white/80 p-3 text-sm text-gray-700">
            {selfRelationshipSentence ? (
              <p className="font-semibold text-gray-900">{selfRelationshipSentence}</p>
            ) : (
              <p>Não foi possível calcular seu parentesco com {nomeBaseCurto} agora.</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Veja qual a relação {pronoun === 'ela' ? 'dela' : 'dele'} com outra pessoa
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Select
                value={selectedPersonId}
                onValueChange={setSelectedPersonId}
                disabled={pessoasDisponiveis.length === 0}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione uma pessoa" />
                </SelectTrigger>
                <SelectContent>
                  {pessoasDisponiveis.map((pessoa) => (
                    <SelectItem key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {dataScopeNotice && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {dataScopeNotice}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-white/80 p-3 text-sm text-gray-700">
              {resultado ? (
                <p className="font-semibold text-gray-900">
                  {getRelationshipResultSentence(resultado, pessoas)}
                </p>
              ) : pessoasDisponiveis.length === 0 ? (
                'Dados insuficientes para comparar com outra pessoa.'
              ) : (
                'O resultado aparece aqui após a seleção.'
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
