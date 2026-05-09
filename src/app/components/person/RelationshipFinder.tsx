import React, { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { Pessoa, ResultadoParentesco } from '../../types';
import { descobrirParentesco } from '../../services/relationshipResolverService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function RelationshipFinder({
  pessoaBase,
  pessoas,
}: {
  pessoaBase: Pessoa;
  pessoas: Pessoa[];
}) {
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [resultado, setResultado] = useState<ResultadoParentesco | null>(null);
  const [loading, setLoading] = useState(false);

  const pessoasDisponiveis = useMemo(
    () =>
      pessoas
        .filter((pessoa) => pessoa.id !== pessoaBase.id)
        .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo)),
    [pessoas, pessoaBase.id]
  );

  async function handleSelect(personId: string) {
    setSelectedPersonId(personId);
    setResultado(null);

    if (!personId) return;

    try {
      setLoading(true);
      const result = await descobrirParentesco(pessoaBase.id, personId);
      setResultado(result);
    } catch (error) {
      console.error('Erro ao descobrir parentesco:', error);
      setResultado({
        pessoaOrigemId: pessoaBase.id,
        pessoaDestinoId: personId,
        encontrado: false,
        caminhoPessoas: [],
        caminhoRelacoes: [],
        distancia: 0,
        descricao: 'Não foi possível calcular o parentesco agora.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Descubra seu parentesco com...
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select value={selectedPersonId} onValueChange={handleSelect}>
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

            <div className="rounded-lg bg-white/80 p-3 text-sm text-gray-700">
              {loading ? (
                'Calculando parentesco...'
              ) : resultado ? (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">
                    {resultado.nome || 'Parentesco encontrado'}
                  </p>

                  {resultado.descricao && <p>{resultado.descricao}</p>}

                  {resultado.descricaoContextual && (
                    <p className="text-gray-600">{resultado.descricaoContextual}</p>
                  )}

                  {resultado.caminhoPessoas.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Caminho: {resultado.caminhoPessoas.map((p) => p.nome).join(' → ')}
                    </p>
                  )}

                  {resultado.caminhoRelacoes.length > 0 && (
                    <p className="text-xs text-gray-400">
                      Relações: {resultado.caminhoRelacoes.join(' → ')}
                    </p>
                  )}
                </div>
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
