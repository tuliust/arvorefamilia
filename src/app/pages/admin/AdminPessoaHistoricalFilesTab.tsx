import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArquivosHistoricos } from '../../components/ArquivosHistoricos';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { listarArquivosHistoricosPorPessoa, substituirArquivosHistoricosDaPessoa } from '../../services/arquivosHistoricosService';
import { obterPessoaPorId, obterTodasPessoas } from '../../services/dataService';
import { ArquivoHistorico, Pessoa } from '../../types';

interface AdminPessoaHistoricalFilesTabProps {
  pessoaId: string;
}

export function AdminPessoaHistoricalFilesTab({ pessoaId }: AdminPessoaHistoricalFilesTabProps) {
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [arquivos, setArquivos] = useState<ArquivoHistorico[]>([]);
  const [participantOptions, setParticipantOptions] = useState<Array<Pick<Pessoa, 'id' | 'nome_completo'>>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [loadedPessoa, loadedArquivos, people] = await Promise.all([
          obterPessoaPorId(pessoaId),
          listarArquivosHistoricosPorPessoa(pessoaId),
          obterTodasPessoas(),
        ]);

        if (!mounted) return;

        setPessoa(loadedPessoa ?? null);
        setArquivos(loadedArquivos);
        setParticipantOptions(people.map((person) => ({
          id: person.id,
          nome_completo: person.nome_completo,
        })));
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar arquivos históricos.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, [pessoaId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const saved = await substituirArquivosHistoricosDaPessoa(pessoaId, arquivos);
      setArquivos(saved);
      toast.success('Arquivos históricos salvos.');
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Não foi possível salvar arquivos históricos.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando arquivos históricos...</p>;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!pessoa) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">Pessoa não encontrada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold text-gray-900">{pessoa.nome_completo}</p>
        <p className="mt-1 text-xs text-gray-500">
          Esta aba reaproveita o mesmo componente interativo de fatos e arquivos históricos usado na área autenticada.
        </p>
      </div>

      <ArquivosHistoricos
        arquivos={arquivos}
        onChange={setArquivos}
        pessoaId={pessoaId}
        variant="interactive"
        participantOptions={participantOptions}
        draftStorageKey={`admin-pessoa-arquivo-historico-tab:${pessoaId}`}
      />

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar arquivos históricos'}
        </Button>
      </div>
    </div>
  );
}
