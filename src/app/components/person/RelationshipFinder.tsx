import React, { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { Pessoa, Relacionamento } from '../../types';
import { calculateRelationshipDegree } from '../../utils/relationshipDegree';
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
    ? getRelationshipResultSentence(selfRelationshipResult, pessoas).replace(/^.+?(\s+(?:e|é|foi|são)\s+)/, (match) => match.replace(/^[^\s]+/, 'Você'))
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
