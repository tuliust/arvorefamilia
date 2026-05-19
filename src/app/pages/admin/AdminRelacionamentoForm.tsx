import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { adicionarRelacionamentoComInverso, obterTodasPessoas } from '../../services/dataService';
import { Pessoa, SubtipoRelacionamento, TipoRelacionamento } from '../../types';

const TIPOS_RELACIONAMENTO: Array<{ value: TipoRelacionamento; label: string }> = [
  { value: 'pai', label: 'Pai' },
  { value: 'mae', label: 'Mãe' },
  { value: 'filho', label: 'Filho(a)' },
  { value: 'conjuge', label: 'Cônjuge' },
  { value: 'irmao', label: 'Irmão/Irmã' },
];

const SUBTIPOS_RELACIONAMENTO: Array<{ value: SubtipoRelacionamento; label: string }> = [
  { value: 'sangue', label: 'Sangue' },
  { value: 'adotivo', label: 'Adotivo' },
  { value: 'uniao', label: 'União' },
  { value: 'casamento', label: 'Casamento' },
  { value: 'separado', label: 'Separado' },
];

const SUBTIPOS_FAMILIARES = SUBTIPOS_RELACIONAMENTO.filter((subtipo) =>
  subtipo.value === 'sangue' || subtipo.value === 'adotivo'
);

const SUBTIPOS_CONJUGAIS = SUBTIPOS_RELACIONAMENTO.filter((subtipo) =>
  subtipo.value === 'casamento' || subtipo.value === 'uniao' || subtipo.value === 'separado'
);

export function AdminRelacionamentoForm() {
  const navigate = useNavigate();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [pessoaOrigemId, setPessoaOrigemId] = useState('');
  const [pessoaDestinoId, setPessoaDestinoId] = useState('');
  const [tipoRelacionamento, setTipoRelacionamento] = useState<TipoRelacionamento>('pai');
  const [subtipoRelacionamento, setSubtipoRelacionamento] = useState<SubtipoRelacionamento>('sangue');
  const [ativo, setAtivo] = useState(true);
  const [dataSeparacao, setDataSeparacao] = useState('');
  const [localSeparacao, setLocalSeparacao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isConjugal = tipoRelacionamento === 'conjuge';

  useEffect(() => {
    async function loadPessoas() {
      try {
        setLoading(true);
        setError('');
        const data = await obterTodasPessoas();
        setPessoas(Array.isArray(data) ? data : []);
      } catch (loadError) {
        console.error('Erro ao carregar pessoas para relacionamento:', loadError);
        setError('Não foi possível carregar a lista de pessoas. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    loadPessoas();
  }, []);

  const pessoasOrdenadas = useMemo(
    () => [...pessoas].sort((a, b) => a.nome_completo.localeCompare(b.nome_completo, 'pt-BR')),
    [pessoas]
  );

  const handleTipoChange = (value: TipoRelacionamento) => {
    setTipoRelacionamento(value);
    setSubtipoRelacionamento(value === 'conjuge' ? 'casamento' : 'sangue');
    if (value !== 'conjuge') {
      setAtivo(true);
      setDataSeparacao('');
      setLocalSeparacao('');
      setObservacoes('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!pessoaOrigemId || !pessoaDestinoId) {
      setError('Selecione a pessoa de origem e a pessoa de destino.');
      return;
    }

    if (pessoaOrigemId === pessoaDestinoId) {
      setError('A pessoa de origem e a pessoa de destino precisam ser diferentes.');
      return;
    }

    try {
      setSaving(true);
      const relacionamento = await adicionarRelacionamentoComInverso({
        pessoa_origem_id: pessoaOrigemId,
        pessoa_destino_id: pessoaDestinoId,
        tipo_relacionamento: tipoRelacionamento,
        subtipo_relacionamento: subtipoRelacionamento,
        ativo: isConjugal ? ativo : true,
        data_separacao: isConjugal ? dataSeparacao || undefined : undefined,
        local_separacao: isConjugal ? localSeparacao.trim() || undefined : undefined,
        observacoes: isConjugal ? observacoes.trim() || undefined : undefined,
      });

      if (!relacionamento) {
        setError('Não foi possível salvar o relacionamento. Verifique se ele já existe ou tente novamente.');
        return;
      }

      navigate('/admin/relacionamentos');
    } catch (saveError) {
      console.error('Erro ao salvar relacionamento:', saveError);
      setError('Erro ao salvar relacionamento. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-3xl min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/admin/relacionamentos')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold text-gray-900">Novo Relacionamento</h1>
            <p className="break-words text-sm text-gray-500">Cadastre um vínculo entre duas pessoas</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="break-words">Dados do relacionamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="min-w-0 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="min-w-0 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Pessoa origem</label>
                  <Select value={pessoaOrigemId} onValueChange={setPessoaOrigemId} disabled={loading || saving}>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? 'Carregando...' : 'Selecione a origem'} />
                    </SelectTrigger>
                    <SelectContent>
                      {pessoasOrdenadas.map((pessoa) => (
                        <SelectItem key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Pessoa destino</label>
                  <Select value={pessoaDestinoId} onValueChange={setPessoaDestinoId} disabled={loading || saving}>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? 'Carregando...' : 'Selecione o destino'} />
                    </SelectTrigger>
                    <SelectContent>
                      {pessoasOrdenadas.map((pessoa) => (
                        <SelectItem key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo</label>
                  <Select
                    value={tipoRelacionamento}
                    onValueChange={(value) => handleTipoChange(value as TipoRelacionamento)}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_RELACIONAMENTO.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subtipo</label>
                  <Select
                    value={subtipoRelacionamento}
                    onValueChange={(value) => setSubtipoRelacionamento(value as SubtipoRelacionamento)}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(isConjugal ? SUBTIPOS_CONJUGAIS : SUBTIPOS_FAMILIARES).map((subtipo) => (
                        <SelectItem key={subtipo.value} value={subtipo.value}>
                          {subtipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isConjugal && (
                <div className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h2 className="mb-4 break-words text-sm font-semibold text-gray-900">Status conjugal</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="flex min-w-0 items-start gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={ativo}
                        onChange={(event) => setAtivo(event.target.checked)}
                        disabled={saving}
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />
                      <span className="min-w-0 break-words">Relacionamento ativo</span>
                    </label>

                    <div className="min-w-0 space-y-2">
                      <label className="text-sm font-medium text-gray-700">Data de separação</label>
                      <Input
                        type="date"
                        value={dataSeparacao}
                        onChange={(event) => setDataSeparacao(event.target.value)}
                        disabled={saving}
                      />
                    </div>

                    <div className="min-w-0 space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Local de separação</label>
                      <Input
                        value={localSeparacao}
                        onChange={(event) => setLocalSeparacao(event.target.value)}
                        placeholder="Cidade/UF"
                        disabled={saving}
                      />
                    </div>

                    <div className="min-w-0 space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Observações internas</label>
                      <Textarea
                        value={observacoes}
                        onChange={(event) => setObservacoes(event.target.value)}
                        placeholder="Opcional"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => navigate('/admin/relacionamentos')}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || saving || pessoasOrdenadas.length < 2} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4 shrink-0" />
                  {saving ? 'Salvando...' : 'Salvar relacionamento'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
